package com.flight.ticket.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String code) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Xác thực tài khoản Flight Ticket");
            
            String verifyUrl = "http://localhost:5173/verify-email?code=" + code;
            String content = "<div style='font-family: Arial, sans-serif; text-align: center;'>"
                    + "<h2>Chào mừng bạn đến với Flight Ticket!</h2>"
                    + "<p>Vui lòng nhấn vào nút bên dưới để xác thực tài khoản của bạn:</p>"
                    + "<a href='" + verifyUrl + "' style='background-color: #4CAF50; color: white; padding: 14px 25px; text-decoration: none; display: inline-block; border-radius: 4px;'>Xác thực ngay</a>"
                    + "<p>Nếu nút trên không hoạt động, hãy copy đường dẫn này: " + verifyUrl + "</p>"
                    + "</div>";
            
            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendPasswordResetEmail(String to, String code) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject("Yêu cầu đặt lại mật khẩu");
            
            String content = "<div style='font-family: Arial, sans-serif; text-align: center;'>"
                    + "<h2>Đặt lại mật khẩu</h2>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu. Mật khẩu mới của bạn là:</p>"
                    + "<h1 style='color: #4CAF50;'>" + code + "</h1>"
                    + "<p>Vui lòng đăng nhập với mật khẩu này và đổi lại mật khẩu nếu muốn.</p>"
                    + "</div>";
            
            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
