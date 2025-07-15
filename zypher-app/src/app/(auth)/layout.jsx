import '../globals.css';
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // choose weights you need
});

export default function AuthLayout({ children }) {
  return (
      <div className={lexend.className}>
        <main>{children}</main>
      </div>
  );
}
