import type { IFormatter } from './formatter';

export class JsonFormatter implements IFormatter {
  format(code: string) {
    try {
      return JSON.stringify(JSON.parse(code), null, 2);
    } catch (error) {
      return code;
    }
  }

  validSyntax(code: string) {
    try {
      JSON.parse(code);

      return true;
    } catch (error) {
      return false;
    }
  }
}
