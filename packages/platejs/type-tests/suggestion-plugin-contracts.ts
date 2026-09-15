import type { AuthoredChange } from 'platejs/authored';
import { createEditor, type EditorRootProps } from 'platejs/react';
import { BaseSuggestionPlugin } from 'platejs/suggestion';
import {
  SuggestionPlugin,
  useActiveSuggestion,
  useSuggestionChanges,
  useSuggestionMode,
} from 'platejs/suggestion/react';

const headless = createEditor({
  initialValue: [{ children: [{ text: 'Document' }], type: 'paragraph' }],
  plugins: [BaseSuggestionPlugin],
});
const suggestion = headless.plugin(BaseSuggestionPlugin);

suggestion.api.setMode('suggesting');
suggestion.api.setMode('editing');
suggestion.read.mode() satisfies 'editing' | 'suggesting';

// @ts-expect-error Suggestion exposes only the common editing and suggesting modes.
suggestion.api.setMode('review');

const react = createEditor({
  initialValue: [{ children: [{ text: 'Document' }], type: 'paragraph' }],
  plugins: [SuggestionPlugin],
});

react.plugin(SuggestionPlugin).api.setMode('suggesting');
react.plugin(SuggestionPlugin).read.mode() satisfies 'editing' | 'suggesting';

function SuggestionHooksContract() {
  useSuggestionMode() satisfies 'editing' | 'suggesting';
  useSuggestionChanges([0]) satisfies readonly AuthoredChange[];

  const active = useActiveSuggestion();
  active.activeId satisfies string | null;
  active.setActiveId('change-id');
  active.setActiveId(null);
  return null;
}
void SuggestionHooksContract;

const root: EditorRootProps<typeof react> = {
  editor: react,
  children: null,
  authored: { intent: 'propose', projection: 'markup' },
};
root.authored = { intent: 'edit', projection: 'accepted' };
root.authored = { intent: 'propose', projection: 'proposed' };
// @ts-expect-error Editing uses the accepted projection.
root.authored = { intent: 'edit', projection: 'markup' };
// @ts-expect-error Proposing requires a proposal projection.
root.authored = { intent: 'propose', projection: 'accepted' };

const plain = createEditor();
const plainRoot: EditorRootProps<typeof plain> = {
  editor: plain,
  children: null,
  // @ts-expect-error Authored view inputs require the authored capability.
  authored: { intent: 'propose', projection: 'markup' },
};
void plainRoot;
