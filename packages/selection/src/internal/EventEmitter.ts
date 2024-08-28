/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyFunction = (...args: any[]) => any;
type EventMap = Record<string, AnyFunction>;

export class EventTarget<Events extends EventMap> {
  private readonly _listeners = new Map<keyof Events, Set<AnyFunction>>();

  // eslint-disable-next-line @typescript-eslint/unbound-method
  public emit = this.dispatchEvent;

  // eslint-disable-next-line @typescript-eslint/unbound-method
  public off = this.removeEventListener;

  // eslint-disable-next-line @typescript-eslint/unbound-method
  public on = this.addEventListener;

  public addEventListener<K extends keyof Events>(
    event: K,
    cb: Events[K]
  ): this {
    const set = this._listeners.get(event) ?? new Set();
    this._listeners.set(event, set);
    set.add(cb as AnyFunction);

    return this;
  }

  // Let's also support on, off and emit like node
  public dispatchEvent<K extends keyof Events>(
    event: K,
    ...data: Parameters<Events[K]>
  ): unknown {
    let ok = true;

    for (const cb of this._listeners.get(event) ?? []) {
      ok = cb(...data) !== false && ok;
    }

    return ok;
  }
  public removeEventListener<K extends keyof Events>(
    event: K,
    cb: Events[K]
  ): this {
    this._listeners.get(event)?.delete(cb as AnyFunction);

    return this;
  }
  public unbindAllListeners(): void {
    this._listeners.clear();
  }
}
