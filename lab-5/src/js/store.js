/**
 * store.js
 * Centralny Store aplikacji z implementacją Wzorca Obserwator.
 * Zarządza stanem i synchronizuje go z localStorage.
 */
import { createId, randomHsl } from './helpers.js';

const LOCAL_STORAGE_KEY = 'ksztaltyAppState';

class Store {
  constructor(initialState) {
    this.state = this.loadState(initialState);
    this.subscribers = [];
  }

  // Wczytanie stanu z localStorage
  loadState(defaultState) {
    try {
      const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (serializedState === null) {
        return defaultState;
      }
      return JSON.parse(serializedState);
    } catch (e) {
      console.warn("Nie udało się wczytać stanu z localStorage", e);
      return defaultState;
    }
  }

  // Zapis stanu do localStorage i powiadomienie subskrybentów
  saveAndNotify() {
    try {
      const serializedState = JSON.stringify(this.state);
      localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (e) {
      console.error("Błąd zapisu do localStorage", e);
    }
    this.notify();
  }

  // Metoda subskrypcji (Obserwator)
  subscribe(callback) {
    this.subscribers.push(callback);
    // Natychmiastowe wywołanie dla początkowego stanu
    callback(this.state); 
    // Zwrócenie funkcji do usunięcia subskrypcji
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Metoda powiadamiania (Obserwator)
  notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  // Metoda zwracająca bieżący stan
  getState() {
    return this.state;
  }

  // --- MUTACJE STANU ---
  
  addShape(type) {
    const newShape = {
      id: createId(),
      type: type, // 'square' lub 'circle'
      color: randomHsl(),
    };
    // Zmieniamy stan
    this.state = {
      ...this.state,
      shapes: [...this.state.shapes, newShape],
    };
    // Zapisujemy i powiadamiamy
    this.saveAndNotify();
  }

  removeShape(id) {
    this.state = {
      ...this.state,
      shapes: this.state.shapes.filter(s => s.id !== id),
    };
    this.saveAndNotify();
  }

  recolor(type) {
    this.state = {
      ...this.state,
      shapes: this.state.shapes.map(s => {
        if (s.type === type) {
          return { ...s, color: randomHsl() };
        }
        return s;
      }),
    };
    this.saveAndNotify();
  }

  // --- LICZNIKI (DYNAMICZNE) ---

  getShapeCount(type) {
    return this.state.shapes.filter(s => s.type === type).length;
  }
}

// Początkowy stan (jeśli nie ma nic w localStorage)
const initialState = {
  shapes: [],
};

// Eksportujemy instancję Store jako Singleton
export const store = new Store(initialState);