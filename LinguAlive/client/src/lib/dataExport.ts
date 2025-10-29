import { clientStorage } from "./localStorage";

/**
 * Export all recordings and contact messages as JSON files
 * Useful for migrating to a Django backend
 */
export async function exportData() {
  const recordings = await clientStorage.getRecordings();
  
  // Get contact messages from localStorage directly
  const contactMessagesStr = localStorage.getItem("linguAlive_contactMessages");
  const contactMessages = contactMessagesStr ? JSON.parse(contactMessagesStr) : [];

  // Convert recordings to JSON and create download
  const recordingsJson = JSON.stringify(recordings, null, 2);
  const recordingsBlob = new Blob([recordingsJson], { type: "application/json" });
  const recordingsUrl = URL.createObjectURL(recordingsBlob);
  const recordingsLink = document.createElement("a");
  recordingsLink.href = recordingsUrl;
  recordingsLink.download = `recordings_export_${new Date().toISOString().split("T")[0]}.json`;
  recordingsLink.click();
  URL.revokeObjectURL(recordingsUrl);

  // Convert contact messages to JSON and create download
  const messagesJson = JSON.stringify(contactMessages, null, 2);
  const messagesBlob = new Blob([messagesJson], { type: "application/json" });
  const messagesUrl = URL.createObjectURL(messagesBlob);
  const messagesLink = document.createElement("a");
  messagesLink.href = messagesUrl;
  messagesLink.download = `contact_messages_export_${new Date().toISOString().split("T")[0]}.json`;
  messagesLink.click();
  URL.revokeObjectURL(messagesUrl);

  console.log("Data export complete");
}

/**
 * Import data from JSON files
 * Useful for testing or migrating data
 */
export async function importRecordingsFromJson(jsonString: string) {
  try {
    const recordings = JSON.parse(jsonString);
    if (!Array.isArray(recordings)) {
      throw new Error("Invalid JSON format. Expected an array.");
    }

    // Clear existing recordings
    localStorage.removeItem("linguAlive_recordings");

    // Store new recordings
    localStorage.setItem("linguAlive_recordings", JSON.stringify(recordings));
    
    console.log(`Imported ${recordings.length} recordings`);
    return recordings;
  } catch (error) {
    console.error("Error importing recordings:", error);
    throw error;
  }
}

// Make exportData available in window for browser console access
if (typeof window !== "undefined") {
  (window as any).exportLinguAliveData = exportData;
  (window as any).importLinguAliveRecordings = importRecordingsFromJson;
}
