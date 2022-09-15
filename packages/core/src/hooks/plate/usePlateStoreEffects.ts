import { useEffect } from 'react';
import { TEditableProps, Value } from '../../slate/index';
import { usePlateStates } from '../../stores/index';
import { Nullable, PlateEditor, PlateStoreState } from '../../types/index';
import { isUndefined } from '../../utils/index';

export type UsePlateStoreEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Partial<Pick<PlateStoreState<V, E>, 'id' | 'value' | 'plugins'>> &
  Nullable<{
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

export const usePlateStoreEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  id,
  value: valueProp,
  onChange: onChangeProp,
  plugins: pluginsProp,
  decorate: decorateProp,
  renderElement: renderElementProp,
  renderLeaf: renderLeafProp,
}: UsePlateStoreEffectsProps<V, E>) => {
  const states = usePlateStates<V, E>(id);
  const [value, setValue] = states.value();
  const [decorate, setDecorate] = states.decorate();
  const [renderElement, setRenderElement] = states.renderElement();
  const [renderLeaf, setRenderLeaf] = states.renderLeaf();
  const [plugins, setPlugins] = states.plugins();
  const [onChange, setOnChange] = states.onChange();

  // Store Slate.value
  usePlateStoreOnChange({
    state: value,
    setState: setValue,
    nextState: valueProp,
  });

  usePlateStoreOnChange({
    state: plugins,
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
};
