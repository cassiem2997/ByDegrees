export type EventType =
  | "page_view"
  | "create_board"
  | "save_image"
  | "save_image_long_press"
  | "share"
  | "search_artist"
  | "select_artist"
  | "search_song"
  | "select_song";

export type TemperaturePreset = {
  id: string;
  templateKey: string;
  label: string;
  minTemp: number | null;
  maxTemp: number | null;
  sortOrder: number;
};

export type MusicTrackResult = {
  provider: "spotify";
  providerTrackId: string;
  title: string;
  artistName: string;
  albumName: string;
  albumArtUrl: string;
  externalUrl: string;
  previewUrl: string | null;
};

export type MusicArtistResult = {
  provider: "spotify";
  providerArtistId: string;
  name: string;
  imageUrl: string;
  externalUrl: string;
  followerCount: number;
  genres: string[];
};

export type BoardSongSlot = MusicTrackResult | null;

export type BoardRow = {
  preset: TemperaturePreset;
  songs: BoardSongSlot[];
};

export type BoardPayload = {
  title: string;
  artistName: string;
  isPublic: boolean;
  templateKey: string;
  rows: Array<{
    temperaturePresetId: string;
    songs: BoardSongSlot[];
  }>;
  sessionId: string;
};

export type BoardSummary = {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  isPublic: boolean;
  templateKey: string;
  createdAt: string;
  rows: BoardRow[];
};

export type AdminSummary = {
  visitors: {
    current: number;
    cumulative: number;
  };
  boardsCreated: {
    current: number;
    cumulative: number;
  };
  imageSaves: {
    current: number;
    cumulative: number;
  };
  shares: {
    current: number;
    cumulative: number;
  };
  funnel: {
    visitToCreateRate: number;
    createToSaveRate: number;
    createToShareRate: number;
    averageSongsPerBoard: number;
  };
  temperatureInsights: {
    emptiest: { label: string; count: number; totalBoards: number } | null;
    fullest: { label: string; count: number; totalBoards: number } | null;
  };
  visitorCountries: Array<{ name: string; count: number }>;
  visitorContinents: Array<{ name: string; count: number }>;
  completedCountries: Array<{ name: string; count: number }>;
  completedContinents: Array<{ name: string; count: number }>;
  topArtists: Array<{ name: string; count: number }>;
  topSongs: Array<{ title: string; count: number }>;
  dailySeries: Array<{ date: string; pageViews: number; creates: number; saves: number; shares: number }>;
};
