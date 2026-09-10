import type { Element } from '../../../facade';
import type {
  PlateElementDescriptor,
  PlateElementForDescriptor,
} from './useElement';
import { useElementStoreContext } from './useElementStore';
import { useElementStoreSelector } from './useElementStoreSelector.internal';

type UseElementSelectorOptions<T> = {
  equalityFn?: (a: T, b: T) => boolean;
  /** Low-level provider scope. Prefer passing a plugin descriptor. */
  scope?: string;
};

type ElementSelector<N extends Element, T> = (state: N, prev?: T) => T;

const strictEqual = <T>(a: T, b: T) => a === b;

/** Derive a value from the nearest element payload, skipping path-only updates. */
export function useElementSelector<T>(
  selector: ElementSelector<Element, T>,
  options?: UseElementSelectorOptions<T>
): T;
/** Derive a value from the plugin's scoped element with exact schema inference. */
export function useElementSelector<
  const TPlugin extends PlateElementDescriptor,
  T,
>(
  plugin: TPlugin,
  selector: ElementSelector<PlateElementForDescriptor<TPlugin>, T>,
  options?: Omit<UseElementSelectorOptions<T>, 'scope'>
): T;
export function useElementSelector<T>(
  pluginOrSelector: PlateElementDescriptor | ElementSelector<Element, T>,
  selectorOrOptions?:
    | ElementSelector<Element, T>
    | UseElementSelectorOptions<T>,
  pluginOptions: Omit<UseElementSelectorOptions<T>, 'scope'> = {}
): T {
  const plugin =
    typeof pluginOrSelector === 'function' ? undefined : pluginOrSelector;
  const selector = (
    typeof pluginOrSelector === 'function'
      ? pluginOrSelector
      : selectorOrOptions
  ) as ElementSelector<Element, T>;
  const options = (
    typeof pluginOrSelector === 'function' ? selectorOrOptions : pluginOptions
  ) as UseElementSelectorOptions<T> | undefined;
  const equalityFn = options?.equalityFn ?? strictEqual<T>;
  const context = useElementStoreContext(plugin?.name ?? options?.scope);
  return useElementStoreSelector(context, 'element', selector, equalityFn) as T;
}
