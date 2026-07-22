/// <reference types="@testing-library/jest-dom" />

import type { Value } from '@platejs/plite';
import { createReactEditor } from '@platejs/plite-react';

import { act, render } from '@testing-library/react';
import React from 'react';

import { PlateTest } from './PlateTest';

const value: Value = [{ children: [{ text: 'one' }], type: 'p' }];

const hasPluginKey = (plugin: unknown, key: string) =>
  typeof plugin === 'object' &&
  plugin !== null &&
  'key' in plugin &&
  plugin.key === key;

const hasPlatePluginList = (
  runtime: unknown
): runtime is { pluginList: unknown[] } =>
  typeof runtime === 'object' &&
  runtime !== null &&
  'pluginList' in runtime &&
  Array.isArray(runtime.pluginList);

describe('PlateTest', () => {
  it('extends a provided Plite editor before rendering', async () => {
    const editor = createReactEditor();

    let rendered!: ReturnType<typeof render>;
    try {
      await act(async () => {
        rendered = render(
          <PlateTest
            editor={editor}
            schema={{
              id: 'plate-test:core:react-components-platetest:editor-1',
              version: 1,
            }}
            initialValue={value}
          />
        );
      });
    } catch (error) {
      if (error instanceof AggregateError) {
        throw error.errors[0];
      }

      throw error;
    }

    const { getByTestId } = rendered;
    const runtime = 'runtime' in editor ? editor.runtime : null;

    expect(getByTestId('plite-content-editable')).toBeInTheDocument();
    expect(hasPlatePluginList(runtime)).toBe(true);
    expect(
      hasPlatePluginList(runtime) &&
        runtime.pluginList.some((plugin) => hasPluginKey(plugin, 'dom'))
    ).toBe(true);
  });
});
