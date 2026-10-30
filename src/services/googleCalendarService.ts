import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Defined SCOPES for Google Calendar integration
export const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Initialize Firebase safely without re-initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token strictly in memory - NEVER in localStorage/sessionStorage
let cachedAccessToken: string | null = null;

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
  colorId?: string;
}

export interface GoogleCalendarEventInput {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  colorId?: string;
}

export const getStatusColorId = (status: 'pending' | 'published' | 'failed'): string => {
  switch (status) {
    case 'published':
      return '10'; // Basil (Green)
    case 'failed':
      return '11'; // Tomato (Red)
    case 'pending':
    default:
      return '5'; // Banana (Yellow/Amber)
  }
};

export const getStatusColorConfig = (status: 'pending' | 'published' | 'failed') => {
  switch (status) {
    case 'published':
      return {
        label: 'منتشر شده',
        labelEn: 'Published',
        colorId: '10',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        dotBg: 'bg-emerald-400',
        border: 'border-emerald-500/40',
        glow: 'hover:shadow-emerald-500/10',
        accentBg: 'bg-emerald-500',
        textAccent: 'text-emerald-400',
      };
    case 'failed':
      return {
        label: 'ناموفق / خطا',
        labelEn: 'Failed',
        colorId: '11',
        badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        dotBg: 'bg-rose-500',
        border: 'border-rose-500/40',
        glow: 'hover:shadow-rose-500/10',
        accentBg: 'bg-rose-500',
        textAccent: 'text-rose-400',
      };
    case 'pending':
    default:
      return {
        label: 'در انتظار انتشار',
        labelEn: 'Pending',
        colorId: '5',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dotBg: 'bg-amber-400 animate-pulse',
        border: 'border-amber-500/40',
        glow: 'hover:shadow-amber-500/10',
        accentBg: 'bg-amber-500',
        textAccent: 'text-amber-400',
      };
  }
};

// Initialize auth state listener. Call this on app/component load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is logged into Firebase but cachedAccessToken was lost (e.g. page refresh),
        // we prompt sign in when interacting or signal auth check
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Fetch events from the user's primary Google Calendar
 */
export async function listCalendarEvents(
  timeMin?: string,
  maxResults: number = 30
): Promise<GoogleCalendarEvent[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const minTime = timeMin || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('timeMin', minTime);
  url.searchParams.set('maxResults', maxResults.toString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      cachedAccessToken = null;
      throw new Error('TOKEN_EXPIRED');
    }
    throw new Error(errorData?.error?.message || `Failed to fetch events: ${res.statusText}`);
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarEvent[];
}

/**
 * Create a new event on Google Calendar
 */
export async function createCalendarEvent(
  eventInput: GoogleCalendarEventInput
): Promise<GoogleCalendarEvent> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const body = {
    summary: eventInput.summary,
    description: eventInput.description,
    location: eventInput.location || 'TeleGen Publisher Bot',
    start: {
      dateTime: eventInput.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tehran',
    },
    end: {
      dateTime: eventInput.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tehran',
    },
    colorId: eventInput.colorId || '9', // Blueberry / Modern Blue
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      cachedAccessToken = null;
      throw new Error('TOKEN_EXPIRED');
    }
    throw new Error(errorData?.error?.message || `Failed to create event: ${res.statusText}`);
  }

  return (await res.json()) as GoogleCalendarEvent;
}

/**
 * Delete an event from Google Calendar (MUST be preceded by user confirmation dialog)
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    if (res.status === 401) {
      cachedAccessToken = null;
      throw new Error('TOKEN_EXPIRED');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to delete event: ${res.statusText}`);
  }

  return true;
}
