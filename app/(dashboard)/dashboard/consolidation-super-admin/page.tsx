'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Fuel, Download } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ConsolidationSuperAdminPage() {
  const data = [
    { station: 'Station A', petrol: 45000, diesel: 32000 },
    { station: 'Station B', petrol: 38000, diesel: 41000 },
    { station: 'Station C', petrol: 52000, diesel: 28000 },
    { station: 'Station D', petrol: 29000, diesel: 35000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Consolidated Fuel Consumption (Super Admin)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">National overview of fuel usage across all registered stations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download size={20} />
          Download Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Station-wise Consumpion (Monthly)">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="station" />
              <YAxis />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Bar dataKey="petrol" fill="#3b82f6" name="Petrol (L)" />
              <Bar dataKey="diesel" fill="#10b981" name="Diesel (L)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Fuel className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Petrol Dispensed (MTD)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatLiters(164000)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Fuel className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Diesel Dispensed (MTD)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatLiters(136000)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
