export function formatMoney(x) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(Number(x));
}
