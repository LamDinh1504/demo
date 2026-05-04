CREATE DATABASE FlightTicket;
USE FlightTicket;
-- BƯỚC 1: DỌN RÁC & RESET ID VỀ 1
-- =====================================================================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE CT_DATVE;
TRUNCATE TABLE TRUNGGIAN;
TRUNCATE TABLE CT_CHUYENBAY;
TRUNCATE TABLE THANHTOAN;
TRUNCATE TABLE DATVE;
TRUNCATE TABLE CHUYENBAY;
TRUNCATE TABLE MAYBAY;
TRUNCATE TABLE PHUONGTHUCTHANHTOAN;
TRUNCATE TABLE KHUYENMAI;
TRUNCATE TABLE HANGVE;
TRUNCATE TABLE HANGHANGKHONG;
TRUNCATE TABLE SANBAY;
TRUNCATE TABLE NGUOIDUNG;

-- Đặt lại bộ đếm ID về 1 cho tất cả các bảng có AUTO_INCREMENT
ALTER TABLE CT_DATVE AUTO_INCREMENT = 1;
ALTER TABLE THANHTOAN AUTO_INCREMENT = 1;
ALTER TABLE DATVE AUTO_INCREMENT = 1;
ALTER TABLE CHUYENBAY AUTO_INCREMENT = 1;
ALTER TABLE MAYBAY AUTO_INCREMENT = 1;
ALTER TABLE KHUYENMAI AUTO_INCREMENT = 1;
ALTER TABLE HANGHANGKHONG AUTO_INCREMENT = 1;
ALTER TABLE SANBAY AUTO_INCREMENT = 1;
ALTER TABLE NGUOIDUNG AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================================
-- BƯỚC 2: TỪ ĐIỂN DỮ LIỆU CỐ ĐỊNH (Sân Bay, Hãng Bay, Hạng Vé, PTTT, Khuyến Mãi)
-- =====================================================================================
INSERT INTO SANBAY (MaIATA, TenSanBay, ThanhPho, QuocGia) VALUES
('SGN', 'Tân Sơn Nhất', 'Hồ Chí Minh', 'Việt Nam'), ('HAN', 'Nội Bài', 'Hà Nội', 'Việt Nam'),
('DAD', 'Đà Nẵng', 'Đà Nẵng', 'Việt Nam'), ('CXR', 'Cam Ranh', 'Nha Trang', 'Việt Nam'),
('PQC', 'Phú Quốc', 'Phú Quốc', 'Việt Nam'), ('VCA', 'Cần Thơ', 'Cần Thơ', 'Việt Nam'),
('HPH', 'Cát Bi', 'Hải Phòng', 'Việt Nam'), ('VII', 'Vinh', 'Vinh', 'Việt Nam'),
('DLI', 'Liên Khương', 'Đà Lạt', 'Việt Nam'), ('UIH', 'Phù Cát', 'Quy Nhơn', 'Việt Nam'),
('SIN', 'Changi', 'Singapore', 'Singapore'), ('BKK', 'Suvarnabhumi', 'Bangkok', 'Thái Lan'),
('ICN', 'Incheon', 'Seoul', 'Hàn Quốc'), ('NRT', 'Narita', 'Tokyo', 'Nhật Bản'),
('LHR', 'Heathrow', 'London', 'Vương quốc Anh'), ('CDG', 'Charles de Gaulle', 'Paris', 'Pháp'),
('FRA', 'Frankfurt', 'Frankfurt', 'Đức'), ('JFK', 'John F. Kennedy', 'New York', 'Mỹ'),
('LAX', 'Los Angeles', 'Los Angeles', 'Mỹ'), ('SYD', 'Kingsford Smith', 'Sydney', 'Úc');

INSERT INTO HANGHANGKHONG (TenHang, LogoURL, MaIATA) VALUES
('Vietnam Airlines', 'vn.png', 'VN'), ('VietJet Air', 'vj.png', 'VJ'),
('Bamboo Airways', 'qh.png', 'QH'), ('Vietravel Airlines', 'vu.png', 'VU'),
('Singapore Airlines', 'sq.png', 'SQ'), ('Korean Air', 'ke.png', 'KE'),
('Japan Airlines', 'jl.png', 'JL'), ('Emirates', 'ek.png', 'EK'),
('Qatar Airways', 'qr.png', 'QR'), ('All Nippon Airways', 'nh.png', 'NH');

INSERT INTO HANGVE (MaHangVe, TenHangVe, HeSoGia) VALUES
(1, 'Phổ thông (Economy)', 1.00), (2, 'Phổ thông đặc biệt (Premium)', 1.50),
(3, 'Thương gia (Business)', 3.00), (4, 'Hạng nhất (First Class)', 5.00);

INSERT INTO PHUONGTHUCTHANHTOAN (MaPTTT, TenPTTT) VALUES
(1, 'VNPay'),(2, 'Tiền mặt');

