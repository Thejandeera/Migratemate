package com.example.migratemate.BookingManagement.Controller;

import com.example.migratemate.BookingManagement.Dto.BookingResponse;
import com.example.migratemate.BookingManagement.Dto.CreateBookingRequest;
import com.example.migratemate.BookingManagement.Model.BookingStatus;
import com.example.migratemate.BookingManagement.Service.BookingService;
import com.example.migratemate.UserManagement.Dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@RequestBody CreateBookingRequest request) {
        try {
            String email = getCurrentUserEmail();
            BookingResponse response = bookingService.createBooking(email, request);
            return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Booking requested successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            log.error("Failed to create booking", e);
            return ResponseEntity.badRequest().body(ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        try {
            String email = getCurrentUserEmail();
            List<BookingResponse> bookings = bookingService.getMyBookings(email);
            return ResponseEntity.ok(ApiResponse.<List<BookingResponse>>builder()
                    .success(true)
                    .data(bookings)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.<List<BookingResponse>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/provider-requests")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getProviderBookings() {
        try {
            String email = getCurrentUserEmail();
            List<BookingResponse> bookings = bookingService.getProviderBookings(email);
            return ResponseEntity.ok(ApiResponse.<List<BookingResponse>>builder()
                    .success(true)
                    .data(bookings)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.<List<BookingResponse>>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String email = getCurrentUserEmail();
            BookingStatus status = BookingStatus.valueOf(statusUpdate.get("status"));
            BookingResponse response = bookingService.updateStatus(id, email, status);
            return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Booking status updated")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        return authentication.getName();
    }
}
