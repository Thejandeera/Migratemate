package com.example.migratemate.ServiceManagement.Entity;

public enum ServiceCategory {
    TRANSPORT("Transport & Airport Services"),
    HOUSING("Accommodation & Housing"),
    DOCUMENTATION("Documentation Support"),
    CULTURAL_SUPPORT("Cultural & Language Support"),
    FINANCIAL("Financial Services"),
    HEALTHCARE("Healthcare Guidance"),
    EDUCATION("Education & Training"),
    LEGAL("Legal Assistance"),
    EMPLOYMENT("Employment Support"),
    OTHER("Other Services");

    private final String displayName;

    ServiceCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}