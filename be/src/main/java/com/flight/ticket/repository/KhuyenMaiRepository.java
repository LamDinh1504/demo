package com.flight.ticket.repository;

import com.flight.ticket.model.KhuyenMai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KhuyenMaiRepository extends JpaRepository<KhuyenMai, Integer> {
    List<KhuyenMai> findByNgayKetThucAfter(LocalDate date);
    java.util.Optional<KhuyenMai> findByCode(String code);
}
