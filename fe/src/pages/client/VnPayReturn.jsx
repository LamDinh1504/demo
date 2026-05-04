import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

export default function VnPayReturn() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, failed

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Gửi toàn bộ query string xuống backend để verify và update DB
                const response = await api.get(`/api/payment/vnpay-return${location.search}`);
                if (response.data && response.data.code === '00') {
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error("Lỗi xác thực VNPay:", error);
                setStatus('failed');
            }
        };

        if (location.search) {
            verifyPayment();
        } else {
            setStatus('failed');
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col text-slate-900 font-sans" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <Navbar transparent={false} />
            <div className="mx-auto w-full max-w-2xl pt-[120px] pb-20 px-4 text-center flex-grow">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                    
                    {status === 'processing' && (
                        <div>
                            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-500 animate-pulse">
                                <svg className="animate-spin w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Đang xác thực giao dịch...</h2>
                            <p className="text-slate-500 font-medium mb-8">Vui lòng không đóng trình duyệt trong quá trình này.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-sky-500"></div>
                            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Thanh toán thành công!</h2>
                            <p className="text-slate-500 font-medium mb-8">Giao dịch của bạn đã được ghi nhận. Vé đã được giữ chỗ và thanh toán đầy đủ.</p>
                            <button onClick={() => navigate('/my-flights')} className="rounded-2xl bg-sky-600 px-8 py-4 text-sm font-black text-white hover:bg-sky-700 transition-all shadow-lg">Xem vé của tôi</button>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div>
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-orange-500"></div>
                            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Thanh toán thất bại!</h2>
                            <p className="text-slate-500 font-medium mb-8">Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán.</p>
                            <button onClick={() => navigate('/')} className="rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-lg">Về trang chủ</button>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </div>
    );
}
