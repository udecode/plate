import { NavigationFeedbackPlugin, toPlatePlugin } from '@platejs/core/react';

import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnoteInputPlugin,
  BaseFootnotePlugin,
} from '../lib';

export const FootnoteDefinitionPlugin = toPlatePlugin(
  BaseFootnoteDefinitionPlugin
);

export const FootnoteInputPlugin = toPlatePlugin(BaseFootnoteInputPlugin);

export const FootnotePlugin = toPlatePlugin(BaseFootnotePlugin, {
  dependencies: [FootnoteInputPlugin, NavigationFeedbackPlugin],
}).extend(({ plugin }) => ({
  update: ({ tx }) => ({
    focusDefinition: ({ identifier }: { identifier: string }) => {
      const target = tx.plugin(plugin).selectDefinition({ identifier });

      if (!target) return false;

      return tx.navigation.navigate({
        scrollTarget: target.point,
        target: {
          path: target.targetPath,
          type: 'node',
        },
      });
    },
    focusReference: ({
      identifier,
      index = 0,
    }: {
      identifier: string;
      index?: number;
    }) => {
      const target = tx.plugin(plugin).selectReference({ identifier, index });

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
