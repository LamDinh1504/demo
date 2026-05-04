package com.flight.ticket.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SANBAY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SanBay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaSanBay")
    private int maSanBay;

    @Column(name = "MaIATA")
    private String maIATA;

    @Column(name = "TenSanBay")
    private String tenSanBay;

    @Column(name = "ThanhPho")
    private String thanhPho;

    @Column(name = "QuocGia")
    private String quocGia;
}
