import { ITunesMusicProvider } from "@/lib/providers/music/itunes";
import { SpotifyMusicProvider } from "@/lib/providers/music/spotify";
import { MusicProvider } from "@/lib/providers/music/types";

export function getMusicProvider(provider = "spotify"): MusicProvider {
  const selectedProvider =
    process.env.MUSIC_PROVIDER ?? process.env.NEXT_PUBLIC_MUSIC_PROVIDER ?? "itunes";

  if (selectedProvider === "itunes") {
    return new ITunesMusicProvider();
  }

  switch (provider) {
    case "spotify":
    default:
      return new SpotifyMusicProvider();
  }
}
