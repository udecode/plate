import { useEffect } from 'react';
import { TEditableProps, Value } from '../../slate/index';
import { usePlateEditorRef, usePlateStates } from '../../stores/index';
import {
  Nullable,
  PlateEditor,
  PlatePlugin,
  PlateStoreState,
  PluginOptions,
} from '../../types/index';
import { isUndefined, setPlatePlugins } from '../../utils/index';

export type UsePlateEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Partial<Pick<PlateStoreState<V, E>, 'id' | 'value'>> & {
  plugins?: PlatePlugin<PluginOptions, V, E>[];
} & Nullable<{
    /**
     * If `true`, disable all the core plugins.
     * If an object, disable the core plugin properties that are `true` in the object.
     */
    disableCorePlugins?:
      | {
          deserializeAst?: boolean;
          deserializeHtml?: boolean;
          eventEditor?: boolean;
          inlineVoid?: boolean;
          insertData?: boolean;
          history?: boolean;
          nodeFactory?: boolean;
          react?: boolean;
          selection?: boolean;
        }
      | boolean;

    /**
     * Controlled callback called when the editor state changes.
     */
    onChange?: (value: V) => void;

    decorate?: TEditableProps<V>['decorate'];
    renderElement?: TEditableProps<V>['renderElement'];
    renderLeaf?: TEditableProps<V>['renderLeaf'];
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
  E extends PlateEditor<V> = PlateEditor<V>
>({
  id,
  disableCorePlugins,
  value: valueProp,
  onChange: onChangeProp,
  plugins: pluginsProp,
  decorate: decorateProp,
  renderElement: renderElementProp,
  renderLeaf: renderLeafProp,
}: UsePlateEffectsProps<V, E>) => {
  const editor = usePlateEditorRef<V, E>(id);

  const states = usePlateStates<V, E>(id);
  const [value, setValue] = states.value();
  const [decorate, setDecorate] = states.decorate();
  const [renderElement, setRenderElement] = states.renderElement();
  const [renderLeaf, setRenderLeaf] = states.renderLeaf();
  const [rawPlugins, setRawPlugins] = states.rawPlugins();
  const [, setPlugins] = states.plugins();
  const [onChange, setOnChange] = states.onChange();

  // Store Slate.value
  usePlateStoreOnChange({
    state: value,
    setState: setValue,
    nextState: valueProp,
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
