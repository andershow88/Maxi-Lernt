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

  const currentRounded = Math.round(currentAvg);
  const targetGrade = currentRounded - 1;
  if (targetGrade < 1) return null;

  const targetAvg = targetGrade + 0.49;
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  const weightedSum = grades.reduce((sum, g) => sum + g.value * g.weight, 0);

  const newWeight = 2;
  const neededGrade = (targetAvg * (totalWeight + newWeight) - weightedSum) / newWeight;

  if (neededGrade < 1) {
    return {
      targetGrade,
      neededGrade: 1,
      message: `Super! Eine 1 in der nächsten Schulaufgabe bringt dich sicher auf die ${targetGrade}.`,
    };
  }

  if (neededGrade > 6) {
    return {
      targetGrade,
      neededGrade: 6,
      message: `Eine ${targetGrade} ist aktuell schwer erreichbar. Bleib dran — mit guten mündlichen Noten wird es leichter!`,
    };
  }

  const rounded = Math.ceil(neededGrade);

  if (rounded <= 2) {
    return {
      targetGrade,
      neededGrade: rounded,
      message: `Mit einer ${rounded} in der nächsten Schulaufgabe kannst du deinen Schnitt auf eine ${targetGrade} verbessern!`,
    };
  }

  if (rounded <= 3) {
    return {
      targetGrade,
      neededGrade: rounded,
      message: `Du bist nah an der besseren Note! Eine ${rounded} in der nächsten Prüfung reicht.`,
    };
  }

  return {
    targetGrade,
    neededGrade: rounded,
    message: `Hier lohnt es sich, regelmäßig kurz zu üben. Eine ${rounded} bringt dich weiter.`,
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
