import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const formatMoney = (v) => {
    if (!v && v !== 0) return '0 VNĐ';
    return Number(v).toLocaleString('vi-VN') + ' VNĐ';
};

const AdminOverview = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalFlights: 0,
        totalAirports: 0,
        recentFlights: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const role = currentUser?.user?.role ?? currentUser?.role;
        if (!currentUser || role !== 'ADMIN') { navigate('/login'); return; }
        setUser(currentUser);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const [revenueData, flightsData, airportsData] = await Promise.all([
                authService.getRevenue(currentYear).catch(() => null),
                authService.getAllFlights().catch(() => []),
                authService.getAllAirports().catch(() => [])
            ]);

            setStats({
                totalRevenue: revenueData?.tongDoanhThu || 0,
                totalFlights: flightsData?.length || 0,
                totalAirports: airportsData?.length || 0,
                recentFlights: (flightsData || []).slice(0, 5) // Lấy 5 chuyến đầu tiên
            });
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };

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
            
            {/* Global Fixed Background matching the cloudy sky pattern */}
            <div className="fixed inset-0 z-[-1]">
                <img src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1920" alt="Clouds" className="w-full h-full object-cover opacity-[0.15]" />
            </div>

            <Navbar transparent={false} />

            <div className="mx-auto w-[min(1200px,96vw)] mt-28 mb-20 flex-grow flex flex-col md:flex-row gap-6 relative z-10" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <AdminSidebar user={user} handleLogout={handleLogout} />

                <div className="flex-1 bg-white border border-gray-200 shadow-sm min-h-[500px]">
                    <div className="bg-[#f0f0f0] px-6 py-4">
                        <h2 className="text-[17px] font-bold text-[#333]">Tổng quan hệ thống</h2>
                    </div>

                    <div className="p-8 animate-slide-up">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#8dc63f]" />
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid gap-6 sm:grid-cols-3">
                                    {/* Doanh thu */}
                                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                        <div className="relative z-10 flex flex-col">
                                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Doanh thu năm nay</p>
                                            <p className="text-2xl font-black text-[#333]">{formatMoney(stats.totalRevenue)}</p>
                                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 w-fit px-3 py-1 rounded-lg">
                                                Tăng trưởng tốt
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tổng số chuyến bay */}
                                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                        <div className="relative z-10 flex flex-col">
                                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Tổng số chuyến bay</p>
                                            <p className="text-2xl font-black text-[#333]">{stats.totalFlights}</p>
                                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                                                Hoạt động sôi nổi
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sân bay hoạt động */}
                                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                        <div className="relative z-10 flex flex-col">
                                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Sân bay hoạt động</p>
                                            <p className="text-2xl font-black text-[#333]">{stats.totalAirports}</p>
                                            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 w-fit px-3 py-1 rounded-lg">
                                                Mạng lưới mở rộng
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Flights Table */}
                                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
                                    <div className="flex flex-wrap justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#333]">Chuyến bay cập nhật gần đây</h3>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Danh sách mới nhất được đẩy lên hệ thống</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/admin/flights')} 
                                            className="mt-4 sm:mt-0 flex items-center gap-2 text-xs font-bold bg-[#f2c500] hover:bg-[#e0b600] text-black px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                                        >
                                            Xem tất cả
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto p-4">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="text-left">
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Mã CB</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Tuyến bay</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {stats.recentFlights.map((f) => (
                                                    <tr key={f.maChuyenBay} className="hover:bg-gray-50/80 transition-colors cursor-pointer">
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-gray-800">{f.maChuyenBay}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3 font-semibold text-gray-700 text-sm">
                                                                <span>{f.maSanBayDi?.thanhPho || '?'}</span>
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                                <span>{f.maSanBayDen?.thanhPho || '?'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold border ${f.trangThai === 'Đã lên lịch' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                                {f.trangThai || '—'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default AdminOverview;
