---
title: My first editor
---

Let's start with the smallest editor implementation.


```tsx {3}
import React from 'react';
import { Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  SlatePlugins,
  ParagraphPlugin,
  BoldPlugin,
  EditablePlugins,
  ItalicPlugin,
  UnderlinePlugin,
} from '@udecode/slate-plugins';

export const Editor = () => (
  <SlatePlugins
    editableProps={editableProps}
    initialValue={initialValuePlainText}
  />
)
```

If you want to add more features to your editor, just extend the `plugins` list. That's it!

The following guide will explain you more in details `EditablePlugins` and how to create your own plugins.
