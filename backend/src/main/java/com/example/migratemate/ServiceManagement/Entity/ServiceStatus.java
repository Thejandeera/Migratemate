package com.example.migratemate.ServiceManagement.Entity;

public enum ServiceStatus {
    INREVIEW("In Review"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    ADVICED("Adviced");

    private final String displayName;

    ServiceStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
