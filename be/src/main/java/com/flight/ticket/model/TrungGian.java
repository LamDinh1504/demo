package com.flight.ticket.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TRUNGGIAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrungGian {
    @EmbeddedId
    private TrungGianId id;

    @ManyToOne
    @MapsId("maChuyenBay")
    @JoinColumn(name = "MaChuyenBay")
    private ChuyenBay maChuyenBay;

    @ManyToOne
    @MapsId("maSanBayTG")
    @JoinColumn(name = "MaSanBayTG")
    private SanBay maSanBayTG;

    @Column(name = "ThoiGianDung")
    private int thoiGianDung;

    @Column(name = "ThuTuDung")
    private int thuTuDung;

    @Column(name = "GhiChu", length = 255)
    private String ghiChu;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrungGianId implements Serializable {
        @Column(name = "MaChuyenBay")
        private int maChuyenBay;

        @Column(name = "MaSanBayTG")
        private int maSanBayTG;
    }
}

