import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GridBackground from '@/components/GridBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
    themeColor: '#020611',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: `${SITE_CONFIG.name} | ${SITE_CONFIG.courseName}`,
    description: 'አዲሱን የሰው እና የኮምፒውተር መግባቢያ ቋንቋ የሆነውን Prompt Engineering እና AI ክህሎት በተግባራዊ ፕሮጀክቶች የሚማሩበት ኦፊሴላዊ የትምህርት ማዕከል።',
    keywords: ['Prompt Engineering', 'AI Course Ethiopia', 'Aser Academy', 'Remedial Hub', 'Biruk Girma', 'AI Training Addis Ababa'],
    authors: [{ name: 'Biruk Girma' }],
    icons: {
        icon: '/assets/images/axr-logo.png',
        shortcut: '/assets/images/axr-logo.png',
        apple: '/assets/images/axr-logo.png',
    },
    openGraph: {
        title: `${SITE_CONFIG.name} — AI & Prompt Academy`,
        description: SITE_CONFIG.courseName,
        url: SITE_CONFIG.siteUrl,
        siteName: SITE_CONFIG.name,
        images: [
            {
                url: '/assets/images/axr-logo.png',
                width: 800,
                height: 600,
                alt: 'AxR AI Academy Logo',
            },
        ],
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="am" className="dark scroll-smooth">
            <body className={`${inter.className} bg-[#020611] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950`}>
                <GridBackground>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </GridBackground>
            </body>
        </html>
    );
}