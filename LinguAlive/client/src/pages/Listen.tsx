import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RecordingCard, RecordingViewModel } from "@/components/RecordingCard";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Music } from "lucide-react";
import { Recording, themes } from "@shared/schema";
import { apiClient, transformRecording, Paginated } from "@/lib/apiClient";

export default function Listen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  const { data, isLoading } = useQuery<Paginated<Recording>>({
    queryKey: ["recordings", searchQuery, selectedTheme],
    queryFn: () => apiClient
      .getRecordings({
        q: searchQuery || undefined,
        theme: selectedTheme && selectedTheme !== "all" ? selectedTheme : undefined,
      })
      ,
  });

  // Map backend to view models
  const items: RecordingViewModel[] | undefined = data?.results.map(r => ({
    id: r.recording_id,
    audioUrl: r.clean_recording_url || r.raw_recording_url || "",
    theme: r.rec_theme,
    contributorName: r.contributor_name,
    ogiek: r.ogk_transcription || null,
    english: r.eng_transcription || null,
    createdAt: new Date(r.date_submitted),
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6" data-testid="text-listen-title">
            Explore Recordings
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Listen to community contributions and discover the richness of the Ogiek language
          </p>
        </div>

        <div className="mb-8 bg-card border border-card-border rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-filter-theme">
                <SelectValue placeholder="Filter by theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {themes.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading recordings...</p>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Music className="w-12 h-12 text-primary" />
            </div>
            <h3 className="font-bold text-2xl text-foreground mb-2">
              {searchQuery || selectedTheme !== "all" 
                ? "No recordings found" 
                : "No recordings yet"
              }
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchQuery || selectedTheme !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to contribute to our language preservation archive!"
              }
            </p>
            {!searchQuery && selectedTheme === "all" && (
              <Button asChild>
                <a href="/contribute" data-testid="button-contribute-first">
                  Contribute a Recording
                </a>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 text-muted-foreground">
              Showing {items.length} {items.length === 1 ? "recording" : "recordings"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <RecordingCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
