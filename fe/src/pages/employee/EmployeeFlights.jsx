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

const formatDateShort = (value) => {
    if (!value) return '--/--';
    let d;
    if (Array.isArray(value)) d = new Date(value[0], value[1] - 1, value[2]);
    else d = new Date(value);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const EmployeeFlights = () => {
    const [user, setUser] = useState(null);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        setUser(currentUser);
        fetchFlights();
    }, []);

    const fetchFlights = async () => {
        setLoading(true);
        try {
            const data = await authService.getAllFlights();
            setFlights(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const filteredFlights = flights.filter(f => 
        String(f.maChuyenBay || f.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.maSanBayDi?.thanhPho || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.maSanBayDen?.thanhPho || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <Navbar />
            <div className="flex flex-1 pt-20">
                <EmployeeSidebar user={user} handleLogout={handleLogout} />
                
                <main className="flex-grow p-4 md:p-8">
                    <div className="max-w-[1400px] mx-auto">
                        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800 tracking-tight">Lịch bay chi tiết</h1>
                                <p className="text-gray-500 font-medium">Theo dõi và quản lý trạng thái các chuyến bay trong hệ thống.</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                                    <input 
                                        placeholder="Tìm chuyến bay, điểm đến..." 
                                        className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button onClick={fetchFlights} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600">🔄</button>
                            </div>
                        </header>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                                            <th className="px-6 py-5">Mã bay</th>
                                            <th className="px-6 py-5">Ngày</th>
                                            <th className="px-6 py-5">Khởi hành</th>
                                            <th className="px-6 py-5">Điểm đi</th>
                                            <th className="px-6 py-5">Điểm đến</th>
                                            <th className="px-6 py-5">Máy bay</th>
                                            <th className="px-6 py-5">Số khách</th>
                                            <th className="px-6 py-5 text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr><td colSpan="8" className="py-20 text-center font-black text-gray-300 animate-pulse uppercase tracking-widest">Đang tải lịch bay...</td></tr>
                                        ) : filteredFlights.length > 0 ? filteredFlights.map((f, i) => (
                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4 font-black text-blue-600">{f.maChuyenBay || f.id}</td>
                                                <td className="px-6 py-4 font-bold text-gray-600">{formatDateShort(f.ngayGioKhoiHanh)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-black bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 text-sm">{formatTimeOnly(f.ngayGioKhoiHanh)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{f.maSanBayDi?.maIATA}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-black">{f.maSanBayDi?.thanhPho}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{f.maSanBayDen?.maIATA}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-black">{f.maSanBayDen?.thanhPho}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-600">{f.mayBay?.tenMayBay || 'Airbus A321'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-500 rounded-full" 
                                                                style={{ width: `${Math.min(100, ((f.soLuongChoKhach || 0) / (f.soLuongCho || 180)) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-500">{f.soLuongChoKhach || 0}/{f.soLuongCho || 180}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        f.trangThai === 'Đúng giờ' ? 'bg-emerald-100 text-emerald-700' :
                                                        f.trangThai === 'Đang bay' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {f.trangThai || 'Đã lên lịch'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="8" className="py-20 text-center font-bold text-gray-300">Không tìm thấy chuyến bay nào khớp với từ khóa.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary Legend */}
                        <div className="mt-6 flex flex-wrap gap-6 px-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-bold text-gray-500">Đúng giờ</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold text-gray-500">Đang bay</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                <span className="text-xs font-bold text-gray-500">Đã lên lịch</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeeFlights;
