import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLogin && password !== confirmPassword) {
            addToast("Mật khẩu xác nhận không khớp!", 'error');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const response = await authService.login(email, password);
                const userRole = response?.user?.role ?? response?.role;
                if (userRole !== 'ADMIN') {
                    addToast('Truy cập bị từ chối. Tài khoản không có phân quyền Quản trị viên.', 'error');
                    authService.logout();
                } else {
                    addToast('Đăng nhập thành công!', 'success');
                    navigate('/admin/dashboard');
                }
            } else {
                await authService.register(name, email, password, 'ADMIN');
                addToast('Tạo tài khoản thành công! Vui lòng kiểm tra email để xác thực.', 'success');
                setTimeout(() => setIsLogin(true), 4000);
            }
        } catch (err) {
            addToast(err.response?.data?.message || (isLogin ? 'Đăng nhập thất bại!' : 'Đăng ký thất bại!'), 'error');
        } finally {
            setLoading(false);
        }
    };



    const switchMode = () => {
        setIsLogin(!isLogin);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen flex bg-white text-slate-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
                `}
            </style>
            {/* Left Side: Image and Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')] bg-cover bg-center">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-blue-900/30 bg-gradient-to-t from-blue-950/90 via-blue-900/50 to-transparent"></div>
                
                {/* Branding Content */}
                <div className="relative z-10 flex flex-col justify-end p-16 w-full h-full text-white">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                            <svg className="w-6 h-6 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight drop-shadow-md">SkyWings</span>
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-tight mb-5 leading-[1.1] drop-shadow-md">
                        Hệ thống<br/>
                        <span className="text-sky-400">Quản trị bay</span>
                    </h1>
                    
                    <p className="text-lg text-blue-50/90 max-w-lg leading-relaxed font-medium">
                        Điều hành hàng ngàn chuyến bay, quản lý giá vé và theo dõi hành trình một cách chuyên nghiệp, nhanh chóng và an toàn tuyệt đối.
                    </p>
                    
                    <div className="mt-10 flex items-center gap-8 text-sm font-semibold text-white/80">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20">🚀</span>
                            Tốc độ cao
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20">🛡️</span>
                            Bảo mật tuyệt đối
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-white">
                <div className="w-full max-w-md">
                    
                    {/* Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản quản trị'}
                        </h2>
                        <p className="text-slate-500 mt-3 text-sm font-medium">
                            {isLogin 
                                ? 'Đăng nhập vào bảng điều khiển để quản lý chuyến bay.' 
                                : 'Điền thông tin bên dưới để thiết lập quyền quản trị viên mới.'}
                        </p>
                    </div>



                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Họ và Tên</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mật khẩu</label>
                                {isLogin && (
                                    <a href="#" className="text-xs font-semibold text-sky-600 hover:text-sky-700">Quên mật khẩu?</a>
                                )}
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-md shadow-sky-500/20 mt-4 outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        >
                            {loading ? 'Đang Xử Lý...' : (isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-10 pt-6 border-t border-slate-100 text-center lg:text-left">
                        <p className="text-slate-600 text-sm font-medium">
                            {isLogin ? "Chưa có tài khoản quản lý? " : "Đã có tài khoản? "}
                            <button 
                                onClick={(e) => { e.preventDefault(); switchMode(); }}
                                className="text-sky-600 font-bold hover:text-sky-700 transition-colors ml-1 focus:outline-none"
                            >
                                {isLogin ? 'Đăng Ký ngay' : 'Đăng Nhập'}
                            </button>
                        </p>

                        <a href="/login" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Trở về trang khách hàng
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
