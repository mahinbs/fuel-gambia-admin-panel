'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, FileText } from 'lucide-react';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function ReportsDepartmentOfficerPage() {
  const [reportType, setReportType] = useState('DEPARTMENT_SUMMARY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = (format: 'PDF' | 'CSV' | 'EXCEL') => {
    alert(`Exporting ${reportType} report as ${format}`);
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.DEPARTMENT_OFFICER}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports - Department Officer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate department-level reports</p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="DEPARTMENT_SUMMARY">Department Summary Report</option>
                <option value="BENEFICIARY_USAGE">Beneficiary Usage Report</option>
                <option value="ALLOCATION_REPORT">Allocation Report</option>
                <option value="COUPON_USAGE">Coupon Usage Report</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => handleExport('PDF')}>
                <FileText size={16} className="mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('CSV')}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('EXCEL')}>
                <Download size={16} className="mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
