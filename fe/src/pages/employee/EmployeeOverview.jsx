import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import EmployeeSidebar from '../../components/EmployeeSidebar';

const EmployeeOverview = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenueYear: 0,
        ticketsSoldTotal: 0,
        pendingCheckins: 0,
        activeFlights: 0,
        flightsToday: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) { 
            navigate('/login'); 
            return; 
        }

        const findRoleAggressively = (obj) => {
            if (!obj) return "";
            const standard = obj.role || obj.vaitro || obj.vaiTro || obj.VaiTro || "";
            if (standard) return standard;
            for (const key in obj) {
                const val = obj[key];
                if (typeof val === 'string') {
                    const upper = val.toUpperCase();
                    if (upper.includes('ADMIN') || upper.includes('USER')) return val;
                }
            }
            return "";
        };

        const rawRole = findRoleAggressively(currentUser.user) || findRoleAggressively(currentUser) || "";
        const role = rawRole.toString().toUpperCase();
        
        console.log("Checking Employee Access. Role:", role);

        const isAdmin = role.includes('ADMIN');
        const isEmployee = role.includes('USER') && !isAdmin;

        if (!isEmployee && !isAdmin) { 
            navigate('/login'); 
            return; 
        }
        
        setUser(currentUser);
        fetchEmployeeData();
    }, []);

    const fetchEmployeeData = async () => {
        setLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const [revenueData, flightsData] = await Promise.all([
                authService.getRevenue(currentYear).catch(() => null),
                authService.getAllFlights().catch(() => [])
            ]);

            const totalRevenue = revenueData?.tongDoanhThu || 0;
            const allFlights = Array.isArray(flightsData) ? flightsData : [];

            // Get flights for today (or fallback to recent 5)
            const todayStr = new Date().toLocaleDateString('en-CA');
            let flightsTodayList = allFlights.filter(f => {
                if (!f.ngayGioKhoiHanh) return false;
                let d;
                if (Array.isArray(f.ngayGioKhoiHanh)) {
                    d = new Date(f.ngayGioKhoiHanh[0], f.ngayGioKhoiHanh[1] - 1, f.ngayGioKhoiHanh[2]);
                } else {
                    d = new Date(f.ngayGioKhoiHanh);
                }
                return d.toLocaleDateString('en-CA') === todayStr;
            });
            
            if (flightsTodayList.length === 0) {
                flightsTodayList = allFlights.slice(0, 5);
            } else {
                flightsTodayList = flightsTodayList.slice(0, 5);
            }

            setStats({
                revenueYear: totalRevenue,
                ticketsSoldTotal: allFlights.length,
                pendingCheckins: allFlights.reduce((acc, f) => acc + ((f.soLuongCho || 0) - (f.soLuongChoConLai || 0)), 0),
                activeFlights: allFlights.filter(f => f.trangThai === 'Đã lên lịch').length || allFlights.length,
                flightsToday: flightsTodayList
            });
        } catch (error) {
            console.error("Error fetching employee data", error);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (v) => Number(v).toLocaleString('vi-VN') + ' VNĐ';

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

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <Navbar />
            <div className="flex flex-1 pt-20">
                <EmployeeSidebar user={user} handleLogout={handleLogout} />
                
                <main className="flex-grow p-4 md:p-8">
                    <div className="max-w-[1400px] mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Tổng quan hệ thống</h1>
                            <p className="text-gray-500 font-medium">Chào mừng trở lại, {user?.user?.name || 'Nhân viên'}.</p>
                        </header>

                        {loading ? (
                            <div className="flex justify-center items-center py-32">
                                <div className="h-12 w-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* KPI Widgets */}
                                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Doanh thu năm nay</p>
                                        <h3 className="text-2xl font-black text-gray-800">{formatMoney(stats.revenueYear)}</h3>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Tổng chuyến bay</p>
                                        <h3 className="text-2xl font-black text-gray-800">{stats.ticketsSoldTotal}</h3>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vé đã xuất</p>
                                        <h3 className="text-2xl font-black text-gray-800">{stats.pendingCheckins}</h3>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Đang hoạt động</p>
                                        <h3 className="text-2xl font-black text-gray-800">{stats.activeFlights}</h3>
                                    </div>
                                </div>

                                {/* Flight Status Board */}
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="text-xl font-black text-gray-800">Theo dõi chuyến bay hôm nay</h3>
                                        <button onClick={() => navigate('/employee/flights')} className="text-sm font-bold text-blue-600 hover:underline">Xem tất cả</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-400 text-[11px] font-black uppercase tracking-wider">
                                                    <th className="px-6 py-4">Chuyến bay</th>
                                                    <th className="px-6 py-4">Hành trình</th>
                                                    <th className="px-6 py-4">Khởi hành</th>
                                                    <th className="px-6 py-4">Khách (Pax)</th>
                                                    <th className="px-6 py-4 text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {stats.flightsToday.map((flight, i) => {
                                                    const id = flight.maChuyenBay || flight.id;
                                                    const route = `${flight.maSanBayDi?.thanhPho || '?'} → ${flight.maSanBayDen?.thanhPho || '?'}`;
                                                    const depTime = formatTimeOnly(flight.ngayGioKhoiHanh);
                                                    const booked = flight.soLuongChoKhach || 0;
                                                    const total = flight.mayBay?.soLuongCho || flight.soLuongCho || 180;
                                                    const status = flight.trangThai || 'Đã lên lịch';
                                                    
                                                    return (
                                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-800">{id}</td>
                                                        <td className="px-6 py-4 text-gray-600 font-medium">{route}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">{depTime}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-500 text-sm font-bold">{booked}/{total}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                status === 'Đúng giờ' ? 'bg-emerald-100 text-emerald-700' :
                                                                status === 'Đang bay' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )})}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeOverview;
