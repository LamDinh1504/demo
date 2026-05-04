package com.flight.ticket.service;

import com.flight.ticket.dto.AirportDto;
import com.flight.ticket.model.SanBay;
import com.flight.ticket.repository.AirportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AirportService {

    @Autowired
    private AirportRepository airportRepository;

    @Autowired
    private QuyDinhService quyDinhService;

    public List<AirportDto> getAllAirports() {
        List<SanBay> sanbay = airportRepository.findAll();
        return sanbay.stream().map(airport -> AirportDto.builder()
                .maSanBay(airport.getMaSanBay())
                .maIATA(airport.getMaIATA())
                .tenSanBay(airport.getTenSanBay())
                .thanhPho(airport.getThanhPho())
                .quocGia(airport.getQuocGia())
                .build()
        ).toList();
    }
    public AirportDto addAirport(AirportDto airportDto) {
        // QĐ1: Kiểm tra số lượng sân bay tối đa
        long currentCount = airportRepository.count();
        com.flight.ticket.model.QuyDinh qd = quyDinhService.getQuyDinh();
        if (currentCount >= qd.getSoLuongSanBay()) {
            throw new RuntimeException("Số lượng sân bay đã đạt giới hạn tối đa là " + qd.getSoLuongSanBay());
        }

        SanBay airport = SanBay.builder()
                .maIATA(airportDto.getMaIATA())
                .tenSanBay(airportDto.getTenSanBay())
                .thanhPho(airportDto.getThanhPho())
                .quocGia(airportDto.getQuocGia())
                .build();
        airport = airportRepository.save(airport);
        return convertToDto(airport);
    }

    public AirportDto updateAirport(int id, AirportDto airportDto) {
        SanBay airport = airportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Airport not found"));
        airport.setMaIATA(airportDto.getMaIATA());
        airport.setTenSanBay(airportDto.getTenSanBay());
        airport.setThanhPho(airportDto.getThanhPho());
        airport.setQuocGia(airportDto.getQuocGia());
        airport = airportRepository.save(airport);
        return convertToDto(airport);
    }

    public void deleteAirport(int id) {
        airportRepository.deleteById(id);
    }

    private AirportDto convertToDto(SanBay airport) {
        return AirportDto.builder()
                .maSanBay(airport.getMaSanBay())
                .maIATA(airport.getMaIATA())
                .tenSanBay(airport.getTenSanBay())
                .thanhPho(airport.getThanhPho())
                .quocGia(airport.getQuocGia())
                .build();
    }
}
