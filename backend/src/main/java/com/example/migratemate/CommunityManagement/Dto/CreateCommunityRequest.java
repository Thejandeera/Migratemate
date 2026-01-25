package com.example.migratemate.CommunityManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommunityRequest {
    private String name;
    private String originCountry;
    private String destinationCountry;
    private String description;
    private String rules;
    private String coverImageBase64; // Optional
}