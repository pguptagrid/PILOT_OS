import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { FEATURES, STEPS, TESTIMONIALS } from "../lib/landing";
import { ArrowBigDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { motion } from "framer-motion"
export default function Home() {
  return (
    <div className="flex flex-col pt-16 bg-gray-600">
      <section className="mt-20 pb-12 space-y-10 md:space-y-20 px-5 ">
        <div className="container  mx-auto px-4 d:px-6 text-center space-y-6">
          <Badge
            variant="outline"
            className="bg-green-200 border-2 border-green-300  text-green-700 text-2xl"
          >
            Split expenses. Simplify life.
          </Badge>
          <h1 className="gradient-title mx-auto max-w-4xl text-4xl font-bold md:text-7xl font-serif ">
            The smartest way to split expences with Buddies
          </h1>
          <p className="mx-auto max-w-[700px] text-white md:text-xl/relaxed font-serif">
            Track your expenses, split bills, and settle up with friends in a
            few clicks. Never worry about who owes and who gain.
          </p>

          <div className=" flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size={"lg"}
              className="animated-gradient text-white px-6 py-3 rounded-md shadow-stone-900 shadow-xl"
            >
              <Link href="/dashboard" className="flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className='animated-gradient text-white px-6 py-3 rounded-md shadow-stone-900 shadow-xl'
            >
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
        <div className="container mx-auto max-w-5xl overflow-hidden rounded-xl">
          <div className=" shadow-amber-600 gradient p-1 aspect-[16/9]">
            <Image
              src="/gemini.png"
              
              width={1280}
              height={720}
              alt="Hero Image"
              className="rounded-lg mx-auto "
              priority
            />
          </div>
        </div>
      </section>

      <section id="features" className=" py-20 bg-gray-600">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 text-2xl mb-8 border-2 border-green-500"
          >
            Features
            
          </Badge>
          <h2 className="gradient-title mt-2 text-3xl md:text-7xl font-serif ">
            Everything you need to split expenses.
          </h2>
          <p className="mx-auto mt-3 max-w-[700px]  md:text-xl/relaxed font-serif text-white">
            Our Plateform provides all the tools you need to handle shared
            expenses with ease.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, Icon, bg, color, description }) => (
              <Card
                key={title}
                className={
                  "flex flex-col items-center space-y-4 p-6 bg-gray-500 text-center shadow-stone-950 shadow-xl text-white"
                }
              >
                <div className={`rounded-full p-3 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color} `} />
                </div>
                <h3 className="text-xl font-bold text-green-500 ">{title}</h3>
                <p className="text-white  font-serif text-xl ">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className=" py-20 bg-gray-600">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 text-2xl mb-8 border-2 border-green-500"
          >
            How It Works
          </Badge>
          <h2 className="gradient-title mt-2 text-3xl md:text-7xl font-serif">
            Splitting expenses has never been easier.
          </h2>
          <p className="mx-auto mt-3 max-w-[700px] text-white md:text-xl/relaxed font-serif">
            Follow these simple steps to start tracking and splitting expenses
            with friends.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ label, title, description }) => (
              <Card key={label} className= "flex flex-col items-center space-y-4 p-6 text-center shadow-stone-950 shadow-xl bg-gray-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-400 text-xl font-bold text-black">
                  {label} 
                </div>
                <h3 className="text-xl font-bold text-green-500">{title}</h3>
                <p className='text-center font-serif  text-white text-xl '>{description}</p>
                </Card>
              
            ))}
          </div>
        </div>
      </section>

      <section className=" py-20 bg-gray-600">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 text-2xl mb-8"
          >
            Testimonials
          </Badge>
          <h2 className="gradient-title mt-2 text-3xl md:text-5xl">
            What our users says!
          </h2>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, image,emozi }) => (
              <Card key={name} className="flex flex-col items-center space-y-4 p-6 text-center shadow-stone-950 shadow-xl bg-gray-500 ">
                <CardContent className="space-y-4 p-6">
                  <p className="text-white text-xl">{quote}</p>
                  <div className="flex items-center space-x-4">

                    <Avatar className='h-12 w-12'>
                      <AvatarImage src={image} alt={name}  />
                      <AvatarFallback className='font-semibold '>{name.charAt(0)} </AvatarFallback>
                    </Avatar>
                    <div className='text-bottom'>
                      <div className=' font-medium text-green-500 text-xl '>
                        {name} {emozi}
                        <div className=" text-orange-300 m-1">
                          {role}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <section className='py-20 gradient'>
        <div className='container mx-auto px-4 md:px-6 text-center space-y-6'>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white font-serif ">
            Ready to simplify your sharing?
          </h2>
          <p className='mx-auto max-w-[600px] text-green-100 md:text-xl/relaxed font-serif'>Join thousands of users who have made splitting expenses stress free.</p>
          <Button
              asChild
              size={"lg"}
              className="animated-gradient text-white px-6 py-3 rounded-md shadow-stone-900 shadow-xl"
            >
              <Link href="/dashboard" className="flex items-center">
                Let's Go Buddy!
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
        </div>
      </section>
      
    </div>
  );
}
