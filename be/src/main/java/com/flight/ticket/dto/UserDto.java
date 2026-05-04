package com.flight.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private int maNguoiDung;
    private String email;
    private String hoTen;
    private String role;
    private String cccd;
    private String sdt;
    private LocalDate ngaySinh;
    private String diaChi;
    private String gioiTinh;
}
