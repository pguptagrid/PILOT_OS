import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ClerkProvider} from "../providers/ClerkMockProvider";
import {Toaster} from "@/components/ui/toaster"
import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css'
import RouteObserver from "../components/RouteObserver";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "TALKINIA",
    description: "Video Calling App",
    icons: {
        icon: '/icons/text.png'
    }
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <ClerkProvider>
            <body className={`${inter.className} bg-dark-2 rounded-2xl`}>
            <RouteObserver />
            {children}
            <Toaster/>
            </body>
        </ClerkProvider>

        </html>
    );
}
