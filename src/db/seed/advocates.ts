import db from "..";
import { advocates } from "../schema";

const specialties = [
  "Bipolar",
  "LGBTQ",
  "Medication",
  "Suicide",
  "Anxiety",
  "Depression", 
  "Stress",
  "Grief",
  "Relationships",
  "Trauma",
  "PTSD",
  "Personality",
  "Growth",
  "Substance",
  "Pediatrics",
  "Women",
  "Pain",
  "Nutrition",
  "Eating",
  "Diabetes",
  "Coaching",
  "OCD",
  "ADHD",
  "Sleep",
  "Schizophrenia",
  "Learning",
  "Abuse",
];

const randomSpecialty = () => {
  const random1 = Math.floor(Math.random() * specialties.length);
  const random2 = Math.floor(Math.random() * (specialties.length - random1)) + random1 + 1;

  return [random1, random2];
};

// Helper function to generate realistic profile image URLs
const generateProfileImageUrl = (firstName: string, lastName: string): string => {
  // Using a reliable placeholder service that provides diverse avatar images
  const seed = `${firstName}-${lastName}`.toLowerCase();
  return `https://i.pravatar.cc/150?u=${seed}`;
};

// Helper function to generate realistic bio
const generateBio = (firstName: string, degree: string, experience: number, specialties: string[]): string => {
  const pronouns = Math.random() > 0.5 ? 'they' : Math.random() > 0.5 ? 'he' : 'she';
  const primarySpecialty = specialties[0] || 'mental health';
  
  return `${firstName} is a licensed ${degree === 'MD' ? 'physician' : degree === 'PhD' ? 'psychologist' : 'social worker'} with ${experience} years of experience specializing in ${primarySpecialty.toLowerCase()}. ${pronouns === 'they' ? 'They have' : pronouns === 'he' ? 'He has' : 'She has'} dedicated ${pronouns === 'they' ? 'their' : 'his'} career to helping individuals navigate life's challenges and achieve mental wellness.`;
};

// Base advocate data
const baseAdvocateData = [
  { firstName: "John", lastName: "Doe", city: "New York", degree: "MD", yearsOfExperience: 10, phoneNumber: 5551234567 },
  { firstName: "Jane", lastName: "Smith", city: "Los Angeles", degree: "PhD", yearsOfExperience: 8, phoneNumber: 5559876543 },
  { firstName: "Alice", lastName: "Johnson", city: "Chicago", degree: "MSW", yearsOfExperience: 5, phoneNumber: 5554567890 },
  { firstName: "Michael", lastName: "Brown", city: "Houston", degree: "MD", yearsOfExperience: 12, phoneNumber: 5556543210 },
  { firstName: "Emily", lastName: "Davis", city: "Phoenix", degree: "PhD", yearsOfExperience: 7, phoneNumber: 5553210987 },
  { firstName: "Chris", lastName: "Martinez", city: "Philadelphia", degree: "MSW", yearsOfExperience: 9, phoneNumber: 5557890123 },
  { firstName: "Jessica", lastName: "Taylor", city: "San Antonio", degree: "MD", yearsOfExperience: 11, phoneNumber: 5554561234 },
  { firstName: "David", lastName: "Harris", city: "San Diego", degree: "PhD", yearsOfExperience: 6, phoneNumber: 5557896543 },
  { firstName: "Laura", lastName: "Clark", city: "Dallas", degree: "MSW", yearsOfExperience: 4, phoneNumber: 5550123456 },
  { firstName: "Daniel", lastName: "Lewis", city: "San Jose", degree: "MD", yearsOfExperience: 13, phoneNumber: 5553217654 },
  { firstName: "Sarah", lastName: "Lee", city: "Austin", degree: "PhD", yearsOfExperience: 10, phoneNumber: 5551238765 },
  { firstName: "James", lastName: "King", city: "Jacksonville", degree: "MSW", yearsOfExperience: 5, phoneNumber: 5556540987 },
  { firstName: "Megan", lastName: "Green", city: "San Francisco", degree: "MD", yearsOfExperience: 14, phoneNumber: 5559873456 },
  { firstName: "Joshua", lastName: "Walker", city: "Columbus", degree: "PhD", yearsOfExperience: 9, phoneNumber: 5556781234 },
  { firstName: "Amanda", lastName: "Hall", city: "Fort Worth", degree: "MSW", yearsOfExperience: 3, phoneNumber: 5559872345 },
];

// Generate full advocate data with profile images and bios
const advocateData = baseAdvocateData.map((advocate, index) => {
  const advocateSpecialties = specialties.slice(...randomSpecialty());
  return {
    id: index + 1, // Add unique ID starting from 1
    ...advocate,
    specialties: advocateSpecialties,
    profileImageUrl: generateProfileImageUrl(advocate.firstName, advocate.lastName),
    bio: generateBio(advocate.firstName, advocate.degree, advocate.yearsOfExperience, advocateSpecialties),
  };
});

export { advocateData };
