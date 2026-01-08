'use client';

import { useState } from 'react';
import AlertForm from '@/components/AlertForm';
import AlertList from '@/components/AlertList';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAlertCreated = () => {
    setRefreshKey((prev: number) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            Tracked
          </h1>
          <p className="text-primary-700 text-lg">
            Customizable alerts & reminders via Telegram
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Create New Alert
          </h2>
          <AlertForm onAlertCreated={handleAlertCreated} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Alerts
          </h2>
          <AlertList key={refreshKey} />
        </div>
      </div>
    </main>
  );
}

