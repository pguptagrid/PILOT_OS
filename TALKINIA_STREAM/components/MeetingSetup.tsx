'use client'
import { DeviceSettings, VideoPreview, useCall } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

const MeetingSetup = ({setIsSetupComplete}:{setIsSetupComplete:(value:boolean)=>void}) => {
  const router = useRouter()
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false)
  const call=useCall();
  if(!call){
    throw new Error('usecall must be used within Stream call component')
  }
  useEffect(() => {
    if(isMicCamToggledOn){
      call?.camera.disable();
      call?.microphone.disable();
    }
    else{
      call?.camera.enable();
      call?.microphone.enable();
    }
  
    
  }, [isMicCamToggledOn,call?.camera,call?.microphone])
  
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>
      <h1 className="text-2xl fonst-bold">SetUp</h1>
      <VideoPreview />
    
       <div className="flex h-16 items-center justify-center gap-3">
       <label className="flex items-center justify-center gap-2 font-medium">
         <input
           type="checkbox"
           checked={isMicCamToggledOn}
           onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
         />
         Join with mic and camera off
       </label>
       <DeviceSettings />
     </div>
     <div className="flex items-center gap-4">
       <Button 
         className='rounded-md bg-zinc-700 hover:bg-zinc-600 px-5 py-2.5 transition-colors' 
         onClick={() => router.push('/')}
       >
         Cancel
       </Button>
       <Button 
         className='rounded-md bg-green-500 hover:bg-green-600 px-5 py-2.5 transition-colors' 
         onClick={() => {
           call.join();
           setIsSetupComplete(true);
         }}
       >
         Join Meeting
       </Button>
     </div>
   </div>
  )
}

export default MeetingSetup


