package com.capture.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class ImageActionRequest {

    @NotNull(message = "Le type d'action est obligatoire")
    private String type;

    private int x;
    private int y;
    private int width;
    private int height;
    private String baseImageBase64;
}
