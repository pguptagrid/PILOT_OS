"use client";

import { Call, CallRecording } from "@stream-io/video-react-sdk";

import Loader from "./Loader";
import { useGetCalls } from "@/hooks/useGetCalls";
import MeetingCard from "./MeetingCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [localEnded, setLocalEnded] = useState<any[]>([]);

  // Sync and fetch any meeting summaries compiled locally in our mock database
  useEffect(() => {
    if (type === "ended") {
      const stored = JSON.parse(localStorage.getItem("talkinia_previous_meetings") || "[]");
      setLocalEnded(stored);
    }
  }, [type]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        // Merge real API ended calls with locally compiled PILOT meeting summaries!
        return [...localEnded, ...(endedCalls || [])];
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "upcoming":
        return "No Upcoming Calls";
      case "recordings":
        return "No Recordings";
      default:
        return "";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRecordings = async () => {
      try {
        const callData = [];
        
        for (const meeting of (callRecordings ?? [])) {
          if (!isMounted) return;
          try {
            const data = await meeting.queryRecordings();
            callData.push(data);
          } catch (err) {
            console.error(`Error fetching recordings for meeting ${meeting.id}:`, err);
          }
        }

        const recordings = callData
          .filter((call) => call && call.recordings && call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        if (isMounted) {
          setRecordings(recordings);
        }
      } catch (error) {
        console.error("Failed to fetch recordings:", error);
      }
    };

    if (type === "recordings") {
      fetchRecordings();
    }

    return () => {
      isMounted = false;
    };
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording, index: number) => (
          <MeetingCard
            key={(meeting as Call).id || (meeting as CallRecording).filename || `call-item-${index}`}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              (meeting as any).title ||
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              "No Description"
            }
            date={
              (meeting as any).date ||
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : (meeting as any).link || `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${
                    (meeting as Call).id
                  }`
            }
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : (meeting as any).summary
                ? () => alert(`📝 Compiled Meeting Minutes:\n\n${(meeting as any).summary}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
          />
        ))
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
