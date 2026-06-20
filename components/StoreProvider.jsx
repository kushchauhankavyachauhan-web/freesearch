"use client";
import { StoreProvider as SP } from '../lib/store.js';
export default function StoreProvider({ children }) {
  return <SP>{children}</SP>;
}
