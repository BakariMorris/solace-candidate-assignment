"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Advocate } from "../types/advocate";

const fetchAdvocates = async (): Promise<Advocate[]> => {
  const res = await fetch("/api/advocates");
  const jsonResponse = await res.json();
  return jsonResponse.data;
};

export default function Home() {
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: advocates = [], isLoading, error } = useQuery({
    queryKey: ['advocates'],
    queryFn: fetchAdvocates,
  });

  // Update filtered advocates when advocates data changes
  useEffect(() => {
    setFilteredAdvocates(advocates);
  }, [advocates]);

  const filterAdvocates = (advocate: Advocate, term: string) => {
    // Early return for empty search term
    if (!term.trim()) return true;
    
    const lowerSearchTerm = term.toLowerCase();
    
    // Check string fields with case-insensitive comparison
    if (advocate.firstName.toLowerCase().includes(lowerSearchTerm) ||
        advocate.lastName.toLowerCase().includes(lowerSearchTerm) ||
        advocate.city.toLowerCase().includes(lowerSearchTerm) ||
        advocate.degree.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }
    
    // Check specialties array efficiently
    if (advocate.specialties.some(specialty => 
        specialty.toLowerCase().includes(lowerSearchTerm))) {
      return true;
    }
    
    // Check years of experience (convert once)
    return advocate.yearsOfExperience.toString().includes(lowerSearchTerm);
  }


  const changeInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    const filteredResults = advocates.filter(advocate => 
      filterAdvocates(advocate, newSearchTerm)
    );
    setFilteredAdvocates(filteredResults);
  };

  const resetHandler = () => {
    setSearchTerm('');
    setFilteredAdvocates(advocates);
  };

  if (isLoading) return <div>Loading advocates...</div>;
  if (error) return <div>Error loading advocates: {error.message}</div>;

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
        </p>
        <input 
          style={{ border: "1px solid black" }} 
          value={searchTerm}
          onChange={changeInputHandler} 
        />
        <button onClick={resetHandler}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => {
            return (
              <tr key={advocate.id}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s, index) => (
                    <div key={index}>{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
