'use client';

import React from 'react';

import type { Element, RootKey } from '../../facade';
import { Editable } from '../internal/plite-components';
import {
  type EditorContentProps,
  EditorContentView,
} from './EditorContentView.internal';

export type { EditorContentProps } from './EditorContentView.internal';

/**
 * Editable with plugins.
 *
 * - DOM handler props
 * - ReadOnly prop
 * - Slots.afterEditable
 * - Slots.beforeEditable
 * - Plugin renderers and hooks
 */
function EditorContent<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
>(props: EditorContentProps<TElement, TRoot>) {
  return (
    <EditorContentView {...props} editable={Editable} editableExtra={{}} />
  );
}

export { EditorContent };
