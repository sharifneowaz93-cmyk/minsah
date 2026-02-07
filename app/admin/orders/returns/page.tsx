'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  MessageCircle,
  Calendar,
  TrendingUp,
  Package,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  refundAmount: number;
  requestDate: string;
  images?: string[];
  notes?: string;
}

export default function ReturnsPage() {
  const { hasPermission } = useAdminAuth();
  const [returns, setReturns] = useState<ReturnRequest[]>([
    {
      id: 'RET-001',
      orderId: 'ORD-2024-001',
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
      },
      items: [
        { name: 'Luxury Foundation Pro', quantity: 1, price: 45.99 },
      ],
      reason: 'Product damaged during shipping',
      status: 'pending',
      refundAmount: 45.99,
      requestDate: '2024-01-20',
    },
    {
      id: 'RET-002',
      orderId: 'ORD-2024-002',
      customer: {
        name: 'Emma Davis',
        email: 'emma.d@email.com',
      },
      items: [
        { name: 'Organic Face Serum', quantity: 1, price: 89.99 },
      ],
      reason: 'Wrong product received',
      status: 'approved',
      refundAmount: 89.99,
      requestDate: '2024-01-18',
      notes: 'Customer service approved - send replacement',
    },
    {
      id: 'RET-003',
      orderId: 'ORD-2024-003',
      customer: {
        name: 'Michael Chen',
        email: 'michael.c@email.com',
      },
      items: [
        { name: 'Premium Perfume Set', quantity: 1, price: 156.99 },
      ],
      reason: 'Changed mind',
      status: 'rejected',
      refundAmount: 0,
      requestDate: '2024-01-15',
      notes: 'Outside return window',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!hasPermission(PERMISSIONS.ORDERS_REFUND)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage returns.</p>
      </div>
    );
  }

  const filteredReturns = returns.filter(ret => {
    const matchesSearch =
      ret.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ReturnRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (returnId: string) => {
    setReturns(returns.map(ret =>
      ret.id === returnId
        ? { ...ret, status: 'approved' as const }
        : ret
    ));
  };

  const handleReject = (returnId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      setReturns(returns.map(ret =>
        ret.id === returnId
          ? { ...ret, status: 'rejected' as const, notes: reason }
          : ret
      ));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="text-gray-600">Manage customer return requests and refunds</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{returns.length}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {returns.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {returns.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refund Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(convertUSDtoBDT(returns.reduce((sum, r) => sum + r.refundAmount, 0)))}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by return ID, order ID, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return ID
                </th>
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
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.map((returnRequest) => (
                <tr key={returnRequest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{returnRequest.id}</div>
                    <div className="text-xs text-gray-500">{new Date(returnRequest.requestDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{returnRequest.orderId}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{returnRequest.customer.name}</div>
                    <div className="text-xs text-gray-500">{returnRequest.customer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{returnRequest.items.length} item(s)</div>
                    {returnRequest.items.map((item, idx) => (
                      <div key={idx} className="text-xs text-gray-500">{item.name}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{returnRequest.reason}</div>
                    {returnRequest.notes && (
                      <div className="text-xs text-blue-600 italic mt-1">{returnRequest.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatPrice(convertUSDtoBDT(returnRequest.refundAmount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(returnRequest.status)
                    )}>
                      {returnRequest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-600 hover:text-purple-800" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {returnRequest.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(returnRequest.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(returnRequest.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="text-blue-600 hover:text-blue-800" title="Message Customer">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No return requests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
