import { MusicArtistResult, MusicTrackResult } from "@/lib/types";

export interface MusicProvider {
  searchArtists(query: string): Promise<MusicArtistResult[]>;
  searchTracks(query: string): Promise<MusicTrackResult[]>;
}
