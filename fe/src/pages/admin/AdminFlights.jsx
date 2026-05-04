import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useToast } from '../../context/ToastContext';

const formatMoney = (v) => (v != null ? Number(v).toLocaleString('vi-VN') + ' VNĐ' : '—');
const formatDT = (v) => {
    if (!v) return '—';
    if (Array.isArray(v)) {
        const d = new Date(v[0], v[1] - 1, v[2], v[3] || 0, v[4] || 0);
        return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return new Date(v).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const AdminFlights = () => {
    const [flights, setFlights] = useState([]);
    const [airports, setAirports] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [airplanes, setAirplanes] = useState([]);
    const [ticketClasses, setTicketClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { addToast } = useToast();

    const [editFlight, setEditFlight] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [form, setForm] = useState({
        maHangHK: '', maMayBay: '', maSanBayDi: '', maSanBayDen: '',
        ngayGioKhoiHanh: '', ngayGioHaCanh: '', thoiGianBay: '',
        basePrice: '',
        trangThai: 'Đã lên lịch',
        chiTietHangVe: [{ maHangVe: 1, soLuongCho: '' }],
        sanBayTrungGian: []
    });

    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const role = currentUser?.user?.role ?? currentUser?.role;
        if (!currentUser || role !== 'ADMIN') { navigate('/login'); return; }
        setUser(currentUser);
        fetchData();
    }, []);

    // Auto calculate flight duration for Add Form
    useEffect(() => {
        if (form.ngayGioKhoiHanh && form.ngayGioHaCanh) {
            const start = new Date(form.ngayGioKhoiHanh);
            const end = new Date(form.ngayGioHaCanh);
            if (!isNaN(start) && !isNaN(end) && end > start) {
                const diffMs = end - start;
                const diffMins = Math.floor(diffMs / 60000);
                setForm(prev => ({ ...prev, thoiGianBay: diffMins }));
            }
        }
    }, [form.ngayGioKhoiHanh, form.ngayGioHaCanh]);

    // Auto calculate flight duration for Edit Form
    useEffect(() => {
        if (editForm?.ngayGioKhoiHanh && editForm?.ngayGioHaCanh) {
            const start = new Date(editForm.ngayGioKhoiHanh);
            const end = new Date(editForm.ngayGioHaCanh);
            if (!isNaN(start) && !isNaN(end) && end > start) {
                const diffMs = end - start;
                const diffMins = Math.floor(diffMs / 60000);
                if (editForm.thoiGianBay !== diffMins) {
                    setEditForm(prev => ({ ...prev, thoiGianBay: diffMins }));
                }
            }
        }
    }, [editForm?.ngayGioKhoiHanh, editForm?.ngayGioHaCanh]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [flightsData, airportsData, airlinesData, airplanesData, tcData] = await Promise.all([
                authService.getAllFlights(),
                authService.getAllAirports(),
                authService.getAllAirlines(),
                authService.getAllAirplanes(),
                authService.getAllHangVe()
            ]);
            setFlights(flightsData);
            setAirports(airportsData);
            setAirlines(airlinesData);
            setAirplanes(airplanesData);
            setTicketClasses(tcData || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const addHangVe = () => {
        setForm(prev => ({
            ...prev,
            chiTietHangVe: [...prev.chiTietHangVe, { maHangVe: 1, soLuongCho: '' }]
        }));
    };
    const removeHangVe = (idx) => {
        setForm(prev => ({
            ...prev,
            chiTietHangVe: prev.chiTietHangVe.filter((_, i) => i !== idx)
        }));
    };
    const updateHangVe = (idx, field, value) => {
        setForm(prev => {
            const arr = [...prev.chiTietHangVe];
            arr[idx] = { ...arr[idx], [field]: value };
            return { ...prev, chiTietHangVe: arr };
        });
    };

    const addTrungGian = () => {
        setForm(prev => ({
            ...prev,
            sanBayTrungGian: [...prev.sanBayTrungGian, { maSanBayTG: '', thoiGianDung: '', thuTuDung: prev.sanBayTrungGian.length + 1, ghiChu: '' }]
        }));
    };
    const removeTrungGian = (idx) => {
        setForm(prev => ({
            ...prev,
            sanBayTrungGian: prev.sanBayTrungGian.filter((_, i) => i !== idx)
        }));
    };
    const updateTrungGian = (idx, field, value) => {
        setForm(prev => {
            const arr = [...prev.sanBayTrungGian];
            arr[idx] = { ...arr[idx], [field]: value };
            return { ...prev, sanBayTrungGian: arr };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalChiTiet = form.chiTietHangVe.filter(hv => hv.soLuongCho).map(hv => {
                const tc = ticketClasses.find(t => t.maHangVe === parseInt(hv.maHangVe));
                const price = Math.round(parseFloat(form.basePrice || 0) * (tc?.heSoGia || 1));
                return {
                    maHangVe: parseInt(hv.maHangVe),
                    soLuongCho: parseInt(hv.soLuongCho),
                    giaCoBan: price
                };
            });

            const payload = {
                maHangHK: form.maHangHK ? parseInt(form.maHangHK) : null,
                maMayBay: form.maMayBay ? parseInt(form.maMayBay) : null,
                maSanBayDi: parseInt(form.maSanBayDi),
                maSanBayDen: parseInt(form.maSanBayDen),
                ngayGioKhoiHanh: form.ngayGioKhoiHanh && form.ngayGioKhoiHanh.length === 16 ? form.ngayGioKhoiHanh + ':00' : form.ngayGioKhoiHanh,
                ngayGioHaCanh: form.ngayGioHaCanh && form.ngayGioHaCanh.length === 16 ? form.ngayGioHaCanh + ':00' : form.ngayGioHaCanh,
                thoiGianBay: parseInt(form.thoiGianBay),
                trangThai: form.trangThai || 'Đã lên lịch',
                chiTietHangVe: finalChiTiet,
                sanBayTrungGian: form.sanBayTrungGian.filter(t => t.maSanBayTG).map((t, i) => ({
                    maSanBayTG: parseInt(t.maSanBayTG),
                    thoiGianDung: parseInt(t.thoiGianDung) || 0,
                    thuTuDung: i + 1,
                    ghiChu: t.ghiChu || ''
                }))
            };
            await authService.createFlightAdmin(payload);
            addToast('Thêm chuyến bay thành công', 'success');
            setShowForm(false);
            setForm({
                maHangHK: '', maMayBay: '', maSanBayDi: '', maSanBayDen: '',
                ngayGioKhoiHanh: '', ngayGioHaCanh: '', thoiGianBay: '',
                basePrice: '',
                trangThai: 'Đã lên lịch',
                chiTietHangVe: [{ maHangVe: 1, soLuongCho: '' }],
                sanBayTrungGian: []
            });
            fetchData();
        } catch (err) {
            const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message);
            addToast(msg, 'error');
        }
    };

    const handleDelete = async (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await authService.deleteFlight(deleteId);
            addToast('Xóa chuyến bay thành công', 'success');
            setDeleteId(null);
            fetchData();
        } catch (err) { 
            const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message);
            addToast('Thao tác thất bại: ' + msg, 'error'); 
        } finally {
            setIsDeleting(false);
        }
    };

    const openEdit = (f) => {
        const toLocalDT = (v) => {
            if (!v) return '';
            const d = Array.isArray(v)
                ? new Date(v[0], v[1] - 1, v[2], v[3] || 0, v[4] || 0)
                : new Date(v);
            const pad = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        const firstClass = (f.chiTietHangVe || [])[0];
        const tc = ticketClasses.find(t => t.maHangVe === firstClass?.maHangVe);
        const calculatedBase = firstClass && tc ? Math.round(firstClass.gia / tc.heSoGia) : '';

        setEditFlight(f);
        setEditForm({
            maHangHK: f.maHangHK?.maHangHK ?? '',
            maMayBay: f.maMayBay?.maMayBay ?? '',
            maSanBayDi: f.maSanBayDi?.maSanBay ?? '',
            maSanBayDen: f.maSanBayDen?.maSanBay ?? '',
            ngayGioKhoiHanh: toLocalDT(f.ngayGioKhoiHanh),
            ngayGioHaCanh: toLocalDT(f.ngayGioHaCanh),
            thoiGianBay: f.thoiGianBay ?? '',
            basePrice: calculatedBase,
            trangThai: f.trangThai ?? 'Đã lên lịch',
            chiTietHangVe: (f.chiTietHangVe || []).map(cv => ({
                maHangVe: cv.maHangVe || '',
                soLuongCho: cv.soLuongCho || ''
            })),
            sanBayTrungGian: (f.danhSachTrungGian || []).map(tg => ({
                maSanBayTG: tg.maSanBayTG?.maSanBay || '',
                thoiGianDung: tg.thoiGianDung || '',
                ghiChu: tg.ghiChu || ''
            }))
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            const finalChiTiet = (editForm.chiTietHangVe || []).filter(hv => hv.soLuongCho).map(hv => {
                const tc = ticketClasses.find(t => t.maHangVe === parseInt(hv.maHangVe));
                const price = Math.round(parseFloat(editForm.basePrice || 0) * (tc?.heSoGia || 1));
                return {
                    maHangVe: parseInt(hv.maHangVe),
                    soLuongCho: parseInt(hv.soLuongCho),
                    giaCoBan: price
                };
            });

            const payload = {
                maHangHK: editForm.maHangHK ? parseInt(editForm.maHangHK) : null,
                maMayBay: editForm.maMayBay ? parseInt(editForm.maMayBay) : null,
                maSanBayDi: parseInt(editForm.maSanBayDi),
                maSanBayDen: parseInt(editForm.maSanBayDen),
                ngayGioKhoiHanh: editForm.ngayGioKhoiHanh && editForm.ngayGioKhoiHanh.length === 16 ? editForm.ngayGioKhoiHanh + ':00' : editForm.ngayGioKhoiHanh,
                ngayGioHaCanh: editForm.ngayGioHaCanh && editForm.ngayGioHaCanh.length === 16 ? editForm.ngayGioHaCanh + ':00' : editForm.ngayGioHaCanh,
                thoiGianBay: parseInt(editForm.thoiGianBay),
                trangThai: editForm.trangThai,
                chiTietHangVe: finalChiTiet,
                sanBayTrungGian: editForm.sanBayTrungGian.filter(t => t.maSanBayTG).map((t, i) => ({
                    maSanBayTG: parseInt(t.maSanBayTG),
                    thoiGianDung: parseInt(t.thoiGianDung) || 0,
                    thuTuDung: i + 1,
                    ghiChu: t.ghiChu || ''
                }))
            };
            await authService.updateFlightAdmin(editFlight.maChuyenBay, payload);
            addToast('Cập nhật thành công', 'success');
            setEditFlight(null);
            fetchData();
        } catch (err) {
            const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message);
            addToast(msg, 'error');
        } finally { setEditLoading(false); }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const hangVeNames = { 1: 'Economy', 2: 'Premium Economy', 3: 'Business', 4: 'First Class' };

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
            
            <div className="fixed inset-0 z-[-1]">
                <img src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=1920" alt="Clouds" className="w-full h-full object-cover opacity-[0.15]" />
            </div>

            <Navbar transparent={false} />

            <div className="mx-auto w-[min(1200px,96vw)] mt-28 mb-20 flex-grow flex flex-col md:flex-row gap-6 relative z-10" style={{ fontFamily: "'Roboto', sans-serif" }}>
                <AdminSidebar user={user} handleLogout={handleLogout} />

                <div className="flex-1 bg-white border border-gray-200 shadow-sm min-h-[500px]">
                    <div className="bg-[#f0f0f0] px-6 py-4 flex items-center justify-between">
                        <h2 className="text-[17px] font-bold text-[#333]">Quản lý chuyến bay</h2>
                        <button 
                            onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }} 
                            className="bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold py-2 px-6 rounded-xl transition-all shadow-sm active:scale-95 text-xs"
                        >
                            {showForm ? '✕ Đóng form' : '➕ Thêm chuyến bay'}
                        </button>
                    </div>

                    <div className="p-8 animate-slide-up">

                        {showForm && (
                            <div className="mb-10 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 animate-slide-up">
                                <h3 className="mb-6 text-base font-bold text-gray-800 uppercase tracking-wider">Thông tin chuyến bay mới</h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Hãng hàng không *</label>
                                            <select value={form.maHangHK} onChange={e => handleFormChange('maHangHK', e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50 bg-white">
                                                <option value="">-- Chọn hãng --</option>
                                                {airlines.map(h => <option key={h.maHangHK} value={h.maHangHK}>{h.tenHang}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Máy bay *</label>
                                            <select value={form.maMayBay} onChange={e => handleFormChange('maMayBay', e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50 bg-white">
                                                <option value="">-- Chọn máy bay --</option>
                                                {airplanes.filter(m => !form.maHangHK || m.maHangHK?.maHangHK === parseInt(form.maHangHK)).map(m => <option key={m.maMayBay} value={m.maMayBay}>{m.tenMayBay} ({m.tongSoGhe} ghế)</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Sân bay đi *</label>
                                            <select value={form.maSanBayDi} onChange={e => handleFormChange('maSanBayDi', e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50 bg-white">
                                                <option value="">-- Chọn sân bay --</option>
                                                {airports.map(a => <option key={a.maSanBay} value={a.maSanBay}>{a.maIATA} - {a.thanhPho}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Sân bay đến *</label>
                                            <select value={form.maSanBayDen} onChange={e => handleFormChange('maSanBayDen', e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all focus:ring-4 focus:ring-green-50 bg-white">
                                                <option value="">-- Chọn sân bay --</option>
                                                {airports.map(a => <option key={a.maSanBay} value={a.maSanBay}>{a.maIATA} - {a.thanhPho}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Khởi hành *</label>
                                            <input type="datetime-local" value={form.ngayGioKhoiHanh} onChange={e => handleFormChange('ngayGioKhoiHanh', e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Hạ cánh *</label>
                                            <input type="datetime-local" value={form.ngayGioHaCanh} onChange={e => handleFormChange('ngayGioHaCanh', e.target.value)} required className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Bay (phút) *</label>
                                            <input type="number" value={form.thoiGianBay} onChange={e => handleFormChange('thoiGianBay', e.target.value)} required min="1" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#8dc63f] outline-none transition-all bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase text-blue-600">Giá vé cơ sở (VNĐ) *</label>
                                            <input type="number" value={form.basePrice} onChange={e => handleFormChange('basePrice', e.target.value)} required min="1000" step="1000" className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all bg-blue-50/30 font-bold" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Hạng vé & Giá</label>
                                            <button type="button" onClick={addHangVe} className="text-[#8dc63f] font-bold text-xs hover:underline">+ Thêm hạng vé</button>
                                        </div>
                                        <div className="space-y-4">
                                            {form.chiTietHangVe.map((hv, i) => (
                                                <div key={i} className="flex gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Loại vé</label>
                                                        <select value={hv.maHangVe} onChange={e => updateHangVe(i, 'maHangVe', e.target.value)} className="w-full border-b border-gray-200 py-1 outline-none text-xs">
                                                            {ticketClasses.map(tc => <option key={tc.maHangVe} value={tc.maHangVe}>{tc.tenHangVe} (x{tc.heSoGia})</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Số ghế</label>
                                                        <input type="number" value={hv.soLuongCho} onChange={e => updateHangVe(i, 'soLuongCho', e.target.value)} className="w-full border-b border-gray-200 py-1 outline-none text-xs" placeholder="100" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Giá tính toán</label>
                                                        <div className="py-1 text-xs font-bold text-gray-700 border-b border-transparent">
                                                            {(() => {
                                                                const tc = ticketClasses.find(t => t.maHangVe === parseInt(hv.maHangVe));
                                                                const calc = Math.round(parseFloat(form.basePrice || 0) * (tc?.heSoGia || 1));
                                                                return calc.toLocaleString('vi-VN') + ' VNĐ';
                                                            })()}
                                                        </div>
                                                    </div>
                                                    {form.chiTietHangVe.length > 1 && (
                                                        <button type="button" onClick={() => removeHangVe(i)} className="text-red-400 hover:text-red-600">✕</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Sân bay trung gian</label>
                                            <button type="button" onClick={addTrungGian} className="text-[#8dc63f] font-bold text-xs hover:underline">+ Thêm sân bay TG</button>
                                        </div>
                                        <div className="space-y-4">
                                            {form.sanBayTrungGian.map((tg, i) => (
                                                <div key={i} className="flex gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                    <div className="flex-[2]">
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Sân bay</label>
                                                        <select value={tg.maSanBayTG} onChange={e => updateTrungGian(i, 'maSanBayTG', e.target.value)} className="w-full border-b border-gray-200 py-1 outline-none text-xs">
                                                            <option value="">-- Chọn --</option>
                                                            {airports.map(a => <option key={a.maSanBay} value={a.maSanBay}>{a.maIATA} - {a.thanhPho}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Dừng (p)</label>
                                                        <input type="number" value={tg.thoiGianDung} onChange={e => updateTrungGian(i, 'thoiGianDung', e.target.value)} className="w-full border-b border-gray-200 py-1 outline-none text-xs" placeholder="30" />
                                                    </div>
                                                    <div className="flex-[3]">
                                                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Ghi chú</label>
                                                        <input type="text" value={tg.ghiChu} onChange={e => updateTrungGian(i, 'ghiChu', e.target.value)} className="w-full border-b border-gray-200 py-1 outline-none text-xs" placeholder="Tiếp nhiên liệu..." />
                                                    </div>
                                                    <button type="button" onClick={() => removeTrungGian(i)} className="text-red-400 hover:text-red-600">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 flex gap-4">
                                        <button type="submit" className="flex-1 bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold py-3 rounded-xl transition-all shadow-md active:scale-95">Lưu chuyến bay</button>
                                        <button type="button" onClick={() => setShowForm(false)} className="px-10 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all">Hủy</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
                            <div className="overflow-x-auto p-4">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Mã</th>
                                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Tuyến bay</th>
                                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Thời gian</th>
                                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Giá</th>
                                            <th className="px-4 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Trạng thái</th>
                                            <th className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {flights.map((f) => (
                                            <tr key={f.maChuyenBay} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-4 py-4">
                                                    <span className="font-bold text-blue-600">{f.maChuyenBay}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm font-bold text-gray-800">
                                                        {f.maSanBayDi?.thanhPho} → {f.maSanBayDen?.thanhPho}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-medium">{f.maSanBayDi?.maIATA} - {f.maSanBayDen?.maIATA}</div>
                                                </td>
                                                <td className="px-4 py-4 text-xs text-gray-600">
                                                    <div className="font-medium">{formatDT(f.ngayGioKhoiHanh)}</div>
                                                    <div className="opacity-60">{f.thoiGianBay} phút</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-bold text-orange-600">{formatMoney(f.giaCoBan)}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold border ${f.trangThai === 'Đã lên lịch' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                        {f.trangThai || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => openEdit(f)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                                                        <button onClick={() => handleDelete(f.maChuyenBay)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
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

            {/* Edit Modal */}
            {editFlight && editForm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditFlight(null)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative z-10 animate-slide-up">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Chỉnh sửa chuyến bay {editFlight.maChuyenBay}</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Hãng hàng không</label>
                                    <select value={editForm.maHangHK} onChange={e => setEditForm(p => ({ ...p, maHangHK: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold">
                                        <option value="">-- Chọn hãng --</option>
                                        {airlines.map(h => <option key={h.maHangHK} value={h.maHangHK}>{h.tenHang}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Máy bay</label>
                                    <select value={editForm.maMayBay} onChange={e => setEditForm(p => ({ ...p, maMayBay: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold">
                                        <option value="">-- Chọn máy bay --</option>
                                        {airplanes.filter(m => !editForm.maHangHK || m.maHangHK?.maHangHK === parseInt(editForm.maHangHK)).map(m => <option key={m.maMayBay} value={m.maMayBay}>{m.tenMayBay}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Sân bay đi</label>
                                    <select value={editForm.maSanBayDi} onChange={e => setEditForm(p => ({ ...p, maSanBayDi: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold">
                                        {airports.map(a => <option key={a.maSanBay} value={a.maSanBay}>{a.maIATA} - {a.thanhPho}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Sân bay đến</label>
                                    <select value={editForm.maSanBayDen} onChange={e => setEditForm(p => ({ ...p, maSanBayDen: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold">
                                        {airports.map(a => <option key={a.maSanBay} value={a.maSanBay}>{a.maIATA} - {a.thanhPho}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Khởi hành</label>
                                    <input type="datetime-local" value={editForm.ngayGioKhoiHanh} onChange={e => setEditForm(p => ({ ...p, ngayGioKhoiHanh: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Hạ cánh</label>
                                    <input type="datetime-local" value={editForm.ngayGioHaCanh} onChange={e => setEditForm(p => ({ ...p, ngayGioHaCanh: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Bay (p)</label>
                                    <input type="number" value={editForm.thoiGianBay} onChange={e => setEditForm(p => ({ ...p, thoiGianBay: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase text-blue-600">Giá cơ sở</label>
                                    <input type="number" value={editForm.basePrice} onChange={e => setEditForm(p => ({ ...p, basePrice: e.target.value }))} className="w-full border-b border-blue-200 py-1 outline-none text-xs font-bold bg-blue-50/30" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Trạng thái</label>
                                    <select value={editForm.trangThai} onChange={e => setEditForm(p => ({ ...p, trangThai: e.target.value }))} className="w-full border-b border-gray-200 py-1 outline-none text-xs font-bold">
                                        <option value="Đã lên lịch">Đã lên lịch</option>
                                        <option value="Đang bay">Đang bay</option>
                                        <option value="Đã hạ cánh">Đã hạ cánh</option>
                                        <option value="Bị hủy">Bị hủy</option>
                                        <option value="Bị hoãn">Bị hoãn</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Hạng vé & Ghế</label>
                                    <button type="button" onClick={() => setEditForm(p => ({ ...p, chiTietHangVe: [...p.chiTietHangVe, { maHangVe: 1, soLuongCho: '' }] }))} className="text-[#8dc63f] font-bold text-[10px]">+ Thêm</button>
                                </div>
                                <div className="space-y-2 max-h-[100px] overflow-y-auto pr-2">
                                    {editForm.chiTietHangVe?.map((hv, i) => (
                                        <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            <select value={hv.maHangVe} onChange={e => {
                                                const arr = [...editForm.chiTietHangVe];
                                                arr[i].maHangVe = e.target.value;
                                                setEditForm(p => ({ ...p, chiTietHangVe: arr }));
                                            }} className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold">
                                                {ticketClasses.map(tc => <option key={tc.maHangVe} value={tc.maHangVe}>{tc.tenHangVe}</option>)}
                                            </select>
                                            <input type="number" value={hv.soLuongCho} onChange={e => {
                                                const arr = [...editForm.chiTietHangVe];
                                                arr[i].soLuongCho = e.target.value;
                                                setEditForm(p => ({ ...p, chiTietHangVe: arr }));
                                            }} placeholder="Số ghế" className="w-12 bg-transparent border-none outline-none text-[10px]" />
                                            <button type="button" onClick={() => {
                                                const arr = editForm.chiTietHangVe.filter((_, idx) => idx !== i);
                                                setEditForm(p => ({ ...p, chiTietHangVe: arr }));
                                            }} className="text-red-400 text-[10px]">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Sân bay trung gian</label>
                                    <button type="button" onClick={() => setEditForm(p => ({ ...p, sanBayTrungGian: [...p.sanBayTrungGian, { maSanBayTG: '', thoiGianDung: '', ghiChu: '' }] }))} className="text-[#8dc63f] font-bold text-[10px]">+ Thêm</button>
                                </div>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                                    {editForm.sanBayTrungGian.map((tg, i) => (
                                        <div key={i} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100 shadow-sm">
                                            <select value={tg.maSanBayTG} onChange={e => {
                                                const arr = [...editForm.sanBayTrungGian];
                                                arr[i].maSanBayTG = e.target.value;
                                                setEditForm(p => ({ ...p, sanBayTrungGian: arr }));
                                            }} className="flex-1 bg-transparent border-none outline-none text-[10px]">
                                                <option value="">-- Sân bay --</option>
                                                {airports.map(a => <option key={a.maSanBay} value={a.maSanBay}>{a.maIATA}</option>)}
                                            </select>
                                            <input type="number" value={tg.thoiGianDung} onChange={e => {
                                                const arr = [...editForm.sanBayTrungGian];
                                                arr[i].thoiGianDung = e.target.value;
                                                setEditForm(p => ({ ...p, sanBayTrungGian: arr }));
                                            }} placeholder="Mins" className="w-10 bg-transparent border-none outline-none text-[10px]" />
                                            <button type="button" onClick={() => {
                                                const arr = editForm.sanBayTrungGian.filter((_, idx) => idx !== i);
                                                setEditForm(p => ({ ...p, sanBayTrungGian: arr }));
                                            }} className="text-red-400 text-[10px]">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" disabled={editLoading} className="flex-1 bg-[#f2c500] hover:bg-[#e0b600] text-black font-bold py-3 rounded-xl shadow-md disabled:opacity-50 transition-all active:scale-95">Lưu thay đổi</button>
                                <button type="button" onClick={() => setEditFlight(null)} className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-all">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Professional Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !isDeleting && setDeleteId(null)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-10 animate-slide-up text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                        <p className="text-gray-500 text-sm mb-8">Bạn có chắc chắn muốn xóa chuyến bay <span className="font-bold text-red-600">{deleteId}</span> không? Thao tác này không thể hoàn tác.</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang xóa...
                                    </>
                                ) : 'Xóa'}
                            </button>
                            <button 
                                onClick={() => setDeleteId(null)}
                                disabled={isDeleting}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-all"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};


export default AdminFlights;
