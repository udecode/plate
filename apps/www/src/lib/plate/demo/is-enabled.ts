import { ValueId } from '@/config/setting-values';

export const isEnabled = (id: ValueId, currentId?: ValueId) =>
  !currentId || currentId === id;
