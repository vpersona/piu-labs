/**
 * app.js
 * Główny plik inicjujący aplikację.
 * Łączy moduł UI i Store.
 */
import { store } from './store.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicjalizacja interfejsu użytkownika i subskrypcja na zmiany w store.
  initUI();
  console.log("Aplikacja Kształty uruchomiona.");
  console.log("Początkowy stan wczytany ze Store (lub localStorage):", store.getState());
});