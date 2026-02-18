import React from 'react';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'homechef-kitchen');

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">HomeChef Kitchen</h3>
            <p className="text-sm text-muted-foreground">
              Authentic homemade food prepared with love. Sweets, Chinese, Biryani, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/menu" className="text-muted-foreground hover:text-foreground transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="/book-chef" className="text-muted-foreground hover:text-foreground transition-colors">
                  Book Chef
                </a>
              </li>
              <li>
                <a href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <SiX className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} HomeChef Kitchen. Built with{' '}
            <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
