package com.flight.ticket.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDto {
    private String hoTen;
    private String email;
    private String sdt;
    private String diaChi;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String cccd;
    private String role;
    private String password;
}
