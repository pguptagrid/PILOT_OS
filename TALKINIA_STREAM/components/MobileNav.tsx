'use client'
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <section className="w-fulmax-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/icons/hamburger.svg"
            alt="hamburger icon"
            className="cursor-pointer lg:hidden  rounded-full"
            width={35}
            height={35}

          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none  ">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/icons/text.png"
              width={32}
              height={32}
              alt="logo"
              className="max-sm:size-10"
            />
            <p className="text-[30px] font-extrabold text-fuchsia-400 ml-2">
              TALKINIA
            </p>
          </Link>

          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto ">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-6 pt-16 text-white ">
                {sidebarLinks.map((link) => {
                  const isActive =
                    pathname === link.route;

                  return (
                    <SheetClose asChild key={link.route}>
                    <Link
                      href={link.route}
                      key={link.label}
                      className={cn(
                        "flex gap-4 items-center p-3 rounded-lg w-full max-w-60 h-auto",
                        {
                          "bg-fuchsia-500": isActive,
                          'text-black': isActive,
                        }
                      )}
                    >
                      <Image
                        src={link.imgUrl}
                        alt={link.label}
                        width={20}
                        height={20}
                      />

                      <p className="font-semibold">
                        {link.label}
                      </p>
                    </Link>
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
    
  );
};

export default MobileNav;
