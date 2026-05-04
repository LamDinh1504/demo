package com.flight.ticket.repository;

import com.flight.ticket.model.ChuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<ChuyenBay, Integer> {
    List<ChuyenBay> findByMaSanBayDi_ThanhPhoAndMaSanBayDen_ThanhPho(String diemDi, String diemDen);
    List<ChuyenBay> findByMaSanBayDi_ThanhPho(String diemDi);
    List<ChuyenBay> findByMaSanBayDen_ThanhPho(String diemDen);
    List<ChuyenBay> findByMaSanBayDi_ThanhPhoAndMaSanBayDen_ThanhPhoAndNgayGioKhoiHanhBetween(
            String diemDi,
            String diemDen,
            LocalDateTime startOfDay,
            LocalDateTime endOfDay
    );
}
