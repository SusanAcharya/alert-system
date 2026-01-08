'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, isPast } from 'date-fns';

interface Alert {
  id: number;
  title: string;
  message: string;
  telegram_chat_id: string;
  alert_type: string;
  scheduled_time: string;
  created_at: string;
  sent: number;
  cancelled: number;
}

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = async () => {
    if (!telegramChatId) {
      setAlerts([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/alerts?telegramChatId=${telegramChatId}`);
      setAlerts(response.data.alerts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [telegramChatId]);

  const handleCancel = async (alertId: number) => {
    if (!confirm('Are you sure you want to cancel this alert?')) {
      return;
    }

    try {
      await axios.delete(`/api/alerts?alertId=${alertId}&telegramChatId=${telegramChatId}`);
      fetchAlerts();
    } catch (err: any) {
      alert('Failed to cancel alert');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Telegram Chat ID to view your alerts
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="Your Telegram Chat ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {telegramChatId ? 'No alerts found' : 'Enter your Telegram Chat ID to view alerts'}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const scheduledTime = parseISO(alert.scheduled_time);
            const isPastDue = isPast(scheduledTime);
            const isSent = alert.sent === 1;

            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  isSent
                    ? 'bg-gray-50 border-gray-200'
                    : isPastDue
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                  {isSent && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Sent
                    </span>
                  )}
                  {!isSent && isPastDue && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {format(scheduledTime, 'MMM dd, yyyy HH:mm')}
                  </span>
                  {!isSent && (
                    <button
                      onClick={() => handleCancel(alert.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

