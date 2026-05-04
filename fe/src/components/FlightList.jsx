import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

// --- Các hàm Helper ---
const formatVietjetPrice = (value) => {
    if (value == null || Number.isNaN(Number(value))) return { main: '—', sub: '' };
    const num = Math.floor(Number(value));
    const mainPart = Math.floor(num / 1000).toLocaleString('vi-VN');
    const subPart = (num % 1000).toString().padStart(3, '0');
    return { main: mainPart, sub: `.${subPart} VND` };
};

const formatTimeOnly = (value) => {
    if (!value) return '--:--';
    let d;
    if (Array.isArray(value)) {
        d = new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0);
    } else if (typeof value === 'string' && value.includes('T')) {
        const [datePart, timePart] = value.split('T');
        const [y, m, day] = datePart.split('-').map(Number);
        const [h, min] = timePart.split(':').map(Number);
        d = new Date(y, m - 1, day, h, min);
    } else {
        d = new Date(value);
    }
    if (Number.isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Hàm mới: Format ngày (DD/MM/YYYY)
const formatDateOnly = (value) => {
    if (!value) return '--/--/----';
    let d;
    if (Array.isArray(value)) {
        d = new Date(value[0], value[1] - 1, value[2]);
    } else if (typeof value === 'string' && value.includes('T')) {
        const [dPart] = value.split('T');
        const [y, m, day] = dPart.split('-').map(Number);
        d = new Date(y, m - 1, day);
    } else {
        d = new Date(value);
    }
    if (Number.isNaN(d.getTime())) return '--/--/----';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Hàm mới: Tính thời gian bay
const calculateDuration = (start, end) => {
    if (!start || !end) return '--';
    const s = Array.isArray(start) ? new Date(start[0], start[1] - 1, start[2], start[3], start[4]) : new Date(start);
    const e = Array.isArray(end) ? new Date(end[0], end[1] - 1, end[2], end[3], end[4]) : new Date(end);
    const diff = e - s;
    if (diff <= 0 || Number.isNaN(diff)) return '--';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${minutes} phút`;
    return `${hours} giờ ${minutes} phút`;
};

const SoldOutBox = () => (
    <div className="flex flex-col items-center justify-center opacity-40 py-6 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-slate-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 7.5L4.5 9.75m0 0l1.125 2.25M4.5 9.75L2.25 12m2.25-2.25l2.25-1.125m12 1.125l1.125-2.25m0 0l1.125-2.25M19.5 9.75L21.75 12m-2.25-2.25l-2.25 1.125" />
        </svg>
        <span className="text-sm font-semibold text-slate-600">Hết chỗ</span>
    </div>
);

// Icon Tick xanh
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);

// Dữ liệu mô tả quyền lợi các hạng vé
const classFeatures = {
    ECO: [
        "07kg hành lý xách tay",
        "Lựa chọn chỗ ngồi tiêu chuẩn trên chuyến bay",
        "Phục vụ nước uống và thức ăn nhẹ (từ 2 tiếng)",
        "Tích lũy điểm thưởng thành viên",
    ],
    BUSINESS: [
        "Miễn phí sử dụng Phòng chờ Thương gia (Business Lounge)",
        "Ưu tiên làm thủ tục tại quầy riêng (SkyPriority)",
        "Miễn phí 14kg hành lý xách tay và 30kg hành lý ký gửi",
        "Ưu tiên qua cửa an ninh và lên tàu bay",
        "Trải nghiệm ẩm thực cao cấp với thực đơn phong phú",
    ]
};

// --- Component Chính ---
const FlightList = ({
    list,
    loading,
    error,
    origin,
    destination,
    selectedOriginIATA,
    selectedDestIATA,
    totalPassengers,
    pax
}) => {
    const navigate = useNavigate();

    // State mới: Lưu id chuyến bay VÀ tab đang mở ('itinerary' | 'business' | 'eco')
    const [expandedMenu, setExpandedMenu] = useState({ flightId: null, tab: null });

    const toggleExpand = (flightId, tab) => {
        if (expandedMenu.flightId === flightId && expandedMenu.tab === tab) {
            setExpandedMenu({ flightId: null, tab: null }); // Đóng nếu bấm lại
        } else {
            setExpandedMenu({ flightId, tab }); // Mở tab mới
        }
    };

    // Lấy tất cả các hạng vé hiện có từ danh sách chuyến bay để làm cột chuẩn
    const allTicketClasses = useMemo(() => {
        const classesMap = new Map();
        list.forEach(f => {
            if (f.chiTietHangVe) {
                f.chiTietHangVe.forEach(hv => {
                    if (!classesMap.has(hv.tenHangVe)) {
                        classesMap.set(hv.tenHangVe, hv.tenHangVe);
                    }
                });
            }
        });

        // Sắp xếp thứ tự: Phổ thông -> Phổ thông đặc biệt -> Thương gia
        const arr = Array.from(classesMap.values());
        const order = ['phổ thông', 'phổ thông đặc biệt', 'thương gia'];
        return arr.sort((a, b) => {
            const iA = order.findIndex(x => a.toLowerCase().includes(x));
            const iB = order.findIndex(x => b.toLowerCase().includes(x));
            const posA = iA !== -1 ? iA : 99;
            const posB = iB !== -1 ? iB : 99;
            return posA - posB;
        });
    }, [list]);

    return (
        <div className="mt-8 bg-white pb-10">
            {/* Header: Điểm đi -> Điểm đến */}
            {(origin || destination) && (
                <div className="border-b border-gray-200 py-4 flex flex-col items-center bg-white">
                    <div className="flex items-center gap-8">
                        <div className="text-center min-w-[120px]">
                            <div className="text-3xl font-black text-slate-900">{origin ? selectedOriginIATA : '---'}</div>
                            <div className="text-sm text-gray-600">{origin || 'Tất cả điểm đi'}</div>
                        </div>
                        <div className="text-sky-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </div>
                        <div className="text-center min-w-[120px]">
                            <div className="text-3xl font-black text-slate-900">{destination ? selectedDestIATA : '---'}</div>
                            <div className="text-sm text-gray-600">{destination || 'Tất cả điểm đến'}</div>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="m-6 rounded-xl bg-red-50 p-6 text-sm font-bold text-red-600">{error}</div>}

            {loading ? (
                <div className="py-20 text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600"></div>
                    <p className="font-black text-slate-900">Đang tải chuyến bay...</p>
                </div>
            ) : list.length === 0 ? (
                <div className="py-20 text-center">
                    <span className="mb-4 inline-block text-4xl">✈️</span>
                    <p className="font-black text-slate-900">Không tìm thấy chuyến bay phù hợp.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                        {/* Dòng tiêu đề các hạng vé */}
                        {allTicketClasses.length > 0 && (
                            <div className="flex bg-white sticky top-0 z-10 shadow-sm">
                                <div className="w-[40%] bg-white border-r border-white"></div>
                                {allTicketClasses.map((className, idx) => {
                                    const colors = ['bg-sky-500', 'bg-emerald-600', 'bg-blue-800', 'bg-amber-600'];

                                    let colorIdx = idx;
                                    if (className.toLowerCase().includes('thương gia')) colorIdx = 2;
                                    else if (className.toLowerCase().includes('đặc biệt')) colorIdx = 1;
                                    else if (className.toLowerCase().includes('phổ thông')) colorIdx = 0;

                                    const bgClass = colors[colorIdx % colors.length];
                                    return (
                                        <div key={className} className={`flex-1 ${bgClass} text-white flex items-center justify-center py-4 font-black uppercase tracking-wider text-base lg:text-lg ${idx > 0 ? 'border-l border-white/20' : ''}`}>
                                            {className.split(' (')[0]}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Danh sách chuyến bay */}
                        <div className="flex flex-col gap-[2px] bg-gray-200">
                            {list.map((f, index) => {
                                const isExpandedItinerary = expandedMenu.flightId === f.maChuyenBay && expandedMenu.tab === 'itinerary';
                                const expandedTicket = f.chiTietHangVe?.find(hv => expandedMenu.flightId === f.maChuyenBay && expandedMenu.tab === `ticket_${hv.maHangVe}`);
                                const isAnyExpanded = isExpandedItinerary || expandedTicket;

                                return (
                                    <div key={f.maChuyenBay} className="flex flex-col bg-white hover:shadow-md transition-shadow relative z-0 hover:z-10">

                                        {/* Hàng chính: Thông tin & Giá */}
                                        <div className="flex w-full">
                                            {/* CỘT 1: THÔNG TIN CHUYẾN BAY */}
                                            <div className="w-[40%] bg-sky-50 p-5 flex flex-col items-center justify-center relative border-b border-sky-200">
                                                <div className="font-medium text-sm text-sky-900 mb-2">{f.maChuyenBay}</div>
                                                <div className="flex items-baseline gap-3 mb-2">
                                                    <span className="text-4xl font-black text-slate-900">{formatTimeOnly(f.ngayGioKhoiHanh)}</span>
                                                    <span className="text-sm font-medium text-slate-500 px-2">Đến</span>
                                                    <span className="text-4xl font-black text-slate-900">{formatTimeOnly(f.ngayGioHaCanh)}</span>
                                                </div>
                                                <div className="text-sm text-slate-600 mb-4">
                                                    Máy bay thương mại - <span className="font-bold text-sky-700">
                                                        {f.danhSachTrungGian && f.danhSachTrungGian.length > 0 
                                                            ? `${f.danhSachTrungGian.length} điểm dừng` 
                                                            : 'Bay thẳng'}
                                                    </span>
                                                </div>

                                                {/* Nút mũi tên xổ xuống cho Lịch trình */}
                                                <div
                                                    onClick={() => toggleExpand(f.maChuyenBay, 'itinerary')}
                                                    className={`absolute bottom-1 cursor-pointer flex items-center justify-center p-1.5 rounded-full transition-colors opacity-70 hover:opacity-100 ${isExpandedItinerary ? 'text-red-600 bg-red-50' : 'text-sky-700 hover:bg-sky-200'}`}
                                                >
                                                    <span className="text-xs font-bold mr-1">Chi tiết chuyến bay</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isExpandedItinerary ? 'rotate-180' : ''}`}>
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* CÁC CỘT HẠNG VÉ (Dynamic từ chiTietHangVe) */}
                                            {allTicketClasses.length > 0 && allTicketClasses.map((className, idx) => {
                                                const hv = f.chiTietHangVe?.find(x => x.tenHangVe === className);
                                                const isSoldOut = !hv || hv.soLuongChoConLai <= 0;
                                                const isExpanded = hv && expandedMenu.flightId === f.maChuyenBay && expandedMenu.tab === `ticket_${hv.maHangVe}`;

                                                let colorIdx = idx;
                                                if (className.toLowerCase().includes('thương gia')) colorIdx = 2;
                                                else if (className.toLowerCase().includes('đặc biệt')) colorIdx = 1;
                                                else if (className.toLowerCase().includes('phổ thông')) colorIdx = 0;

                                                const colorsHover = ['hover:bg-sky-50', 'hover:bg-emerald-50', 'hover:bg-blue-50', 'hover:bg-amber-50'];
                                                const hoverClass = colorsHover[colorIdx % colorsHover.length];

                                                const textColors = ['text-sky-600', 'text-emerald-600', 'text-blue-800', 'text-amber-600'];
                                                const textColor = textColors[colorIdx % 4];

                                                const btnColors = ['hover:bg-sky-500', 'hover:bg-emerald-600', 'hover:bg-blue-800', 'hover:bg-amber-600'];
                                                const btnColor = btnColors[colorIdx % 4];

                                                return (
                                                    <div key={className} className={`flex-1 border-l border-gray-200 flex flex-col items-center justify-center ${!isSoldOut ? hoverClass : ''} transition-colors relative pb-6`}>
                                                        {isSoldOut ? <SoldOutBox /> : (
                                                            <>
                                                                <div className="text-center pt-8 pb-4 w-full h-full flex flex-col items-center justify-center group">
                                                                    <div className="text-2xl lg:text-3xl font-black text-gray-800 leading-tight">{formatVietjetPrice(hv.gia).main}</div>
                                                                    <div className="text-xs lg:text-sm font-bold text-gray-400 italic mb-3 leading-tight">{formatVietjetPrice(hv.gia).sub}</div>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (!authService.getCurrentUser()) {
                                                                                navigate('/login', { state: { from: '/flight' } });
                                                                            } else {
                                                                                navigate('/flight-detail', { state: { flight: f, totalPassengers, pax, ticketClassDetail: hv } });
                                                                            }
                                                                        }}
                                                                        className={`px-4 lg:px-6 py-2 rounded-full bg-slate-100 text-xs lg:text-sm font-bold text-slate-500 ${btnColor} hover:text-white transition-colors`}
                                                                    >
                                                                        Chọn vé
                                                                    </button>
                                                                </div>
                                                                {/* Nút mũi tên */}
                                                                <div
                                                                    onClick={() => toggleExpand(f.maChuyenBay, `ticket_${hv.maHangVe}`)}
                                                                    className={`absolute bottom-2 cursor-pointer flex items-center justify-center p-1 rounded transition-colors text-[10px] lg:text-xs font-semibold ${isExpanded ? textColor : 'text-slate-400 hover:' + textColor}`}
                                                                >
                                                                    Chi tiết vé
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 lg:w-4 lg:h-4 ml-0.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* HÀNG MỞ RỘNG (Render dựa theo tab nào đang được bấm) */}
                                        {isAnyExpanded && (
                                            <div className="w-full bg-slate-50 border-t border-sky-100 shadow-inner overflow-hidden animate-[fadeIn_0.2s_ease-in-out]">

                                                {/* 1. NẾU MỞ TAB LỊCH TRÌNH (Giống hệt ảnh bạn gửi) */}
                                                {isExpandedItinerary && (
                                                    <div className="p-8 px-12 text-sm">
                                                        {/* Số hiệu chuyến bay */}
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                                                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                                            </svg>
                                                            <span className="text-base text-slate-700">Số hiệu chuyến bay: <span className="text-red-600 font-bold">{f.maChuyenBay}</span></span>
                                                        </div>

                                                        {/* Timeline */}
                                                        <div className="relative pl-6 ml-2 border-l border-gray-300 flex flex-col gap-6 py-1">
                                                            {/* Điểm khởi hành */}
                                                            <div className="relative">
                                                                <div className="absolute -left-[30px] top-1 bg-slate-50 rounded-full p-0.5">
                                                                    <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-slate-50"></div>
                                                                </div>
                                                                <div className="flex">
                                                                    <div className="w-24 text-slate-800 text-base">Khởi hành:</div>
                                                                    <div>
                                                                        <div className="text-black font-medium text-base mb-1">{formatTimeOnly(f.ngayGioKhoiHanh)}, {formatDateOnly(f.ngayGioKhoiHanh)} (Giờ địa phương)</div>
                                                                        <div className="text-black text-base">{f.maSanBayDi?.thanhPho || origin || 'Sân bay đi'}</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Điểm trung gian (nếu có) */}
                                                            {f.danhSachTrungGian && f.danhSachTrungGian.length > 0 && f.danhSachTrungGian.map((tg, i) => {
                                                                const tgName = tg.sanBay?.thanhPho || tg.sanBay?.tenSanBay || tg.maSanBayTG?.thanhPho || tg.maSanBayTG?.tenSanBay || `Sân bay ID: ${tg.maSanBayTG || '?'}`;
                                                                return (
                                                                    <div key={i} className="relative mt-2">
                                                                        <div className="absolute -left-[30px] top-1 bg-slate-50 rounded-full p-0.5">
                                                                            <div className="w-3 h-3 rounded-full border-2 border-orange-400 bg-slate-50"></div>
                                                                        </div>
                                                                        <div className="flex">
                                                                            <div className="w-24 text-slate-800 text-base">Trạm dừng:</div>
                                                                            <div>
                                                                                <div className="text-black font-medium text-base mb-1">Dừng {tg.thoiGianDung} phút</div>
                                                                                <div className="text-black text-base">{tgName}</div>
                                                                                {tg.ghiChu && <div className="text-gray-500 text-sm mt-0.5">{tg.ghiChu}</div>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}

                                                            {/* Điểm đến */}
                                                            <div className="relative mt-2">
                                                                <div className="absolute -left-[30px] top-1 bg-slate-50 rounded-full p-0.5">
                                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                </div>
                                                                <div className="flex">
                                                                    <div className="w-24 text-slate-800 text-base">Đến:</div>
                                                                    <div>
                                                                        <div className="text-black font-medium text-base mb-1">{formatTimeOnly(f.ngayGioHaCanh)}, {formatDateOnly(f.ngayGioHaCanh)} (Giờ địa phương)</div>
                                                                        <div className="text-black text-base">{f.maSanBayDen?.thanhPho || destination || 'Sân bay đến'}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Footer Thông tin */}
                                                        <div className="flex gap-4 items-center text-base text-black mt-6 ml-8">
                                                            <div>Thời gian: <span className="text-red-500">{calculateDuration(f.ngayGioKhoiHanh, f.ngayGioHaCanh)}</span></div>
                                                            <div>Máy bay: <span className="text-red-500">{f.maMayBay?.tenMayBay || 'A320B'}</span></div>
                                                            <div>Khai thác bởi: <span className="text-red-500">{f.maHangHK?.tenHang || 'FlyViet'}</span></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 2. NẾU MỞ TAB CHI TIẾT HẠNG VÉ */}
                                                {expandedTicket && (
                                                    <div className="p-8 w-full flex justify-center bg-sky-50/30">
                                                        <div className="w-2/3 bg-white p-6 rounded-xl shadow-sm border border-sky-100">
                                                            <h4 className="font-bold text-lg mb-4 text-sky-800 border-b border-sky-50 pb-2">Quyền lợi vé {expandedTicket.tenHangVe}</h4>
                                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                                                {(expandedTicket.tenHangVe.toLowerCase().includes('thương gia') ? classFeatures.BUSINESS : classFeatures.ECO).map((feature, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                                        <CheckIcon /> <span>{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightList;

