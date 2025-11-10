import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { IOscOutputService } from '@domain/services/IOscOutputService';
import { ITrackNameResolver } from '@domain/services/ITrackNameResolver';
import { MidiMessage } from '@domain/entities/MidiMessage';
import { ParameterSubstitution } from '@domain/entities/Mapping';
import { Result, success, failure } from '@shared/types/Result';

/**
 * ProcessMidiInput Use Case
 * Processes incoming MIDI messages and executes matching OSC commands
 */
@injectable()
export class ProcessMidiInput {
  constructor(
    @inject(TYPES.MappingRepository) private readonly mappingRepository: IMappingRepository,
    @inject(TYPES.OscOutputService) private readonly oscService: IOscOutputService,
    @inject(TYPES.TrackNameResolver) private readonly trackResolver: ITrackNameResolver
  ) {}

  async execute(message: MidiMessage, sourceDevice: string): Promise<Result<void, string>> {
    try {
      console.log('=== PROCESS MIDI INPUT: Processing message ===', {
        message: message.type,
        sourceDevice
      });
      
      // Get all mappings
      const mappingsResult = await this.mappingRepository.getAll();

      if (mappingsResult.isFailure()) {
        return failure(`Failed to get mappings: ${mappingsResult.error.message}`);
      }

      console.log(`=== PROCESS MIDI INPUT: Found ${mappingsResult.value.length} total mappings ===`);

      // Find matching mappings (pass source device for filtering)
      const matchingMappings = mappingsResult.value.filter(mapping => mapping.matches(message, sourceDevice));

      console.log(`=== PROCESS MIDI INPUT: ${matchingMappings.length} matching mappings ===`);

      // Execute each matching mapping
      for (const mapping of matchingMappings) {
        let command = mapping.command;

        // Apply parameter substitutions
        for (const paramMapping of mapping.parameterMappings) {
          const value = this.resolveParameterValue(paramMapping, message);
          
          if (value !== null) {
            command = command.withParameter(paramMapping.parameterIndex, value);
          }
        }

        // Send OSC command
        const sendResult = this.oscService.send(command);

        if (sendResult.isFailure()) {
          console.error(`Failed to send OSC command: ${sendResult.error.message}`);
          // Continue with other mappings even if one fails
        }
      }

      return success(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('=== PROCESS MIDI INPUT: Error ===', errorMessage);
      return failure(`Failed to process MIDI input: ${errorMessage}`);
    }
  }

  private resolveParameterValue(
    paramMapping: { parameterIndex: number; substitution: ParameterSubstitution; trackName?: string; trackIndex?: number },
    message: MidiMessage
  ): number | string | boolean | null {
    switch (paramMapping.substitution) {
      case ParameterSubstitution.NONE:
        return null;

      case ParameterSubstitution.VELOCITY:
        if (message.type === 'note') {
          return message.data.velocity;
        } else if (message.type === 'cc') {
          return message.data.value;
        }
        return null;

      case ParameterSubstitution.VELOCITY_NORMALIZED:
        if (message.type === 'note') {
          return message.data.velocity / 127;
        } else if (message.type === 'cc') {
          return message.data.normalizedValue;
        }
        return null;

      case ParameterSubstitution.TRACK_NAME:
        if (paramMapping.trackName) {
          const result = this.trackResolver.resolveTrackName(paramMapping.trackName);
          return result.isSuccess() ? result.value : null;
        }
        return null;

      case ParameterSubstitution.TRACK_INDEX:
        return paramMapping.trackIndex ?? null;

      default:
        return null;
    }
  }
}

