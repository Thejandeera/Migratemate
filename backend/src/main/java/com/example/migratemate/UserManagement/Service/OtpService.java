package com.example.migratemate.UserManagement.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    // In a production environment, use Redis or Database.
    // Use ConcurrentHashMap for simple in-memory storage.
    // Key: Email, Value: OtpEntry (otp, timestamp)
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();
    private static final long OTP_VALID_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    private static class OtpEntry {
        String otp;
        long timestamp;

        OtpEntry(String otp, long timestamp) {
            this.otp = otp;
            this.timestamp = timestamp;
        }
    }

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, new OtpEntry(otp, System.currentTimeMillis()));
        log.info("Generated OTP for {}: {}", email, otp); // Remove in production! or keep for debug
        return otp;
    }

    public void validateOtp(String email, String otp) {
        OtpEntry entry = otpStorage.get(email);

        if (entry == null) {
            throw new IllegalArgumentException("OTP not found or expired");
        }

        if (System.currentTimeMillis() - entry.timestamp > OTP_VALID_DURATION_MS) {
            otpStorage.remove(email);
            throw new IllegalArgumentException("OTP expired");
        }

        if (!entry.otp.equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        // OTP is valid. Ideally remove it to prevent replay,
        // but if verification happens in a separate step from registration, keep it for
        // a bit
        // OR better: remove it here and issued a temporary 'token' for registration.
        // For simplicity requested: "when user eentered correctly that otp should able
        // to click signup".
        // We will just validate it. If this is called during registration, remove it.
        // If called during "Verify" button click, don't remove, or the registration
        // call will fail.
        // Let's remove ONLY when "consuming" the OTP (i.e. registration).
        // For the "verify" endpoint, we just check without removing?
        // Or we use the same method with a flag.
    }

    public void consumeOtp(String email, String otp) {
        validateOtp(email, otp);
        otpStorage.remove(email);
    }

    // Check without removing (for UI feedback if needed)
    public boolean checkOtp(String email, String otp) {
        try {
            OtpEntry entry = otpStorage.get(email);
            if (entry == null)
                return false;
            if (System.currentTimeMillis() - entry.timestamp > OTP_VALID_DURATION_MS)
                return false;
            return entry.otp.equals(otp);
        } catch (Exception e) {
            return false;
        }
    }
}
