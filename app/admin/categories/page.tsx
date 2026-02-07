'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Save,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Subcategory {
  name: string;
  items: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon?: string;
  subcategories: Subcategory[];
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function CategoriesPage() {
  const { hasPermission } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Make Up',
      slug: 'make-up',
      href: '/shop?category=Make Up',
      productCount: 156,
      status: 'active',
      createdAt: '2024-01-01',
      subcategories: [
        { name: 'Face', items: ['Foundation', 'Concealer', 'Blush', 'Primer', 'Powder', 'Contour'] },
        { name: 'Eyes', items: ['Eyeshadow', 'Eyeliner', 'Mascara', 'Kajal', 'Eyebrow', 'Eye Primer'] },
        { name: 'Lips', items: ['Lipstick', 'Lip Gloss', 'Lip Balm', 'Lip Liner', 'Lip Stain'] },
        { name: 'Nails', items: ['Nail Polish', 'Nail Art', 'Nail Care', 'Manicure'] }
      ],
    },
    {
      id: '2',
      name: 'Skin care',
      slug: 'skin-care',
      href: '/shop?category=Skin care',
      productCount: 203,
      status: 'active',
      createdAt: '2024-01-01',
      subcategories: [
        { name: 'Cleansers', items: ['Face Wash', 'Micellar Water', 'Cleansing Oil', 'Wipes'] },
        { name: 'Moisturizers', items: ['Day Cream', 'Night Cream', 'Serum', 'Face Oil'] },
        { name: 'Sunscreen', items: ['SPF 30+', 'SPF 50+', 'Mineral', 'Tinted'] },
        { name: 'Treatment', items: ['Anti-Aging', 'Acne Care', 'Brightening', 'Hydration'] }
      ],
    },
    {
      id: '3',
      name: 'Hair care',
      slug: 'hair-care',
      href: '/shop?category=Hair care',
      productCount: 98,
      status: 'active',
      createdAt: '2024-01-01',
      subcategories: [
        { name: 'Shampoo', items: ['Anti-Dandruff', 'Hair Fall', 'Color Protection', 'Volume'] },
        { name: 'Conditioner', items: ['Daily Use', 'Deep Conditioner', 'Leave-In', 'Color Safe'] },
        { name: 'Hair Treatments', items: ['Hair Oil', 'Hair Mask', 'Serum', 'Heat Protectant'] },
        { name: 'Styling', items: ['Gel', 'Mousse', 'Hair Spray', 'Cream', 'Wax'] }
      ],
    },
    {
      id: '4',
      name: 'Perfume',
      slug: 'perfume',
      href: '/shop?category=Perfume',
      productCount: 134,
      status: 'active',
      createdAt: '2024-01-01',
      subcategories: [
        { name: 'Women', items: ['Floral', 'Fresh', 'Oriental', 'Woody'] },
        { name: 'Men', items: ['Citrus', 'Woody', 'Spicy', 'Aquatic'] },
        { name: 'Unisex', items: ['Fresh', 'Woody', 'Citrus', 'Musk'] },
        { name: 'Attar', items: ['Traditional', 'Arabian', 'Luxury', 'Premium'] }
      ],
    },
    {
      id: '5',
      name: 'SPA',
      slug: 'spa',
      href: '/shop?category=SPA',
      productCount: 67,
      status: 'active',
      createdAt: '2024-01-01',
      subcategories: [
        { name: 'Body Treatments', items: ['Body Scrub', 'Body Butter', 'Massage Oil', 'Body Wrap'] },
        { name: 'Facial Kits', items: ['Facial Masks', 'Peel Off Masks', 'Sheet Masks', 'Cream Masks'] },
        { name: 'Aromatherapy', items: ['Essential Oils', 'Diffusers', 'Candles', 'Bath Salts'] },
        { name: 'Relaxation', items: ['Bath Bombs', 'Shower Gels', 'Pampering Kits'] }
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage categories.</p>
      </div>
    );
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const getStatusColor = (status: Category['status']) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <Folder className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
              </p>
            </div>
            <FolderOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => cat.status === 'active').length}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subcategories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
              </p>
            </div>
            <Folder className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
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
              {filteredCategories.map((category) => {
                const isExpanded = expandedCategories.includes(category.id);
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleExpanded(category.id)}
                          className="mr-2 p-1 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-500">Created: {new Date(category.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{category.subcategories.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{category.productCount}</td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(category.status)
                      )}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCategory(category.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-800"
                          title="View Products"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Expanded Subcategories View */}
      {expandedCategories.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subcategories & Items</h3>
          {filteredCategories
            .filter(cat => expandedCategories.includes(cat.id))
            .map(category => (
              <div key={category.id} className="mb-6 last:mb-0">
                <h4 className="font-medium text-gray-900 mb-3">{category.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.subcategories.map((subcat, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">{subcat.name}</h5>
                      <ul className="space-y-1">
                        {subcat.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
