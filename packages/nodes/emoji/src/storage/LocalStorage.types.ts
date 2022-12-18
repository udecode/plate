export interface ILocalStorage<T> {
  get: () => T;
  set: (value: T) => void;
}
