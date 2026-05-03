export const CANDIDATE_COLORS: Record<string, string> = {
  'reynaldo bryan': '#3b82f6',
  'ade jona': '#ef4444',
  'afie kalla': '#eab308',
  'anthony leong': '#22c55e',
  'default': '#94a3b8',
  'gray': '#94a3b8',
};

export const getCandidateColor = (name?: string | null) => {
  if (!name) return CANDIDATE_COLORS.default;
  return CANDIDATE_COLORS[name.toLowerCase()] || CANDIDATE_COLORS.default;
};

export const SUPPORT_STATUS_LABELS: Record<string, string> = {
  TERKUNCI: 'Terkunci',
  MENGARAH: 'Mengarah',
  DINAMIS: 'Dinamis',
};

export const CHARACTERISTIC_LABELS: Record<string, string> = {
  SOLID: 'Solid',
  RENTAN: 'Rentan',
  WASPADA: 'Waspada',
};
