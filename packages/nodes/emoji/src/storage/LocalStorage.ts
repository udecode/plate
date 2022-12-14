import { ILocalStorage } from './LocalStorage.types';

export class LocalStorage<T> implements ILocalStorage<T> {
  constructor(protected key: string, protected defaultValue: T) {}

  set(value: any) {
    window.localStorage.setItem(this.key, JSON.stringify(value));
  }

  get(): T {
    let value = this.defaultValue;
    const valueInLocalStorage = window.localStorage.getItem(this.key);

    if (valueInLocalStorage) {
      try {
        value = JSON.parse(valueInLocalStorage);
      } catch (error) {
        window.localStorage.removeItem(this.key);
      }
    }

    return value;
  }
}
