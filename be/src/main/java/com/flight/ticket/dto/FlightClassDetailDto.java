package com.flight.ticket.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightClassDetailDto {
    private Integer maHangVe;
    private String tenHangVe;
    private double gia;
    private int soLuongCho;
    private int soLuongChoConLai;
}
