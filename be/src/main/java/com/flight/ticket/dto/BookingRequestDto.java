package com.flight.ticket.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDto {
    @JsonProperty("maNguoiDung")
    private Integer maNguoiDung;
    private String maKhuyenMai;
    private BigDecimal tongTien;
    private List<PassengerDto> passengers;
    private String phuongThucThanhToan; // "VNPAY" | "PAY_LATER"
}
