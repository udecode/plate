import { getPlateRuntime } from '@platejs/core/internal';
import { type BasePluginInput, PLUGINS, TrailingBlockPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { DiscussionKit } from './discussion';
import { suggestionPlugin, SuggestionKit } from './suggestion';

const createSuggestionEditor = <const P extends readonly BasePluginInput[]>(
  plugins: P
) =>
  createPlateEditor({
    plugins: [...DiscussionKit, ...(plugins ?? [])],
  });

const names = (editor: Parameters<typeof getPlateRuntime>[0]) =>
  getPlateRuntime(editor).pluginList.map((plugin) => plugin.name);

describe('SuggestionKit', () => {
  it('keeps suggestion and trailing block independently composable', () => {
    const suggestionOnly = createSuggestionEditor(SuggestionKit);

    expect(names(suggestionOnly)).toContain(PLUGINS.suggestion);
    expect(names(suggestionOnly)).not.toContain(PLUGINS.trailingBlock);
    expect(suggestionOnly.plugin(suggestionPlugin).store.get()).toMatchObject({
      activeId: null,
      hoverId: null,
    });

    const trailingOnly = createPlateEditor({
      plugins: [TrailingBlockPlugin],
    });

    expect(names(trailingOnly)).not.toContain(PLUGINS.suggestion);
    expect(names(trailingOnly)).toContain(PLUGINS.trailingBlock);
    expect(trailingOnly.plugin(TrailingBlockPlugin).initialState.insert).toBe(
      undefined
    );

    const both = createSuggestionEditor([
      ...SuggestionKit,
      TrailingBlockPlugin,
    ]);

    expect(names(both)).toContain(PLUGINS.suggestion);
    expect(names(both)).toContain(PLUGINS.trailingBlock);
    expect(typeof both.plugin(TrailingBlockPlugin).initialState.insert).toBe(
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

    expect(editor.plugin(TrailingBlockPlugin).initialState.insert).toBe(insert);
  });
});
