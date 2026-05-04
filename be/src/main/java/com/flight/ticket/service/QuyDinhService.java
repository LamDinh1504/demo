package com.flight.ticket.service;

import com.flight.ticket.model.QuyDinh;
import com.flight.ticket.repository.QuyDinhRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuyDinhService {
    @Autowired
    private QuyDinhRepository quyDinhRepository;

    public QuyDinh getQuyDinh() {
        return quyDinhRepository.findAll().stream().findFirst()
                .orElse(QuyDinh.builder()
                        .soLuongSanBay(5)
                        .thoiGianBayToiThieu(30)
                        .soSanBayTrungGianToiDa(2)
                        .thoiGianDungToiThieu(20)
                        .thoiGianDungToiDa(60)
                        .soLuongHangVe(4)
                        .thoiGianChamNhatKhiDatVe(24)
                        .thoiGianHuyDatVe(24)
                        .build());
    }

    public QuyDinh updateQuyDinh(QuyDinh newQuyDinh) {
        // Validation logic for updating regulations
        if (newQuyDinh.getThoiGianDungToiThieu() > newQuyDinh.getThoiGianDungToiDa()) {
            throw new RuntimeException("Thời gian dừng tối thiểu không được lớn hơn thời gian dừng tối đa.");
        }
        if (newQuyDinh.getSoLuongSanBay() < 0 || newQuyDinh.getThoiGianBayToiThieu() < 0 || 
            newQuyDinh.getSoSanBayTrungGianToiDa() < 0 || newQuyDinh.getSoLuongHangVe() < 0) {
            throw new RuntimeException("Các giá trị quy định không được là số âm.");
        }

        QuyDinh current = getQuyDinh();
        if (current.getId() != null) {
            newQuyDinh.setId(current.getId());
        }
        return quyDinhRepository.save(newQuyDinh);
    }
}
