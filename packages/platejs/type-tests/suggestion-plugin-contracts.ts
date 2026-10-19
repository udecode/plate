import {
  type AuthoredChange,
  AuthoredPlugin,
  type AuthoredResult,
} from 'platejs/authored';
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
  authored: { intent: 'propose' },
};
root.authored = { preview: 'accepted' };
root.authored = { intent: 'edit' };
root.authored = { preview: 'proposed' };
root.authored = { intent: 'propose' };
// @ts-expect-error An editable view shows the review tree; it takes no projection.
root.authored = { intent: 'propose', projection: 'markup' };

const authored = createEditor({ plugins: [AuthoredPlugin] }).plugin(
  AuthoredPlugin
);
const change = authored.read.change('change-id');

if (change) {
  authored.update.decide({
    action: 'accept',
    changes: [change],
  }) satisfies AuthoredResult;
  authored.update.decide([
    { action: 'accept', changes: [change] },
    { action: 'reject', changes: [change] },
  ]);
  // @ts-expect-error A decision names the changes it read, not their ids.
  authored.update.decide({ action: 'accept', changes: ['change-id'] });
  // @ts-expect-error A decision takes changes, not a selection.
  authored.update.decide({ action: 'reject', selection: change });
}

const plain = createEditor();
const plainRoot: EditorRootProps<typeof plain> = {
  editor: plain,
  children: null,
  // @ts-expect-error Authored view inputs require the authored capability.
  authored: { intent: 'propose' },
};
void plainRoot;
