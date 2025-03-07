"use client";

import { create } from "zustand";

type PointerState = {
  x: number;
  y: number;
  gridRect: DOMRect | null;
};

export class PointerManager {
  readonly store = create<PointerState>(() => ({
    x: 0,
    y: 0,
    gridRect: null,
  }));

  updatePointerPosition(x: number, y: number) {
    this.store.setState({ x, y });
  }

  updateGridRect(rect: DOMRect) {
    this.store.setState({ gridRect: rect });
  }

  addEventListeners() {
    // We'll handle pointer events in the PointerInteractionTrap component
  }

  removeEventListeners() {
    // We'll handle pointer events in the PointerInteractionTrap component
  }
}
