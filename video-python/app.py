import base64
import logging
import os
import shutil
import tempfile
import uuid

from flask import Flask, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("video-service")

_magick_path = shutil.which("magick")
if _magick_path:
    from moviepy.config import change_settings

    change_settings({"IMAGEMAGICK_BINARY": _magick_path})
    logger.info("ImageMagick détecté : %s", _magick_path)
else:
    logger.warning(
        "ImageMagick ('magick') introuvable dans le PATH : les sous-titres "
        "incrustés seront désactivés (la narration audio fonctionnera quand "
        "même)."
    )

app = Flask(__name__)

# Durée (en secondes) d'une slide qui n'a pas de description (donc pas de
# narration TTS).
DEFAULT_SLIDE_DURATION = 3.0

# Langue de la voix de synthèse (TTS, gTTS).
TTS_LANGUAGE = "fr"

# Réglages du repère de clic clignotant (voir _build_click_marker_clip).
CLICK_MARKER_SIZE = 10
CLICK_MARKER_BLINK_ON = 0.35
CLICK_MARKER_BLINK_OFF = 0.35


def _decode_image_to_file(image_base64: str, dest_path: str) -> None:
    """Décode une image base64 (PNG) et l'écrit sur disque."""
    raw = base64.b64decode(image_base64)
    with open(dest_path, "wb") as f:
        f.write(raw)


def _generate_narration(text: str, dest_path: str) -> float:
    """
    Génère une voix de synthèse (TTS, via gTTS) qui lit le texte de la
    description. Renvoie la durée de l'audio généré, en secondes.
    """
    from gtts import gTTS
    from moviepy.editor import AudioFileClip

    tts = gTTS(text=text, lang=TTS_LANGUAGE)
    tts.save(dest_path)
    clip = AudioFileClip(dest_path)
    duration = clip.duration
    clip.close()
    return max(duration, 1.0)


