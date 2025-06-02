'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Promotion {
  id?: string;
  name: string;
  code: string;
  type: 'deposit_bonus' | 'free_bet' | 'odds_boost' | 'cashback';
  value: number;
  minRequirement?: number;
  maxBonus?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  description: string;
  termsAndConditions: string;
}

const DEFAULT_PROMOTION: Promotion = {
  name: '',
  code: '',
  type: 'deposit_bonus',
  value: 100,
  minRequirement: 10,
  maxBonus: 100,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
  usageLimit: 1000,
  usageCount: 0,
  description: '',
  termsAndConditions: ''
};

const AdminPromotionsPage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [formData, setFormData] = useState<Promotion>(DEFAULT_PROMOTION);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPromotions = async () => {
    if (!isAdmin || !db) return;
    
    setIsLoading(true);
    try {
      const promotionsQuery = query(
        collection(db, 'promotions'),
        orderBy('createdAt', 'desc')
      );
      
      const promotionsSnapshot = await getDocs(promotionsQuery);
      const promotionsList: Promotion[] = [];
      
      promotionsSnapshot.forEach(doc => {
        const data = doc.data();
        promotionsList.push({
          id: doc.id,
          name: data.name || '',
          code: data.code || '',
          type: data.type || 'deposit_bonus',
          value: data.value || 0,
          minRequirement: data.minRequirement || 0,
          maxBonus: data.maxBonus || 0,
          startDate: data.startDate ? new Date(data.startDate.toDate()).toISOString().slice(0, 10) : '',
          endDate: data.endDate ? new Date(data.endDate.toDate()).toISOString().slice(0, 10) : '',
          isActive: data.isActive ?? true,
          usageLimit: data.usageLimit || 0,
          usageCount: data.usageCount || 0,
          description: data.description || '',
          termsAndConditions: data.termsAndConditions || ''
        });
      });
      
      setPromotions(promotionsList);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setError('Failed to fetch promotions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if ((e.target as HTMLInputElement).type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_PROMOTION);
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const generatePromoCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleEditPromotion = (promo: Promotion) => {
    setFormData(promo);
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePromotion = async (promoId: string) => {
    if (!db || !isAdmin || !promoId) return;
    
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deleteDoc(doc(db, 'promotions', promoId));
        setSuccessMessage('Promotion deleted successfully');
        fetchPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
        setError('Failed to delete promotion');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!db || !isAdmin) return;
    
    // Validation
    if (!formData.name || !formData.code || !formData.startDate || !formData.endDate) {
      setError('Please fill all required fields');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const promoData: any = {
        name: formData.name,
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: formData.value,
        minRequirement: formData.minRequirement || 0,
        maxBonus: formData.maxBonus || 0,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        isActive: formData.isActive,
        usageLimit: formData.usageLimit,
        usageCount: formData.usageCount || 0,
        description: formData.description,
        termsAndConditions: formData.termsAndConditions,
        updatedAt: Timestamp.now()
      };
      
      if (isEditing && formData.id) {
        // Update existing promotion
        const promoRef = doc(db, 'promotions', formData.id);
        await updateDoc(promoRef, promoData);
        setSuccessMessage('Promotion updated successfully');
      } else {
        // Add new promotion
        promoData.createdAt = Timestamp.now();
        promoData.usageCount = 0;
        await addDoc(collection(db, 'promotions'), promoData);
        setSuccessMessage('Promotion added successfully');
      }
      
      // Reset form and refresh promotions list
      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error("Error saving promotion:", error);
      setError('Failed to save promotion');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Promotion Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isEditing ? 'Edit Promotion' : 'Add New Promotion'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={generatePromoCode}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Promotion Type and Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="deposit_bonus">Deposit Bonus</option>
                <option value="free_bet">Free Bet</option>
                <option value="odds_boost">Odds Boost</option>
                <option value="cashback">Cashback</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value (%)</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                min="0"
                max="1000"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Requirements and Limits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Requirement ($)</label>
              <input
                type="number"
                name="minRequirement"
                value={formData.minRequirement}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Bonus ($)</label>
              <input
                type="number"
                name="maxBonus"
                value={formData.maxBonus}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Usage Limits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer mt-6">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Description and Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms and Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Promotion'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Promotions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Existing Promotions</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all promotional offers</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No promotions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{promo.name}</div>
                      <div className="text-xs text-gray-600">{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">{promo.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">{promo.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{promo.value}%</div>
                      {promo.maxBonus > 0 && (
                        <div className="text-xs text-gray-600">Max ${promo.maxBonus}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        promo.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {promo.usageCount} / {promo.usageLimit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditPromotion(promo)}
                        className="text-purple-600 hover:text-purple-900 mx-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePromotion(promo.id!)}
                        className="text-red-600 hover:text-red-900 mx-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotionsPage;