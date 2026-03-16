package com.example.filemanager.repositories;

import com.example.filemanager.entities.Lead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author hp
 **/


public interface LeadRepo extends JpaRepository<Lead, Long> {

    List<Lead> findByItem_Id(Long itemId);

}