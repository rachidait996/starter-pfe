package com.example.filemanager.controllers;

import com.example.filemanager.entities.Item;
import com.example.filemanager.entities.ItemType;
import com.example.filemanager.repositories.ItemRepo;
import com.example.filemanager.services.FileStorageService;
import com.example.filemanager.services.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author hp
 **/
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200") // Adjust the origin as needed
public class ItemController {

    private final ItemService itemService;
    private final FileStorageService fileStorageService;
    private final ItemRepo itemRepository;


    @GetMapping("/folders/{folderId}")
    public ResponseEntity<Map<String, Object>> getItemsByFolder(@PathVariable Long folderId) {

        // Get all items in the folder
        List<Item> items ;
        if (folderId == 0) {
            // Root level items
            items = itemRepository.findByParentIsNull();
            log.debug("Root level items: " + items.size());
        } else {
            items = itemRepository.findByParent_Id(folderId);
        }

        // Separate folders and files
        List<Item> folders = items.stream()
                .filter(i -> i.getType() == ItemType.FOLDER)
                .sorted(Comparator.comparing(Item::getName))
                .collect(Collectors.toList());

        List<Item> files = items.stream()
                .filter(i -> i.getType() != ItemType.FOLDER)
                .sorted(Comparator.comparing(Item::getName))
                .collect(Collectors.toList());

        // Build breadcrumb path
        List<Item> path = folderId == 0
                ? new ArrayList<>()
                : fileStorageService.buildPath(folderId);
        // Return as a single response
        Map<String, Object> response = new HashMap<>();
        response.put("folders", folders);
        response.put("files", files);
        response.put("path", path);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/folder")
    public Item createFolder(@RequestParam String name,
                             @RequestParam(required = false) Long parentId) {

        return itemService.createFolder(name, parentId);
    }

    @PostMapping("/upload")
    public Item uploadFile(@RequestParam MultipartFile file,
                           @RequestParam(required = false) Long parentId) throws Exception {

        return fileStorageService.uploadFile(file, parentId);
    }
}