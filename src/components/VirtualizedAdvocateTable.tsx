"use client";

import { memo, useRef, useMemo, useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Advocate } from "../types/advocate";
import { formatPhoneNumber } from "../utils/formatPhone";
import LazyImage from "./LazyImage";

interface RowProps {
  index: number;
  advocate: Advocate;
}

const Row = memo(({ index, advocate }: RowProps) => {
  return (
    <div 
      data-index={index}
      className="flex py-2 border-b border-gray-200 hover:bg-gray-50 transition-colors h-full items-stretch"
      style={{
        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white"
      }}
    >
      <div className="w-[8%] p-2 border-r border-gray-200 text-sm flex-shrink-0 flex items-center justify-center">
        <LazyImage 
          src={advocate.profileImageUrl}
          alt={`${advocate.firstName} ${advocate.lastName}`}
          width={32}
          height={32}
        />
      </div>
      <div className="w-[11%] p-2 border-r border-gray-200 text-sm flex-shrink-0 flex items-center">
        <span className="truncate">{advocate.firstName}</span>
      </div>
      <div className="w-[11%] p-2 border-r border-gray-200 text-sm flex-shrink-0 flex items-center">
        <span className="truncate">{advocate.lastName}</span>
      </div>
      <div className="w-[11%] p-2 border-r border-gray-200 text-sm flex-shrink-0 flex items-center">
        <span className="truncate">{advocate.city}</span>
      </div>
      <div className="w-[14%] p-2 border-r border-gray-200 text-sm flex-shrink-0 flex items-center">
        <span className="truncate">{advocate.degree}</span>
      </div>
      <div className="w-[25%] p-2 border-r border-gray-200 text-sm flex-shrink-0 flex items-start">
        <div className="leading-tight break-words whitespace-normal w-full h-full flex items-start py-1" title={advocate.specialties.join(", ")}>
          {advocate.specialties.join(", ")}
        </div>
      </div>
      <div className="w-[10%] p-2 border-r border-gray-200 text-sm text-center flex-shrink-0 flex items-center justify-center">
        <span>{advocate.yearsOfExperience}</span>
      </div>
      <div className="w-[12%] p-2 text-sm flex-shrink-0 flex items-center">
        <span>{formatPhoneNumber(advocate.phoneNumber)}</span>
      </div>
    </div>
  );
});

Row.displayName = "AdvocateRow";

interface VirtualizedAdvocateTableProps {
  advocates: Advocate[];
  height?: number;
}

const TableHeader = memo(() => (
  <div className="flex items-center bg-gray-100 font-semibold border-b-2 border-gray-300 sticky top-0 z-10 min-h-[60px]">
    <div className="w-[8%] p-3 border-r border-gray-300 text-sm flex-shrink-0 flex items-center justify-center">
      Photo
    </div>
    <div className="w-[11%] p-3 border-r border-gray-300 text-sm flex-shrink-0 flex items-center">
      First Name
    </div>
    <div className="w-[11%] p-3 border-r border-gray-300 text-sm flex-shrink-0 flex items-center">
      Last Name
    </div>
    <div className="w-[11%] p-3 border-r border-gray-300 text-sm flex-shrink-0 flex items-center">
      City
    </div>
    <div className="w-[14%] p-3 border-r border-gray-300 text-sm flex-shrink-0 flex items-center">
      Degree
    </div>
    <div className="w-[25%] p-3 border-r border-gray-300 text-sm flex-shrink-0 flex items-center">
      Specialties
    </div>
    <div className="w-[10%] p-3 border-r border-gray-300 text-sm text-center flex-shrink-0 flex items-center justify-center">
      Experience
    </div>
    <div className="w-[12%] p-3 text-sm flex-shrink-0 flex items-center">
      Phone
    </div>
  </div>
));

TableHeader.displayName = "TableHeader";

// Function to estimate row height based on content and window width
const estimateRowHeight = (advocate: Advocate, windowWidth: number): number => {
  const baseHeight = 50; // Base height for row padding and borders
  const lineHeight = 25; // Approximate height per line of text
  const paddingHeight = 16; // Top and bottom padding
  
  // Calculate approximate width available for specialties column (25% of viewport minus padding/borders)
  const specialtiesColumnWidth = Math.max(180, windowWidth * 0.25 - 30); // Min 180px, with padding/border adjustments
  const charsPerLine = Math.floor(specialtiesColumnWidth / 7.5); // Approximate 7.5px per character for text-sm
  
  // Calculate lines needed for specialties (longest field)
  const specialtiesText = advocate.specialties.join(", ");
  const estimatedSpecialtiesLines = Math.max(1, Math.ceil(specialtiesText.length / Math.max(charsPerLine, 15)));
  const totalHeight = paddingHeight + (estimatedSpecialtiesLines * lineHeight);
  
  return Math.max(baseHeight, totalHeight);
};

export default function VirtualizedAdvocateTable({ 
  advocates, 
  height = 600 
}: VirtualizedAdvocateTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Handle window resize - only on client side
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      // Set initial width
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Memoize row heights for performance, recalculate when window width changes
  const rowHeights = useMemo(() => {
    if (windowWidth === 0) return advocates.map(() => 70); // Default height during SSR
    return advocates.map(advocate => estimateRowHeight(advocate, windowWidth));
  }, [advocates, windowWidth]);

  const virtualizer = useVirtualizer({
    count: advocates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => rowHeights[index] || 70,
    overscan: 5,
    measureElement: (element) => {
      // Measure the actual height of the rendered element
      const height = element?.getBoundingClientRect().height;
      if (height && height > 0) {
        return height;
      }
      // Fallback to estimated height if measurement fails
      const index = parseInt(element?.getAttribute('data-index') ?? '0');
      return rowHeights[index] ?? 70;
    },
  });

  // Force re-measurement when row heights change due to window resize
  useEffect(() => {
    if (virtualizer && windowWidth > 0) {
      virtualizer.measure();
    }
  }, [virtualizer, rowHeights, windowWidth]);

  if (advocates.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No advocates found matching your search criteria.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <TableHeader />
      <div
        ref={parentRef}
        className="overflow-auto flex flex-col"
        style={{ height }}
      >
        <div style={{ height: virtualizer.getVirtualItems()[0]?.start || 0 }} />
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const estimatedHeight = rowHeights[virtualItem.index] || 70;
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              style={{
                height: `${estimatedHeight}px`,
                width: '100%',
              }}
            >
              <Row 
                index={virtualItem.index} 
                advocate={advocates[virtualItem.index]} 
              />
            </div>
          );
        })}
        <div 
          style={{ 
            height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.end || 0) 
          }} 
        />
      </div>
    </div>
  );
}