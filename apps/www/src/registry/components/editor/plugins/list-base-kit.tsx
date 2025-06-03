import { KEYS } from '@udecode/plate';
import { BaseListPlugin } from '@udecode/plate-list';

import { BaseIndentKit } from '@/registry/components/editor/plugins/indent-base-kit';
import { BlockListStatic } from '@/registry/ui/block-list-static';

export const BaseListKit = [
  ...BaseIndentKit,
  BaseListPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
      ],
    },
    render: {
      belowNodes: BlockListStatic,
    },
  }),
];
