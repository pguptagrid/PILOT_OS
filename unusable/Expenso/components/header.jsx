"use client";

import React,{useState,useEffect} from "react";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useStoreUser } from "../hooks/use-store-user";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur-sm z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between bg-white-50">
        <Link href="/" className="flex items-center gap-2">
<Image
  src="/logos/chat_gpt_logo.png"
  alt="Vehiql Logo"
  width={400}
  height={120}
  className="h-20 w-auto object-contain rounded-full"
/>


        </Link>

        {mounted && path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="animated-gradient text-white px-6 py-3 rounded-md shadow-stone-900 shadow-xl"

            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="animated-gradient text-white px-6 py-3 rounded-md shadow-stone-900 shadow-xl"
            >
              How It Works
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Authenticated>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-green-600 hover:border-green-600 transition duration-300 animated-gradient-dashboard animate-ping"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>

            </Link>
            {/* <Link href="/dashboard">
  <Button
    variant="outline"
    className="hidden md:inline-flex animated-gradient-dashboard"
  >
    <LayoutDashboard className="h-4 w-4" />
    Dashboard
  </Button>
  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
    <LayoutDashboard className="h-4 w-4" />
  </Button>
</Link> */}


            <UserButton
  appearance={{
    elements: {
      avatarBox:
        "w-20 h-20 rounded-full overflow-hidden " +
        "bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient-xy " +
        "shadow-2xl transition-transform duration-500 hover:scale-105 flex items-center justify-center", // Added flex for centering

      // This is the key: make the avatar image slightly smaller and with a solid background
      userButtonAvatarImage:
        "w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover bg-white", // 8px for 4px border on each side

      userButtonPopoverCard:
        "shadow-3xl rounded-lg  bg-white p-6 animate-fadeIn",
      userPreviewMainIdentifier:
        "font-semibold text-purple-700 text-xl tracking-wide",
    },
  }}
  afterSignOutUrl={"/"}
/>
          </Authenticated>

          <Unauthenticated>
            <SignInButton>
              <Button variant="ghost" className={'text-3xl p-3 m-3 cursor-pointer border-2'}>Sign In</Button>
            </SignInButton>

            <SignUpButton>
              <Button className="bg-green-600 hover:bg-green-700 border-none cursor-pointer">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>
      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
};