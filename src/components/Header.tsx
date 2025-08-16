"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Scale, Menu, Phone, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { useComparisonStore } from "../store/useComparisonStore";
import { useFavoritesStore } from "../store/useFavoritesStore";

export default function Header() {
  const pathname = usePathname();
  const { selectedForComparison } = useComparisonStore();
  const { favorites } = useFavoritesStore();

  const isActiveRoute = (route: string) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
              Solace
            </h1>
            <p className="text-xs text-muted-foreground leading-none">
              Find Your Advocate
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/">
            <Button 
              variant={isActiveRoute("/") ? "default" : "ghost"} 
              size="sm"
              className="font-medium"
            >
              Find Advocates
            </Button>
          </Link>
          
          <Link href="/favorites">
            <Button 
              variant={isActiveRoute("/favorites") ? "default" : "ghost"} 
              size="sm"
              className="font-medium relative"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favorites
              {favorites.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {favorites.length}
                </Badge>
              )}
            </Button>
          </Link>
          
          <Link href="/compare">
            <Button 
              variant={isActiveRoute("/compare") ? "default" : "ghost"} 
              size="sm"
              className="font-medium relative"
            >
              <Scale className="h-4 w-4 mr-2" />
              Compare
              {selectedForComparison.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {selectedForComparison.length}
                </Badge>
              )}
            </Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-3 mr-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>1-800-SOLACE</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>help@solace.com</span>
            </div>
          </div>
          
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex items-center justify-between">
            <Link href="/">
              <Button 
                variant={isActiveRoute("/") ? "default" : "ghost"} 
                size="sm"
                className="text-xs"
              >
                Find
              </Button>
            </Link>
            
            <Link href="/favorites">
              <Button 
                variant={isActiveRoute("/favorites") ? "default" : "ghost"} 
                size="sm"
                className="text-xs relative"
              >
                <Heart className="h-3 w-3 mr-1" />
                Favorites
                {favorites.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/compare">
              <Button 
                variant={isActiveRoute("/compare") ? "default" : "ghost"} 
                size="sm"
                className="text-xs relative"
              >
                <Scale className="h-3 w-3 mr-1" />
                Compare
                {selectedForComparison.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {selectedForComparison.length}
                  </Badge>
                )}
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}