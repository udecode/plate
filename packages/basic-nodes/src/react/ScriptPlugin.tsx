import * as React from 'react';

import {
  type PlateLeafProps,
  PlateLeaf,
  toPlatePlugin,
} from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { BaseScriptPlugin } from '../lib/BaseScriptPlugin';

const ScriptLeaf = (props: PlateLeafProps) => (
  <PlateLeaf {...props} as={props.leaf[KEYS.script] === 'sub' ? 'sub' : 'sup'}>
    {props.children}
  </PlateLeaf>
);

export const ScriptPlugin = toPlatePlugin(BaseScriptPlugin, {
  component: ScriptLeaf,
});
