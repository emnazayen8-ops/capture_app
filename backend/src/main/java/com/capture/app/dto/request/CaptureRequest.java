package com.capture.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CaptureRequest {

    @NotNull(message = "L'ID du menu est obligatoire")
    private Long menuId;

    private MultipartFile image;

    private String description;
}