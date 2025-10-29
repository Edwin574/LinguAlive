import { Link } from "wouter";
import { Mail, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">LinguAlive</h3>
            <p className="text-muted-foreground text-sm">
              Preserving indigenous languages through community voice recordings and data-driven analysis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-about">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contribute">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-contribute">
                    Contribute
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/listen">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-listen">
                    Explore Recordings
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-contact">
                    Contact
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a 
                href="mailto:contact@lingualive.org" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-social-email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/lingualive" 
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/lingualive" 
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-social-github"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            <p className="text-muted-foreground text-xs mt-6">
              © {new Date().getFullYear()} LinguAlive. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
