export type ILocalStorage<T> = {
  get: () => T;
  set: (value: T) => void;
};

export class LocalStorage<T> implements ILocalStorage<T> {
  protected key: string;
  protected defaultValue: T;

  constructor(key: string, defaultValue: T) {
    this.key = key;
    this.defaultValue = defaultValue;
  }

  get(): T {
    let value = this.defaultValue;

    if (typeof window === 'undefined') return value;

    const valueInLocalStorage = window.localStorage.getItem(this.key);

    if (valueInLocalStorage) {
      try {
        value = JSON.parse(valueInLocalStorage);
      } catch {
        window.localStorage.removeItem(this.key);
      }
    }

    return value;
  }

  set(value: any) {
    window.localStorage.setItem(this.key, JSON.stringify(value));
  }
}
