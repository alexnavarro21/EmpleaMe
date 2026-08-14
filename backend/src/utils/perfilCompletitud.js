function validarRut(rut) {
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

// Espejo de src/utils/perfilCompletitud.js — mantener ambos en sync.
function calcularCompletitud(perfil) {
  if (!perfil) return 0;
  const rutValido = validarRut(perfil.rut || "");
  const campos = [
    perfil.nombre_completo,
    perfil.carrera,
    perfil.telefono,
    perfil.biografia,
    perfil.estado_civil,
    rutValido ? perfil.rut : "",
    perfil.region,
    perfil.comuna,
  ];
  return Math.round((campos.filter(Boolean).length / 8) * 100);
}

module.exports = { calcularCompletitud, validarRut };
