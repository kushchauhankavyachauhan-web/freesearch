import DATASET from '../data/generateDataset.js';

// Hash-based fallback (used when AI can't classify)
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function scanFile(fileName, fileSize) {
  const key = fileName + String(fileSize);
  const index = hashString(key) % DATASET.length;
  return DATASET[index];
}

// Map ImageNet labels → our dataset categories
const LABEL_MAP = [
  { patterns: ['laptop', 'notebook computer', 'notebook'], category: 'Laptop' },
  { patterns: ['desktop computer', 'personal computer', 'desktop'], category: 'Desktop PC' },
  { patterns: ['cellular telephone', 'cellular phone', 'cellphone', 'mobile phone', 'smartphone', 'iphone', 'android phone'], category: 'Phone' },
  { patterns: ['television', 'tv ', 'television system', 'flat panel', 'plasma'], category: 'TV' },
  { patterns: ['monitor', 'screen', 'computer monitor', 'display'], category: 'Monitor' },
  { patterns: ['tablet', 'ipad', 'tablet computer'], category: 'Tablet' },
  { patterns: ['keyboard', 'computer keyboard', 'keypad'], category: 'Keyboard/Mouse' },
  { patterns: ['mouse, computer', 'computer mouse', 'mouse'], category: 'Keyboard/Mouse' },
  { patterns: ['printer', 'inkjet', 'laser printer'], category: 'Printer' },
  { patterns: ['router', 'modem', 'wifi'], category: 'Router' },
  { patterns: ['headphones', 'earphone', 'headset', 'earbud'], category: 'Earphones' },
  { patterns: ['wristwatch', 'digital watch', 'smartwatch'], category: 'Smartwatch' },
  { patterns: ['camera', 'digital camera', 'dslr', 'camcorder'], category: 'Camera' },
  { patterns: ['power bank', 'battery bank', 'portable charger'], category: 'Power Bank' },
  { patterns: ['electric fan', 'ceiling fan', 'fan'], category: 'Appliance' },
  { patterns: ['hard disk', 'hard drive', 'circuit board', 'printed circuit'], category: 'Circuit Board' },
];

export function mapLabelToCategory(label) {
  const lower = label.toLowerCase();
  for (const { patterns, category } of LABEL_MAP) {
    if (patterns.some(p => lower.includes(p))) return category;
  }
  return null;
}

export function getEntryByCategory(category, seed = 0) {
  const matches = DATASET.filter(d => d.category === category);
  if (!matches.length) return DATASET[seed % DATASET.length];
  return matches[seed % matches.length];
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
  return [...new Set(DATASET.map(d => d.brandName))].sort();
}

export function getDevicesByBrand(brand) {
  return DATASET.filter(d => d.brandName === brand);
}

export { DATASET };
