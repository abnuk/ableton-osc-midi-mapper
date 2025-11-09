/**
 * Track DTOs
 */

export interface TrackDTO {
  index: number;
  name: string;
}

export interface FetchTrackNamesOutput {
  tracks: TrackDTO[];
  cacheAge: number;
}

