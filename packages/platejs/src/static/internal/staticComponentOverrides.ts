import type React from 'react';

import type { Editor } from '../../lib';

export type StaticComponentOverrides = Readonly<
  Record<string, React.ComponentType<any> | undefined>
>;

const OVERRIDES = new WeakMap<object, StaticComponentOverrides>();

export const getStaticComponentOverride = (editor: Editor, name: string) =>
  OVERRIDES.get(editor)?.[name];

export const setStaticComponentOverrides = (
  editor: Editor,
  overrides: StaticComponentOverrides
) => {
  OVERRIDES.set(editor, overrides);
};
