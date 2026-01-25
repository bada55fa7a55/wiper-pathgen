export type CartesianRectInit = Partial<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type CartesianRectJSON = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/*
  y ^
    |
    |
    +---------> x
   (0,0)

  Cartesian rect. 0,0 is at the bottom left.
*/
export class CartesianRect {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get left(): number {
    return Math.min(this.x, this.x + this.width);
  }

  get right(): number {
    return Math.max(this.x, this.x + this.width);
  }

  get top(): number {
    return Math.max(this.y, this.y + this.height);
  }

  get bottom(): number {
    return Math.min(this.y, this.y + this.height);
  }

  toJSON(): CartesianRectJSON {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left,
    };
  }

  static fromRect(init: CartesianRectInit = {}): CartesianRect {
    return new CartesianRect(init.x ?? 0, init.y ?? 0, init.width ?? 0, init.height ?? 0);
  }

  static fromMinMax(minX: number, minY: number, maxX: number, maxY: number): CartesianRect {
    return new CartesianRect(minX, minY, maxX - minX, maxY - minY);
  }

  static fromPoints(points: Point[]): CartesianRect {
    if (points.length === 0) {
      return new CartesianRect();
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i += 1) {
      const { x, y } = points[i];
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }

    return CartesianRect.fromMinMax(minX, minY, maxX, maxY);
  }

  clone(): CartesianRect {
    return new CartesianRect(this.x, this.y, this.width, this.height);
  }

  scale(scale: number) {
    this.x *= scale;
    this.y *= scale;
    this.width *= scale;
    this.height *= scale;

    return this;
  }

  shift(shift: Point) {
    this.x += shift.x;
    this.y += shift.y;

    return this;
  }

  containsPoint(px: number, py: number): boolean {
    return px >= this.left && px <= this.right && py >= this.bottom && py <= this.top;
  }

  intersects(other: CartesianRect): boolean {
    return !(this.right < other.left || this.left > other.right || this.top < other.bottom || this.bottom > other.top);
  }

  containsRect(other: CartesianRect): boolean {
    return other.left >= this.left && other.right <= this.right && other.bottom >= this.bottom && other.top <= this.top;
  }
}

import type { Point } from './geometry';
