'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  PackageX,
  Plus,
  Minus,
  Edit,
  BarChart,
  Download,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  lastRestocked: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  movement: 'up' | 'down' | 'stable';
}

export default function InventoryPage() {
  const { hasPermission } = useAdminAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      productName: 'Luxury Foundation Pro',
      sku: 'MKP-FND-001',
      category: 'Make Up',
      currentStock: 125,
      reorderLevel: 20,
      maxStock: 200,
      unitPrice: 45.99,
      totalValue: 5748.75,
      lastRestocked: '2024-01-15',
      supplier: 'Beauty Supplies Co.',
      status: 'in_stock',
      movement: 'down',
    },
    {
      id: '2',
      productName: 'Organic Face Serum',
      sku: 'SKC-SRM-001',
      category: 'Skin care',
      currentStock: 15,
      reorderLevel: 20,
      maxStock: 150,
      unitPrice: 89.99,
      totalValue: 1349.85,
      lastRestocked: '2024-01-10',
      supplier: 'Organic Beauty Ltd.',
      status: 'low_stock',
      movement: 'down',
    },
    {
      id: '3',
      productName: 'Professional Nail Kit',
      sku: 'NAL-KIT-001',
      category: 'Nails',
      currentStock: 0,
      reorderLevel: 15,
      maxStock: 100,
      unitPrice: 34.99,
      totalValue: 0,
      lastRestocked: '2024-01-05',
      supplier: 'Nail Pro Suppliers',
      status: 'out_of_stock',
      movement: 'down',
    },
    {
      id: '4',
      productName: 'Premium Perfume Set',
      sku: 'PRF-SET-001',
      category: 'Perfume',
      currentStock: 230,
      reorderLevel: 30,
      maxStock: 150,
      unitPrice: 156.99,
      totalValue: 36107.70,
      lastRestocked: '2024-01-20',
      supplier: 'Fragrance World',
      status: 'overstocked',
      movement: 'up',
    },
    {
      id: '5',
      productName: 'Hair Care Bundle',
      sku: 'HRC-BND-001',
      category: 'Hair care',
      currentStock: 67,
      reorderLevel: 25,
      maxStock: 120,
      unitPrice: 67.99,
      totalValue: 4555.33,
      lastRestocked: '2024-01-18',
      supplier: 'Hair Care Supplies',
      status: 'in_stock',
      movement: 'stable',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('stock');

  if (!hasPermission(PERMISSIONS.PRODUCTS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view inventory.</p>
      </div>
    );
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'stock':
        return b.currentStock - a.currentStock;
      case 'value':
        return b.totalValue - a.totalValue;
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'lowStock':
        return a.currentStock - a.reorderLevel - (b.currentStock - b.reorderLevel);
      default:
        return 0;
    }
  });

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out_of_stock').length;

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementIcon = (movement: InventoryItem['movement']) => {
    switch (movement) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maxStock) * 100;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Monitor and manage product stock levels</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <RefreshCw className="w-5 h-5 mr-2" />
            Update Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(convertUSDtoBDT(totalValue))}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{inventory.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{outOfStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <PackageX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or supplier..."
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
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Make Up">Make Up</option>
            <option value="Skin care">Skin care</option>
            <option value="Hair care">Hair care</option>
            <option value="Perfume">Perfume</option>
            <option value="Nails">Nails</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="stock">Stock Level</option>
            <option value="value">Total Value</option>
            <option value="name">Name</option>
            <option value="lowStock">Low Stock Priority</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
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
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-xs text-gray-500">Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getMovementIcon(item.movement)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{item.currentStock} / {item.maxStock}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={clsx(
                              'h-2 rounded-full',
                              item.status === 'out_of_stock' ? 'bg-red-500' :
                              item.status === 'low_stock' ? 'bg-yellow-500' :
                              item.status === 'overstocked' ? 'bg-blue-500' :
                              'bg-green-500'
                            )}
                            style={{ width: `${Math.min(getStockPercentage(item), 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Reorder at: {item.reorderLevel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(convertUSDtoBDT(item.unitPrice))}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(convertUSDtoBDT(item.totalValue))}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(item.status)
                    )}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-green-600 hover:text-green-800"
                        title="Add Stock"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        title="Remove Stock"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No inventory items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
