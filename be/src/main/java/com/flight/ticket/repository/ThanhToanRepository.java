package com.flight.ticket.repository;

import com.flight.ticket.model.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Integer> {
    java.util.Optional<ThanhToan> findByMaDatVe(com.flight.ticket.model.DatVe maDatVe);

    // Tổng SoTien theo tháng/năm (tất cả trạng thái)
    @Query(value = "SELECT COALESCE(SUM(SoTien), 0) FROM THANHTOAN " +
                   "WHERE YEAR(ThoiGianThanhToan) = :year AND MONTH(ThoiGianThanhToan) = :month",
           nativeQuery = true)
    BigDecimal sumByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Số giao dịch theo tháng/năm
    @Query(value = "SELECT COUNT(*) FROM THANHTOAN " +
                   "WHERE YEAR(ThoiGianThanhToan) = :year AND MONTH(ThoiGianThanhToan) = :month",
           nativeQuery = true)
    long countByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Số giao dịch SUCCESS theo tháng/năm
    @Query(value = "SELECT COUNT(*) FROM THANHTOAN " +
                   "WHERE YEAR(ThoiGianThanhToan) = :year AND MONTH(ThoiGianThanhToan) = :month " +
                   "AND TrangThai = 'SUCCESS'",
           nativeQuery = true)
    long countSuccessByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Số giao dịch PENDING theo tháng/năm
    @Query(value = "SELECT COUNT(*) FROM THANHTOAN " +
                   "WHERE YEAR(ThoiGianThanhToan) = :year AND MONTH(ThoiGianThanhToan) = :month " +
                   "AND TrangThai = 'PENDING'",
           nativeQuery = true)
    long countPendingByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Doanh thu theo từng phương thức thanh toán trong năm
    @Query(value = "SELECT p.TenPTTT, COALESCE(SUM(t.SoTien), 0) " +
                   "FROM THANHTOAN t JOIN PHUONGTHUCTHANHTOAN p ON t.MaPTTT = p.MaPTTT " +
                   "WHERE YEAR(t.ThoiGianThanhToan) = :year " +
                   "GROUP BY p.TenPTTT",
           nativeQuery = true)
    List<Object[]> revenueByPaymentMethod(@Param("year") int year);

    // Các năm có giao dịch
    @Query(value = "SELECT DISTINCT YEAR(ThoiGianThanhToan) FROM THANHTOAN ORDER BY 1 DESC",
           nativeQuery = true)
    List<Integer> findDistinctYears();
}
