'use client';

import { useState, useEffect } from 'react';

interface MetadataEditorProps {
  metadata: Record<string, any>;
  onSave: (updatedMetadata: Record<string, string>, downloadAfter: boolean) => void;
  onCancel: () => void;
}

function formatDisplayValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value._ctor === 'ExifDateTime' && value.rawValue) {
      try {
        return new Date(value.rawValue).toLocaleString();
      } catch (e) { /* fallback */
        console.error('Error formatting ExifDateTime:', e);
       }
    }
    if (value instanceof Date) return value.toLocaleString();
    if (value.year && value.month && value.day) { 
      try {
        return new Date(value.year, value.month -1, value.day, value.hour || 0, value.minute || 0, value.second || 0).toLocaleString();
      } catch(e) { /* fallback */
        console.error('Error formatting date-like object:', e);
      }
    }
    if (Array.isArray(value)) return value.map(formatDisplayValue).join(', ');
    return JSON.stringify(value);
  }
  return String(value);
}


export function MetadataEditor({ metadata, onSave, onCancel }: MetadataEditorProps) {
  const [editedMetadata, setEditedMetadata] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    const initialEditableMetadata = Object.entries(metadata)
      .filter(([key]) => !key.startsWith('_') && key !== 'SourceFile' && key !== 'errors' && key !== 'warnings') // Filter out internal/read-only keys
      .reduce((acc, [key, value]) => {
        acc[key] = formatDisplayValue(value);
        return acc;
      }, {} as Record<string, string>);
    setEditedMetadata(initialEditableMetadata);
  }, [metadata]);

  const handleInputChange = (key: string, value: string) => {
    setEditedMetadata(prev => ({ ...prev, [key]: value }));
  };

  const handleAddMetadata = () => {
    if (newKey.trim() && newValue.trim()) {
      if (!editedMetadata.hasOwnProperty(newKey.trim())) {
        setEditedMetadata(prev => ({ ...prev, [newKey.trim()]: newValue.trim() }));
      }
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveMetadata = (keyToRemove: string) => {
    setEditedMetadata(prev => {
      const { [keyToRemove]: _, ...rest } = prev;
      console.info(_)
      return rest;
    });
  };


  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Metadata Field</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Property Name (e.g., Author)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Property Value (e.g., John Doe)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
          <button
            onClick={handleAddMetadata}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 font-medium"
          >
            Add Field
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(editedMetadata).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{key}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemoveMetadata(key)}
                    className="text-red-500 hover:text-red-700 transition-colors font-semibold"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {Object.keys(editedMetadata).length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-lg">
                  No editable metadata fields. You can add new fields above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedMetadata, false)} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-medium"
        >
          Save Changes
        </button>
        <button
          onClick={() => onSave(editedMetadata, true)} 
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-medium"
        >
          Save & Download
        </button>
      </div>
    </div>
  );
} 