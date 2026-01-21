# Fuel Gambia - Admin Panel

A comprehensive admin panel web application for managing the Fuel Gambia platform, including fuel beneficiaries, commercial customers, station attendants, inventory, transactions, payments, and more.

## Features

- **Dashboard**: Real-time statistics, charts, and live activity feed
- **Beneficiary Management**: Verify, approve, and manage government employee beneficiaries
- **Customer Management**: Monitor commercial customers and their transactions
- **Station & Attendant Management**: Manage fuel stations and their attendants
- **Inventory Control**: Track and update fuel inventory across stations
- **Transaction Audit**: View and audit all fuel transactions
- **Payment Management**: Monitor payments, retry failed payments, process refunds
- **QR Code Audit**: Track QR code scans and redemptions
- **Notifications**: Broadcast and user-specific notifications
- **Reports & Analytics**: Generate and export reports (PDF, CSV, Excel)
- **Settings**: Configure fuel prices, allocation rules, and system settings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Server State**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Real-time**: Socket.IO
- **Error Tracking**: Sentry (configured)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Login Credentials

The application uses mock authentication. Use these credentials:

- **Email**: `superadmin@fuelgambia.com`
- **Password**: `password123`

Other demo accounts:
- `govadmin@fuelgambia.com` (Government Admin)
- `finance@fuelgambia.com` (Finance Admin)
- `station@fuelgambia.com` (Station Admin)

All use the same password: `password123`

## Project Structure

```
admin-panel/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── layout.tsx         # Root layout
├── src/
│   ├── components/        # React components
│   │   ├── ui/            # UI components (Button, Card, etc.)
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   └── providers/     # Context providers
│   ├── features/          # Feature modules
│   ├── navigation/        # Navigation components
│   ├── services/          # API services (mock)
│   ├── store/             # Redux store and slices
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── public/                # Static assets
```

## Key Features Implementation

### Authentication
- Firebase Auth integration (configured, using mock for now)
- Role-based access control (RBAC)
- JWT token storage
- Protected routes

### Dashboard
- Real-time statistics widgets
- Interactive charts (Line, Bar, Pie)
- Live activity feed (simulated with Socket.IO)
- Monthly trends and distributions

### Data Management
- Paginated lists with search and filters
- Detailed views with modals
- Inline actions (approve, suspend, etc.)
- Bulk operations support

### Real-time Updates
- Socket.IO integration for live feed
- Automatic data refresh
- Notification system

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Building for Production

```bash
npm run build
npm start
```

## Admin Roles

- **SUPER_ADMIN**: Full access to all features
- **GOV_ADMIN**: Beneficiary management, allocations, reports
- **FINANCE_ADMIN**: Payments, customers, revenue reports
- **STATION_ADMIN**: Stations, inventory, attendants

## Mock Data

The application currently uses mock data for development. All services in `src/services/` return simulated data. Replace these with actual API calls when connecting to a backend.

## Security Features

- Role-based UI guards
- API permission middleware
- Audit logs (structure in place)
- QR payload decryption (ready for implementation)
- Rate limiting UI (ready for implementation)

## Contributing

1. Follow TypeScript best practices
2. Use the existing component patterns
3. Maintain consistent styling with Tailwind CSS
4. Write descriptive commit messages

## License

Proprietary - Fuel Gambia Platform
