package com.flight.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinResponseDto {
    private FlightInfoDto flight;
    private List<PassengerInfoDto> passengers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightInfoDto {
        private String maChuyenBay;
        private LocalDateTime ngayGioKhoiHanh;
        private AirportDto maSanBayDi;
        private AirportDto maSanBayDen;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AirportDto {
        private String maIATA;
        private String thanhPho;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerInfoDto {
        private int maVe;
        private String hoTenHK;
        private String cccd;
        private String doiTuong;
        private String soGhe;
        private String trangThai;
    }
}
