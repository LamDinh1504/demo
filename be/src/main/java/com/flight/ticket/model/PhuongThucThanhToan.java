package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PHUONGTHUCTHANHTOAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class PhuongThucThanhToan {
    @Id
    @Column(name = "MaPTTT")
    private int maPTTT;

    @Column(name = "TenPTTT")
    private String tenPTTT;
}

