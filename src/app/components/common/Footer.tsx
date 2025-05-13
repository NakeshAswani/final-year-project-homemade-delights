import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-primary-50 border-t border-primary-700">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-32">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              HomeMade Delights
            </h3>
            <p className="text-primary-200 text-sm leading-[28px]">
              Connecting food lovers with passionate home chefs since 2023. 
              Experience authentic homemade flavors delivered to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/about", text: "About Us" },
                { href: "/products", text: "Our Products" }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-200 hover:underline transition-colors text-sm flex items-center gap-2"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Connect
            </h4>
            <ul className="space-y-3 text-primary-200 text-sm">
              <li className="flex items-center gap-3 hover:underline transition-colors">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@homemadedelights.com">info@homemadedelights.com</a>
              </li>
              <li className="flex items-center gap-3 hover:underline transition-colors">
                <Phone className="w-4 h-4" />
                <a href="tel:+915551234567">+91 555 123 4567</a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>123 Gourmet Lane,<br/>Foodie City, IN 560001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-4 border-t border-primary-700 text-center">
          <p className="text-xs text-primary-400">
            © 2025 HomeMade Delights. Crafted with ❤️ in India.
          </p>
        </div>
      </div>
    </footer>
  )
}