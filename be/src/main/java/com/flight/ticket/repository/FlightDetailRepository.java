package com.flight.ticket.repository;

import com.flight.ticket.model.CT_ChuyenBay;
import com.flight.ticket.model.ChuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlightDetailRepository extends JpaRepository<CT_ChuyenBay, CT_ChuyenBay.CT_ChuyenBayId> {
    List<CT_ChuyenBay> findByChuyenBay(ChuyenBay chuyenBay);
    void deleteByChuyenBay(ChuyenBay chuyenBay);
    boolean existsByHangVe_MaHangVe(Integer maHangVe);
}
