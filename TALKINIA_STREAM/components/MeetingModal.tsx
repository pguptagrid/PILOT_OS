import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: React.ReactNode;
  handleClick: () => void;
  buttonText?: string;
  image?: string;
  buttonIcon?: string;
  video?: string; // ← New
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonIcon,
  video,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger />

      <DialogContent className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl  bg-dark-1 bg-opacity-30 px-6 py-10 text-white shadow-2xl transition-all duration-300 ease-in-out border-none">
        <div className="flex flex-col items-center gap-6 text-center">
          {video && (
            <video
              src={video}
              autoPlay
              muted
              loop
              playsInline
              className="rounded-xl w-full max-h-[200px] object-cover shadow-md"
            />
          )}

          {image && !video && (
            <Image
              src={image}
              alt="dialog illustration"
              width={80}
              height={80}
              className="rounded-full shadow-md"
            />
          )}

          <h1
            className={cn(
              "text-2xl md:text-3xl font-bold leading-snug",
              className
            )}
          >
            {title}
          </h1>

          {children && <div className="w-full">{children}</div>}

          <Button
            onClick={handleClick}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-1 px-6 py-3 text-white hover:bg-blue-600 transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {buttonIcon && (
              <Image
                src={buttonIcon}
                alt="button icon"
                width={16}
                height={16}
              />
            )}
            {buttonText || "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
