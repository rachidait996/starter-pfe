package com.example.filemanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Ville ville;

    @Enumerated(EnumType.STRING)
    private LeadSource source;

    private String jobTitle;

    private String assignedTo;

    private Long assignedToId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Boolean phoneVerified;

    private Boolean emailVerified;

    private Boolean isDuplicate;

    private Long duplicateOf;

    @ManyToOne
    @JoinColumn(name = "item_id")
    @JsonIgnore
    private Item item;
}