package com.capture.app.controller;

import com.capture.app.dto.request.BulkDeleteRequest;
import com.capture.app.dto.request.CaptureRequest;
import com.capture.app.dto.request.ImageActionRequest;
import com.capture.app.dto.request.SaveImageRequest;
import com.capture.app.dto.request.UpdateCaptureRequest;
import com.capture.app.dto.response.CaptureResponse;
import com.capture.app.dto.response.NavigationResponse;
import com.capture.app.entity.Capture;
import com.capture.app.entity.User;
import com.capture.app.Service.CaptureService;
import com.capture.app.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/captures")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaptureController {

    private final CaptureService captureService;
    private final UserService userService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<CaptureResponse> createCapture(
            @RequestParam("menuId") Long menuId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) throws IOException {

        User user = userService.getCurrentUser(authentication.getName());

        CaptureRequest request = new CaptureRequest();
        request.setMenuId(menuId);
        request.setImage(image);
        request.setDescription(description);

        return ResponseEntity.ok(captureService.createCapture(request, user));
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<List<CaptureResponse>> getCapturesByMenu(@PathVariable Long menuId) {
        return ResponseEntity.ok(captureService.getCapturesByMenu(menuId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaptureResponse> getCaptureById(@PathVariable Long id) {
        return ResponseEntity.ok(captureService.getCaptureById(id));
    }

    @GetMapping("/{id}/navigation")
    public ResponseEntity<NavigationResponse> getNavigation(
            @PathVariable Long id,
            @RequestParam("menuId") Long menuId) {
        return ResponseEntity.ok(captureService.getNavigation(menuId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaptureResponse> updateCapture(
            @PathVariable Long id,
            @RequestBody UpdateCaptureRequest request) {
        return ResponseEntity.ok(captureService.updateCapture(id, request.getName(), request.getDescription()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCapture(@PathVariable Long id) {
        captureService.deleteCapture(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteCaptures(@Valid @RequestBody BulkDeleteRequest request) {
        captureService.deleteCaptures(request.getIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadCapture(@PathVariable Long id) {
        Capture capture = captureService.getCaptureEntityForDownload(id);

        String filename = capture.getName().replaceAll("[^a-zA-Z0-9_-]", "_") + ".png";
        ContentDisposition disposition = ContentDisposition.attachment().filename(filename).build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.IMAGE_PNG)
                .body(capture.getImageData());
    }


    @PostMapping("/{id}/actions")
    public ResponseEntity<Map<String, String>> applyAction(
            @PathVariable Long id,
            @Valid @RequestBody ImageActionRequest request) throws IOException {
        String preview = captureService.previewAction(id, request);
        return ResponseEntity.ok(Map.of("imageBase64", preview));
    }

    @GetMapping("/{id}/original")
    public ResponseEntity<Map<String, String>> getOriginalImage(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("imageBase64", captureService.getOriginalImageBase64(id)));
    }

    @PutMapping("/{id}/save-image")
    public ResponseEntity<CaptureResponse> saveImage(
            @PathVariable Long id,
            @Valid @RequestBody SaveImageRequest request) {
        return ResponseEntity.ok(captureService.saveEditedImage(
                id, request.getImageBase64(), request.getClickX(), request.getClickY()));
    }

    @PutMapping(value = "/{id}/replace-image", consumes = "multipart/form-data")
    public ResponseEntity<CaptureResponse> replaceImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) throws IOException {
        return ResponseEntity.ok(captureService.replaceImage(id, image));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<List<CaptureResponse>> moveCapture(
            @PathVariable Long id,
            @RequestParam String direction) {
        return ResponseEntity.ok(captureService.moveCapture(id, direction));
    }
}
