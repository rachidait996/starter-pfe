package com.example.filemanager.services;

import com.example.filemanager.entities.Item;
import com.example.filemanager.entities.ItemType;
import com.example.filemanager.repositories.ItemRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * @author hp
 **/
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final ItemRepo itemRepository;
    private final ExcelImportService excelImportService;

    public Item uploadFile(MultipartFile file, Long parentId) throws Exception {

        // 1️⃣ Ensure the uploads folder exists
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 2️⃣ Get parent folder from DB
        Item parent = itemRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent folder not found"));



        // 3️⃣ Determine the destination path for the file
        Path filePath = uploadDir.resolve(file.getOriginalFilename() + "_" + System.currentTimeMillis());

        // 4️⃣ Copy the file to the uploads folder
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 5️⃣ Create the Item entity and link to parent
        Item item = new Item();
        item.setName(file.getOriginalFilename());
        item.setType(ItemType.FILE); // assuming you have an enum ItemType
        item.setParent(parent);
        item.setFilePath(filePath.toString()); // store the relative path
        item.setSize(file.getSize());
        item.setCreatedAt(LocalDateTime.now());

        // 6️⃣ Save to DB
        excelImportService.importLeadsFromExcel(itemRepository.save(item).getId());

        return item;

    }
    public List<Item> buildPath(Long folderId){

        List<Item> path = new ArrayList<>();

        Item current = itemRepository.findById(folderId).orElse(null);

        while(current != null){

            path.add(0,current);

            current = current.getParent();
        }

        return path;
    }
}
