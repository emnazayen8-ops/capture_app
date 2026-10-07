package com.capture.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "modules", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@Data
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
}