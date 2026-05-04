package com.flight.ticket.repository;

import com.flight.ticket.model.DatVe;
import com.flight.ticket.model.NguoiDung;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DatVeRepository extends JpaRepository<DatVe, Integer> {
    List<DatVe> findByMaNguoiDung(NguoiDung maNguoiDung);
    java.util.Optional<DatVe> findByMaDatCho(String maDatCho);
    List<DatVe> findByTrangThaiAndNgayDatVeBefore(String trangThai, java.time.LocalDateTime dateTime);

    // Đếm số đơn theo tháng/năm
    @Query("SELECT COUNT(d) FROM DatVe d WHERE YEAR(d.ngayDatVe) = :year AND MONTH(d.ngayDatVe) = :month")
    long countByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Đếm số đơn SUCCESS theo tháng/năm
    @Query("SELECT COUNT(d) FROM DatVe d WHERE YEAR(d.ngayDatVe) = :year AND MONTH(d.ngayDatVe) = :month AND d.trangThai = 'SUCCESS'")
    long countSuccessByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Tổng doanh thu theo tháng/năm (chỉ tính đơn SUCCESS)
    @Query("SELECT COALESCE(SUM(d.tongTien), 0) FROM DatVe d WHERE YEAR(d.ngayDatVe) = :year AND MONTH(d.ngayDatVe) = :month AND d.trangThai = 'SUCCESS'")
    java.math.BigDecimal sumRevenueByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Lấy danh sách năm có dữ liệu
    @Query("SELECT DISTINCT YEAR(d.ngayDatVe) FROM DatVe d ORDER BY YEAR(d.ngayDatVe) DESC")
    List<Integer> findDistinctYears();
}
