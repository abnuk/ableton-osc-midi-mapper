import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { ITrackNameResolver } from '@domain/services/ITrackNameResolver';
import { TrackInfo } from '@domain/entities/TrackInfo';
import { Result, success, failure } from '@shared/types/Result';
import { OscTrackNameResolver } from '@infrastructure/track-resolution/OscTrackNameResolver';

export interface AddTrackInput {
  index: number;
  name: string;
}

export interface UpdateTrackInput {
  index: number;
  name: string;
}

export interface RemoveTrackInput {
  index: number;
}

/**
 * ManageTrack Use Case
 * Manages manual track configuration for name resolution
 */
@injectable()
export class ManageTrack {
  constructor(
    @inject(TYPES.TrackNameResolver) private readonly trackResolver: ITrackNameResolver
  ) {}

  async addTrack(input: AddTrackInput): Promise<Result<void, string>> {
    try {
      const trackInfo = TrackInfo.create(input.index, input.name);
      
      // Type guard to check if trackResolver has addTrack method
      if (!this.hasAddTrackMethod(this.trackResolver)) {
        return failure('Track resolver does not support adding tracks');
      }

      const result = this.trackResolver.addTrack(trackInfo);
      
      if (result.isFailure()) {
        return failure(result.error.message);
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to add track: ${errorMessage}`);
    }
  }

  async updateTrack(input: UpdateTrackInput): Promise<Result<void, string>> {
    try {
      // Type guard to check if trackResolver has updateTrack method
      if (!this.hasUpdateTrackMethod(this.trackResolver)) {
        return failure('Track resolver does not support updating tracks');
      }

      const result = this.trackResolver.updateTrack(input.index, input.name);
      
      if (result.isFailure()) {
        return failure(result.error.message);
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to update track: ${errorMessage}`);
    }
  }

  async removeTrack(input: RemoveTrackInput): Promise<Result<void, string>> {
    try {
      // Type guard to check if trackResolver has removeTrack method
      if (!this.hasRemoveTrackMethod(this.trackResolver)) {
        return failure('Track resolver does not support removing tracks');
      }

      const result = this.trackResolver.removeTrack(input.index);
      
      if (result.isFailure()) {
        return failure(result.error.message);
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to remove track: ${errorMessage}`);
    }
  }

  async clearAllTracks(): Promise<Result<void, string>> {
    try {
      this.trackResolver.clearCache();
      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to clear tracks: ${errorMessage}`);
    }
  }

  // Type guards
  private hasAddTrackMethod(resolver: any): resolver is OscTrackNameResolver {
    return typeof resolver.addTrack === 'function';
  }

  private hasUpdateTrackMethod(resolver: any): resolver is OscTrackNameResolver {
    return typeof resolver.updateTrack === 'function';
  }

  private hasRemoveTrackMethod(resolver: any): resolver is OscTrackNameResolver {
    return typeof resolver.removeTrack === 'function';
  }
}

