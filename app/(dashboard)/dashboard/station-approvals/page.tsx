'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StationRequest, FuelType, Document } from '@/types';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';

const mockRequests: StationRequest[] = [
  {
    id: '1',
    name: 'Gambia Fuel Station',
    location: 'Banjul, The Gambia',
    managerName: 'Ahmed Jallow',
    managerEmail: 'ahmed@example.com',
    managerPhone: '+220 123 4567',
    fuelTypes: [FuelType.PETROL, FuelType.DIESEL],
    documents: [
      { id: '1', type: 'OTHER', url: '/documents/station1.pdf', uploadedAt: '2024-01-01T00:00:00Z' },
    ],
    status: 'PENDING',
    submittedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Serrekunda Fuel Depot',
    location: 'Serrekunda, The Gambia',
    managerName: 'Fatou Sarr',
    managerEmail: 'fatou@example.com',
    managerPhone: '+220 987 6543',
    fuelTypes: [FuelType.PETROL],
    documents: [
      { id: '2', type: 'OTHER', url: '/documents/station2.pdf', uploadedAt: '2024-01-02T00:00:00Z' },
    ],
    status: 'PENDING',
    submittedAt: '2024-01-02T00:00:00Z',
  },
];

export default function StationApprovalsPage() {
  const [requests, setRequests] = useState<StationRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<StationRequest | null>(null);

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this station?')) {
      setRequests(
        requests.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'APPROVED' as const,
                reviewedBy: 'Super Admin',
                reviewedAt: new Date().toISOString(),
                stationId: `STN-${Date.now()}`,
              }
            : r
        )
      );
      setSelectedRequest(null);
    }
  };

  const handleReject = (id: string, reason: string) => {
    if (confirm('Are you sure you want to reject this station?')) {
      setRequests(
        requests.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'REJECTED' as const,
                reviewedBy: 'Super Admin',
                reviewedAt: new Date().toISOString(),
                rejectionReason: reason,
              }
            : r
        )
      );
      setSelectedRequest(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Station Name' },
    { key: 'location', label: 'Location' },
    { key: 'managerName', label: 'Manager' },
    { key: 'fuelTypes', label: 'Fuel Types' },
    { key: 'submittedAt', label: 'Submitted' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = requests.map((request) => ({
    id: request.id,
    name: request.name,
    location: request.location,
    managerName: request.managerName,
    fuelTypes: (
      <div className="flex gap-1">
        {request.fuelTypes.map((type) => (
          <Badge key={type} variant="info" size="sm">
            {type}
          </Badge>
        ))}
      </div>
    ),
    submittedAt: format(new Date(request.submittedAt), 'MMM dd, yyyy'),
    status: (
      <Badge
        variant={
          request.status === 'APPROVED'
            ? 'success'
            : request.status === 'REJECTED'
            ? 'error'
            : 'warning'
        }
      >
        {request.status}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedRequest(request)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye size={16} />
        </button>
        {request.status === 'PENDING' && (
          <>
            <button
              onClick={() => handleApprove(request.id)}
              className="text-green-600 hover:text-green-800"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={() => {
                const reason = prompt('Enter rejection reason:');
                if (reason) handleReject(request.id, reason);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <XCircle size={16} />
            </button>
          </>
        )}
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Station Approvals</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve fuel station requests</p>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={tableData} />
      </Card>

      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Station Request Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Station Information</h3>
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>Name:</strong> {selectedRequest.name}</p>
                <p><strong>Location:</strong> {selectedRequest.location}</p>
                <p><strong>Fuel Types:</strong> {selectedRequest.fuelTypes.join(', ')}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Manager Information</h3>
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>Name:</strong> {selectedRequest.managerName}</p>
                <p><strong>Email:</strong> {selectedRequest.managerEmail}</p>
                <p><strong>Phone:</strong> {selectedRequest.managerPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Documents</h3>
              <div className="mt-2 space-y-2">
                {selectedRequest.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <FileText size={16} />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            </div>
            {selectedRequest.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) {
                      handleReject(selectedRequest.id, reason);
                    }
                  }}
                  className="flex-1"
                >
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
              </div>
            )}
            {selectedRequest.rejectionReason && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
                </p>
              </div>
            )}
            {selectedRequest.stationId && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Station ID:</strong> {selectedRequest.stationId}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
