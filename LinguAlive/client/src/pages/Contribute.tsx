import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiClient } from "@/lib/apiClient";
import { themes, ageRanges, genders } from "@shared/schema";
import { CheckCircle2, Loader2 } from "lucide-react";

const recordingFormSchema = z.object({
  contributorName: z.string().optional(),
  transcription: z.string().optional(),
  englishTranslation: z.string().optional(),
  theme: z.string().min(1, "Please select a theme"),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  location: z.string().optional(),
  additionalContext: z.string().optional(),
});

type RecordingFormData = z.infer<typeof recordingFormSchema>;

export default function Contribute() {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecordingFormData>({
    resolver: zodResolver(recordingFormSchema),
    defaultValues: {
      contributorName: "",
      transcription: "",
      englishTranslation: "",
      theme: "",
      ageRange: "",
      gender: "",
      location: "",
      additionalContext: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: RecordingFormData) => {
      if (!audioBlob) {
        throw new Error("No audio recording available");
      }

      // Create or get contributor first
      // For now, create a default contributor or get existing one
      // In a real app, you'd have a contributor selection/creation flow
      let contributorId: string;
      
      try {
        // Try to create a contributor with form data
        const contributor = await apiClient.createContributor({
          contributor_name: data.contributorName || "Anonymous Contributor",
          age_range: data.ageRange || undefined,
          gender: data.gender || undefined,
          location: data.location || undefined,
        });
        contributorId = contributor.contributor_id;
      } catch (error) {
        // If contributor creation fails, try to get existing ones
        const contributors = await apiClient.getContributors();
        if (contributors.length > 0) {
          contributorId = contributors[0].contributor_id;
        } else {
          throw new Error("Failed to create or find contributor");
        }
      }

      // Convert blob to File
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: audioBlob.type || 'audio/webm',
      });

      // Upload recording to backend
      return await apiClient.createRecording({
        contributor_id: contributorId,
        raw_recording: audioFile,
        ogk_transcription: data.transcription || undefined,
        eng_transcription: data.englishTranslation || undefined,
        rec_theme: data.theme,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordings"] });
      setShowSuccess(true);
      setAudioBlob(null);
      form.reset();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecordingFormData) => {
    if (!audioBlob) {
      toast({
        title: "No Recording",
        description: "Please record or upload an audio file first",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate(data);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleUpload = (file: File) => {
    setAudioBlob(file);
  };

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen py-12 flex items-center justify-center"
      >
        <Card className="p-12 max-w-2xl mx-4 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
            Thank You!
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your contribution to preserving the Ogiek language has been successfully submitted. 
            Together, we're building a lasting resource for future generations.
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowSuccess(false)}
            data-testid="button-contribute-again"
          >
            Contribute Another Recording
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6" data-testid="text-contribute-title">
            Contribute Your Voice
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help preserve the Ogiek language by sharing your recordings. Every contribution matters.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Record or Upload</h3>
                <p className="text-muted-foreground text-sm">Share a word, song, proverb, story, or conversation</p>
              </div>
            </div>
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
              onUpload={handleUpload}
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="bg-card border border-card-border rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Add Details</h3>
                    <p className="text-muted-foreground text-sm">Provide context and metadata for your recording</p>
                  </div>
                </div>

                <div className="space-y-6 pl-11">
                  <FormField
                    control={form.control}
                    name="contributorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name..."
                            {...field}
                            data-testid="input-contributor-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transcription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Transcription (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type what was said in the original language (Ogiek)..."
                            className="min-h-24"
                            {...field}
                            data-testid="input-transcription"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="englishTranslation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>English Translation (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type the English translation..."
                            className="min-h-24"
                            {...field}
                            data-testid="input-english-translation"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-theme">
                              <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {themes.map((theme) => (
                              <SelectItem key={theme} value={theme} data-testid={`option-theme-${theme.toLowerCase()}`}>
                                {theme}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ageRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Range (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-age-range">
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ageRanges.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genders.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {gender}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Nakuru County" 
                            {...field}
                            data-testid="input-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Context (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information about this recording..."
                            className="min-h-24"
                            {...field}
                            data-testid="input-context"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-2xl p-6">
                <div className="flex items-start space-x-3 mb-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">Submit Your Contribution</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Review your recording and submit it to our archive
                    </p>
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={uploadMutation.isPending}
                      className="w-full md:w-auto"
                      data-testid="button-submit-recording"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Submit Recording"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}
