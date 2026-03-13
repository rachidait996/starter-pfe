package com.example.filemanager.repositories;

import com.example.filemanager.entities.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.jar.JarEntry;

/**
 * @author hp
 **/
public interface ItemRepo extends JpaRepository<Item, Integer> {
    List<Item> findByParent_Id(Long parentId);
    Optional<Item> findById(Long id);


    List<Item> findByParentIsNull();

    Optional<Item> findByName(String name);
}
