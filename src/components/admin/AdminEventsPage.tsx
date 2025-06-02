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
      {/* Add New Event Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isEditing ? 'Edit Event' : 'Add New Event'}
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
            {/* Sport Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="soccer">Soccer</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
              </select>
            </div>

            {/* League Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">League</label>
              <input
                type="text"
                name="league"
                placeholder="e.g. Premier League"
                value={formData.league}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Team Names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Team</label>
              <input
                type="text"
                name="teamA"
                placeholder="Home Team Name"
                value={formData.teamA}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Away Team</label>
              <input
                type="text"
                name="teamB"
                placeholder="Away Team Name"
                value={formData.teamB}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* Date and Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date and Time</label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Odds Section */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Odds</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Win</label>
                <input
                  type="number"
                  name="homeWin"
                  value={formData.odds.homeWin}
                  onChange={handleOddsChange}
                  step="0.1"
                  min="1"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Draw</label>
                <input
                  type="number"
                  name="draw"
                  value={formData.odds.draw}
                  onChange={handleOddsChange}
                  step="0.1"
                  min="1"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Away Win</label>
                <input
                  type="number"
                  name="awayWin"
                  value={formData.odds.awayWin}
                  onChange={handleOddsChange}
                  step="0.1"
                  min="1"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Over/Under and Handicap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Over/Under</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="overUnder[0]"
                    value={formData.odds.overUnder?.[0] || 1.9}
                    onChange={handleOddsChange}
                    step="0.1"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="overUnder[1]"
                    value={formData.odds.overUnder?.[1] || 1.9}
                    onChange={handleOddsChange}
                    step="0.1"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Handicap</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="handicap[0]"
                    value={formData.odds.handicap?.[0] || 1.9}
                    onChange={handleOddsChange}
                    step="0.1"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="handicap[1]"
                    value={formData.odds.handicap?.[1] || 1.9}
                    onChange={handleOddsChange}
                    step="0.1"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
                'Save Event'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Existing Events</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all events and matches</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No events found. Create your first event above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{event.teamA} vs {event.teamB}</div>
                      <div className="text-sm text-gray-600">{event.league}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(event.startDateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'ended'
                            ? 'bg-gray-100 text-gray-800'
                            : event.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        H: {event.odds.homeWin} | D: {event.odds.draw} | A: {event.odds.awayWin}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-purple-600 hover:text-purple-900 mx-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id!)}
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

export default AdminEventsPage; 