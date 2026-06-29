'use client'

export const dynamic = 'force-dynamic';

import React from 'react';
import nextDynamic from 'next/dynamic';
import Loader from '@/components/Loader';

const MeetingComponent = nextDynamic(
  () => import('@/components/MeetingComponent'),
  { 
    ssr: false,
    loading: () => <Loader />
  }
);

const Meeting = ({ params }: { params: { id: string } }) => {
  return <MeetingComponent params={params} />;
};

export default Meeting;
