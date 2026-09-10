import { type BasePluginInput, TrailingBlockPlugin } from 'platejs';
import { createEditor } from 'platejs/react';

import { suggestionPlugin, SuggestionKit } from './suggestion';

const createSuggestionEditor = <const P extends readonly BasePluginInput[]>(
  plugins: P
) =>
  createEditor({
    plugins,
  });

describe('SuggestionKit', () => {
  it('keeps suggestion and trailing block independently composable', () => {
    const suggestionOnly = createSuggestionEditor(SuggestionKit);

    expect(suggestionOnly.plugin(suggestionPlugin).installed).toBe(true);
    expect(suggestionOnly.plugin(TrailingBlockPlugin).installed).toBe(false);
    expect(suggestionOnly.plugin(suggestionPlugin).store.get()).toMatchObject({
      activeId: null,
    });

    const trailingOnly = createEditor({
      plugins: [TrailingBlockPlugin],
    });

    expect(trailingOnly.plugin(suggestionPlugin).installed).toBe(false);
    expect(trailingOnly.plugin(TrailingBlockPlugin).installed).toBe(true);
    expect(
      trailingOnly.plugin(TrailingBlockPlugin).initialState.insert
    ).toBeNull();

    const both = createSuggestionEditor([
      ...SuggestionKit,
      TrailingBlockPlugin,
    ]);

    expect(both.plugin(suggestionPlugin).installed).toBe(true);
    expect(both.plugin(TrailingBlockPlugin).installed).toBe(true);
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
