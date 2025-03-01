export class PointerManager {
  readonly pointerPosition: {
    x: number;
    y: number;
  } = {
    x: 0,
    y: 0,
  };

  addEventListeners() {
    window.addEventListener("pointermove", this._handlePointerMove);
  }

  private _handlePointerMove = (e: PointerEvent) => {
    this.pointerPosition.x = e.clientX;
    this.pointerPosition.y = e.clientY;
  };

  removeEventListeners() {
    window.removeEventListener("pointermove", this._handlePointerMove);
  }
}
