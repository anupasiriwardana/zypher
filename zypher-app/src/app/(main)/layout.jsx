import '../globals.css';
import { Lexend } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function MainLayout({ children }) {
  return (
    <div className={`${lexend.variable}`}>
      <Navbar />
      <main className="pt-[40px]">{children}</main>
      <Footer />
    </div>
  );
}