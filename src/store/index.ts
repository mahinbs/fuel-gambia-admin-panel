import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import beneficiariesSlice from './slices/beneficiariesSlice';
import customersSlice from './slices/customersSlice';
import attendantsSlice from './slices/attendantsSlice';
import stationsSlice from './slices/stationsSlice';
import transactionsSlice from './slices/transactionsSlice';
import paymentsSlice from './slices/paymentsSlice';
import inventorySlice from './slices/inventorySlice';
import notificationsSlice from './slices/notificationsSlice';
import dashboardSlice from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    beneficiaries: beneficiariesSlice,
    customers: customersSlice,
    attendants: attendantsSlice,
    stations: stationsSlice,
    transactions: transactionsSlice,
    payments: paymentsSlice,
    inventory: inventorySlice,
    notifications: notificationsSlice,
    dashboard: dashboardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
