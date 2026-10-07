package com.capture.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class SaveImageRequest {

    @NotBlank(message = "L'image (base64) est obligatoire")
    private String imageBase64;
    private Integer clickX;
    private Integer clickY;
}
