import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { Value } from './TEditor';

export type GetAboveNodeOptions<V extends Value = Value> = QueryOptions<V> &
  QueryMode &
  QueryVoids;

export type GetEditorStringOptions = QueryVoids;
