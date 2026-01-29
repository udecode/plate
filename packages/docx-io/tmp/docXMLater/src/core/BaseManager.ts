/**
 * Base Manager class - provides common collection management functionality
 * This abstract class is used by all manager classes to reduce code duplication
 *
 * @template T - The type of items being managed
 * @template K - The type of the key (default: number | string)
 */
export abstract class BaseManager<T, K = number | string> {
  /** Internal storage for managed items */
  protected items: Map<K, T>;

  /**
   * Creates a new BaseManager instance
   */
  constructor() {
    this.items = new Map<K, T>();
  }

  /**
   * Adds an item to the collection
   *
   * @param id - Unique identifier for the item
   * @param item - The item to add
   * @returns This manager instance for chaining
   *
   * @example
   * ```typescript
   * manager.add('style1', style).add('style2', style2);
   * ```
   */
  add(id: K, item: T): this {
    this.items.set(id, item);
    return this;
  }

  /**
   * Retrieves an item by its ID
   *
   * @param id - The identifier of the item to retrieve
   * @returns The item if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const style = manager.get('Heading1');
   * if (style) {
   *   console.log('Found style:', style.name);
   * }
   * ```
   */
  get(id: K): T | undefined {
    return this.items.get(id);
  }

  /**
   * Checks if an item with the given ID exists
   *
   * @param id - The identifier to check
   * @returns True if the item exists, false otherwise
   *
   * @example
   * ```typescript
   * if (manager.has('Heading1')) {
   *   console.log('Heading1 style exists');
   * }
   * ```
   */
  has(id: K): boolean {
    return this.items.has(id);
  }

  /**
   * Removes an item from the collection
   *
   * @param id - The identifier of the item to remove
   * @returns True if the item was removed, false if it didn't exist
   *
   * @example
   * ```typescript
   * const removed = manager.remove('style1');
   * console.log('Was removed:', removed);
   * ```
   */
  remove(id: K): boolean {
    return this.items.delete(id);
  }

  /**
   * Gets all items in the collection
   *
   * @returns Array of all items
   *
   * @example
   * ```typescript
   * const allStyles = manager.getAll();
   * console.log(`Total: ${allStyles.length}`);
   * ```
   */
  getAll(): T[] {
    return Array.from(this.items.values());
  }

  /**
   * Gets all item IDs in the collection
   *
   * @returns Array of all IDs
   *
   * @example
   * ```typescript
   * const allIds = manager.getAllIds();
   * console.log('IDs:', allIds);
   * ```
   */
  getAllIds(): K[] {
    return Array.from(this.items.keys());
  }

  /**
   * Gets all entries (ID-item pairs) in the collection
   *
   * @returns Array of [id, item] tuples
   *
   * @example
   * ```typescript
   * for (const [id, item] of manager.getEntries()) {
   *   console.log(`${id}:`, item);
   * }
   * ```
   */
  getEntries(): [K, T][] {
    return Array.from(this.items.entries());
  }

  /**
   * Removes all items from the collection
   *
   * @returns This manager instance for chaining
   *
   * @example
   * ```typescript
   * manager.clear();
   * console.log('Count after clear:', manager.getCount()); // 0
   * ```
   */
  clear(): this {
    this.items.clear();
    return this;
  }

  /**
   * Gets the number of items in the collection
   *
   * @returns The count of items
   *
   * @example
   * ```typescript
   * console.log(`Total items: ${manager.getCount()}`);
   * ```
   */
  getCount(): number {
    return this.items.size;
  }

  /**
   * Checks if the collection is empty
   *
   * @returns True if empty, false otherwise
   *
   * @example
   * ```typescript
   * if (manager.isEmpty()) {
   *   console.log('No items in collection');
   * }
   * ```
   */
  isEmpty(): boolean {
    return this.items.size === 0;
  }

  /**
   * Iterates over all items in the collection
   *
   * @param callback - Function to call for each item
   *
   * @example
   * ```typescript
   * manager.forEach((item, id) => {
   *   console.log(`${id}:`, item);
   * });
   * ```
   */
  forEach(callback: (item: T, id: K) => void): void {
    this.items.forEach((item, id) => callback(item, id));
  }

  /**
   * Finds the first item that matches the predicate
   *
   * @param predicate - Function that returns true for the desired item
   * @returns The first matching item, or undefined if none found
   *
   * @example
   * ```typescript
   * const boldStyle = manager.find(style => style.formatting.bold === true);
   * ```
   */
  find(predicate: (item: T, id: K) => boolean): T | undefined {
    for (const [id, item] of this.items.entries()) {
      if (predicate(item, id)) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Filters items based on a predicate
   *
   * @param predicate - Function that returns true for items to include
   * @returns Array of items that match the predicate
   *
   * @example
   * ```typescript
   * const boldStyles = manager.filter(style => style.formatting.bold);
   * ```
   */
  filter(predicate: (item: T, id: K) => boolean): T[] {
    const results: T[] = [];
    for (const [id, item] of this.items.entries()) {
      if (predicate(item, id)) {
        results.push(item);
      }
    }
    return results;
  }

  /**
   * Maps items to a new array
   *
   * @param mapper - Function that transforms each item
   * @returns Array of transformed items
   *
   * @example
   * ```typescript
   * const styleNames = manager.map(style => style.name);
   * ```
   */
  map<U>(mapper: (item: T, id: K) => U): U[] {
    const results: U[] = [];
    for (const [id, item] of this.items.entries()) {
      results.push(mapper(item, id));
    }
    return results;
  }

  /**
   * Tests whether at least one item satisfies the predicate
   *
   * @param predicate - Function to test each item
   * @returns True if any item matches, false otherwise
   *
   * @example
   * ```typescript
   * const hasBold = manager.some(style => style.formatting.bold);
   * ```
   */
  some(predicate: (item: T, id: K) => boolean): boolean {
    for (const [id, item] of this.items.entries()) {
      if (predicate(item, id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tests whether all items satisfy the predicate
   *
   * @param predicate - Function to test each item
   * @returns True if all items match, false otherwise
   *
   * @example
   * ```typescript
   * const allCustom = manager.every(style => style.customStyle);
   * ```
   */
  every(predicate: (item: T, id: K) => boolean): boolean {
    for (const [id, item] of this.items.entries()) {
      if (!predicate(item, id)) {
        return false;
      }
    }
    return true;
  }
}
