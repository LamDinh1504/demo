package com.flight.ticket.model;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "DATVE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatVe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDatVe")
    private int maDatVe;

    @Column(name = "MaDatCho")
    private String maDatCho;

    @ManyToOne
    @JoinColumn(name = "MaNguoiDung")
    private NguoiDung maNguoiDung;

    @ManyToOne
    @JoinColumn(name = "MaKhuyenMai")
    private KhuyenMai maKhuyenMai;

    @Column(name = "NgayDatVe")
    private LocalDateTime ngayDatVe;

    @Column(name = "TongTien")
    private BigDecimal tongTien;

    @Column(name = "TrangThai")
    private String trangThai;

}
