package com.example.migratemate.AdminManagement.Controller;

import com.example.migratemate.AdminManagement.Dto.AdminDto;
import com.example.migratemate.AdminManagement.Service.AdminService;
import com.example.migratemate.UserManagement.Dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AdminDto.AdminResponse>> createAdmin(@RequestBody AdminDto.AdminRequest request) {
        try {
            AdminDto.AdminResponse response = adminService.createAdmin(request);
            return ResponseEntity.ok(ApiResponse.<AdminDto.AdminResponse>builder()
                    .success(true)
                    .message("Admin created successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<AdminDto.AdminResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminDto.AdminLoginResponse>> login(
            @RequestBody AdminDto.AdminLoginRequest request) {
        try {
            AdminDto.AdminLoginResponse response = adminService.login(request);
            return ResponseEntity.ok(ApiResponse.<AdminDto.AdminLoginResponse>builder()
                    .success(true)
                    .message("Login successful")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<AdminDto.AdminLoginResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminDto.AdminResponse>> updateAdmin(@PathVariable String id,
            @RequestBody AdminDto.AdminRequest request) {
        try {
            AdminDto.AdminResponse response = adminService.updateAdmin(id, request);
            return ResponseEntity.ok(ApiResponse.<AdminDto.AdminResponse>builder()
                    .success(true)
                    .message("Admin updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<AdminDto.AdminResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminDto.AdminResponse>> changeStatus(@PathVariable String id,
            @RequestParam String status) {
        try {
            AdminDto.AdminResponse response = adminService.changeStatus(id, status);
            return ResponseEntity.ok(ApiResponse.<AdminDto.AdminResponse>builder()
                    .success(true)
                    .message("Status updated successfully")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<AdminDto.AdminResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminDto.AdminResponse>>> getAllAdmins() {
        List<AdminDto.AdminResponse> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(ApiResponse.<List<AdminDto.AdminResponse>>builder()
                .success(true)
                .message("Admins retrieved successfully")
                .data(admins)
                .build());
    }
}
