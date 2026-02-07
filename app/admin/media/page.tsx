'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import { Upload, Image, Folder, Trash2 } from 'lucide-react';

export default function MediaLibraryPage() {
  const { hasPermission } = useAdminAuth();

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">No permission</p></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-gray-600">Manage images and files</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Upload className="w-5 h-5 mr-2" />
          Upload Files
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Total Files</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Images</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600">Storage Used</p>
          <p className="text-2xl font-bold">0 MB</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center">
        <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files Uploaded</h3>
        <p className="text-gray-600 mb-6">Upload your first files to get started</p>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Upload Files
        </button>
      </div>
    </div>
  );
}
