package com.capture.app.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkDeleteRequest {

    @NotEmpty(message = "La liste des IDs à supprimer ne peut pas être vide")
    private List<Long> ids;
}
