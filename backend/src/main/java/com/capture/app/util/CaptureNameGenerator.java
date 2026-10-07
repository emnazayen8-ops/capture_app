package com.capture.app.util;

import com.capture.app.repository.CaptureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CaptureNameGenerator {

    private final CaptureRepository captureRepository;

    
    public String generateName(Long menuId) {
        Integer max = captureRepository.findMaxCaptureNumber(menuId);
        int nextNumber = (max == null ? 0 : max) + 1;
        return "Capture " + nextNumber;
    }
}