export const MOTIVOS_REPORTE = [
  { val: "spam",                  label: "Spam o publicidad no deseada" },
  { val: "contenido_inapropiado", label: "Contenido inapropiado u ofensivo" },
  { val: "acoso",                 label: "Acoso o intimidación" },
  { val: "informacion_falsa",     label: "Información falsa o engañosa" },
  { val: "otro",                  label: "Otro motivo" },
];

export const MOTIVO_LABEL = Object.fromEntries(
  MOTIVOS_REPORTE.map(({ val, label }) => [val, label])
);
