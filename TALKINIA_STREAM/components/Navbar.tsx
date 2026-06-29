import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobileNav from "./MobileNav";
import { SignedIn, UserButton } from "../providers/ClerkMockProvider";

const Navbar = () => {
  return (
    <nav className="flex flex-between fixed z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/icons/text.png"
          width={32}
          height={32}
          alt="yoom logo"
          className="max-sm:size-10"
        />
        <p className="text-[26px] font-extrabold  text-fuchsia-300 max-sm:hidden ml-2">
          TALKINIA
        </p>
      </Link>
      <div className="flex-between gap-5 ml-[5px]">
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
