package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MAYBAY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MayBay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaMayBay")
    private int maMayBay;

    @ManyToOne
    @JoinColumn(name = "MaHangHK")
    private HangHangKhong maHangHK;

    @Column(name = "TenMayBay")
    private String tenMayBay;

    @Column(name = "TongSoGhe")
    private int tongSoGhe;

}
