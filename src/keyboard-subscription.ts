import { IKeyMapping, Keyboard, KeyCallback, KeyEffectMode, KeymapMode } from "./keyboard";

export class KeyboardSubscription {
  public constructor(
    public mappings: Record<string, IKeyMapping>,
    public callback: KeyCallback,
    public effectMode: KeyEffectMode,
    public keymapMode: KeymapMode,
  ) {
    for (const key in this.mappings) {
      const action = this.mappings[key];
      if (typeof action === 'string') {
        this.mappings[key] = {
          action: action,
          repeat: true,
        };
      }
      this.mappings[key].subscription = this;
    }
  }

  public maps(keys: string): IKeyMapping | undefined {
    return this.mappings[keys];
  }

  public dispose(): void {
    Keyboard.unsubscribe(this);
  }

  // public addMapping(keys: string | string[], callback: KeyCallback) {
  //   if (!Array.isArray(keys)) {
  //     keys = [keys];
  //   }
  //   keys.forEach(key => this.mappings.set(key, callback));
  // }
  // public removeMapping(key: string) {
  //   this.mappings.delete(key);
  // }
}
