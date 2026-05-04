package com.flight.ticket.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDto {
    private String message;
    private int maDatVe;
    private String maDatCho;
    private String trangThai;
}
