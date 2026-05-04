import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const { addToast } = useToast();
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        sdt: '',
        diaChi: '',
        ngaySinh: '',
        gioiTinh: 'Nam',
        cccd: '',
        role: 'CLIENT',
        password: ''
    });

    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, userId: null });

    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const role = currentUser?.user?.role ?? currentUser?.role;
        if (!currentUser || role !== 'ADMIN') { navigate('/login'); return; }
        setUser(currentUser);
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await authService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            addToast('Không thể tải danh sách người dùng.', 'error');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                hoTen: user.hoTen || '',
                email: user.email || '',
                sdt: user.sdt || '',
                diaChi: user.diaChi || '',
                ngaySinh: user.ngaySinh || '',
                gioiTinh: user.gioiTinh || 'Nam',
                cccd: user.cccd || '',
                role: user.role || 'USER',
                password: '' // Don't show password
            });
        } else {
            setEditingUser(null);
            setFormData({
                hoTen: '',
                email: '',
                sdt: '',
                diaChi: '',
                ngaySinh: '',
                gioiTinh: 'Nam',
                cccd: '',
                role: 'USER',
                password: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingUser) {
                await authService.updateUserAdmin(editingUser.maNguoiDung, formData);
                addToast('Cập nhật thành công', 'success');
            } else {
                await authService.createUserAdmin(formData);
                addToast('Thêm thành công', 'success');
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            addToast(err.response?.data || 'Đã xảy ra lỗi. Vui lòng thử lại.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (userId) => {
        setConfirmDelete({ isOpen: true, userId });
    };

    const handleConfirmDelete = async () => {
        const userId = confirmDelete.userId;
        setConfirmDelete({ isOpen: false, userId: null });
        setLoading(true);
        try {
            await authService.deleteUserAdmin(userId);
            addToast('Xóa thành công', 'success');
            fetchUsers();
        } catch (err) {
            addToast('Đã xảy ra lỗi khi xóa.', 'error');
        } finally {
            setLoading(false);
        }
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
                    .modal-overlay {
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
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
                    <div className="bg-[#f0f0f0] px-6 py-4 flex justify-between items-center">
                        <h2 className="text-[17px] font-bold text-[#333]">Quản lý người dùng</h2>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="bg-[#8dc63f] hover:bg-[#7db135] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Thêm người dùng
                        </button>
                    </div>

                    <div className="p-8 animate-slide-up">
                        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 tracking-tight">Danh sách tài khoản</h3>
                                <p className="mt-1 text-xs text-gray-500 font-medium">Xem và quản lý tất cả người dùng trên hệ thống.</p>
                            </div>
                        </header>

                        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
                            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
                                <h4 className="text-sm font-bold text-gray-700">Người dùng ({users.length})</h4>
                                {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#8dc63f]" />}
                            </div>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Mã ND</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Tên người dùng</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Email</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Vai trò</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map((u) => (
                                            <tr key={u.maNguoiDung} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-blue-600">{u.maNguoiDung}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-800">{u.hoTen}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">{u.email}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : u.role === 'USER' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                        {u.role === 'ADMIN' ? 'ADMIN' : u.role === 'USER' ? 'USER' : 'CLIENT'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleOpenModal(u)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Sửa"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(u.maNguoiDung)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                    <div className="mb-2 text-3xl opacity-50">👥</div>
                                                    <p className="font-bold">Chưa có dữ liệu người dùng</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Họ tên</label>
                                    <input 
                                        type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại</label>
                                    <input 
                                        type="text" name="sdt" value={formData.sdt} onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">CCCD</label>
                                    <input 
                                        type="text" name="cccd" value={formData.cccd} onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Ngày sinh</label>
                                    <input 
                                        type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Giới tính</label>
                                    <select 
                                        name="gioiTinh" value={formData.gioiTinh} onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Vai trò</label>
                                    <select 
                                        name="role" value={formData.role} onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    >
                                        <option value="CLIENT">CLIENT (Khách hàng)</option>
                                        <option value="USER">USER (Nhân viên)</option>
                                        <option value="ADMIN">ADMIN (Quản trị)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</label>
                                    <input 
                                        type="password" name="password" value={formData.password} onChange={handleChange} required={!editingUser}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ</label>
                                    <textarea 
                                        name="diaChi" value={formData.diaChi} onChange={handleChange} rows="2"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#8dc63f] focus:ring-2 focus:ring-[#8dc63f]/20 outline-none transition-all"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button 
                                    type="button" onClick={handleCloseModal}
                                    className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" disabled={loading}
                                    className="bg-[#8dc63f] hover:bg-[#7db135] text-white px-8 py-2 rounded-lg font-bold shadow-md shadow-[#8dc63f]/20 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Đang xử lý...' : editingUser ? 'Lưu thay đổi' : 'Thêm người dùng'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa người dùng này không? Thao tác này không thể hoàn tác."
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete({ isOpen: false, userId: null })}
            />

            <Footer />
        </div>
    );
};

export default AdminUsers;
