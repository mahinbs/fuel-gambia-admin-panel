'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Search,
  Globe,
  Building2,
  Shield,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { supabase } from '@/supabase';
import { useToast } from '@/components/providers/ToastProvider';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

type Interval = 'Today' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Custom';

export default function ReportsSuperAdminPage() {
  const { showToast } = useToast();
  const [selectedInterval, setSelectedInterval] = useState<Interval>('Monthly');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<{ id: string; format: 'pdf' | 'xlsx' } | null>(null);

  const reportTypes = [
    { 
      id: 'national-subsidy', 
      title: 'National Subsidy Audit', 
      description: 'Consolidated report of all government fuel subsidies disbursed nationwide.',
      icon: Globe,
      color: 'blue'
    },
    { 
      id: 'station-performance', 
      title: 'Regional Station Performance', 
      description: 'Comparative analytics of fuel stations by volume, revenue, and compliance.',
      icon: BarChart3,
      color: 'emerald'
    },
    { 
      id: 'institutional-billing', 
      title: 'Institutional Settlement Ledger', 
      description: 'Billing summaries and payment status for all corporate and govt partners.',
      icon: Building2,
      color: 'purple'
    },
    { 
      id: 'user-activity', 
      title: 'Security Audit Feed', 
      description: 'Comprehensive audit logs of administrative actions and platform health.',
      icon: Shield,
      color: 'amber'
    },
    {
      id: 'bespoke-query',
      title: 'Bespoke Analytics Engine',
      description: 'Run custom SQL-grade queries against the national database for specific insights.',
      icon: Search,
      color: 'blue'
    }
  ];

  const bespokeReports = [
    { title: 'Users by Institution Branch', description: 'Detailed breakdown of staff mapped to specific geographical branches.' },
    { title: 'Users by Fuel Company', description: 'Onboarded employees filtered by their respective fuel provider.' },
    { title: 'Sales Report per Company', description: 'Consolidated revenue and volume per corporate entity.' },
    { title: 'Staff Enrollment Audit', description: 'Track onboarding dates for all staff across all levels.' },
  ];

  const intervals: Interval[] = ['Today', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'Custom'];

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();
    
    switch (selectedInterval) {
      case 'Today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'Weekly':
        start.setDate(end.getDate() - 7);
        break;
      case 'Monthly':
        start.setDate(end.getDate() - 30);
        break;
      case 'Quarterly':
        start.setDate(end.getDate() - 90);
        break;
      case 'Annual':
        start.setDate(end.getDate() - 365);
        break;
      case 'Custom':
        return {
          start: startDate ? new Date(startDate) : null,
          end: endDate ? new Date(endDate) : null
        };
    }
    
    return { start, end };
  };

  const exportToXLSX = (data: any[], fileName: string, sheetName: string = 'Report') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const maxLens = data.reduce((acc: any, row: any) => {
      Object.keys(row).forEach((key, colIdx) => {
        const val = row[key];
        const len = val ? String(val).length : 0;
        acc[colIdx] = Math.max(acc[colIdx] || 10, len, key.length);
      });
      return acc;
    }, []);
    
    worksheet['!cols'] = maxLens.map((w: number) => ({ w: w + 2 }));
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const generatePDFReport = (title: string, summaryStats: {label: string, value: string}[], headers: string[], rows: string[][], filename: string) => {
    const doc = new jsPDF();
    
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = [37, 99, 235]; // Blue 600
    const textColor = [71, 85, 105]; // Slate 600
    const lightBg = [248, 250, 252]; // Slate 50
    
    // Header banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('FUEL GAMBIA', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('NATIONAL OPERATIONS & INTELLIGENCE CENTER', 15, 25);
    
    // Report Title
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title.toUpperCase(), 15, 48);
    
    // Metadata
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 45);
    doc.text(`Interval: ${selectedInterval}`, 150, 50);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 54, 195, 54);
    
    // Summary Cards
    let cardX = 15;
    const cardWidth = 55;
    const cardHeight = 20;
    
    summaryStats.forEach(stat => {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(cardX, 58, cardWidth, cardHeight, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.rect(cardX, 58, cardWidth, cardHeight, 'S');
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(stat.label.toUpperCase(), cardX + 5, 65);
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(stat.value, cardX + 5, 73);
      
      cardX += cardWidth + 5;
    });
    
    // Table
    let y = 90;
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, y, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    
    const colCount = headers.length;
    const colWidth = 180 / colCount;
    
    headers.forEach((header, idx) => {
      doc.text(header, 17 + (idx * colWidth), y + 5.5);
    });
    
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    rows.forEach((row, rowIdx) => {
      if (y > 270) {
        doc.addPage();
        
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`FUEL GAMBIA — ${title.toUpperCase()} (Continued)`, 15, 10);
        
        y = 25;
        
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(15, y, 180, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        
        headers.forEach((header, idx) => {
          doc.text(header, 17 + (idx * colWidth), y + 5.5);
        });
        
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
      }
      
      if (rowIdx % 2 === 1) {
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.rect(15, y, 180, 7, 'F');
      }
      
      row.forEach((cell, idx) => {
        let text = String(cell);
        if (text.length > 25) text = text.substring(0, 22) + '...';
        doc.text(text, 17 + (idx * colWidth), y + 4.5);
      });
      
      y += 7;
    });
    
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 95, 287);
      doc.text('CONFIDENTIAL • FOR INTERNAL USE ONLY', 15, 287);
    }
    
    doc.save(`${filename}.pdf`);
  };

  const handleFetchAnalytics = () => {
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates.', 'warning');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('Start date cannot be after end date.', 'error');
      return;
    }
    showToast(`Custom date range set: ${startDate} to ${endDate}`, 'success');
  };

  const handleDownload = async (reportId: string, format: 'pdf' | 'xlsx') => {
    setGeneratingReport({ id: reportId, format });
    showToast(`Querying database & generating ${format.toUpperCase()}...`, 'info');
    
    try {
      const dateRange = getDateRange();
      
      if (reportId === 'national-subsidy') {
        let query = supabase
          .from('transactions')
          .select(`
            reference_number,
            created_at,
            fuel_type,
            liters,
            price_per_liter,
            amount,
            payment_method,
            status,
            user:profiles!transactions_user_id_fkey(name, email)
          `)
          .eq('mode', 'SUBSIDY')
          .eq('status', 'SUCCESS')
          .order('created_at', { ascending: false });
          
        if (dateRange.start) query = query.gte('created_at', dateRange.start.toISOString());
        if (dateRange.end) query = query.lte('created_at', dateRange.end.toISOString());
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
          showToast('No subsidy records found for the selected period.', 'warning');
          setGeneratingReport(null);
          return;
        }
        
        const totalSubsidy = data.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const totalVolume = data.reduce((sum, item) => sum + Number(item.liters || 0), 0);
        
        const summaryStats = [
          { label: 'Total subsidy cost', value: `GMD ${totalSubsidy.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'Total volume disbursed', value: `${totalVolume.toLocaleString()} L` },
          { label: 'Transactions count', value: String(data.length) }
        ];
        
        if (format === 'pdf') {
          const headers = ['TXN Reference', 'Date', 'Beneficiary', 'Fuel Type', 'Volume (L)', 'Subsidy (GMD)'];
          const rows = data.map((t: any) => [
            t.reference_number || 'N/A',
            new Date(t.created_at).toLocaleDateString(),
            t.user?.name || 'Unknown',
            t.fuel_type || 'N/A',
            `${t.liters} L`,
            Number(t.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })
          ]);
          generatePDFReport('National Subsidy Audit', summaryStats, headers, rows, `national_subsidy_${selectedInterval.toLowerCase()}`);
        } else {
          const exportData = data.map((t: any) => ({
            'Transaction Reference': t.reference_number || 'N/A',
            'Date': new Date(t.created_at).toLocaleString(),
            'Beneficiary Name': t.user?.name || 'N/A',
            'Beneficiary Email': t.user?.email || 'N/A',
            'Fuel Type': t.fuel_type || 'N/A',
            'Volume (Liters)': Number(t.liters || 0),
            'Price per Liter (GMD)': Number(t.price_per_liter || 0),
            'Subsidy Cost (GMD)': Number(t.amount || 0),
            'Payment Method': t.payment_method || 'N/A',
            'Status': t.status || 'N/A'
          }));
          exportToXLSX(exportData, `National_Subsidy_Audit_${selectedInterval}`, 'Subsidy Audit');
        }
        
      } else if (reportId === 'station-performance') {
        const { data: stations, error: stationsError } = await supabase
          .from('stations')
          .select('id, name, station_code, location, status, petrol_stock, diesel_stock');
          
        if (stationsError) throw stationsError;
        
        let txQuery = supabase
          .from('transactions')
          .select('station_id, fuel_type, liters, amount')
          .eq('status', 'SUCCESS');
          
        if (dateRange.start) txQuery = txQuery.gte('created_at', dateRange.start.toISOString());
        if (dateRange.end) txQuery = txQuery.lte('created_at', dateRange.end.toISOString());
        
        const { data: txs, error: txsError } = await txQuery;
        if (txsError) throw txsError;
        
        const performanceMap: Record<string, { petrolLiters: number, dieselLiters: number, totalRevenue: number }> = {};
        stations?.forEach(s => {
          performanceMap[s.id] = { petrolLiters: 0, dieselLiters: 0, totalRevenue: 0 };
        });
        
        txs?.forEach((t: any) => {
          if (performanceMap[t.station_id]) {
            const stats = performanceMap[t.station_id];
            if (t.fuel_type === 'PETROL') {
              stats.petrolLiters += Number(t.liters || 0);
            } else if (t.fuel_type === 'DIESEL') {
              stats.dieselLiters += Number(t.liters || 0);
            }
            stats.totalRevenue += Number(t.amount || 0);
          }
        });
        
        const totalSalesVolume = Object.values(performanceMap).reduce((sum, item) => sum + item.petrolLiters + item.dieselLiters, 0);
        const totalRevenue = Object.values(performanceMap).reduce((sum, item) => sum + item.totalRevenue, 0);
        const activeStations = stations?.filter(s => s.status === 'ACTIVE').length || 0;
        
        const summaryStats = [
          { label: 'Active stations count', value: String(activeStations) },
          { label: 'Total sales volume', value: `${totalSalesVolume.toLocaleString()} L` },
          { label: 'Total fuel sales value', value: `GMD ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` }
        ];
        
        if (format === 'pdf') {
          const headers = ['Station Code', 'Station Name', 'Location', 'Petrol Stock', 'Diesel Stock', 'Total Sold (L)', 'Revenue (GMD)'];
          const rows = (stations || []).map((s: any) => {
            const stats = performanceMap[s.id] || { petrolLiters: 0, dieselLiters: 0, totalRevenue: 0 };
            return [
              s.station_code || 'N/A',
              s.name || 'N/A',
              s.location || 'N/A',
              `${s.petrol_stock}L`,
              `${s.diesel_stock}L`,
              `${stats.petrolLiters + stats.dieselLiters}L`,
              stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })
            ];
          });
          generatePDFReport('Regional Station Performance', summaryStats, headers, rows, `station_performance_${selectedInterval.toLowerCase()}`);
        } else {
          const exportData = (stations || []).map((s: any) => {
            const stats = performanceMap[s.id] || { petrolLiters: 0, dieselLiters: 0, totalRevenue: 0 };
            return {
              'Station Code': s.station_code || 'N/A',
              'Station Name': s.name || 'N/A',
              'Location': s.location || 'N/A',
              'Status': s.status || 'N/A',
              'Petrol Stock (Liters)': Number(s.petrol_stock || 0),
              'Diesel Stock (Liters)': Number(s.diesel_stock || 0),
              'Petrol Sold (Liters)': stats.petrolLiters,
              'Diesel Sold (Liters)': stats.dieselLiters,
              'Total Volume Sold (Liters)': stats.petrolLiters + stats.dieselLiters,
              'Total Revenue (GMD)': stats.totalRevenue
            };
          });
          exportToXLSX(exportData, `Station_Performance_Audit_${selectedInterval}`, 'Station Performance');
        }
        
      } else if (reportId === 'institutional-billing') {
        let query = supabase
          .from('billing_records')
          .select(`
            invoice_number,
            billing_period_start,
            billing_period_end,
            total_liters_billed,
            total_amount,
            payment_status,
            created_at,
            station:stations(name),
            department:departments(name)
          `)
          .order('created_at', { ascending: false });
          
        if (dateRange.start) query = query.gte('created_at', dateRange.start.toISOString());
        if (dateRange.end) query = query.lte('created_at', dateRange.end.toISOString());
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
          showToast('No billing records found for the selected period.', 'warning');
          setGeneratingReport(null);
          return;
        }
        
        const totalBilled = data.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
        const totalLiters = data.reduce((sum, item) => sum + Number(item.total_liters_billed || 0), 0);
        const paidCount = data.filter(item => item.payment_status === 'PAID').length;
        
        const summaryStats = [
          { label: 'Total invoiced value', value: `GMD ${totalBilled.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'Total liters invoiced', value: `${totalLiters.toLocaleString()} L` },
          { label: 'Settlement Ratio', value: `${paidCount} / ${data.length} Paid` }
        ];
        
        if (format === 'pdf') {
          const headers = ['Invoice No', 'Institution', 'Billing Period', 'Volume (L)', 'Total Billed', 'Status'];
          const rows = data.map((b: any) => [
            b.invoice_number || 'N/A',
            b.department?.name || 'N/A',
            `${b.billing_period_start} to ${b.billing_period_end}`,
            `${b.total_liters_billed} L`,
            `GMD ${Number(b.total_amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            b.payment_status || 'N/A'
          ]);
          generatePDFReport('Institutional Settlement Ledger', summaryStats, headers, rows, `institutional_settlement_${selectedInterval.toLowerCase()}`);
        } else {
          const exportData = data.map((b: any) => ({
            'Invoice Number': b.invoice_number || 'N/A',
            'Department/Institution': b.department?.name || 'N/A',
            'Station': b.station?.name || 'N/A',
            'Billing Period Start': b.billing_period_start || 'N/A',
            'Billing Period End': b.billing_period_end || 'N/A',
            'Liters Billed (L)': Number(b.total_liters_billed || 0),
            'Total Amount (GMD)': Number(b.total_amount || 0),
            'Payment Status': b.payment_status || 'N/A',
            'Generated Date': new Date(b.created_at).toLocaleDateString()
          }));
          exportToXLSX(exportData, `Institutional_Settlement_Ledger_${selectedInterval}`, 'Settlement Ledger');
        }
        
      } else if (reportId === 'user-activity') {
        let query = supabase
          .from('audit_logs')
          .select(`
            id,
            action,
            entity_type,
            entity_id,
            ip_address,
            created_at,
            user:profiles!audit_logs_user_id_fkey(name, role)
          `)
          .order('created_at', { ascending: false });
          
        if (dateRange.start) query = query.gte('created_at', dateRange.start.toISOString());
        if (dateRange.end) query = query.lte('created_at', dateRange.end.toISOString());
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) {
          showToast('No security logs found for the selected period.', 'warning');
          setGeneratingReport(null);
          return;
        }
        
        const summaryStats = [
          { label: 'Security events logged', value: String(data.length) },
          { label: 'Unique actions audited', value: String(new Set(data.map(item => item.action)).size) },
          { label: 'Audit monitor status', value: 'NOMINAL' }
        ];
        
        if (format === 'pdf') {
          const headers = ['Timestamp', 'Actor Name', 'Role', 'Action Type', 'Entity', 'IP Address'];
          const rows = data.map((l: any) => [
            new Date(l.created_at).toLocaleString(),
            l.user?.name || 'System/Anon',
            l.user?.role || 'N/A',
            l.action || 'N/A',
            l.entity_type || 'N/A',
            l.ip_address || 'N/A'
          ]);
          generatePDFReport('Security Audit Feed', summaryStats, headers, rows, `security_audit_feed_${selectedInterval.toLowerCase()}`);
        } else {
          const exportData = data.map((l: any) => ({
            'Log ID': l.id,
            'Timestamp': new Date(l.created_at).toLocaleString(),
            'Actor Name': l.user?.name || 'System/Anonymous',
            'Actor Role': l.user?.role || 'N/A',
            'Action Type': l.action || 'N/A',
            'Entity Affected': l.entity_type || 'N/A',
            'Entity ID': l.entity_id || 'N/A',
            'IP Address': l.ip_address || 'N/A'
          }));
          exportToXLSX(exportData, `Security_Audit_Feed_${selectedInterval}`, 'Audit Feed');
        }
      } else if (reportId === 'bespoke-query') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, phone_number, company_name, department_name, station_name, is_active, created_at')
          .order('role');
          
        if (error) throw error;
        
        const summaryStats = [
          { label: 'Total onboarded users', value: String(data.length) },
          { label: 'Super Admins active', value: String(data.filter(u => u.role === 'SUPER_ADMIN').length) },
          { label: 'Operational staff', value: String(data.filter(u => u.role !== 'CUSTOMER').length) }
        ];
        
        if (format === 'pdf') {
          const headers = ['Name', 'Email', 'Role', 'Company', 'Station', 'Status'];
          const rows = data.map((u: any) => [
            u.name || 'N/A',
            u.email || 'N/A',
            u.role || 'N/A',
            u.company_name || 'N/A',
            u.station_name || 'N/A',
            u.is_active ? 'ACTIVE' : 'INACTIVE'
          ]);
          generatePDFReport('Bespoke National Registry Audit', summaryStats, headers, rows, `national_registry_${selectedInterval.toLowerCase()}`);
        } else {
          const exportData = data.map((u: any) => ({
            'User ID': u.id,
            'Name': u.name,
            'Email': u.email || 'N/A',
            'Phone Number': u.phone_number || 'N/A',
            'Role': u.role,
            'Company Name': u.company_name || 'N/A',
            'Department Name': u.department_name || 'N/A',
            'Station Name': u.station_name || 'N/A',
            'Account Status': u.is_active ? 'ACTIVE' : 'INACTIVE',
            'Registration Date': new Date(u.created_at).toLocaleString()
          }));
          exportToXLSX(exportData, `Bespoke_National_Registry_${selectedInterval}`, 'National Registry');
        }
      }
      
      showToast(`Report downloaded successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || `Failed to generate report.`, 'error');
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleBespokeDownload = async (title: string) => {
    showToast(`Initializing Bespoke Query: ${title}...`, 'info');
    try {
      if (title === 'Users by Institution Branch') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, phone_number, company_name, department_name, station_name, is_active, created_at')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const exportData = (data || []).map((p: any) => ({
          'User Name': p.name,
          'Email': p.email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Role': p.role,
          'Company/Institution': p.company_name || 'N/A',
          'Department/Branch': p.department_name || 'N/A',
          'Assigned Station': p.station_name || 'N/A',
          'Status': p.is_active ? 'ACTIVE' : 'INACTIVE',
          'Created At': new Date(p.created_at).toLocaleDateString()
        }));
        
        exportToXLSX(exportData, 'Users_by_Institution_Branch', 'Users & Branches');
        
      } else if (title === 'Users by Fuel Company') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, phone_number, company_name, created_at')
          .not('company_name', 'is', null)
          .order('company_name');
          
        if (error) throw error;
        
        const exportData = (data || []).map((p: any) => ({
          'Company Name': p.company_name,
          'User Name': p.name,
          'Email': p.email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Role': p.role,
          'Onboarded Date': new Date(p.created_at).toLocaleDateString()
        }));
        
        exportToXLSX(exportData, 'Users_by_Fuel_Company', 'Company Employees');
        
      } else if (title === 'Sales Report per Company') {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            amount,
            liters,
            fuel_type,
            status,
            station:stations(
              name,
              company:companies(name)
            )
          `)
          .eq('status', 'SUCCESS');
          
        if (error) throw error;
        
        const companySales: Record<string, { totalRevenue: number, totalLiters: number, petrolLiters: number, dieselLiters: number, stationCount: Set<string> }> = {};
        
        data?.forEach((tx: any) => {
          const stationData = Array.isArray(tx.station) ? tx.station[0] : tx.station;
          const companyName = (stationData as any)?.company?.name || 'Independent / No Company';
          const stationName = (stationData as any)?.name || 'Unknown Station';
          
          if (!companySales[companyName]) {
            companySales[companyName] = { totalRevenue: 0, totalLiters: 0, petrolLiters: 0, dieselLiters: 0, stationCount: new Set() };
          }
          
          const stats = companySales[companyName];
          stats.totalRevenue += Number(tx.amount || 0);
          stats.totalLiters += Number(tx.liters || 0);
          if (tx.fuel_type === 'PETROL') stats.petrolLiters += Number(tx.liters || 0);
          else if (tx.fuel_type === 'DIESEL') stats.dieselLiters += Number(tx.liters || 0);
          if (stationName) stats.stationCount.add(stationName);
        });
        
        const exportData = Object.entries(companySales).map(([companyName, stats]) => ({
          'Company Name': companyName,
          'Stations Managed': stats.stationCount.size,
          'Petrol Sold (Liters)': stats.petrolLiters,
          'Diesel Sold (Liters)': stats.dieselLiters,
          'Total Fuel Volume (Liters)': stats.totalLiters,
          'Consolidated Revenue (GMD)': stats.totalRevenue
        }));
        
        exportToXLSX(exportData, 'Consolidated_Sales_by_Company', 'Sales Report');
        
      } else if (title === 'Staff Enrollment Audit') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, phone_number, company_name, department_name, station_name, created_at, is_active')
          .not('role', 'eq', 'CUSTOMER')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const exportData = (data || []).map((p: any) => ({
          'Created Date': new Date(p.created_at).toLocaleString(),
          'Staff Name': p.name,
          'Email': p.email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Role': p.role,
          'Affiliation': p.company_name || p.department_name || p.station_name || 'N/A',
          'Status': p.is_active ? 'ACTIVE' : 'INACTIVE'
        }));
        
        exportToXLSX(exportData, 'Staff_Enrollment_Audit', 'Staff Directory');
      }
      
      showToast(`Bespoke report generated and downloaded!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to initialize bespoke query.', 'error');
    }
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Center</h1>
            <p className="text-slate-500 font-medium mt-2">National platform-wide reporting and data-driven insights</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {intervals.map((interval) => (
              <button
                key={interval}
                onClick={() => {
                  setSelectedInterval(interval);
                  if (interval === 'Custom') setShowDatePicker(true);
                  else setShowDatePicker(false);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedInterval === interval 
                    ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>

        {showDatePicker && (
          <Card className="p-8 border-none shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive Start</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive End</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
              </div>
              <Button 
                variant="primary" 
                onClick={handleFetchAnalytics}
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
              >
                Fetch Analytics
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="p-10 border-none shadow-2xl hover:shadow-3xl transition-all group overflow-hidden relative">
                <div className="flex items-start justify-between relative z-10">
                  <div className={cn(
                    "p-5 rounded-[1.5rem] shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    report.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" :
                    report.color === 'emerald' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                    report.color === 'purple' ? "bg-purple-600 text-white shadow-purple-500/20" :
                    "bg-amber-600 text-white shadow-amber-500/20"
                  )}>
                    <Icon size={32} strokeWidth={2.5} />
                  </div>
                  <Badge variant="info" className="font-black text-[9px] px-2 py-1 tracking-widest shadow-sm">VERIFIED LIVE</Badge>
                </div>

                <div className="mt-10 relative z-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">{report.title}</h3>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm uppercase tracking-tight">
                    {report.description}
                  </p>
                </div>

                <div className="mt-12 flex flex-wrap gap-4 relative z-10">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    disabled={generatingReport !== null}
                    onClick={() => handleDownload(report.id, 'pdf')}
                    className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-14 shadow-xl shadow-blue-500/20 group"
                  >
                    {generatingReport?.id === report.id && generatingReport?.format === 'pdf' ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                      <Download size={16} className="mr-2 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                    )}
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    disabled={generatingReport !== null}
                    onClick={() => handleDownload(report.id, 'xlsx')}
                    className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-14 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    {generatingReport?.id === report.id && generatingReport?.format === 'xlsx' ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                      <Download size={16} className="mr-2" strokeWidth={3} />
                    )}
                    Export XLSX
                  </Button>
                </div>

                <div className={cn(
                  "absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-20",
                  report.color === 'blue' ? "bg-blue-600" :
                  report.color === 'emerald' ? "bg-emerald-600" :
                  report.color === 'purple' ? "bg-purple-600" :
                  "bg-amber-600"
                )} />
              </Card>
            );
          })}
        </div>

        <Card className="p-10 border-none shadow-2xl bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-4">
                <TrendingUp className="text-blue-400" size={32} />
                Strategic Operations Center
              </h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em]">Live National Consumption Feed • Operational Status: Nominal</p>
            </div>
            <Button variant="primary" className="bg-blue-600 border-none hover:bg-blue-500 px-12 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95">
              Launch Intelligence Console
              <ArrowRight size={18} className="ml-3" strokeWidth={3} />
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/5 pointer-events-none" />
        </Card>

        <div className="space-y-8 pt-10">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bespoke Query Builder</h2>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bespokeReports.map((report, idx) => (
              <div
                key={idx}
                onClick={() => handleBespokeDownload(report.title)}
                className="cursor-pointer"
              >
                <Card 
                  className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group rounded-[2rem] h-full"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all mb-6">
                    <Filter size={24} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-3 tracking-tight">{report.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">{report.description}</p>
                  <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-600">
                    Initialize
                    <ArrowRight size={14} strokeWidth={3} />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

