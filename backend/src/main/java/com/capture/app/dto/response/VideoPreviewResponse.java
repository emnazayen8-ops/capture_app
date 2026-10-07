package com.capture.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoPreviewResponse {
    private Long menuId;
    private String videoBase64;
    private String contentType;
}
