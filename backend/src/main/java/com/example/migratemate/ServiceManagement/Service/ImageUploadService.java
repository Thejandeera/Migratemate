package com.example.migratemate.ServiceManagement.Service;

import com.example.migratemate.UserManagement.Service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageUploadService {

    private final CloudinaryService cloudinaryService;

    private static final String SERVICE_IMAGES_FOLDER = "migratemate/services";

    //Upload multiple base64 images to Cloudinary
    public List<String> uploadServiceImages(List<String> base64Images) throws IOException {
        List<String> uploadedUrls = new ArrayList<>();

        if (base64Images == null || base64Images.isEmpty()) {
            return uploadedUrls;
        }

        for (String base64Image : base64Images) {
            if (base64Image != null && !base64Image.isEmpty()) {
                try {
                    String imageUrl = cloudinaryService.uploadImageFromBase64(base64Image, SERVICE_IMAGES_FOLDER);
                    if (imageUrl != null) {
                        uploadedUrls.add(imageUrl);
                        log.info("Service image uploaded successfully: {}", imageUrl);
                    }
                } catch (IOException e) {
                    log.error("Failed to upload service image", e);
                    throw new IOException("Failed to upload service image: " + e.getMessage());
                }
            }
        }

        return uploadedUrls;
    }

    //Upload a single base64 image to Cloudinary
    public String uploadServiceImage(String base64Image) throws IOException {
        if (base64Image == null || base64Image.isEmpty()) {
            return null;
        }

        try {
            String imageUrl = cloudinaryService.uploadImageFromBase64(base64Image, SERVICE_IMAGES_FOLDER);
            log.info("Service image uploaded successfully: {}", imageUrl);
            return imageUrl;
        } catch (IOException e) {
            log.error("Failed to upload service image", e);
            throw new IOException("Failed to upload service image: " + e.getMessage());
        }
    }

    //Delete a service image from Cloudinary
    public boolean deleteServiceImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return false;
        }

        boolean result = cloudinaryService.deleteImage(imageUrl);
        if (result) {
            log.info("Service image deleted successfully: {}", imageUrl);
        } else {
            log.warn("Failed to delete service image: {}", imageUrl);
        }
        return result;
    }

    //Delete multiple service images from Cloudinary
    public int deleteServiceImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return 0;
        }

        int deletedCount = 0;
        for (String imageUrl : imageUrls) {
            if (deleteServiceImage(imageUrl)) {
                deletedCount++;
            }
        }

        log.info("Deleted {} out of {} service images", deletedCount, imageUrls.size());
        return deletedCount;
    }

    //Process image updates for a service
    public List<String> processImageUpdates(
            List<String> existingUrls,
            List<String> newBase64Images,
            List<String> urlsToRemove) throws IOException {

        List<String> updatedUrls = new ArrayList<>(existingUrls != null ? existingUrls : new ArrayList<>());

        // Remove specified images
        if (urlsToRemove != null && !urlsToRemove.isEmpty()) {
            for (String urlToRemove : urlsToRemove) {
                if (updatedUrls.remove(urlToRemove)) {
                    deleteServiceImage(urlToRemove);
                }
            }
        }

        // Upload new images
        if (newBase64Images != null && !newBase64Images.isEmpty()) {
            List<String> newUrls = uploadServiceImages(newBase64Images);
            updatedUrls.addAll(newUrls);
        }

        return updatedUrls;
    }
}
