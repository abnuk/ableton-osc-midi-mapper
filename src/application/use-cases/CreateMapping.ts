import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMappingRepository } from '@domain/repositories/IMappingRepository';
import { Mapping } from '@domain/entities/Mapping';
import { MidiChannel } from '@domain/value-objects/MidiChannel';
import { OscCommand } from '@domain/entities/OscCommand';
import { Result, success, failure } from '@shared/types/Result';
import { CreateMappingInput, CreateMappingOutput } from '../dtos/CreateMappingDTOs';
import { v4 as uuidv4 } from 'uuid';

/**
 * CreateMapping Use Case
 * Creates a new MIDI → OSC mapping
 */
@injectable()
export class CreateMapping {
  constructor(
    @inject(TYPES.MappingRepository) private readonly mappingRepository: IMappingRepository
  ) {}

  async execute(input: CreateMappingInput): Promise<Result<CreateMappingOutput, string>> {
    try {
      // Create channel
      const channel = MidiChannel.fromValue(input.trigger.channel);

      // Create trigger based on type
      const trigger = this.createTrigger(input, channel);

      // Create OSC command
      const command = OscCommand.create(input.command.address, input.command.parameters);

      // Generate unique ID
      const id = uuidv4();

      // Create mapping entity
      const mapping = Mapping.create(
        id,
        input.name,
        trigger,
        command,
        input.parameterMappings || [],
        input.enabled ?? true,
        input.midiDevice || null
      );

      // Save to repository
      const saveResult = await this.mappingRepository.save(mapping);

      if (saveResult.isFailure()) {
        return failure(`Failed to save mapping: ${saveResult.error.message}`);
      }

      return success({ mappingId: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return failure(`Failed to create mapping: ${errorMessage}`);
    }
  }

  private createTrigger(input: CreateMappingInput, channel: MidiChannel): any {
    switch (input.trigger.type) {
      case 'note':
        if (input.trigger.note === undefined) {
          throw new Error('Note trigger requires note parameter');
        }
        return {
          type: input.trigger.type,
          note: input.trigger.note,
          channel,
          velocityRange: input.trigger.velocityRange
        };

      case 'cc':
        if (input.trigger.controller === undefined) {
          throw new Error('CC trigger requires controller parameter');
        }
        return {
          type: input.trigger.type,
          controller: input.trigger.controller,
          channel,
          valueRange: input.trigger.valueRange
        };

      case 'program_change':
        if (input.trigger.program === undefined) {
          throw new Error('Program change trigger requires program parameter');
        }
        return {
          type: input.trigger.type,
          program: input.trigger.program,
          channel
        };

      default:
        throw new Error(`Unknown trigger type: ${input.trigger.type}`);
    }
  }
}

