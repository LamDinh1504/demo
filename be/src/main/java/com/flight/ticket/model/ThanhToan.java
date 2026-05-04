package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "THANHTOAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ThanhToan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaThanhToan")
    private int maThanhToan;

    @ManyToOne
    @JoinColumn(name = "MaDatVe")
    private DatVe maDatVe;

    @ManyToOne
    @JoinColumn(name = "MaPTTT")
    private PhuongThucThanhToan maPTTT;

    @Column(name = "SoTien")
    private BigDecimal soTien;

    @Column(name = "ThoiGianThanhToan")
    private LocalDateTime thoiGianThanhToan;

    @Column(name = "TrangThai")
    private String trangThai;

}
