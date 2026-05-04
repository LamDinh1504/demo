import React from 'react';
import Navbar from '../../components/Navbar';

const notifications = [
    { id: 1, title: 'Ưu đãi cuối tuần', content: 'Giảm 20% cho các chuyến bay nội địa.', time: '2 giờ trước' },
    { id: 2, title: 'Nhắc nhở check-in', content: 'Bạn có thể check-in online trước 24 giờ.', time: 'Hôm qua' },
    { id: 3, title: 'Cập nhật quy định', content: 'Vui lòng kiểm tra chính sách hành lý mới nhất.', time: '3 ngày trước' },
];

export default function Notifications() {
    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <Navbar transparent={false} />
            <div className="mx-auto w-[min(900px,92vw)] pt-[100px] pb-14">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h1 className="mb-4 text-3xl font-black text-slate-900">Thông báo</h1>
                    <div className="grid gap-3">
                        {notifications.map((item) => (
                            <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                                <div className="font-bold text-slate-900">{item.title}</div>
                                <div className="mt-1 text-sm text-slate-600">{item.content}</div>
                                <div className="mt-2 text-xs font-semibold text-slate-400">{item.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
