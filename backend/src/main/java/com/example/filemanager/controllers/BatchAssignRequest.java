package com.example.filemanager.controllers;

import lombok.Data;
import java.util.List;

@Data
public class BatchAssignRequest {

    private List<Long> ids;

    private String assignedTo;
}