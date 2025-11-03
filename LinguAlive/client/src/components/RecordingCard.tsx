import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRef, useState, useEffect } from "react";

export interface RecordingViewModel {
  id: string;
  audioUrl: string;
  theme: string;
  contributorName?: string;
  ogiek?: string | null;
  english?: string | null;
  createdAt: Date;
}

interface Props {
  item: RecordingViewModel;
}

export function RecordingCard({ item }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{item.theme}</Badge>
        <span className="text-xs text-muted-foreground">
          {format(item.createdAt, "MMM d, yyyy")}
        </span>
        {item.contributorName && (
          <span className="text-xs text-muted-foreground">• {item.contributorName}</span>
        )}
      </div>

      <div className="space-y-2">
        {item.ogiek && (
          <div>
            <div className="text-xs font-medium text-muted-foreground">Ogiek</div>
            <p className="text-sm">{item.ogiek}</p>
          </div>
        )}
        {item.english && (
          <div>
            <div className="text-xs font-medium text-muted-foreground">English</div>
            <p className="text-sm">{item.english}</p>
          </div>
        )}
      </div>

      <div>
        <audio ref={audioRef} controls src={item.audioUrl} className="w-full" preload="metadata" />
        <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1 tabular-nums">
          <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}</span>
          <span>{isFinite(duration) ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, "0")}` : "0:00"}</span>
        </div>
      </div>
    </Card>
  );
}


