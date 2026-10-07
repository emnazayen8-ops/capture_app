package com.capture.app.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "menus")
@Data
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_create", nullable = false)
    private User userCreate;

    @Column(name = "date_create")
    private LocalDateTime dateCreate;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Menu parent;

    
    @PrePersist
    protected void onCreate() {
        dateCreate = LocalDateTime.now();
    }
}