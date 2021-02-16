import { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { UseEditablePluginsOptions } from '../types/UseEditablePluginsOptions';
import { decoratePlugins } from '../utils/decoratePlugins';
import { onDOMBeforeInputPlugins } from '../utils/onDOMBeforeInputPlugins';
import { onKeyDownPlugins } from '../utils/onKeyDownPlugins';
import { renderElementPlugins } from '../utils/renderElementPlugins';
import { renderLeafPlugins } from '../utils/renderLeafPlugins';

export const useEditablePlugins = ({
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
}: UseEditablePluginsOptions) => {
  const editor = useSlate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderElement = useCallback(
    renderElementPlugins([
      ...plugins.flatMap((p) => p.renderElement),
      ...renderElementList,
    ]),
    [...plugins.flatMap((p) => p.renderElementDeps ?? []), ...renderElementDeps]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderLeaf = useCallback(
    renderLeafPlugins([
      ...plugins.flatMap((p) => p.renderLeaf),
      ...renderLeafList,
    ]),
    [
      ...plugins.flatMap((e) => e.renderLeafDeps ?? []),
      ...renderLeafDeps,
      // see https://github.com/ianstormtaylor/slate/pull/3437
      // render leaf cannot be memoized unless the decorate deps are passed to it
      ...plugins.flatMap((p) => p.decorateDeps ?? []),
      ...decorateDeps,
    ]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onKeyDown = useCallback(
    onKeyDownPlugins(editor, [
      ...plugins.flatMap((p) => p.onKeyDown),
      ...onKeyDownList,
    ]),
    [...plugins.flatMap((p) => p.onKeyDownDeps ?? []), ...onKeyDownDeps]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const decorate = useCallback(
    decoratePlugins(editor, [
      ...plugins.flatMap((p) => p.decorate),
      ...decorateList,
    ]),
    [...plugins.flatMap((p) => p.decorateDeps ?? []), ...decorateDeps]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDOMBeforeInput = useCallback(
    onDOMBeforeInputPlugins(editor, [
      ...plugins.flatMap((p) => p.onDOMBeforeInput),
      ...onDOMBeforeInputList,
    ]),
    [
      ...plugins.flatMap((p) => p.onDOMBeforeInputDeps ?? []),
      ...onDOMBeforeInputDeps,
    ]
  );

  return useCallback(
    () => ({
      renderElement,
      renderLeaf,
      onKeyDown,
      decorate,
      onDOMBeforeInput,
      ...props,
    }),
    [decorate, onDOMBeforeInput, onKeyDown, props, renderElement, renderLeaf]
  );
};
