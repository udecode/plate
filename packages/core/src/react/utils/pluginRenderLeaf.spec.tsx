/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createTSlatePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pluginRenderLeaf } from './pluginRenderLeaf';

it('uses a plain render.as fast path for simple leaf plugins', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isLeaf: true,
      type: 'test',
    },
    render: {
      as: 'strong',
    },
  });
  const editor = createPlateEditor({
    plugins: [testPlugin],
  });
  const renderLeaf = pluginRenderLeaf(editor, testPlugin as any);
  const TestComponent = () =>
    renderLeaf({
      children: 'test content',
      leaf: { test: true, text: 'test content' } as any,
      leafPosition: { end: 0, start: 12 } as any,
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const leaf = container.querySelector('strong');

  expect(leaf).not.toBeNull();
  expect(leaf).toHaveClass('slate-test');
  expect(leaf).toHaveTextContent('test content');
});

it('uses a PlateLeaf hard-affinity fast path for simple hard-edge plugins', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isLeaf: true,
      type: 'test',
    },
    render: {
      as: 'code',
    },
    rules: {
      selection: {
        affinity: 'hard',
      },
    },
  });
  const editor = createPlateEditor({
    plugins: [testPlugin],
  });
  const renderLeaf = pluginRenderLeaf(editor, testPlugin as any);
  const TestComponent = () =>
    renderLeaf({
      children: 'test content',
      leaf: { test: true, text: 'test content' } as any,
      leafPosition: { end: 0, start: 12 } as any,
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const leaf = container.querySelector('code');
  const spacers = container.querySelectorAll('span[contenteditable="false"]');

  expect(leaf).not.toBeNull();
  expect(leaf).toHaveClass('slate-test');
  expect(leaf).toHaveTextContent('test content');
  expect(spacers).toHaveLength(2);
});
