package com.example.migratemate.ARManagement.Model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ar_history")
public class ARHistory {

    @Id
    private String id;
    private String userId;
    private String name;
    private String location;
    private String description;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Manual getter for timestamp if Lombok fails (backup)
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
