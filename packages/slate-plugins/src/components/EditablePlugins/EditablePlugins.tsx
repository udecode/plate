import * as React from 'react';
import { useCallback } from 'react';
import { Editable, useSlate } from 'slate-react';
import {
  Decorate,
  OnDOMBeforeInput,
  OnKeyDown,
  RenderElement,
  RenderLeaf,
  SlatePlugin,
} from '../../common';
import {
  decoratePlugins,
  onDOMBeforeInputPlugins,
  onKeyDownPlugins,
  renderElementPlugins,
  renderLeafPlugins,
} from './utils';

export interface EditablePluginsProps {
  [key: string]: any;
  placeholder?: string;
  // Enable read-only
  readOnly?: boolean;
  role?: string;
  style?: React.CSSProperties;
  /**
   * Each plugin fields will be combined by role.
   *
   * To render `Editable`:
   * - decorate
   * - renderElement
   * - renderLeaf
   * - onDOMBeforeInput
   * - onKeyDown
   */
  plugins?: SlatePlugin[];
  /**
   * Decorations are another type of text-level formatting.
   * They are similar to regular old custom properties,
   * except each one applies to a Range of the document instead of being
   * associated with a given text node.
   * However, decorations are computed at render-time based on the content itself.
   * This is helpful for dynamic formatting like syntax highlighting or search
   * keywords, where changes to the content (or some external data) has the
   * potential to change the formatting.
   */
  decorate?: Decorate[];
  // Dependencies of `decorate`
  decorateDeps?: any[];
  /**
   * To customize the rendering of each element components.
   * Element properties are for contiguous, semantic elements in the document.
   */
  renderElement?: RenderElement[];
  // Dependencies of `renderElement`
  renderElementDeps?: any[];
  /**
   * To customize the rendering of each leaf.
   * When text-level formatting is rendered, the characters are grouped into
   * "leaves" of text that each contain the same formatting applied to them.
   * Text properties are for non-contiguous, character-level formatting.
   */
  renderLeaf?: RenderLeaf[];
  // Dependencies of `renderLeaf`
  renderLeafDeps?: any[];
  onDOMBeforeInput?: OnDOMBeforeInput[];
  // Dependencies of `onDOMBeforeInput`
  onDOMBeforeInputDeps?: any[];
  /**
   * Handlers when we press a key
   */
  onKeyDown?: OnKeyDown[];
  // Dependencies of `onKeyDown`
  onKeyDownDeps?: any[];
}

/**
 * {@link Editable} with plugins support.
 */
export const EditablePlugins = ({
  plugins = [],
  decorate: decorateList = [],
  decorateDeps = [],
  renderElement: renderElementList = [],
  renderElementDeps = [],
  renderLeaf: renderLeafList = [],
  renderLeafDeps = [],
  onDOMBeforeInput: onDOMBeforeInputList = [],
  onDOMBeforeInputDeps = [],
  onKeyDown: onKeyDownList = [],
  onKeyDownDeps = [],
  ...props
}: EditablePluginsProps) => {
  const editor = useSlate();

  return (
    <Editable
      style={{
        fontSize: 16,
        lineHeight: 1.5,
      }}
      data-testid="EditablePlugins"
      decorate={useCallback(
        decoratePlugins(plugins, decorateList),
        decorateDeps
      )}
      onDOMBeforeInput={useCallback(
        onDOMBeforeInputPlugins(editor, plugins, onDOMBeforeInputList),
        onDOMBeforeInputDeps
      )}
      renderElement={useCallback(
        renderElementPlugins(plugins, renderElementList),
        renderElementDeps
      )}
      renderLeaf={useCallback(
        renderLeafPlugins(plugins, renderLeafList),
        renderLeafDeps
      )}
      onKeyDown={useCallback(
        onKeyDownPlugins(editor, plugins, onKeyDownList),
        onKeyDownDeps
      )}
      {...props}
    />
  );
};
