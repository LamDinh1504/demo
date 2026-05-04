package com.flight.ticket.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "CT_DATVE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CT_DatVe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaVe")
    private int maVe;

    @ManyToOne
    @JoinColumn(name = "MaDatVe")
    private DatVe maDatVe;

    @ManyToOne(optional = true)
    @JoinColumn(name = "MaChuyenBay")
    private ChuyenBay maChuyenBay;

    @ManyToOne(optional = true)
    @JoinColumn(name = "MaHangVe")
    private HangVe maHangVe;

    @Column(name = "HoTenHK", length = 255)
    private String hoTenHK;

    @Column(name = "CCCD", length = 20)
    private String cccd;

    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

    @Column(name = "GioiTinh", length = 10)
    private String gioiTinh;

    @Column(name = "DoiTuong", length = 50)
    private String doiTuong;

    @Column(name = "SoGhe", length = 20)
    private String soGhe;

    @Column(name = "GiaVe", precision = 15, scale = 2)
    private BigDecimal giaVe;

    @Builder.Default
    @Column(name = "GiaHanhLy", precision = 15, scale = 2)
    private BigDecimal giaHanhLy = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "CanNangHanhLy")
    private int canNangHanhLy = 0;

    @Builder.Default
    @Column(name = "GiaBaoHiem")
    private Integer giaBaoHiem = 0;

    @Column(name = "TrangThai", length = 50)
    private String trangThai; // e.g., 'CHECKED_IN'
}

