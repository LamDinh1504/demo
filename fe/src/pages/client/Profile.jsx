import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { authService } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [promoCards, setPromoCards] = useState([]);
    const [loadingPromos, setLoadingPromos] = useState(false);


    const showNotify = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };


    // User data state
    const currentUser = authService.getCurrentUser();
    const role = currentUser?.role || currentUser?.user?.role || 'USER';
    const userId = currentUser?.maNguoiDung || currentUser?.user?.maNguoiDung || '???';
    const initialName = currentUser?.name || currentUser?.user?.name || currentUser?.hoTen || currentUser?.user?.hoTen || 'Hành khách';
    const initialEmail = currentUser?.email || currentUser?.user?.email || 'email@example.com';

    const [formData, setFormData] = useState({
        fullName: initialName,
        email: initialEmail,
        phone: '',
        dob: '',
        gender: 'Nam',
        cccd: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });


    useEffect(() => {
        const fetchUserProfile = async () => {
            if (userId && userId !== '???') {
                try {
                    const profileData = await authService.getUserProfile(userId);
                    if (profileData) {
                        setFormData({
                            fullName: profileData.hoTen || profileData.name || initialName,
                            email: profileData.email || initialEmail,
                            phone: profileData.sdt || '',
                            dob: profileData.ngaySinh || '',
                            gender: profileData.gioiTinh || 'Nam',
                            cccd: profileData.cccd || ''
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                }
            }
        };
        fetchUserProfile();
    }, [userId, initialName, initialEmail]);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setLoadingPromos(true);
                const data = await authService.getActivePromotions();
                const formattedPromos = data.map(promo => {
                    const expiryDate = new Date(promo.ngayKetThuc);
                    const formattedExpiry = expiryDate.toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });
                    return {
                        id: promo.maKhuyenMai,
                        title: promo.tenChuongTrinh,
                        description: promo.moTaTenChuongTrinh,
                        tag: promo.phanTramGiam > 0 ? `GIẢM ${promo.phanTramGiam}%` : "ƯU ĐÃI",
                        expiry: `Hết hạn: ${formattedExpiry}`,
                        code: promo.code,
                        remaining: promo.soLuongConLai
                    };
                });
                setPromoCards(formattedPromos);
                setLoadingPromos(false);
            } catch (err) {
                console.error("Error fetching promotions:", err);
                setLoadingPromos(false);
            }
        };

        fetchPromotions();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updateData = {
                hoTen: formData.fullName,
                email: formData.email,
                sdt: formData.phone,
                ngaySinh: formData.dob,
                gioiTinh: formData.gender,
                cccd: formData.cccd
            };
            await authService.updateUserProfile(userId, updateData);

            // Also logically update current user in local storage to keep navbar in sync if needed
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                const userObj = currentUser.user || currentUser;
                userObj.name = formData.fullName;
                userObj.hoTen = formData.fullName;
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.dispatchEvent(new Event('storage'));
            }

            showNotify('Thông tin hồ sơ của Quý khách đã được cập nhật thành công!');
        } catch (error) {
            console.error("Failed to update profile", error);
            showNotify('Rất tiếc, đã có sự cố xảy ra. Vui lòng kiểm tra lại kết nối hoặc thông tin!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotify('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showNotify('Mật khẩu mới phải từ 8 ký tự trở lên!', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await authService.changePassword(userId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showNotify('Mật khẩu tài khoản đã được thay đổi thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Failed to change password", error);
            const errorMsg = error.response?.data?.message || 'Mật khẩu hiện tại không chính xác hoặc có lỗi xảy ra!';
            showNotify(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };


    const confirmLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
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
            
            {/* Global Fixed Background matching the cloudy sky pattern */}
            <div className="fixed inset-0 z-[-1]">
                <img src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1920" alt="Clouds" className="w-full h-full object-cover opacity-[0.15]" />
            </div>

            <Navbar transparent={false} />

            {/* Premium Toast Notification */}
            {notification.show && (
                <div className="fixed top-24 right-5 z-[100] animate-slide-up">
                    <div className={`px-6 py-4 rounded shadow-lg border flex items-center gap-4 min-w-[300px] ${notification.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div>
                            <p className="font-bold text-sm uppercase tracking-wider">{notification.type === 'success' ? 'Thành công' : 'Thất bại'}</p>
                            <p className="text-xs font-medium opacity-80">{notification.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={showLogoutModal}
                title="Xác nhận đăng xuất"
                message="Quý khách có chắc chắn muốn kết thúc phiên làm việc hiện tại không?"
                confirmText="Đăng xuất"
                cancelText="Quay lại"
                type="warning"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutModal(false)}
            />

            {/* Content Wrapper */}
            <div className="mx-auto w-[min(1100px,96vw)] mt-28 mb-20 flex-grow flex flex-col md:flex-row gap-6 relative z-10" style={{ fontFamily: "'Roboto', sans-serif" }}>
                
                {/* Left Sidebar */}
                <div className="w-full md:w-[280px] flex-shrink-0">
                    <div className="bg-white shadow-sm border border-gray-200">
                        <nav className="flex flex-col text-[15px] text-[#333]">
                            

                            {/* Thông tin cá nhân */}
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-4 px-5 py-4 text-left transition-colors border-b border-gray-100 ${activeTab === 'profile' ? 'text-black font-semibold bg-gray-50/50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'profile' ? 'bg-[#8dc63f]' : 'bg-gray-400'}`}>
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
                                    </svg>
                                </div>
                                Thông tin cá nhân
                            </button>

                            {/* Lịch sử giao dịch */}
                            <button 
                                onClick={() => navigate('/my-flights')}
                                className="flex items-center gap-4 px-5 py-4 text-left transition-colors border-b border-gray-100 hover:bg-gray-50"
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                    </svg>
                                </div>
                                Lịch sử giao dịch
                            </button>
                            
                            {/* Security (kept for functionality but styled matching) */}
                            <button 
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-4 px-5 py-4 text-left transition-colors border-b border-gray-100 ${activeTab === 'security' ? 'text-black font-semibold bg-gray-50/50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'security' ? 'bg-[#8dc63f]' : 'bg-gray-400'}`}>
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                                </div>
                                Bảo mật tài khoản
                            </button>

                            <button 
                                onClick={() => setActiveTab('vouchers')}
                                className={`flex items-center gap-4 px-5 py-4 text-left transition-colors border-b border-gray-100 ${activeTab === 'vouchers' ? 'text-black font-semibold bg-gray-50/50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'vouchers' ? 'bg-[#8dc63f]' : 'bg-gray-400'}`}>
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                </div>
                                Mã giảm giá ưu đãi
                            </button>

                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 text-red-600"
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
                                    <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                                    </svg>
                                </div>
                                Đăng xuất
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 bg-white border border-gray-200 shadow-sm min-h-[500px]">
                    {/* Header matches the selected tab */}
                    <div className="bg-[#f0f0f0] px-6 py-4">
                        <h2 className="text-[17px] font-bold text-[#333]">
                            {activeTab === 'profile' && 'Thông tin cá nhân'}
                            {activeTab === 'security' && 'Bảo mật tài khoản'}
                            {activeTab === 'vouchers' && 'Ưu đãi của bạn'}
                        </h2>
                    </div>
                    
                    <div className="p-8">

                        {/* Tab 1: Profile Details */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSave} className="flex flex-col gap-6 text-[15px] animate-slide-up">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-gray-600 mb-2 font-semibold">Họ và tên</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50"
                                            placeholder="NGUYỄN VĂN A"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-gray-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50"
                                            placeholder="098xxxxxxx"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Ngày sinh</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            max={new Date().toISOString().split("T")[0]}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Giới tính</label>
                                        <div className="flex gap-4">
                                            {['Nam', 'Nữ'].map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => handleChange({ target: { name: 'gender', value: g } })}
                                                    className={`flex-1 h-12 rounded-xl border font-semibold text-sm transition-all ${formData.gender === g ? 'border-[#8dc63f] bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="col-span-2">
                                        <label className="block text-gray-600 mb-2 font-semibold">Số CCCD / Passport</label>
                                        <input
                                            type="text"
                                            name="cccd"
                                            value={formData.cccd}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50 tracking-[0.2em]"
                                            placeholder="012345678912"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold h-12 px-10 rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Đang lưu...
                                            </>
                                        ) : 'Lưu thông tin'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Tab 3: Security */}
                        {activeTab === 'security' && (
                            <div className="animate-slide-up">
                                <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 text-[15px] max-w-md">
                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 mb-2 font-semibold">Xác nhận mật khẩu</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50"
                                            required
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold h-12 px-10 rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Đang cập nhật...
                                                </>
                                            ) : 'Cập nhật mật khẩu'}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-12 p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <h4 className="text-red-700 font-bold text-sm mb-2 uppercase tracking-wider">Khu vực nguy hiểm</h4>
                                    <p className="text-xs text-red-600 font-medium mb-4 leading-relaxed">Xóa tài khoản sẽ xóa vĩnh viễn tất cả lịch sử bay và điểm tích lũy của bạn. Hành động này không thể hoàn tác.</p>
                                    <button className="text-xs font-bold text-red-600 underline hover:text-red-800 transition-colors uppercase">XÓA TÀI KHOẢN NGAY</button>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Vouchers */}
                        {activeTab === 'vouchers' && (
                            <div className="animate-slide-up">
                                {loadingPromos ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                        <div className="w-12 h-12 border-4 border-[#8dc63f] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : promoCards.length === 0 ? (
                                    <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-400 font-bold border-2 border-dashed border-gray-200">
                                        Hiện chưa có ưu đãi nào phù hợp
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {promoCards.map((promo, idx) => {
                                            const gradients = [
                                                { bg: "from-orange-400 to-red-500", text: "text-orange-500" },
                                                { bg: "from-sky-500 to-indigo-600", text: "text-sky-600" },
                                                { bg: "from-green-400 to-emerald-600", text: "text-emerald-600" },
                                            ];
                                            const colors = gradients[idx % gradients.length];
                                            return (
                                                <div key={promo.id} className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 text-white relative overflow-hidden group shadow-lg`}>
                                                    <div className="relative z-10 flex flex-col h-full">
                                                        <div className="bg-white/20 w-max px-3 py-1 rounded-lg text-[10px] font-bold mb-4 uppercase tracking-widest">{promo.tag}</div>
                                                        <h3 className="text-xl font-bold mb-1 leading-tight">{promo.title}</h3>
                                                        <p className="text-xs text-white/90 font-medium mb-6 flex-grow opacity-90">{promo.description}</p>
                                                        <div className="mt-auto flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold tracking-widest opacity-80 uppercase">CODE: {promo.code}</span>
                                                                <span className="text-[10px] font-medium opacity-70">{promo.expiry}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(promo.code); showNotify('Đã sao chép mã giảm giá!'); }}
                                                                className={`bg-white ${colors.text} px-4 py-2 rounded-xl text-[10px] font-bold hover:scale-105 transition-transform shadow-md active:scale-95`}
                                                            >
                                                                Sao chép
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                                                    <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
