import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const code = searchParams.get('code');

    const handleVerify = async () => {
        if (!code) {
            setStatus('error');
            setMessage('Mã xác thực không hợp lệ hoặc đã bị thiếu trong đường dẫn.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await axios.get(`http://localhost:8080/api/auth/verify?code=${code}`);
            setStatus('success');
            setMessage('Tài khoản của bạn đã được xác thực thành công!');
            setTimeout(() => navigate('/login'), 3500);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10 font-sans">
            <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-slate-800">
                    <span className="text-lg">✈</span>
                    <span className="text-xl font-black tracking-wide">FLYVIET</span>
                </Link>

                {/* Icon changes based on status */}
                <div className="mb-4 text-5xl leading-none">
                    {status === 'success' ? '✅' : status === 'error' ? '❌' : '📧'}
                </div>

                <h2 className="mb-2 text-2xl font-black text-slate-900">
                    {status === 'success' ? 'Xác thực thành công!' : status === 'error' ? 'Xác thực thất bại' : 'Xác thực tài khoản'}
                </h2>
                <p className="mb-6 text-sm text-slate-500">
                    {status === 'idle' && 'Nhấn nút bên dưới để hoàn tất xác thực tài khoản của bạn.'}
                    {status === 'loading' && 'Đang xử lý xác thực, vui lòng chờ...'}
                    {status === 'success' && 'Bạn có thể đăng nhập ngay bây giờ. Đang tự động chuyển hướng...'}
                    {status === 'error' && 'Đã xảy ra lỗi trong quá trình xác thực.'}
                </p>

                {status === 'error' && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-left text-sm font-medium text-red-700">{message}</div>
                )}
                {status === 'success' && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left text-sm font-medium text-emerald-700">{message}</div>
                )}

                {status !== 'success' && (
                    <button
                        onClick={handleVerify}
                        className="mb-5 h-11 w-full rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Đang xác thực...' : 'Xác thực ngay'}
                    </button>
                )}

                <p className="mt-2 text-sm">
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">← Quay lại trang Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
