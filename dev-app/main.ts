import { Keyboard } from './../src/keyboard';
import { UI } from "peasy-ui";
import 'styles.css';

window.addEventListener('DOMContentLoaded', (event) => {
  main();
});

const model = {
  actions: [] as string[],
  borderElement: null as any,
  modal: null as any,
  modalKeys: null as any,
  x: 100,
  y: 100,
};
async function main(): Promise<void> {
  UI.create(document.body, `
    <div class="main">
      <div class="border" \${ ==> borderElement}>
        <div class="viewport">
          <div \${action <=* actions}>\${action}</div>
        </div>
        <div class="ball" style="translate: \${x}px \${y}px;"></div>
      </div>
   </div>
   `, model);

  Keyboard.initialize(10); // Repeats per second

  // Call subscription.dispose() to remove mapping
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
  requestAnimationFrame(start);
}

let last;
function start(now: number) {
  last = now;
  requestAnimationFrame(update);
}

function update(now: number) {
  const deltaTime = (now - last) / 1000;
  last = now;
  Keyboard.update(deltaTime);
  UI.update();
  requestAnimationFrame(update);
}

function openModal(model) {
  model.modal = UI.create(model.borderElement,
    `<div class="modal">
    A modal with (imagined) options
    that remaps arrow keys and space</div>`,
    {});
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
  model.modal.destroy();
  model.modalKeys.dispose();
  model.modal = null;
  model.modalKeys = null;
}

function moveActions(model, action) {
  let move = 0;
  const [speed, direction] = action.split('-');
  switch (speed) {
    case 'run': move += 4;
    case 'walk': move += 4;
  }
  switch (direction) {
    case 'up':
      moveY(model, -move);
      break;
    case 'down':
      moveY(model, move);
      break;
    case 'left':
      moveX(model, -move);
      break;
    case 'right':
      moveX(model, move);
      break;
  }
}

function moveX(model, d) {
  model.x = Math.max(Math.min(model.x + d, 375), 0);

}
function moveY(model, d) {
  model.y = Math.max(Math.min(model.y + d, 375), 0);

}