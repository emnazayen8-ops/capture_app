package com.capture.app.Service;

import com.capture.app.dto.request.VideoValidationRequest;
import com.capture.app.dto.response.VideoPreviewResponse;
import com.capture.app.dto.response.VideoResponse;
import com.capture.app.entity.Capture;
import com.capture.app.entity.Menu;
import com.capture.app.entity.User;
import com.capture.app.entity.Video;
import com.capture.app.repository.CaptureRepository;
import com.capture.app.repository.MenuRepository;
import com.capture.app.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final MenuRepository menuRepository;
    private final CaptureRepository captureRepository;
    private final RestTemplate videoServiceRestTemplate;

    @Value("${video.service.url}")
    private String videoServiceUrl;
    private final Map<Long, VideoGenerationResult> pendingPreviews = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public VideoResponse getVideoByMenu(Long menuId) {
        Optional<Video> videoOpt = videoRepository.findByMenuId(menuId);

        if (videoOpt.isPresent()) {
            Video video = videoOpt.get();
            return mapToResponse(video);
        }

        return VideoResponse.builder()
                .exists(false)
                .menuId(menuId)
                .build();
    }

    @Transactional(readOnly = true)
    public VideoPreviewResponse generateVideo(Long menuId, User user) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));

        List<Capture> captures = captureRepository.findByMenuIdOrderedBySortOrder(menuId);
        if (captures.isEmpty()) {
            throw new RuntimeException("Aucune capture trouvée pour ce menu");
        }

        if (videoRepository.findByMenuId(menuId).isPresent()) {
            throw new RuntimeException(
                    "Une vidéo existe déjà pour ce menu. Dévalidez-la (elle sera supprimée) avant d'en générer une nouvelle.");
        }

        VideoGenerationResult generated = callVideoService(captures);
        pendingPreviews.put(menuId, generated);

        return VideoPreviewResponse.builder()
                .menuId(menuId)
                .videoBase64(Base64.getEncoder().encodeToString(generated.videoBytes()))
                .contentType(generated.contentType())
                .build();
    }

    @Transactional
    public VideoResponse savePreview(Long menuId, User user) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));

        VideoGenerationResult generated = pendingPreviews.remove(menuId);
        if (generated == null) {
            throw new RuntimeException(
                    "Aucun aperçu à sauvegarder pour ce menu. Régénérez la vidéo d'abord.");
        }

        Video video = new Video();
        video.setMenu(menu);
        video.setVideoName("video_" + menuId + "_" + System.currentTimeMillis() + ".mp4");
        video.setVideoData(generated.videoBytes());
        video.setContentType(generated.contentType());
        video.setIsValidated(true);

        Video saved = videoRepository.save(video);
        return mapToResponse(saved);
    }

    @SuppressWarnings("unchecked")
    private VideoGenerationResult callVideoService(List<Capture> captures) {
        List<Map<String, Object>> slides = new ArrayList<>();
        for (Capture capture : captures) {
            Map<String, Object> slide = new HashMap<>();
            slide.put("imageBase64", Base64.getEncoder().encodeToString(capture.getImageData()));
            slide.put("description", capture.getDescription() != null ? capture.getDescription() : "");
            if (capture.getClickX() != null && capture.getClickY() != null) {
                slide.put("clickX", capture.getClickX());
                slide.put("clickY", capture.getClickY());
            }
            slides.add(slide);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("captures", slides);

        try {
            Map<String, Object> response = videoServiceRestTemplate.postForObject(
                    videoServiceUrl + "/api/generate-video", payload, Map.class);

            if (response == null || response.get("videoBase64") == null) {
                throw new RuntimeException("Réponse invalide du service de génération de vidéo");
            }

            byte[] videoBytes = Base64.getDecoder().decode((String) response.get("videoBase64"));
            String contentType = response.get("contentType") != null
                    ? (String) response.get("contentType")
                    : "video/mp4";

            return new VideoGenerationResult(videoBytes, contentType);
        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Le service de génération de vidéo (Python) est indisponible. "
                            + "Vérifiez qu'il est démarré sur " + videoServiceUrl + ".", e);
        }
    }

    private record VideoGenerationResult(byte[] videoBytes, String contentType) {
    }

    @Transactional(readOnly = true)
    public Video getVideoEntityForDownload(Long menuId) {
        Video video = videoRepository.findByMenuId(menuId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée pour ce menu"));
        if (video.getVideoData() == null) {
            throw new RuntimeException("Cette vidéo n'a pas encore été générée");
        }
        return video;
    }

    @Transactional
    public VideoResponse validateVideo(VideoValidationRequest request, User user) {
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));

        Video video = videoRepository.findByMenuId(menu.getId())
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée pour ce menu"));

        video.setIsValidated(request.getIsValidated());

        Video saved = videoRepository.save(video);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteVideo(Long menuId) {
        Video video = videoRepository.findByMenuId(menuId)
                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
        videoRepository.delete(video);
        pendingPreviews.remove(menuId);
    }

    private VideoResponse mapToResponse(Video video) {
        return VideoResponse.builder()
                .id(video.getId())
                .menuId(video.getMenu().getId())
                .videoName(video.getVideoName())
                .isValidated(video.getIsValidated())
                .exists(true)
                .hasData(video.getVideoData() != null)
                .build();
    }
}