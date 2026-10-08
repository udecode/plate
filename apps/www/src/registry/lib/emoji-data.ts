'use client';

import {
  defaultEmojiDataResolver,
  type EmojiData,
  type EmojiDataResolver,
  type EmojiDetails,
} from 'frimousse';
import * as React from 'react';

/**
 * To self-host, serve `en/data.json` and `en/messages.json`, which frimousse
 * reads, and `en/shortcodes/github.json` from this Emojibase release, then
 * point this URL at them.
 */
const EMOJIBASE_URL = 'https://cdn.jsdelivr.net/npm/emojibase-data@17.0.0';
const SHORTCODES_KEY = `plate:emoji-shortcodes:v1:${EMOJIBASE_URL}`;
const TRAILING_COLON = /:$/;
// Shortcode files key emoji by hexcode, frimousse keeps only the glyph, and
// the two disagree on variation selectors, so both sides drop them.
const VARIATION_SELECTORS = /[\uFE0E\uFE0F]/gu;

/** An Emojibase emoji with the GitHub shortcodes people type after `:`. */
export type EmojiEntry = EmojiDetails & { shortcodes: readonly string[] };

type EmojiCatalog = EmojiData & { emojis: EmojiEntry[] };

type EmojiStatus = 'failed' | 'loading' | 'ready';

const glyphFromHexcode = (hexcode: string) =>
  String.fromCodePoint(
    ...hexcode.split('-').map((code) => Number.parseInt(code, 16))
  ).replace(VARIATION_SELECTORS, '');

function parseShortcodes(text: string) {
  const value: unknown = JSON.parse(text);

  if (typeof value !== 'object' || value === null) return null;

  const shortcodes = new Map<string, readonly string[]>();

  for (const [hexcode, codes] of Object.entries(value)) {
    if (typeof codes === 'string') {
      shortcodes.set(glyphFromHexcode(hexcode), [codes]);
    } else if (
      Array.isArray(codes) &&
      codes.every((code) => typeof code === 'string')
    ) {
      shortcodes.set(glyphFromHexcode(hexcode), codes);
    } else {
      return null;
    }
  }

  return shortcodes.size > 0 ? shortcodes : null;
}

function readStoredShortcodes() {
  try {
    const stored = localStorage.getItem(SHORTCODES_KEY);

    return stored ? parseShortcodes(stored) : null;
  } catch {
    return null;
  }
}

async function loadShortcodes() {
  const stored = readStoredShortcodes();

  if (stored) return stored;

  const response = await fetch(`${EMOJIBASE_URL}/en/shortcodes/github.json`);

  if (!response.ok) {
    throw new Error(`Emoji shortcodes failed to load (${response.status}).`);
  }

  const text = await response.text();
  const shortcodes = parseShortcodes(text);

  if (!shortcodes) throw new Error('Emoji shortcodes are malformed.');

  try {
    localStorage.setItem(SHORTCODES_KEY, text);
  } catch {
    // Blocked or full storage only costs a refetch on the next page load.
  }

  return shortcodes;
}

let catalog: EmojiCatalog | undefined;
let pending: Promise<EmojiCatalog> | undefined;
let status: EmojiStatus = 'loading';
const listeners = new Set<() => void>();

const setStatus = (next: EmojiStatus) => {
  status = next;
  listeners.forEach((listener) => listener());
};

/**
 * frimousse caches Emojibase in localStorage and drops emoji the device
 * cannot draw, so only the shortcodes need a cache of their own.
 */
function loadEmojis() {
  if (!pending) {
    if (status === 'failed') setStatus('loading');

    pending = Promise.all([
      defaultEmojiDataResolver('en', { emojibaseUrl: EMOJIBASE_URL }),
      loadShortcodes(),
    ]).then(([data, shortcodes]) => ({
      ...data,
      emojis: data.emojis.map((emoji) => ({
        ...emoji,
        shortcodes:
          shortcodes.get(emoji.emoji.replace(VARIATION_SELECTORS, '')) ?? [],
      })),
    }));
    pending.then(
      (loaded) => {
        catalog = loaded;
        setStatus('ready');
      },
      () => {
        pending = undefined;
        setStatus('failed');
      }
    );
  }

  return pending;
}

/** The data source for frimousse pickers, shared with the `:` popup. */
export const resolveEmojiData: EmojiDataResolver = () => loadEmojis();

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

/**
 * Loads the shared emoji list for a non-null query and returns its status and
 * the ranked matches. After a failure, each new query retries the load.
 */
export function useEmojiSearch(query: string | null) {
  const current = React.useSyncExternalStore(
    subscribe,
    () => status,
    () => 'loading' as const
  );
  const results = React.useMemo(
    () =>
      current === 'ready' && catalog && query
        ? searchEmojis(catalog.emojis, query)
        : [],
    [current, query]
  );

  React.useEffect(() => {
    if (query !== null) void loadEmojis();
  }, [query]);

  return { results, status: current };
}

type IndexedEntry = {
  entry: EmojiEntry;
  shortcodes: readonly string[];
  text: string;
  words: readonly string[];
};

const indexes = new WeakMap<readonly EmojiEntry[], IndexedEntry[]>();

function getIndex(entries: readonly EmojiEntry[]) {
  let index = indexes.get(entries);

  if (!index) {
    index = entries.map((entry) => {
      const label = entry.label.toLowerCase();
      const shortcodes = entry.shortcodes.map((code) => code.toLowerCase());

      return {
        entry,
        shortcodes,
        text: [label, ...entry.tags, ...shortcodes].join('\n').toLowerCase(),
        words: label.split(' '),
      };
    });
    indexes.set(entries, index);
  }

  return index;
}

// Among shortcode prefixes the shortest wins, so the top result stays put
// while the query grows toward it: `smil` ranks `smile` before `smiley`.
const rank = ({ shortcodes, text, words }: IndexedEntry, query: string) => {
  if (!text.includes(query)) return null;
  if (shortcodes.includes(query)) return { length: 0, rank: 0 };

  let shortest = Infinity;

  for (const code of shortcodes) {
    if (code.startsWith(query)) shortest = Math.min(shortest, code.length);
  }

  if (shortest !== Infinity) return { length: shortest, rank: 1 };
  if (words.some((word) => word.startsWith(query))) {
    return { length: 0, rank: 2 };
  }

  return { length: 0, rank: 3 };
};

/**
 * Ranks entries for a query typed after `:` or in a picker: an exact
 * shortcode, then the shortest shortcode with the query as prefix, then a
 * label word prefix, then any substring of the label, tags or shortcodes. One
 * trailing `:` is ignored, and at most 60 results come back.
 */
export function searchEmojis(
  entries: readonly EmojiEntry[],
  query: string
): EmojiEntry[] {
  const search = query.toLowerCase().replace(TRAILING_COLON, '');

  if (!search) return [];

  const index = getIndex(entries);
  const matches: Array<{
    entry: EmojiEntry;
    length: number;
    order: number;
    rank: number;
  }> = [];

  for (let order = 0; order < index.length; order++) {
    const ranked = rank(index[order], search);

    if (ranked) matches.push({ entry: index[order].entry, order, ...ranked });
  }

  matches.sort(
    (a, b) => a.rank - b.rank || a.length - b.length || a.order - b.order
  );

  return matches.slice(0, 60).map((match) => match.entry);
}
