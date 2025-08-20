"use client";

import { useComparisonStore } from "../../store/useComparisonStore";
import ComparisonTable from "../../components/ComparisonTable";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Users, Trash2, Scale, Download } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const { selectedForComparison, clearComparison } = useComparisonStore();

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all comparisons?")) {
      clearComparison();
    }
  };

  const handleExport = () => {
    // Simple CSV export functionality
    const csvContent = generateCSV(selectedForComparison);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advocate-comparison.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (advocates: any[]) => {
    const headers = ['Name', 'Degree', 'Location', 'Experience', 'Specialties'];
    const rows = advocates.map(advocate => [
      `${advocate.firstName} ${advocate.lastName}`,
      advocate.degree,
      advocate.city,
      `${advocate.yearsOfExperience} years`,
      advocate.specialties.join('; ')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\\n');
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </Link>
            <div>
              <h1 className="text-display flex items-center gap-3">
                <Scale className="h-8 w-8 text-primary" />
                Compare Healthcare Advocates
              </h1>
              <p className="text-body-lg text-muted-foreground">
                Compare healthcare advocates side by side to make the best choice for your needs
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedForComparison.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {selectedForComparison.length} of 4 Selected
          </Badge>
          {selectedForComparison.length < 4 && (
            <Badge variant="outline">
              Add up to {4 - selectedForComparison.length} more to compare
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {selectedForComparison.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-h3 font-semibold mb-2">No Healthcare Advocates Selected</h2>
            <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your comparison by adding healthcare advocates from the search results. 
              Look for the "Compare" button on each healthcare advocate card.
            </p>
            <Link href="/">
              <Button>
                Browse Healthcare Advocates
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Instructions */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Comparison Tips:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review each advocate's experience level and specialties</li>
                <li>• Compare availability and hourly rates</li>
                <li>• Consider location proximity for in-person meetings</li>
                <li>• Check ratings and reviews for quality indicators</li>
              </ul>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardContent className="p-0">
              <ComparisonTable advocates={selectedForComparison} />
            </CardContent>
          </Card>

          {/* Summary Actions */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Next Steps</h3>
              <div className="flex flex-wrap gap-3">
                <Button>
                  Contact Selected Healthcare Advocates
                </Button>
                <Button variant="outline">
                  Save Comparison
                </Button>
                <Button variant="outline">
                  Share Comparison
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}