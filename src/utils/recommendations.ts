import { Advocate } from "../types/advocate";

export function calculateSimilarityScore(advocate1: Advocate, advocate2: Advocate): number {
  let score = 0;
  
  // Specialty overlap (most important factor)
  const commonSpecialties = advocate1.specialties.filter(specialty =>
    advocate2.specialties.includes(specialty)
  );
  score += commonSpecialties.length * 3;
  
  // Location match
  if (advocate1.city === advocate2.city) {
    score += 2;
  }
  
  // Degree match
  if (advocate1.degree === advocate2.degree) {
    score += 1;
  }
  
  // Experience level similarity (within 5 years)
  const experienceDiff = Math.abs(advocate1.yearsOfExperience - advocate2.yearsOfExperience);
  if (experienceDiff <= 5) {
    score += (5 - experienceDiff) * 0.5;
  }
  
  return score;
}

export function getSimilarAdvocates(
  currentAdvocate: Advocate,
  allAdvocates: Advocate[],
  limit: number = 4
): Advocate[] {
  if (!currentAdvocate.id) return [];
  
  const otherAdvocates = allAdvocates.filter(advocate => 
    advocate.id !== currentAdvocate.id
  );
  
  const advocatesWithScores = otherAdvocates.map(advocate => ({
    advocate,
    score: calculateSimilarityScore(currentAdvocate, advocate)
  }));
  
  // Sort by similarity score (descending) and return top matches
  return advocatesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.advocate);
}

export function getRecommendedAdvocates(
  favorites: Advocate[],
  comparisonList: Advocate[],
  allAdvocates: Advocate[],
  limit: number = 6
): Advocate[] {
  if (favorites.length === 0 && comparisonList.length === 0) {
    // Return random advocates if no user preferences
    return allAdvocates
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }
  
  const userPreferences = [...favorites, ...comparisonList];
  const excludeIds = new Set(userPreferences.map(advocate => advocate.id));
  
  const candidateAdvocates = allAdvocates.filter(advocate => 
    !excludeIds.has(advocate.id)
  );
  
  const advocatesWithScores = candidateAdvocates.map(candidate => {
    let totalScore = 0;
    
    userPreferences.forEach(preference => {
      totalScore += calculateSimilarityScore(preference, candidate);
    });
    
    return {
      advocate: candidate,
      score: totalScore / userPreferences.length // Average similarity
    };
  });
  
  return advocatesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.advocate);
}