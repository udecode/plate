import { ForwardedRef, useEffect } from 'react';
import { Value } from '@udecode/slate';
import { isUndefined } from '@udecode/utils';

import { useEditorRef, usePlateStates } from '../stores';
import {
  Nullable,
  PlateEditor,
  PlatePlugin,
  PlateStoreState,
  TEditableProps,
} from '../types';
import { setPlatePlugins } from '../utils';

export type UsePlateEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = Partial<Pick<PlateStoreState<V, E>, 'id' | 'value' | 'readOnly'>> & {
  plugins?: PlatePlugin[];
} & Nullable<{
    /**
     * If `true`, disable all the core plugins.
     * If an object, disable the core plugin properties that are `true` in the object.
     */
    disableCorePlugins?:
      | {
          deserializeAst?: boolean;
          deserializeHtml?: boolean;
          editorProtocol?: boolean;
          eventEditor?: boolean;
          inlineVoid?: boolean;
          insertData?: boolean;
          history?: boolean;
          nodeFactory?: boolean;
          react?: boolean;
          selection?: boolean;
          length?: boolean;
        }
      | boolean;

    /**
     * Controlled callback called when the editor state changes.
     */
    onChange?: (value: V) => void;

    /**
     * Access the editor object using a React ref.
     */
    editorRef?: ForwardedRef<E>;

    decorate?: TEditableProps['decorate'];
    renderElement?: TEditableProps['renderElement'];
    renderLeaf?: TEditableProps['renderLeaf'];
  }>;

/**
 * A hook to update the store when the props changes.
 * Undefined props are ignored.
 */
const usePlateStoreOnChange = ({
  setState,
  state,
  nextState,
  nextStateValue = nextState,
}: {
  state: any;
  setState: (v: any) => void;
  nextState: any;
  nextStateValue?: any;
}) => {
  useEffect(() => {
    if (nextState !== state && !isUndefined(nextState)) {
      setState(nextStateValue);
    }
  }, [setState, state, nextState, nextStateValue]);
};

export const usePlateEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  id,
  disableCorePlugins,
  value: valueProp,
  onChange: onChangeProp,
  plugins: pluginsProp,
  editorRef: editorRefProp,
  decorate: decorateProp,
  renderElement: renderElementProp,
  renderLeaf: renderLeafProp,
  readOnly: readOnlyProp,
}: UsePlateEffectsProps<V, E>) => {
  const editor = useEditorRef<V, E>(id);

  const states = usePlateStates<V, E>();
  const [value, setValue] = states.value({ scope: id });
  const [editorRef, setEditorRef] = states.editorRef({ scope: id });
  const [decorate, setDecorate] = states.decorate({ scope: id });
  const [renderElement, setRenderElement] = states.renderElement({ scope: id });
  const [renderLeaf, setRenderLeaf] = states.renderLeaf({ scope: id });
  const [rawPlugins, setRawPlugins] = states.rawPlugins({ scope: id });
  const [, setPlugins] = states.plugins({ scope: id });
  const [onChange, setOnChange] = states.onChange({ scope: id });
  const [readOnly, setReadOnly] = states.readOnly({ scope: id });

  // Store Slate.value
  usePlateStoreOnChange({
    state: value,
    setState: setValue,
    nextState: valueProp,
  });

  usePlateStoreOnChange({
    state: readOnly,
    setState: setReadOnly,
    nextState: readOnlyProp,
  });

  usePlateStoreOnChange({
    state: rawPlugins,
    setState: setPlugins,
    nextState: pluginsProp,
    nextStateValue: pluginsProp ?? [],
  });

  usePlateStoreOnChange({
    state: onChange?.fn,
    setState: setOnChange,
    nextState: onChangeProp,
    nextStateValue: onChangeProp ? { fn: onChangeProp } : null,
  });

  usePlateStoreOnChange({
    state: editorRef?.ref,
    setState: setEditorRef,
    nextState: editorRefProp,
    nextStateValue: editorRefProp ? { ref: editorRefProp } : null,
  });

  usePlateStoreOnChange({
    state: decorate?.fn,
    setState: setDecorate,
    nextState: decorateProp,
    nextStateValue: decorateProp ? { fn: decorateProp } : null,
  });

  usePlateStoreOnChange({
    state: renderElement?.fn,
    setState: setRenderElement,
    nextState: renderElementProp,
    nextStateValue: renderElementProp ? { fn: renderElementProp } : null,
  });

  usePlateStoreOnChange({
    state: renderLeaf?.fn,
    setState: setRenderLeaf,
    nextState: renderLeafProp,
    nextStateValue: renderLeafProp ? { fn: renderLeafProp } : null,
  });

  useEffect(() => {
    if (pluginsProp !== rawPlugins) {
      setRawPlugins(rawPlugins);

      setPlatePlugins<V, E>(editor, {
        plugins: pluginsProp,
        disableCorePlugins,
      });
      setPlugins(editor.plugins as any);
    }
  }, [
    disableCorePlugins,
    editor,
    rawPlugins,
    pluginsProp,
    setPlugins,
    setRawPlugins,
  ]);
};
