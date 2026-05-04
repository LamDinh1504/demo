import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminTicketClasses = () => {
    const [ticketClasses, setTicketClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const { addToast } = useToast();
    
    // Ticket Class Modal state
    const [showHVModal, setShowHVModal] = useState(false);
    const [editingHV, setEditingHV] = useState(null);
    const [hvFormData, setHvFormData] = useState({ tenHangVe: '', heSoGia: '' });

    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, classId: null });

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
            const tcData = await authService.getAllHangVe();
            setTicketClasses(Array.isArray(tcData) ? tcData : []);
        } catch (err) {
            console.error(err);
            addToast('Không thể tải dữ liệu hạng vé.', 'error');
        } finally { setLoading(false); }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const handleOpenHVModal = (hv = null) => {
        if (hv) {
            setEditingHV(hv);
            setHvFormData({ tenHangVe: hv.tenHangVe || '', heSoGia: hv.heSoGia || '' });
        } else {
            setEditingHV(null);
            setHvFormData({ tenHangVe: '', heSoGia: '' });
        }
        setShowHVModal(true);
    };

    const handleHVSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { 
                ...hvFormData, 
                heSoGia: parseFloat(hvFormData.heSoGia) 
            };
            if (editingHV) {
                await authService.updateHangVe(editingHV.maHangVe, payload);
                addToast('Cập nhật thành công', 'success');
            } else {
                await authService.addHangVe(payload);
                addToast('Thêm thành công', 'success');
            }
            fetchData();
            setShowHVModal(false);
        } catch (err) { 
            const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message);
            addToast(msg, 'error'); 
        }
        finally { setLoading(false); }
    };

    const handleDeleteHV = (id) => {
        setConfirmDelete({ isOpen: true, classId: id });
    };

    const handleConfirmDelete = async () => {
        const id = confirmDelete.classId;
        setConfirmDelete({ isOpen: false, classId: null });
        try {
            await authService.deleteHangVe(id);
            addToast('Xóa thành công', 'success');
            fetchData();
        } catch (err) {
            addToast('Rất tiếc, không thể gỡ bỏ hạng dịch vụ này do đang có chuyến bay sử dụng.', 'error');
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
                        <h2 className="text-[17px] font-bold text-[#333]">Quản lý Hạng vé</h2>
                        <button 
                            onClick={() => handleOpenHVModal()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-100 flex items-center gap-2"
                        >
                            <span>+</span> Thêm hạng vé mới
                        </button>
                    </div>

                    <div className="p-8 flex-grow animate-slide-up">
                        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="text-left bg-gray-50/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Tên hạng vé</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Hệ số giá</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {ticketClasses.map((tc) => (
                                            <tr key={tc.maHangVe} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4"><span className="font-bold text-gray-400">{tc.maHangVe}</span></td>
                                                <td className="px-6 py-4"><span className="font-bold text-gray-800">{tc.tenHangVe}</span></td>
                                                <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs">x{tc.heSoGia}</span></td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => handleOpenHVModal(tc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                                                        <button onClick={() => handleDeleteHV(tc.maHangVe)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
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

            {/* Ticket Class Modal */}
            {showHVModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="bg-blue-600 px-8 py-6 text-white">
                            <h3 className="text-xl font-bold">{editingHV ? 'Cập nhật hạng vé' : 'Thêm hạng vé mới'}</h3>
                            <p className="text-xs opacity-80 mt-1">Cấu hình tên và hệ số nhân đơn giá.</p>
                        </div>
                        <form onSubmit={handleHVSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tên hạng vé</label>
                                <input type="text" value={hvFormData.tenHangVe} onChange={e => setHvFormData({...hvFormData, tenHangVe: e.target.value})} required placeholder="VD: Business, Economy..." className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Hệ số giá (Multiplier)</label>
                                <input type="number" step="0.1" value={hvFormData.heSoGia} onChange={e => setHvFormData({...hvFormData, heSoGia: e.target.value})} required placeholder="VD: 1.5" className="w-full border-b border-gray-200 py-2 outline-none font-bold text-sm" />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                                    {loading ? 'Đang lưu...' : 'Lưu hạng vé'}
                                </button>
                                <button type="button" onClick={() => setShowHVModal(false)} className="px-8 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa hạng vé này không?"
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, classId: null })}
            />

            <Footer />
        </div>
    );
};

export default AdminTicketClasses;
