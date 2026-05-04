package com.flight.ticket.service;

import com.flight.ticket.dto.AuthResponse;
import com.flight.ticket.dto.LoginRequest;
import com.flight.ticket.dto.RegisterRequest;
import com.flight.ticket.dto.UserDto;
import com.flight.ticket.model.NguoiDung;
import com.flight.ticket.repository.UserRepository;
import com.flight.ticket.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        String trimmedEmail = request.getEmail() != null ? request.getEmail().trim() : "";
        if (userRepository.findByEmail(trimmedEmail).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        NguoiDung user = new NguoiDung();
        user.setHoTen(request.getName());
        user.setEmail(trimmedEmail);
        user.setMatKhau(passwordEncoder.encode(request.getPassword()));
        user.setVaitro(
                request.getRole() != null && !request.getRole().isBlank()
                        ? request.getRole().toUpperCase()
                        : "CLIENT"
        );
        user.setVerified(false);

        String verificationCode = UUID.randomUUID().toString();
        user.setVerificationCode(verificationCode);

        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        return AuthResponse.builder()
                .message("Đăng ký thành công. Vui lòng kiểm tra email để xác thực.")
                .role(user.getVaitro())
                .user(UserDto.builder()
                        .maNguoiDung(user.getMaNguoiDung())
                        .email(user.getEmail())
                        .hoTen(user.getHoTen())
                        .role(user.getVaitro())
                        .build())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        System.out.println("[LOGIN DEBUG] Attempting login for email: " + email);
        Optional<NguoiDung> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.out.println("[LOGIN DEBUG] User NOT found for email: " + email);
            System.out.println("[LOGIN DEBUG] Current emails in DB: " + 
                userRepository.findAll().stream().map(u -> "'" + u.getEmail() + "'").collect(java.util.stream.Collectors.joining(", ")));
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        NguoiDung user = userOpt.get();
        boolean passwordMatch = passwordEncoder.matches(request.getPassword(), user.getMatKhau());
        System.out.println("[LOGIN DEBUG] Password match result: " + passwordMatch);

        if (!passwordMatch) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng");
        }

        System.out.println("[LOGIN DEBUG] User verified status: " + user.isVerified());
        if (!user.isVerified()) {
            throw new RuntimeException("Vui lòng xác thực email trước khi đăng nhập");
        }

        String jwt = jwtUtils.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(jwt)
                .message("Đăng nhập thành công")
                .role(user.getVaitro())
                .user(UserDto.builder()
                        .maNguoiDung(user.getMaNguoiDung())
                        .email(user.getEmail())
                        .hoTen(user.getHoTen())
                        .role(user.getVaitro())
                        .build())
                .build();
    }

    public AuthResponse verifyEmail(String code) {
        Optional<NguoiDung> userOpt = userRepository.findByVerificationCode(code);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Mã xác thực không hợp lệ");
        }

        NguoiDung user = userOpt.get();
        user.setVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        return AuthResponse.builder()
                .message("Xác thực email thành công")
                .role(user.getVaitro())
                .user(UserDto.builder()
                        .maNguoiDung(user.getMaNguoiDung())
                        .email(user.getEmail())
                        .hoTen(user.getHoTen())
                        .role(user.getVaitro())
                        .build())
                .build();
    }

    public AuthResponse forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email không được để trống");
        }
        Optional<NguoiDung> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            NguoiDung user = userOpt.get();
            // Generate a random 8-character password
            String newPassword = UUID.randomUUID().toString().substring(0, 8);
            System.out.println("Gửi mật khẩu mới cho user: " + newPassword);
            
            // Hash the new password before storing it into the database
            user.setMatKhau(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            // Send the plain text completely unhashed new password via email
            emailService.sendPasswordResetEmail(user.getEmail(), newPassword);
        }
        return AuthResponse.builder()
                .message("Nếu email tồn tại, hệ thống đã gửi mật khẩu mới đến email của bạn.")
                .build();
    }
}
