import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onUpload: (file: File) => void;
}

export function AudioRecorder({ onRecordingComplete, onUpload }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStoppingRef = useRef(false);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      setIsPreparing(true);
      
      // Reset flags
      isStoppingRef.current = false;
      isRecordingRef.current = false;
      
      // Clean up any previous recording
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      
      // Reset recording time
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecordingComplete(blob);
        
        stream.getTracks().forEach(track => track.stop());
        
        // Clean up the media recorder reference and reset flags
        mediaRecorderRef.current = null;
        isStoppingRef.current = false;
        isRecordingRef.current = false;
      };

      mediaRecorder.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      setIsPreparing(false);
      
      timerRef.current = setInterval(() => {
        // Check if we should still be recording
        if (!isRecordingRef.current) {
          console.log("Timer: recording flag is false, stopping updates");
          return;
        }
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsPreparing(false);
      toast({
        title: "Microphone Access Denied",
        description: "Unable to access microphone. Please ensure you've granted permission in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    // Prevent multiple stop calls
    if (isStoppingRef.current || !mediaRecorderRef.current) {
      return;
    }
    
    console.log("Stopping recording...");
    
    // Set flags immediately
    isStoppingRef.current = true;
    isRecordingRef.current = false;
    
    // Clear the timer IMMEDIATELY - this is critical
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log("Timer cleared");
    }
    
    // Force immediate state update to stop animation
    flushSync(() => {
      setIsRecording(false);
    });
    console.log("State updated to false");
    
    // Stop the media recorder
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log("Stopping media recorder");
      mediaRecorder.stop();
    } else {
      console.log("Media recorder already stopped or in wrong state");
      isStoppingRef.current = false;
    }
  };

  const handleClick = () => {
    if (isStoppingRef.current) {
      console.log("Already stopping, ignoring click");
      return;
    }
    
    if (isRecordingRef.current || isRecording) {
      console.log("Click detected: stopping recording");
      stopRecording();
    } else {
      console.log("Click detected: starting recording");
      startRecording();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        setAudioURL(url);
        onUpload(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an audio file (MP3, WAV, WebM, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-8">
      <div className="text-center">
        <h3 className="font-bold text-2xl text-foreground mb-6">Record Your Voice</h3>
        
        <div className="flex flex-col items-center space-y-6 mb-8">
          <div className="relative">
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "default"}
              className={`w-24 h-24 rounded-full transition-all ${
                isRecording ? 'animate-pulse' : 'hover:scale-105'
              }`}
              onClick={handleClick}
              disabled={isPreparing}
              data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
              type="button"
            >
              {isPreparing ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isRecording ? (
                <Square className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </Button>
            {isRecording && (
              <div className="absolute -inset-2 rounded-full border-4 border-destructive/30 animate-ping" />
            )}
          </div>

          {isRecording && (
            <div className="text-3xl font-bold text-foreground tabular-nums" data-testid="text-recording-time">
              {formatTime(recordingTime)}
            </div>
          )}

          <p className="text-muted-foreground">
            {isPreparing
              ? "Preparing microphone..."
              : isRecording
              ? "Recording... Click stop when finished"
              : "Click the microphone to start recording"
            }
          </p>
        </div>

        {audioURL && (
          <div className="mb-6">
            <audio 
              controls 
              src={audioURL} 
              className="w-full max-w-md mx-auto"
              data-testid="audio-playback"
            />
          </div>
        )}

        <div className="border-t border-border pt-6">
          <p className="text-muted-foreground mb-4">Or upload an existing recording</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-file-upload"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-upload-file"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Audio File
          </Button>
        </div>
      </div>
    </Card>
  );
}
