/** Get the property names from an interface which are functions */
export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

/** Get the properties from an interface which are functions */
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
