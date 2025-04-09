
import { Link } from "react-router-dom";
import { Trash2, Facebook, Twitter, Instagram, Mail, PhoneCall } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-primary-foreground pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="h-6 w-6" />
              <span className="text-xl font-bold">Enugu Waste Watch</span>
            </div>
            <p className="mb-4 opacity-80">
              A digital platform for efficient waste management in Enugu State.
              Report issues, track collection schedules, and participate in
              keeping our community clean.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 opacity-80">
              <li>
                <Link to="/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:underline">About Us</Link>
              </li>
              <li>
                <Link to="/report" className="hover:underline">Report Waste</Link>
              </li>
              <li>
                <Link to="/schedule" className="hover:underline">Collection Schedule</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:underline">FAQ</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-3 opacity-80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>contact@enuguwaste.gov.ng</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 flex-shrink-0" />
                <span>+234 123 456 7890</span>
              </li>
              <li>
                Enugu State Waste Management Authority
                <br />
                Government House, Enugu
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-4 text-center text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} Enugu Waste Watch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
