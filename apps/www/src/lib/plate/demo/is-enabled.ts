import { ValueId } from '@/config/customizer-plugins';

export const isEnabled = (
  id: ValueId,
  currentId?: ValueId,
  componentId?: boolean
) => (!currentId && componentId !== false) || currentId === id;
