package com.capture.app.Service;

import com.capture.app.dto.request.MenuRequest;
import com.capture.app.dto.response.MenuResponse;
import com.capture.app.entity.Menu;
import com.capture.app.entity.Module;
import com.capture.app.entity.User;
import com.capture.app.entity.Video;
import com.capture.app.repository.CaptureRepository;
import com.capture.app.repository.MenuRepository;
import com.capture.app.repository.ModuleRepository;
import com.capture.app.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final ModuleRepository moduleRepository;
    private final VideoRepository videoRepository;
    private final CaptureRepository captureRepository;

    @Transactional
    public MenuResponse createMenu(MenuRequest request, User user) {
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module non trouvé"));

        Menu menu = new Menu();
        menu.setModule(module);
        menu.setUserCreate(user);
        menu.setName(request.getName());

        if (request.getParentId() != null) {
            Menu parent = menuRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Menu parent non trouvé"));

            if (parent.getParent() != null) {
                throw new RuntimeException(
                        "Un sous-menu ne peut pas avoir de sous-menu (profondeur maximale atteinte).");
            }

            menu.setParent(parent);
        }

        Menu saved = menuRepository.save(menu);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MenuResponse> getMenusByModule(Long moduleId) {
        List<Menu> menus = menuRepository.findRootMenusByModuleId(moduleId);
        return menus.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuResponse> getSubMenus(Long parentId) {
        List<Menu> menus = menuRepository.findByParentId(parentId);
        return menus.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuResponse getMenuById(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));
        return mapToResponse(menu);
    }

    @Transactional
    public MenuResponse updateMenu(Long id, MenuRequest request) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));

        menu.setName(request.getName());

        Menu updated = menuRepository.save(menu);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));

        if (menuRepository.existsByParentId(id)) {
            throw new RuntimeException(
                    "Impossible de supprimer : ce menu a des sous-menus. Supprimez-les d'abord.");
        }
        if (captureRepository.countByMenuId(id) > 0) {
            throw new RuntimeException(
                    "Impossible de supprimer : ce menu contient des captures. Supprimez-les d'abord.");
        }
        videoRepository.findByMenuId(id).ifPresent(videoRepository::delete);

        menuRepository.deleteById(id);
    }

    private MenuResponse mapToResponse(Menu menu) {
        Boolean hasVideo = videoRepository.hasVideo(menu.getId());
        Boolean videoValidated = false;

        if (Boolean.TRUE.equals(hasVideo)) {
            Video video = videoRepository.findByMenuId(menu.getId()).orElse(null);
            if (video != null) {
                videoValidated = video.getIsValidated();
            }
        }

        MenuResponse response = MenuResponse.builder()
                .id(menu.getId())
                .name(menu.getName())
                .parentId(menu.getParent() != null ? menu.getParent().getId() : null)
                .moduleId(menu.getModule().getId())
                .dateCreate(menu.getDateCreate())
                .hasVideo(hasVideo)
                .videoValidated(videoValidated)
                .canHaveChildren(menu.getParent() == null)
                .hasChildren(menuRepository.existsByParentId(menu.getId()))
                .build();

        return response;
    }
}