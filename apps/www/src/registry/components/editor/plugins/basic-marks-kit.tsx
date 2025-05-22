'use client';

import { withProps } from '@udecode/cn';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { PlateLeaf } from '@udecode/plate/react';

import { CodeLeaf } from '@/registry/ui/code-node';

export const BasicMarksKit = [
  BoldPlugin.withComponent(withProps(PlateLeaf, { as: 'strong' })),
  CodePlugin.withComponent(CodeLeaf),
  ItalicPlugin.withComponent(withProps(PlateLeaf, { as: 'em' })),
  StrikethroughPlugin.withComponent(withProps(PlateLeaf, { as: 's' })),
  UnderlinePlugin.withComponent(withProps(PlateLeaf, { as: 'u' })),
  SubscriptPlugin.withComponent(withProps(PlateLeaf, { as: 'sub' })),
  SuperscriptPlugin.withComponent(withProps(PlateLeaf, { as: 'sup' })),
  // ...SkipMarkKit,
];
