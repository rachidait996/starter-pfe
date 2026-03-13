package com.example.filemanager.services;

import com.example.filemanager.entities.Item;
import com.example.filemanager.entities.ItemType;
import com.example.filemanager.repositories.ItemRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * @author hp
 **/
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepo itemRepository;

    public List<Item> getFolderItems(Long folderId) {
        return itemRepository.findByParent_Id(folderId);
    }

    @Transactional
    public Item createFolder(String name, Long parentId) {

        Item parent = null;

        if(parentId != null){
            parent = itemRepository.findById(parentId).orElseThrow(() -> new NoSuchElementException("Parent folder not found"));
        }

        Item folder = new Item();
        folder.setName(name);
        folder.setType(ItemType.FOLDER);
        folder.setParent(parent);
        folder.setCreatedAt(LocalDateTime.now());

        return itemRepository.save(folder);
    }

}
