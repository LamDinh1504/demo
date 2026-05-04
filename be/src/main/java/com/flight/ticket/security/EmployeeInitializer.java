package com.flight.ticket.security;

import com.flight.ticket.model.NguoiDung;
import com.flight.ticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class EmployeeInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if employee already exists
        userRepository.findByEmail("employee@example.com").ifPresentOrElse(
            employee -> {
                if (!"USER".equals(employee.getVaitro())) {
                    employee.setVaitro("USER");
                    userRepository.save(employee);
                    System.out.println("Employee user role updated to USER");
                }
            },
            () -> {
                NguoiDung employee = NguoiDung.builder()
                        .email("employee@example.com")
                        .matKhau(passwordEncoder.encode("employee123"))
                        .hoTen("Employee User")
                        .vaitro("USER")
                        .isVerified(true)
                        .build();
                userRepository.save(employee);
                System.out.println("Employee user created successfully");
            }
        );
    }
}
