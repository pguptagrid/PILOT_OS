// This file creates a reusable provider component that must wrap your application (usually in layout.js, page.tsx, or app.tsx) so that Convex and Clerk features (like useMutation, useQuery, or useAuth) work properly in the rest of the app.



"use client";

import { useAuth } from "@clerk/nextjs";
import {  ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";


const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }) {
  return <ConvexProviderWithClerk  client={convex} 
  useAuth={useAuth}
  >{children}</ConvexProviderWithClerk >;
}

