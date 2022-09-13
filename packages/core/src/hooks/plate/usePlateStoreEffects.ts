import { useEffect } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';
import { Value } from '../../slate/index';
import { usePlateActions } from '../../stores/index';
import { PlateEditor, PlateStoreState } from '../../types/index';
import { isUndefined } from '../../utils/misc/type-utils';

export type UsePlateStoreEffectsProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Partial<
  Pick<
    PlateStoreState<V, E>,
    | 'id'
    | 'value'
    | 'onChange'
    | 'editableProps'
    | 'decorate'
    | 'renderElement'
    | 'renderLeaf'
    | 'plugins'
  >
>;

export const usePlateStoreEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  id,
  value: valueProp,
  onChange,
  editableProps,
  plugins,
  decorate,
  renderElement,
  renderLeaf,
}: UsePlateStoreEffectsProps<V, E>) => {
  const actions = usePlateActions<V, E>(id);
  const setValue = actions.value();
  const setOnChange = actions.onChange();
  const setEditableProps = actions.editableProps();
  const setDecorate = actions.decorate();
  const setRenderElement = actions.renderElement();
  const setRenderLeaf = actions.renderLeaf();
  const setPlugins = actions.plugins();

  // Store Slate.value
  useEffect(() => {
    if (!isUndefined(valueProp)) {
      valueProp && setValue(valueProp);
    }
  }, [valueProp, setValue]);

  // Store onChange
  useEffect(() => {
    if (!isUndefined(onChange)) {
      setOnChange(onChange);
    }
  }, [onChange, setOnChange]);

  // Store editableProps
  useDeepCompareEffect(() => {
    if (!isUndefined(editableProps)) {
      setEditableProps(editableProps);
    }
  }, [editableProps, setEditableProps]);

  // Store decorate
  useEffect(() => {
    if (!isUndefined(decorate)) {
      setDecorate(decorate);
    }
  }, [decorate, setDecorate]);

  // Store plugins
  useEffect(() => {
    if (!isUndefined(renderElement)) {
      setRenderElement(renderElement);
    }
  }, [renderElement, setRenderElement]);

  // Store plugins
  useEffect(() => {
    if (!isUndefined(renderLeaf)) {
      setRenderLeaf(renderLeaf);
    }
  }, [renderLeaf, setRenderLeaf]);

  // Store plugins
  useEffect(() => {
    if (!isUndefined(plugins)) {
      setPlugins(plugins);
    }
  }, [plugins, setPlugins]);
};
