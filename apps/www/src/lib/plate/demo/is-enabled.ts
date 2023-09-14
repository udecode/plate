import { ValueId } from '@/config/customizer-plugins';

export const isEnabled = (id: ValueId, currentId?: ValueId) =>
  !currentId || currentId === id;
