import { createSlatePlugin } from '@udecode/plate-common';

import { BaseBoldPlugin } from './BaseBoldPlugin';
import { BaseCodePlugin } from './BaseCodePlugin';
import { BaseItalicPlugin } from './BaseItalicPlugin';
import { BaseStrikethroughPlugin } from './BaseStrikethroughPlugin';
import { BaseSubscriptPlugin } from './BaseSubscriptPlugin';
import { BaseSuperscriptPlugin } from './BaseSuperscriptPlugin';
import { BaseUnderlinePlugin } from './BaseUnderlinePlugin';

export const BaseBasicMarksPlugin = createSlatePlugin({
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
