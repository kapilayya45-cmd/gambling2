'use client';

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface EventFormData {
  id?: string;
  sport: string;
  league: string;
  teamA: string;
  teamB: string;
  startDateTime: string;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  odds: {
    homeWin: number;
    draw: number;
    awayWin: number;
    overUnder?: number[];
    handicap?: number[];
  };
}

const DEFAULT_FORM_DATA: EventFormData = {
  sport: 'soccer',
  league: '',
  teamA: '',
  teamB: '',
  startDateTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
  status: 'upcoming',
  odds: {
    homeWin: 2.0,
    draw: 3.0,
    awayWin: 2.5,
    overUnder: [1.9, 1.9],
    handicap: [1.9, 1.9]
  }
};

const AdminEventsPage: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [formData, setFormData] = useState<EventFormData>(DEFAULT_FORM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEvents = async () => {
    if (!isAdmin || !db) return;
    
    setIsLoading(true);
    try {
      const eventsQuery = query(
        collection(db, 'matches'),
        orderBy('startDateTime', 'asc')
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsList: EventFormData[] = [];
      
      eventsSnapshot.forEach(doc => {
        const data = doc.data();
        eventsList.push({
          id: doc.id,
          sport: data.sport || 'soccer',
          league: data.league || '',
          teamA: data.teamA || '',
          teamB: data.teamB || '',
          startDateTime: data.startDateTime 
            ? new Date(data.startDateTime.toDate()).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
          status: data.status || 'upcoming',
          odds: {
            homeWin: data.odds?.homeWin || 2.0,
            draw: data.odds?.draw || 3.0,
            awayWin: data.odds?.awayWin || 2.5,
            overUnder: data.odds?.overUnder || [1.9, 1.9],
            handicap: data.odds?.handicap || [1.9, 1.9]
          }
        });
      });
      
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for over/under and handicap odds as they are arrays
    if (name.startsWith('overUnder') || name.startsWith('handicap')) {
      const [fieldName, index] = name.split('[');
      const cleanIndex = parseInt(index.replace(']', ''));
      
      setFormData(prev => {
        const updatedOdds = { ...prev.odds };
        
        if (fieldName === 'overUnder') {
          const newOverUnder = [...(updatedOdds.overUnder || [1.9, 1.9])];
          newOverUnder[cleanIndex] = parseFloat(value);
          updatedOdds.overUnder = newOverUnder;
        } else if (fieldName === 'handicap') {
          const newHandicap = [...(updatedOdds.handicap || [1.9, 1.9])];
          newHandicap[cleanIndex] = parseFloat(value);
          updatedOdds.handicap = newHandicap;
        }
        
        return {
          ...prev,
          odds: updatedOdds
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        odds: {
          ...prev.odds,
          [name]: parseFloat(value)
        }
      }));
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const handleEditEvent = (event: EventFormData) => {
    setFormData(event);
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!db || !isAdmin || !eventId) return;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'matches', eventId));
        setSuccessMessage('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        setError('Failed to delete event');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!db || !isAdmin) return;
    
    // Validation
    if (!formData.teamA || !formData.teamB || !formData.startDateTime) {
      setError('Please fill all required fields');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const eventData: any = {
        sport: formData.sport,
        league: formData.league,
        teamA: formData.teamA,
        teamB: formData.teamB,
        status: formData.status,
        startDateTime: Timestamp.fromDate(new Date(formData.startDateTime)),
        odds: formData.odds,
        updatedAt: Timestamp.now(),
        createdBy: 'admin'
      };
      
      if (isEditing && formData.id) {
        // Update existing event
        const eventRef = doc(db, 'matches', formData.id);
        await updateDoc(eventRef, eventData);
        setSuccessMessage('Event updated successfully');
      } else {
        // Add new event
        eventData.createdAt = Timestamp.now();
        await addDoc(collection(db, 'matches'), eventData);
        setSuccessMessage('Event added successfully');
      }
      
      // Reset form and refresh events list
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      setError('Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-[#1a1f2c] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Event' : 'Add New Event'}
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
                Sport
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="soccer">Soccer</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="cricket">Cricket</option>
                <option value="football">American Football</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                League
              </label>
              <input
                type="text"
                name="league"
                value={formData.league}
                onChange={handleInputChange}
                placeholder="e.g. Premier League"
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Home Team
              </label>
              <input
                type="text"
                name="teamA"
                value={formData.teamA}
                onChange={handleInputChange}
                placeholder="Home Team Name"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Away Team
              </label>
              <input
                type="text"
                name="teamB"
                value={formData.teamB}
                onChange={handleInputChange}
                placeholder="Away Team Name"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Start Date and Time
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <h3 className="text-md font-medium mb-3 mt-6 border-b border-[#363e52] pb-2">Odds</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Home Win
              </label>
              <input
                type="number"
                name="homeWin"
                value={formData.odds.homeWin}
                onChange={handleOddsChange}
                step="0.01"
                min="1"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Draw
              </label>
              <input
                type="number"
                name="draw"
                value={formData.odds.draw}
                onChange={handleOddsChange}
                step="0.01"
                min="1"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Away Win
              </label>
              <input
                type="number"
                name="awayWin"
                value={formData.odds.awayWin}
                onChange={handleOddsChange}
                step="0.01"
                min="1"
                required
                className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Over/Under
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="overUnder[0]"
                  value={formData.odds.overUnder?.[0] || 1.9}
                  onChange={handleOddsChange}
                  step="0.01"
                  min="1"
                  className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="number"
                  name="overUnder[1]"
                  value={formData.odds.overUnder?.[1] || 1.9}
                  onChange={handleOddsChange}
                  step="0.01"
                  min="1"
                  className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Handicap
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="handicap[0]"
                  value={formData.odds.handicap?.[0] || 1.9}
                  onChange={handleOddsChange}
                  step="0.01"
                  min="1"
                  className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="number"
                  name="handicap[1]"
                  value={formData.odds.handicap?.[1] || 1.9}
                  onChange={handleOddsChange}
                  step="0.01"
                  min="1"
                  className="w-full px-3 py-2 bg-[#242a38] border border-[#363e52] rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
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
              {isEditing ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Events List */}
      <div className="bg-[#1a1f2c] rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-[#363e52]">
          <h2 className="text-xl font-semibold">Existing Events</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage all events and matches
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No events found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-gray-400 uppercase bg-[#242a38]">
                <tr>
                  <th className="px-6 py-3 text-left">Teams</th>
                  <th className="px-6 py-3 text-left">Sport</th>
                  <th className="px-6 py-3 text-left">League</th>
                  <th className="px-6 py-3 text-left">Start Time</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363e52]">
                {events.map((event) => (
                  <tr 
                    key={event.id} 
                    className="hover:bg-[#242a38] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{event.teamA} vs {event.teamB}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {event.sport}
                    </td>
                    <td className="px-6 py-4">
                      {event.league || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(event.startDateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'live' 
                          ? 'bg-green-900 bg-opacity-30 text-green-400' 
                          : event.status === 'ended'
                          ? 'bg-gray-700 bg-opacity-30 text-gray-400'
                          : event.status === 'cancelled'
                          ? 'bg-red-900 bg-opacity-30 text-red-400'
                          : 'bg-blue-900 bg-opacity-30 text-blue-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => event.id && handleDeleteEvent(event.id)}
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

export default AdminEventsPage; 