package com.capture.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuResponse {

    private Long id;
    private String name;
    private Long parentId;
    private Long moduleId;
    private LocalDateTime dateCreate;
    private Boolean hasVideo;
    private Boolean videoValidated;
    private Boolean canHaveChildren;
    private Boolean hasChildren;
    private List<MenuResponse> children;
}