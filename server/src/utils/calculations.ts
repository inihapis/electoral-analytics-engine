/**
 * Shared calculation utilities for BPD scoring system.
 * Implements PRD §6 (Logika Perhitungan), §13 (Normalisasi), §14 (Validasi).
 */

export const INDICATOR_WEIGHTS = {
  suratBaiat: 5.5,
  afiliasiPolitik: 4.2,
  videoDukungan: 3.8,
  kedekatanMc: 3.2,
  atributFisik: 2.1,
  sosialMedia: 1.2,
} as const;

export const MAX_SCORE = 100;       // PRD §14: Skor tidak melebihi 100%
export const MAX_VOTES_PER_BPD = 5; // PRD §14: Suara maksimal 5 per BPD
export const MAX_TOTAL_VOTES = 190; // PRD §14: Total suara maksimal 190
export const TARGET_VOTES = 96;     // PRD §6: Target kemenangan 96 suara

/**
 * Round a number to 2 decimal places using banker's rounding.
 * Avoids floating-point artifacts (e.g. 49.49999999 → 49.50).
 */
export function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate total points from indicator flags.
 */
export function calculateTotalPoints(indicators: {
  suratBaiat: boolean;
  afiliasiPolitik: boolean;
  videoDukungan: boolean;
  kedekatanMc: boolean;
  atributFisik: boolean;
  sosialMedia: boolean;
}): number {
  let totalPoints = 0;
  if (indicators.suratBaiat) totalPoints += INDICATOR_WEIGHTS.suratBaiat;
  if (indicators.afiliasiPolitik) totalPoints += INDICATOR_WEIGHTS.afiliasiPolitik;
  if (indicators.videoDukungan) totalPoints += INDICATOR_WEIGHTS.videoDukungan;
  if (indicators.kedekatanMc) totalPoints += INDICATOR_WEIGHTS.kedekatanMc;
  if (indicators.atributFisik) totalPoints += INDICATOR_WEIGHTS.atributFisik;
  if (indicators.sosialMedia) totalPoints += INDICATOR_WEIGHTS.sosialMedia;
  return roundTo2(totalPoints);
}

/**
 * Calculate score (%) from total points.
 * PRD §6: Skor (%) = Total Poin × 5
 * PRD §14: Maksimal skor 100%
 */
export function calculateScore(totalPoints: number): number {
  const raw = totalPoints * 5;
  return Math.min(roundTo2(raw), MAX_SCORE);
}

/**
 * Calculate estimated votes from score.
 * PRD §6: Estimasi Suara = (Skor / 100) × 5
 * PRD §14: Suara maksimal 5 per BPD
 */
export function calculateEstimatedVotes(score: number): number {
  const raw = (score / 100) * 5;
  return Math.min(roundTo2(raw), MAX_VOTES_PER_BPD);
}

/**
 * Compute all derived values for a BPD record.
 */
export function computeBpdScores(bpd: {
  suratBaiat: boolean;
  afiliasiPolitik: boolean;
  videoDukungan: boolean;
  kedekatanMc: boolean;
  atributFisik: boolean;
  sosialMedia: boolean;
}): { totalPoints: number; score: number; estimatedVotes: number } {
  const totalPoints = calculateTotalPoints(bpd);
  const score = calculateScore(totalPoints);
  const estimatedVotes = calculateEstimatedVotes(score);
  return { totalPoints, score, estimatedVotes };
}

/**
 * Calculate aggregate stats from an array of BPD records with scores.
 * PRD §7: Total Dukungan vs Total Efektif
 * PRD §14: Total suara maksimal 190
 */
export function calculateAggregateStats(bpdsWithScores: { estimatedVotes: number }[]): {
  totalDukungan: number;
  totalEfektif: number;
  progress: number;
} {
  // Total Dukungan: Jumlah BPD × 5 (deterministik)
  const totalDukungan = Math.min(bpdsWithScores.length * MAX_VOTES_PER_BPD, MAX_TOTAL_VOTES);
  
  // Total Efektif: Σ (Estimasi Suara seluruh BPD) (analitik utama)
  const rawTotalEfektif = bpdsWithScores.reduce((acc, b) => acc + b.estimatedVotes, 0);
  const totalEfektif = Math.min(roundTo2(rawTotalEfektif), MAX_TOTAL_VOTES);
  
  // Progress: Total Efektif / 96 (PRD §7)
  const progress = roundTo2((totalEfektif / TARGET_VOTES) * 100);
  
  return { totalDukungan, totalEfektif, progress };
}

/**
 * Calculate candidate aggregation stats from candidate indicators.
 * Returns real-time calculated values for each candidate.
 */
export function calculateCandidateStats(candidateIndicators: Array<{
  candidateId: string;
  candidateName: string;
  candidateColor: string;
  candidateAffiliation?: string;
  indicators: Array<{
    estimatedVotes: number;
    score: number;
    totalPoints: number;
  }>;
}>): Array<{
  candidateId: string;
  candidateName: string;
  candidateColor: string;
  candidateAffiliation?: string;
  totalBpdDukung: number;
  totalSuaraRiil: number;
  totalSkorProbabilitas: number;
  progress: number;
}> {
  return candidateIndicators.map(({ candidateId, candidateName, candidateColor, candidateAffiliation, indicators }) => {
    // Total BPD Dukung: jumlah BPD yang mendukung kandidat
    const totalBpdDukung = indicators.length;
    
    // Total Suara Riil: hasil akumulasi estimasi suara
    const rawTotalSuaraRiil = indicators.reduce((acc, ind) => acc + ind.estimatedVotes, 0);
    const totalSuaraRiil = roundTo2(rawTotalSuaraRiil);
    
    // Total Skor Probabilitas: agregasi skor dari seluruh BPD terkait
    const rawTotalSkorProbabilitas = indicators.reduce((acc, ind) => acc + ind.score, 0);
    const totalSkorProbabilitas = roundTo2(rawTotalSkorProbabilitas);
    
    // Progress ke 50%+1: berdasarkan rumus di PRD
    const progress = roundTo2((totalSuaraRiil / TARGET_VOTES) * 100);
    
    return {
      candidateId,
      candidateName,
      candidateColor,
      candidateAffiliation,
      totalBpdDukung,
      totalSuaraRiil,
      totalSkorProbabilitas,
      progress
    };
  });
}
