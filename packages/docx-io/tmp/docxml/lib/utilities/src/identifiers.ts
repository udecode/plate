/**
 * Create a unique not-so-random identifier.
 *
 * @todo maybe make it really random some time.
 */
export function createRandomId(prefix = 'id'): string {
	return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

let uniqueNumericIdentifiers = 0;
export function createUniqueNumericIdentifier(): number {
	return ++uniqueNumericIdentifiers;
}
