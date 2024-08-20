import { createSlatePlugin } from '@udecode/plate-common';

import { BoldPlugin } from './BoldPlugin';
import { CodePlugin } from './CodePlugin';
import { ItalicPlugin } from './ItalicPlugin';
import { StrikethroughPlugin } from './StrikethroughPlugin';
import { SubscriptPlugin } from './SubscriptPlugin';
import { SuperscriptPlugin } from './SuperscriptPlugin';
import { UnderlinePlugin } from './UnderlinePlugin';

export const BasicMarksPlugin = createSlatePlugin({
  key: 'basicMarks',
  plugins: [
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    SubscriptPlugin,
    SuperscriptPlugin,
    UnderlinePlugin,
  ],
});
