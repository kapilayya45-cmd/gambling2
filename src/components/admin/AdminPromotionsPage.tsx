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
      {/* Form Section */}
      <div className="bg-[#1a1f2c] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Promotion' : 'Add New Promotion'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-md text-red-400">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded-md text-green-400">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Promotion Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Welcome Bonus"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Promotion Code*
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. WELCOME100"
                  required
                  className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={generatePromoCode}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Promotion Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="deposit_bonus">Deposit Bonus</option>
                <option value="free_bet">Free Bet</option>
                <option value="odds_boost">Odds Boost</option>
                <option value="cashback">Cashback</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {formData.type === 'deposit_bonus' ? 'Bonus Percentage (%)' : 
                 formData.type === 'odds_boost' ? 'Odds Boost (%)' : 
                 formData.type === 'cashback' ? 'Cashback Percentage (%)' : 
                 'Bonus Amount ($)'}
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                step="1"
                min="0"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            {(formData.type === 'deposit_bonus' || formData.type === 'cashback') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Minimum Deposit/Bet Requirement ($)
                  </label>
                  <input
                    type="number"
                    name="minRequirement"
                    value={formData.minRequirement}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Maximum Bonus Amount ($)
                  </label>
                  <input
                    type="number"
                    name="maxBonus"
                    value={formData.maxBonus}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                    className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Usage Limit (per user)
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                step="1"
                min="0"
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 bg-[#242a38] border border-[#363e52] rounded-sm text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-200">
                Active
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Brief description of the promotion"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Terms and Conditions
            </label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Terms and conditions for this promotion"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-[#363e52] text-white rounded hover:bg-[#404a62] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
            >
              {isSaving && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isEditing ? 'Update Promotion' : 'Add Promotion'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Promotions List */}
      <div className="bg-[#1a1f2c] rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-[#363e52]">
          <h2 className="text-xl font-semibold">Active Promotions</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage all promotional offers
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No promotions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-gray-400 uppercase bg-[#242a38]">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Code</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-center">Value</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-left">Validity</th>
                  <th className="px-6 py-3 text-center">Usage</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363e52]">
                {promotions.map((promo) => (
                  <tr 
                    key={promo.id} 
                    className="hover:bg-[#242a38] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{promo.name}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {promo.code}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {promo.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {promo.type === 'free_bet' ? 
                        `$${promo.value}` : 
                        `${promo.value}%`
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        promo.isActive ? 'bg-green-900 bg-opacity-30 text-green-400' : 'bg-red-900 bg-opacity-30 text-red-400'
                      }`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {promo.usageCount} / {promo.usageLimit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditPromotion(promo)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => promo.id && handleDeletePromotion(promo.id)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
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