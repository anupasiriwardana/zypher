import '../globals.css';
import { Lexend } from 'next/font/google';
import Navbar from '@/components/Navbar';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Zypher App',
  description: 'Your app description here',
};

export default function MainLayout({ children }) {
  return (
      <div className={`${lexend.variable}`}>
        <Navbar />
        <main>{children}</main>
      </div>
  );
}