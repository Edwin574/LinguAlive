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
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStoppingRef = useRef(false);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      // Stop any active stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Stop any active media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error("Error stopping recorder on cleanup:", error);
        }
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      setIsPreparing(true);
      
      // Reset flags
      isStoppingRef.current = false;
      isRecordingRef.current = false;
      
      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop any existing media recorder and stream
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused') {
          try {
            mediaRecorderRef.current.stop();
          } catch (error) {
            console.error("Error stopping previous recorder:", error);
          }
        }
        mediaRecorderRef.current = null;
      }
      
      // Stop any existing stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clean up any previous recording
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }
      
      // Reset recording time
      setRecordingTime(0);
      
      // Ensure recording state is false before starting
      setIsRecording(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Store stream reference so we can stop it later
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder onstop event fired");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecordingComplete(blob);
        
        // Stop all tracks in the stream
        const streamToStop = streamRef.current;
        if (streamToStop) {
          streamToStop.getTracks().forEach(track => {
            track.stop();
            console.log("Track stopped:", track.kind);
          });
          streamRef.current = null;
        }
        
        // Clean up the media recorder reference and reset flags
        mediaRecorderRef.current = null;
        isStoppingRef.current = false;
        isRecordingRef.current = false;
        
        // Ensure state is fully reset
        flushSync(() => {
          setIsRecording(false);
        });
      };

      mediaRecorder.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      setIsPreparing(false);
      
      timerRef.current = setInterval(() => {
        // Check if we should still be recording
        if (!isRecordingRef.current || isStoppingRef.current) {
          console.log("Timer: recording stopped, clearing interval");
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
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
    console.log("stopRecording called - current state:", {
      isStopping: isStoppingRef.current,
      isRecording: isRecording,
      isRecordingRef: isRecordingRef.current,
      mediaRecorder: !!mediaRecorderRef.current,
      stream: !!streamRef.current
    });
    
    // Don't prevent multiple calls - if we're called again, force stop everything
    
    console.log("Stopping recording...");
    
    // Set flags immediately to prevent any further recording state
    isStoppingRef.current = true;
    isRecordingRef.current = false;
    
    // Clear the timer IMMEDIATELY - this is critical
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log("Timer cleared");
    }
    
    // Force immediate state update to stop animation and update button icon
    flushSync(() => {
      setIsRecording(false);
    });
    console.log("State updated to false");
    
    // IMMEDIATELY stop stream tracks to stop microphone recording FIRST
    const stream = streamRef.current;
    if (stream) {
      console.log("Stopping stream tracks immediately - FORCE STOP");
      stream.getTracks().forEach(track => {
        console.log("Track state before stop:", track.readyState, track.kind);
        track.stop();
        console.log("Track stopped:", track.kind, "New state:", track.readyState);
      });
    }
    
    // Stop the media recorder
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder) {
      const state = mediaRecorder.state;
      console.log("MediaRecorder state before stop:", state);
      
      if (state === 'recording' || state === 'paused') {
        try {
          console.log("Calling mediaRecorder.stop()");
          mediaRecorder.stop();
          console.log("mediaRecorder.stop() called successfully");
        } catch (error) {
          console.error("Error calling mediaRecorder.stop():", error);
        }
      } else {
        console.log("MediaRecorder already in state:", state);
      }
    } else {
      console.log("No MediaRecorder found");
    }
    
    // Always update state immediately regardless of MediaRecorder state
    // The onstop handler will clean up properly, but we want UI to update now
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Button clicked - isRecording:", isRecording, "isRecordingRef:", isRecordingRef.current, "isStopping:", isStoppingRef.current, "isPreparing:", isPreparing);
    
    // Prevent clicks while preparing (but allow stopping even if already stopping)
    if (isPreparing) {
      console.log("Preparing, ignoring click");
      return;
    }
    
    // If already stopping, try stopping again (maybe it failed)
    if (isStoppingRef.current) {
      console.log("Already stopping, but forcing stop again");
      stopRecording();
      return;
    }
    
    // Check both state and ref to ensure accuracy
    if (isRecording || isRecordingRef.current) {
      console.log("Click detected: stopping recording");
      stopRecording();
    } else {
      console.log("Click detected: starting recording");
      startRecording();
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Also handle mouse down as backup
    if (isRecording && !isPreparing && !isStoppingRef.current) {
      e.preventDefault();
      console.log("MouseDown: stopping recording");
      stopRecording();
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
              className={`w-24 h-24 rounded-full transition-all relative z-10 ${
                isRecording ? 'animate-pulse' : 'hover:scale-105'
              }`}
              onClick={handleClick}
              onMouseDown={handleMouseDown}
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
              <div className="absolute -inset-2 rounded-full border-4 border-destructive/30 animate-ping pointer-events-none" />
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
