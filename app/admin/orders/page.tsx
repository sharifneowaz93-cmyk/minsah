'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Mail,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  tracking?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  dateRange: string;
  sortBy: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const paymentStatusOptions = [
  { value: '', label: 'All Payment Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const sortOptions = [
  { value: 'created', label: 'Date Created' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'total_high', label: 'Total: High to Low' },
  { value: 'total_low', label: 'Total: Low to High' },
  { value: 'customer', label: 'Customer Name' },
];

export default function OrdersPage() {
  const { hasPermission } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 234-567-8901',
      },
      items: [
        {
          id: '1',
          name: 'Luxury Foundation Pro',
          quantity: 2,
          price: 45.99,
          image: '/products/foundation.jpg',
        },
        {
          id: '2',
          name: 'Organic Face Serum',
          quantity: 1,
          price: 89.99,
          image: '/products/serum.jpg',
        },
      ],
      total: 181.97,
      status: 'completed',
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      shipping: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      },
      tracking: 'TRK123456789',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
    },
    {
      id: 'ORD-2024-002',
      customer: {
        name: 'Emma Davis',
        email: 'emma.d@email.com',
        phone: '+1 234-567-8902',
      },
      items: [
        {
          id: '3',
          name: 'Professional Nail Kit',
          quantity: 1,
          price: 34.99,
          image: '/products/nail-kit.jpg',
        },
        {
          id: '4',
          name: 'Premium Perfume Set',
          quantity: 1,
          price: 156.99,
          image: '/products/perfume.jpg',
        },
      ],
      total: 191.98,
      status: 'processing',
      paymentMethod: 'paypal',
      paymentStatus: 'paid',
      shipping: {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'United States',
      },
      createdAt: '2024-01-15T14:15:00Z',
      updatedAt: '2024-01-15T16:45:00Z',
      notes: 'Customer requested gift wrapping',
    },
    {
      id: 'ORD-2024-003',
      customer: {
        name: 'Ol Wilson',
        email: 'ol.w@email.com',
        phone: '+1 234-567-8903',
      },
      items: [
        {
          id: '5',
          name: 'Hair Care Bundle',
          quantity: 2,
          price: 67.99,
          image: '/products/hair-care.jpg',
        },
      ],
      total: 135.98,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      shipping: {
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'United States',
      },
      createdAt: '2024-01-14T09:20:00Z',
      updatedAt: '2024-01-14T09:20:00Z',
    },
  ]);

  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    paymentStatus: '',
    dateRange: '',
    sortBy: 'created',
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: string;
  }>({
    isOpen: false,
    orderId: '',
    currentStatus: '',
  });

  if (!hasPermission(PERMISSIONS.ORDERS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view orders.</p>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'total_high':
        return b.total - a.total;
      case 'total_low':
        return a.total - b.total;
      case 'customer':
        return a.customer.name.localeCompare(b.customer.name);
      case 'created':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            tracking: newStatus === 'shipped' ? `TRK${Date.now()}` : order.tracking
          }
        : order
    ));
    setStatusUpdateModal({ isOpen: false, orderId: '', currentStatus: '' });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <FileText className="w-5 h-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {showFilters && <Layers className="w-4 h-4 ml-2 text-purple-600" />}
          </button>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {paymentStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                    <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-xs text-gray-500">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{order.items.length} items</div>
                    {order.notes && (
                      <div className="text-xs text-blue-600 italic">Has notes</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(convertUSDtoBDT(order.total))}</div>
                    <div className="text-xs text-gray-500 capitalize">{order.paymentMethod.replace('_', ' ')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(order.status)
                    )}>
                      {order.status}
                    </span>
                    {order.tracking && (
                      <div className="text-xs text-gray-500 mt-1">
                        Tracking: {order.tracking}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getPaymentStatusColor(order.paymentStatus)
                    )}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    <div className="text-xs text-gray-500">Updated: {formatDate(order.updatedAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setStatusUpdateModal({
                            isOpen: true,
                            orderId: order.id,
                            currentStatus: order.status,
                          });
                        }}
                        className="text-purple-600 hover:text-purple-800"
                        title="Update Status"
                        disabled={!hasPermission(PERMISSIONS.ORDERS_PROCESS)}
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="Email Customer">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Order ID: {statusUpdateModal.orderId}
            </p>
            <div className="space-y-3">
              {statusOptions.slice(1).map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusUpdate(statusUpdateModal.orderId, option.value as Order['status'])}
                  className={clsx(
                    'w-full text-left px-4 py-3 rounded-lg border transition-colors duration-200',
                    statusUpdateModal.currentStatus === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStatusUpdateModal({ isOpen: false, orderId: '', currentStatus: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
