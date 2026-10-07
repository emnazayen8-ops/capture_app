package com.capture.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaptureResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime dateCreate;
    private Long menuId;
    private String menuName;
    private String imageBase64;
}