import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingSummary from '../../components/BookingSummary';
import { authService } from '../../services/api';

const formatMoneyVND = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return Number(value).toLocaleString('vi-VN') + ' VNĐ';
};

const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
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

export default function Orders() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const flight = state?.flight;
    const pax = state?.pax || { adult: 1, child: 0, infant: 0 };
    const selectedSeats = state?.selectedSeats || [];
    const totalPrice = state?.totalPrice || 0;

    const selectedBaggage = state?.selectedBaggage;
    const selectedInsurance = state?.selectedInsurance;
    const ticketClass = state?.ticketClass;
    const ticketClassDetail = state?.ticketClassDetail;
    
    const totalPassengers = pax.adult + pax.child + pax.infant;

    // Recalculate breakdown for display — giá đã bao gồm tất cả phí, không chia 1.2 nữa
    const baggageTotal = (selectedBaggage?.price || 0) * totalPassengers;
    const insuranceTotal = (selectedInsurance?.price || 0) * totalPassengers;
    const totalTicketPrice = totalPrice - baggageTotal - insuranceTotal;

    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [activePromotions, setActivePromotions] = useState([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Promos
                const promos = await authService.getActivePromotions();
                setActivePromotions(promos || []);

                // Fetch User Profile for Contact Info
                const userSession = authService.getCurrentUser();
                const userId = userSession?.maNguoiDung || userSession?.user?.maNguoiDung || userSession?.user?.id || userSession?.id;
                
                if (userId) {
                    const userData = await authService.getUserProfile(userId);
                    if (userData) {
                        setContact({
                            name: userData.hoTen || '',
                            email: userData.email || '',
                            phone: userData.sdt || ''
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const handleApplyPromo = () => {
        if (!promoCode.trim()) {
            setPromoError('Vui lòng nhập mã ưu đãi');
            return;
        }
        setIsApplyingPromo(true);
        setPromoError('');
        
        // Find in fetched promos - using the correct property 'code' from backend
        const promo = activePromotions.find(p => p?.code?.toUpperCase() === promoCode.trim().toUpperCase());
        
        setTimeout(() => {
            if (promo) {
                setAppliedPromo(promo);
                setPromoError('');
            } else {
                setPromoError('Mã ưu đãi không hợp lệ hoặc đã hết hạn');
                setAppliedPromo(null);
            }
            setIsApplyingPromo(false);
        }, 600);
    };

    const calculateDiscount = () => {
        if (!appliedPromo) return 0;
        
        // Check if it's percentage discount or fixed amount based on backend fields
        if (appliedPromo.phanTramGiam > 0) {
            return (totalPrice * (appliedPromo.phanTramGiam / 100));
        }
        return appliedPromo.mucGiamGia || 0; // Fallback to mucGiamGia if available
    };

    const discountAmount = calculateDiscount();
    const finalPrice = totalPrice - discountAmount;

    // Create initial passenger lists based on pax object from previous steps
    const [passengers, setPassengers] = useState(() => {
        const list = [];
        const initPax = (type, count, labelPrefix) => {
            for (let i = 1; i <= count; i++) {
                list.push({
                    type,
                    label: `${labelPrefix} ${i}`,
                    title: type === 'adult' ? 'Ông' : 'Bé trai',
                    fullName: '',
                    dob: '',
                    cccd: '',
                    gioiTinh: type === 'adult' ? 'Nam' : 'Nam'
                });
            }
        };
        initPax('adult', pax.adult, 'Người lớn');
        initPax('child', pax.child, 'Trẻ em');
        initPax('infant', pax.infant, 'Em bé');
        return list;
    });

    if (!flight) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] p-10 text-center font-sans flex flex-col items-center justify-center">
                <style>
                    {`
                        @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                    `}
                </style>
                <div style={{ fontFamily: "'Nunito', sans-serif" }}>
                    <h3 className="mb-4 text-xl font-bold text-slate-800">Không tìm thấy dữ liệu chuyến bay.</h3>
                    <button
                        onClick={() => navigate('/flight')}
                        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const handlePaxChange = (index, field, value) => {
        const updated = [...passengers];
        updated[index][field] = value;
        setPassengers(updated);
    };

    const handleContactChange = (field, value) => {
        setContact(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!contact.name || !contact.email || !contact.phone) {
            alert('Vui lòng nhập đầy đủ thông tin liên hệ!');
            return;
        }
        for (let p of passengers) {
            if (!p.fullName || !p.dob || (p.type === 'adult' && !p.cccd)) {
                alert(`Vui lòng nhập đầy đủ thông tin cho ${p.label}!`);
                return;
            }
        }

        try {
            const userSession = authService.getCurrentUser();
            // Robust check for user ID at various levels
            const maNguoiDung = userSession?.maNguoiDung || userSession?.user?.maNguoiDung || userSession?.user?.id || userSession?.id || null;

            // Map to backend BookingRequestDto
            const requestData = {
                maNguoiDung: maNguoiDung,
                maKhuyenMai: appliedPromo?.maKhuyenMai || null, 
                tongTien: finalPrice,
                passengers: passengers.map((p, i) => ({
                    maChuyenBay: flight.maChuyenBay || flight.id,
                    maHangVe: ticketClassDetail?.maHangVe || (ticketClass === 'BUSINESS' ? 2 : 1),
                    hoTenHK: p.fullName,
                    cccd: p.cccd || null,
                    ngaySinh: p.dob, 
                    gioiTinh: p.gioiTinh === 'Nam' ? 'Nam' : 'Nữ',
                    doiTuong: p.type === 'adult' ? 'NGUOI_LON' : (p.type === 'child' ? 'TRE_EM' : 'EM_BE'),
                    soGhe: selectedSeats[i],
                    giaVe: (finalPrice - baggageTotal - insuranceTotal) / passengers.length,
                    giaHanhLy: selectedBaggage?.price || 0,
                    canNangHanhLy: selectedBaggage?.weight || 0,
                    giaBaoHiem: selectedInsurance?.price || 0
                }))
            };


            // Forward data to payment page
            navigate('/payment', {
                state: {
                    requestData,
                    flight,
                    pax,
                    selectedSeats,
                    totalPrice: finalPrice,
                    selectedBaggage,
                    selectedInsurance,
                    ticketClass,
                    ticketClassDetail,
                    originalPrice: totalPrice,
                    discountAmount: discountAmount
                }
            });
        } catch (error) {
            console.error('Lỗi khi đặt vé:', error);
            alert('Lỗi khi chuẩn bị dữ liệu gửi tới trang thanh toán');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-900 font-sans" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                `}
            </style>
            <Navbar transparent={false} />
            <div className="mx-auto w-[min(1200px,96vw)] pt-[100px] mb-10 flex-grow grid lg:grid-cols-[1fr_360px] gap-6 items-start">
                <div className="flex flex-col gap-5">
                    <form id="order-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Thông tin liên hệ */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-slate-800">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm font-black text-sky-600">1</span> 
                                Thông tin liên lạc
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-1.5 block text-sm font-bold text-slate-600">Họ và tên người liên hệ</label>
                                    <input
                                        type="text"
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        placeholder="Ví dụ: NGUYEN VAN A"
                                        value={contact.name}
                                        onChange={e => handleContactChange('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-bold text-slate-600">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        placeholder="Ví dụ: 0901234567"
                                        value={contact.phone}
                                        onChange={e => handleContactChange('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-bold text-slate-600">Email</label>
                                    <input
                                        type="email"
                                        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        placeholder="Ví dụ: email@domain.com"
                                        value={contact.email}
                                        onChange={e => handleContactChange('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Thông tin hành khách */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-slate-800">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm font-black text-sky-600">2</span> 
                                Thông tin hành khách
                            </h2>
                            <p className="mb-5 text-sm font-medium text-slate-500">
                                Vui lòng điền tên in hoa không dấu và kiểm tra kỹ ngày sinh.
                            </p>

                            {passengers.map((p, idx) => (
                                <div key={idx} className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-5 last:mb-0 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between text-base font-bold text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                            </div>
                                            {p.label}
                                        </div>
                                        {selectedSeats[idx] && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 font-black rounded-lg text-sm border border-amber-200">
                                                Ghế: {selectedSeats[idx]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-bold text-slate-600">Giới tính</label>
                                            <select
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all"
                                                value={p.gioiTinh}
                                                onChange={e => handlePaxChange(idx, 'gioiTinh', e.target.value)}
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                            </select>
                                        </div>

                                        <div className="lg:col-span-2">
                                            <label className="mb-1.5 block text-sm font-bold text-slate-600">Họ và tên (In hoa không dấu)</label>
                                            <input
                                                type="text"
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all uppercase"
                                                placeholder="VD: NGUYEN VAN A"
                                                value={p.fullName}
                                                onChange={e => handlePaxChange(idx, 'fullName', e.target.value.toUpperCase())}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-bold text-slate-600">Ngày sinh</label>
                                            <input
                                                type="date"
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all"
                                                value={p.dob}
                                                max={new Date().toISOString().split("T")[0]}
                                                onChange={e => handlePaxChange(idx, 'dob', e.target.value)}
                                                required
                                            />
                                        </div>

                                        {p.type === 'adult' && (
                                            <div className="lg:col-span-2">
                                                <label className="mb-1.5 block text-sm font-bold text-slate-600">CCCD / Hộ chiếu</label>
                                                <input
                                                    type="text"
                                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all"
                                                    placeholder="Số CCCD hoặc Hộ chiếu"
                                                    value={p.cccd}
                                                    onChange={e => handlePaxChange(idx, 'cccd', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mã giảm giá / Ưu đãi */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-slate-800">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm font-black text-sky-600">3</span> 
                                Mã giảm giá / Ưu đãi
                            </h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            className={`h-12 w-full rounded-xl border ${promoError ? 'border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-50'} px-4 text-sm font-bold outline-none ring-4 ring-transparent transition-all placeholder:font-medium`}
                                            placeholder="Nhập mã ưu đãi của bạn"
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                            disabled={appliedPromo !== null}
                                        />
                                        {appliedPromo && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 bg-emerald-50 rounded-full p-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4.13-5.68a.75.75 0 00.1-.321z" clipRule="evenodd" /></svg>
                                            </div>
                                        )}
                                    </div>
                                    {appliedPromo ? (
                                        <button 
                                            type="button"
                                            onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
                                            className="h-12 px-6 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all text-sm"
                                        >
                                            Gỡ bỏ
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={handleApplyPromo}
                                            disabled={isApplyingPromo || !promoCode}
                                            className="h-12 px-6 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isApplyingPromo ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : 'Áp dụng'}
                                        </button>
                                    )}
                                </div>
                                {promoError && <p className="text-red-500 text-xs font-bold px-1">{promoError}</p>}
                                {appliedPromo && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                                        <div className="text-emerald-600 pt-0.5">✨</div>
                                        <div>
                                            <p className="text-emerald-800 text-sm font-black">Áp dụng thành công: {appliedPromo.tenChuongTrinh || appliedPromo.tenKhuyenMai}</p>
                                            <p className="text-emerald-600 text-xs font-bold leading-relaxed">{appliedPromo.moTaTenChuongTrinh || appliedPromo.moTa}</p>
                                            <p className="text-emerald-700 text-sm font-black mt-1">Tiết kiệm: -{formatMoneyVND(discountAmount)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit button */}
                        <button type="submit" className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-base font-bold text-white transition-all hover:bg-sky-700 shadow-sm disabled:opacity-50">
                            Tiến hành thanh toán
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Right Panel */}
                <BookingSummary 
                    flight={flight}
                    pax={pax}
                    selectedSeats={selectedSeats}
                    totalPrice={finalPrice}
                    discount={discountAmount}
                    selectedBaggage={selectedBaggage}
                    selectedInsurance={selectedInsurance}
                    ticketClass={ticketClass}
                    ticketClassDetail={ticketClassDetail}
                    actionButton={
                        <button
                            type="submit"
                            form="order-form"
                            className="w-full py-3 rounded-xl bg-orange-500 text-white font-black text-base hover:bg-orange-600 transition-colors shadow-md flex justify-center items-center gap-2"
                        >
                            Tiến hành thanh toán
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    }
                />
            </div>
            <Footer />
        </div>
    );
}
