/**
 * ui.js
 * Moduł odpowiedzialny za manipulację DOM i obsługę zdarzeń.
 * Subskrybuje zmiany w store.
 */
import { store } from './store.js';

// Elementy DOM
const board = document.getElementById('board');
const controls = document.querySelector('.controls');
const cntSquaresEl = document.getElementById('cntSquares');
const cntCirclesEl = document.getElementById('cntCircles');

// Helper: Tworzy element kształtu na podstawie danych ze store
function createShapeElement(shape) {
  const el = document.createElement('div');
  el.className = `shape ${shape.type}`;
  el.style.backgroundColor = shape.color;
  el.dataset.id = shape.id;
  el.dataset.type = shape.type;
  return el;
}

// RENDEROWANIE KONTENERÓW/LICZNIKÓW
function renderCounters(state) {
  cntSquaresEl.textContent = store.getShapeCount('square');
  cntCirclesEl.textContent = store.getShapeCount('circle');
}

// RENDEROWANIE LISTY KSZTAŁTÓW (DIFFING DOM)
function renderShapes(state) {
  const currentShapes = Array.from(board.children);
  const shapesData = state.shapes;

  // 1. USUWANIE: Usuń kształty, których nie ma już w stanie
  currentShapes.forEach(el => {
    const id = el.dataset.id;
    if (!shapesData.some(s => s.id === id)) {
      el.remove();
    }
  });

  // 2. DODAWANIE/AKTUALIZACJA:
  shapesData.forEach(shape => {
    let el = board.querySelector(`[data-id="${shape.id}"]`);

    if (!el) {
      // DODAWANIE: Kształt jest nowy, więc go tworzymy i dodajemy
      el = createShapeElement(shape);
      board.appendChild(el);
    } else {
      // AKTUALIZACJA: Kształt już istnieje, sprawdźmy, czy kolor się zmienił (recolor)
      if (el.style.backgroundColor !== shape.color) {
        el.style.backgroundColor = shape.color;
      }
    }
  });
}

// Główna funkcja renderująca interfejs na podstawie stanu
const renderUI = (state) => {
  renderCounters(state);
  renderShapes(state);
};

// --- OBSŁUGA ZDARZEŃ ---

// 1. Zdarzenia na przyciskach (Delegacja na 'controls')
controls.addEventListener('click', (e) => {
  const target = e.target;
  const action = target.dataset.action;
  const shape = target.dataset.shape;

  if (action === 'add' && shape) {
    store.addShape(shape);
  } else if (action === 'recolor' && shape) {
    store.recolor(shape);
  }
});

// 2. Zdarzenie na kliknięcie kształtu (Delegacja na 'board')
board.addEventListener('click', (e) => {
  const target = e.target;
  // Sprawdzenie, czy kliknięty element ma klasę 'shape' i posiada id
  if (target.classList.contains('shape') && target.dataset.id) {
    const id = target.dataset.id;
    // Interfejs zmienia stan, a store sam powiadomi subskrybentów
    store.removeShape(id);
  }
});

// --- INICJACJA ---

export function initUI() {
  // Subskrybujemy store. Funkcja renderUI będzie wywoływana przy każdej zmianie stanu.
  // Zostanie wywołana raz natychmiast po subskrypcji z początkowym stanem.
  store.subscribe(renderUI);
}