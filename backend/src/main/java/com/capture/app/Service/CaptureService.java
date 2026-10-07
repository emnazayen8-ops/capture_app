package com.capture.app.Service;

import com.capture.app.dto.request.CaptureRequest;
import com.capture.app.dto.request.ImageActionRequest;
import com.capture.app.dto.response.CaptureResponse;
import com.capture.app.dto.response.NavigationResponse;
import com.capture.app.entity.Capture;
import com.capture.app.entity.Menu;
import com.capture.app.entity.User;
import com.capture.app.repository.CaptureRepository;
import com.capture.app.repository.MenuRepository;
import com.capture.app.util.CaptureNameGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaptureService {

    private final CaptureRepository captureRepository;
    private final MenuRepository menuRepository;
    private final CaptureNameGenerator captureNameGenerator;
    private final CaptureActionService captureActionService;

    @Transactional
    public CaptureResponse createCapture(CaptureRequest request, User user) throws IOException {
        Menu menu = menuRepository.findById(request.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu non trouvé"));

        MultipartFile file = request.getImage();
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("L'image est obligatoire");
        }

        Capture capture = new Capture();
        capture.setUserCreate(user);
        capture.setMenu(menu);
        capture.setName(captureNameGenerator.generateName(menu.getId()));
        byte[] imageBytes = file.getBytes();
        capture.setImageData(imageBytes);
        capture.setOriginalImageData(imageBytes);
        capture.setDescription(request.getDescription());
        Long existingCount = captureRepository.countByMenuId(menu.getId());
        capture.setSortOrder(existingCount != null ? existingCount.intValue() : 0);

        Capture saved = captureRepository.save(capture);
        return mapToResponse(saved);
    }


    private List<Capture> loadOrdered(Long menuId) {
        return captureRepository.findByMenuIdOrderedBySortOrder(menuId);
    }

    /** Flèches ← → sur chaque capture (image 1) : échange sa position avec sa voisine. */
    @Transactional
    public List<CaptureResponse> moveCapture(Long id, String direction) {
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));
        Long menuId = capture.getMenu().getId();
        List<Capture> ordered = loadOrdered(menuId);

        int index = -1;
        for (int i = 0; i < ordered.size(); i++) {
            if (ordered.get(i).getId().equals(id)) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            throw new RuntimeException("Capture non trouvée dans ce menu");
        }

        int swapIndex = "left".equals(direction) ? index - 1 : index + 1;
        if (swapIndex >= 0 && swapIndex < ordered.size()) {
            Capture current = ordered.get(index);
            Capture other = ordered.get(swapIndex);
            Integer tmp = current.getSortOrder();
            current.setSortOrder(other.getSortOrder());
            other.setSortOrder(tmp);
            captureRepository.save(current);
            captureRepository.save(other);
        }
        return loadOrdered(menuId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CaptureResponse> getCapturesByMenu(Long menuId) {
        List<Capture> captures = loadOrdered(menuId);
        return captures.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CaptureResponse getCaptureById(Long id) {
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));
        return mapToResponse(capture);
    }

    @Transactional(readOnly = true)
    public NavigationResponse getNavigation(Long menuId, Long currentCaptureId) {
        List<Capture> captures = loadOrdered(menuId);

        Capture current = null;
        Capture previous = null;
        Capture next = null;
        int currentPosition = -1;

        for (int i = 0; i < captures.size(); i++) {
            if (captures.get(i).getId().equals(currentCaptureId)) {
                current = captures.get(i);
                currentPosition = i + 1;
                if (i > 0) {
                    previous = captures.get(i - 1);
                }
                if (i < captures.size() - 1) {
                    next = captures.get(i + 1);
                }
                break;
            }
        }

        if (current == null) {
            throw new RuntimeException("Capture non trouvée dans ce menu");
        }

        return NavigationResponse.builder()
                .current(mapToResponse(current))
                .previous(previous != null ? mapToResponse(previous) : null)
                .next(next != null ? mapToResponse(next) : null)
                .hasPrevious(previous != null)
                .hasNext(next != null)
                .currentPosition(currentPosition)
                .totalCaptures(captures.size())
                .build();
    }

    @Transactional
    public CaptureResponse updateCapture(Long id, String name, String description) {
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));

        if (name != null && !name.isBlank()) {
            capture.setName(name);
        }
        if (description != null) {
            capture.setDescription(description);
        }
        Capture updated = captureRepository.save(capture);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCapture(Long id) {
        if (!captureRepository.existsById(id)) {
            throw new RuntimeException("Capture non trouvée");
        }
        captureRepository.deleteById(id);
    }

    @Transactional
    public void deleteCaptures(List<Long> ids) {
        List<Capture> found = captureRepository.findByIdIn(ids);
        if (found.size() != ids.size()) {
            throw new RuntimeException("Certaines captures sélectionnées n'existent pas");
        }
        captureRepository.deleteByIdIn(ids);
    }

    @Transactional(readOnly = true)
    public Capture getCaptureEntityForDownload(Long id) {
        return captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));
    }


    @Transactional(readOnly = true)
    public String previewAction(Long id, ImageActionRequest request) throws IOException {
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));

        byte[] original = (request.getBaseImageBase64() != null && !request.getBaseImageBase64().isBlank())
                ? Base64.getDecoder().decode(request.getBaseImageBase64())
                : capture.getImageData();
        byte[] result;

        switch (request.getType()) {
            case "blur" -> result = captureActionService.applyBlur(
                    original, request.getX(), request.getY(), request.getWidth(), request.getHeight());
            case "cursor" -> result = captureActionService.applyCursor(
                    original, request.getX(), request.getY(), "black");
            case "cursorWhite" -> result = captureActionService.applyCursor(
                    original, request.getX(), request.getY(), "white");
            case "cursorClick" -> result = captureActionService.applyCursorClick(
                    original, request.getX(), request.getY());
            case "focus" -> result = captureActionService.applyFocus(
                    original, request.getX(), request.getY(), request.getWidth(), request.getHeight());
            case "rectangle" -> result = captureActionService.applyRectangle(
                    original, request.getX(), request.getY(), request.getWidth(), request.getHeight());
            default -> throw new RuntimeException("Type d'action inconnu : " + request.getType());
        }

        return Base64.getEncoder().encodeToString(result);
    }

    @Transactional
    public String getOriginalImageBase64(Long id) {
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));
        if (capture.getOriginalImageData() == null) {
            capture.setOriginalImageData(capture.getImageData());
            captureRepository.save(capture);
        }
        return Base64.getEncoder().encodeToString(capture.getOriginalImageData());
    }

    @Transactional
    public CaptureResponse saveEditedImage(Long id, String imageBase64, Integer clickX, Integer clickY) {
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));

        capture.setImageData(Base64.getDecoder().decode(imageBase64));
        capture.setClickX(clickX);
        capture.setClickY(clickY);
        Capture updated = captureRepository.save(capture);
        return mapToResponse(updated);
    }

    @Transactional
    public CaptureResponse replaceImage(Long id, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Le nouveau fichier image est obligatoire");
        }
        Capture capture = captureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Capture non trouvée"));

        byte[] imageBytes = file.getBytes();
        capture.setImageData(imageBytes);
        capture.setOriginalImageData(imageBytes);
        capture.setClickX(null);
        capture.setClickY(null);
        Capture updated = captureRepository.save(capture);
        return mapToResponse(updated);
    }

    private CaptureResponse mapToResponse(Capture capture) {
        return CaptureResponse.builder()
                .id(capture.getId())
                .name(capture.getName())
                .description(capture.getDescription())
                .dateCreate(capture.getDateCreate())
                .menuId(capture.getMenu().getId())
                .menuName(capture.getMenu().getName())
                .imageBase64(capture.getImageData() != null ?
                        Base64.getEncoder().encodeToString(capture.getImageData()) : null)
                .build();
    }
}