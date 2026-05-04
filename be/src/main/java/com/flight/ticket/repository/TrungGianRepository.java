package com.flight.ticket.repository;

import com.flight.ticket.model.TrungGian;
import com.flight.ticket.model.ChuyenBay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrungGianRepository extends JpaRepository<TrungGian, TrungGian.TrungGianId> {
    List<TrungGian> findByMaChuyenBay(ChuyenBay chuyenBay);
    void deleteByMaChuyenBay(ChuyenBay chuyenBay);
    int countByMaChuyenBay(ChuyenBay chuyenBay);
}
