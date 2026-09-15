/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';

import { property } from '../../core';
import { definePlugin } from '../../lib/plugin';
import { createEditor } from '../editor/withPlate';
import { pluginRenderText } from './pluginRenderText.internal';

it('uses an intrinsic component fast path for simple text plugins', () => {
  const testPlugin = definePlugin('test', {
    component: 'strong',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { mark: { placement: 'text' } },
  });
  const editor = createEditor({
    navigationFeedback: false,
    plugins: [testPlugin],
  });
  const renderText = pluginRenderText(editor, testPlugin);
  const TestComponent = () =>
    renderText({
      attributes: {
        'data-editor-node': 'text',
        className: 'from-plite',
      } as any,
      children: 'test content',
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const text = container.querySelector('strong');

  expect(text).not.toBeNull();
  expect(text).toHaveClass('editor-test');
  expect(text).toHaveClass('from-plite');
  expect(text).toHaveAttribute('data-editor-node', 'text');
  expect(text).toHaveTextContent('test content');
});
