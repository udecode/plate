export type AnyObject = {
  [key: string]: any;
};

export interface UnknownObject {
  [key: string]: unknown;
}

/**
 * Any function.
 */
export type AnyFunction = (...args: any) => any;
