import { SpotifyMusicProvider } from "@/lib/providers/music/spotify";
import { MusicProvider } from "@/lib/providers/music/types";

export function getMusicProvider(provider = "spotify"): MusicProvider {
  switch (provider) {
    case "spotify":
    default:
      return new SpotifyMusicProvider();
  }
}
