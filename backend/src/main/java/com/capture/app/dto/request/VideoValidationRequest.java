package com.capture.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VideoValidationRequest {

    @NotNull(message = "L'ID du menu est obligatoire")
    private Long menuId;

    @NotNull(message = "L'état de validation est obligatoire")
    private Boolean isValidated;
}