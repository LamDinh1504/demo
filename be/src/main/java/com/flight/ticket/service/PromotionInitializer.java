package com.flight.ticket.service;

import com.flight.ticket.model.KhuyenMai;
import com.flight.ticket.repository.KhuyenMaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

//@Component
public class PromotionInitializer implements CommandLineRunner {

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    @Override
    public void run(String... args) throws Exception {
        if (khuyenMaiRepository.count() == 0) {
            khuyenMaiRepository.save(KhuyenMai.builder()
                    .code("FLY2024")
                    .tenChuongTrinh("Chào Hè Rực Rỡ")
                    .moTaTenChuongTrinh("Giảm ngay 10% khi đặt vé máy bay trên toàn hệ thống.")
                    .phanTramGiam(new BigDecimal("10.0"))
                    .soTienGiamToiDa(new BigDecimal("500000"))
                    .ngayBatDau(LocalDate.now().minusDays(5))
                    .ngayKetThuc(LocalDate.now().plusMonths(2))
                    .soLuongConLai(100)
                    .urlImage("https://images.unsplash.com/photo-1436491865332-7a61a109c05d?q=80&w=2070&auto=format&fit=crop")
                    .build());

            khuyenMaiRepository.save(KhuyenMai.builder()
                    .code("FIRSTFLY")
                    .tenChuongTrinh("Đặt Vé Lần Đầu")
                    .moTaTenChuongTrinh("Giảm ngay 20% cho khách hàng mới lần đầu sử dụng ứng dụng.")
                    .phanTramGiam(new BigDecimal("20.0"))
                    .soTienGiamToiDa(new BigDecimal("200000"))
                    .ngayBatDau(LocalDate.now().minusDays(10))
                    .ngayKetThuc(LocalDate.now().plusYears(1))
                    .soLuongConLai(500)
                    .urlImage("https://images.unsplash.com/photo-1520437358207-353ba497400d?q=80&w=2070&auto=format&fit=crop")
                    .build());

            khuyenMaiRepository.save(KhuyenMai.builder()
                    .code("LUNARNEWYEAR")
                    .tenChuongTrinh("Tết Đoàn Viên")
                    .moTaTenChuongTrinh("Ưu đãi đặc biệt cho các chuyến bay về quê hương nhân dịp Tết Nguyên Đán.")
                    .phanTramGiam(new BigDecimal("15.0"))
                    .soTienGiamToiDa(new BigDecimal("300000"))
                    .ngayBatDau(LocalDate.now().plusMonths(3))
                    .ngayKetThuc(LocalDate.now().plusMonths(4))
                    .soLuongConLai(200)
                    .urlImage("https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=2070&auto=format&fit=crop")
                    .build());

            System.out.println("Sample promotions created successfully");
        }
    }
}
