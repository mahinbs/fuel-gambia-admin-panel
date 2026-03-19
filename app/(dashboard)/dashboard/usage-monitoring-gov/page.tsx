'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Download } from 'lucide-react';
import { formatLiters } from '@/utils/format';

export default function UsageMonitoringGovPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage Monitoring (Gov Admin)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time tracking of fuel consumption against allocations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download size={20} />
          Export Live Data
        </button>
      </div>

      <Card title="Abnormal Usage Alerts">
         <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 flex items-center gap-3">
            <TrendingUp className="text-yellow-600" size={24} />
            <div>
               <p className="font-semibold text-yellow-700">High Consumption Detected</p>
               <p className="text-sm text-yellow-600">Health Dept. vehicle GG-5678 exceeded daily limit by 15%.</p>
            </div>
         </div>
      </Card>

      <Card title="Live Consumption Feed">
         <div className="h-64 flex items-center justify-center text-gray-400">
            Real-time Consumption Chart Placeholder
         </div>
      </Card>
    </div>
  );
}
