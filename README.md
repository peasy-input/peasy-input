# Peasy Input

This is the repository for Peasy Input, a small-ish and relatively easy to use input library.

## Introduction

Peasy Input provides uncomplicated input handling that maps keys to actions and let's the application be action based rather than key based. It supports both a callback usage, including repeating and non-repeating actions, as well as a query usage.

## First look

```ts
import { Keyboard } from './../src/keyboard';

Keyboard.initialize(10); // Repeats per second

const subscription = Keyboard.subscribe(
  {
    ArrowLeft: 'walk-left',
    ArrowRight: 'walk-right',
    ArrowDown: 'walk-down',
    ArrowUp: 'walk-up',
    Escape: { action: 'close', repeat: false },
    ' ': { action: 'interact', repeat: false },
    'Shift+ArrowLeft': 'run-left',
    'Shift+ArrowRight': 'run-right',
    'Shift+ArrowDown': 'run-down',
    'Shift+ArrowUp': 'run-up',
  },
  (action: string, doing: boolean) => {
    if (doing) {
      model.actions.push(action);
      switch (action) {
        case 'interact':
          if (model.modal == null) {
            openModal(model);
          } else {
            closeModal(model);
          }
          break;
        case 'close':
          if (model.modal != null) {
            closeModal(model);
          }
          break;
      }
      moveActions(model, action);
    }
  },
  'interval'
);
requestAnimationFrame(input);

function update(now: number) {
  const deltaTime = (now - last) / 1000;
  last = now;
  Keyboard.update(deltaTime);
  requestAnimationFrame(update);
}
```
```ts
function openModal(model) {
  // Code to open modal

  model.modalKeys = Keyboard.subscribe({
    ArrowLeft: { action: 'modal-left', repeat: false },
    ArrowRight: { action: 'modal-right', repeat: false },
    ArrowDown: { action: 'modal-down', repeat: false },
    ArrowUp: { action: 'modal-up', repeat: false },
    ' ': { action: 'select', repeat: false },
  },
    (action: string, doing: boolean) => {
      if (doing) {
        model.actions.push(action);
        if (action === 'select') {
          closeModal(model);
        }
      }
    },
    'interval'
  );
}
function closeModal(model) {
  // Code to close modal
  model.modalKeys.dispose();
  model.modalKeys = null;
}
```
TODO: Finish examples above

## Getting started

If you've got a build process and are using npm, install Peasy Input with

    npm i peasy-input

and `import` it into whichever files you want to use it

```ts
import { Keyboard } from 'peasy-input';
```

If you don't have a build process or don't want to install it, use a `script` tag

```html
<script src="https://unpkg.com/peasy-input">
```
to make `Keyboard` available.

## Features and syntax

TODO

## Development and contributing

If you're interested in contributing, please see the [development guidelines](DEVELOPMENT.md).
