"use client";

import Link from "next/link";
import { Heart, Shield, Phone, Mail, MapPin, Clock, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "./ui/button";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-foreground">Advocate Search</h3>
                <p className="text-xs text-muted-foreground leading-none">
                  Find Your Advocate
                </p>
              </div>
            </Link>
            <p className="text-body-sm text-muted-foreground leading-relaxed">
              Connecting you with experienced advocates who understand your needs. 
              Find the right representation with confidence and ease.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Verified & Trusted Advocates</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-h4 font-semibold text-foreground">Quick Links</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Find Advocates
              </Link>
              <Link href="/favorites" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                <div className="flex items-center space-x-2">
                  <Heart className="h-3 w-3" />
                  <span>My Favorites</span>
                </div>
              </Link>
              <Link href="/compare" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Compare Advocates
              </Link>
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                How It Works
              </Link>
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Success Stories
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-h4 font-semibold text-foreground">Support</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-body-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">1-800-ADVOCATE</div>
                  <div className="text-xs">Call us anytime</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-body-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">help@advocate.com</div>
                  <div className="text-xs">24/7 email support</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-body-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-medium">Available 24/7</div>
                  <div className="text-xs">Emergency consultations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-h4 font-semibold text-foreground">Resources</h4>
            <nav className="space-y-2">
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Advocacy Guide
              </Link>
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Advocate Directory
              </Link>
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Consultation Tips
              </Link>
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Advocacy Blog
              </Link>
              <Link href="#" className="block text-body-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                FAQ
              </Link>
            </nav>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 text-body-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Verified Advocates</div>
                <div className="text-xs">Background checked & licensed</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-body-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Client Satisfaction</div>
                <div className="text-xs">98% satisfaction rate</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-body-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">Nationwide Coverage</div>
                <div className="text-xs">Advocates in all 50 states</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-body-sm text-muted-foreground">
              <p>&copy; 2024 Advocate Search. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <Link href="#" className="hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-primary transition-colors duration-200">
                  Accessibility
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-body-sm text-muted-foreground">Follow us:</span>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Facebook className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}