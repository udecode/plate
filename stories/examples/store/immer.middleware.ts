import produce, { setAutoFreeze } from 'immer';
import { State, StateCreator } from 'zustand';
import { combine } from 'zustand/middleware';

export const immer = <T extends State>(
  config: StateCreator<T, (fn: (draft: T) => void) => void>
): StateCreator<T> => (set, get, api) =>
  config((fn) => set(produce(fn) as (state: T) => T), get, api);

export const immerMutable = <T extends State>(
  config: StateCreator<T, (fn: (draft: T) => void) => void>
): StateCreator<T> => (set, get, api) =>
  config(
    (fn) => {
      setAutoFreeze(false);
      set(produce(fn) as (state: T) => T);
      setAutoFreeze(true);
    },
    get,
    api
  );

export const combineAndImmer = <PrimaryState extends State>(
  initialState: PrimaryState,
  config: StateCreator<
    PrimaryState,
    (fn: (draft: PrimaryState) => void) => void
  >
): StateCreator<PrimaryState> => {
  return combine(initialState, immer(config));
};
