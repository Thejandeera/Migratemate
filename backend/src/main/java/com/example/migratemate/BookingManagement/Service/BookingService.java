package com.example.migratemate.BookingManagement.Service;

import com.example.migratemate.BookingManagement.Dto.BookingResponse;
import com.example.migratemate.BookingManagement.Dto.CreateBookingRequest;
import com.example.migratemate.BookingManagement.Model.Booking;
import com.example.migratemate.BookingManagement.Model.BookingStatus;
import com.example.migratemate.BookingManagement.Repository.BookingRepository;
import com.example.migratemate.ServiceManagement.Dto.ServiceResponse;
import com.example.migratemate.ServiceManagement.Service.ServiceService;
import com.example.migratemate.UserManagement.Entity.User;
import com.example.migratemate.UserManagement.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceService serviceService;
    private final UserRepository userRepository;

    public BookingResponse createBooking(String customerEmail, CreateBookingRequest request) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceResponse service = serviceService.getServiceById(request.getServiceId());

        User provider = userRepository.findById(service.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Prevent booking own service
        if (customer.getId().equals(provider.getId())) {
            throw new RuntimeException("You cannot book your own service.");
        }

        Booking booking = Booking.builder()
                .serviceId(service.getId())
                .serviceTitle(service.getTitle())
                .totalAmount(service.getPrice())
                .currency(service.getCurrency())
                .customerId(customer.getId())
                .customerName(customer.getFirstName() + " " + customer.getLastName())
                .customerAvatar(customer.getAvatarUrl())

                .providerId(provider.getId())
                .providerName(provider.getFirstName() + " " + provider.getLastName())
                .providerAvatar(provider.getAvatarUrl())

                .requestedDate(request.getDate())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .createdAt(java.time.LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public List<BookingResponse> getMyBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getProviderBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByProviderIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BookingResponse updateStatus(String bookingId, String email, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only provider can accept/decline/complete
        // Optionally, customer can cancel if pending
        boolean isProvider = booking.getProviderId().equals(user.getId());
        boolean isCustomer = booking.getCustomerId().equals(user.getId());

        if (isProvider) {
            booking.setStatus(newStatus);
        } else if (isCustomer && newStatus == BookingStatus.CANCELLED && booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CANCELLED);
        } else {
            throw new RuntimeException("Not authorized to update this booking status");
        }

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteBooking(String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(bookingId);
    }

    public BookingResponse updateStatusForAdmin(String bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(newStatus);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .id(booking.getId())
                .serviceId(booking.getServiceId())
                .serviceTitle(booking.getServiceTitle())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .customerId(booking.getCustomerId())
                .customerName(booking.getCustomerName())
                .customerAvatar(booking.getCustomerAvatar())
                .providerId(booking.getProviderId())
                .providerName(booking.getProviderName())
                .providerAvatar(booking.getProviderAvatar())
                .requestedDate(booking.getRequestedDate())
                .notes(booking.getNotes())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt() != null ? java.sql.Timestamp.valueOf(booking.getCreatedAt()) : null);

        // For admin, we might want to verify user existence for consistent data,
        // but for now, we follow the same pattern: fetch details if confirmed (or
        // always for admin?)
        // Let's keep it consistent: fetch if confirmed (ACCEPTED/COMPLETED)
        // OR if needed for admin view.
        // Assuming admin wants to see contact info regardless of status?
        // Let's stick to the existing logic for now to avoid n+1 issues on list view
        // unless necessary.

        if (booking.getStatus() == BookingStatus.ACCEPTED || booking.getStatus() == BookingStatus.COMPLETED) {
            userRepository.findById(booking.getCustomerId()).ifPresent(customer -> {
                builder.customerEmail(customer.getEmail());
                builder.customerPhone(customer.getPhone());
            });

            userRepository.findById(booking.getProviderId()).ifPresent(provider -> {
                builder.providerEmail(provider.getEmail());
                builder.providerPhone(provider.getPhone());
            });
        }

        return builder.build();
    }
}
