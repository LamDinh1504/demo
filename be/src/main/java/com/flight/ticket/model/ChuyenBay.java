package com.flight.ticket.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "CHUYENBAY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChuyenBay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChuyenBay")
    private int maChuyenBay;

    @ManyToOne
    @JoinColumn(name = "MaHangHK")
    private HangHangKhong maHangHK;

    @ManyToOne
    @JoinColumn(name = "MaMayBay")
    private MayBay maMayBay;

    @ManyToOne
    @JoinColumn(name = "MaSanBayDi")
    private SanBay maSanBayDi;

    @ManyToOne
    @JoinColumn(name = "MaSanBayDen")
    private SanBay maSanBayDen;

    @Column(name = "NgayGioKhoiHanh")
    private LocalDateTime ngayGioKhoiHanh;

    @Column(name = "NgayGioHaCanh")
    private LocalDateTime ngayGioHaCanh;

    @Column(name = "ThoiGianBay")
    private int thoiGianBay;

    @Column(name = "TrangThai")
    private String trangThai;

    @OneToMany(mappedBy = "maChuyenBay", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private java.util.List<TrungGian> danhSachTrungGian = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "chuyenBay", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<CT_ChuyenBay> chiTietHangVe = new java.util.ArrayList<>();

    public void addTrungGian(TrungGian tg) {
        danhSachTrungGian.add(tg);
        tg.setMaChuyenBay(this);
    }
}
