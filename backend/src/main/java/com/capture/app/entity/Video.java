package com.capture.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "videos")
@Data
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false, unique = true)
    private Menu menu;

    @Lob
    @Column(name = "video_data", columnDefinition = "LONGBLOB")
    private byte[] videoData;

    @Column(name = "video_name", length = 255)
    private String videoName;

    @Column(name = "is_validated")
    private Boolean isValidated = false;

    @Column(name = "content_type", length = 100)
    private String contentType;
}