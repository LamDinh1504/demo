import React from 'react';

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

export default function BookingSummary({ 
    flight, 
    pax, 
    selectedSeats = [], 
    totalPrice = 0, 
    selectedBaggage, 
    selectedInsurance, 
    ticketClass, 
    ticketClassDetail,
    onEdit,
    actionButton,
    discount = 0  // Added discount prop
}) {
    if (!flight) return null;

    const totalPassengers = (pax?.adult || 0) + (pax?.child || 0) + (pax?.infant || 0);

    // Recalculate breakdown for display
    const baggageTotal = (selectedBaggage?.price || 0) * totalPassengers;
    const insuranceTotal = (selectedInsurance?.price || 0) * totalPassengers;
    
    // totalTicketPrice is the base price (before baggage/insurance and BEFORE discount)
    // Actually, totalPrice passed here is the FINAL price.
    // So to show the correct breakdown:
    const originalTotalPrice = totalPrice + discount;
    const totalTicketPrice = originalTotalPrice - baggageTotal - insuranceTotal;


    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:sticky lg:top-[100px] h-fit" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');`}
            </style>
            <div className="bg-sky-600 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-wider text-sm">Thông tin đặt chỗ</h3>
                {onEdit ? (
                    <button 
                        type="button" 
                        onClick={onEdit}
                        className="bg-white text-sky-600 text-xs font-bold px-3 py-1 rounded-full hover:bg-sky-50 transition-colors"
                    >
                        Chi Tiết
                    </button>
                ) : (
                    <button type="button" className="bg-white text-sky-600 text-xs font-bold px-3 py-1 rounded-full hover:bg-sky-50 transition-colors">Chi Tiết</button>
                )}
            </div>

            <div className="p-0">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50">
                    <span className="font-bold text-slate-700">Thông tin hành khách</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                </div>

                <div className="px-5 py-3 bg-sky-50/50 border-b border-sky-100 flex justify-between items-center">
                    <span className="font-medium text-slate-600">Chuyến đi</span>
                    <div className="flex items-center gap-2 text-sky-600 font-black">
                        {formatMoneyVND(totalPrice)}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 cursor-pointer hover:text-sky-800"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                    </div>
                </div>

                <div className="px-5 py-4 border-b border-slate-100 text-sm">
                    <p className="font-bold text-slate-800 mb-1">
                        {flight.maSanBayDi?.thanhPho || flight.origin} ({flight.maSanBayDi?.maIATA || 'SGN'}) ✈ {flight.maSanBayDen?.thanhPho || flight.destination} ({flight.maSanBayDen?.maIATA || 'VCL'})
                    </p>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {formatDateShort(flight.ngayGioKhoiHanh || flight.departureTime)} | {formatTimeOnly(flight.ngayGioKhoiHanh || flight.departureTime)} - {formatTimeOnly(flight.ngayGioHaCanh || flight.arrivalTime)}<br />
                        Chuyến bay {flight.flightNumber || flight.maChuyenBay} | Hạng vé {ticketClass === 'BUSINESS' ? 'Thương gia' : (ticketClassDetail ? ticketClassDetail.tenHangVe : 'Phổ thông')}
                        <br />Chỗ ngồi: {selectedSeats.join(', ') || 'Chưa chọn'} ({selectedSeats.length}/{totalPassengers})
                    </p>
                </div>

                <div className="px-5 py-3 flex justify-between items-center border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <span className="font-bold text-slate-700">Giá vé</span>
                    <span className="font-black text-slate-800">{formatMoneyVND(totalTicketPrice)}</span>
                </div>


                {/* Hành lý */}
                {baggageTotal > 0 && (
                    <div className="px-5 py-3 flex justify-between items-center border-b border-slate-100 bg-amber-50">
                        <span className="font-bold text-amber-700 flex items-center gap-1.5">
                            <span>🧳</span> Hành lý ({selectedBaggage?.label})
                        </span>
                        <span className="font-black text-amber-700">+{formatMoneyVND(baggageTotal)}</span>
                    </div>
                )}

                {/* Bảo hiểm */}
                {insuranceTotal > 0 && (
                    <div className="px-5 py-3 flex justify-between items-center border-b border-slate-100 bg-blue-50">
                        <span className="font-bold text-blue-600 flex items-center gap-1.5">
                            <span>🛡️</span> {selectedInsurance?.label}
                        </span>
                        <span className="font-black text-blue-600">+{formatMoneyVND(insuranceTotal)}</span>
                    </div>
                )}

                {/* Ưu đãi / Giảm giá */}
                {discount > 0 && (
                    <div className="px-5 py-3 flex justify-between items-center border-b border-slate-100 bg-emerald-50">
                        <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                            <span>✨</span> Ưu đãi đã áp dụng
                        </span>
                        <span className="font-black text-emerald-600">-{formatMoneyVND(discount)}</span>
                    </div>
                )}

                {/* Tổng cộng */}
                <div className="px-5 py-4 flex justify-between items-center bg-sky-600 text-white mt-2">
                    <span className="font-bold text-sky-100 uppercase text-xs tracking-wider">Tổng cộng</span>
                    <span className="font-black text-xl">{formatMoneyVND(totalPrice)}</span>
                </div>

                {/* Action Button */}
                {actionButton && (
                    <div className="p-5">
                        {actionButton}
                    </div>
                )}
            </div>
        </div>
    );
}
