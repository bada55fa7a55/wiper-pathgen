export function invariant<T>(condition: T, message?: string): asserts condition {
  if (condition) {
    return;
  }
  throw new Error(`Invariant violation${message ? `: ${message}` : ''}`);
}
