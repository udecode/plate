import { getPlateRuntime } from '@platejs/core/internal';
import { KEYS, TrailingBlockPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { DiscussionKit } from './discussion-kit';
import { suggestionPlugin, SuggestionKit } from './suggestion-kit';

const createSuggestionEditor = (
  plugins: NonNullable<
    NonNullable<Parameters<typeof createPlateEditor>[0]>['plugins']
  >
) =>
  createPlateEditor({
    plugins: [...DiscussionKit, ...(plugins ?? [])],
  });

const pluginKeys = (editor: Parameters<typeof getPlateRuntime>[0]) =>
  getPlateRuntime(editor).pluginList.map((plugin) => plugin.key);

describe('SuggestionKit', () => {
  it('keeps suggestion and trailing block independently composable', () => {
    const suggestionOnly = createSuggestionEditor(SuggestionKit);

    expect(pluginKeys(suggestionOnly)).toContain(KEYS.suggestion);
    expect(pluginKeys(suggestionOnly)).not.toContain(KEYS.trailingBlock);
    expect(suggestionOnly.plugin(suggestionPlugin).store.get()).toMatchObject({
      activeId: null,
      hoverId: null,
    });

    const trailingOnly = createPlateEditor({
      plugins: [TrailingBlockPlugin],
    });

    expect(pluginKeys(trailingOnly)).not.toContain(KEYS.suggestion);
    expect(pluginKeys(trailingOnly)).toContain(KEYS.trailingBlock);
    expect(
      trailingOnly.getPlugin(TrailingBlockPlugin).initialState.insert
    ).toBe(undefined);

    const both = createSuggestionEditor([
      ...SuggestionKit,
      TrailingBlockPlugin,
    ]);

    expect(pluginKeys(both)).toContain(KEYS.suggestion);
    expect(pluginKeys(both)).toContain(KEYS.trailingBlock);
    expect(typeof both.getPlugin(TrailingBlockPlugin).initialState.insert).toBe(
      'function'
    );
  });

  it('lets direct trailing-block configuration beat the weak suggestion override', () => {
    const insert = () => {};
    const editor = createSuggestionEditor([
      ...SuggestionKit,
      TrailingBlockPlugin.configure({
        initialState: { insert },
      }),
    ]);

    expect(editor.getPlugin(TrailingBlockPlugin).initialState.insert).toBe(
      insert
    );
  });
});
