import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { ITrackNameResolver } from '@domain/services/ITrackNameResolver';
import { Result, success, failure } from '@shared/types/Result';
import { FetchTrackNamesOutput, TrackDTO } from '../dtos/TrackDTOs';

/**
 * FetchTrackNames Use Case
 * Fetches track names from Ableton Live via OSC
 */
@injectable()
export class FetchTrackNames {
  constructor(
    @inject(TYPES.TrackNameResolver) private readonly trackResolver: ITrackNameResolver
  ) {}

  async execute(forceRefresh: boolean = false): Promise<Result<FetchTrackNamesOutput, string>> {
    try {
      // Check if cache is valid and not forcing refresh
      if (!forceRefresh && this.trackResolver.hasCachedTracks() && !this.trackResolver.isCacheExpired()) {
        const tracks = this.trackResolver.getTracks();
        const cacheAge = this.trackResolver.getCacheAge();
        
        return success({
          tracks: tracks.map(t => ({ index: t.index, name: t.name })),
          cacheAge
        });
      }

      // Fetch fresh tracks
      const fetchResult = await this.trackResolver.fetchTracks();

      if (fetchResult.isFailure()) {
        return failure(`Failed to fetch tracks: ${fetchResult.error.message}`);
      }

      const tracks: TrackDTO[] = fetchResult.value.map(t => ({
        index: t.index,
        name: t.name
      }));

      return success({
        tracks,
        cacheAge: 0
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to fetch track names: ${errorMessage}`);
    }
  }
}

