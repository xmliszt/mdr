"use client";

import { create } from "zustand";

export type BinDataMetrics = {
  wo: number;
  fc: number;
  dr: number;
  ma: number;
};

export class BinData {
  readonly store = create<BinDataMetrics>(() => ({
    wo: 0,
    fc: 0,
    dr: 0,
    ma: 0,
  }));

  constructor(readonly label: string) {}

  increment(metrics: Partial<BinDataMetrics>) {
    this.store.setState((state) => ({
      ...state,
      ...metrics,
    }));
  }
}
