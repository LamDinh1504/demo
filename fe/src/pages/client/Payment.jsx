import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingSummary from '../../components/BookingSummary';
import PartnerBanks from '../../components/PartnerBanks';
import api, { authService } from '../../services/api';

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

export default function Payment() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('VNPAY');
    const [isVnpayModalOpen, setIsVnpayModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!state || !state.requestData) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans">
                <style>
                    {`@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');`}
                </style>
                <div style={{ fontFamily: "'Nunito', sans-serif" }}>
                    <h3 className="mb-4 text-xl font-bold text-slate-800">Không tìm thấy thông tin thanh toán.</h3>
                    <button onClick={() => navigate('/')} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Trang chủ</button>
                </div>
            </div>
        );
    }

    const {
        requestData,
        flight,
        pax,
        selectedSeats,
        totalPrice,
        selectedBaggage,
        selectedInsurance,
        ticketClass,
        ticketClassDetail,
        discountAmount = 0
    } = state;

    const totalPassengers = pax.adult + pax.child + pax.infant;
    const baggageTotal = (selectedBaggage?.price || 0) * totalPassengers;
    const insuranceTotal = (selectedInsurance?.price || 0) * totalPassengers;
    // Giá đã bao gồm tất cả phí — không chia 1.2 nữa
    const totalTicketPrice = totalPrice - baggageTotal - insuranceTotal;

    const [isSuccess, setIsSuccess] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [bookingError, setBookingError] = useState('');

    // Call API helper
    const submitBooking = async (methodInfo) => {
        setIsProcessing(true);
        setBookingError('');
        const user = authService.getCurrentUser();
        try {
            const finalData = { ...requestData };
            finalData.phuongThucThanhToan = methodInfo;

            if (!finalData.maNguoiDung && user) {
                const userId = user?.maNguoiDung || user?.user?.maNguoiDung || user?.user?.id || user?.id;
                if (userId) finalData.maNguoiDung = userId;
            }

            const response = await api.post('/api/bookings', finalData, {
                headers: { 'Authorization': user?.token ? `Bearer ${user.token}` : '' }
            });

            if (response.status === 200 || response.status === 201) {
                setBookingData({
                    ...response.data,
                    method: methodInfo
                });
                
                if (methodInfo === 'VNPAY') {
                    // Gọi API tạo URL thanh toán VNPay
                    const paymentRes = await api.post('/api/payment/vnpay', {
                        amount: totalPrice, // Gửi tổng tiền cần thanh toán
                        bookingId: response.data.maDatVe
                    });
                    if (paymentRes.data && paymentRes.data.data) {
                        window.location.href = paymentRes.data.data; // Chuyển hướng sang VNPay
                        return; // Dừng tại đây
                    } else {
                        setBookingError('Không thể tạo URL thanh toán VNPay.');
                    }
                } else {
                    setIsSuccess(true);
                    setIsVnpayModalOpen(false);
                }
            }
        } catch (error) {
            console.error('Lỗi khi đặt vé:', error);
            let errorMsg = 'Lỗi hệ thống hoặc không thể kết nối tới máy chủ.';
            if (error.response) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : (error.response.data?.message || JSON.stringify(error.response.data));
            }
            setBookingError(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmPayment = () => {
        if (paymentMethod === 'VNPAY') {
            submitBooking('VNPAY');
        } else {
            submitBooking('PAY_LATER');
        }
    };

    if (isSuccess && bookingData) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-900 font-sans animate-[fadeIn_0.5s_ease-out]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <Navbar transparent={false} />
                <div className="mx-auto w-full max-w-2xl pt-[120px] pb-20 px-4 text-center">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                        {/* Hiệu ứng trang trí */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-sky-500"></div>
                        
                        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 animate-[bounce_1s_infinite_alternate]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 mb-2">Đặt vé thành công!</h2>
                        <p className="text-slate-500 font-medium mb-8">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. <br/>Thông tin vé đã được gửi về email của bạn.</p>

                        <div className="grid gap-6 md:grid-cols-2 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mã đặt chỗ (PNR)</p>
                                <p className="text-3xl font-black text-sky-600 tracking-tighter uppercase">{bookingData.maDatCho || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Trạng thái</p>
                                <p className={`text-xl font-black ${bookingData.method === 'VNPAY' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                    {bookingData.method === 'VNPAY' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 text-left mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">Chi tiết chuyến bay</span>
                                <span className="text-xs font-bold text-slate-400">#{flight.maChuyenBay}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-slate-900">{formatTimeOnly(flight.ngayGioKhoiHanh)}</p>
                                    <p className="text-xs font-bold text-slate-500">{flight.maSanBayDi?.maIATA}</p>
                                </div>
                                <div className="flex-1 border-t-2 border-dashed border-sky-200 relative h-0">
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-50 px-2 text-sky-500 text-lg">✈</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-slate-900">{formatTimeOnly(flight.ngayGioHaCanh)}</p>
                                    <p className="text-xs font-bold text-slate-500">{flight.maSanBayDen?.maIATA}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-sky-100 flex justify-between items-center text-sm font-bold text-slate-700">
                                <span>Tổng tiền thanh toán:</span>
                                <span className="text-sky-600 text-lg">{formatMoneyVND(totalPrice)}</span>
                            </div>
                        </div>

                        {bookingData.method !== 'VNPAY' && (
                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-left mb-8 flex items-start gap-4">
                                <div className="text-amber-500 text-2xl pt-1">⏱</div>
                                <div>
                                    <h4 className="text-amber-800 font-bold text-sm mb-1">Thời hạn thanh toán 20 phút</h4>
                                    <p className="text-amber-700 text-xs font-medium leading-relaxed">
                                        Vui lòng hoàn tất thanh toán trong vòng 20 phút kể từ thời điểm đặt vé. Sau thời gian này, hệ thống sẽ tự động hủy giữ chỗ để nhường cho các hành khách khác.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => navigate('/')} className="flex-1 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-lg">Về trang chủ</button>
                            <button onClick={() => navigate('/my-flights')} className="flex-1 rounded-2xl bg-sky-600 py-4 text-sm font-black text-white hover:bg-sky-700 transition-all shadow-lg">Xem vé của tôi</button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-900 font-sans" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');`}
            </style>
            <Navbar transparent={false} />

            <div className="mx-auto w-[min(1200px,96vw)] pt-[100px] mb-10 flex-grow grid lg:grid-cols-[1fr_360px] gap-6 items-start">
                
                {/* Hiển thị lỗi nếu có */}
                {bookingError && (
                    <div className="lg:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-bold flex items-center gap-3 mb-2">
                        <span>❌</span> {bookingError}
                    </div>
                )}

                {/* Left Panel: Payment Method Selection */}
                <div className="flex flex-col gap-5">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-slate-800">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm font-black text-sky-600">3</span>
                            Phương thức thanh toán
                        </h2>

                        <div className="flex flex-col gap-4">
                            {/* VNPAY Option */}
                            <label className={`border-2 rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-sky-500 bg-sky-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    className="mt-1 w-5 h-5 text-sky-600"
                                    checked={paymentMethod === 'VNPAY'}
                                    onChange={() => setPaymentMethod('VNPAY')}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="h-8 rounded overflow-hidden">
                                            {/* Dummy VNPAY Logo */}
                                            <div className="bg-blue-600 text-white font-black italic px-2 py-1 text-sm h-full flex items-center">
                                                VN<span className="text-red-500 font-bold">PAY</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-800 text-base">Thanh toán qua VNPAY / App Ngân hàng</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Quét mã QR qua ứng dụng Mobile Banking hoặc thanh toán bằng thẻ ATM/Visa/MasterCard qua cổng VNPAY.</p>
                                </div>
                            </label>

                            {/* PAY LATER Option */}
                            <label className={`border-2 rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all ${paymentMethod === 'PAY_LATER' ? 'border-sky-500 bg-sky-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    className="mt-1 w-5 h-5 text-sky-600"
                                    checked={paymentMethod === 'PAY_LATER'}
                                    onChange={() => setPaymentMethod('PAY_LATER')}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="h-8 w-14 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <span className="font-bold text-slate-800 text-base">Thanh toán sau (Giữ chỗ)</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Giữ chỗ ngay lập tức và thanh toán sau trong vòng 20 phút. Mã đặt chỗ sẽ gửi qua Email hoặc trang Quản lý đặt chỗ.</p>
                                </div>
                            </label>
                        </div>

                        <PartnerBanks />
                    </div>
                </div>

                {/* Right Panel: Order Summary (Recycled Component) */}
                <BookingSummary
                    flight={flight}
                    pax={pax}
                    selectedSeats={selectedSeats}
                    totalPrice={totalPrice}
                    discount={discountAmount}
                    selectedBaggage={selectedBaggage}
                    selectedInsurance={selectedInsurance}
                    ticketClass={ticketClass}
                    ticketClassDetail={ticketClassDetail}
                    onEdit={() => navigate(-1)}
                    actionButton={
                        <button
                            type="button"
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            className="w-full py-3 rounded-xl bg-orange-500 text-white font-black text-base hover:bg-orange-600 transition-colors shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : 'Xác nhận đặt vé (Trả sau)'
                            )}
                        </button>
                    }
                />
            </div>
            <Footer />
        </div>
    );
}
