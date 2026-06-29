{/*ClerkProvider – wraps the app to provide authentication context.*/}

{/*ConvexClientProvider – wraps the app with access to the Convex backend.*/}


import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "../components/convex-client-provider";
import Header from "../components/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
// Defines the page title and description for SEO and browser display:
export const metadata = {
  title: "Expenso",
  description: "The smartest way to split expenses with friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/logos/logo-s.png" sizes="any" />
      </head>

      <body className={`${inter.className}`}>
        <ClerkProvider
            // Provides Clerk authentication context using a publishable key.
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
            {/*Connects the app to the Convex backend, also giving components access to Convex + Clerk.*/}
          <ConvexClientProvider>
            <Header />
            <main className="min-h-screen bg-gray-600">
              <Toaster richColors />

              {children}
                <Toaster richColors/>
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}