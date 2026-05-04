package com.flight.ticket.dto;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirportDto {
    private int maSanBay;
    private String maIATA;
    private String tenSanBay;
    private String thanhPho;
    private String quocGia;
}
