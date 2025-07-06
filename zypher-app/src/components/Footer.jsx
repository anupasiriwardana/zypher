// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-[var(--background)] text-[var(--text-primary)] py-8 border-t border-[#2e2e2e]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm">&copy; 2025 Zypher.</p>
            <p className="text-sm">All rights reserved.</p>
          </div>
          <div className="flex gap-4 mt-2">
            <a 
              href="https://x.com/yourprofile" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="X"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.66 3H17.6l-4.1 5.27L9.07 3H3l7.56 9.74L3 21h3.07l4.6-5.93L14.93 21H21l-7.66-9.86L20.66 3z" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com/in/yourprofile" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M4.98 3.5C3.34 3.5 2 4.84 2 6.48c0 1.63 1.34 2.98 2.98 2.98 1.64 0 2.98-1.35 2.98-2.98C7.96 4.84 6.62 3.5 4.98 3.5zM2.4 21.5h5.16V9.98H2.4V21.5zM9.86 9.98V21.5h5.16v-6.21c0-3.35 4.31-3.62 4.31 0v6.21H24V14.4c0-6.1-6.57-5.87-8.98-2.87V9.98H9.86z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold">Product</p>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">How It Works</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Features</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Pricing</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Start a Free Scan</a>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold">Resources</p>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Documentation</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Knowledge Base</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">API Reference</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Blog</a>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold">Company</p>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">About</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Careers</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Contact</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Privacy Policy</a>
          <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
