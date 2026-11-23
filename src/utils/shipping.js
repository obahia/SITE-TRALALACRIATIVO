import { SHIPPING } from '../data/occasions';

// Códigos postais (4 primeiros dígitos) do distrito de Leiria.
// Manter igual às edge functions create-checkout-session e stripe-webhook,
// que são quem decide o valor cobrado; aqui serve só para mostrar antes de pagar.
const LEIRIA_RANGES = [
  [2400, 2499], // Leiria, Marinha Grande, Batalha, Porto de Mós, Alcobaça, Nazaré
  [2500, 2529], // Caldas da Rainha, Óbidos, Peniche
  [2540, 2549], // Bombarral
  [3100, 3109], // Pombal
  [3240, 3289], // Ansião, Alvaiázere, Figueiró dos Vinhos, Pedrógão Grande, Castanheira de Pera
];

/**
 * @returns {{ ok: true, postal: string, zone: 'leiria'|'continente' } | { ok: false, error: string }}
 */
export function zoneForPostal(raw) {
  const match = String(raw || '').trim().match(/^(\d{4})-?(\d{3})$/);
  if (!match || Number(match[1]) < 1000) {
    return { ok: false, error: 'Indique um código postal válido, por exemplo 2400-123.' };
  }
  const prefix = Number(match[1]);
  if (prefix >= 9000) {
    return { ok: false, error: 'Para os Açores e a Madeira, peça-nos orçamento para o envio.' };
  }
  const leiria = LEIRIA_RANGES.some(([from, to]) => prefix >= from && prefix <= to);
  return { ok: true, postal: `${match[1]}-${match[2]}`, zone: leiria ? 'leiria' : 'continente' };
}

/** Portes em euros para a zona e o subtotal de produtos. */
export function shippingFor(zone, subtotal) {
  if (subtotal >= SHIPPING.freeFrom) return 0;
  return zone === 'leiria' ? SHIPPING.leiriaPrice : SHIPPING.cttPrice;
}
