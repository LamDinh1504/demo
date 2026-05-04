package com.flight.ticket.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "QUYDINH")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuyDinh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // QĐ1
    private Integer soLuongSanBay;
    private Integer thoiGianBayToiThieu;
    private Integer soSanBayTrungGianToiDa;
    private Integer thoiGianDungToiThieu;
    private Integer thoiGianDungToiDa;

    // QĐ2
    private Integer soLuongHangVe;

    // QĐ3
    private Integer thoiGianChamNhatKhiDatVe;
    private Integer thoiGianHuyDatVe;
}
