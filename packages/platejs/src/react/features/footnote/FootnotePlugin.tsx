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
  dependencies: [FootnoteInputPlugin, NavigationFeedbackPlugin],
}).extend(({ plugin }) => ({
  update: ({ tx }) => ({
    focusDefinition: ({ ref }: { ref: string }) => {
      const target = tx.plugin(plugin).selectDefinition({ ref });

      if (!target) return false;

      return tx.navigation.navigate({
        scrollTarget: target.point,
        target: {
          path: target.targetPath,
          type: 'node',
        },
      });
    },
    focusReference: ({ ref, index = 0 }: { ref: string; index?: number }) => {
      const target = tx.plugin(plugin).selectReference({ ref, index });

      if (!target) return false;

      return tx.navigation.navigate({
        scrollTarget: target.point,
        target: {
          path: target.targetPath,
          type: 'node',
        },
      });
    },
  }),
}));
