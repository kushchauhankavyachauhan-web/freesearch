"use client";
import { createContext, useContext, useReducer, useCallback } from 'react';
import { generateRecordId } from './scanner.js';

const initialState = {
  viewMode: 'citizen',
  scannedDevices: [],
  marketplaceListings: [],
  recyclingHistory: [],
  points: 0,
  badges: { predictor: false, recycler: false, seller: false },
  scanCount: 0,
  listCount: 0,
  recycleCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'ADD_SCANNED_DEVICE': {
      const device = {
        ...action.payload,
        scannedAt: new Date().toISOString(),
        scanId: `scan-${Date.now()}`,
        disposedComponents: [],
        markedForDisposal: false,
      };
      const scanCount = state.scanCount + 1;
      const points = state.points + 10;
      const badges = {
        ...state.badges,
        predictor: scanCount >= 1,
      };
      return {
        ...state,
        scannedDevices: [device, ...state.scannedDevices],
        points,
        badges,
        scanCount,
      };
    }

    case 'MARK_FOR_DISPOSAL': {
      return {
        ...state,
        scannedDevices: state.scannedDevices.map(d =>
          d.scanId === action.payload ? { ...d, markedForDisposal: true } : d
        ),
      };
    }

    case 'ADD_LISTING': {
      const listing = {
        ...action.payload,
        id: `listing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        listedAt: new Date().toISOString(),
        status: 'Active',
      };
      const listCount = state.listCount + 1;
      const points = state.points + 20;
      const badges = { ...state.badges, seller: listCount >= 1 };
      return {
        ...state,
        marketplaceListings: [listing, ...state.marketplaceListings],
        points,
        badges,
        listCount,
      };
    }

    case 'ADD_RECORD': {
      const record = {
        id: generateRecordId(),
        timestamp: new Date().toISOString(),
        deviceName: action.payload.deviceName,
        eprCategory: action.payload.eprCategory,
        component: action.payload.component,
        brandName: action.payload.brandName,
        geoTag: action.payload.geoTag || 'India',
        verified: true,
      };
      const recycleCount = state.recycleCount + 1;
      const points = state.points + 30;
      const badges = { ...state.badges, recycler: recycleCount >= 1 };
      return {
        ...state,
        recyclingHistory: [record, ...state.recyclingHistory],
        points,
        badges,
        recycleCount,
      };
    }

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setViewMode = useCallback((mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }), []);
  const addScannedDevice = useCallback((device) => dispatch({ type: 'ADD_SCANNED_DEVICE', payload: device }), []);
  const markForDisposal = useCallback((scanId) => dispatch({ type: 'MARK_FOR_DISPOSAL', payload: scanId }), []);
  const addListing = useCallback((listing) => dispatch({ type: 'ADD_LISTING', payload: listing }), []);
  const addRecord = useCallback((record) => dispatch({ type: 'ADD_RECORD', payload: record }), []);

  return (
    <StoreContext.Provider value={{ state, setViewMode, addScannedDevice, markForDisposal, addListing, addRecord }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
