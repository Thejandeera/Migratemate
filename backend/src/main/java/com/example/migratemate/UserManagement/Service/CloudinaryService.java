package com.example.migratemate.UserManagement.Service;



import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload image from MultipartFile
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto",
                    "public_id", UUID.randomUUID().toString()
            );

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");

            log.info("Image uploaded successfully to Cloudinary: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new IOException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload image from Base64 string
     */
    public String uploadImageFromBase64(String base64Data, String folder) throws IOException {
        if (base64Data == null || base64Data.isEmpty()) {
            return null;
        }

        try {
            // Remove data URL prefix if present (e.g., "data:image/png;base64,")
            String base64Image = base64Data;
            if (base64Data.contains(",")) {
                base64Image = base64Data.split(",")[1];
            }

            // Decode base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto",
                    "public_id", UUID.randomUUID().toString()
            );

            Map uploadResult = cloudinary.uploader().upload(imageBytes, uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");

            log.info("Base64 image uploaded successfully to Cloudinary: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("Failed to upload base64 image to Cloudinary", e);
            throw new IOException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Delete image from Cloudinary
     */
    public boolean deleteImage(String imageUrl) {
        try {
            if (imageUrl == null || imageUrl.isEmpty()) {
                return false;
            }

            // Extract public ID from URL
            String publicId = extractPublicIdFromUrl(imageUrl);

            if (publicId != null) {
                Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted from Cloudinary: {}", publicId);
                return "ok".equals(result.get("result"));
            }

            return false;

        } catch (Exception e) {
            log.error("Failed to delete image from Cloudinary", e);
            return false;
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     */
    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String pathAfterUpload = parts[1];
                // Remove version number if present (v1234567890/)
                String withoutVersion = pathAfterUpload.replaceFirst("v\\d+/", "");
                // Remove file extension
                int lastDotIndex = withoutVersion.lastIndexOf('.');
                if (lastDotIndex > 0) {
                    return withoutVersion.substring(0, lastDotIndex);
                }
                return withoutVersion;
            }
        } catch (Exception e) {
            log.error("Failed to extract public ID from URL: {}", imageUrl, e);
        }
        return null;
    }

    /**
     * Upload avatar image
     */
    public String uploadAvatar(String base64Data) throws IOException {
        return uploadImageFromBase64(base64Data, "migratemate/avatars");
    }

    /**
     * Upload passport image
     */
    public String uploadPassport(String base64Data) throws IOException {
        return uploadImageFromBase64(base64Data, "migratemate/passports");
    }

    /**
     * Upload selfie image
     */
    public String uploadSelfie(String base64Data) throws IOException {
        return uploadImageFromBase64(base64Data, "migratemate/selfies");
    }

    /**
     * Upload avatar from MultipartFile
     */
    public String uploadAvatarMultipart(MultipartFile file) throws IOException {
        return uploadImage(file, "migratemate/avatars");
    }

    /**
     * Upload passport from MultipartFile
     */
    public String uploadPassportMultipart(MultipartFile file) throws IOException {
        return uploadImage(file, "migratemate/passports");
    }

    /**
     * Upload selfie from MultipartFile
     */
    public String uploadSelfieMultipart(MultipartFile file) throws IOException {
        return uploadImage(file, "migratemate/selfies");
    }
}