def _build_caption_clip(caption_text: str, duration: float, width: int, height: int):
    """Sous-titre en bandeau semi-transparent en bas de l'image, ou None si pas de texte / ImageMagick indisponible."""
    if not caption_text:
        return None
    from moviepy.editor import TextClip

    try:
        return (
            TextClip(
                caption_text,
                fontsize=max(18, width // 40),
                color="white",
                bg_color="rgba(0,0,0,0.55)",
                method="caption",
                size=(int(width * 0.9), None),
                align="center",
            )
            .set_duration(duration)
            .set_position(("center", "bottom"))
        )
    except Exception as caption_error:  
        logger.warning(
            "Impossible d'incruster le sous-titre (ImageMagick manquant ?) : %s",
            caption_error,
        )
        return None


def _build_click_marker_clip(click_x: int, click_y: int, duration: float,
                              width: int, height: int, workdir: str):
  
    import math

    from PIL import Image, ImageDraw
    from moviepy.editor import ImageClip, VideoClip

    marker_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(marker_img)

    s = CLICK_MARKER_SIZE
    white = (255, 255, 255, 255)
    outline = (40, 40, 40, 200)

    # Petite flèche de curseur, pointe exactement sur (click_x, click_y).
    arrow = [
        (click_x, click_y),
        (click_x, click_y + s),
        (click_x + s * 0.35, click_y + s * 0.72),
        (click_x + s * 0.5, click_y + s * 1.0),
        (click_x + s * 0.68, click_y + s * 0.9),
        (click_x + s * 0.52, click_y + s * 0.6),
        (click_x + s * 0.85, click_y + s * 0.5),
    ]
    draw.polygon(arrow, fill=white, outline=outline)

    # Petits traits qui rayonnent autour de la pointe, façon icône "clic".
    center_x, center_y = click_x + s * 0.15, click_y - s * 0.1
    for angle_deg in (-70, -35, 0, 35, 70, 105):
        angle = math.radians(angle_deg)
        inner_r, outer_r = s * 0.85, s * 1.35
        x1 = center_x + inner_r * math.cos(angle)
        y1 = center_y - inner_r * math.sin(angle)
        x2 = center_x + outer_r * math.cos(angle)
        y2 = center_y - outer_r * math.sin(angle)
        draw.line([(x1, y1), (x2, y2)], fill=white, width=2)

    marker_path = os.path.join(workdir, f"{uuid.uuid4()}_click.png")
    marker_img.save(marker_path)

    marker_clip = ImageClip(marker_path, transparent=True).set_duration(duration)
    base_mask = marker_clip.mask 
    cycle = CLICK_MARKER_BLINK_ON + CLICK_MARKER_BLINK_OFF

    def blinking_mask_frame(t):
        visible = (t % cycle) < CLICK_MARKER_BLINK_ON
        frame = base_mask.get_frame(t)
        return frame if visible else frame * 0

    blinking_mask = VideoClip(blinking_mask_frame, ismask=True, duration=duration)
    return marker_clip.set_mask(blinking_mask)


def _build_slide_clip(image_path: str, audio_path: str | None, duration: float,
                       workdir: str, caption_text: str = "",
                       click_x: int | None = None, click_y: int | None = None):
    """Construit le clip complet d'une slide : image + narration TTS + sous-titre + repère de clic clignotant (optionnels)."""
    from moviepy.editor import AudioFileClip, CompositeVideoClip, ImageClip

    image_clip = ImageClip(image_path).set_duration(duration)
    if audio_path is not None:
        image_clip = image_clip.set_audio(AudioFileClip(audio_path))

    width, height = image_clip.size
    overlays = []

    caption_clip = _build_caption_clip(caption_text, duration, width, height)
    if caption_clip is not None:
        overlays.append(caption_clip)

    if click_x is not None and click_y is not None:
        try:
            overlays.append(
                _build_click_marker_clip(click_x, click_y, duration, width, height, workdir)
            )
        except Exception as marker_error:  # pragma: no cover
            logger.warning("Impossible d'incruster le repère de clic : %s", marker_error)

    if not overlays:
        return image_clip

    composite = CompositeVideoClip([image_clip, *overlays], size=(width, height))
    if audio_path is not None:
        composite = composite.set_audio(image_clip.audio)
    return composite


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/generate-video", methods=["POST"])
def generate_video():
    payload = request.get_json(silent=True) or {}
    captures = payload.get("captures") or []

    if not captures:
        return jsonify({"error": "Aucune capture fournie."}), 400

    from moviepy.editor import concatenate_videoclips

    with tempfile.TemporaryDirectory() as workdir:
        clips = []
        try:
            for index, capture in enumerate(captures):
                image_b64 = capture.get("imageBase64")
                description = (capture.get("description") or "").strip()
                click_x = capture.get("clickX")
                click_y = capture.get("clickY")

                if not image_b64:
                    continue

                image_path = os.path.join(workdir, f"slide_{index}.png")
                _decode_image_to_file(image_b64, image_path)

                audio_path = None
                duration = DEFAULT_SLIDE_DURATION

                if description:
                
                    audio_path = os.path.join(workdir, f"slide_{index}_tts.mp3")
                    try:
                        duration = _generate_narration(description, audio_path)
                    except Exception as tts_error:  # pragma: no cover
                        logger.warning(
                            "Echec de la synthèse vocale pour la slide %s : %s",
                            index,
                            tts_error,
                        )
                        audio_path = None
                        duration = DEFAULT_SLIDE_DURATION

                clips.append(
                    _build_slide_clip(
                        image_path, audio_path, duration, workdir,
                        caption_text=description, click_x=click_x, click_y=click_y,
                    )
                )

            if not clips:
                return jsonify({"error": "Aucune image exploitable dans les captures."}), 400

            final_clip = concatenate_videoclips(clips, method="compose")
            output_path = os.path.join(workdir, f"{uuid.uuid4()}.mp4")
            final_clip.write_videofile(
                output_path,
                fps=24,
                codec="libx264",
                audio_codec="aac",
                logger=None,
            )

            with open(output_path, "rb") as f:
                video_bytes = f.read()

            return jsonify({
                "videoBase64": base64.b64encode(video_bytes).decode("utf-8"),
                "contentType": "video/mp4",
            })
        except Exception as exc:
            logger.exception("Erreur pendant la génération de la vidéo")
            return jsonify({"error": f"Erreur de génération vidéo : {exc}"}), 500
        finally:
            for clip in clips:
                try:
                    clip.close()
                except Exception:
                    pass


if __name__ == "__main__":
    # Port 5001 par défaut, cohérent avec video.service.url dans
    # application.properties du backend Java.
    app.run(host="0.0.0.0", port=5001)
