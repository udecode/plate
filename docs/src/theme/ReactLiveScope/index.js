/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { SlatePlugins } from '@udecode/slate-plugins';

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  SlatePlugins,
  editableProps: {
    placeholder: 'Type…',
    spellCheck: true,
    style: {
      padding: '15px',
    },
  },
};

export default ReactLiveScope;
