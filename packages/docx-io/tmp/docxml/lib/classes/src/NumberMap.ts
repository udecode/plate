/**
 * A special kind of map that makes it easy to store items by a number, automatically ensuring that
 * these identifiers increment and don't collide.
 */
export class NumberMap<Generic> extends Map<number, Generic> {
	#start: number;
	constructor(start = 0) {
		super();
		this.#start = start;
	}
	public getNextAvailableKey(): number {
		let i = this.#start;
		while (this.has(i)) {
			++i;
		}
		return i;
	}

	/**
	 * Add new data to the map, and return the new unique key.
	 */
	public add(data: Generic): number {
		const key = this.getNextAvailableKey();
		this.set(key, data);
		return key;
	}

	/**
	 * Get all values in an array.
	 */
	public array(): Array<Generic> {
		return Array.from(this.values());
	}
}
