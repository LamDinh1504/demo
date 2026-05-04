import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import logoImg from '../../assets/logo.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authService.login(email, password);
            const data = response;
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
            
            const rawRole = findRoleAggressively(data.user) || findRoleAggressively(data) || "";
            const userRole = rawRole.toString().toUpperCase();
            
            console.log("Login Success. Role:", userRole);

            if (userRole.includes('ADMIN')) {
                navigate('/admin/dashboard');
            } else if (userRole.includes('USER')) {
                navigate('/employee/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
            <div className="h-screen flex font-sans bg-slate-50 selection:bg-blue-500 selection:text-white overflow-hidden">
                {/* Left Panel - Image/Brand (Centered Content) */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center transition-transform duration-[20s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                    <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />

                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-white w-full text-center">
                        <div className="flex flex-col items-center gap-6 mb-10">
                            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                                <img
                                    src={logoImg}
                                    alt="FlyViet"
                                    className="h-12 w-12 rounded-lg object-contain bg-white"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                            <span className="text-2xl font-bold tracking-[0.2em] uppercase text-white/90 drop-shadow-lg">FlyViet</span>
                        </div>

                        <div className="max-w-md">
                            <h1 className="text-5xl font-extrabold leading-[1.15] mb-6 tracking-tight">
                                Chạm đến bầu trời, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-300 to-cyan-300">
                                    Khám phá thế giới.
                                </span>
                            </h1>
                            <p className="text-lg text-slate-300/90 font-medium leading-relaxed">
                                Nền tảng đặt vé máy bay hàng đầu - an toàn, nhanh chóng và ngập tràn ưu đãi hạng nhất dành riêng cho bạn.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 flex flex-col relative overflow-y-auto bg-white">
                    {/* Decorative background elements */}
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
                    <div className="absolute top-[40%] left-[20%] w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000" />

                    <div className="w-full max-w-[460px] mx-auto my-auto relative z-10 bg-white/70 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 my-8">
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                <img
                                    src={logoImg}
                                    alt="FlyViet"
                                    className="h-8 w-8 rounded-lg object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                            <span className="text-xl font-bold tracking-[0.15em] uppercase text-slate-800">FlyViet</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h2>
                            <p className="text-slate-500 font-medium">Chào mừng bạn quay lại! Hãy đăng nhập vào tài khoản của bạn.</p>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/90 p-4 text-sm text-red-600 animate-fade-in shadow-sm shadow-red-100">
                                <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Email của bạn</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                        autoComplete="email"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        onClick={() => setShowPassword((v) => !v)}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">Ghi nhớ đăng nhập</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-shimmer" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : 'Đăng nhập'}
                                </span>
                            </button>
                        </form>



                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm font-medium text-slate-500">
                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all">
                                    Đăng ký ngay
                                </Link>
                            </p>
                            <p className="mt-3 text-xs font-medium leading-relaxed text-slate-400">
                                Bằng việc đăng nhập, bạn đồng ý với{' '}
                                <a href="#" className="font-bold text-slate-500 hover:text-slate-700 transition-colors">Điều khoản dịch vụ</a>
                                {' '}và{' '}
                                <a href="#" className="font-bold text-slate-500 hover:text-slate-700 transition-colors">Chính sách bảo mật</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;


