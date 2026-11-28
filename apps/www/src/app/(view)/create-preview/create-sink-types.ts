import type { EmojiDataResolver } from 'frimousse';
import type { PluginReference } from 'platejs';
import type * as React from 'react';

import type {
  SinkEmojiPick,
  SinkKit,
  SinkSelectItem,
} from '@/components/sink/sink-types';

export type {
  SinkEmojiPick,
  SinkSelectItem,
} from '@/components/sink/sink-types';

export type CreateSinkKit = SinkKit & {
  codePlugins: readonly PluginReference[];
  columnTocPlugins: readonly PluginReference[];
  footnotePlugins: readonly PluginReference[];
  mathPlugins: readonly PluginReference[];
  mediaPlugins: readonly PluginReference[];
  resolveEmojiData: EmojiDataResolver;
  SelectEditor: React.ComponentType<{
    className?: string;
    defaultValue?: readonly SinkSelectItem[];
    items?: readonly SinkSelectItem[];
    placeholder?: string;
  }>;
  tablePlugins: readonly PluginReference[];
  useEmojiSearch: (query: string) => {
    results: readonly SinkEmojiPick[];
    status: 'failed' | 'loading' | 'ready';
  };
};
