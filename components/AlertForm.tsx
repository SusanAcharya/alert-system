'use client';

import { useState } from 'react';
import axios from 'axios';

interface AlertFormProps {
  onAlertCreated: () => void;
}

export default function AlertForm({ onAlertCreated }: AlertFormProps) {
  const [alertType, setAlertType] = useState<'time_based' | 'date_based'>('time_based');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [minutesFromNow, setMinutesFromNow] = useState(5);
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [selectedOffsets, setSelectedOffsets] = useState<Array<{ value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' }>>([]);
  const [customOffsetValue, setCustomOffsetValue] = useState(1);
  const [customOffsetUnit, setCustomOffsetUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const presetOffsets = [
    { label: '1 month before', value: 1, unit: 'months' as const },
    { label: '1 week before', value: 1, unit: 'weeks' as const },
    { label: '1 day before', value: 1, unit: 'days' as const },
    { label: '1 hour before', value: 1, unit: 'hours' as const },
  ];

  const toggleOffset = (value: number, unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months') => {
    setSelectedOffsets(prev => {
      const exists = prev.find(o => o.value === value && o.unit === unit);
      if (exists) {
        return prev.filter(o => !(o.value === value && o.unit === unit));
      } else {
        return [...prev, { value, unit }];
      }
    });
  };

  const addCustomOffset = () => {
    if (customOffsetValue > 0) {
      setSelectedOffsets(prev => {
        const exists = prev.find(o => o.value === customOffsetValue && o.unit === customOffsetUnit);
        if (!exists) {
          return [...prev, { value: customOffsetValue, unit: customOffsetUnit }];
        }
        return prev;
      });
      setCustomOffsetValue(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let payload: any = {
        title,
        message,
        telegramChatId,
        alertType,
      };

      if (alertType === 'time_based') {
        payload.minutesFromNow = minutesFromNow;
      } else {
        if (!targetDate) {
          throw new Error('Target date is required');
        }
        if (selectedOffsets.length === 0) {
          throw new Error('Please select at least one alert time');
        }

        // Combine date and time
        const dateTime = targetTime 
          ? `${targetDate}T${targetTime}:00`
          : `${targetDate}T00:00:00`;
        
        payload.targetDate = dateTime;
        payload.offsets = selectedOffsets;
      }

      const response = await axios.post('/api/alerts', payload);
      
      if (response.data.success) {
        setSuccess(`Alert created successfully! ${response.data.alertIds.length} alert(s) scheduled.`);
        setTitle('');
        setMessage('');
        setMinutesFromNow(5);
        setTargetDate('');
        setTargetTime('');
        setSelectedOffsets([]);
        onAlertCreated();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create alert';
      const details = err.response?.data?.details;
      setError(details ? `${errorMsg}: ${details}` : errorMsg);
      console.error('Alert creation error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Telegram Chat ID *
        </label>
        <input
          type="text"
          value={telegramChatId}
          onChange={(e) => setTelegramChatId(e.target.value)}
          placeholder="Your Telegram Chat ID"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          Get your Chat ID by messaging @userinfobot on Telegram
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alert Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Renew driving license"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., Don't forget to renew your driving license"
          required
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alert Type *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="time_based"
              checked={alertType === 'time_based'}
              onChange={(e) => setAlertType(e.target.value as 'time_based')}
              className="mr-2"
            />
            <span>Time-based (remind in X minutes)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="date_based"
              checked={alertType === 'date_based'}
              onChange={(e) => setAlertType(e.target.value as 'date_based')}
              className="mr-2"
            />
            <span>Date-based (remind before event)</span>
          </label>
        </div>
      </div>

      {alertType === 'time_based' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remind me in (minutes) *
          </label>
          <input
            type="number"
            value={minutesFromNow}
            onChange={(e) => setMinutesFromNow(parseInt(e.target.value) || 0)}
            min="1"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Time (optional)
            </label>
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Times (select multiple) *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetOffsets.map((preset) => {
                const isSelected = selectedOffsets.some(
                  o => o.value === preset.value && o.unit === preset.unit
                );
                return (
                  <button
                    key={`${preset.value}-${preset.unit}`}
                    type="button"
                    onClick={() => toggleOffset(preset.value, preset.unit)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="number"
                value={customOffsetValue}
                onChange={(e) => setCustomOffsetValue(parseInt(e.target.value) || 1)}
                min="1"
                placeholder="Value"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <select
                value={customOffsetUnit}
                onChange={(e) => setCustomOffsetUnit(e.target.value as 'days' | 'weeks' | 'months')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
              <button
                type="button"
                onClick={addCustomOffset}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add
              </button>
            </div>

            {selectedOffsets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedOffsets.map((offset, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {offset.value} {offset.unit}
                    <button
                      type="button"
                      onClick={() => toggleOffset(offset.value, offset.unit)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Alert...' : 'Create Alert'}
      </button>
    </form>
  );
}

