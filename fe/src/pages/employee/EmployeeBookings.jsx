import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import EmployeeSidebar from '../../components/EmployeeSidebar';

// --- Icons ---
const PlaneTakeoffIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12l5-5 1.5-.5a2 2 0 0 1 2.81.7l4 5.6c.55.77.46 1.81-.28 2.45L12 21Z"/></svg>;
const PlaneLandingIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M2 15h20"/><path d="M10 15V8.5a2.5 2.5 0 0 1 5 0V15"/><path d="M14 15l4-5 3.3.66a2 2 0 0 1 1.56 2.3l-.56 2.04"/></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// --- Data Constants ---
const BAGGAGE_OPTIONS = [
    { id: 'none', label: 'Mặc định (7kg)', weight: 0, price: 0 },
    { id: '15kg', label: '15kg', weight: 15, price: 150000 },
    { id: '20kg', label: '20kg', weight: 20, price: 220000 },
    { id: '30kg', label: '30kg', weight: 30, price: 320000 },
];

const INSURANCE_OPTIONS = [
    { id: 'none', label: 'Không bảo hiểm', price: 0 },
    { id: 'basic', label: 'Cơ bản (55k)', price: 55000 },
    { id: 'premium', label: 'Cao cấp (120k)', price: 120000 },
];

const SEAT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

// --- Helpers ---
const formatTimeOnly = (value) => {
    if (!value) return '--:--';
    let d;
    if (Array.isArray(value)) d = new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0);
    else d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatMoney = (v) => Number(v || 0).toLocaleString('vi-VN') + ' VNĐ';

