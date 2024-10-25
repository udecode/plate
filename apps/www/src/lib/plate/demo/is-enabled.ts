import type { ValueId } from '@/config/customizer-plugins';

export const isEnabled = (
  id: ValueId,
  currentId?: ValueId,
  componentId?: boolean
) => !!id || (!currentId && componentId !== false) || currentId === id;
