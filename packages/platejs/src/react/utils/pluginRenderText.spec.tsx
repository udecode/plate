/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';

import { property } from '../../core';
import { defineBasePlugin } from '../../lib/plugin';
import { createEditor } from '../editor/withPlate';
import { pluginRenderText } from './pluginRenderText';

it('uses a plain render.as fast path for simple text plugins', () => {
  const testPlugin = defineBasePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { isDecoration: false, as: 'strong' },
  });
  const editor = createEditor({
    navigationFeedback: false,
    plugins: [testPlugin],
  });
  const renderText = pluginRenderText(editor, testPlugin);
  const TestComponent = () =>
    renderText({
      attributes: {
        'data-plite-node': 'text',
        className: 'from-plite',
      } as any,
      children: 'test content',
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const text = container.querySelector('strong');

  expect(text).not.toBeNull();
  expect(text).toHaveClass('plite-test');
  expect(text).toHaveClass('from-plite');
  expect(text).toHaveAttribute('data-plite-node', 'text');
  expect(text).toHaveTextContent('test content');
});
