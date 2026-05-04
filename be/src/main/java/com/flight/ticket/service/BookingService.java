package com.flight.ticket.service;

import com.flight.ticket.dto.BookingRequestDto;
import com.flight.ticket.dto.PassengerDto;
import com.flight.ticket.model.*;
import com.flight.ticket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.flight.ticket.dto.MyBookingDto;
import com.flight.ticket.dto.CheckinResponseDto;

@Service
public class BookingService {

    @Autowired
    private DatVeRepository datVeRepository;

    @Autowired
    private CT_DatVeRepository ctDatVeRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FlightDetailRepository flightDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KhuyenMaiRepository khuyenMaiRepository;

    @Autowired
    private ThanhToanRepository thanhToanRepository;

    @Autowired
    private PhuongThucThanhToanRepository phuongThucThanhToanRepository;

    @Autowired
    private QuyDinhService quyDinhService;

    // MaPTTT = 4 tương ứng VNPAY trong bảng PHUONGTHUCTHANHTOAN
    private static final int MA_PTTT_VNPAY = 4;
    private static final int MA_PTTT_PAY_LATER = 6;

    @Transactional
    public DatVe bookTicket(BookingRequestDto request) {
        // 1. Generate PNR
        String pnr = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // 2. Fetch User if provided
        NguoiDung nguoiDung = null;
        System.out.println("[DEBUG Booking] maNguoiDung from request: " + request.getMaNguoiDung());
        if (request.getMaNguoiDung() != null) {
            // Check if the user ID type matches (Integer)
            Integer userId = request.getMaNguoiDung();
            nguoiDung = userRepository.findById(userId).orElse(null);
            System.out.println("[DEBUG Booking] Fetched user from repo: "
                    + (nguoiDung != null ? nguoiDung.getHoTen() : "NULL (not found in DB!)"));
        } else {
            System.out.println("[DEBUG Booking] maNguoiDung is NULL, skipping user lookup.");
        }

        // 3. Handle Promotion
        KhuyenMai khuyenMai = null;
        if (request.getMaKhuyenMai() != null && !request.getMaKhuyenMai().isEmpty()) {
            khuyenMai = khuyenMaiRepository.findByCode(request.getMaKhuyenMai())
                    .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không hợp lệ."));

            // Check validity (date and quantity)
            java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
            if (today.isBefore(khuyenMai.getNgayBatDau()) ||
                    today.isAfter(khuyenMai.getNgayKetThuc())) {
                throw new RuntimeException("Mã khuyến mãi đã hết hạn sử dụng.");
            }
            if (khuyenMai.getSoLuongConLai() <= 0) {
                throw new RuntimeException("Mã khuyến mãi đã hết lượt sử dụng.");
            }
        }

        // 4. Calculate Price & Process Passengers
        java.math.BigDecimal totalOriginalPrice = java.math.BigDecimal.ZERO;
        if (request.getPassengers() != null) {
            for (PassengerDto passenger : request.getPassengers()) {
                java.math.BigDecimal pgiaVe = passenger.getGiaVe() != null ? passenger.getGiaVe()
                        : java.math.BigDecimal.ZERO;
                java.math.BigDecimal pgiaHl = passenger.getGiaHanhLy() != null ? passenger.getGiaHanhLy()
                        : java.math.BigDecimal.ZERO;
                java.math.BigDecimal pgiaBh = passenger.getGiaBaoHiem() != null
                        ? java.math.BigDecimal.valueOf(passenger.getGiaBaoHiem())
                        : java.math.BigDecimal.ZERO;

                totalOriginalPrice = totalOriginalPrice.add(pgiaVe).add(pgiaHl).add(pgiaBh);
            }
        }

        // Apply Discount
        java.math.BigDecimal discountAmount = java.math.BigDecimal.ZERO;
        if (khuyenMai != null) {
            discountAmount = totalOriginalPrice.multiply(khuyenMai.getPhanTramGiam())
                    .divide(java.math.BigDecimal.valueOf(100));
            if (khuyenMai.getSoTienGiamToiDa() != null
                    && discountAmount.compareTo(khuyenMai.getSoTienGiamToiDa()) > 0) {
                discountAmount = khuyenMai.getSoTienGiamToiDa();
            }
        }
        java.math.BigDecimal finalTotalPrice = totalOriginalPrice.subtract(discountAmount);

        // Optional: Compare with FE price to prevent tampering (allow minor rounding
        // differences)
        if (request.getTongTien() != null && finalTotalPrice.subtract(request.getTongTien()).abs()
                .compareTo(java.math.BigDecimal.valueOf(10)) > 0) {
            System.err.println(
                    "[SECURITY] Price mismatch! FE: " + request.getTongTien() + " calculated: " + finalTotalPrice);
            // In strict mode, throw exception. For now, we use calculated price.
        }

        // 5. Xác định trạng thái dựa theo phương thức thanh toán
        boolean isVnpay = "VNPAY".equalsIgnoreCase(request.getPhuongThucThanhToan());
        boolean isCash = "CASH".equalsIgnoreCase(request.getPhuongThucThanhToan());
        String bookingStatus = (isVnpay || isCash) ? "Đã thanh toán" : "Chưa thanh toán";

        // 6. Create main booking record
        DatVe datVe = DatVe.builder()
                .maDatCho(pnr)
                .maNguoiDung(nguoiDung)
                .maKhuyenMai(khuyenMai)
                .ngayDatVe(LocalDateTime.now())
                .tongTien(finalTotalPrice)
                .trangThai(bookingStatus)
                .build();

        datVe = datVeRepository.save(datVe);

        // Update Promotion Usage count
        if (khuyenMai != null) {
            khuyenMai.setSoLuongConLai(khuyenMai.getSoLuongConLai() - 1);
            khuyenMaiRepository.save(khuyenMai);
        }

        // 7. Tạo bản ghi THANHTOAN
        int maPttt = isVnpay ? MA_PTTT_VNPAY : MA_PTTT_PAY_LATER;
        PhuongThucThanhToan pttt = phuongThucThanhToanRepository.findById(maPttt).orElse(null);
        ThanhToan thanhToan = ThanhToan.builder()
                .maDatVe(datVe)
                .maPTTT(pttt)
                .soTien(finalTotalPrice)
                .thoiGianThanhToan(LocalDateTime.now())
                .trangThai((isVnpay || isCash) ? "Đã thanh toán" : "Chưa thanh toán")
                .build();
        thanhToanRepository.save(thanhToan);
        System.out.println("[DEBUG Booking] Created THANHTOAN record for DatVe=" + datVe.getMaDatVe() + ", status="
                + thanhToan.getTrangThai());

        if (request.getPassengers() != null) {
            for (PassengerDto passenger : request.getPassengers()) {
                ChuyenBay chuyenBay = flightRepository.findById(passenger.getMaChuyenBay())
                        .orElseThrow(() -> new RuntimeException(
                                "Không tìm thấy chuyến bay: " + passenger.getMaChuyenBay()));

                // QĐ3: Kiểm tra thời gian chậm nhất khi đặt vé
                com.flight.ticket.model.QuyDinh qd = quyDinhService.getQuyDinh();
                LocalDateTime limitTime = chuyenBay.getNgayGioKhoiHanh().minusHours(qd.getThoiGianChamNhatKhiDatVe());
                if (LocalDateTime.now().isAfter(limitTime)) {
                    throw new RuntimeException("Chuyến bay " + chuyenBay.getMaChuyenBay() + " đã quá hạn đặt vé (yêu cầu đặt trước ít nhất " + qd.getThoiGianChamNhatKhiDatVe() + " giờ).");
                }

                CT_ChuyenBay.CT_ChuyenBayId ctId = new CT_ChuyenBay.CT_ChuyenBayId(chuyenBay.getMaChuyenBay(),
                        passenger.getMaHangVe());
                CT_ChuyenBay ctChuyenBay = flightDetailRepository.findById(ctId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy hạng vé!"));

                if (ctChuyenBay.getSoLuongConLai() <= 0) {
                    throw new RuntimeException("Hạng vé số " + passenger.getMaHangVe() + " trên chuyến bay "
                            + passenger.getMaChuyenBay() + " đã hết chỗ.");
                }

                ctChuyenBay.setSoLuongConLai(ctChuyenBay.getSoLuongConLai() - 1);
                flightDetailRepository.save(ctChuyenBay);

                CT_DatVe ctDatVe = CT_DatVe.builder()
                        .maDatVe(datVe)
                        .maChuyenBay(chuyenBay)
                        .maHangVe(ctChuyenBay.getHangVe())
                        .hoTenHK(passenger.getHoTenHK())
                        .cccd(passenger.getCccd())
                        .ngaySinh(passenger.getNgaySinh())
                        .gioiTinh(passenger.getGioiTinh())
                        .doiTuong(passenger.getDoiTuong())
                        .soGhe(passenger.getSoGhe())
                        .giaVe(passenger.getGiaVe() != null ? passenger.getGiaVe() : java.math.BigDecimal.ZERO)
                        .giaHanhLy(
                                passenger.getGiaHanhLy() != null ? passenger.getGiaHanhLy() : java.math.BigDecimal.ZERO)
                        .canNangHanhLy(passenger.getCanNangHanhLy())
                        .giaBaoHiem(passenger.getGiaBaoHiem())
                        .build();

                ctDatVeRepository.save(ctDatVe);
            }
        }

        return datVe;
    }

    @Transactional(readOnly = true)
    public List<MyBookingDto> getBookingsByUser(int userId) {
        NguoiDung user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DatVe> bookings = datVeRepository.findByMaNguoiDung(user);

        return bookings.stream().map(this::convertToMyBookingDto).collect(Collectors.toList());
    }

    /**
     * Tự động hủy các đơn hàng "Chưa thanh toán" sau 20 phút.
     * Chạy mỗi 5 phút.
     */
    @Scheduled(fixedRate = 300000) // 300000 ms = 5 phút
    @Transactional
    public void autoCancelExpiredBookings() {
        LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(20);
        List<DatVe> expiredBookings = datVeRepository.findByTrangThaiAndNgayDatVeBefore("Chưa thanh toán", expirationTime);

        if (expiredBookings.isEmpty()) {
            return;
        }

        System.out.println("[SCHEDULED] Đang xử lý hủy " + expiredBookings.size() + " đơn hàng hết hạn thanh toán...");

        for (DatVe dv : expiredBookings) {
            try {
                // 1. Cập nhật trạng thái Đặt Vé
                dv.setTrangThai("Đã hủy");
                datVeRepository.save(dv);

                // 2. Cập nhật trạng thái Thanh Toán
                thanhToanRepository.findByMaDatVe(dv).ifPresent(tt -> {
                    tt.setTrangThai("Đã hủy");
                    thanhToanRepository.save(tt);
                });

                // 3. Hoàn trả số lượng ghế
                List<CT_DatVe> details = ctDatVeRepository.findByMaDatVe(dv);
                for (CT_DatVe detail : details) {
                    ChuyenBay cb = detail.getMaChuyenBay();
                    CT_ChuyenBay.CT_ChuyenBayId ctId = new CT_ChuyenBay.CT_ChuyenBayId(
                            cb.getMaChuyenBay(), 
                            detail.getMaHangVe().getMaHangVe()
                    );
                    
                    flightDetailRepository.findById(ctId).ifPresent(ct -> {
                        ct.setSoLuongConLai(ct.getSoLuongConLai() + 1);
                        flightDetailRepository.save(ct);
                    });
                }

                // 4. Hoàn trả lượt dùng mã khuyến mãi (nếu có)
                if (dv.getMaKhuyenMai() != null) {
                    KhuyenMai km = dv.getMaKhuyenMai();
                    km.setSoLuongConLai(km.getSoLuongConLai() + 1);
                    khuyenMaiRepository.save(km);
                }

                System.out.println("[SCHEDULED] Đã hủy đơn hàng: " + dv.getMaDatCho());
            } catch (Exception e) {
                System.err.println("[SCHEDULED] Lỗi khi hủy đơn hàng " + dv.getMaDatCho() + ": " + e.getMessage());
            }
        }
    }

    private MyBookingDto convertToMyBookingDto(DatVe datVe) {
        return MyBookingDto.builder()
                .maDatVe(datVe.getMaDatVe())
                .maDatCho(datVe.getMaDatCho())
                .ngayDatVe(datVe.getNgayDatVe())
                .tongTien(datVe.getTongTien())
                .trangThai(datVe.getTrangThai())
                .tickets(datVeTickets(datVe))
                .build();
    }

    private List<MyBookingDto.MyTicketDto> datVeTickets(DatVe datVe) {
        List<CT_DatVe> tickets = ctDatVeRepository.findByMaDatVe(datVe);
        return tickets.stream().map(t -> MyBookingDto.MyTicketDto.builder()
                .maVe(t.getMaVe())
                .hoTenHK(t.getHoTenHK())
                .soGhe(t.getSoGhe())
                .giaVe(t.getGiaVe())
                .tenHangVe(t.getMaHangVe() != null ? t.getMaHangVe().getTenHangVe() : "N/A")
                .maChuyenBay(t.getMaChuyenBay() != null ? String.valueOf(t.getMaChuyenBay().getMaChuyenBay()) : "N/A")
                .noiDi(t.getMaChuyenBay() != null && t.getMaChuyenBay().getMaSanBayDi() != null
                        ? t.getMaChuyenBay().getMaSanBayDi().getThanhPho()
                        : "N/A")
                .noiDen(t.getMaChuyenBay() != null && t.getMaChuyenBay().getMaSanBayDen() != null
                        ? t.getMaChuyenBay().getMaSanBayDen().getThanhPho()
                        : "N/A")
                .thoiGianDi(t.getMaChuyenBay() != null ? t.getMaChuyenBay().getNgayGioKhoiHanh() : null)
                .thoiGianDen(t.getMaChuyenBay() != null ? t.getMaChuyenBay().getNgayGioHaCanh() : null)
                .build()).collect(Collectors.toList());

    }

    @Transactional(readOnly = true)
    public CheckinResponseDto getBookingByPNR(String pnr) {
        DatVe datVe = datVeRepository.findByMaDatCho(pnr)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã đặt chỗ: " + pnr));

        List<CT_DatVe> tickets = ctDatVeRepository.findByMaDatVe(datVe);
        if (tickets.isEmpty()) {
            throw new RuntimeException("Không tìm thấy thông tin hành khách cho mã đặt chỗ này.");
        }

        // Giả sử 1 booking (PNR) chỉ cho 1 chuyến bay (hoặc lấy chuyến bay đầu tiên)
        ChuyenBay flight = tickets.get(0).getMaChuyenBay();

        CheckinResponseDto.FlightInfoDto flightInfo = CheckinResponseDto.FlightInfoDto.builder()
                .maChuyenBay(flight != null ? String.valueOf(flight.getMaChuyenBay()) : "N/A")
                .ngayGioKhoiHanh(flight != null ? flight.getNgayGioKhoiHanh() : null)
                .maSanBayDi(flight != null && flight.getMaSanBayDi() != null ? 
                        CheckinResponseDto.AirportDto.builder()
                                .maIATA(flight.getMaSanBayDi().getMaIATA())
                                .thanhPho(flight.getMaSanBayDi().getThanhPho())
                                .build() : null)
                .maSanBayDen(flight != null && flight.getMaSanBayDen() != null ? 
                        CheckinResponseDto.AirportDto.builder()
                                .maIATA(flight.getMaSanBayDen().getMaIATA())
                                .thanhPho(flight.getMaSanBayDen().getThanhPho())
                                .build() : null)
                .build();

        List<CheckinResponseDto.PassengerInfoDto> passengers = tickets.stream().map(t -> 
                CheckinResponseDto.PassengerInfoDto.builder()
                        .maVe(t.getMaVe())
                        .hoTenHK(t.getHoTenHK())
                        .cccd(t.getCccd())
                        .doiTuong(t.getDoiTuong())
                        .soGhe(t.getSoGhe())
                        .trangThai(t.getTrangThai())
                        .build()
        ).collect(Collectors.toList());

        return CheckinResponseDto.builder()
                .flight(flightInfo)
                .passengers(passengers)
                .build();
    }

    @Transactional
    public void updateCheckinStatus(int ticketId, String status) {
        CT_DatVe ticket = ctDatVeRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vé mã: " + ticketId));
        ticket.setTrangThai(status);
        ctDatVeRepository.save(ticket);
    }
}
