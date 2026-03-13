package com.example.filemanager.controllers;

import com.example.filemanager.entities.Lead;
import com.example.filemanager.repositories.LeadRepo;
import com.example.filemanager.services.ExcelImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ExcelToLeadController {

    private final ExcelImportService excelImportService;
    private final LeadRepo leadRepository;

    // Import Excel leads
    @PostMapping("/import/{itemId}")
    public String importExcel(@PathVariable Long itemId) throws Exception {

        excelImportService.importLeadsFromExcel(itemId);

        return "Leads imported successfully";
    }

    // Get all leads
    @GetMapping
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    // Get leads by item
    @GetMapping("/item/{itemId}")
    public List<Lead> getLeadsByItem(@PathVariable Long itemId) {
        return leadRepository.findByItem_Id(itemId);
    }

    // Get lead by id
    @GetMapping("/{leadId}")
    public Optional<Lead> getLeadById(@PathVariable Long leadId) {
        return leadRepository.findById(leadId);
    }

    // Update lead
    @PutMapping("/{leadId}")
    public Lead updateLead(@PathVariable Long leadId, @RequestBody Lead updatedLead) {

        Lead lead = leadRepository.findById(leadId).orElseThrow();

        lead.setName(updatedLead.getName());
        lead.setEmail(updatedLead.getEmail());
        lead.setPhone(updatedLead.getPhone());
        lead.setVille(updatedLead.getVille());
        lead.setSource(updatedLead.getSource());
        lead.setJobTitle(updatedLead.getJobTitle());
        lead.setAssignedTo(updatedLead.getAssignedTo());
        lead.setAssignedToId(updatedLead.getAssignedToId());
        lead.setPhoneVerified(updatedLead.getPhoneVerified());
        lead.setEmailVerified(updatedLead.getEmailVerified());
        lead.setIsDuplicate(updatedLead.getIsDuplicate());
        lead.setDuplicateOf(updatedLead.getDuplicateOf());

        return leadRepository.save(lead);
    }

    // Delete lead
    @DeleteMapping("/{leadId}")
    public void deleteLead(@PathVariable Long leadId) {
        leadRepository.deleteById(leadId);
    }

    // Batch delete
    @PostMapping("/batch/delete")
    public void batchDelete(@RequestBody List<Long> ids) {
        leadRepository.deleteAllById(ids);
    }

    // Batch assign
    @PostMapping("/batch/assign")
    public void batchAssign(@RequestBody BatchAssignRequest request) {

        List<Lead> leads = leadRepository.findAllById(request.getIds());

        for (Lead lead : leads) {
            lead.setAssignedTo(request.getAssignedTo());
        }

        leadRepository.saveAll(leads);
    }
    @PostMapping("/bulk-assign")
    public BulkAssignResponse bulkAssign(@RequestBody BulkAssignmentRule rule) {

        List<Lead> leads = leadRepository.findAll();
        int affected = 0;

        for (Lead lead : leads) {

            if (rule.getCriteria().equals("ville") &&
                    lead.getVille() != null &&
                    lead.getVille().name().equals(rule.getValue())) {

                lead.setAssignedTo(rule.getAssignTo());
                affected++;

            } else if (rule.getCriteria().equals("source") &&
                    lead.getSource() != null &&
                    lead.getSource().name().equals(rule.getValue())) {

                lead.setAssignedTo(rule.getAssignTo());
                affected++;
            }
        }

        leadRepository.saveAll(leads);

        return new BulkAssignResponse(affected);
    }
}