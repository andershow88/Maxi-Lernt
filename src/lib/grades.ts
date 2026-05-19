type GradeEntry = { value: number; weight: number };

export function calculateWeightedAverage(grades: GradeEntry[]): number | null {
  if (grades.length === 0) return null;
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  if (totalWeight === 0) return null;
  const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);
  return weightedSum / totalWeight;
}

export function calculateOverallAverage(subjectAverages: (number | null)[]): number | null {
  const valid = subjectAverages.filter((a): a is number => a !== null);
  if (valid.length === 0) return null;
  return valid.reduce((sum, a) => sum + a, 0) / valid.length;
}

export function getMotivationHint(currentAvg: number): string | null {
  if (currentAvg <= 1.5) return "Läuft bei dir! Absolut stark.";
  if (currentAvg <= 2.0) return "Richtig gut, bleib am Ball!";
  if (currentAvg <= 2.5) return "Sauber! Da steckt noch mehr drin.";
  if (currentAvg <= 3.0) return "Gute Basis — du kannst das!";
  if (currentAvg <= 3.5) return "Dranbleiben lohnt sich, du packst das!";
  if (currentAvg <= 4.0) return "Jeder Schritt zählt, weiter so!";
  if (currentAvg <= 4.5) return "Kopf hoch — mit Übung geht's bergauf!";
  return "Nicht aufgeben, jede Verbesserung zählt!";
}

export function getMotivationalMessage(avg: number | null): string {
  if (avg === null) return "Trage deine erste Note ein!";
  if (avg <= 1.5) return "Herausragend! Weiter so!";
  if (avg <= 2.0) return "Sehr gut! Du bist auf einem tollen Weg.";
  if (avg <= 2.5) return "Gut gemacht! Da ist noch Luft nach oben.";
  if (avg <= 3.5) return "Solide Leistung. Mit etwas Übung geht noch mehr!";
  if (avg <= 4.5) return "Hier kannst du dich noch verbessern. Du schaffst das!";
  return "Nicht aufgeben — jede Verbesserung zählt!";
}
