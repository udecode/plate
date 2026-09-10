import type { Emoji, EmojiMartData } from '@emoji-mart/data';

/**
 * Index an emoji dataset for case-insensitive ID, name and keyword searches.
 * Each query returns an independent array ordered by exact ID, match position
 * and ID. Supply a result limit for a picker; an omitted limit returns all
 * matches. Recreate the search when replacing the dataset.
 */
export function createEmojiSearch(data: EmojiMartData) {
  const index = Object.values(data.emojis).map((emoji) => ({
    emoji,
    text: `${emoji.id},${emoji.name.split(' ').join(',')},${emoji.keywords.join(',')}`.toLowerCase(),
  }));

  return (
    input: string,
    { limit = Infinity }: { limit?: number } = {}
  ): Emoji[] => {
    const query = input.toLowerCase();

    if (!query) return [];

    const matches: Array<{ emoji: Emoji; score: number }> = [];

    for (const { emoji, text } of index) {
      const position = text.indexOf(query);

      if (position !== -1) {
        matches.push({
          emoji,
          score: emoji.id.toLowerCase() === query ? 0 : position + 1,
        });
      }
    }

    matches.sort(
      (a, b) => a.score - b.score || a.emoji.id.localeCompare(b.emoji.id)
    );

    return matches.slice(0, Math.max(0, limit)).map(({ emoji }) => emoji);
  };
}

export type { Emoji } from '@emoji-mart/data';
