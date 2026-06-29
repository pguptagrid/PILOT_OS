import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HomeCardProps {
  className: string;
  img?: string;
  video?: string;
  title: string;
  description: string;
  handleClick: () => void;
}

const HomeCard = ({
  className,
  img,
  video,
  title,
  description,
  handleClick,
}: HomeCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] cursor-pointer w-full xl:max-w-[270px] min-h-[260px]",
        className
      )}
      onClick={handleClick}
    >
      {video && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={video}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* Optional overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 flex flex-col justify-between h-full p-6 pb-2 text-white">
        <div
          className="flex items-center justify-start  mb-4 size-5
        "
        >
          {img && (
            <Image src={img} alt="icon" width={30} height={30} className="" />
          )}
        </div>
        <div className="flex flex-col glassmorphism rounded-lg justify-center items-center p-1">
          <h1 className="text-0.5xl font-bold ">{title}</h1>
          <p className="text-sm font-normal">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
