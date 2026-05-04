package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "HANGVE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class HangVe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaHangVe")
    private Integer maHangVe;

    @Column(name = "TenHangVe")
    private String tenHangVe;

    @Column(name = "HeSoGia")
    private java.math.BigDecimal heSoGia;
}
