import { KeyboardSubscription } from "./keyboard-subscription";

export type KeyCallback = (key: string, pressed: boolean, deltaTime: number) => void;
export type KeymapMode = 'add' | 'replace';
export type KeyEffectMode = 'instant' | 'interval';

export interface IKeyMapping {
  action: string;
  repeat: boolean;
  subscription?: KeyboardSubscription;
}
// TODO: Add support for multiple keys for one action
export class Keyboard {
  public static rps: number;

  private static element: HTMLElement;
  private static subscriptions: KeyboardSubscription[] = [];
  private static mappings: Map<string, KeyCallback> = new Map();
  private static pressed: Map<string, { keymap: IKeyMapping, repeat: number }> = new Map();
  private static lastPressed: string[] = [];

  public static initialize(rps: number, element = document.body) {
    this.rps = rps;
    this.element = element;
    this.element.addEventListener('keydown', this.keyChange);
    this.element.addEventListener('keyup', this.keyChange);
    return this;
  }

  public static terminate() {
    this.element.removeEventListener('keydown', this.keyChange);
    this.element.removeEventListener('keyup', this.keyChange);
    this.element = null;
  }

  public static subscribe(mappings, callback: KeyCallback, effectMode: KeyEffectMode = 'instant', keymapMode: KeymapMode = 'add'): KeyboardSubscription {
    const subscription = new KeyboardSubscription(mappings, callback, effectMode, keymapMode);
    this.subscriptions.unshift(subscription);
    return subscription;
  }
  public static unsubscribe(subscription: KeyboardSubscription): void {
    this.subscriptions = this.subscriptions.filter(sub => sub !== subscription);
    for (const key of this.pressed.keys()) {
      if (this.pressed.get(key).keymap.subscription === subscription) {
        this.pressed.delete(key);
      }
    }
    this.lastPressed = [...this.pressed.keys()];
  }

  public static keyChange = (event: KeyboardEvent): void => {
    let keys = event.key;
    if (['Control', 'Alt', 'Shift'].includes(keys)) {
      if (event.type === 'keydown') {
        for (const pressed of this.pressed.keys()) {
          const pressedKeys = pressed.split('+');
          if (pressedKeys.includes(keys)) {
            continue;
          }
          let modifiedPressed = pressedKeys.pop();
          for (const modifier of ['Shift', 'Alt', 'Control']) {
            if (keys === modifier || pressedKeys.includes(modifier)) {
              modifiedPressed = `${modifier}+${modifiedPressed}`;
            }
          }

          Keyboard.resolve(pressed, 'keyup');
          Keyboard.resolve(modifiedPressed, 'keydown');
        }
      } else if (event.type === 'keyup') {
        for (const pressed of this.pressed.keys()) {
          const pressedKeys = pressed.split('+');
          if (!pressedKeys.includes(keys)) {
            continue;
          }
          const modifiedPressed = pressedKeys.filter(key => key !== keys).join('+');

          Keyboard.resolve(pressed, 'keyup');
          Keyboard.resolve(modifiedPressed, 'keydown');
        }
      }
    } else {
      if (event.shiftKey) {
        keys = `Shift+${keys}`;
      }
      if (event.altKey) {
        keys = `Alt+${keys}`;
      }
      if (event.ctrlKey) {
        keys = `Control+${keys}`;
      }
      Keyboard.resolve(keys, event.type);
    }
  }

  public static resolve(keys: string, eventType: string) {
    const mapped = this.mapped(keys);
    if (mapped == null) {
      return;
    }

    if (mapped.subscription.effectMode === 'instant') {
      mapped.subscription.callback(mapped.action, eventType === 'keydown', 0);
      return;
    }

    if (eventType === 'keydown') {
      if (!this.pressed.has(keys)) {
        this.pressed.set(keys, { keymap: mapped, repeat: 0 });
      }
    } else if (eventType === 'keyup') {
      this.pressed.delete(keys);
    }
  }

  public static update(deltaTime: number) {
    this.pressed.forEach((mapped, key) => {
      if (mapped.repeat === 0 || (mapped.keymap.repeat && mapped.repeat <= 0)) {
        mapped.keymap.subscription.callback(mapped.keymap.action, true, deltaTime);
        mapped.repeat += this.rps;
      } else {
        // console.log('NO REPEAT', mapped.repeat);
        if (!mapped.keymap.repeat) {
          mapped.keymap.subscription.callback(mapped.keymap.action, false, deltaTime);
        } else {
          mapped.repeat -= deltaTime * 1000;
        }
      }
    });
    this.lastPressed.forEach(keys => {
      if (!this.pressed.has(keys)) {
        const mapped = this.mapped(keys);
        mapped.subscription.callback(mapped.action, false, deltaTime);
      }
    });
    this.lastPressed = [...this.pressed.keys()];
  }

  public static mapped(keys: string): IKeyMapping | undefined {
    let mapped;
    for (const subscription of this.subscriptions) {
      mapped = subscription.maps(keys);
      if (mapped != null || subscription.keymapMode === 'replace') {
        break;
      }
    }
    return mapped;
  }
}
