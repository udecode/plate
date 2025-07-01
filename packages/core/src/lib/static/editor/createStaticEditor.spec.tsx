/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

import { CopyPlugin } from '../plugins/CopyPlugin';
import { createStaticEditor } from './createStaticEditor';

jsx;

describe('createStaticEditor', () => {
  it('should create a static editor', () => {
    const editor = createStaticEditor();
    
    expect(editor).toBeDefined();
    // Default editor might have a default paragraph
    expect(editor.children).toBeDefined();
    expect(Array.isArray(editor.children)).toBe(true);
  });

  it('should create a static editor with initial value', () => {
    const value = (
      <editor>
        <hp>
          <htext>Hello world</htext>
        </hp>
      </editor>
    );

    const editor = createStaticEditor({
      value: value.children,
    });

    expect(editor.children).toEqual(value.children);
  });

  it('should include CopyPlugin by default', () => {
    const editor = createStaticEditor();
    
    const copyPlugin = editor.getPlugin(CopyPlugin);
    expect(copyPlugin).toBeDefined();
    expect(copyPlugin.enabled).toBe(true);
  });

  it('should disable CopyPlugin when copyPlugin is false', () => {
    const editor = createStaticEditor({
      copyPlugin: false,
    });

    const copyPlugin = editor.getPlugin(CopyPlugin);
    expect(copyPlugin).toBeDefined();
    // When disabled via configure, plugin.enabled might be false or undefined
    expect(copyPlugin.enabled).toBeFalsy();
  });

  it('should merge with custom plugins', () => {
    const CustomPlugin = {
      key: 'custom',
      options: { test: true },
    };

    const editor = createStaticEditor({
      plugins: [CustomPlugin],
    });

    const customPlugin = editor.getPlugin({ key: 'custom' });
    expect(customPlugin).toBeDefined();
    expect(customPlugin.options.test).toBe(true);

    // Should still have CopyPlugin
    const copyPlugin = editor.getPlugin(CopyPlugin);
    expect(copyPlugin).toBeDefined();
  });

  it('should override setFragmentData transform', () => {
    const editor = createStaticEditor();
    
    expect(editor.tf.setFragmentData).toBeDefined();
    expect(typeof editor.tf.setFragmentData).toBe('function');
  });
});