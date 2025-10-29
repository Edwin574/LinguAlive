import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, User, MapPin, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Recording } from "@shared/schema";
import { format } from "date-fns";

interface AudioPlayerCardProps {
  recording: Recording;
}

export function AudioPlayerCard({ recording }: AudioPlayerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-recording-${recording.id}`}>
      <div className="flex items-start space-x-4 mb-4">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover-elevate active-elevate-2 transition-transform hover:scale-105"
          data-testid="button-play-pause"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" data-testid="badge-theme">
              {recording.theme}
            </Badge>
            <span className="text-xs text-muted-foreground" data-testid="text-date">
              {format(new Date(recording.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          
          {recording.transcription && (
            <p className="text-foreground mb-3 line-clamp-2" data-testid="text-transcription">
              "{recording.transcription}"
            </p>
          )}

          <div className="mb-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground tabular-nums" data-testid="text-current-time">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums" data-testid="text-duration">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(recording.ageRange || recording.gender) && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span data-testid="text-speaker-info">
                  {[recording.gender, recording.ageRange].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {recording.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span data-testid="text-location">{recording.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={recording.audioUrl} preload="metadata" />
    </Card>
  );
}
