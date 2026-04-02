/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createTSlatePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pluginRenderText } from './pluginRenderText';

it('uses a plain render.as fast path for simple text plugins', () => {
  const testPlugin = createTSlatePlugin({
    key: 'test',
    node: {
      isDecoration: false,
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
  const renderText = pluginRenderText(editor, testPlugin as any);
  const TestComponent = () =>
    renderText({
      attributes: { 'data-slate-node': 'text' } as any,
      children: 'test content',
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const text = container.querySelector('strong');

  expect(text).not.toBeNull();
  expect(text).toHaveClass('slate-test');
  expect(text).toHaveTextContent('test content');
});
