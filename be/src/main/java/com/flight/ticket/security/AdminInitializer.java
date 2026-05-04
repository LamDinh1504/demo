package com.flight.ticket.security;

import com.flight.ticket.model.NguoiDung;
import com.flight.ticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        userRepository.findByEmail("admin@example.com").ifPresentOrElse(
            admin -> {
                if (!"ADMIN".equals(admin.getVaitro())) {
                    admin.setVaitro("ADMIN");
                    userRepository.save(admin);
                    System.out.println("Admin user role updated to ADMIN");
                }
            },
            () -> {
                NguoiDung admin = NguoiDung.builder()
                        .email("admin@example.com")
                        .matKhau(passwordEncoder.encode("admin123"))
                        .hoTen("Admin User")
                        .vaitro("ADMIN")
                        .isVerified(true)
                        .build();
                userRepository.save(admin);
                System.out.println("Admin user created successfully");
            }
        );


    }
}
