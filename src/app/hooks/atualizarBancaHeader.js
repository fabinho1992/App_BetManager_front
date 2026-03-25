export function atualizarBancaHeader() {
  window.dispatchEvent(new Event("bancaAtualizada"));
}