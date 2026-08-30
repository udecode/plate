import type { EditorEffect } from '../interfaces/editor';
import { defineEffect } from './transaction-values';

export const SCREEN_READER_ANNOUNCEMENT_EFFECT_KEY =
  'plite.screen-reader-announcement';

/**
 * Local, ephemeral screen-reader text emitted by an application command.
 *
 * Applications own localization and wording. React hosts consume the effect;
 * headless editors retain it only on the commit that emitted it.
 */
export const screenReaderAnnouncementEffect = defineEffect<string>({
  collab: 'local',
  history: 'skip',
  key: SCREEN_READER_ANNOUNCEMENT_EFFECT_KEY,
});

export const getScreenReaderAnnouncements = (
  effects: readonly EditorEffect[]
): readonly string[] =>
  effects.flatMap((effect) =>
    effect.type.key === SCREEN_READER_ANNOUNCEMENT_EFFECT_KEY &&
    typeof effect.value === 'string' &&
    effect.value.trim().length > 0
      ? [effect.value]
      : []
  );
