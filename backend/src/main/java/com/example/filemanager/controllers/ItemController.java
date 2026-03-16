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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        log.info("Request to delete item with id: {}", id);

        // On récupère l'item pour savoir si c'est un fichier ou un dossier
        return itemRepository.findById(id)
                .map(item -> {
                    // Si c'est un fichier (pas un dossier), on peut appeler une méthode
                    // de fileStorageService pour supprimer le fichier physique si nécessaire
                    if (item.getType() != ItemType.FOLDER) {
                        // fileStorageService.deletePhysicalFile(item.getName()); // Optionnel
                    }

                    // Suppression en base de données
                    // Note : Si c'est un dossier, assurez-vous que votre entité Item
                    // a CascadeType.ALL sur la relation parent/children
                    itemRepository.delete(item);

                    log.info("Item deleted successfully");
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}