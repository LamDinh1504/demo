package com.flight.ticket.dto;

import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PassengerDto {
    private int maChuyenBay;
    private Integer maHangVe;
    private String hoTenHK;
    private String cccd;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String doiTuong;
    private String soGhe;
    private BigDecimal giaVe;
    private BigDecimal giaHanhLy;
    private int canNangHanhLy;
    private Integer giaBaoHiem;
}
