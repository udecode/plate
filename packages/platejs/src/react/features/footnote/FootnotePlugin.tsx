import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../../features/footnote/lib';
import { getFootnoteTarget } from '../../../features/footnote/lib/internal/getFootnoteTarget';
import { NavigationFeedbackPlugin, toReactPlugin } from '../../core';

export const FootnoteDefinitionPlugin = toReactPlugin(
  BaseFootnoteDefinitionPlugin
);

export const FootnotePlugin = toReactPlugin(BaseFootnotePlugin).extend({
  api: ({ editor, update }) => {
    const jump = (
      readOnly: boolean,
      target: ReturnType<typeof getFootnoteTarget> | false
    ) => {
      if (!target) return false;

      if (!readOnly) editor.api.dom.focus();
      editor.api.dom.scrollIntoView(target.point);
      const key = editor.key(target.targetPath);
      const navigation = editor.plugin(NavigationFeedbackPlugin);
      if (key && navigation.installed) navigation.api.flashTarget({ key });
      return true;
    };

    return {
      focusDefinition: ({ ref }: { ref: string }) => {
        if (!editor.api.dom.root()) return false;
        if (!editor.read.view.isReadOnly()) {
          return jump(false, update.selectDefinition({ ref }));
        }

        const definition = editor
          .plugin(BaseFootnotePlugin)
          .read.definition({ ref });

        return jump(
          true,
          editor.read((state) =>
            getFootnoteTarget(state, definition?.[1], 'definition')
          )
        );
      },
      focusReference: ({ ref, index = 0 }: { ref: string; index?: number }) => {
        if (!editor.api.dom.root()) return false;
        if (!editor.read.view.isReadOnly()) {
          return jump(false, update.selectReference({ ref, index }));
        }

        const reference = editor
          .plugin(BaseFootnotePlugin)
          .read.references({ ref })[index];

        return jump(
          true,
          editor.read((state) =>
            getFootnoteTarget(state, reference?.[1], 'reference')
          )
        );
      },
    };
  },
});
