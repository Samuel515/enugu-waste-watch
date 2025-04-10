
import { Link } from "react-router-dom";
import { Trash2, Github, Instagram, Twitter, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="flex flex-col items-center md:items-center">
            <div className="flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-waste-green" />
              <span className="text-xl font-bold">Enugu Waste Watch</span>
            </div>
            <p className="mt-4 text-sm text-center md:text-center text-muted-foreground">
              Empowering residents to contribute to a cleaner and healthier Enugu State through digital waste management.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-center">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-center md:text-center">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="flex flex-col items-center md:items-center">
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-center md:text-center">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col items-center md:items-center">
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-center md:text-center">
              <li>
                <a
                  href="mailto:info@enuguwaste.gov.ng"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>info@enuguwaste.gov.ng</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2348012345678"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>+234 801 234 5678</span>
                </a>
              </li>
            </ul>
            <div className="flex items-center justify-center gap-4 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Enugu Waste Watch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
