export function failInvariant(message: string): never {
  throw new Error(`Plite invariant failed: ${message}`);
}
