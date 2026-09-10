import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnotePlugin,
} from '../../../features/footnote/lib';
import { NavigationFeedbackPlugin, toPlatePlugin } from '../../core';

export const FootnoteDefinitionPlugin = toPlatePlugin(
  BaseFootnoteDefinitionPlugin
);

export const FootnoteInputPlugin = toPlatePlugin(BaseFootnoteInputPlugin);

export const FootnotePlugin = toPlatePlugin(BaseFootnotePlugin, {
  dependencies: [FootnoteInputPlugin],
}).extend({
  api: ({ editor, update }) => ({
    focusDefinition: ({ ref }: { ref: string }) => {
      if (!editor.api.dom.root() || editor.read.view.isReadOnly()) return false;
      const target = update.selectDefinition({ ref });

      if (!target) return false;

      editor.api.dom.focus();
      editor.api.dom.scrollIntoView(target.point);
      const key = editor.key(target.targetPath);
      const navigation = editor.plugin(NavigationFeedbackPlugin);
      if (key && navigation.installed) navigation.api.flashTarget({ key });
      return true;
    },
    focusReference: ({ ref, index = 0 }: { ref: string; index?: number }) => {
      if (!editor.api.dom.root() || editor.read.view.isReadOnly()) return false;
      const target = update.selectReference({ ref, index });

      if (!target) return false;

      editor.api.dom.focus();
      editor.api.dom.scrollIntoView(target.point);
      const key = editor.key(target.targetPath);
      const navigation = editor.plugin(NavigationFeedbackPlugin);
      if (key && navigation.installed) navigation.api.flashTarget({ key });
      return true;
    },
  }),
});
