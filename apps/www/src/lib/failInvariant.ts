export function failInvariant(message: string): never {
  throw new Error(`Invariant failed: ${message}`);
}
