/**
 * BookmarkManager - Manages bookmarks in a document
 *
 * Tracks all bookmarks, assigns unique IDs, and ensures name uniqueness.
 *
 * Per ECMA-376, bookmark IDs must be unique across ALL annotation types
 * in a document. Use setIdProvider() to connect to a centralized ID allocator.
 */

import { Bookmark } from './Bookmark';

/**
 * Type for the centralized ID provider callback.
 * Returns the next available annotation ID from a shared counter.
 */
export type IdProviderCallback = () => number;

/**
 * Type for callback to notify of existing IDs (for synchronization).
 * Called when registering an existing bookmark to keep the central counter in sync.
 */
export type IdExistsCallback = (existingId: number) => void;

/**
 * Manages document bookmarks
 */
export class BookmarkManager {
  private bookmarks: Map<string, Bookmark> = new Map();
  private nextId: number = 0;
  private idProvider: IdProviderCallback | null = null;
  private idExistsNotifier: IdExistsCallback | null = null;

  /**
   * Sets the centralized ID provider callback.
   * When set, IDs will be allocated from the centralized DocumentIdManager
   * instead of the local nextId counter.
   *
   * @param provider - Callback that returns the next available ID
   * @param existsNotifier - Optional callback to notify when existing IDs are found
   */
  setIdProvider(provider: IdProviderCallback, existsNotifier?: IdExistsCallback): void {
    this.idProvider = provider;
    this.idExistsNotifier = existsNotifier || null;
  }

  /**
   * Registers a bookmark with the manager
   * Assigns a unique ID and ensures name uniqueness
   * @param bookmark - Bookmark to register
   * @returns The registered bookmark (same instance)
   * @throws Error if a bookmark with the same name already exists
   */
  register(bookmark: Bookmark): Bookmark {
    const name = bookmark.getName();

    // Check for duplicate names
    if (this.bookmarks.has(name)) {
      throw new Error(
        `Bookmark with name "${name}" already exists. Bookmark names must be unique within a document.`
      );
    }

    // Assign unique ID - use centralized provider if available
    const id = this.idProvider ? this.idProvider() : this.nextId++;
    bookmark.setId(id);

    // Store bookmark
    this.bookmarks.set(name, bookmark);

    return bookmark;
  }

  /**
   * Registers an existing bookmark, preserving its ID
   * Used when loading documents to preserve original bookmark IDs and avoid collisions
   * @param bookmark - Bookmark with existing ID to register
   * @returns The registered bookmark (same instance)
   * @throws Error if a bookmark with the same name already exists
   */
  registerExisting(bookmark: Bookmark): Bookmark {
    const name = bookmark.getName();
    const existingId = bookmark.getId();

    // Check for duplicate names
    if (this.bookmarks.has(name)) {
      throw new Error(
        `Bookmark with name "${name}" already exists. Bookmark names must be unique within a document.`
      );
    }

    // Notify centralized ID manager about this existing ID
    if (this.idExistsNotifier) {
      this.idExistsNotifier(existingId);
    }

    // Also update local nextId to avoid collisions (for fallback)
    if (existingId >= this.nextId) {
      this.nextId = existingId + 1;
    }

    // Store bookmark (keep its existing ID)
    this.bookmarks.set(name, bookmark);

    return bookmark;
  }

  /**
   * Gets a bookmark by name
   * @param name - Bookmark name
   * @returns The bookmark, or undefined if not found
   */
  getBookmark(name: string): Bookmark | undefined {
    return this.bookmarks.get(name);
  }

  /**
   * Checks if a bookmark exists
   * @param name - Bookmark name
   * @returns True if the bookmark exists
   */
  hasBookmark(name: string): boolean {
    return this.bookmarks.has(name);
  }

  /**
   * Gets all bookmarks
   * @returns Array of all bookmarks
   */
  getAllBookmarks(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  /**
   * Gets the number of bookmarks
   * @returns Number of bookmarks
   */
  getCount(): number {
    return this.bookmarks.size;
  }

  /**
   * Removes a bookmark
   * @param name - Bookmark name
   * @returns True if the bookmark was removed
   */
  removeBookmark(name: string): boolean {
    return this.bookmarks.delete(name);
  }

  /**
   * Clears all bookmarks
   */
  clear(): void {
    this.bookmarks.clear();
    this.nextId = 0;
  }

  /**
   * Sets the next ID to be assigned
   * Used when loading documents to avoid ID collisions with existing bookmarks
   * @param id - The next ID value to use
   */
  setNextId(id: number): void {
    this.nextId = id;
  }

  /**
   * Gets a unique bookmark name by adding a suffix if needed
   * Ensures the returned name is always within the 40-character limit
   * @param baseName - Base name for the bookmark
   * @returns A unique bookmark name (max 40 characters)
   */
  getUniqueName(baseName: string): string {
    const maxLength = 40;

    if (!this.hasBookmark(baseName)) {
      return baseName;
    }

    // Try adding numbers until we find a unique name
    let counter = 1;
    while (counter <= 1000) {
      const suffix = `_${counter}`;

      // Truncate base name to leave room for suffix within 40-char limit
      const maxBase = maxLength - suffix.length;
      const truncatedBase =
        baseName.length > maxBase ? baseName.substring(0, maxBase) : baseName;

      const uniqueName = `${truncatedBase}${suffix}`;

      if (!this.hasBookmark(uniqueName)) {
        return uniqueName;
      }
      counter++;
    }

    throw new Error(
      `Could not generate unique bookmark name from base "${baseName}"`
    );
  }

  /**
   * Creates and registers a new bookmark with a unique name
   * @param name - Desired bookmark name
   * @returns The created and registered bookmark
   */
  createBookmark(name: string): Bookmark {
    const uniqueName = this.getUniqueName(name);
    const bookmark = Bookmark.create(uniqueName);
    return this.register(bookmark);
  }

  /**
   * Creates and registers a bookmark for a heading
   * Automatically generates a unique name from the heading text
   * @param headingText - The text of the heading
   * @returns The created and registered bookmark
   */
  createHeadingBookmark(headingText: string): Bookmark {
    const bookmark = Bookmark.createForHeading(headingText);
    const uniqueName = this.getUniqueName(bookmark.getName());
    bookmark.setName(uniqueName);
    return this.register(bookmark);
  }

  /**
   * Gets statistics about bookmarks
   * @returns Object with bookmark statistics
   */
  getStats(): {
    total: number;
    nextId: number;
    names: string[];
  } {
    return {
      total: this.bookmarks.size,
      nextId: this.nextId,
      names: Array.from(this.bookmarks.keys()),
    };
  }

  /**
   * Creates a new BookmarkManager
   * @returns New BookmarkManager instance
   */
  static create(): BookmarkManager {
    return new BookmarkManager();
  }
}
