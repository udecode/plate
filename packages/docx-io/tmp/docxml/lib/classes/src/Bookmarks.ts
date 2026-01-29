import { NumberMap } from './NumberMap.ts';

export type Bookmark = {
	id: number;
	name: string;
};
export class Bookmarks {
	#bookmarks = new NumberMap<string | null>(0);

	/**
	 * Marks a unique identifier as taken.
	 *
	 * @todo When loading an existing document, bookmarks are not registered from it yet.
	 */
	public registerIdentifier(id: number, name?: string) {
		if (this.#bookmarks.has(id)) {
			throw new Error(`Bookmark with identifier "${id}" already exists.`);
		}
		this.#bookmarks.set(id, name || null);
	}

	/**
	 * Create a unique ID and name for a new bookmark.
	 *
	 * @remarks
	 * Not using a GUID because this causes Word to not make the link clickable. A much shorter
	 * identifier works as expected.
	 */
	public create(): Bookmark {
		const id = this.#bookmarks.getNextAvailableKey();
		const name = `__docxml_bookmark_${id}`;
		this.registerIdentifier(id);
		return { id, name };
	}
}
