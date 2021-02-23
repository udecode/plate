export type OnError = (err: any) => void;

export interface ErrorHandler {
  onError?: OnError;
}
