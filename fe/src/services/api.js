import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';
const STORAGE_KEY = 'user';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const normalizeAuthResponse = (payload) => {
    const token = payload?.token ?? payload?.accessToken ?? payload?.access_token ?? null;
    let user = payload?.user ?? null;
    const role = user?.role ?? payload?.role ?? null;
    const maNguoiDung = payload?.maNguoiDung ?? user?.maNguoiDung ?? user?.id ?? null;

    if (!user && maNguoiDung) {
        user = { maNguoiDung, role };
    } else if (user && maNguoiDung && !user.maNguoiDung) {
        user.maNguoiDung = maNguoiDung;
    }

    return {
        ...payload,
        token,
        user,
        role,
        maNguoiDung,
    };
};

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        const normalizedData = normalizeAuthResponse(response.data);
        if (normalizedData.token) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedData));
        }
        return normalizedData;
    },

    register: async (name, email, password, role = 'CLIENT') => {
        const response = await api.post('/api/auth/register', { name, email, password, role });
        return response.data;
    },

    verifyEmail: async (code) => {
        const response = await api.get(`/api/auth/verify?code=${code}`);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    },

    getUserProfile: async (userId) => {
        const user = authService.getCurrentUser();
        const response = await api.get(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    updateUserProfile: async (userId, userData) => {
        const user = authService.getCurrentUser();
        const response = await api.put(`/api/users/${userId}`, userData, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    changePassword: async (userId, passwordData) => {
        const user = authService.getCurrentUser();
        const response = await api.put(`/api/users/${userId}/change-password`, passwordData, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    getAllUsers: async () => {
        const user = authService.getCurrentUser();
        const response = await api.get(`/api/users`, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    createUserAdmin: async (userData) => {
        const user = authService.getCurrentUser();
        const response = await api.post(`/api/users`, userData, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    updateUserAdmin: async (userId, userData) => {
        const user = authService.getCurrentUser();
        const response = await api.put(`/api/users/admin/${userId}`, userData, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    deleteUserAdmin: async (userId) => {
        const user = authService.getCurrentUser();
        const response = await api.delete(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },

    getUserBookings: async (userId) => {
        const user = authService.getCurrentUser();
        const response = await api.get(`/api/bookings/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${user?.token}`
            }
        });
        return response.data;
    },




    // Flight Services
    getAllFlights: async () => {
        const response = await api.get('/api/flights');
        return response.data;
    },

    searchFlights: async (origin, destination, date, airlineId) => {
        const response = await api.get('/api/flights/search', {
            params: { origin, destination, date, airlineId }
        });
        return response.data;
    },

    getBookedSeats: async (id) => {
        const response = await api.get(`/api/flights/${id}/booked-seats`);
        return response.data;
    },

    createFlight: async (flightData) => {
        const user = authService.getCurrentUser();
        const response = await api.post('/api/flights', flightData, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return response.data;
    },

    updateFlight: async (id, flightData) => {
        const user = authService.getCurrentUser();
        const response = await api.put(`/api/flights/${id}`, flightData, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return response.data;
    },

    deleteFlight: async (id) => {
        const user = authService.getCurrentUser();
        const response = await api.delete(`/api/flights/${id}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return response.data;
    },

    // Promotion Services
    getPromotions: async () => {
        const response = await api.get('/api/promotions');
        return response.data;
    },

    getActivePromotions: async () => {
        const response = await api.get('/api/promotions/active');
        return response.data;
    },

    // Regulation (Quy Dinh) Services
    getQuyDinh: async () => {
        const response = await api.get('/api/quy-dinh');
        return response.data;
    },

    updateQuyDinh: async (quyDinhData) => {
        const user = authService.getCurrentUser();
        const response = await api.put('/api/quy-dinh', quyDinhData, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        return response.data;
    },

    // Admin: Tạo chuyến bay mới (có validate QuyDinh)
    createFlightAdmin: async (flightData) => {
        const user = authService.getCurrentUser();
        const response = await api.post('/api/flights/create', flightData, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        return response.data;
    },

    // Admin: Cập nhật chuyến bay (có validate QuyDinh)
    updateFlightAdmin: async (id, flightData) => {
        const user = authService.getCurrentUser();
        const response = await api.put(`/api/flights/${id}/update`, flightData, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        return response.data;
    },

    // Master data APIs
    getAllAirports: async () => {
        const response = await api.get('/api/airports');
        return response.data;
    },
    getAllAirlines: async () => {
        const response = await api.get('/api/airlines');
        return response.data;
    },
    getAllAirplanes: async () => {
        const response = await api.get('/api/airplanes');
        return response.data;
    },
    getAllHangVe: async () => {
        const response = await api.get('/api/hangve');
        return response.data;
    },
    addHangVe: async (data) => {
        const response = await api.post('/api/hangve', data);
        return response.data;
    },
    updateHangVe: async (id, data) => {
        const response = await api.put(`/api/hangve/${id}`, data);
        return response.data;
    },
    deleteHangVe: async (id) => {
        const response = await api.delete(`/api/hangve/${id}`);
        return response.data;
    },

    addAirport: async (airportData) => {
        const response = await api.post('/api/airports', airportData);
        return response.data;
    },

    updateAirport: async (id, airportData) => {
        const response = await api.put(`/api/airports/${id}`, airportData);
        return response.data;
    },

    deleteAirport: async (id) => {
        const response = await api.delete(`/api/airports/${id}`);
        return response.data;
    },

    // Revenue / Report Services
    getRevenue: async (year) => {
        const response = await api.get(`/api/revenue?year=${year}`);
        return response.data;
    },

    getRevenueYears: async () => {
        const response = await api.get('/api/revenue/years');
        return response.data;
    },

    // Check-in Services
    getBookingByPNR: async (pnr) => {
        const response = await api.get(`/api/bookings/pnr/${pnr}`);
        return response.data;
    },

    updateCheckinStatus: async (bookingId, status) => {
        const response = await api.put(`/api/bookings/${bookingId}/checkin`, { status });
        return response.data;
    },

    createVnpayPayment: async (amount, bookingId) => {
        const response = await api.post('/api/payment/vnpay', { amount, bookingId });
        return response.data;
    }
};

export default api;
