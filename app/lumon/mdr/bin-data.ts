"use client";

import { create } from "zustand";

export type BinDataMetrics = {
  wo: number;
  fc: number;
  dr: number;
  ma: number;
};

export class BinData {
  readonly binId: string;
  readonly store = create<BinDataMetrics>(() => ({
    wo: 0,
    fc: 0,
    dr: 0,
    ma: 0,
  }));

  constructor(readonly label: string) {
    this.binId = `bin_${label}`;
  }

  increment(metrics: Partial<BinDataMetrics>) {
    this.store.setState((state) => ({
      ...state,
      wo: Math.min(1, state.wo + (metrics.wo ?? 0)),
      fc: Math.min(1, state.fc + (metrics.fc ?? 0)),
      dr: Math.min(1, state.dr + (metrics.dr ?? 0)),
      ma: Math.min(1, state.ma + (metrics.ma ?? 0)),
    }));
  }

  get binElement() {
    return document.getElementById(this.binId);
  }
}
