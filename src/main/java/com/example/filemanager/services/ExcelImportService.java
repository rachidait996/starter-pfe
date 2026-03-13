package com.example.filemanager.services;

import com.example.filemanager.entities.Item;
import com.example.filemanager.entities.Lead;
import com.example.filemanager.entities.LeadSource;
import com.example.filemanager.entities.Ville;
import com.example.filemanager.repositories.ItemRepo;
import com.example.filemanager.repositories.LeadRepo;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.File;

/**
 * @author hp
 **/
@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private final LeadRepo leadRepository;
    private final ItemRepo itemRepository;

    public void importLeadsFromExcel(Long itemId) throws Exception {

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        File file = new File(item.getFilePath());

        Workbook workbook = WorkbookFactory.create(file);
        Sheet sheet = workbook.getSheetAt(0);

        for (Row row : sheet) {

            if (row.getRowNum() == 0) {
                continue; // skip header
            }

            Lead lead = new Lead();

            // name
            lead.setName(row.getCell(0).getStringCellValue());

            // email
            lead.setEmail(row.getCell(1).getStringCellValue());

            // phone
            Cell phoneCell = row.getCell(2);
            String phone = "";

            if (phoneCell != null) {
                if (phoneCell.getCellType() == CellType.NUMERIC) {
                    phone = String.valueOf((long) phoneCell.getNumericCellValue());
                } else if (phoneCell.getCellType() == CellType.STRING) {
                    phone = phoneCell.getStringCellValue();
                }
            }

            lead.setPhone(phone);

            // ville (enum)
            Cell villeCell = row.getCell(3);
            if (villeCell != null && villeCell.getCellType() == CellType.STRING) {
                try {
                    lead.setVille(Ville.valueOf(villeCell.getStringCellValue().trim().toUpperCase()));
                } catch (Exception e) {
                    lead.setVille(null); // optional fallback
                }
            }

            // source (enum)
            Cell sourceCell = row.getCell(4);
            if (sourceCell != null && sourceCell.getCellType() == CellType.STRING) {
                try {
                    lead.setSource(LeadSource.valueOf(sourceCell.getStringCellValue().trim().toUpperCase()));
                } catch (Exception e) {
                    lead.setSource(LeadSource.IMPORT); // fallback
                }
            }

            // jobTitle
            Cell jobCell = row.getCell(5);
            if (jobCell != null && jobCell.getCellType() == CellType.STRING) {
                lead.setJobTitle(jobCell.getStringCellValue());
            }

            lead.setItem(item);

            leadRepository.save(lead);
        }

        workbook.close();
    }


}