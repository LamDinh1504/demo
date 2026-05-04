package com.flight.ticket.service;

import com.flight.ticket.dto.FlightDto;
import com.flight.ticket.model.CT_ChuyenBay;
import com.flight.ticket.model.ChuyenBay;
import com.flight.ticket.repository.FlightDetailRepository;
import com.flight.ticket.repository.FlightRepository;
import com.flight.ticket.repository.CT_DatVeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FlightDetailRepository ctChuyenBayRepository;

    @Autowired
    private CT_DatVeRepository ctDatVeRepository;

    @Autowired
    private com.flight.ticket.repository.TrungGianRepository trungGianRepository;

    @Autowired
    private QuyDinhService quyDinhService;

    public FlightDto mapToDto(ChuyenBay cb) {
        FlightDto dto = FlightDto.builder()
                .maChuyenBay(cb.getMaChuyenBay())
                .maHangHK(cb.getMaHangHK())
                .maMayBay(cb.getMaMayBay())
                .maSanBayDi(cb.getMaSanBayDi())
                .maSanBayDen(cb.getMaSanBayDen())
                .ngayGioKhoiHanh(cb.getNgayGioKhoiHanh())
                .ngayGioHaCanh(cb.getNgayGioHaCanh())
                .thoiGianBay(cb.getThoiGianBay())
                .trangThai(cb.getTrangThai())
                .isDirect(cb.getDanhSachTrungGian() == null || cb.getDanhSachTrungGian().isEmpty())
                .build();

        List<CT_ChuyenBay> ctList = ctChuyenBayRepository.findByChuyenBay(cb);

        int totalSoLuongCho = 0;
        int totalSoLuongChoConLai = 0;
        java.util.List<com.flight.ticket.dto.FlightClassDetailDto> classDetails = new java.util.ArrayList<>();

        if (ctList != null && !ctList.isEmpty()) {
            for (CT_ChuyenBay ct : ctList) {
                if (ct.getHangVe() == null)
                    continue;

                totalSoLuongCho += ct.getSoLuongCho();
                totalSoLuongChoConLai += ct.getSoLuongConLai();

                double basePrice = ct.getGiaCoBan();
                double heSo = (ct.getHangVe().getHeSoGia() != null)
                        ? ct.getHangVe().getHeSoGia().doubleValue()
                        : 1.0;

                double finalPrice = basePrice * heSo;

                com.flight.ticket.dto.FlightClassDetailDto classDetail = com.flight.ticket.dto.FlightClassDetailDto
                        .builder()
                        .maHangVe(ct.getHangVe().getMaHangVe())
                        .tenHangVe(ct.getHangVe().getTenHangVe())
                        .gia(finalPrice)
                        .soLuongCho(ct.getSoLuongCho())
                        .soLuongChoConLai(ct.getSoLuongConLai())
                        .build();
                classDetails.add(classDetail);
            }

            dto.setChiTietHangVe(classDetails);

            // Gán số lượng chỗ vào DTO
            dto.setSoLuongCho(totalSoLuongCho);
            dto.setSoLuongChoConLai(totalSoLuongChoConLai);

            // Gán giá hiển thị mặc định (giá rẻ nhất)
            if (!classDetails.isEmpty()) {
                double minPrice = classDetails.stream()
                        .mapToDouble(com.flight.ticket.dto.FlightClassDetailDto::getGia)
                        .min().orElse(0.0);
                dto.setGiaCoBan(minPrice);
            }
        }

        // Map intermediate stops
        List<com.flight.ticket.dto.TrungGianDto> tgDtoList = new java.util.ArrayList<>();
        if (cb.getDanhSachTrungGian() != null) {
            tgDtoList = cb.getDanhSachTrungGian().stream()
                    .map(tg -> com.flight.ticket.dto.TrungGianDto.builder()
                            .maSanBayTG(tg.getMaSanBayTG())
                            .thoiGianDung(tg.getThoiGianDung())
                            .thuTuDung(tg.getThuTuDung())
                            .ghiChu(tg.getGhiChu())
                            .build())
                    .collect(Collectors.toList());
        }
        dto.setDanhSachTrungGian(tgDtoList);

        return dto;
    }

    public List<FlightDto> getAllFlights() {
        return flightRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<FlightDto> searchFlights(String diemDi, String diemDen, LocalDate ngayDi, Boolean isDirect,
            Integer airlineId) {
        List<ChuyenBay> list;
        if (diemDi != null && diemDen != null && ngayDi != null) {
            LocalDateTime startOfDay = ngayDi.atStartOfDay();
            LocalDateTime endOfDay = ngayDi.atTime(23, 59, 59);
            list = flightRepository.findByMaSanBayDi_ThanhPhoAndMaSanBayDen_ThanhPhoAndNgayGioKhoiHanhBetween(
                    diemDi, diemDen, startOfDay, endOfDay);
        } else {
            list = flightRepository.findAll();
        }

        return list.stream()
                .map(this::mapToDto)
                .filter(dto -> isDirect == null || dto.isDirect() == isDirect)
                .filter(dto -> airlineId == null
                        || (dto.getMaHangHK() != null && dto.getMaHangHK().getMaHangHK() == airlineId))
                .collect(Collectors.toList());
    }

    public ChuyenBay createFlight(ChuyenBay chuyenBay) {
        return flightRepository.save(chuyenBay);
    }

    public ChuyenBay updateFlight(Integer id, ChuyenBay flightDetails) {
        ChuyenBay flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ChuyenBay not found for this id :: " + id));

        flight.setMaHangHK(flightDetails.getMaHangHK());
        flight.setMaMayBay(flightDetails.getMaMayBay());
        flight.setMaSanBayDi(flightDetails.getMaSanBayDi());
        flight.setMaSanBayDen(flightDetails.getMaSanBayDen());
        flight.setNgayGioKhoiHanh(flightDetails.getNgayGioKhoiHanh());
        flight.setNgayGioHaCanh(flightDetails.getNgayGioHaCanh());
        flight.setThoiGianBay(flightDetails.getThoiGianBay());
        flight.setTrangThai(flightDetails.getTrangThai());

        return flightRepository.save(flight);
    }

    @Transactional
    public ChuyenBay createFlightComplex(com.flight.ticket.dto.CreateFlightDto dto) {
        // 0. Validate with Regulations
        com.flight.ticket.model.QuyDinh qd = quyDinhService.getQuyDinh();

        // QĐ1: Thơi gian bay tối thiểu
        if (dto.getThoiGianBay() < qd.getThoiGianBayToiThieu()) {
            throw new RuntimeException("Thời gian bay phải tối thiểu " + qd.getThoiGianBayToiThieu() + " phút.");
        }

        // QĐ1: Số sân bay trung gian tối đa
        int numTransit = (dto.getSanBayTrungGian() != null) ? dto.getSanBayTrungGian().size() : 0;
        if (numTransit > qd.getSoSanBayTrungGianToiDa()) {
            throw new RuntimeException("Số sân bay trung gian tối đa là " + qd.getSoSanBayTrungGianToiDa());
        }

        // QĐ1: Thời gian dừng tối thiểu/tối đa
        if (dto.getSanBayTrungGian() != null) {
            for (com.flight.ticket.dto.CreateFlightDto.TransitAirportInput ti : dto.getSanBayTrungGian()) {
                if (ti.getThoiGianDung() < qd.getThoiGianDungToiThieu()) {
                    throw new RuntimeException("Thời gian dừng tại sân bay trung gian phải tối thiểu " + qd.getThoiGianDungToiThieu() + " phút.");
                }
                if (ti.getThoiGianDung() > qd.getThoiGianDungToiDa()) {
                    throw new RuntimeException("Thời gian dừng tại sân bay trung gian không được quá " + qd.getThoiGianDungToiDa() + " phút.");
                }
            }
        }

        // 1. Map and save ChuyenBay
        ChuyenBay cb = ChuyenBay.builder()
                .maHangHK(com.flight.ticket.model.HangHangKhong.builder().maHangHK(dto.getMaHangHK()).build())
                .maMayBay(com.flight.ticket.model.MayBay.builder().maMayBay(dto.getMaMayBay()).build())
                .maSanBayDi(com.flight.ticket.model.SanBay.builder().maSanBay(dto.getMaSanBayDi()).build())
                .maSanBayDen(com.flight.ticket.model.SanBay.builder().maSanBay(dto.getMaSanBayDen()).build())
                .ngayGioKhoiHanh(LocalDateTime.parse(dto.getNgayGioKhoiHanh()))
                .ngayGioHaCanh(LocalDateTime.parse(dto.getNgayGioHaCanh()))
                .thoiGianBay(dto.getThoiGianBay())
                .trangThai(dto.getTrangThai())
                .build();

        cb = flightRepository.save(cb);

        // 2. Save class details (CT_ChuyenBay)
        if (dto.getChiTietHangVe() != null) {
            for (com.flight.ticket.dto.CreateFlightDto.FlightClassInput ci : dto.getChiTietHangVe()) {
                CT_ChuyenBay ct = CT_ChuyenBay.builder()
                        .id(new CT_ChuyenBay.CT_ChuyenBayId(cb.getMaChuyenBay(), ci.getMaHangVe()))
                        .chuyenBay(cb)
                        .hangVe(com.flight.ticket.model.HangVe.builder().maHangVe(ci.getMaHangVe()).build())
                        .soLuongCho(ci.getSoLuongCho())
                        .soLuongConLai(ci.getSoLuongCho())
                        .giaCoBan(ci.getGiaCoBan())
                        .build();
                ctChuyenBayRepository.save(ct);
            }
        }

        // 3. Save intermediate stops (TrungGian)
        if (dto.getSanBayTrungGian() != null) {
            for (com.flight.ticket.dto.CreateFlightDto.TransitAirportInput ti : dto.getSanBayTrungGian()) {
                com.flight.ticket.model.TrungGian tg = com.flight.ticket.model.TrungGian.builder()
                        .id(new com.flight.ticket.model.TrungGian.TrungGianId(cb.getMaChuyenBay(), ti.getMaSanBayTG()))
                        .maChuyenBay(cb)
                        .maSanBayTG(com.flight.ticket.model.SanBay.builder().maSanBay(ti.getMaSanBayTG()).build())
                        .thoiGianDung(ti.getThoiGianDung())
                        .thuTuDung(ti.getThuTuDung())
                        .ghiChu(ti.getGhiChu())
                        .build();
                trungGianRepository.save(tg);
            }
        }

        return cb;
    }

    @Transactional
    public ChuyenBay updateFlightComplex(Integer id, com.flight.ticket.dto.CreateFlightDto dto) {
        ChuyenBay cb = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ChuyenBay not found"));

        // 0. Validate with Regulations
        com.flight.ticket.model.QuyDinh qd = quyDinhService.getQuyDinh();

        // QĐ1: Thơi gian bay tối thiểu
        if (dto.getThoiGianBay() < qd.getThoiGianBayToiThieu()) {
            throw new RuntimeException("Thời gian bay phải tối thiểu " + qd.getThoiGianBayToiThieu() + " phút.");
        }

        // QĐ1: Số sân bay trung gian tối đa
        int numTransit = (dto.getSanBayTrungGian() != null) ? dto.getSanBayTrungGian().size() : 0;
        if (numTransit > qd.getSoSanBayTrungGianToiDa()) {
            throw new RuntimeException("Số sân bay trung gian tối đa là " + qd.getSoSanBayTrungGianToiDa());
        }

        // QĐ1: Thời gian dừng tối thiểu/tối đa
        if (dto.getSanBayTrungGian() != null) {
            for (com.flight.ticket.dto.CreateFlightDto.TransitAirportInput ti : dto.getSanBayTrungGian()) {
                if (ti.getThoiGianDung() < qd.getThoiGianDungToiThieu()) {
                    throw new RuntimeException("Thời gian dừng tại sân bay trung gian phải tối thiểu " + qd.getThoiGianDungToiThieu() + " phút.");
                }
                if (ti.getThoiGianDung() > qd.getThoiGianDungToiDa()) {
                    throw new RuntimeException("Thời gian dừng tại sân bay trung gian không được quá " + qd.getThoiGianDungToiDa() + " phút.");
                }
            }
        }

        // Update basic info
        cb.setMaHangHK(com.flight.ticket.model.HangHangKhong.builder().maHangHK(dto.getMaHangHK()).build());
        cb.setMaMayBay(com.flight.ticket.model.MayBay.builder().maMayBay(dto.getMaMayBay()).build());
        cb.setMaSanBayDi(com.flight.ticket.model.SanBay.builder().maSanBay(dto.getMaSanBayDi()).build());
        cb.setMaSanBayDen(com.flight.ticket.model.SanBay.builder().maSanBay(dto.getMaSanBayDen()).build());
        cb.setNgayGioKhoiHanh(LocalDateTime.parse(dto.getNgayGioKhoiHanh()));
        cb.setNgayGioHaCanh(LocalDateTime.parse(dto.getNgayGioHaCanh()));
        cb.setThoiGianBay(dto.getThoiGianBay());
        cb.setTrangThai(dto.getTrangThai());

        // Update intermediate stops (Re-save)
        trungGianRepository.deleteByMaChuyenBay(cb);
        if (dto.getSanBayTrungGian() != null) {
            for (com.flight.ticket.dto.CreateFlightDto.TransitAirportInput ti : dto.getSanBayTrungGian()) {
                com.flight.ticket.model.TrungGian tg = com.flight.ticket.model.TrungGian.builder()
                        .id(new com.flight.ticket.model.TrungGian.TrungGianId(cb.getMaChuyenBay(), ti.getMaSanBayTG()))
                        .maChuyenBay(cb)
                        .maSanBayTG(com.flight.ticket.model.SanBay.builder().maSanBay(ti.getMaSanBayTG()).build())
                        .thoiGianDung(ti.getThoiGianDung())
                        .thuTuDung(ti.getThuTuDung())
                        .ghiChu(ti.getGhiChu())
                        .build();
                trungGianRepository.save(tg);
            }
        }

        // Update ticket classes (Re-save)
        ctChuyenBayRepository.deleteByChuyenBay(cb);
        if (dto.getChiTietHangVe() != null) {
            for (com.flight.ticket.dto.CreateFlightDto.FlightClassInput ci : dto.getChiTietHangVe()) {
                CT_ChuyenBay ct = CT_ChuyenBay.builder()
                        .id(new CT_ChuyenBay.CT_ChuyenBayId(cb.getMaChuyenBay(), ci.getMaHangVe()))
                        .chuyenBay(cb)
                        .hangVe(com.flight.ticket.model.HangVe.builder().maHangVe(ci.getMaHangVe()).build())
                        .soLuongCho(ci.getSoLuongCho())
                        .soLuongConLai(ci.getSoLuongCho())
                        .giaCoBan(ci.getGiaCoBan())
                        .build();
                ctChuyenBayRepository.save(ct);
            }
        }

        return flightRepository.save(cb);
    }

    public void deleteFlight(Integer id) {
        ChuyenBay flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ChuyenBay not found for this id :: " + id));
        flightRepository.delete(flight);
    }

    public Optional<ChuyenBay> getFlightById(Integer id) {
        return flightRepository.findById(id);
    }

    public List<String> getBookedSeats(Integer flightId) {
        return ctDatVeRepository.findBookedSeatsByMaChuyenBay(flightId, "Đã hủy");
    }
}