const EmployeeBookings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [flights, setFlights] = useState([]);
    const [airports, setAirports] = useState([]);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [paxCount, setPaxCount] = useState({ adult: 1, child: 0, infant: 0 });
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [selectedTicketClass, setSelectedTicketClass] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [seatCompartments, setSeatCompartments] = useState([]);
    const [showSeatModal, setShowSeatModal] = useState(false);
    const [currentPaxIndex, setCurrentPaxIndex] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const [originOpen, setOriginOpen] = useState(false);
    const [destOpen, setDestOpen] = useState(false);
    const [paxOpen, setPaxOpen] = useState(false);
    const [searchTextOrigin, setSearchTextOrigin] = useState('');
    const [searchTextDest, setSearchTextDest] = useState('');

    const originRef = useRef(null);
    const destRef = useRef(null);
    const paxRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [aptData, fltData] = await Promise.all([
                authService.getAllAirports(),
                authService.getAllFlights()
            ]);
            setAirports(Array.isArray(aptData) ? aptData : []);
            setFlights(Array.isArray(fltData) ? fltData : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setSelectedFlight(null);
        try {
            const data = await authService.searchFlights(origin, destination, date);
            setFlights(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const selectFlight = async (f) => {
        setLoading(true);
        setSelectedFlight(f);
        if (f.chiTietHangVe?.length > 0) setSelectedTicketClass(f.chiTietHangVe[0]);
        
        try {
            const booked = await authService.getBookedSeats(f.maChuyenBay || f.id);
            setOccupiedSeats(booked || []);
        } catch (e) { setOccupiedSeats([]); }

        const totalSeats = f.soLuongCho || 120;
        let compartments = [];
        if (f.chiTietHangVe && f.chiTietHangVe.length > 0) {
            compartments = [...f.chiTietHangVe].sort((a, b) => {
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
        
        const total = paxCount.adult + paxCount.child + paxCount.infant;
        setPassengers(Array.from({ length: total }).map((_, i) => ({
            id: i, fullName: '', cccd: '', dob: '', gioiTinh: 'Nam', seat: null, baggage: 'none', insurance: 'none'
        })));
        setLoading(false);
    };

    const handleBooking = async () => {
        if (!selectedFlight || !selectedTicketClass) return;
        if (passengers.some(p => !p.fullName || !p.cccd || !p.seat)) {
            alert("Vui lòng nhập đầy đủ tên, CCCD và chọn chỗ ngồi cho tất cả hành khách.");
            return;
        }
        setLoading(true);
        try {
            const total = calculateTotal();
            const requestData = {
                maNguoiDung: user?.user?.maNguoiDung || user?.user?.id || user?.id,
                tongTien: total,
                passengers: passengers.map(p => ({
                    maChuyenBay: selectedFlight.maChuyenBay || selectedFlight.id,
                    maHangVe: selectedTicketClass?.maHangVe,
                    hoTenHK: p.fullName,
                    cccd: p.cccd,
                    ngaySinh: p.dob,
                    gioiTinh: p.gioiTinh,
                    doiTuong: 'NGUOI_LON',
                    soGhe: p.seat,
                    giaVe: selectedTicketClass?.gia,
                    giaHanhLy: BAGGAGE_OPTIONS.find(o => o.id === p.baggage)?.price || 0,
                    canNangHanhLy: BAGGAGE_OPTIONS.find(o => o.id === p.baggage)?.weight || 0,
                    giaBaoHiem: INSURANCE_OPTIONS.find(o => o.id === p.insurance)?.price || 0,
                    trangThaiThanhToan: paymentMethod === 'CASH' ? 'Đã thanh toán' : 'Chưa thanh toán'
                })),
                phuongThucThanhToan: paymentMethod,
                trangThaiThanhToan: paymentMethod === 'CASH' ? 'Đã thanh toán' : 'Chưa thanh toán'
            };
            const response = await api.post('/api/bookings', requestData);
            
            if (paymentMethod === 'VNPAY') {
                const paymentRes = await api.post('/api/payment/vnpay', {
                    amount: total,
                    bookingId: response.data.maDatVe
                });
                if (paymentRes.data?.data) {
                    window.location.href = paymentRes.data.data;
                    return;
                }
            }

            alert("Đã xuất vé và thanh toán thành công!");
            setSelectedFlight(null);
            fetchInitialData();
        } catch (e) {
            alert("Lỗi: " + (e.response?.data?.message || e.message));
        } finally { setLoading(false); }
    };

    const calculateTotal = () => {
        if (!selectedTicketClass) return 0;
        return passengers.reduce((sum, p) => {
            const bPrice = BAGGAGE_OPTIONS.find(o => o.id === p.baggage)?.price || 0;
            const iPrice = INSURANCE_OPTIONS.find(o => o.id === p.insurance)?.price || 0;
            return sum + (selectedTicketClass.gia || 0) + bPrice + iPrice;
        }, 0);
    };

    const openSeatMap = (idx) => {
        setCurrentPaxIndex(idx);
        setShowSeatModal(true);
    };

    const selectSeat = (seatId) => {
        const newPass = [...passengers];
        if (newPass.some((p, i) => i !== currentPaxIndex && p.seat === seatId)) {
            alert("Ghế này đã được chọn bởi hành khách khác.");
            return;
        }
        newPass[currentPaxIndex].seat = seatId;
        setPassengers(newPass);
        setShowSeatModal(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <Navbar />
            <div className="flex flex-1 pt-20">
                <EmployeeSidebar user={user} handleLogout={() => { authService.logout(); navigate('/login'); }} />
                
                <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
                    <div className="max-w-[1400px] mx-auto">
                        <header className="mb-8 flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800 tracking-tight">Bán vé & Dịch vụ</h1>
                                <p className="text-gray-500 font-medium">Bán vé, chọn chỗ, hành lý và bảo hiểm tại quầy.</p>
                            </div>
                            {selectedFlight && (
                                <button onClick={() => setSelectedFlight(null)} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">Quay lại tìm kiếm</button>
                            )}
                        </header>

                        {!selectedFlight ? (
                            <>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
                                    <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                        <div className="relative bg-white rounded-xl p-2 border border-gray-100" ref={originRef}>
                                            <label className="px-2 block text-[10px] font-black uppercase text-gray-400">Điểm đi</label>
                                            <button type="button" onClick={() => setOriginOpen(!originOpen)} className="flex h-9 w-full items-center justify-between px-2 text-sm font-bold text-gray-800">
                                                <span className="truncate">{origin || 'Chọn điểm đi'}</span>
                                                <PlaneTakeoffIcon />
                                            </button>
                                            {originOpen && (
                                                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[280px] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                                                    <div className="p-3 border-b"><input autoFocus placeholder="Tìm..." className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold" value={searchTextOrigin} onChange={e => setSearchTextOrigin(e.target.value)} /></div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {airports.filter(a => (a.thanhPho || '').toLowerCase().includes(searchTextOrigin.toLowerCase())).map(a => (
                                                            <button key={a.maSanBay || a.maIATA} type="button" className="w-full px-4 py-3 text-left hover:bg-blue-50 flex justify-between" onClick={() => { setOrigin(a.thanhPho); setOriginOpen(false); }}>
                                                                <div><p className="text-sm font-bold">{a.thanhPho}</p><p className="text-[10px] text-gray-400">{a.tenSanBay}</p></div>
                                                                <span className="text-xs font-black text-gray-300">{a.maIATA}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative bg-white rounded-xl p-2 border border-gray-100" ref={destRef}>
                                            <label className="px-2 block text-[10px] font-black uppercase text-gray-400">Điểm đến</label>
                                            <button type="button" onClick={() => setDestOpen(!destOpen)} className="flex h-9 w-full items-center justify-between px-2 text-sm font-bold text-gray-800">
                                                <span className="truncate">{destination || 'Chọn điểm đến'}</span>
                                                <PlaneLandingIcon />
                                            </button>
                                            {destOpen && (
                                                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[280px] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                                                    <div className="p-3 border-b"><input autoFocus placeholder="Tìm..." className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold" value={searchTextDest} onChange={e => setSearchTextDest(e.target.value)} /></div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {airports.filter(a => (a.thanhPho || '').toLowerCase().includes(searchTextDest.toLowerCase())).map(a => (
                                                            <button key={a.maSanBay || a.maIATA} type="button" className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex justify-between" onClick={() => { setDestination(a.thanhPho); setDestOpen(false); }}>
                                                                <div><p className="text-sm font-bold">{a.thanhPho}</p><p className="text-[10px] text-gray-400">{a.tenSanBay}</p></div>
                                                                <span className="text-xs font-black text-gray-300">{a.maIATA}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white rounded-xl p-2 border border-gray-100">
                                            <label className="px-2 block text-[10px] font-black uppercase text-gray-400">Ngày đi</label>
                                            <div className="flex items-center"><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-9 bg-transparent px-2 text-sm font-bold outline-none" /><CalendarIcon /></div>
                                        </div>
                                        <div className="relative bg-white rounded-xl p-2 border border-gray-100" ref={paxRef}>
                                            <label className="px-2 block text-[10px] font-black uppercase text-gray-400">Khách</label>
                                            <button type="button" onClick={() => setPaxOpen(!paxOpen)} className="flex h-9 w-full items-center justify-between px-2 text-sm font-bold text-gray-800">
                                                <span>{paxCount.adult + paxCount.child + paxCount.infant} khách</span>
                                                <UserIcon />
                                            </button>
                                            {paxOpen && (
                                                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 bg-white rounded-xl border border-gray-200 shadow-xl p-4">
                                                    {['adult', 'child', 'infant'].map(type => (
                                                        <div key={type} className="flex justify-between items-center mb-3">
                                                            <span className="text-sm font-bold capitalize">{type === 'adult' ? 'Người lớn' : type === 'child' ? 'Trẻ em' : 'Em bé'}</span>
                                                            <div className="flex items-center gap-3">
                                                                <button type="button" onClick={() => setPaxCount({...paxCount, [type]: Math.max(type === 'adult' ? 1 : 0, paxCount[type] - 1)})} className="w-6 h-6 rounded border font-bold">-</button>
                                                                <span className="w-4 text-center font-bold">{paxCount[type]}</span>
                                                                <button type="button" onClick={() => setPaxCount({...paxCount, [type]: paxCount[type] + 1})} className="w-6 h-6 rounded border font-bold">+</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" disabled={loading} className="h-full bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all">TÌM KIẾM</button>
                                    </form>
                                </div>
                                <div className="space-y-4">
                                    {loading ? <div className="py-20 text-center animate-pulse font-bold text-gray-300">ĐANG TẢI...</div> : 
                                        flights.length > 0 ? flights.map(f => (
                                            <div key={f.maChuyenBay || f.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-8" onClick={() => selectFlight(f)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-black text-blue-600 border border-gray-100">FLY</div>
                                                    <div><span className="font-black text-gray-800 block">{f.maChuyenBay}</span><span className="text-[10px] font-bold text-gray-400 uppercase">{f.mayBay?.tenMayBay || 'A321 Neo'}</span></div>
                                                </div>
                                                <div className="flex-1 flex justify-center items-center gap-12">
                                                    <div className="text-right"><p className="text-xl font-black text-gray-800">{formatTimeOnly(f.ngayGioKhoiHanh)}</p><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{f.maSanBayDi?.maIATA}</p></div>
                                                    <div className="text-center"><p className="text-[10px] font-black text-gray-300 uppercase mb-1">Trực tiếp</p><div className="w-20 h-px bg-gray-200 relative"><span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-gray-300">✈</span></div></div>
                                                    <div className="text-left"><p className="text-xl font-black text-gray-800">{formatTimeOnly(f.ngayGioHaCanh)}</p><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{f.maSanBayDen?.maIATA}</p></div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Giá cơ bản</p>
                                                    <p className="text-lg font-black text-blue-600">{formatMoney(f.giaCoBan || (f.chiTietHangVe?.[0]?.gia))}</p>
                                                </div>
                                            </div>
                                        )) : <div className="py-20 text-center font-bold text-gray-300 uppercase tracking-widest">Không tìm thấy chuyến bay</div>
                                    }
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Left: Passenger Details & Services */}
                                <div className="lg:col-span-8 space-y-6">
                                    {passengers.map((p, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Hành khách #{i + 1}</span>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Người lớn</span>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase">Họ và tên</label>
                                                        <input placeholder="VD: NGUYEN VAN A" className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20 border border-gray-100" value={p.fullName} onChange={e => { const np = [...passengers]; np[i].fullName = e.target.value.toUpperCase(); setPassengers(np); }} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase">Số CCCD / Hộ chiếu</label>
                                                        <input placeholder="Nhập số..." className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 border border-gray-100" value={p.cccd} onChange={e => { const np = [...passengers]; np[i].cccd = e.target.value; setPassengers(np); }} />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-4 pt-2">
                                                    {/* Seat Selection */}
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase">Chỗ ngồi</label>
                                                        <button onClick={() => openSeatMap(i)} className={`w-full h-11 rounded-xl font-black text-sm flex items-center justify-center gap-2 border transition-all ${p.seat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-200 hover:border-blue-500'}`}>
                                                            {p.seat ? `Ghế ${p.seat}` : 'Chọn ghế 💺'}
                                                        </button>
                                                    </div>
                                                    {/* Baggage Selection */}
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase">Hành lý ký gửi</label>
                                                        <select className="w-full h-11 bg-gray-50 rounded-xl px-3 text-sm font-bold border border-gray-100 outline-none" value={p.baggage} onChange={e => { const np = [...passengers]; np[i].baggage = e.target.value; setPassengers(np); }}>
                                                            {BAGGAGE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label} {o.price > 0 ? `(+${formatMoney(o.price)})` : ''}</option>)}
                                                        </select>
                                                    </div>
                                                    {/* Insurance Selection */}
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase">Bảo hiểm</label>
                                                        <select className="w-full h-11 bg-gray-50 rounded-xl px-3 text-sm font-bold border border-gray-100 outline-none" value={p.insurance} onChange={e => { const np = [...passengers]; np[i].insurance = e.target.value; setPassengers(np); }}>
                                                            {INSURANCE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label} {o.price > 0 ? `(+${formatMoney(o.price)})` : ''}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right: Summary & Action */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-24">
                                        <h3 className="text-xl font-black mb-6 text-gray-800">Chi tiết thanh toán</h3>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Chuyến bay</span>
                                                    <span className="text-xs font-black text-blue-600">{selectedFlight.maChuyenBay}</span>
                                                </div>
                                                <p className="font-black text-gray-800 text-sm">{selectedFlight.maSanBayDi?.thanhPho} → {selectedFlight.maSanBayDen?.thanhPho}</p>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Hạng vé</p>
                                                {selectedFlight.chiTietHangVe?.map(hv => (
                                                    <button key={hv.maHangVe} onClick={() => setSelectedTicketClass(hv)} className={`w-full p-3 rounded-xl border flex justify-between items-center transition-all ${selectedTicketClass?.maHangVe === hv.maHangVe ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-100 text-gray-500 hover:border-blue-200'}`}>
                                                        <span className="text-sm">{hv.tenHangVe}</span>
                                                        <span className="text-sm">{formatMoney(hv.gia)}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Phương thức thanh toán</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button onClick={() => setPaymentMethod('CASH')} className={`py-3 rounded-xl border text-xs font-black transition-all ${paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:border-blue-200'}`}>TIỀN MẶT</button>
                                                    <button onClick={() => setPaymentMethod('VNPAY')} className={`py-3 rounded-xl border text-xs font-black transition-all ${paymentMethod === 'VNPAY' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:border-blue-200'}`}>VNPAY</button>
                                                </div>
                                            </div>

                                            <div className="pt-4 space-y-3">
                                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                                    <span>Tiền vé ({passengers.length} người)</span>
                                                    <span>{formatMoney((selectedTicketClass?.gia || 0) * passengers.length)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                                    <span>Dịch vụ cộng thêm</span>
                                                    <span>{formatMoney(calculateTotal() - (selectedTicketClass?.gia || 0) * passengers.length)}</span>
                                                </div>
                                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                                    <span className="font-black text-gray-800">TỔNG CỘNG</span>
                                                    <span className="text-2xl font-black text-blue-600">{formatMoney(calculateTotal())}</span>
                                                </div>
                                            </div>

                                            <button onClick={handleBooking} disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                                                {paymentMethod === 'VNPAY' ? 'THANH TOÁN VNPAY' : 'THANH TOÁN & XUẤT VÉ'}
                                            </button>
                                            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-4">Xác nhận thanh toán tại quầy</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Seat Map Modal */}
            {showSeatModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800">Sơ đồ chỗ ngồi</h3>
                                <p className="text-sm font-bold text-gray-500">Hành khách: <span className="text-blue-600">{passengers[currentPaxIndex]?.fullName || 'Hành khách'}</span> · Hạng: <span className="text-blue-600 font-black">{selectedTicketClass?.tenHangVe}</span></p>
                            </div>
                            <button onClick={() => setShowSeatModal(false)} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                            <div className="mb-8 flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-sky-600" /> Phổ thông</span>
                                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-600" /> Đặc biệt</span>
                                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-blue-800" /> Thương gia</span>
                                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-500" /> Đang chọn</span>
                                <span className="inline-flex items-center gap-2 text-gray-300"><span className="h-3 w-3 rounded bg-gray-200 flex items-center justify-center text-[8px]">×</span> Đã đặt</span>
                            </div>
                            
                            <div className="mx-auto w-fit bg-white p-10 rounded-[4rem] border border-gray-200 shadow-inner relative">
                                {Array.from({ length: Math.ceil((selectedFlight.soLuongCho || 120) / 6) }).map((_, rIdx) => (
                                    <div key={rIdx} className="flex items-center gap-4 mb-3">
                                        <div className="flex gap-1.5">
                                            {SEAT_COLS.slice(0, 3).map(col => {
                                                const seatIndex = rIdx * 6 + SEAT_COLS.indexOf(col);
                                                const seatId = `${rIdx + 1}${col}`;
                                                const isOccupied = occupiedSeats.includes(seatId);
                                                const isCurrent = passengers[currentPaxIndex]?.seat === seatId;
                                                const isOtherChosen = passengers.some((p, i) => i !== currentPaxIndex && p.seat === seatId);
                                                const comp = seatCompartments.find(c => seatIndex >= c.start && seatIndex < c.end);
                                                const isMyClass = selectedTicketClass && comp ? (comp.maHangVe === selectedTicketClass.maHangVe) : true;
                                                let baseClass = 'bg-white border-gray-200 text-gray-400';
                                                if (comp) {
                                                    if (comp.tenHangVe.toLowerCase().includes('thương gia')) baseClass = 'border-blue-900 bg-blue-800 text-white';
                                                    else if (comp.tenHangVe.toLowerCase().includes('đặc biệt')) baseClass = 'border-emerald-700 bg-emerald-600 text-white';
                                                    else if (comp.tenHangVe.toLowerCase().includes('phổ thông')) baseClass = 'border-sky-700 bg-sky-600 text-white';
                                                }
                                                let cls = '';
                                                if (isOccupied || isOtherChosen) cls = 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed';
                                                else if (isCurrent) cls = 'bg-amber-500 text-white border-amber-600 shadow-lg scale-110 z-10';
                                                else if (!isMyClass) cls = `${baseClass} opacity-10 cursor-not-allowed grayscale`;
                                                else cls = `${baseClass} hover:scale-105 cursor-pointer shadow-sm active:scale-95`;
                                                return <button key={seatId} disabled={isOccupied || isOtherChosen || !isMyClass} onClick={() => selectSeat(seatId)} className={`w-9 h-9 rounded-lg border text-[10px] font-black transition-all ${cls}`}>{isOccupied || isOtherChosen ? '×' : (isCurrent ? col : (isMyClass ? col : ''))}</button>;
                                            })}
                                        </div>
                                        <span className="w-6 text-center text-[10px] font-black text-gray-300 bg-gray-50 rounded-full py-1">{rIdx + 1}</span>
                                        <div className="flex gap-1.5">
                                            {SEAT_COLS.slice(3, 6).map(col => {
                                                const seatIndex = rIdx * 6 + SEAT_COLS.indexOf(col);
                                                const seatId = `${rIdx + 1}${col}`;
                                                const isOccupied = occupiedSeats.includes(seatId);
                                                const isCurrent = passengers[currentPaxIndex]?.seat === seatId;
                                                const isOtherChosen = passengers.some((p, i) => i !== currentPaxIndex && p.seat === seatId);
                                                const comp = seatCompartments.find(c => seatIndex >= c.start && seatIndex < c.end);
                                                const isMyClass = selectedTicketClass && comp ? (comp.maHangVe === selectedTicketClass.maHangVe) : true;
                                                let baseClass = 'bg-white border-gray-200 text-gray-400';
                                                if (comp) {
                                                    if (comp.tenHangVe.toLowerCase().includes('thương gia')) baseClass = 'border-blue-900 bg-blue-800 text-white';
                                                    else if (comp.tenHangVe.toLowerCase().includes('đặc biệt')) baseClass = 'border-emerald-700 bg-emerald-600 text-white';
                                                    else if (comp.tenHangVe.toLowerCase().includes('phổ thông')) baseClass = 'border-sky-700 bg-sky-600 text-white';
                                                }
                                                let cls = '';
                                                if (isOccupied || isOtherChosen) cls = 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed';
                                                else if (isCurrent) cls = 'bg-amber-500 text-white border-amber-600 shadow-lg scale-110 z-10';
                                                else if (!isMyClass) cls = `${baseClass} opacity-10 cursor-not-allowed grayscale`;
                                                else cls = `${baseClass} hover:scale-105 cursor-pointer shadow-sm active:scale-95`;
                                                return <button key={seatId} disabled={isOccupied || isOtherChosen || !isMyClass} onClick={() => selectSeat(seatId)} className={`w-9 h-9 rounded-lg border text-[10px] font-black transition-all ${cls}`}>{isOccupied || isOtherChosen ? '×' : (isCurrent ? col : (isMyClass ? col : ''))}</button>;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeBookings;
