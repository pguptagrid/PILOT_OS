'use client'

import Loader from '@/components/Loader';
import MeetingRoom from '@/components/MeetingRoom';
import MeetingSetup from '@/components/MeetingSetup';
import { useGetCallById } from '@/hooks/useGetCallById';
import { useUser } from '@/providers/ClerkMockProvider';
import { StreamCall, StreamTheme, useStreamVideoClient, Call } from '@stream-io/video-react-sdk';
import React, { useState, useEffect } from 'react'

const MeetingComponent = ({ params: { id } }: { params: { id: string } }) => {
  const { user, isLoaded } = useUser();
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const client = useStreamVideoClient();
  const [customCall, setCustomCall] = useState<Call | null>(null);
  const [isCreatingCall, setIsCreatingCall] = useState(false);

  const { call: fetchedCall, isCallLoading } = useGetCallById(id);

  useEffect(() => {
    if (isCallLoading || fetchedCall || !client) return;

    const initCall = async () => {
      setIsCreatingCall(true);
      try {
        const c = client.call('default', id);
        await c.getOrCreate({
          data: {
            starts_at: new Date().toISOString(),
          }
        });
        setCustomCall(c);
      } catch (err) {
        console.error("Auto call creation failed:", err);
      } finally {
        setIsCreatingCall(false);
      }
    };

    initCall();
  }, [fetchedCall, isCallLoading, client, id]);

  const activeCall = fetchedCall || customCall;

  if (!isLoaded || isCallLoading || isCreatingCall) return <Loader />;
  if (!activeCall) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-white bg-dark-2">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Meeting Initialization Failed</h2>
          <p className="text-gray-400">Please make sure you have a valid invitation link.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={activeCall}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingComponent;
