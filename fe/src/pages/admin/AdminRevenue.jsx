import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import AdminSidebar from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const formatMoney = (v) => {
    if (!v && v !== 0) return '0 VNĐ';
    return Number(v).toLocaleString('vi-VN') + ' VNĐ';
};
const formatMoneyShort = (v) => {
    const n = Number(v || 0);
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Tỷ';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' Tr';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
};

const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const MONTH_NAMES = ['','Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
    'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

const PIE_COLORS = ['#3b82f6','#06b6d4','#8b5cf6','#f59e0b','#10b981','#f43f5e','#64748b'];

/** SVG Pie Chart */
const PieChart = ({ data, size = 180 }) => {
    if (!data || data.length === 0) return <div className="text-slate-400 text-sm text-center py-8">Không có dữ liệu</div>;
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return <div className="text-slate-400 text-sm text-center py-8">Chưa có giao dịch</div>;

    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    let cumulativeAngle = -Math.PI / 2;
    const slices = data.map((d, i) => {
        const angle = (d.value / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(cumulativeAngle);
        const y1 = cy + r * Math.sin(cumulativeAngle);
        cumulativeAngle += angle;
        const x2 = cx + r * Math.cos(cumulativeAngle);
        const y2 = cy + r * Math.sin(cumulativeAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return { ...d, path, color: PIE_COLORS[i % PIE_COLORS.length], pct: ((d.value / total) * 100).toFixed(1) };
    });

    return (
        <div className="flex items-center gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((sl, i) => (
                    <path key={i} d={sl.path} fill={sl.color} stroke="white" strokeWidth="2">
                        <title>{sl.label}: {sl.pct}%</title>
                    </path>
                ))}
            </svg>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                {slices.map((sl, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: sl.color }} />
                        <span className="truncate text-slate-600">{sl.label}</span>
                        <span className="ml-auto font-bold text-slate-800 flex-shrink-0">{sl.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** SVG Line Chart */
const LineChart = ({ data, width = 500, height = 160 }) => {
    if (!data || data.length === 0) return null;
    const values = data.map(d => Number(d.value || 0));
    const maxVal = Math.max(...values, 1);
    const padL = 10, padR = 10, padT = 20, padB = 24;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    const points = values.map((v, i) => ({
        x: padL + (i / (values.length - 1)) * chartW,
        y: padT + chartH - (v / maxVal) * chartH
    }));

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    const area = `${points[0].x},${padT + chartH} ` + polyline + ` ${points[points.length-1].x},${padT + chartH}`;

    return (
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            {[0.25, 0.5, 0.75, 1].map(f => (
                <line key={f} x1={padL} x2={width - padR} y1={padT + chartH * (1 - f)} y2={padT + chartH * (1 - f)}
                    stroke="#f0f0f0" strokeWidth="1" />
            ))}
            <polygon points={area} fill="url(#lineGrad)" opacity="0.3" />
            <polyline points={polyline} fill="none" stroke="#f2c500" strokeWidth="2.5" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#f2c500" strokeWidth="2">
                    <title>{MONTH_LABELS[i]}: {formatMoney(values[i])}</title>
                </circle>
            ))}
            {points.map((p, i) => (
                <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">{MONTH_LABELS[i]}</text>
            ))}
            <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f2c500" />
                    <stop offset="100%" stopColor="#f2c500" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
};

const AdminRevenue = () => {
    const [user, setUser] = useState(null);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        const role = currentUser?.user?.role ?? currentUser?.role;
        if (!currentUser || role !== 'ADMIN') { navigate('/login'); return; }
        setUser(currentUser);
        fetchYears();
    }, []);

    useEffect(() => { if (selectedYear) fetchRevenue(selectedYear); }, [selectedYear]);

    const fetchYears = async () => {
        try { const d = await authService.getRevenueYears(); setYears(d); } catch {}
    };

    const fetchRevenue = async (year) => {
        setLoading(true);
        try { const d = await authService.getRevenue(year); setData(d); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };

    const barData = data?.theoThang?.map(m => ({ label: MONTH_LABELS[m.month - 1], value: Number(m.doanhThu || 0) })) || [];
    const lineData = data?.theoThang?.map(m => ({ value: Number(m.doanhThu || 0) })) || [];
    const maxBar = Math.max(...barData.map(d => d.value), 1);

    const pieDataPTTT = data?.theoHinhThucThanhToan
        ? Object.entries(data.theoHinhThucThanhToan).map(([k, v]) => ({ label: k, value: Number(v) }))
        : [];

    const pieDataStatus = data?.theoThang ? (() => {
        const success = data.theoThang.reduce((s, m) => s + m.soGiaoDichSuccess, 0);
        const pending = data.theoThang.reduce((s, m) => s + m.soGiaoDichPending, 0);
        return [
            { label: 'Thành công', value: success },
            { label: 'Chờ xử lý', value: pending }
        ].filter(d => d.value > 0);
    })() : [];

    const txData = data?.theoThang?.map(m => ({ label: MONTH_LABELS[m.month - 1], success: m.soGiaoDichSuccess, pending: m.soGiaoDichPending })) || [];
    const maxTx = Math.max(...txData.map(d => d.success + d.pending), 1);

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
                        <h2 className="text-[17px] font-bold text-[#333]">Báo cáo doanh thu</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500 uppercase">Năm:</span>
                            <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}
                                className="h-9 rounded-xl border border-gray-300 bg-white px-4 text-xs font-bold outline-none focus:border-[#8dc63f] transition-all">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="p-8 animate-slide-up">
                        {loading ? (
                            <div className="flex justify-center items-center py-32">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#f2c500]" />
                            </div>
                        ) : data ? (
                            <div className="space-y-10">
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        { label: 'Tổng doanh thu', value: formatMoney(data.tongDoanhThu), color: 'border-l-[#f2c500]' },
                                        { label: 'Tổng giao dịch', value: (data.tongGiaoDich || 0).toLocaleString('vi-VN'), color: 'border-l-blue-500' },
                                        { label: 'Thành công', value: (data.tongGiaoDichSuccess || 0).toLocaleString('vi-VN'), color: 'border-l-green-500' },
                                        { label: 'Tỷ lệ TT', value: data.tongGiaoDich ? ((data.tongGiaoDichSuccess / data.tongGiaoDich) * 100).toFixed(1) + '%' : '—', color: 'border-l-purple-500' },
                                    ].map((card, i) => (
                                        <div key={i} className={`bg-white border border-gray-100 border-l-4 ${card.color} p-5 rounded-2xl shadow-sm`}>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
                                            <p className="text-xl font-bold text-gray-800">{card.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Biểu đồ doanh thu</h3>
                                        <LineChart data={lineData} width={600} height={180} />
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-6">Phân bổ PTTT</h3>
                                        <PieChart data={pieDataPTTT} size={150} />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="text-left bg-gray-50/50">
                                                    {['Tháng','Doanh thu','Tổng GD','Thành công','Tỷ lệ'].map(h => (
                                                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {data.theoThang?.map((m) => {
                                                    const pct = m.soGiaoDich > 0 ? ((m.soGiaoDichSuccess / m.soGiaoDich) * 100).toFixed(0) : null;
                                                    return (
                                                        <tr key={m.month} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4 text-sm font-bold text-gray-700">{MONTH_NAMES[m.month]}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatMoney(m.doanhThu)}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{m.soGiaoDich}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-green-600">{m.soGiaoDichSuccess}</td>
                                                            <td className="px-6 py-4">
                                                                {pct != null ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-gray-500">{pct}%</span>
                                                                    </div>
                                                                ) : <span className="text-xs text-slate-300">—</span>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-24 text-gray-400">
                                <p className="text-base font-bold">Không có dữ liệu cho năm {selectedYear}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default AdminRevenue;
