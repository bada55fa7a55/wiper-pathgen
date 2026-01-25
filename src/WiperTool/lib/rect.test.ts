import { describe, expect, it } from 'vitest';
import { CartesianRect } from './rect';

describe('CartesianRect', () => {
  it('containsRect returns true when the other rect is fully inside', () => {
    const outer = new CartesianRect(0, 0, 10, 10);
    const inner = new CartesianRect(2, 2, 4, 4);

    expect(outer.containsRect(inner)).toBe(true);
  });

  it('containsRect returns false when the other rect extends outside', () => {
    const outer = new CartesianRect(0, 0, 10, 10);
    const inner = new CartesianRect(-1, 2, 4, 4);

    expect(outer.containsRect(inner)).toBe(false);
  });

  it('containsRect returns true when edges are exactly aligned', () => {
    const outer = new CartesianRect(0, 0, 10, 10);
    const inner = new CartesianRect(0, 0, 10, 10);

    expect(outer.containsRect(inner)).toBe(true);
  });

  it('intersects returns true when rectangles overlap', () => {
    const a = new CartesianRect(0, 0, 10, 10);
    const b = new CartesianRect(5, 5, 10, 10);

    expect(a.intersects(b)).toBe(true);
  });

  it('intersects returns true when rectangles touch at an edge', () => {
    const a = new CartesianRect(0, 0, 10, 10);
    const b = new CartesianRect(10, 0, 5, 10);

    expect(a.intersects(b)).toBe(true);
  });

  it('intersects returns false when rectangles are separated', () => {
    const a = new CartesianRect(0, 0, 10, 10);
    const b = new CartesianRect(11, 0, 5, 10);

    expect(a.intersects(b)).toBe(false);
  });

  it('containsPoint returns true for points inside or on edges', () => {
    const rect = new CartesianRect(0, 0, 10, 10);

    expect(rect.containsPoint(0, 0)).toBe(true);
    expect(rect.containsPoint(10, 10)).toBe(true);
    expect(rect.containsPoint(5, 5)).toBe(true);
  });

  it('containsPoint returns false for points outside', () => {
    const rect = new CartesianRect(0, 0, 10, 10);

    expect(rect.containsPoint(-1, 0)).toBe(false);
    expect(rect.containsPoint(0, 11)).toBe(false);
  });

  it('returns correct edges for positive width and height', () => {
    const rect = new CartesianRect(2, 3, 10, 5);

    expect(rect.left).toBe(2);
    expect(rect.right).toBe(12);
    expect(rect.bottom).toBe(3);
    expect(rect.top).toBe(8);
  });

  it('returns correct edges for negative width', () => {
    const rect = new CartesianRect(10, 3, -6, 5);

    expect(rect.left).toBe(4);
    expect(rect.right).toBe(10);
    expect(rect.bottom).toBe(3);
    expect(rect.top).toBe(8);
  });

  it('returns correct edges for negative height', () => {
    const rect = new CartesianRect(2, 10, 6, -4);

    expect(rect.left).toBe(2);
    expect(rect.right).toBe(8);
    expect(rect.bottom).toBe(6);
    expect(rect.top).toBe(10);
  });

  it('returns correct edges for negative width and height', () => {
    const rect = new CartesianRect(10, 10, -6, -4);

    expect(rect.left).toBe(4);
    expect(rect.right).toBe(10);
    expect(rect.bottom).toBe(6);
    expect(rect.top).toBe(10);
  });
});
