import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminAirports = () => {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const { addToast } = useToast();
    
    // Airport Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingAirport, setEditingAirport] = useState(null);
    const [formData, setFormData] = useState({ maIATA: '', tenSanBay: '', thanhPho: '', quocGia: '' });

    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, airportId: null });

    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const role = currentUser?.user?.role ?? currentUser?.role;
        if (!currentUser || role !== 'ADMIN') { navigate('/login'); return; }
        setUser(currentUser);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const aData = await authService.getAllAirports();
            setAirports(Array.isArray(aData) ? aData : []);
        } catch (err) {
            console.error(err);
            addToast('Không thể tải dữ liệu sân bay.', 'error');
        } finally { setLoading(false); }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const handleOpenModal = (airport = null) => {
        if (airport) {
            setEditingAirport(airport);
            setFormData({ maIATA: airport.maIATA || '', tenSanBay: airport.tenSanBay || '', thanhPho: airport.thanhPho || '', quocGia: airport.quocGia || '' });
        } else {
            setEditingAirport(null);
            setFormData({ maIATA: '', tenSanBay: '', thanhPho: '', quocGia: '' });
        }
        setShowModal(true);
    };

    const handleAirportSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAirport) {
                await authService.updateAirport(editingAirport.maSanBay, formData);
                addToast('Cập nhật thành công', 'success');
            } else {
                await authService.addAirport(formData);
                addToast('Thêm thành công', 'success');
            }
            fetchData();
            setShowModal(false);
        } catch (err) { 
            const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message);
            addToast(msg, 'error'); 
        }
        finally { setLoading(false); }
    };

    const handleDeleteAirport = (id) => {
        setConfirmDelete({ isOpen: true, airportId: id });
    };

    const handleConfirmDelete = async () => {
        const id = confirmDelete.airportId;
        setConfirmDelete({ isOpen: false, airportId: null });
        try {
            await authService.deleteAirport(id);
            addToast('Xóa thành công', 'success');
            fetchData();
        } catch (err) {
            addToast('Lỗi khi xóa sân bay.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#f4f6f8] relative">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
                    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
                    .modal-overlay { background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); }
                `}
            </style>
            
            <div className="fixed inset-0 z-[-1]">
                <img src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1920" alt="Clouds" className="w-full h-full object-cover opacity-[0.1]" />
            </div>

            <Navbar transparent={false} />

            <div className="mx-auto w-[min(1200px,96vw)] mt-28 mb-20 flex-grow flex flex-col md:flex-row gap-6 relative z-10" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <AdminSidebar user={user} handleLogout={handleLogout} />

                <div className="flex-1 bg-white border border-gray-200 shadow-sm min-h-[600px] flex flex-col rounded-xl overflow-hidden">
                    <div className="bg-[#f8f9fa] border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                        <h2 className="text-[17px] font-bold text-[#333]">Quản lý Sân bay</h2>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="bg-[#8dc63f] hover:bg-[#7db135] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 flex items-center gap-2"
                        >
                            <span>+</span> Thêm sân bay mới
                        </button>
                    </div>

                    <div className="p-8 flex-grow animate-slide-up">
                        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="text-left bg-gray-50/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">IATA</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Sân bay</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Vị trí</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {airports.map((a) => (
                                            <tr key={a.maSanBay} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4"><span className="font-bold text-blue-600">{a.maIATA}</span></td>
                                                <td className="px-6 py-4"><span className="font-bold text-gray-800">{a.tenSanBay}</span></td>
                                                <td className="px-6 py-4"><span className="text-sm text-gray-600">{a.thanhPho}, {a.quocGia}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleOpenModal(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                                                        <button onClick={() => handleDeleteAirport(a.maSanBay)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Airport Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="bg-[#8dc63f] px-8 py-6 text-white">
                            <h3 className="text-xl font-bold">{editingAirport ? 'Cập nhật sân bay' : 'Thêm sân bay mới'}</h3>
                            <p className="text-xs opacity-80 mt-1">Vui lòng nhập đầy đủ thông tin sân bay.</p>
                        </div>
                        <form onSubmit={handleAirportSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">IATA</label>
                                    <input type="text" value={formData.maIATA} onChange={e => setFormData({...formData, maIATA: e.target.value})} required className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm uppercase" />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tên sân bay</label>
                                    <input type="text" value={formData.tenSanBay} onChange={e => setFormData({...formData, tenSanBay: e.target.value})} required className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Thành phố</label>
                                    <input type="text" value={formData.thanhPho} onChange={e => setFormData({...formData, thanhPho: e.target.value})} required className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Quốc gia</label>
                                    <input type="text" value={formData.quocGia} onChange={e => setFormData({...formData, quocGia: e.target.value})} required className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={loading} className="flex-1 bg-[#8dc63f] hover:bg-[#7db135] text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                                    {loading ? 'Đang lưu...' : 'Lưu sân bay'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa sân bay này không?"
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, airportId: null })}
            />

            <Footer />
        </div>
    );
};

export default AdminAirports;
