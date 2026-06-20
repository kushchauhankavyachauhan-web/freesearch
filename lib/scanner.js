
import DATASET from '../data/generateDataset.js';

// Hash file name + size to deterministically pick a dataset entry
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & hash; // 32-bit int
  }
  return Math.abs(hash);
}

export function scanFile(fileName, fileSize) {
  const key = fileName + String(fileSize);
  const index = hashString(key) % DATASET.length;
  return DATASET[index];
}

export function getStatus(monthsRemaining) {
  if (monthsRemaining >= 18) return 'Healthy';
  if (monthsRemaining >= 6) return 'Aging';
  return 'Replace Soon';
}

export function getStatusColor(status) {
  if (status === 'Healthy') return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' };
  if (status === 'Aging') return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' };
}

export function getHazardColor(hazard) {
  if (hazard === 'Low') return { bg: 'bg-green-100', text: 'text-green-700' };
  if (hazard === 'Medium') return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
  return { bg: 'bg-red-100', text: 'text-red-700' };
}

export function generateRecordId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'EPR-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function getUniqueBrands() {
  const brands = [...new Set(DATASET.map(d => d.brandName))].sort();
  return brands;
}

export function getDevicesByBrand(brand) {
  return DATASET.filter(d => d.brandName === brand);
}

export { DATASET };