INSERT INTO KHUYENMAI (code, TenChuongTrinh, MoTaTenChuongTrinh ,PhanTramGiam, SoTienGiamToiDa, NgayBatDau, NgayKetThuc, SoLuongConLai, UrlImage) VALUES
('SUMMER2026', 'Chào Hè Rực Rỡ', 'Giảm giá cực sốc cho các chuyến bay mùa hè. Tận hưởng kỳ nghỉ tuyệt vời bên bãi biển xanh mát.', 10.00, 500000.00, '2026-06-01', '2026-08-31', 1000, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'),
('TET2027', 'Đón Tết Quê Hương', 'Ưu đãi đặt vé bay sớm dịp Tết Nguyên Đán 2027. Sum vầy bên gia đình với chi phí tiết kiệm nhất.', 15.00, 1000000.00, '2026-11-01', '2027-01-20', 500, 'https://images.pexels.com/photos/35647276/pexels-photo-35647276.jpeg'),
('FLASH50', 'Flash Sale Cuối Tuần', 'Khuyến mãi chớp nhoáng 50% vào cuối tuần. Săn vé ngay kẻo lỡ - số lượng cực kỳ có hạn!', 50.00, 200000.00, '2026-04-10', '2026-04-12', 200, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'),
('WELCOME', 'Chào Bạn Mới', 'Ưu đãi dành riêng cho khách hàng lần đầu đặt vé tại FlyViet. Trải nghiệm dịch vụ đẳng cấp 5 sao.', 5.00, 150000.00, '2026-01-01', '2026-12-31', 5000, 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80'),
('AUTUMN26', 'Thu Quyến Rũ', 'Tận hưởng mùa thu vàng lãng mạn với ưu đãi vé máy bay siêu rẻ cho các hành trình quốc tế.', 20.00, 800000.00, '2026-09-01', '2026-11-30', 300, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'),
('WINTER2026', 'Đông Ấm Áp', 'Khuyến mãi mùa đông cho các chuyến bay cuối năm. Cùng gia đình tận hưởng kỳ nghỉ ấm áp giữa tiết trời se lạnh.', 12.00, 600000.00, '2026-12-01', '2027-02-15', 400, 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80');

-- =====================================================================================
-- BƯỚC 3: MÁY BAY & NGƯỜI DÙNG (CẬP NHẬT VAI TRÒ)
-- =====================================================================================
INSERT INTO MAYBAY (MaHangHK, TenMayBay, TongSoGhe) VALUES
(1, 'Boeing 787-9', 274), (1, 'Boeing 787-10', 367), (1, 'Airbus A350', 305), (1, 'Airbus A350', 305), (1, 'Airbus A321neo', 203),
(1, 'Airbus A321neo', 203), (1, 'Airbus A321ceo', 184), (1, 'Airbus A321ceo', 184), (1, 'ATR 72-500', 68), (1, 'ATR 72-500', 68),
(2, 'Airbus A330-300', 377), (2, 'Airbus A330-300', 377), (2, 'Airbus A321neo', 240), (2, 'Airbus A321neo', 230), (2, 'Airbus A321ceo', 220),
(2, 'Airbus A321ceo', 220), (2, 'Airbus A320neo', 186), (2, 'Airbus A320ceo', 180), (2, 'Airbus A320ceo', 180), (2, 'Airbus A320ceo', 180),
(3, 'Boeing 787-9', 294), (3, 'Boeing 787-9', 294), (3, 'Airbus A321neo', 198), (3, 'Airbus A321neo', 198), (3, 'Airbus A320neo', 170),
(3, 'Airbus A320ceo', 180), (3, 'Embraer E190', 98), (3, 'Embraer E190', 98), (3, 'Embraer E195', 118), (3, 'Embraer E195', 118),
(4, 'Airbus A321ceo', 220), (4, 'Airbus A321ceo', 220), (4, 'Airbus A319ceo', 156), (4, 'Airbus A319ceo', 156), (4, 'Airbus A321neo', 230),
(5, 'Airbus A380', 471), (5, 'Airbus A380', 471), (5, 'Boeing 777', 264), (5, 'Airbus A350', 253), (5, 'Boeing 787-10', 337),
(6, 'Boeing 747-8i', 368), (6, 'Airbus A380', 407), (6, 'Boeing 777', 291), (6, 'Boeing 787-9', 269), (6, 'Airbus A220', 140),
(7, 'Airbus A350-1000', 239), (7, 'Airbus A350', 369), (7, 'Boeing 777', 244), (7, 'Boeing 787-8', 186), (7, 'Boeing 737', 144);

-- VAI TRÒ: ADMIN, USER, CLIENT, EMPLOYEE
INSERT INTO NGUOIDUNG (HoTen, CCCD, Sdt, Email, MatKhau, NgaySinh, DiaChi, VaiTro) VALUES
('Đinh Văn Lâm', '079090123456', '0901234567', 'lam.dv@uit.edu.vn', '123', '2005-01-01', 'TP.HCM', 'ADMIN'),
('Nguyễn Trần Trung Quân', '079090111112', '0901111111', 'quan@gmail.com', '123', '1992-01-01', 'Hà Nội', 'USER'),
('Trần Khởi My', '079090222222', '0902222222', 'my@gmail.com', '123', '1990-02-02', 'TP.HCM', 'USER'),
('Lê Công Vinh', '079090333333', '0903333333', 'vinh@gmail.com', '123', '1985-03-03', 'Nghệ An', 'USER'),
('Phạm Hương', '079090444444', '0904444444', 'huong@gmail.com', '123', '1991-04-04', 'Hải Phòng', 'USER'),
('Đỗ Mỹ Linh', '079090555555', '0905555555', 'linh@gmail.com', '123', '1996-05-05', 'Hà Nội', 'USER'),
('Ngô Kiến Huy', '079090666666', '0906666666', 'huy@gmail.com', '123', '1988-06-06', 'TP.HCM', 'USER'),
('Sơn Tùng M-TP', '079090777777', '0907777777', 'tung@gmail.com', '123', '1994-07-07', 'Thái Bình', 'USER'),
('Bích Phương', '079090888888', '0908888888', 'phuong@gmail.com', '123', '1989-08-08', 'Quảng Ninh', 'USER'),
('Hoàng Thùy Linh', '079090999999', '0909999999', 'linhht@gmail.com', '123', '1988-09-09', 'Hà Nội', 'USER'),
('Isaac', '079090101010', '0901010101', 'isaac@gmail.com', '123', '1988-10-10', 'Cần Thơ', 'USER'),
('Tóc Tiên', '079090121212', '0901212121', 'tien@gmail.com', '123', '1989-11-11', 'TP.HCM', 'CLIENT'),
('Trấn Thành', '079090131313', '0901313131', 'thanh@gmail.com', '123', '1987-12-12', 'TP.HCM', 'USER'),
('Hari Won', '079090141414', '0901414141', 'hari@gmail.com', '123', '1985-06-22', 'Hàn Quốc', 'USER'),
('Trường Giang', '079090151515', '0901515151', 'giang@gmail.com', '123', '1983-04-20', 'Quảng Nam', 'USER'),
('Nhã Phương', '079090161616', '0901616161', 'nha@gmail.com', '123', '1990-05-20', 'Đắk Lắk', 'USER'),
('Ninh Dương Lan Ngọc', '079090171717', '0901717171', 'ngoc@gmail.com', '123', '1990-04-04', 'TP.HCM', 'CLIENT'),
('Nguyễn Thúc Thùy Tiên', '079090181818', '0901818181', 'thuytien@gmail.com', '123', '1998-08-12', 'TP.HCM', 'USER'),
('Lê Hoàng Ân', '079090191919', '0901919191', 'an@gmail.com', '123', '2000-01-15', 'Đà Nẵng', 'USER'),
('Phạm Thị Mai', '079090202020', '0902020202', 'mai@gmail.com', '123', '1995-11-25', 'Nha Trang', 'USER'),
('Bùi Anh Tuấn', '079090212121', '0902121212', 'tuan@gmail.com', '123', '1991-09-09', 'Hà Nội', 'USER'),
('Vương Tuấn Khải', '079090232323', '0902323232', 'khai@gmail.com', '123', '1999-09-21', 'Bắc Kinh', 'USER'),
('Vương Nguyên', '079090242424', '0902424242', 'nguyen@gmail.com', '123', '2000-11-08', 'Trùng Khánh', 'USER'),
('Dịch Dương Thiên Tỉ', '079090252525', '0902525252', 'thienti@gmail.com', '123', '2000-11-28', 'Hồ Nam', 'USER'),
('Lưu Diệc Phi', '079090262626', '0902626262', 'phi@gmail.com', '123', '1987-08-25', 'Vũ Hán', 'USER'),
('Châu Kiệt Luân', '079090272727', '0902727272', 'luan@gmail.com', '123', '1979-01-18', 'Đài Bắc', 'USER'),
('Lâm Chí Dĩnh', '079090282828', '0902828282', 'dinh@gmail.com', '123', '1974-10-15', 'Đài Bắc', 'USER'),
('Hồ Ca', '079090292929', '0902929292', 'ca@gmail.com', '123', '1982-09-20', 'Thượng Hải', 'USER'),
('Trần Vỹ Đình', '079090303030', '0903030303', 'dinh2@gmail.com', '123', '1985-11-21', 'Hong Kong', 'USER'),
('Triệu Lệ Dĩnh', '079090323232', '0903232323', 'trieu@gmail.com', '123', '1987-10-16', 'Hà Bắc', 'USER'),
('Lionel Messi', '079090323233', '0903232333', 'messi@goat.com', '123', '1987-06-24', 'Rosario', 'USER'),
('Cristiano Ronaldo', '079090323234', '0903232344', 'cr7@goat.com', '123', '1985-02-05', 'Madeira', 'USER'),
('Karim Benzema', '079090323235', '0903232355', 'benzema@rm.com', '123', '1987-12-19', 'Lyon', 'USER'),
('Kevin De Bruyne', '079090323236', '0903232366', 'kdb@city.com', '123', '1991-06-28', 'Drongen', 'USER'),
('Neymar Jr', '079090323237', '0903232377', 'njr@psg.com', '123', '1992-02-05', 'Mogi', 'USER'),
('Kylian Mbappe', '079090323238', '0903232388', 'mbappe@psg.com', '123', '1998-12-20', 'Paris', 'USER'),
('Erling Haaland', '079090323239', '0903232399', 'haaland@city.com', '123', '2000-07-21', 'Leeds', 'USER'),
('Vinícius Júnior', '079090323240', '0903232400', 'vini@rm.com', '123', '2000-07-12', 'Rio', 'USER'),
('Jude Bellingham', '079090323241', '0903232411', 'jude@rm.com', '123', '2003-06-29', 'Stourbridge', 'USER'),
('Luka Modric', '079090323242', '0903232422', 'luka@rm.com', '123', '1985-09-09', 'Zadar', 'USER'),
('Nguyễn Quang Hải', '079090323243', '0903232433', 'hai.con@vff.com', '123', '1997-04-12', 'Hà Nội', 'USER'),
('Đoàn Văn Hậu', '079090323244', '0903232444', 'hau.doan@vff.com', '123', '1999-04-19', 'Thái Bình', 'USER'),
('Nguyễn Tiến Linh', '079090323245', '0903232455', 'linh.nguyen@vff.com', '123', '1997-10-20', 'Hải Dương', 'USER'),
('Quế Ngọc Hải', '079090323246', '0903232466', 'hai.que@vff.com', '123', '1993-05-15', 'Nghệ An', 'USER'),
('Đặng Văn Lâm', '079090323247', '0903232477', 'lam.tay@vff.com', '123', '1993-08-13', 'Moscow', 'USER'),
('Nguyễn Văn Toàn', '079090323248', '0903232488', 'toan@vff.com', '123', '1996-04-12', 'Hải Dương', 'USER'),
('Bùi Tiến Dũng', '079090323249', '0903232499', 'dung@vff.com', '123', '1997-02-28', 'Thanh Hóa', 'USER'),
('Nguyễn Hoàng Đức', '079090323250', '0903232500', 'duc@vff.com', '123', '1998-01-11', 'Hải Dương', 'USER'),
('Đỗ Hùng Dũng', '079090323251', '0903232511', 'dungdo@vff.com', '123', '1993-09-08', 'Hà Nội', 'USER'),
('Phạm Tuấn Hải', '079090323252', '0903232522', 'haipham@vff.com', '123', '1998-05-19', 'Phủ Lý', 'USER'),
('Taylor Swift', '079090323253', '0903232533', 'taylor@music.com', '123', '1989-12-13', 'Pennsylvania', 'USER'),
('Nguyễn Thùy Tiên', '079090323254', '0903232544', 'tien2@vff.com', '123', '1999-05-19', 'TP.HCM', 'USER'),
('Trần Đặng', '079090323255', '0903232555', 'dang@vff.com', '123', '1995-05-19', 'Hà Nội', 'USER'),
('Đinh Thị Khánh Ly', '043435457684', '0123456789', 'lamdinhfco@gmail.com', '123', '2005-01-07', 'TP.HCM', 'EMPLOYEE');

-- =====================================================================================
-- BƯỚC 4: CHUYẾN BAY & CHI TIẾT
-- =====================================================================================
INSERT INTO CHUYENBAY (MaHangHK, MaMayBay, MaSanBayDi, MaSanBayDen, NgayGioKhoiHanh, NgayGioHaCanh, ThoiGianBay, TrangThai) VALUES
-- 10 NỘI ĐỊA (1-10)
(1, 1, 1, 2, '2026-06-10 07:00:00', '2026-06-10 09:15:00', 135, 'Đã lên lịch'),
(2, 11, 1, 3, '2026-06-10 08:30:00', '2026-06-10 09:50:00', 80, 'Đã lên lịch'),
(3, 21, 2, 4, '2026-06-11 10:00:00', '2026-06-11 11:45:00', 105, 'Đã lên lịch'),
(1, 5, 2, 5, '2026-06-12 14:00:00', '2026-06-12 16:10:00', 130, 'Đã lên lịch'),
(2, 18, 3, 1, '2026-06-15 18:00:00', '2026-06-15 19:20:00', 80, 'Đã lên lịch'),
(3, 27, 4, 2, '2026-06-20 08:30:00', '2026-06-20 10:15:00', 105, 'Đã lên lịch'),
(1, 9, 1, 5, '2026-06-25 12:00:00', '2026-06-25 13:00:00', 60, 'Đã lên lịch'),
(2, 17, 1, 6, '2026-07-01 06:00:00', '2026-07-01 06:45:00', 45, 'Đã lên lịch'),
(1, 7, 6, 1, '2026-07-02 15:00:00', '2026-07-02 15:45:00', 45, 'Đã lên lịch'),
(3, 23, 2, 8, '2026-07-05 09:30:00', '2026-07-05 10:30:00', 60, 'Đã lên lịch'),
-- 10 QUỐC TẾ (11-20)
(5, 36, 1, 11, '2026-07-15 10:00:00', '2026-07-15 13:00:00', 180, 'Đã lên lịch'),
(6, 41, 2, 13, '2026-07-25 23:00:00', '2026-07-26 05:00:00', 240, 'Đã lên lịch'),
(7, 46, 1, 14, '2026-08-05 00:30:00', '2026-08-05 08:00:00', 330, 'Đã lên lịch'),
(1, 2, 2, 16, '2026-08-15 22:00:00', '2026-08-16 06:00:00', 840, 'Đã lên lịch'),
(1, 3, 1, 17, '2026-08-20 13:00:00', '2026-08-21 07:00:00', 840, 'Đã lên lịch'),
(5, 38, 3, 20, '2026-08-25 15:30:00', '2026-08-26 05:00:00', 690, 'Đã lên lịch'),
(7, 47, 1, 18, '2026-09-01 10:00:00', '2026-09-02 02:00:00', 960, 'Đã lên lịch'),
(6, 42, 2, 19, '2026-09-05 20:00:00', '2026-09-06 14:00:00', 1080, 'Đã lên lịch'),
(8, 30, 1, 15, '2026-09-10 16:00:00', '2026-09-11 06:00:00', 840, 'Đã lên lịch'),
(9, 31, 2, 11, '2026-09-15 11:00:00', '2026-09-15 14:30:00', 210, 'Đã lên lịch'),
-- 10 NỘI ĐỊA VỀ (21-30)
(1, 4, 2, 1, '2026-06-12 07:00:00', '2026-06-12 09:15:00', 135, 'Đã lên lịch'),
(2, 13, 3, 1, '2026-06-13 08:30:00', '2026-06-13 09:50:00', 80, 'Đã lên lịch'),
(3, 22, 4, 2, '2026-06-14 10:00:00', '2026-06-14 11:45:00', 105, 'Đã lên lịch'),
(1, 6, 5, 2, '2026-06-15 14:00:00', '2026-06-15 16:10:00', 130, 'Đã lên lịch'),
(2, 19, 1, 3, '2026-06-18 18:00:00', '2026-06-18 19:20:00', 80, 'Đã lên lịch'),
(3, 28, 2, 4, '2026-06-23 08:30:00', '2026-06-23 10:15:00', 105, 'Đã lên lịch'),
(1, 10, 5, 1, '2026-06-28 12:00:00', '2026-06-28 13:00:00', 60, 'Đã lên lịch'),
(2, 20, 6, 1, '2026-07-04 06:00:00', '2026-07-04 06:45:00', 45, 'Đã lên lịch'),
(1, 7, 1, 6, '2026-07-05 15:00:00', '2026-07-05 15:45:00', 45, 'Đã lên lịch'),
(3, 24, 8, 2, '2026-07-08 09:30:00', '2026-07-08 10:30:00', 60, 'Đã lên lịch'),
-- 10 QUỐC TẾ VỀ (31-40)
(5, 37, 11, 1, '2026-07-20 10:00:00', '2026-07-20 13:00:00', 180, 'Đã lên lịch'),
(6, 44, 13, 2, '2026-07-30 23:00:00', '2026-07-31 05:00:00', 240, 'Đã lên lịch'),
(7, 48, 14, 1, '2026-08-10 00:30:00', '2026-08-10 08:00:00', 330, 'Đã lên lịch'),
(1, 2, 16, 2, '2026-08-25 22:00:00', '2026-08-26 06:00:00', 840, 'Đã lên lịch'),
(1, 3, 17, 1, '2026-08-30 13:00:00', '2026-08-31 07:00:00', 840, 'Đã lên lịch'),
(5, 39, 20, 3, '2026-09-05 15:30:00', '2026-09-06 05:00:00', 690, 'Đã lên lịch'),
(7, 47, 18, 1, '2026-09-11 10:00:00', '2026-09-12 02:00:00', 960, 'Đã lên lịch'),
(6, 42, 19, 2, '2026-09-15 20:00:00', '2026-09-16 14:00:00', 1080, 'Đã lên lịch'),
(8, 30, 15, 1, '2026-09-20 16:00:00', '2026-09-21 06:00:00', 840, 'Đã lên lịch'),
(9, 31, 11, 2, '2026-09-25 11:00:00', '2026-09-25 14:30:00', 210, 'Đã lên lịch');

INSERT INTO TRUNGGIAN (MaChuyenBay, MaSanBayTG, ThoiGianDung, ThuTuDung, GhiChu) VALUES
(12, 3, 60, 1, 'Dừng đón khách nội địa tại Đà Nẵng trước khi bay ICN'),
(13, 2, 120, 1, 'Hành khách đổi máy bay tại Nội Bài'),
(14, 12, 150, 1, 'Transit tại Suvarnabhumi để tiếp nhiên liệu đi Pháp'),
(15, 11, 180, 1, 'Dừng tại Changi, mua sắm miễn thuế'),
(16, 1, 90, 1, 'Dừng tại Tân Sơn Nhất đón thêm khách đi Úc'),
(17, 14, 150, 1, 'Transit tại Narita đổi máy bay đi Mỹ'),
(18, 13, 120, 1, 'Dừng tại Incheon Hàn Quốc'),
(19, 12, 90, 1, 'Tiếp nhiên liệu tại Thái Lan trước khi sang Anh'),
(34, 12, 150, 1, 'Transit lượt về tại Suvarnabhumi'),
(35, 11, 180, 1, 'Dừng tại Changi Singapore lượt về');

-- Chi tiết vé (Tạo Data Tự Động Giá)
INSERT INTO CT_CHUYENBAY (MaChuyenBay, MaHangVe, SoLuongCho, SoLuongConLai, GiaCoBan)
SELECT MaChuyenBay, 1, 150, 100, CASE WHEN MaSanBayDen > 10 THEN 3500000 ELSE 1250000 END FROM CHUYENBAY;
INSERT INTO CT_CHUYENBAY (MaChuyenBay, MaHangVe, SoLuongCho, SoLuongConLai, GiaCoBan)
SELECT MaChuyenBay, 2, 40, 20, CASE WHEN MaSanBayDen > 10 THEN 5250000 ELSE 1875000 END FROM CHUYENBAY;
INSERT INTO CT_CHUYENBAY (MaChuyenBay, MaHangVe, SoLuongCho, SoLuongConLai, GiaCoBan)
SELECT MaChuyenBay, 3, 20, 10, CASE WHEN MaSanBayDen > 10 THEN 10500000 ELSE 3750000 END FROM CHUYENBAY;

-- =====================================================================================
-- BƯỚC 5: 50 ĐƠN ĐẶT VÉ (Cập nhật TrangThai chuẩn xác)
-- Trạng Thái Chấp Nhận: 'Đã thanh toán', 'Chưa thanh toán', 'Đã hủy'
-- =====================================================================================
INSERT INTO DATVE (MaDatCho, MaNguoiDung, MaKhuyenMai, NgayDatVe, TongTien, TrangThai) VALUES
('ABC101', 1, NULL, '2026-05-01 10:00:00', 1250000.00, 'Đã thanh toán'),
('DEF102', 2, 1, '2026-05-02 11:30:00', 4500000.00, 'Đã thanh toán'),
('GHI103', 3, NULL, '2026-05-03 09:15:00', 3600000.00, 'Đã thanh toán'),
('JKL104', 4, 2, '2026-05-04 14:20:00', 12000000.00, 'Đã thanh toán'),
('MNO105', 5, NULL, '2026-05-05 16:45:00', 2400000.00, 'Chưa thanh toán'),
('PQR106', 6, 3, '2026-05-06 08:00:00', 650000.00, 'Đã thanh toán'),
('STU107', 7, NULL, '2026-05-07 10:10:00', 1500000.00, 'Đã hủy'),
('VWX108', 8, NULL, '2026-05-08 15:30:00', 4500000.00, 'Chưa thanh toán'),
('YZA109', 9, 4, '2026-05-09 11:00:00', 1200000.00, 'Đã thanh toán'),
('BCD110', 10, NULL, '2026-05-10 09:45:00', 6500000.00, 'Đã thanh toán'),
('EFG111', 11, NULL, '2026-05-11 14:00:00', 1000000.00, 'Đã thanh toán'),
('HIJ112', 12, NULL, '2026-05-12 16:20:00', 2500000.00, 'Đã hủy'),
('KLM113', 13, NULL, '2026-05-13 08:30:00', 7500000.00, 'Đã thanh toán'),
('NOP114', 14, NULL, '2026-05-14 10:50:00', 5000000.00, 'Chưa thanh toán'),
('QRS115', 15, NULL, '2026-05-15 15:15:00', 15000000.00, 'Đã thanh toán'),
('TUV116', 16, NULL, '2026-05-16 09:00:00', 6000000.00, 'Đã thanh toán'),
('WXY117', 17, NULL, '2026-05-17 11:40:00', 18000000.00, 'Chưa thanh toán'),
('ZAB118', 18, 1, '2026-05-18 14:25:00', 1620000.00, 'Đã thanh toán'),
('CDE119', 19, NULL, '2026-05-19 16:10:00', 1800000.00, 'Đã thanh toán'),
('FGH120', 20, 2, '2026-05-20 08:45:00', 1530000.00, 'Đã thanh toán'),
('IJK121', 21, NULL, '2026-05-21 10:00:00', 1200000.00, 'Đã hủy'),
('LMN122', 22, NULL, '2026-05-22 11:30:00', 1200000.00, 'Đã thanh toán'),
('OPQ123', 23, NULL, '2026-05-23 09:15:00', 3900000.00, 'Đã thanh toán'),
('RST124', 24, NULL, '2026-05-24 14:20:00', 4500000.00, 'Chưa thanh toán'),
('UVW125', 25, NULL, '2026-05-25 16:45:00', 1200000.00, 'Đã hủy'),
('XYZ126', 26, NULL, '2026-05-26 08:00:00', 1300000.00, 'Đã thanh toán'),
('ABC127', 27, NULL, '2026-05-27 10:10:00', 4500000.00, 'Đã thanh toán'),
('DEF128', 28, NULL, '2026-05-28 15:30:00', 800000.00, 'Đã thanh toán'),
('GHI129', 29, NULL, '2026-05-29 11:00:00', 800000.00, 'Chưa thanh toán'),
('JKL130', 30, NULL, '2026-05-30 09:45:00', 3000000.00, 'Đã thanh toán'),
-- Tăng thêm 20 dữ liệu mới
('MNO131', 31, NULL, '2026-05-31 08:00:00', 1250000.00, 'Đã thanh toán'),
('PQR132', 32, 1, '2026-06-01 12:30:00', 4500000.00, 'Đã thanh toán'),
('STU133', 33, NULL, '2026-06-02 09:15:00', 3600000.00, 'Đã hủy'),
('VWX134', 34, 2, '2026-06-03 14:20:00', 12000000.00, 'Chưa thanh toán'),
('YZA135', 35, NULL, '2026-06-04 16:45:00', 2400000.00, 'Đã thanh toán'),
('BCD136', 36, 3, '2026-06-05 08:00:00', 650000.00, 'Đã thanh toán'),
('EFG137', 37, NULL, '2026-06-06 10:10:00', 1500000.00, 'Đã thanh toán'),
('HIJ138', 38, NULL, '2026-06-07 15:30:00', 4500000.00, 'Đã thanh toán'),
('KLM139', 39, 4, '2026-06-08 11:00:00', 1200000.00, 'Đã hủy'),
('NOP140', 40, NULL, '2026-06-09 09:45:00', 6500000.00, 'Đã thanh toán'),
('QRS141', 41, NULL, '2026-06-10 14:00:00', 1000000.00, 'Đã thanh toán'),
('TUV142', 42, NULL, '2026-06-11 16:20:00', 2500000.00, 'Chưa thanh toán'),
('WXY143', 43, NULL, '2026-06-12 08:30:00', 7500000.00, 'Đã thanh toán'),
('ZAB144', 44, NULL, '2026-06-13 10:50:00', 5000000.00, 'Đã thanh toán'),
('CDE145', 45, NULL, '2026-06-14 15:15:00', 15000000.00, 'Đã hủy'),
('FGH146', 46, NULL, '2026-06-15 09:00:00', 6000000.00, 'Đã thanh toán'),
('IJK147', 47, NULL, '2026-06-16 11:40:00', 18000000.00, 'Đã thanh toán'),
('LMN148', 48, 1, '2026-06-17 14:25:00', 1620000.00, 'Chưa thanh toán'),
('OPQ149', 49, NULL, '2026-06-18 16:10:00', 1800000.00, 'Đã thanh toán'),
('RST150', 54, 2, '2026-06-19 08:45:00', 1530000.00, 'Đã thanh toán');

-- =====================================================================================
-- BƯỚC 6: CHI TIẾT ĐẶT VÉ VÀ THANH TOÁN (Khớp 100% với đơn hàng)
-- =====================================================================================
-- Thanh toán sẽ chỉ tạo cho các đơn hàng có trạng thái "Đã thanh toán"
INSERT INTO THANHTOAN (MaDatVe, MaPTTT, SoTien, ThoiGianThanhToan, TrangThai)
SELECT 
    MaDatVe, 
    (SELECT MaPTTT FROM PHUONGTHUCTHANHTOAN ORDER BY RAND() LIMIT 1), -- Tự động bốc ngẫu nhiên 1 ID CÓ THẬT
    TongTien, 
    DATE_ADD(NgayDatVe, INTERVAL 5 MINUTE), 
    'Thành công'
FROM DATVE 
WHERE TrangThai = 'Đã thanh toán';

-- Chi tiết hành khách (Giữ lại data của bạn và nhân thêm cho đủ 50 đơn)
INSERT INTO CT_DATVE (MaDatVe, MaChuyenBay, MaHangVe, HoTenHK, CCCD, NgaySinh, GioiTinh, DoiTuong, SoGhe, GiaVe, GiaHanhLy, CanNangHanhLy) VALUES 
(1, 1, 1, 'Đinh Văn Lâm', '079090123456', '2005-01-01', 'Nam', 'Người lớn', '12A', 1250000.00, 0, 7), 
(2, 12, 1, 'Nguyễn Trần Trung Quân', '079090111112', '1992-01-01', 'Nam', 'Người lớn', '14B', 4500000.00, 0, 7), 
(3, 3, 3, 'Trần Khởi My', '079090222222', '1990-02-02', 'Nữ', 'Người lớn', '02C', 3600000.00, 0, 30), 
(4, 14, 3, 'Lê Công Vinh', '079090333333', '1985-03-03', 'Nam', 'Người lớn', '01A', 12000000.00, 0, 30), 
(5, 5, 1, 'Phạm Hương', '079090444444', '1991-04-04', 'Nữ', 'Người lớn', '22E', 1200000.00, 0, 7), 
(5, 5, 1, 'Đỗ Mỹ Linh', '079090555555', '1996-05-05', 'Nữ', 'Người lớn', '22F', 1200000.00, 0, 7), 
(6, 6, 1, 'Ngô Kiến Huy', '079090666666', '1988-06-06', 'Nam', 'Người lớn', '15C', 650000.00, 0, 7), 
(7, 7, 1, 'Sơn Tùng M-TP', '079090777777', '1994-07-07', 'Nam', 'Người lớn', '10D', 1500000.00, 0, 7), 
(8, 18, 1, 'Bích Phương', '079090888888', '1989-08-08', 'Nữ', 'Người lớn', '03F', 4500000.00, 0, 30), 
(9, 9, 1, 'Hoàng Thùy Linh', '079090999999', '1988-09-09', 'Nữ', 'Người lớn', '18A', 1200000.00, 0, 7), 
(10, 12, 2, 'Isaac', '079090101010', '1988-10-10', 'Nam', 'Người lớn', '04A', 6500000.00, 0, 30), 
(11, 11, 1, 'Tóc Tiên', '079090121212', '1989-11-11', 'Nữ', 'Người lớn', '20C', 1000000.00, 0, 7), 
(12, 13, 1, 'Trấn Thành', '079090131313', '1987-12-12', 'Nam', 'Người lớn', '05C', 2500000.00, 0, 30), 
(13, 14, 2, 'Hari Won', '079090141414', '1985-06-22', 'Nữ', 'Người lớn', '11B', 7500000.00, 0, 7), 
(14, 15, 1, 'Trường Giang', '079090151515', '1983-04-20', 'Nam', 'Người lớn', '01F', 5000000.00, 0, 30), 
(15, 16, 3, 'Nhã Phương', '079090161616', '1990-05-20', 'Nữ', 'Người lớn', '16A', 15000000.00, 0, 7), 
(16, 17, 1, 'Ninh Dương Lan Ngọc', '079090171717', '1990-04-04', 'Nữ', 'Người lớn', '19D', 6000000.00, 200000, 20), 
(17, 18, 3, 'Nguyễn Thúc Thùy Tiên', '079090181818', '1998-08-12', 'Nữ', 'Người lớn', '25F', 18000000.00, 0, 7), 
(18, 1, 2, 'Lê Hoàng Ân', '079090191919', '2000-01-15', 'Nam', 'Người lớn', '02A', 1620000.00, 0, 30), 
(19, 2, 2, 'Phạm Thị Mai', '079090202020', '1995-11-25', 'Nữ', 'Người lớn', '12C', 1800000.00, 0, 7), 
(20, 2, 2, 'Bùi Anh Tuấn', '079090212121', '1991-09-09', 'Nam', 'Người lớn', '15B', 1530000.00, 0, 7), 
(21, 1, 1, 'Vương Tuấn Khải', '079090232323', '1999-09-21', 'Nam', 'Người lớn', '22A', 1200000.00, 0, 7), 
(22, 2, 1, 'Vương Nguyên', '079090242424', '2000-11-08', 'Nam', 'Người lớn', '22B', 1200000.00, 0, 7), 
(23, 3, 3, 'Dịch Dương Thiên Tỉ', '079090252525', '2000-11-28', 'Nam', 'Người lớn', '05A', 3900000.00, 0, 30), 
(24, 12, 1, 'Lưu Diệc Phi', '079090262626', '1987-08-25', 'Nữ', 'Người lớn', '06B', 4500000.00, 0, 30), 
(25, 5, 1, 'Châu Kiệt Luân', '079090272727', '1979-01-18', 'Nam', 'Người lớn', '18C', 1200000.00, 0, 7), 
(26, 6, 1, 'Lâm Chí Dĩnh', '079090282828', '1974-10-15', 'Nam', 'Người lớn', '19D', 1300000.00, 0, 7), 
(27, 12, 1, 'Hồ Ca', '079090292929', '1982-09-20', 'Nam', 'Người lớn', '02F', 4500000.00, 0, 30), 
(28, 8, 1, 'Trần Vỹ Đình', '079090303030', '1985-11-21', 'Nam', 'Người lớn', '25A', 800000.00, 0, 7), 
(29, 9, 1, 'Dương Mịch', '079090313131', '1986-09-12', 'Nữ', 'Người lớn', '26B', 800000.00, 0, 7), 
(30, 10, 3, 'Triệu Lệ Dĩnh', '079090323232', '1987-10-16', 'Nữ', 'Người lớn', '03A', 3000000.00, 0, 30),
(31, 10, 1, 'Lionel Messi', '079090323233', '1987-06-24', 'Nam', 'Người lớn', '14C', 1250000.00, 0, 7),
(32, 11, 2, 'Cristiano Ronaldo', '079090323234', '1985-02-05', 'Nam', 'Người lớn', '10F', 4500000.00, 0, 20),
(33, 1, 3, 'Karim Benzema', '079090323235', '1987-12-19', 'Nam', 'Người lớn', '01C', 3600000.00, 0, 30),
(34, 15, 3, 'Kevin De Bruyne', '079090323236', '1991-06-28', 'Nam', 'Người lớn', '02D', 12000000.00, 0, 30),
(35, 12, 1, 'Neymar Jr', '079090323237', '1992-02-05', 'Nam', 'Người lớn', '20B', 2400000.00, 0, 7),
(36, 6, 1, 'Kylian Mbappe', '079090323238', '1998-12-20', 'Nam', 'Người lớn', '12E', 650000.00, 0, 7),
(37, 7, 1, 'Erling Haaland', '079090323239', '2000-07-21', 'Nam', 'Người lớn', '05C', 1500000.00, 0, 7),
(38, 12, 1, 'Vinícius Júnior', '079090323240', '2000-07-12', 'Nam', 'Người lớn', '06A', 4500000.00, 0, 30),
(39, 4, 1, 'Jude Bellingham', '079090323241', '2003-06-29', 'Nam', 'Người lớn', '15D', 1200000.00, 0, 7),
(40, 19, 2, 'Luka Modric', '079090323242', '1985-09-09', 'Nam', 'Người lớn', '11C', 6500000.00, 0, 20),
(41, 10, 1, 'Nguyễn Quang Hải', '079090323243', '1997-04-12', 'Nam', 'Người lớn', '10B', 1000000.00, 0, 7),
(42, 13, 1, 'Đoàn Văn Hậu', '079090323244', '1999-04-19', 'Nam', 'Người lớn', '18F', 2500000.00, 0, 20),
(43, 14, 2, 'Nguyễn Tiến Linh', '079090323245', '1997-10-20', 'Nam', 'Người lớn', '04C', 7500000.00, 0, 20),
(44, 15, 1, 'Quế Ngọc Hải', '079090323246', '1993-05-15', 'Nam', 'Người lớn', '05E', 5000000.00, 0, 20),
(45, 16, 3, 'Đặng Văn Lâm', '079090323247', '1993-08-13', 'Nam', 'Người lớn', '01A', 15000000.00, 0, 30),
(46, 17, 1, 'Nguyễn Văn Toàn', '079090323248', '1996-04-12', 'Nam', 'Người lớn', '21B', 6000000.00, 0, 7),
(47, 18, 3, 'Bùi Tiến Dũng', '079090323249', '1997-02-28', 'Nam', 'Người lớn', '02E', 18000000.00, 0, 30),
(48, 1, 2, 'Nguyễn Hoàng Đức', '079090323250', '1998-01-11', 'Nam', 'Người lớn', '07C', 1620000.00, 0, 20),
(49, 2, 2, 'Đỗ Hùng Dũng', '079090323251', '1993-09-08', 'Nam', 'Người lớn', '08A', 1800000.00, 0, 20),
(50, 2, 2, 'Đinh Thị Khánh Ly', '043435457684', '2005-01-07', 'Nữ', 'Người lớn', '12B', 1530000.00, 0, 20);
