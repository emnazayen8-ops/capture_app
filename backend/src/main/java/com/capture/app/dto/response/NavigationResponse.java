package com.capture.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavigationResponse {

    private CaptureResponse current;
    private CaptureResponse previous;
    private CaptureResponse next;
    private Boolean hasPrevious;
    private Boolean hasNext;
    private Integer currentPosition;
    private Integer totalCaptures;
}