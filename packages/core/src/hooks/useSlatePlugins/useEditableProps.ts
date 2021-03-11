import { useCallback, useMemo } from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import {
  useEditorOptions,
  useSlatePluginsOptions,
} from '../../store/useEditorOption';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { UseEditablePropsOptions } from '../../types/UseEditablePropsOptions';
import { decoratePlugins } from '../../utils/decoratePlugins';
import { onDOMBeforeInputPlugins } from '../../utils/onDOMBeforeInputPlugins';
import { onKeyDownPlugins } from '../../utils/onKeyDownPlugins';
import { renderElementPlugins } from '../../utils/renderElementPlugins';
import { renderLeafPlugins } from '../../utils/renderLeafPlugins';

export const useEditableProps = ({
  id,
  plugins: _plugins,
  decorate: _decorateList,
  decorateDeps: _decorateDeps,
  renderElement: _renderElementList,
  renderElementDeps: _renderElementDeps,
  renderLeaf: _renderLeafList,
  renderLeafDeps: _renderLeafDeps,
  onDOMBeforeInput: _onDOMBeforeInputList,
  onDOMBeforeInputDeps: _onDOMBeforeInputDeps,
  onKeyDown: _onKeyDownList,
  onKeyDownDeps: _onKeyDownDeps,
  editableProps,
}: UseEditablePropsOptions): (() => EditableProps) => {
  const editor = useSlatePluginsEditor(id);
  const options = useSlatePluginsOptions(id);

  const plugins = useMemo(() => _plugins ?? [], [_plugins]);
  const decorateList = useMemo(() => _decorateList ?? [], [_decorateList]);
  const decorateDeps = useMemo(() => _decorateDeps ?? [], [_decorateDeps]);
  const renderElementList = useMemo(() => _renderElementList ?? [], [
    _renderElementList,
  ]);
  const renderElementDeps = useMemo(() => _renderElementDeps ?? [], [
    _renderElementDeps,
  ]);
  const renderLeafList = useMemo(() => _renderLeafList ?? [], [
    _renderLeafList,
  ]);
  const renderLeafDeps = useMemo(() => _renderLeafDeps ?? [], [
    _renderLeafDeps,
  ]);
  const onDOMBeforeInputList = useMemo(() => _onDOMBeforeInputList ?? [], [
    _onDOMBeforeInputList,
  ]);
  const onDOMBeforeInputDeps = useMemo(() => _onDOMBeforeInputDeps ?? [], [
    _onDOMBeforeInputDeps,
  ]);
  const onKeyDownList = useMemo(() => _onKeyDownList ?? [], [_onKeyDownList]);
  const onKeyDownDeps = useMemo(() => _onKeyDownDeps ?? [], [_onKeyDownDeps]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderElement: EditableProps['renderElement'] = useCallback(
    renderElementPlugins([
      ...plugins.flatMap((p) => p.renderElement),
      ...renderElementList,
    ]),
    [...plugins.flatMap((p) => p.renderElementDeps), ...renderElementDeps]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderLeaf: EditableProps['renderLeaf'] = useCallback(
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
  const onKeyDown: EditableProps['onKeyDown'] = useCallback(
    onKeyDownPlugins(editor, [
      ...plugins.flatMap((p) => p.onKeyDown),
      ...onKeyDownList,
    ]),
    [...plugins.flatMap((p) => p.onKeyDownDeps ?? []), ...onKeyDownDeps]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const decorate: EditableProps['decorate'] = useCallback(
    decoratePlugins(editor, [
      ...plugins.flatMap((p) => p.decorate),
      ...decorateList,
    ]),
    [...plugins.flatMap((p) => p.decorateDeps ?? []), ...decorateDeps]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onDOMBeforeInput: EditableProps['onDOMBeforeInput'] = useCallback(
    onDOMBeforeInputPlugins(editor, [
      ...plugins.flatMap((p) => p.onDOMBeforeInput),
      ...onDOMBeforeInputList,
    ]),
    [
      ...plugins.flatMap((p) => p.onDOMBeforeInputDeps ?? []),
      ...onDOMBeforeInputDeps,
    ]
  );

  return useCallback(() => {
    return {
      renderElement,
      renderLeaf,
      onKeyDown,
      decorate,
      onDOMBeforeInput,
      ...editableProps,
      options,
    };
  }, [
    decorate,
    editableProps,
    onDOMBeforeInput,
    onKeyDown,
    options,
    renderElement,
    renderLeaf,
  ]);
};
