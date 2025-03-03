"use client";

import { throttle } from "lodash";

export class PointerManager {
  readonly pointerPosition: {
    x: number;
    y: number;
  } = {
    x: 0,
    y: 0,
  };

  addEventListeners() {
    window.addEventListener("pointermove", this._handlePointerMoveThrottled);
  }
  private _handlePointerMove = (e: PointerEvent) => {
    this.pointerPosition.x = e.clientX;
    this.pointerPosition.y = e.clientY;
  };

  private _handlePointerMoveThrottled = throttle(this._handlePointerMove, 100);

  removeEventListeners() {
    window.removeEventListener("pointermove", this._handlePointerMoveThrottled);
  }
}
