package com.flight.ticket.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateFlightDto {
    private Integer maHangHK;      // ID hãng hàng không
    private Integer maMayBay;      // ID máy bay
    private Integer maSanBayDi;    // ID sân bay đi
    private Integer maSanBayDen;   // ID sân bay đến
    private String ngayGioKhoiHanh; // "2026-04-10T08:00"
    private String ngayGioHaCanh;   // "2026-04-10T10:15"
    private Integer thoiGianBay;   // Phút
    private String trangThai;      // "Đã lên lịch"

    // Chi tiết hạng vé cho chuyến bay
    private List<FlightClassInput> chiTietHangVe;

    // Danh sách sân bay trung gian
    private List<TransitAirportInput> sanBayTrungGian;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightClassInput {
        private Integer maHangVe;
        private Integer soLuongCho;
        private Double giaCoBan;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransitAirportInput {
        private Integer maSanBayTG;
        private Integer thoiGianDung; // Phút
        private Integer thuTuDung;
        private String ghiChu;
    }
}
