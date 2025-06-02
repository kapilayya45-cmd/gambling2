'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface SiteSettings {
  minStake: number;
  maxStake: number;
  defaultOddsFormat: 'decimal' | 'american' | 'fractional';
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  allowDeposits: boolean;
  allowWithdrawals: boolean;
  depositFeePercentage: number;
  withdrawalFeePercentage: number;
  maxWithdrawalAmount: number;
  disabledFeatures: string[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  minStake: 1,
  maxStake: 1000,
  defaultOddsFormat: 'decimal',
  maintenanceMode: false,
  allowRegistrations: true,
  allowDeposits: true,
  allowWithdrawals: true,
  depositFeePercentage: 0,
  withdrawalFeePercentage: 0,
  maxWithdrawalAmount: 5000,
  disabledFeatures: []
};

const AdminSettingsPage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSettings = async () => {
    if (!isAdmin || !db) return;
    
    setIsLoading(true);
    try {
      const settingsRef = doc(db, 'settings', 'siteSettings');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setSettings({
          ...DEFAULT_SETTINGS, // Fallback values
          ...settingsDoc.data() as SiteSettings
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setSettings(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setSettings(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setSettings(prev => {
      const disabledFeatures = [...prev.disabledFeatures];
      
      if (enabled) {
        // Remove from disabled list
        const index = disabledFeatures.indexOf(feature);
        if (index > -1) {
          disabledFeatures.splice(index, 1);
        }
      } else {
        // Add to disabled list
        if (!disabledFeatures.includes(feature)) {
          disabledFeatures.push(feature);
        }
      }
      
      return {
        ...prev,
        disabledFeatures
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!db || !isAdmin) return;
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const settingsRef = doc(db, 'settings', 'siteSettings');
      await setDoc(settingsRef, settings, { merge: true });
      setSuccessMessage('Settings saved successfully');
    } catch (error) {
      console.error("Error saving settings:", error);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Site Settings</h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Betting Parameters</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stake
              </label>
              <input
                type="number"
                name="minStake"
                value={settings.minStake}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Stake
              </label>
              <input
                type="number"
                name="maxStake"
                value={settings.maxStake}
                onChange={handleInputChange}
                step="1"
                min="1"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Odds Format
              </label>
              <select
                name="defaultOddsFormat"
                value={settings.defaultOddsFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="decimal">Decimal (1.50)</option>
                <option value="american">American (+150)</option>
                <option value="fractional">Fractional (1/2)</option>
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Financial Settings</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deposit Fee (%)
              </label>
              <input
                type="number"
                name="depositFeePercentage"
                value={settings.depositFeePercentage}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Withdrawal Fee (%)
              </label>
              <input
                type="number"
                name="withdrawalFeePercentage"
                value={settings.withdrawalFeePercentage}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Withdrawal Amount
              </label>
              <input
                type="number"
                name="maxWithdrawalAmount"
                value={settings.maxWithdrawalAmount}
                onChange={handleInputChange}
                step="1"
                min="0"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">System Controls</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Maintenance Mode</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowRegistrations"
                  checked={settings.allowRegistrations}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Allow Registrations</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowDeposits"
                  checked={settings.allowDeposits}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Allow Deposits</span>
              </label>
            </div>
            
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="allowWithdrawals"
                  checked={settings.allowWithdrawals}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Allow Withdrawals</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Feature Toggles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['liveBetting', 'casino', 'sportsbook', 'promotions', 'referrals', 'chat'].map(feature => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  id={feature}
                  checked={!settings.disabledFeatures.includes(feature)}
                  onChange={(e) => handleFeatureToggle(feature, e.target.checked)}
                  className="w-4 h-4 bg-[#242a38] border border-[#363e52] rounded-sm text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor={feature} className="ml-2 text-sm text-gray-200 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
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
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage; 