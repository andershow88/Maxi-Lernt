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

export function getImprovementHint(
  currentAvg: number,
  grades: GradeEntry[],
): { targetGrade: number; neededGrade: number; message: string } | null {
  if (grades.length === 0) return null;

  // Zeugnisnote: 1.00–1.49 → 1, 1.50–2.49 → 2, etc.
  const zeugnisNote = currentAvg < 1.5 ? 1 : Math.round(currentAvg);
  const targetGrade = zeugnisNote - 1;
  if (targetGrade < 1) return null;

  // Ziel-Durchschnitt: knapp unter der Rundungsgrenze
  const targetAvg = targetGrade + 0.49;

  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);

  // Schulaufgabe zählt 2-fach
  const newWeight = 2;
  const neededExact = (targetAvg * (totalWeight + newWeight) - weightedSum) / newWeight;

  // Nur ganze oder halbe Noten möglich (1, 1.5, 2, ..., 6)
  const neededGrade = Math.ceil(neededExact);

  // Gegenprobe: ergibt die gerundete Note tatsächlich den Zielschnitt?
  const newAvg = (weightedSum + neededGrade * newWeight) / (totalWeight + newWeight);
  if (neededGrade < 1 || neededGrade > 6 || newAvg > targetAvg + 0.005) {
    if (neededExact < 1) {
      return {
        targetGrade,
        neededGrade: 1,
        message: `Super! Eine 1 in der nächsten Schulaufgabe bringt dich auf die ${targetGrade}.`,
      };
    }
    return {
      targetGrade,
      neededGrade: zeugnisNote,
      message: `Eine ${targetGrade} im Zeugnis ist mit einer einzelnen Prüfung nicht mehr erreichbar. Bleib dran — mit guten mündlichen Noten wird es leichter!`,
    };
  }

  if (neededGrade <= 2) {
    return {
      targetGrade,
      neededGrade,
      message: `Mit einer ${neededGrade} in der nächsten Schulaufgabe kannst du deinen Schnitt auf eine ${targetGrade} verbessern!`,
    };
  }

  if (neededGrade <= 3) {
    return {
      targetGrade,
      neededGrade,
      message: `Du bist nah an der besseren Note! Eine ${neededGrade} in der nächsten Prüfung reicht.`,
    };
  }

  return {
    targetGrade,
    neededGrade,
    message: `Hier lohnt es sich, regelmäßig kurz zu üben. Eine ${neededGrade} bringt dich weiter.`,
  };
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
