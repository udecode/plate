'use client';

import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { createPlatePlugins } from '@udecode/plate/react';
import { all, createLowlight } from 'lowlight';

const lowlight = createLowlight(all);

export const BasicNodesKit = createPlatePlugins([
  HeadingPlugin.configure({ options: { levels: 3 } }),
  BlockquotePlugin,
  CodeBlockPlugin.configure({ options: { lowlight } }),
  BasicMarksPlugin,
]);
