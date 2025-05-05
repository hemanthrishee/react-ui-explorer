import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { User, LogOut, Clock, BookCheck, Layers } from 'lucide-react';

import { Skeleton } from "./ui/skeleton";

interface ProfileCardProps {
  name: string;
  email: string;
  profileIconUrl?: string;
  totalQuizzes: number;
  totalTime: number; // in seconds
  avgPercentage: number;
  topicsCovered: number;
  onLogout: () => void;
  onGoBack?: () => void;
  isLoggingOut?: boolean;
  isLoadingStats?: boolean;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const min = mins % 60;
  return `${hrs > 0 ? hrs + 'h ' : ''}${min}m`;
}

import { Loader2 } from 'lucide-react';

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  profileIconUrl,
  totalQuizzes,
  totalTime,
  avgPercentage,
  topicsCovered,
  onLogout,
  onGoBack,
  isLoggingOut = false,
  isLoadingStats = false,
}) => {
  return (
    <Card className="w-full p-6 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center">
        {profileIconUrl ? (
          <img src={profileIconUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-2" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <User className="h-10 w-10 text-gray-500" />
          </div>
        )}
        <h2 className="text-xl font-bold mt-1">{name}</h2>
        <div className="text-gray-500 text-sm">{email}</div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-2 w-full">
        <div className="flex flex-col items-center">
          <BookCheck className="h-6 w-6 text-blue-600 mb-1" />
          <div className="font-semibold text-lg">
            {isLoadingStats ? <Skeleton className="h-7 w-10 mb-1" /> : totalQuizzes}
          </div>
          <div className="text-xs text-gray-500">Quizzes Taken</div>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="h-6 w-6 text-purple-600 mb-1" />
          <div className="font-semibold text-lg">
            {isLoadingStats ? <Skeleton className="h-7 w-14 mb-1" /> : formatTime(totalTime)}
          </div>
          <div className="text-xs text-gray-500">Total Time</div>
        </div>
        <div className="flex flex-col items-center">
          <Layers className="h-6 w-6 text-green-600 mb-1" />
          <div className="font-semibold text-lg">
            {isLoadingStats ? <Skeleton className="h-7 w-10 mb-1" /> : topicsCovered}
          </div>
          <div className="text-xs text-gray-500">Topics Covered</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-1">
            {isLoadingStats ? (
              <Skeleton className="h-28 w-28 rounded-full" />
            ) : (() => {
              let bg = "bg-amber-100";
              let border = "border-amber-300";
              let text = "text-amber-600";
              if (avgPercentage >= 80) {
                bg = "bg-green-100";
                border = "border-green-300";
                text = "text-green-600";
              } else if (avgPercentage < 60) {
                bg = "bg-red-100";
                border = "border-red-300";
                text = "text-red-600";
              }
              return (
                <span className={`inline-flex items-center justify-center rounded-full ${bg} border-4 ${border} shadow text-5xl font-extrabold ${text} h-28 w-28`}>
                  <span className="flex flex-col items-center justify-center w-full h-full">
                    <span className="leading-none">{avgPercentage}</span>
                    <span className="text-2xl font-semibold leading-none">%</span>
                  </span>
                </span>
              );
            })()}
          </div>
          <div className="text-xs text-gray-500 font-medium">Average %</div>
        </div>
      </div>
      <Button
        variant="destructive"
        className="mt-4 w-full flex gap-2 items-center justify-center"
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <LogOut className="h-5 w-5" />
        )}
        Logout
      </Button>
      {onGoBack && (
        <Button
          variant="outline"
          className="w-full mt-2 flex gap-2 items-center justify-center"
          onClick={onGoBack}
        >
          <span className="font-medium">Go Back</span>
        </Button>
      )}
    </Card>
  );
};

export default ProfileCard;
