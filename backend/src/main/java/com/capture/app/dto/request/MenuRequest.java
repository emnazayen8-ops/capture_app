package com.capture.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MenuRequest {

    @NotNull(message = "L'ID du module est obligatoire")
    private Long moduleId;

    @NotBlank(message = "Le nom du menu est obligatoire")
    private String name;

    private Long parentId;
}