package com.example.migratemate.ServiceManagement.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceSearchRequest {

    private String category;
    private String origin;
    private String destination;
    private Double minPrice;
    private Double maxPrice;
    private String searchTerm;
    private String pricingType;
    private Boolean availableOnly;
}
