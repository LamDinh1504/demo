package com.flight.ticket.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhuyenMaiDto {
    private int maKhuyenMai;
    private String code;
    private String tenChuongTrinh;
    private String moTaTenChuongTrinh;
    private BigDecimal phanTramGiam;
    private BigDecimal soTienGiamToiDa;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private int soLuongConLai;
    private String urlImage;
}
