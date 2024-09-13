import {
  type PlatePlugin,
  Key,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { BaseHeadingPlugin } from '../lib/BaseHeadingPlugin';

export const HeadingPlugin = toPlatePlugin(BaseHeadingPlugin, ({ plugin }) => ({
  plugins: (plugin as unknown as PlatePlugin).plugins.map((p) =>
    (p as PlatePlugin).extend(({ editor, type }) => {
      const level = p.key.at(-1);

      if (level > 3) return {};

      return {
        shortcuts: {
          ['toggleHeading' + level]: {
            keys: [
              [Key.Mod, Key.Alt, level],
              [Key.Mod, Key.Shift, level],
            ],
            preventDefault: true,
            handler: () => {
              editor.tf.toggle.block({ type });
            },
          },
        },
      };
    })
  ),
}));
