// eslint-disable-next-line prettier/prettier
import { type ClassValue, clsx } from "clsx";
import { twMerge } from 'tailwind-merge';

export type ClassNames<T> = {
  classNames?: Partial<T>;
};

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
