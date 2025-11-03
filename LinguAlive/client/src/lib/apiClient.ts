
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Contributor {
  contributor_id: string;
  contributor_name: string;
  age_range?: string | null;
  gender?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

interface Recording {
  recording_id: string;
  contributor: string;
  contributor_name: string;
  raw_rec_link?: string;
  clean_rec_link?: string;
  raw_recording_url?: string | null;
  clean_recording_url?: string | null;
  ogk_transcription?: string | null;
  eng_transcription?: string | null;
  rec_theme: string;
  rec_duration?: number | null;
  date_submitted: string;
}

interface CreateContributorData {
  contributor_name: string;
  age_range?: string;
  gender?: string;
  location?: string;
}

interface CreateRecordingData {
  contributor_id: string;
  raw_recording: File;
  ogk_transcription?: string;
  eng_transcription?: string;
  rec_theme: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return {} as T;
}

export const apiClient = {
  // Contributor endpoints
  async getContributors(): Promise<Contributor[]> {
    return apiRequest<Contributor[]>('/contributors/');
  },

  async getContributor(id: string): Promise<Contributor> {
    return apiRequest<Contributor>(`/contributors/${id}/`);
  },

  async createContributor(data: CreateContributorData): Promise<Contributor> {
    return apiRequest<Contributor>('/contributors/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  // Recording endpoints
  async getRecordings(params?: { q?: string; contributor_id?: string }): Promise<Recording[]> {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append('q', params.q);
    if (params?.contributor_id) queryParams.append('contributor_id', params.contributor_id);
    
    const queryString = queryParams.toString();
    const endpoint = `/recordings/${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<Recording[]>(endpoint);
  },

  async getRecording(id: string): Promise<Recording> {
    return apiRequest<Recording>(`/recordings/${id}/`);
  },

  async createRecording(data: CreateRecordingData): Promise<Recording> {
    const formData = new FormData();
    formData.append('contributor_id', data.contributor_id);
    formData.append('raw_recording', data.raw_recording);
    if (data.ogk_transcription) {
      formData.append('ogk_transcription', data.ogk_transcription);
    }
    if (data.eng_transcription) {
      formData.append('eng_transcription', data.eng_transcription);
    }
    formData.append('rec_theme', data.rec_theme);

    return apiRequest<Recording>('/recordings/', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary for FormData
    });
  },

  async deleteRecording(id: string): Promise<void> {
    return apiRequest<void>(`/recordings/${id}/`, {
      method: 'DELETE',
    });
  },

  // Helper to get audio URL
  getAudioUrl(recordingId: string, type: 'raw' | 'clean' = 'clean'): string {
    return `${API_BASE_URL}/recordings/${recordingId}/audio/${type}/`;
  },
};

// Transform backend Recording to frontend format
export function transformRecording(recording: Recording): {
  id: string;
  audioUrl: string;
  transcription?: string | null;
  theme: string;
  ageRange?: string | null;
  gender?: string | null;
  location?: string | null;
  additionalContext?: string | null;
  createdAt: Date;
} {
  return {
    id: recording.recording_id,
    audioUrl: recording.clean_recording_url || recording.raw_recording_url || '',
    transcription: recording.ogk_transcription || recording.eng_transcription || null,
    theme: recording.rec_theme,
    ageRange: null, // Not in backend model yet
    gender: null, // Not in backend model yet
    location: null, // Not in backend model yet
    additionalContext: null, // Not in backend model yet
    createdAt: new Date(recording.date_submitted),
  };
}

