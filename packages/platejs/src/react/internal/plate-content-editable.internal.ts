import type { EditableProps } from 'plitejs/react';
import { createContext, type ComponentType } from 'react';

export type PlateContentEditableValue = {
  component: ComponentType<EditableProps>;
  props?: Readonly<Record<string, unknown>>;
};

export const PlateContentEditableContext =
  createContext<PlateContentEditableValue | null>(null);
