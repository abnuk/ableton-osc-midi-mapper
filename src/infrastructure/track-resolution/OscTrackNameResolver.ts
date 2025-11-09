import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IOscOutputService } from '@domain/services/IOscOutputService';
import { ITrackNameResolver } from '@domain/services/ITrackNameResolver';
import { TrackInfo } from '@domain/entities/TrackInfo';
import { OscCommand } from '@domain/entities/OscCommand';
import { Result, success, failure } from '@shared/types/Result';

/**
 * OSC Track Name Resolver
 * Resolves track names to indices by querying Ableton via OSC
 */
@injectable()
export class OscTrackNameResolver implements ITrackNameResolver {
  private tracks: TrackInfo[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    @inject(TYPES.OscOutputService) private readonly oscService: IOscOutputService
  ) {}

  async fetchTracks(): Promise<Result<TrackInfo[]>> {
    try {
      if (!this.oscService.isConnected()) {
        return failure(new Error('OSC service not connected'));
      }

      // Send command to get track names
      // Note: Since we're send-only, we can't actually receive the response in this implementation
      // In a real scenario, you'd need a way to receive responses or use the track name cache from config
      
      // For now, we'll simulate with a placeholder
      // In production, this would require implementing a response listener
      const getTracksCommand = OscCommand.create('/live/song/get/track_names', []);
      const sendResult = this.oscService.send(getTracksCommand);

      if (sendResult.isFailure()) {
        return failure(sendResult.error);
      }

      // Since we can't receive responses with one-way OSC, we'll return an error
      // The UI should handle this by showing an error or using cached data
      return failure(
        new Error(
          'Track name fetching requires two-way OSC communication. Please configure tracks manually.'
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(new Error(`Failed to fetch tracks: ${errorMessage}`));
    }
  }

  getTracks(): TrackInfo[] {
    return [...this.tracks];
  }

  resolveTrackName(name: string): Result<number> {
    const track = this.tracks.find(t => t.name === name);
    if (!track) {
      return failure(new Error(`Track not found: ${name}`));
    }
    return success(track.index);
  }

  resolveTrackIndex(index: number): Result<string> {
    const track = this.tracks.find(t => t.index === index);
    if (!track) {
      return failure(new Error(`Track index not found: ${index}`));
    }
    return success(track.name);
  }

  hasCachedTracks(): boolean {
    return this.tracks.length > 0;
  }

  clearCache(): void {
    this.tracks = [];
    this.cacheTimestamp = 0;
  }

  getCacheAge(): number {
    if (this.cacheTimestamp === 0) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Date.now() - this.cacheTimestamp;
  }

  isCacheExpired(maxAgeMs: number = this.CACHE_TTL_MS): boolean {
    return this.getCacheAge() > maxAgeMs;
  }

  /**
   * Manually set tracks (for when track names are provided by the UI or config)
   */
  setTracks(tracks: TrackInfo[]): void {
    this.tracks = [...tracks];
    this.cacheTimestamp = Date.now();
  }
}

