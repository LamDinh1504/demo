package com.flight.ticket.repository;

import com.flight.ticket.model.CT_DatVe;
import com.flight.ticket.model.DatVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface CT_DatVeRepository extends JpaRepository<CT_DatVe, Integer> {

    @Query("SELECT c.soGhe FROM CT_DatVe c WHERE c.maChuyenBay.maChuyenBay = :maChuyenBay AND c.soGhe IS NOT NULL AND c.maDatVe.trangThai <> :status")
    List<String> findBookedSeatsByMaChuyenBay(@Param("maChuyenBay") Integer maChuyenBay,
            @Param("status") String status);

    List<CT_DatVe> findByMaDatVe(DatVe maDatVe);
    boolean existsByMaHangVe_MaHangVe(Integer maHangVe);
}
