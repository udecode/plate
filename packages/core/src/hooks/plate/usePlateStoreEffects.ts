import { useEffect } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';
import { PlateProps } from '../../components/plate/Plate';
import { Value } from '../../slate/editor/TEditor';
import { getPlateActions } from '../../stores/plate/platesStore';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { isUndefined } from '../../utils/misc/type-utils';

export type UsePlateStoreEffects<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Pick<
  PlateProps<V, E>,
  | 'id'
  | 'value'
  | 'enabled'
  | 'onChange'
  | 'editableProps'
  | 'plugins'
  | 'decorate'
  | 'renderElement'
  | 'renderLeaf'
>;

export const usePlateStoreEffects = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  id,
  value: valueProp,
  enabled: enabledProp = true,
  onChange,
  editableProps,
  plugins,
  decorate,
  renderElement,
  renderLeaf,
}: UsePlateStoreEffects<V, E>) => {
  const plateActions = getPlateActions<V, E>(id);

  // Store Slate.value
  useEffect(() => {
    if (!isUndefined(valueProp)) {
      valueProp && plateActions.value(valueProp);
    }
  }, [valueProp, plateActions]);

  // Store enabled
  useEffect(() => {
    if (!isUndefined(enabledProp)) {
      plateActions.enabled(enabledProp);
    }
  }, [enabledProp, plateActions]);

  // Store onChange
  useEffect(() => {
    if (!isUndefined(onChange)) {
      plateActions.onChange(onChange);
    }
  }, [onChange, plateActions]);

  // Store editableProps
  useDeepCompareEffect(() => {
    if (!isUndefined(editableProps)) {
      plateActions.editableProps(editableProps);
    }
  }, [editableProps, plateActions]);

  // Store decorate
  useEffect(() => {
    if (!isUndefined(decorate)) {
      plateActions.decorate(decorate);
    }
  }, [decorate, plateActions]);

  // Store plugins
  useEffect(() => {
    if (!isUndefined(renderElement)) {
      plateActions.renderElement(renderElement);
    }
  }, [renderElement, plateActions]);

  // Store plugins
  useEffect(() => {
    if (!isUndefined(renderLeaf)) {
      plateActions.renderLeaf(renderLeaf);
    }
  }, [renderLeaf, plateActions]);

  // Store plugins
  useEffect(() => {
    if (!isUndefined(plugins)) {
      plateActions.plugins(plugins);
    }
  }, [plugins, plateActions]);
};
