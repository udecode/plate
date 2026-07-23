import { createBasePlugin } from '@platejs/core';

import { BaseBoldPlugin } from './BaseBoldPlugin';
import { BaseCodePlugin } from './BaseCodePlugin';
import { BaseItalicPlugin } from './BaseItalicPlugin';
import { BaseStrikethroughPlugin } from './BaseStrikethroughPlugin';
import { BaseSubscriptPlugin } from './BaseSubscriptPlugin';
import { BaseSuperscriptPlugin } from './BaseSuperscriptPlugin';
import { BaseUnderlinePlugin } from './BaseUnderlinePlugin';

export const BaseBasicMarksPlugin = createBasePlugin({
  key: 'basicMarks',
  plugins: [
    BaseBoldPlugin,
    BaseCodePlugin,
    BaseItalicPlugin,
    BaseStrikethroughPlugin,
    BaseSubscriptPlugin,
    BaseSuperscriptPlugin,
    BaseUnderlinePlugin,
  ],
});
