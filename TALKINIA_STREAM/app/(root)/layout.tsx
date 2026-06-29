
import StreamVideoProvider from '@/providers/StreamClientProvider';
import { Metadata } from 'next';
import React, {  ReactNode } from 'react'
export const metadata: Metadata = {
  title: "TALKINIA",
  description: "Video Calling App",
  icons:{
    icon:'/icons/text.png'
  }
};
const RootLayout = ({children}:{children:ReactNode}) => {
  return (
    <main className='flex'>
        <StreamVideoProvider>

        {children}
        </StreamVideoProvider>
    
     
    </main>
  )
}

export default RootLayout;
