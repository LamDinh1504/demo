package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "KHUYENMAI")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMai {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaKhuyenMai")
    private int maKhuyenMai;

    @Column(name = "Code")
    private String code;

    @Column(name = "TenChuongTrinh")
    private String tenChuongTrinh;

    @Column(name = "MoTaTenChuongTrinh")
    private String moTaTenChuongTrinh;

    @Column(name = "PhanTramGiam")
    private BigDecimal phanTramGiam;

    @Column(name = "SoTienGiamToiDa")
    private BigDecimal soTienGiamToiDa;

    @Column(name = "NgayBatDau")
    private LocalDate ngayBatDau;

    @Column(name = "NgayKetThuc")
    private LocalDate ngayKetThuc;

    @Column(name = "SoLuongConLai")
    private int soLuongConLai;

    @Column(name = "UrlImage")
    private String urlImage;
}
