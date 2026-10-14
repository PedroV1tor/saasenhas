// JS do navegador. Fica em arquivo porque a CSP (spec 001) proíbe script inline.
'use strict';

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-alternar]');
  if (toggle) {
    const input = document.getElementById(toggle.dataset.alternar);
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    toggle.textContent = hidden ? 'Ocultar' : 'Mostrar';
  }

  const copy = event.target.closest('[data-copiar]');
  if (copy) {
    navigator.clipboard.writeText(document.getElementById(copy.dataset.copiar).value).then(() => {
      copy.textContent = 'Copiada!';
      setTimeout(() => { copy.textContent = 'Copiar'; }, 1500);
    });
  }
});

document.addEventListener('submit', (event) => {
  const message = event.target.dataset.confirmar;
  if (message && !window.confirm(message)) event.preventDefault();
});
