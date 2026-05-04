package com.flight.ticket.service;

import com.flight.ticket.dto.RevenueDto;
import com.flight.ticket.repository.ThanhToanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RevenueService {

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    /**
     * Lấy doanh thu theo từng tháng trong 1 năm (từ bảng THANHTOAN)
     */
    public RevenueDto.YearlyRevenue getRevenueByYear(int year) {
        List<RevenueDto> monthlyList = new ArrayList<>();
        BigDecimal tongDoanhThu = BigDecimal.ZERO;
        long tongGiaoDich = 0;
        long tongSuccess = 0;

        for (int month = 1; month <= 12; month++) {
            BigDecimal doanhThu = thanhToanRepository.sumByYearAndMonth(year, month);
            long soGiaoDich = thanhToanRepository.countByYearAndMonth(year, month);
            long soSuccess = thanhToanRepository.countSuccessByYearAndMonth(year, month);
            long soPending = thanhToanRepository.countPendingByYearAndMonth(year, month);

            RevenueDto dto = RevenueDto.builder()
                    .year(year)
                    .month(month)
                    .doanhThu(doanhThu != null ? doanhThu : BigDecimal.ZERO)
                    .soGiaoDich(soGiaoDich)
                    .soGiaoDichSuccess(soSuccess)
                    .soGiaoDichPending(soPending)
                    .build();

            monthlyList.add(dto);
            tongDoanhThu = tongDoanhThu.add(doanhThu != null ? doanhThu : BigDecimal.ZERO);
            tongGiaoDich += soGiaoDich;
            tongSuccess += soSuccess;
        }

        // Doanh thu theo phương thức thanh toán
        Map<String, BigDecimal> theoHinhThuc = new LinkedHashMap<>();
        try {
            List<Object[]> rows = thanhToanRepository.revenueByPaymentMethod(year);
            for (Object[] row : rows) {
                String tenPTTT = row[0] != null ? row[0].toString() : "Khác";
                BigDecimal soTien = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
                theoHinhThuc.put(tenPTTT, soTien);
            }
        } catch (Exception e) {
            System.err.println("[RevenueService] Error fetching payment method breakdown: " + e.getMessage());
        }

        return RevenueDto.YearlyRevenue.builder()
                .year(year)
                .tongDoanhThu(tongDoanhThu)
                .tongGiaoDich(tongGiaoDich)
                .tongGiaoDichSuccess(tongSuccess)
                .theoThang(monthlyList)
                .theoHinhThucThanhToan(theoHinhThuc)
                .build();
    }

    /**
     * Lấy danh sách các năm có dữ liệu
     */
    public List<Integer> getAvailableYears() {
        List<Integer> years = new ArrayList<>(thanhToanRepository.findDistinctYears());
        int currentYear = LocalDate.now().getYear();
        if (!years.contains(currentYear)) {
            years.add(0, currentYear);
        }
        return years;
    }
}
