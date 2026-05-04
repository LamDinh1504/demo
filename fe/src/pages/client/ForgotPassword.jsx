import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';
import logoImg from '../../assets/logo.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            setMessage(`Nếu email "${email}" tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.`);
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-100 font-sans">
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-950/70 to-slate-950/90" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-10 text-center text-white">
                    <div className="mb-10 flex items-center gap-3">
                        <img
                            src={logoImg}
                            alt="FlyViet"
                            className="h-10 w-10 rounded-lg object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <span className="text-xl font-extrabold tracking-[0.12em] uppercase">FlyViet</span>
                    </div>
                    <h1 className="mb-4 text-4xl font-extrabold leading-tight">
                        Chạm đến bầu trời,<br />
                        <span className="text-sky-300">Khám phá thế giới.</span>
                    </h1>
                    <p className="max-w-sm text-sm font-medium text-white/85 leading-7">
                        Nền tảng đặt vé máy bay hàng đầu - an toàn, nhanh chóng và ngập tràn ưu đãi hạng nhất.
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
                {/* Subtle Bubbles for Light Theme */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <div 
                            key={i}
                            className="bubble !bg-blue-200 !opacity-20" 
                            style={{
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 60 + 20}px`,
                                height: `${Math.random() * 60 + 20}px`,
                                '--duration': `${Math.random() * 15 + 15}s`,
                                animationDelay: `${Math.random() * 10}s`
                            }}
                        />
                    ))}
                </div>

                <div className="w-full max-w-[460px] relative z-10">
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <img
                            src={logoImg}
                            alt="FlyViet"
                            className="h-9 w-9 rounded-lg object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <span className="text-lg font-extrabold tracking-[0.1em] uppercase text-slate-900">FlyViet</span>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-200 bg-white/70 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
                        <div className="mb-7">
                            <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Quay lại đăng nhập
                            </Link>

                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Quên mật khẩu</h2>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Đừng lo lắng! Hãy nhập email bạn dùng để đăng ký, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
                            </p>
                        </div>

                        {message && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-semibold text-emerald-700">
                                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{message}</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
                                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Email của bạn</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    autoComplete="email"
                                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <button
                                type="submit"
                                id="forgot-submit-btn"
                                disabled={loading || message !== ''}
                                className="mt-2 h-12 w-full rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                            </button>
                        </form>

                        <div className="mt-7 border-t border-slate-100 pt-5 text-center">
                            <p className="text-sm font-semibold text-slate-500">
                                Nhớ ra mật khẩu rồi?{' '}
                                <Link to="/login" className="font-extrabold text-blue-600 hover:text-blue-700">
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
