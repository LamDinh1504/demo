import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import EmployeeSidebar from '../../components/EmployeeSidebar';

const formatTimeOnly = (value) => {
    if (!value) return '--:--';
    let d;
    if (Array.isArray(value)) d = new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0);
    else d = new Date(value);
    if (Number.isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDateLong = (value) => {
    if (!value) return '---';
    let d;
    if (Array.isArray(value)) d = new Date(value[0], value[1] - 1, value[2]);
    else d = new Date(value);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const EmployeeCheckin = () => {
    const [user, setUser] = useState(null);
    const [searchPnr, setSearchPnr] = useState('');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchPnr.trim()) return;
        setLoading(true);
        setError('');
        setBooking(null);
        try {
            const data = await authService.getBookingByPNR(searchPnr.toUpperCase());
            if (data) {
                setBooking(data);
            } else {
                setError('Không tìm thấy thông tin đặt chỗ với mã này.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tìm kiếm mã đặt chỗ.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckin = async (ticketId) => {
        setLoading(true);
        try {
            await authService.updateCheckinStatus(ticketId, 'CHECKED_IN');
            // Refresh booking data
            const data = await authService.getBookingByPNR(searchPnr.toUpperCase());
            setBooking(data);
            alert("Check-in thành công!");
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi thực hiện check-in.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTicket = (ticketId) => {
        window.open(`http://localhost:8080/api/tickets/download/${ticketId}`, '_blank');
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#f4f6f8] relative">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-slide-up {
                        animation: slideUp 0.4s ease-out forwards;
                    }
                `}
            </style>
            
            <div className="fixed inset-0 z-[-1]">
                <img src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1920" alt="Clouds" className="w-full h-full object-cover opacity-[0.15]" />
            </div>

            <Navbar transparent={false} />

            <div className="mx-auto w-[min(1200px,96vw)] mt-28 mb-20 flex-grow flex flex-col md:flex-row gap-6 relative z-10" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <EmployeeSidebar user={user} handleLogout={handleLogout} />
                
                <div className="flex-1 bg-white border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
                    <div className="bg-[#f0f0f0] px-6 py-4">
                        <h2 className="text-[17px] font-bold text-[#333]">Hệ thống Check-in hành khách</h2>
                    </div>

                    <div className="p-8 animate-slide-up flex-grow">
                        <div className="max-w-3xl mx-auto text-center mb-10">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Check-in Trực Tuyến</h1>
                            <p className="text-gray-500">Vui lòng nhập mã đặt chỗ (PNR) để tiến hành làm thủ tục cho hành khách.</p>
                        </div>

                        {/* Search Box */}
                        <div className="max-w-2xl mx-auto mb-10">
                            <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm flex items-center gap-2">
                                <div className="flex-grow relative pl-4">
                                    <input 
                                        autoFocus
                                        placeholder="Mã PNR (VD: VJET24)" 
                                        className="w-full bg-transparent px-4 py-3 text-lg font-bold text-gray-700 uppercase outline-none placeholder:text-gray-300 placeholder:font-normal"
                                        value={searchPnr}
                                        onChange={e => setSearchPnr(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <button 
                                    disabled={loading}
                                    onClick={handleSearch}
                                    className="px-8 py-3 bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                                </button>
                            </div>
                            {error && (
                                <p className="mt-3 text-center text-red-500 font-medium text-sm">⚠️ {error}</p>
                            )}
                        </div>

                        {loading && !booking && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-400 font-medium text-sm">Đang truy xuất dữ liệu từ hệ thống...</p>
                            </div>
                        )}

                        {booking && (
                            <div className="space-y-8">
                                {/* Flight Info Card - Clean Style */}
                                <div className="bg-[#f8f9fa] border border-gray-200 rounded-2xl p-8 relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-start">
                                            <div className="text-center md:text-left">
                                                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Khởi hành</p>
                                                <h3 className="text-4xl font-bold text-gray-800">{booking.flight?.maSanBayDi?.maIATA || 'SGN'}</h3>
                                                <p className="text-gray-500 text-sm">{booking.flight?.maSanBayDi?.thanhPho}</p>
                                            </div>
                                            
                                            <div className="flex flex-col items-center px-4">
                                                <span className="text-2xl mb-1">✈️</span>
                                                <div className="h-px w-24 bg-gray-200"></div>
                                                <p className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                                    {formatTimeOnly(booking.flight?.ngayGioKhoiHanh)}
                                                </p>
                                            </div>

                                            <div className="text-center md:text-right">
                                                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Điểm đến</p>
                                                <h3 className="text-4xl font-bold text-gray-800">{booking.flight?.maSanBayDen?.maIATA || 'HAN'}</h3>
                                                <p className="text-gray-500 text-sm">{booking.flight?.maSanBayDen?.thanhPho}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200 md:pl-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Chuyến bay</p>
                                                <p className="font-bold text-gray-700">{booking.flight?.maChuyenBay}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mã đặt chỗ</p>
                                                <p className="font-bold text-blue-600 tracking-wider">{searchPnr.toUpperCase()}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ngày khởi hành</p>
                                                <p className="font-bold text-gray-700">{formatDateLong(booking.flight?.ngayGioKhoiHanh)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Passenger List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-1.5 h-5 bg-[#8dc63f] rounded-full"></span>
                                        Danh sách hành khách
                                    </h3>
                                    
                                    <div className="grid gap-4">
                                        {booking.passengers?.map((p, i) => (
                                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-blue-200 transition-all">
                                                <div className="flex items-center gap-5 flex-grow">
                                                    <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold border ${p.trangThai === 'CHECKED_IN' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                        <span className="text-[9px] uppercase opacity-60">Ghế</span>
                                                        <span className="text-xl">{p.soGhe || '--'}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-lg font-bold text-gray-800 uppercase">{p.hoTenHK}</h4>
                                                            {p.trangThai === 'CHECKED_IN' && (
                                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Đã xác nhận</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            CCCD: {p.cccd} · {p.doiTuong || 'NGƯỜI LỚN'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                                    <div className="text-right hidden md:block mr-4">
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase mb-0.5">Trạng thái</p>
                                                        <p className={`text-xs font-bold uppercase ${p.trangThai === 'CHECKED_IN' ? 'text-green-600' : 'text-amber-500'}`}>
                                                            {p.trangThai === 'CHECKED_IN' ? 'Hoàn tất' : 'Chưa Check-in'}
                                                        </p>
                                                    </div>
                                                    
                                                    {p.trangThai !== 'CHECKED_IN' ? (
                                                        <button 
                                                            onClick={() => handleCheckin(p.maVe || p.id)}
                                                            className="w-full md:w-auto px-6 py-2.5 bg-[#8dc63f] hover:bg-[#7db236] text-white font-bold rounded-lg transition-all active:scale-95 shadow-sm"
                                                        >
                                                            Xác nhận Check-in
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleDownloadTicket(p.maVe || p.id)}
                                                            className="w-full md:w-auto px-6 py-2.5 bg-white text-blue-600 font-bold rounded-lg border border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                            Tải vé PDF
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Success Footer */}
                                {booking.passengers?.every(p => p.trangThai === 'CHECKED_IN') && (
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-slide-up">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                                        <h4 className="text-xl font-bold text-green-800 mb-2">Hoàn tất thủ tục!</h4>
                                        <p className="text-green-700 text-sm max-w-lg mx-auto">Tất cả hành khách trong hồ sơ PNR {searchPnr.toUpperCase()} đã được làm thủ tục thành công. Quý khách có thể tải vé điện tử cho từng hành khách ở trên.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeCheckin;
