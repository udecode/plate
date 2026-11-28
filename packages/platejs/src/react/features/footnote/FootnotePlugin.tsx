import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../../features/footnote/lib';
import { getFootnoteTarget } from '../../../features/footnote/lib/internal/getFootnoteTarget';
import { NavigationFeedbackPlugin, toReactPlugin } from '../../core';

export const FootnoteDefinitionPlugin = toReactPlugin(
  BaseFootnoteDefinitionPlugin
);

export const FootnotePlugin = toReactPlugin(BaseFootnotePlugin, {
  dependencies: [FootnoteDefinitionPlugin],
}).extend({
  api: ({ editor, update }) => {
    const jump = (
      readOnly: boolean,
      target: ReturnType<typeof getFootnoteTarget>
    ) => {
      if (!target) return false;

      if (!readOnly) editor.api.dom.focus();
      editor.api.dom.scrollIntoView(target.point);
      const key = editor.key(target.targetPath);
      const navigation = editor.plugin(NavigationFeedbackPlugin);
      if (key && navigation.installed) navigation.api.flashTarget({ key });
      return true;
    };
    const readTarget = (
      kind: 'definition' | 'reference',
      ref: string,
      index = 0
    ) => {
      const { read } = editor.plugin(BaseFootnotePlugin);
      const entry =
        kind === 'definition'
          ? read.definition({ ref })
          : read.references({ ref })[index];

      return editor.read((state) => getFootnoteTarget(state, entry?.[1], kind));
    };

    return {
      focusDefinition: ({ ref }: { ref: string }) => {
        if (!editor.api.dom.root()) return false;
        const readOnly = editor.read.view.isReadOnly();
        if (!readOnly && !update.selectDefinition({ ref })) return false;

        return jump(readOnly, readTarget('definition', ref));
      },
      focusReference: ({ ref, index = 0 }: { ref: string; index?: number }) => {
        if (!editor.api.dom.root()) return false;
        const readOnly = editor.read.view.isReadOnly();
        if (!readOnly && !update.selectReference({ ref, index })) return false;

        return jump(readOnly, readTarget('reference', ref, index));
      },
    };
  },
});
