import { FootnotePlugin } from '../src/react/features/footnote/FootnotePlugin';
import { NavigationFeedbackPlugin } from '../src/react/plugins/navigation-feedback/NavigationFeedbackPlugin';
import { useEditor, useEditorPlugin } from '../src/react/stores';

export function NavigationFeedbackContracts() {
  const editor = useEditor();
  const navigation = useEditorPlugin(NavigationFeedbackPlugin);
  const footnote = useEditorPlugin(FootnotePlugin);
  const key = editor.key([0]);
  if (!key) return null;

  const flashed: boolean = navigation.api.flashTarget({
    key,
    attributes: {
      className: 'target',
      style: { opacity: 0.5 },
      'aria-label': 'Destination',
      'data-destination': 'heading',
    },
    duration: 1200,
  });
  const cleared: boolean = navigation.api.clear();
  const focused: boolean = footnote.api.focusDefinition({ ref: '1' });
  const returned: boolean = footnote.api.focusReference({ ref: '1', index: 1 });
  void [flashed, cleared, focused, returned];

  // @ts-expect-error Live node keys cannot be constructed from arbitrary strings.
  navigation.api.flashTarget({ key: 'heading-id' });
  // @ts-expect-error Presentation does not install event handlers.
  navigation.api.flashTarget({ key, attributes: { onClick: () => {} } });
  // @ts-expect-error Presentation does not own renderer refs.
  navigation.api.flashTarget({ key, attributes: { ref: () => {} } });
  navigation.api.flashTarget({
    key,
    attributes: {
      // @ts-expect-error Presentation cannot inject HTML.
      dangerouslySetInnerHTML: { __html: '' },
    },
  });
  return null;
}
