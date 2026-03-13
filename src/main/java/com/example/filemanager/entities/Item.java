package com.example.filemanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.*;

/**
 * @author hp
 **/

@Data
@Entity
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private ItemType type;

    private Long size;

    private String filePath;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime modifiedAt;

    /*
     * Parent Folder Reference
     */
    @ManyToOne
    @JoinColumn(name = "parent_id" )
    @JsonIgnore
    private Item parent;

    /*
     * Children (subfolders/files)
     */
    @OneToMany(mappedBy = "parent" , cascade = CascadeType.ALL , fetch = FetchType.LAZY)
    private List<Item> children;

    /*
     * Leads attached to this item
     */
    @OneToMany(mappedBy = "item" , cascade = CascadeType.ALL , fetch = FetchType.LAZY)
    private List<Lead> leads;


}
