package com.flight.ticket.service;

import com.flight.ticket.dto.KhuyenMaiDto;
import com.flight.ticket.model.KhuyenMai;
import com.flight.ticket.repository.KhuyenMaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KhuyenMaiService {
    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    public List<KhuyenMaiDto> getActivePromotions() {
        LocalDate now = LocalDate.now();
        List<KhuyenMai> promotions = khuyenMaiRepository.findByNgayKetThucAfter(now);
        return promotions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<KhuyenMaiDto> getAllPromotions() {
        return khuyenMaiRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private KhuyenMaiDto mapToDto(KhuyenMai km) {
        return KhuyenMaiDto.builder()
                .maKhuyenMai(km.getMaKhuyenMai())
                .code(km.getCode())
                .tenChuongTrinh(km.getTenChuongTrinh())
                .moTaTenChuongTrinh(km.getMoTaTenChuongTrinh())
                .phanTramGiam(km.getPhanTramGiam())
                .soTienGiamToiDa(km.getSoTienGiamToiDa())
                .ngayBatDau(km.getNgayBatDau())
                .ngayKetThuc(km.getNgayKetThuc())
                .soLuongConLai(km.getSoLuongConLai())
                .urlImage(km.getUrlImage())
                .build();
    }
}
