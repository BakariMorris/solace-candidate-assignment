import React from 'react';

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

export function HighlightText({ 
  text, 
  searchTerm, 
  className = '', 
  highlightClassName = 'px-1 rounded font-medium' 
}: HighlightTextProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className={highlightClassName} style={{backgroundColor: '#0bf0bc'}}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="px-1 rounded font-medium" style="background-color: #0bf0bc">$1</mark>');
}