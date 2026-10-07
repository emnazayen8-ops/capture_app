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
public class VideoResponse {

    private Long id;
    private Long menuId;
    private String videoName;
    private Boolean isValidated;
    private Boolean exists;
    private Boolean hasData;
}