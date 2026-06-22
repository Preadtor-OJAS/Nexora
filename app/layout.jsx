import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider';
import { SyncUser } from '@/components/providers/SyncUser';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'Nexora — AI-Powered E-commerce Platform',
    template: '%s | Nexora',
  },
  description:
    'Nexora is a premium AI-powered e-commerce platform for discovering, buying, and managing products with a world-class shopping experience.',
  keywords: ['ecommerce', 'shopping', 'nexora', 'online store', 'premium'],
  authors: [{ name: 'Nexora' }],
  creator: 'Nexora',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nexora.shop',
    title: 'Nexora — AI-Powered E-commerce Platform',
    description: 'Premium AI-powered e-commerce platform',
    siteName: 'Nexora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexora — AI-Powered E-commerce Platform',
    description: 'Premium AI-powered e-commerce platform',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          {/* Lordicon Web Component */}
          <script
            src="https://cdn.lordicon.com/lordicon.js"
            defer
          />
        </head>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <SyncUser />
              {children}
              <Toaster
                theme="dark" // Let's keep toaster dark or we can remove theme="dark" later
                position="bottom-right"
                toastOptions={{
                  className: "bg-background border border-border text-foreground backdrop-blur-2xl",
                }}
              />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
