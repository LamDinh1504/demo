package com.flight.ticket.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.flight.ticket.model.HangHangKhong;
import com.flight.ticket.model.HangVe;
import com.flight.ticket.model.MayBay;
import com.flight.ticket.model.SanBay;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightDto {
    private int maChuyenBay;
    private HangHangKhong maHangHK;
    private MayBay maMayBay;
    private SanBay maSanBayDi;
    private SanBay maSanBayDen;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime ngayGioKhoiHanh;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime ngayGioHaCanh;

    private int thoiGianBay;
    private String trangThai;
    private Double giaCoBan;
    private boolean isDirect;
    
    // Dynamic list of ticket classes
    private java.util.List<FlightClassDetailDto> chiTietHangVe;

    // List of intermediate stops
    private java.util.List<TrungGianDto> danhSachTrungGian;

    private int soLuongCho;
    private int soLuongChoConLai;
}
