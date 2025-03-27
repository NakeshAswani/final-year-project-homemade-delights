import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p>HomeMade Delights connects you with local home chefs offering delicious homemade food items.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <ul className="space-y-2">
              <li>Email: info@homemadedelights.com</li>
              <li>Phone: +91 5551234567</li>
              <li>Address: 123 Main St, Anytown, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2025 HomeMade Delights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

