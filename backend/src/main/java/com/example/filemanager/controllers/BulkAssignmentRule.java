package com.example.filemanager.controllers;

import lombok.Data;

/**
 * @author hp
 **/
@Data
public class BulkAssignmentRule {

    private String criteria; // ville or source
    private String value;
    private String assignTo;
    private String description;
}