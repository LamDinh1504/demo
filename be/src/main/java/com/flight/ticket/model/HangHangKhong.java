package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "HANGHANGKHONG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HangHangKhong {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHangHK")
    private int maHangHK;

    @Column(name = "TenHang")
    private String tenHang;

    @Column(name = "LogoURL")
    private String logoURL;

    @Column(name = "MaIATA")
    private String maIATA;
}
