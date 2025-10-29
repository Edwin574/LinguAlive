import type { Recording, InsertRecording, ContactMessage, InsertContactMessage } from "@shared/schema";

// Storage keys
const RECORDINGS_KEY = "linguAlive_recordings";
const CONTACT_MESSAGES_KEY = "linguAlive_contactMessages";

// Type for recordings in localStorage (with string dates)
type StoredRecording = Omit<Recording, 'createdAt'> & { createdAt: string };
type StoredContactMessage = Omit<ContactMessage, 'createdAt'> & { createdAt: string };

// Helper functions
function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
}

// Client-side storage implementation
export const clientStorage = {
  // Recording operations
  getRecordings(): Promise<Recording[]> {
    return new Promise((resolve) => {
      const recordings = getFromStorage<StoredRecording>(RECORDINGS_KEY, []);
      // Sort by creation date, newest first
      recordings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      // Convert to Recording type
      const converted: Recording[] = recordings.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      }));
      resolve(converted);
    });
  },

  getRecording(id: string): Promise<Recording | undefined> {
    return new Promise((resolve) => {
      const recordings = getFromStorage<StoredRecording>(RECORDINGS_KEY, []);
      const recording = recordings.find((r) => r.id === id);
      if (recording) {
        resolve({
          ...recording,
          createdAt: new Date(recording.createdAt),
        });
      } else {
        resolve(undefined);
      }
    });
  },

  createRecording(insertRecording: InsertRecording): Promise<Recording> {
    return new Promise((resolve) => {
      const recordings = getFromStorage<StoredRecording>(RECORDINGS_KEY, []);
      const now = new Date().toISOString();
      const storedRecording: StoredRecording = {
        id: crypto.randomUUID(),
        audioUrl: insertRecording.audioUrl,
        transcription: insertRecording.transcription ?? null,
        theme: insertRecording.theme,
        ageRange: insertRecording.ageRange ?? null,
        gender: insertRecording.gender ?? null,
        location: insertRecording.location ?? null,
        additionalContext: insertRecording.additionalContext ?? null,
        createdAt: now,
      };
      recordings.push(storedRecording);
      saveToStorage(RECORDINGS_KEY, recordings);
      resolve({
        ...storedRecording,
        createdAt: new Date(now),
      });
    });
  },

  deleteRecording(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const recordings = getFromStorage<StoredRecording>(RECORDINGS_KEY, []);
      const index = recordings.findIndex((r) => r.id === id);
      if (index !== -1) {
        recordings.splice(index, 1);
        saveToStorage(RECORDINGS_KEY, recordings);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },

  // Contact message operations
  createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    return new Promise((resolve) => {
      const messages = getFromStorage<StoredContactMessage>(CONTACT_MESSAGES_KEY, []);
      const now = new Date().toISOString();
      const message: StoredContactMessage = {
        ...insertMessage,
        id: crypto.randomUUID(),
        createdAt: now,
      };
      messages.push(message);
      saveToStorage(CONTACT_MESSAGES_KEY, messages);
      resolve({
        ...message,
        createdAt: new Date(now),
      });
    });
  },

  // Clear all data (for testing/debugging)
  clearAll(): void {
    localStorage.removeItem(RECORDINGS_KEY);
    localStorage.removeItem(CONTACT_MESSAGES_KEY);
  },
};
