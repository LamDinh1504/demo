package com.flight.ticket.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyBookingDto {
    private int maDatVe;
    private String maDatCho;
    private LocalDateTime ngayDatVe;
    private BigDecimal tongTien;
    private String trangThai;
    private List<MyTicketDto> tickets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MyTicketDto {
        private int maVe;
        private String hoTenHK;
        private String soGhe;
        private BigDecimal giaVe;
        private String tenHangVe;
        private String maChuyenBay;
        private String noiDi;
        private String noiDen;
        private LocalDateTime thoiGianDi;
        private LocalDateTime thoiGianDen;
    }
}
