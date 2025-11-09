import { TrackInfo } from '../entities/TrackInfo';
import { Result } from '@shared/types/Result';

/**
 * Track Name Resolver Interface
 * Resolves track names to indices and caches the mapping
 */
export interface ITrackNameResolver {
  /**
   * Fetch all tracks from Ableton Live
   */
  fetchTracks(): Promise<Result<TrackInfo[]>>;

  /**
   * Get all cached tracks
   */
  getTracks(): TrackInfo[];

  /**
   * Resolve a track name to its index
   */
  resolveTrackName(name: string): Result<number>;

  /**
   * Resolve a track index to its name
   */
  resolveTrackIndex(index: number): Result<string>;

  /**
   * Check if tracks are cached
   */
  hasCachedTracks(): boolean;

  /**
   * Clear the track cache
   */
  clearCache(): void;

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(): number;

  /**
   * Check if cache is expired (default: 5 minutes)
   */
  isCacheExpired(maxAgeMs?: number): boolean;
}

