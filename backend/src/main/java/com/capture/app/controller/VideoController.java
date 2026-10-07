package com.capture.app.controller;

import com.capture.app.dto.request.VideoValidationRequest;
import com.capture.app.dto.response.VideoPreviewResponse;
import com.capture.app.dto.response.VideoResponse;
import com.capture.app.entity.User;
import com.capture.app.entity.Video;
import com.capture.app.Service.UserService;
import com.capture.app.Service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VideoController {

    private final VideoService videoService;
    private final UserService userService;

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<VideoResponse> getVideoByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(videoService.getVideoByMenu(menuId));
    }

    @PostMapping("/generate/{menuId}")
    public ResponseEntity<VideoPreviewResponse> generateVideo(
            @PathVariable Long menuId,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(videoService.generateVideo(menuId, user));
    }

    @PostMapping("/menu/{menuId}/save-preview")
    public ResponseEntity<VideoResponse> savePreview(
            @PathVariable Long menuId,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(videoService.savePreview(menuId, user));
    }

    @PostMapping("/validate")
    public ResponseEntity<VideoResponse> validateVideo(
            @Valid @RequestBody VideoValidationRequest request,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(videoService.validateVideo(request, user));
    }

    @DeleteMapping("/menu/{menuId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long menuId) {
        videoService.deleteVideo(menuId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/menu/{menuId}/download")
    public ResponseEntity<byte[]> downloadVideo(@PathVariable Long menuId) {
        Video video = videoService.getVideoEntityForDownload(menuId);
        String filename = video.getVideoName() != null ? video.getVideoName() : "video.mp4";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(video.getContentType() != null
                        ? MediaType.parseMediaType(video.getContentType())
                        : MediaType.valueOf("video/mp4"))
                .body(video.getVideoData());
    }
}