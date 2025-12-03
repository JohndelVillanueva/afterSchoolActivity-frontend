export interface Activity {
  id: number;
  name: string;
  description?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string;
  coachName?: string;
  photo?: string;
  rate: number;
}

export type Category = {
  id: string;
  name: string;
};

export interface RegistrationModalProps {
  show: boolean;
  onClose: () => void;
  selectedActivity: Activity | undefined;
}

// API base URL type for Vite environment variable
// Use the environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
