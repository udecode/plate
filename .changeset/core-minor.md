---
"@udecode/plate-core": minor
---

- **SSR support**
- `useEventPlateId` returns:
  - `id` if defined
  - focused editor id if defined
  - blurred editor id if defined
  - last editor id if defined
  - provider id if defined
  - `PLATE_SCOPE` otherwise
- new dep: `nanoid`
- `PlateProvider`
```tsx
export interface PlateProviderProps<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends PlateProviderEffectsProps<V, E>,
    Partial<Pick<PlateStoreState<V, E>, 'id' | 'editor'>> {
  /**
   * Initial value of the editor.
   * @default [{ children: [{ text: '' }]}]
   */
  initialValue?: PlateStoreState<V>['value'];

  /**
   * When `true`, it will normalize the initial value passed to the `editor` once it gets created.
   * This is useful when adding normalization rules on already existing content.
   * @default false
   */
  normalizeInitialValue?: boolean;

  scope?: Scope;
}
```
- `PlateProviderEffects`
- `PlateSlate`
- `PlateEditable`
```tsx
export interface PlateEditableExtendedProps {
  id?: PlateId;

  /**
   * The children rendered inside `Slate`, after `Editable`.
   */
  children?: ReactNode;

  /**
   * Ref to the `Editable` component.
   */
  editableRef?: Ref<HTMLDivElement>;

  /**
   * The first children rendered inside `Slate`, before `Editable`.
   * Slate DOM is not yet resolvable on first render, for that case use `children` instead.
   */
  firstChildren?: ReactNode;

  /**
   * Custom `Editable` node.
   */
  renderEditable?: (editable: ReactNode) => ReactNode;
}

export interface PlateEditableProps<V extends Value = Value>
  extends Omit<TEditableProps<V>, 'id'>,
    PlateEditableExtendedProps {} 
```