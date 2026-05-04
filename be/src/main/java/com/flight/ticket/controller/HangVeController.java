package com.flight.ticket.controller;

import com.flight.ticket.model.HangVe;
import com.flight.ticket.repository.HangVeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.flight.ticket.repository.FlightDetailRepository;
import com.flight.ticket.repository.CT_DatVeRepository;

@RestController
@RequestMapping("/api/hangve")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class HangVeController {
    private final HangVeRepository hangVeRepository;
    private final FlightDetailRepository flightDetailRepository;
    private final CT_DatVeRepository ctDatVeRepository;
    private final com.flight.ticket.service.QuyDinhService quyDinhService;

    @GetMapping
    public List<HangVe> getAll() {
        return hangVeRepository.findAll();
    }

    @PostMapping
    public HangVe create(@RequestBody HangVe hv) {
        // QĐ2: Kiểm tra số lượng hạng vé tối đa
        long currentCount = hangVeRepository.count();
        com.flight.ticket.model.QuyDinh qd = quyDinhService.getQuyDinh();
        if (currentCount >= qd.getSoLuongHangVe()) {
            throw new RuntimeException("Số lượng hạng vé đã đạt giới hạn tối đa là " + qd.getSoLuongHangVe());
        }
        return hangVeRepository.save(hv);
    }

    @PutMapping("/{id}")
    public HangVe update(@PathVariable Integer id, @RequestBody HangVe hv) {
        hv.setMaHangVe(id);
        return hangVeRepository.save(hv);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            boolean isUsedInFlights = flightDetailRepository.existsByHangVe_MaHangVe(id);
            boolean isUsedInBookings = ctDatVeRepository.existsByMaHangVe_MaHangVe(id);

            if (isUsedInFlights || isUsedInBookings) {
                return ResponseEntity.badRequest().body("Không thể xóa hạng vé này vì đang được sử dụng trong các chuyến bay hoặc đơn đặt vé.");
            }

            hangVeRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi xóa hạng vé: " + e.getMessage());
        }
    }
}
