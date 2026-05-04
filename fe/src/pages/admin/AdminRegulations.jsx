import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../context/ToastContext';

const AdminRegulations = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const { addToast } = useToast();
    const [regulations, setRegulations] = useState({
        soLuongSanBay: 0,
        thoiGianBayToiThieu: 0,
        soSanBayTrungGianToiDa: 0,
        thoiGianDungToiThieu: 0,
        thoiGianDungToiDa: 0,
        soLuongHangVe: 0,
        thoiGianChamNhatKhiDatVe: 0,
        thoiGianHuyDatVe: 0
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const role = currentUser?.user?.role ?? currentUser?.role;
        if (!currentUser || role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        setUser(currentUser);
        fetchRegulations();
    }, []);

    const fetchRegulations = async () => {
        setLoading(true);
        try {
            const data = await authService.getQuyDinh();
            setRegulations(data);
        } catch (err) {
            console.error('Failed to fetch regulations', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegulations({ ...regulations, [name]: parseInt(value) || 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.updateQuyDinh(regulations);
            addToast('Cập nhật thành công', 'success');
            fetchRegulations();
        } catch (err) {
            addToast('Lỗi: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setLoading(false);
        }
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
                <AdminSidebar user={user} handleLogout={handleLogout} />

                <div className="flex-1 bg-white border border-gray-200 shadow-sm min-h-[500px]">
                    <div className="bg-[#f0f0f0] px-6 py-4 flex items-center justify-between">
                        <h2 className="text-[17px] font-bold text-[#333]">Thay đổi quy định</h2>
                    </div>

                    <div className="p-8 animate-slide-up">
                        <div className="max-w-3xl">
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3">Quy định chuyến bay</h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Số lượng sân bay tối đa</label>
                                            <div className="relative">
                                                <input type="number" name="soLuongSanBay" value={regulations.soLuongSanBay} onChange={handleInputChange} required min="1" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                                <span className="absolute right-0 bottom-2 text-[10px] font-bold text-gray-300">SÂN BAY</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Thời gian bay tối thiểu</label>
                                            <div className="relative">
                                                <input type="number" name="thoiGianBayToiThieu" value={regulations.thoiGianBayToiThieu} onChange={handleInputChange} required min="1" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                                <span className="absolute right-0 bottom-2 text-[10px] font-bold text-gray-300">PHÚT</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3">Sân bay trung gian</h3>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Số điểm dừng tối đa</label>
                                            <input type="number" name="soSanBayTrungGianToiDa" value={regulations.soSanBayTrungGianToiDa} onChange={handleInputChange} required min="0" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Dừng tối thiểu</label>
                                            <div className="relative">
                                                <input type="number" name="thoiGianDungToiThieu" value={regulations.thoiGianDungToiThieu} onChange={handleInputChange} required min="1" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                                <span className="absolute right-0 bottom-2 text-[10px] font-bold text-gray-300">PHÚT</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Dừng tối đa</label>
                                            <div className="relative">
                                                <input type="number" name="thoiGianDungToiDa" value={regulations.thoiGianDungToiDa} onChange={handleInputChange} required min="1" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                                <span className="absolute right-0 bottom-2 text-[10px] font-bold text-gray-300">PHÚT</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3">Vé & Đặt chỗ</h3>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Số lượng hạng vé</label>
                                            <input type="number" name="soLuongHangVe" value={regulations.soLuongHangVe} onChange={handleInputChange} required min="1" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Hạn chót đặt vé</label>
                                            <div className="relative">
                                                <input type="number" name="thoiGianChamNhatKhiDatVe" value={regulations.thoiGianChamNhatKhiDatVe} onChange={handleInputChange} required min="0" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                                <span className="absolute right-0 bottom-2 text-[10px] font-bold text-gray-300">GIỜ</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase">Hạn chót hủy vé</label>
                                            <div className="relative">
                                                <input type="number" name="thoiGianHuyDatVe" value={regulations.thoiGianHuyDatVe} onChange={handleInputChange} required min="0" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#8dc63f] transition-colors font-bold text-gray-700" />
                                                <span className="absolute right-0 bottom-2 text-[10px] font-bold text-gray-300">GIỜ</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="pt-8 border-t border-gray-100">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold py-3 px-12 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
                                    </button>
                                    <p className="mt-4 text-[11px] text-gray-400 italic">* Các thay đổi sẽ được áp dụng ngay lập tức cho toàn bộ hệ thống.</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default AdminRegulations;
