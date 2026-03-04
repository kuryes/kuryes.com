import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata: Metadata = {
    title: 'Kuryes - Kuryelerin Platformu',
    description: 'Kuryelerin kazanç hesaplayıcı, PSEO sayfaları ve bilgi paylaşım platformu.',
    manifest: '/manifest.json', // Not implemented yet but good to have
    icons: {
        icon: '/favicon.png',
        apple: '/pwa.png',
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr">
            <body className={`${inter.variable} ${poppins.variable} font-sans bg-gray-50 text-gray-900 flex flex-col min-h-screen`}>
                <Header />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
