import './globals.css'
import { Lexend } from "next/font/google";

export const metadata = {
    title: "Zypher",
    description: 'Secure pipeline'
};

const lexend = Lexend({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'], // choose weights you need
})

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={lexend.className} suppressHydrationWarning>
                    {children}
            </body>
        </html>
    );
}