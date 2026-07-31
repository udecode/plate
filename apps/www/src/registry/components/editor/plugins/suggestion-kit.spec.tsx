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

const pluginNames = (editor: Parameters<typeof getPlateRuntime>[0]) =>
  getPlateRuntime(editor).pluginList.map((plugin) => plugin.name);

describe('SuggestionKit', () => {
  it('keeps suggestion and trailing block independently composable', () => {
    const suggestionOnly = createSuggestionEditor(SuggestionKit);

    expect(pluginNames(suggestionOnly)).toContain(KEYS.suggestion);
    expect(pluginNames(suggestionOnly)).not.toContain(KEYS.trailingBlock);
    expect(suggestionOnly.plugin(suggestionPlugin).store.get()).toMatchObject({
      activeId: null,
      hoverId: null,
    });

    const trailingOnly = createPlateEditor({
      plugins: [TrailingBlockPlugin],
    });

    expect(pluginNames(trailingOnly)).not.toContain(KEYS.suggestion);
    expect(pluginNames(trailingOnly)).toContain(KEYS.trailingBlock);
    expect(
      trailingOnly.plugin(TrailingBlockPlugin).plugin.initialState.insert
    ).toBe(undefined);

    const both = createSuggestionEditor([
      ...SuggestionKit,
      TrailingBlockPlugin,
    ]);

    expect(pluginNames(both)).toContain(KEYS.suggestion);
    expect(pluginNames(both)).toContain(KEYS.trailingBlock);
    expect(
      typeof both.plugin(TrailingBlockPlugin).plugin.initialState.insert
    ).toBe('function');
  });

  it('lets direct trailing-block configuration beat the weak suggestion override', () => {
    const insert = () => {};
    const editor = createSuggestionEditor([
      ...SuggestionKit,
      TrailingBlockPlugin.configure({
        initialState: { insert },
      }),
    ]);

    expect(editor.plugin(TrailingBlockPlugin).plugin.initialState.insert).toBe(
      insert
    );
  });
});
