import './globals.css';
import { Lexend } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // choose weights you need
});

export const metadata = {
  title: 'Zypher App',
  description: 'Your app description here',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={lexend.className}>
      <Navbar />
        {children}
      <Footer />
      </body>
    </html>
  );
}
