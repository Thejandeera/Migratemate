package com.example.migratemate.AdminManagement.Service;

import com.example.migratemate.AdminManagement.Dto.AdminDto;
import com.example.migratemate.AdminManagement.Entity.Admin;
import com.example.migratemate.AdminManagement.Repository.AdminRepository;
import com.example.migratemate.Config.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AdminDto.AdminResponse createAdmin(AdminDto.AdminRequest request) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Admin admin = Admin.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status("Active")
                .createdData(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        admin.generateFullName();
        adminRepository.save(admin);

        return mapToResponse(admin);
    }

    public AdminDto.AdminLoginResponse login(AdminDto.AdminLoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if ("Disable".equalsIgnoreCase(admin.getStatus())) {
            throw new IllegalArgumentException("Account is disabled");
        }

        // We create a UserDetails object on the fly for token generation since we
        // aren't using UserDetailsService for Admin
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(admin.getEmail())
                .password(admin.getPassword()) // Encoded
                .authorities(Collections.emptyList())
                .build();

        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AdminDto.AdminLoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .admin(mapToResponse(admin))
                .build();
    }

    @Transactional
    public AdminDto.AdminResponse updateAdmin(String id, AdminDto.AdminRequest request) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        if (request.getFirstName() != null)
            admin.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            admin.setLastName(request.getLastName());

        admin.generateFullName();
        admin.setUpdatedAt(LocalDateTime.now());

        adminRepository.save(admin);
        return mapToResponse(admin);
    }

    @Transactional
    public AdminDto.AdminResponse changeStatus(String id, String status) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        admin.setStatus(status);
        admin.setUpdatedAt(LocalDateTime.now());
        adminRepository.save(admin);
        return mapToResponse(admin);
    }

    public List<AdminDto.AdminResponse> getAllAdmins() {
        return adminRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AdminDto.AdminResponse mapToResponse(Admin admin) {
        return AdminDto.AdminResponse.builder()
                .id(admin.getId())
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .status(admin.getStatus())
                .createdData(admin.getCreatedData())
                .build();
    }
}
