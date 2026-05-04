package com.flight.ticket.controller;

import com.flight.ticket.dto.RevenueDto;
import com.flight.ticket.service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/revenue")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RevenueController {

    @Autowired
    private RevenueService revenueService;

    /**
     * GET /api/revenue?year=2026
     * Trả về doanh thu theo tháng trong năm chỉ định
     */
    @GetMapping
    public ResponseEntity<RevenueDto.YearlyRevenue> getRevenue(@RequestParam(defaultValue = "0") int year) {
        if (year <= 0) {
            year = java.time.LocalDate.now().getYear();
        }
        return ResponseEntity.ok(revenueService.getRevenueByYear(year));
    }

    /**
     * GET /api/revenue/years
     * Trả về danh sách các năm có dữ liệu đặt vé
     */
    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        return ResponseEntity.ok(revenueService.getAvailableYears());
    }
}
