export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}


export function randomHsl() {
  const hue = Math.floor(Math.random() * 360);
  
  const saturation = Math.floor(Math.random() * 30) + 50;
  const lightness = Math.floor(Math.random() * 25) + 60;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}