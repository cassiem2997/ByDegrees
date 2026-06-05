update songs
set provider = 'itunes'
where provider_track_id like 'itunes:%'
  and provider <> 'itunes';

delete from music_search_cache
where cache_key like 'itunes:%';
