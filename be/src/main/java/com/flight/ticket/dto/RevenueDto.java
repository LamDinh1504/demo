package com.flight.ticket.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueDto {
    private int year;
    private int month;
    private BigDecimal doanhThu;          // Doanh thu SUCCESS
    private long soGiaoDich;              // Tổng giao dịch
    private long soGiaoDichSuccess;       // Giao dịch SUCCESS
    private long soGiaoDichPending;       // Giao dịch PENDING

    // Tổng hợp theo năm
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class YearlyRevenue {
        private int year;
        private BigDecimal tongDoanhThu;
        private long tongGiaoDich;
        private long tongGiaoDichSuccess;
        private List<RevenueDto> theoThang;                  // 12 tháng
        private Map<String, BigDecimal> theoHinhThucThanhToan; // VNPAY, MoMo, ...
    }
}
