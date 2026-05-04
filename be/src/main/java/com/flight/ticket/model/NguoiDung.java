package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "NGUOIDUNG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaNguoiDung")
    private int maNguoiDung;

    @Column(name = "HoTen")
    private String hoTen;

    @Column(name = "CCCD")
    private String cccd;

    @Column(name = "Sdt")
    private String sdt;

    @Column(name = "Email")
    private String email;

    @Column(name = "MatKhau")
    private String matKhau;

    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

    @Column(name = "DiaChi")
    private String diaChi;

    @Column(name = "VaiTro")
    private String vaitro;

    @Column(name = "GioiTinh")
    private String gioiTinh;

    @Column(name = "IsVerified")
    private Boolean isVerified = false;

    public boolean isVerified() {
        return isVerified != null && isVerified;
    }

    public void setVerified(boolean verified) {
        this.isVerified = verified;
    }

    @Column(name = "VerificationCode")
    private String verificationCode;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
