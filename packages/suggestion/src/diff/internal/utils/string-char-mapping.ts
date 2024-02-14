export class StringCharMapping {
  private _to_char: { [s: string]: string } = {};
  private _next_char: string = 'A';
  public _to_string: { [s: string]: string } = {}; // yes, this is publicly accessed (TODO: fix)

  private find_next_char(): void {
    while (true) {
      this._next_char = String.fromCodePoint(
        this._next_char.codePointAt(0)! + 1
      );
      if (this._to_string[this._next_char] == null) {
        // found it!
        break;
      }
    }
  }

  public to_string(strings: string[]): string {
    let t = '';
    for (const s of strings) {
      const a = this._to_char[s];
      if (a == null) {
        t += this._next_char;
        this._to_char[s] = this._next_char;
        this._to_string[this._next_char] = s;
        this.find_next_char();
      } else {
        t += a;
      }
    }
    return t;
  }

  public to_array(x: string): string[] {
    return Array.from(x).map((s) => this.to_string([s]));
  }
}
