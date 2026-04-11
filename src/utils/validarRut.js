/**
 * Valida un RUT chileno.
 * Acepta formatos: 12345678-9, 12.345.678-9, 12345678-K
 * Retorna true si es válido, false si no.
 */
export function validarRut(rut) {
  if (!rut || typeof rut !== "string") return false;
  const clean = rut.replace(/\./g, "").replace(/\s/g, "").toUpperCase();
  if (!/^\d{7,8}-[\dK]$/.test(clean)) return false;

  const [body, dv] = clean.split("-");
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rem = 11 - (sum % 11);
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  return dv === expected;
}

/**
 * Formatea un RUT limpio a XX.XXX.XXX-Y mientras el usuario escribe.
 * Se puede aplicar en el onChange del input.
 */
export function formatearRut(value) {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}
