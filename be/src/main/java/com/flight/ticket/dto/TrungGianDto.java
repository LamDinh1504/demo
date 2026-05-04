package com.flight.ticket.dto;

import com.flight.ticket.model.SanBay;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrungGianDto {
    private SanBay maSanBayTG;
    private int thoiGianDung;
    private int thuTuDung;
    private String ghiChu;
}
