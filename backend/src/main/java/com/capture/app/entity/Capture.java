package com.capture.app.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "captures")
@Data
public class Capture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_create", nullable = false)
    private User userCreate;

    @Column(name = "date_create")
    private LocalDateTime dateCreate;

    @PrePersist
    protected void onCreate() {
        dateCreate = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @Column(nullable = false, length = 255)
    private String name;

    @Lob
    @Column(name = "image_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] imageData;

    @Lob
    @Column(name = "original_image_data", columnDefinition = "LONGBLOB")
    private byte[] originalImageData;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "click_x")
    private Integer clickX;

    @Column(name = "click_y")
    private Integer clickY;
}