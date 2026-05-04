import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingSummary from '../../components/BookingSummary';
import PartnerBanks from '../../components/PartnerBanks';

// --- Helpers ---
const formatMoneyVND = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return Number(value).toLocaleString('vi-VN') + ' VNĐ';
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

const formatDateShort = (value) => {
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
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[d.getDay()];
    return `${dayName}, ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
};

const SEAT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

// --- Dữ liệu gói hành lý ---
const BAGGAGE_OPTIONS = [
    {
        id: 'none',
        label: 'Không thêm hành lý',
        weight: null,
        price: 0,
        description: 'Chỉ bao gồm 7kg hành lý xách tay miễn phí.',
        icon: '🚫',
        tag: null,
    },
    {
        id: '15kg',
        label: 'Hành lý 15kg',
        weight: 15,
        price: 150000,
        description: '1 kiện ký gửi tối đa 15kg. Phù hợp cho chuyến đi ngắn ngày.',
        icon: '🧳',
        tag: null,
    },
    {
        id: '20kg',
        label: 'Hành lý 20kg',
        weight: 20,
        price: 220000,
        description: '1 kiện ký gửi tối đa 20kg. Lựa chọn phổ biến nhất cho hành khách.',
        icon: '🧳',
        tag: 'Phổ biến',
    },
    {
        id: '30kg',
        label: 'Hành lý 30kg',
        weight: 30,
        price: 320000,
        description: '1 kiện ký gửi tối đa 30kg. Lý tưởng cho chuyến đi dài hoặc gia đình.',
        icon: '🧳',
        tag: 'Tiết kiệm',
    },
];

// --- Dữ liệu gói bảo hiểm ---
const INSURANCE_OPTIONS = [
    {
        id: 'none',
        label: 'Không mua bảo hiểm',
        price: 0,
        description: 'Bạn tự chịu rủi ro trong suốt hành trình.',
        icon: '🚫',
        tag: null,
        benefits: [],
    },
    {
        id: 'basic',
        label: 'Gói Cơ Bản',
        price: 55000,
        description: 'Bảo vệ cơ bản cho chuyến bay của bạn với các quyền lợi thiết yếu.',
        icon: '🛡️',
        tag: null,
        benefits: [
            { icon: '✈️', text: 'Trễ chuyến bay (bồi thường đến 500.000đ)' },
            { icon: '🧳', text: 'Mất/hư hỏng hành lý (bồi thường đến 2.000.000đ)' },
            { icon: '🏥', text: 'Chi phí y tế khẩn cấp (đến 10.000.000đ)' },
        ],
    },
    {
        id: 'premium',
        label: 'Gói Cao Cấp',
        price: 120000,
        description: 'Bảo hiểm toàn diện — tâm lý thoải mái suốt hành trình.',
        icon: '🛡️',
        tag: 'Khuyên dùng',
        benefits: [
            { icon: '✈️', text: 'Hủy/hoãn chuyến (bồi thường đến 5.000.000đ)' },
            { icon: '🧳', text: 'Mất/hư hỏng hành lý (bồi thường đến 5.000.000đ)' },
            { icon: '🏥', text: 'Chi phí y tế & cấp cứu (đến 50.000.000đ)' },
            { icon: '🌐', text: 'Hỗ trợ toàn cầu 24/7' },
            { icon: '💼', text: 'Bồi thường tai nạn cá nhân (đến 100.000.000đ)' },
        ],
    },
];

export default function FlightDetail() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const flight = state?.flight;
    const ticketClassDetail = state?.ticketClassDetail;
    const ticketClass = state?.ticketClass || (ticketClassDetail?.tenHangVe) || 'ECO';
    const initialTotal = state?.totalPassengers || 1;
    const [pax, setPax] = useState(state?.pax || { adult: initialTotal, child: 0, infant: 0 });
    const totalPassengers = pax.adult + pax.child + pax.infant;

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [seatCompartments, setSeatCompartments] = useState([]);
    const [expandedSection, setExpandedSection] = useState(null);

    // Hành lý & bảo hiểm state
    const [selectedBaggage, setSelectedBaggage] = useState('none');
    const [selectedInsurance, setSelectedInsurance] = useState('none');

    useEffect(() => {
        window.scrollTo(0, 0); // Đảm bảo trang bắt đầu ở trên cùng
        if (!flight) { navigate('/flight'); return; }
        const fetchBookedSeats = async () => {
            try {
                const flightId = flight.id || flight.maChuyenBay;
                if (!flightId) return;
                const backendBooked = await authService.getBookedSeats(flightId);
                setOccupiedSeats(backendBooked || []);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách ghế thực tế:', error);
                setOccupiedSeats([]);
            }
        };

        const totalSeats = flight.soLuongCho || 120;
        let compartments = [];
        if (flight.chiTietHangVe && flight.chiTietHangVe.length > 0) {
            compartments = [...flight.chiTietHangVe].sort((a, b) => {
                const getRank = t => t.toLowerCase().includes('thương gia') ? 1 : (t.toLowerCase().includes('đặc biệt') ? 2 : 3);
                return getRank(a.tenHangVe) - getRank(b.tenHangVe);
            });
        } else {
            compartments = [{ tenHangVe: 'Phổ thông', soLuongCho: totalSeats, soLuongChoConLai: totalSeats }];
        }

        let currentIndex = 0;
        const compData = compartments.map(c => {
            const start = currentIndex;
            currentIndex += (c.soLuongCho || 0);
            const end = currentIndex;
            return { ...c, start, end };
        });
        setSeatCompartments(compData);
        fetchBookedSeats();
    }, [flight, navigate]);

    if (!flight) return null;

    const toggleSeat = (seatId) => {
        if (occupiedSeats.includes(seatId)) return;
        setSelectedSeats(prev => {
            const isRemoving = prev.includes(seatId);
            if (!isRemoving && prev.length >= totalPassengers) {
                // Nếu chỉ có 1 khách, cho phép đổi ghế (swap)
                if (totalPassengers === 1) return [seatId];
                // Nếu nhiều khách, yêu cầu bỏ chọn ghế cũ trước khi chọn ghế mới
                return prev;
            }
            return isRemoving ? prev.filter(s => s !== seatId) : [...prev, seatId];
        });
    };

    const basePrice = ticketClassDetail ? ticketClassDetail.gia : (ticketClass === 'BUSINESS' ? (flight.giaThuongGia || flight.giaCoBan * 2.5) : (flight.giaPhoThong || flight.giaCoBan || 0));
    const totalTicketPrice = basePrice * totalPassengers;
    // Giá từ DB đã bao gồm thuế và phí — không cộng thêm thuế tự sinh nữa

    const baggageOption = BAGGAGE_OPTIONS.find(o => o.id === selectedBaggage);
    const insuranceOption = INSURANCE_OPTIONS.find(o => o.id === selectedInsurance);
    const baggageTotal = (baggageOption?.price || 0) * totalPassengers;
    const insuranceTotal = (insuranceOption?.price || 0) * totalPassengers;

    const finalTotal = totalTicketPrice + baggageTotal + insuranceTotal;

    const toggleSection = (section) => setExpandedSection(expandedSection === section ? null : section);

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans flex flex-col" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                `}
            </style>

            <div className="relative z-10 w-full flex-grow">
                <Navbar transparent={false} />

                <div className="mx-auto w-[min(1200px,96vw)] pt-[100px] pb-10 grid lg:grid-cols-[1fr_360px] gap-6 items-start">

                    {/* --- CỘT TRÁI --- */}
                    <div className="flex flex-col gap-5">
                        <h2 className="text-xl font-bold text-sky-700 mb-1">
                            Hoàn thiện chuyến bay của bạn
                        </h2>

                        {/* ── Accordion 1: Chọn chỗ ngồi ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => toggleSection('seat')}
                                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-bold text-slate-800">Chọn chỗ ngồi yêu thích</h3>
                                        <p className="text-sm font-medium text-slate-500">Hãy chọn chỗ ngồi yêu thích của bạn</p>
                                    </div>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-6 h-6 text-slate-400 transition-transform ${expandedSection === 'seat' ? 'rotate-90' : ''}`}><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                            </button>

                            {expandedSection === 'seat' && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                    <div className="mb-6 flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-600 bg-white p-3 rounded-xl shadow-sm w-max mx-auto border border-slate-200">
                                        <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border-[1px] border-sky-700 bg-sky-600" /> Phổ thông</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border-[1px] border-emerald-700 bg-emerald-600" /> Đặc biệt</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border-[1px] border-blue-900 bg-blue-800" /> Thương gia</span>
                                        <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded border-[1px] border-amber-600 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Đang chọn</span>
                                        <span className="inline-flex items-center gap-2 text-slate-400"><span className="h-4 w-4 rounded border-2 border-slate-200 bg-slate-200 flex items-center justify-center text-[10px] font-black">×</span> Đã đặt / Khóa</span>
                                    </div>
                                    <div className="mx-auto w-max rounded-[40px] border-[10px] border-slate-300 bg-white px-8 py-10 shadow-inner">
                                        {Array.from({ length: Math.ceil((flight.soLuongCho || 120) / 6) }).map((_, rIdx) => {
                                            const rowNum = rIdx + 1;
                                            const totalSeats = flight.soLuongCho || 120;
                                            const leftSeats = SEAT_COLS.slice(0, 3);
                                            const rightSeats = SEAT_COLS.slice(3, 6);

                                            const renderSeat = (c) => {
                                                const seatIndex = rIdx * 6 + SEAT_COLS.indexOf(c);
                                                if (seatIndex >= totalSeats) return <div key={`empty-${rowNum}-${c}`} className="w-10 h-10" />;

                                                const seatId = `${rowNum}${c}`;
                                                const isOccupied = occupiedSeats.includes(seatId);
                                                const isSelected = selectedSeats.includes(seatId);

                                                const comp = seatCompartments.find(comp => seatIndex >= comp.start && seatIndex < comp.end);
                                                const isMyClass = ticketClassDetail && comp ? (comp.maHangVe === ticketClassDetail.maHangVe) : true;

                                                let baseClass = 'border-slate-300 bg-white text-slate-600';
                                                if (comp) {
                                                    if (comp.tenHangVe.toLowerCase().includes('thương gia')) baseClass = 'border-blue-900 bg-blue-800 text-white';
                                                    else if (comp.tenHangVe.toLowerCase().includes('đặc biệt')) baseClass = 'border-emerald-700 bg-emerald-600 text-white';
                                                    else if (comp.tenHangVe.toLowerCase().includes('phổ thông')) baseClass = 'border-sky-700 bg-sky-600 text-white';
                                                }

                                                const base = 'h-10 w-10 rounded-lg border-[1px] text-sm font-black transition-all flex items-center justify-center';

                                                let cls = '';
                                                if (isOccupied) {
                                                    cls = 'border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed';
                                                } else if (isSelected) {
                                                    cls = 'border-amber-600 bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.6)] scale-110 z-10';
                                                } else if (!isMyClass) {
                                                    cls = `${baseClass} opacity-20 cursor-not-allowed grayscale-[0.5]`;
                                                } else {
                                                    let hoverCls = '';
                                                    if (comp) {
                                                        if (comp.tenHangVe.toLowerCase().includes('thương gia')) hoverCls = 'hover:bg-blue-900';
                                                        else if (comp.tenHangVe.toLowerCase().includes('đặc biệt')) hoverCls = 'hover:bg-emerald-800';
                                                        else if (comp.tenHangVe.toLowerCase().includes('phổ thông')) hoverCls = 'hover:bg-sky-700';
                                                    }
                                                    cls = `${baseClass} ${hoverCls} cursor-pointer shadow-md active:scale-90`;
                                                }

                                                return (
                                                    <button key={seatId} type="button" onClick={() => toggleSeat(seatId)} disabled={isOccupied || !isMyClass} title={`${seatId} ${comp ? '- ' + comp.tenHangVe : ''}`} className={`${base} ${cls}`}>
                                                        {isOccupied ? '×' : (isSelected ? c : '')}
                                                    </button>
                                                );
                                            };
                                            return (
                                                <div key={rowNum} className="mb-3 flex items-center justify-center gap-6">
                                                    <div className="flex gap-2">{leftSeats.map(renderSeat)}</div>
                                                    <span className="w-6 text-center text-sm font-black text-slate-400 bg-slate-100 rounded-full py-1">{rowNum}</span>
                                                    <div className="flex gap-2">{rightSeats.map(renderSeat)}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm font-bold text-slate-700">Đã chọn: <span className="text-sky-600">{selectedSeats.length}/{totalPassengers}</span> ghế</p>
                                        <div className="mt-2 flex justify-center flex-wrap gap-2">
                                            {selectedSeats.map(s => <span key={s} className="px-3 py-1 bg-sky-100 text-sky-800 font-black rounded-lg text-sm border border-sky-200">{s}</span>)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Accordion 2: Hành lý ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => toggleSection('baggage')}
                                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-bold text-slate-800">Chọn hành lý</h3>
                                        <p className="text-sm font-medium text-slate-500">
                                            {flight.maSanBayDi?.maIATA || 'SGN'} ✈ {flight.maSanBayDen?.maIATA || 'VCL'} · Miễn phí 7kg xách tay
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-sky-600 text-lg">{formatMoneyVND(baggageTotal)}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-6 h-6 text-slate-400 transition-transform ${expandedSection === 'baggage' ? 'rotate-90' : ''}`}><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                                </div>
                            </button>

                            {expandedSection === 'baggage' && (
                                <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                                    {/* Thông tin hành lý xách tay miễn phí */}
                                    <div className="mb-4 flex items-start gap-3 bg-sky-50 border border-sky-100 rounded-xl p-4">
                                        <span className="text-2xl">ℹ️</span>
                                        <div className="text-sm text-sky-800">
                                            <p className="font-bold mb-0.5">Hành lý xách tay miễn phí</p>
                                            <p className="font-medium text-sky-700">Mỗi hành khách được mang <b>1 túi xách tay tối đa 7kg</b> và 1 vật dụng cá nhân (ví, ba lô nhỏ). Kích thước tối đa: 56 × 36 × 23cm.</p>
                                        </div>
                                    </div>

                                    {/* Danh sách gói hành lý ký gửi */}
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Hành lý ký gửi — chọn 1 gói/người</p>
                                    <div className="flex flex-col gap-3">
                                        {BAGGAGE_OPTIONS.map(opt => {
                                            const isSelected = selectedBaggage === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setSelectedBaggage(opt.id)}
                                                    className={`relative w-full text-left rounded-xl border-2 p-4 transition-all ${isSelected ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                >
                                                    {opt.tag && (
                                                        <span className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                            {opt.tag}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        {/* Radio indicator */}
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-slate-300'}`}>
                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                        <span className="text-2xl">{opt.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-bold text-slate-800 text-sm">{opt.label}</span>
                                                                <span className={`font-black text-base flex-shrink-0 ${opt.price === 0 ? 'text-emerald-600' : 'text-sky-600'}`}>
                                                                    {opt.price === 0 ? 'Miễn phí' : `+${formatMoneyVND(opt.price)}/người`}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{opt.description}</p>
                                                            {opt.weight && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                                                        ⚖️ Tối đa {opt.weight}kg
                                                                    </span>
                                                                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                                                                        📦 1 kiện
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Tổng tiền nếu nhiều hành khách */}
                                                    {opt.price > 0 && totalPassengers > 1 && isSelected && (
                                                        <div className="mt-3 pt-3 border-t border-sky-100 flex justify-between items-center text-xs text-sky-700 font-bold">
                                                            <span>{formatMoneyVND(opt.price)} × {totalPassengers} hành khách</span>
                                                            <span className="text-sky-600">= {formatMoneyVND(opt.price * totalPassengers)}</span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Lưu ý thêm hành lý */}
                                    <p className="mt-4 text-xs text-slate-400 font-medium text-center">
                                        ⚠️ Vượt quá cân nặng cho phép sẽ bị tính phụ phí tại sân bay. Khuyến khích mua trước để tiết kiệm chi phí.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Accordion 3: Bảo hiểm ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => toggleSection('insurance')}
                                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-bold text-slate-800">Bảo hiểm du lịch</h3>
                                        <p className="text-sm font-medium text-slate-500">
                                            {flight.maSanBayDi?.maIATA || 'SGN'} ✈ {flight.maSanBayDen?.maIATA || 'VCL'} · Bảo vệ chuyến đi của bạn
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-sky-600 text-lg">{formatMoneyVND(insuranceTotal)}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-6 h-6 text-slate-400 transition-transform ${expandedSection === 'insurance' ? 'rotate-90' : ''}`}><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                                </div>
                            </button>

                            {expandedSection === 'insurance' && (
                                <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                                    {/* Banner giới thiệu */}
                                    <div className="mb-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <span className="text-2xl">🛡️</span>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-bold mb-0.5">Tại sao nên mua bảo hiểm?</p>
                                            <p className="font-medium text-blue-700">Chuyến bay có thể bị hoãn, hành lý có thể bị thất lạc. Bảo hiểm du lịch giúp bạn yên tâm và được bồi thường nhanh chóng khi sự cố xảy ra.</p>
                                        </div>
                                    </div>

                                    {/* Các gói bảo hiểm */}
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Chọn gói bảo hiểm</p>
                                    <div className="flex flex-col gap-3">
                                        {INSURANCE_OPTIONS.map(opt => {
                                            const isSelected = selectedInsurance === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setSelectedInsurance(opt.id)}
                                                    className={`relative w-full text-left rounded-xl border-2 p-4 transition-all ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                >
                                                    {opt.tag && (
                                                        <span className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                            {opt.tag}
                                                        </span>
                                                    )}
                                                    <div className="flex items-start gap-3">
                                                        {/* Radio indicator */}
                                                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                        </div>
                                                        <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="font-bold text-slate-800 text-sm">{opt.label}</span>
                                                                <span className={`font-black text-base flex-shrink-0 ${opt.price === 0 ? 'text-slate-400' : 'text-blue-600'}`}>
                                                                    {opt.price === 0 ? 'Không mua' : `+${formatMoneyVND(opt.price)}/người`}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium mt-0.5">{opt.description}</p>

                                                            {/* Danh sách quyền lợi */}
                                                            {opt.benefits.length > 0 && (
                                                                <ul className="mt-3 flex flex-col gap-1.5">
                                                                    {opt.benefits.map((b, i) => (
                                                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                                                            <span className="flex-shrink-0">{b.icon}</span>
                                                                            <span>{b.text}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}

                                                            {/* Tổng tiền nhiều hành khách */}
                                                            {opt.price > 0 && totalPassengers > 1 && isSelected && (
                                                                <div className="mt-3 pt-3 border-t border-blue-100 flex justify-between items-center text-xs text-blue-700 font-bold">
                                                                    <span>{formatMoneyVND(opt.price)} × {totalPassengers} hành khách</span>
                                                                    <span className="text-blue-600">= {formatMoneyVND(opt.price * totalPassengers)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-4 text-xs text-slate-400 font-medium text-center">
                                        📄 Bảo hiểm có hiệu lực từ khi xuất vé đến khi hoàn thành hành trình. Điều khoản áp dụng theo quy định của công ty bảo hiểm.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bank Partner Grid */}
                        <PartnerBanks />
                    </div>

                    {/* --- CỘT PHẢI: THÔNG TIN ĐẶT CHỖ --- */}
                    <BookingSummary
                        flight={flight}
                        pax={pax}
                        selectedSeats={selectedSeats}
                        totalPrice={finalTotal}
                        selectedBaggage={baggageOption}
                        selectedInsurance={insuranceOption}
                        ticketClass={ticketClass}
                        ticketClassDetail={ticketClassDetail}
                        actionButton={
                            <>
                                <button
                                    onClick={() => navigate('/orders', {
                                        state: {
                                            flight, pax, selectedSeats,
                                            selectedBaggage: baggageOption,
                                            selectedInsurance: insuranceOption,
                                            totalPrice: finalTotal,
                                            ticketClass,
                                            ticketClassDetail,
                                        }
                                    })}
                                    disabled={selectedSeats.length !== totalPassengers}
                                    className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {selectedSeats.length === totalPassengers ? 'Đi tiếp' : `Chọn thêm ${totalPassengers - selectedSeats.length} ghế`}
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-full mt-2 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Quay lại
                                </button>
                            </>
                        }
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
}