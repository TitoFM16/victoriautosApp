// Single source of truth for the public sales WhatsApp line.
export const WHATSAPP_NUMBER = '573113178450';
export const WHATSAPP_DISPLAY = '311 317 8450';

export function whatsappUrl(message = 'Hola Victoriautos, quisiera más información.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function carWhatsappUrl(car) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/vitrina/${car.id}` : '';
  return whatsappUrl(
    `Hola Victoriautos, me interesa el ${car.marca} ${car.linea} ${car.modelo}. ${url}`.trim(),
  );
}
