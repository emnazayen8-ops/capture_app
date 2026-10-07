package com.capture.app.controller;

import com.capture.app.entity.Module;
import com.capture.app.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ModuleController {

    private final ModuleRepository moduleRepository;

    @GetMapping
    public ResponseEntity<List<Module>> getAllModules() {
        return ResponseEntity.ok(moduleRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module non trouvé"));
        return ResponseEntity.ok(module);
    }
}