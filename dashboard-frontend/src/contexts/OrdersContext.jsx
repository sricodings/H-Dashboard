import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API = '/api';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState('all');

    const fetchOrders = useCallback(async (filter = dateFilter) => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?dateFilter=${filter}` : '';
            const { data } = await axios.get(`${API}/orders${params}`);
            if (data.success) setOrders(data.data);
        } catch (e) {
            console.error('Failed to fetch orders', e);
        } finally {
            setLoading(false);
        }
    }, [dateFilter]);

    const createOrder = async (orderData) => {
        const { data } = await axios.post(`${API}/orders`, orderData);
        if (data.success) {
            setOrders(prev => [data.data, ...prev]);
        }
        return data;
    };

    const updateOrder = async (id, orderData) => {
        const { data } = await axios.put(`${API}/orders/${id}`, orderData);
        if (data.success) {
            setOrders(prev => prev.map(o => o.id === id ? data.data : o));
        }
        return data;
    };

    const deleteOrder = async (id) => {
        const { data } = await axios.delete(`${API}/orders/${id}`);
        if (data.success) {
            setOrders(prev => prev.filter(o => o.id !== id));
        }
        return data;
    };

    return (
        <OrdersContext.Provider value={{
            orders, loading, dateFilter, setDateFilter,
            fetchOrders, createOrder, updateOrder, deleteOrder
        }}>
            {children}
        </OrdersContext.Provider>
    );
}

export const useOrders = () => useContext(OrdersContext);
