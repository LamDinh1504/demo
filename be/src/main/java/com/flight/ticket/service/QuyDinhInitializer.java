package com.flight.ticket.service;

import com.flight.ticket.model.QuyDinh;
import com.flight.ticket.repository.QuyDinhRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class QuyDinhInitializer implements CommandLineRunner {

    @Autowired
    private QuyDinhRepository quyDinhRepository;

    @Override
    public void run(String... args) throws Exception {
        if (quyDinhRepository.count() == 0) {
            quyDinhRepository.save(QuyDinh.builder()
                    .soLuongSanBay(20)
                    .thoiGianBayToiThieu(30)
                    .soSanBayTrungGianToiDa(2)
                    .thoiGianDungToiThieu(30)
                    .thoiGianDungToiDa(60)
                    .soLuongHangVe(5)
                    .thoiGianChamNhatKhiDatVe(24)
                    .thoiGianHuyDatVe(24)
                    .build());

            System.out.println("Default system regulations (QĐ1, QĐ2, QĐ3) created successfully.");
        }
    }
}
