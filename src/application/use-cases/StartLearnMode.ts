import { injectable, inject } from 'inversify';
import { TYPES } from '@shared/types/DITypes';
import { IMidiInputService } from '@domain/services/IMidiInputService';
import { MidiMessage } from '@domain/entities/MidiMessage';
import { Result, success, failure } from '@shared/types/Result';
import { StartLearnModeInput, LearnModeResultOutput } from '../dtos/LearnModeDTOs';
import { CreateMapping } from './CreateMapping';

/**
 * StartLearnMode Use Case
 * Activates learn mode to capture the next MIDI input and create a mapping
 */
@injectable()
export class StartLearnMode {
  private isLearning = false;
  private learnCallback: ((message: MidiMessage, sourceDevice: string) => void) | null = null;
  private pendingCommand: StartLearnModeInput | null = null;
  private onLearnCompleteCallback: (() => void) | null = null;

  constructor(
    @inject(TYPES.MidiInputService) private readonly midiService: IMidiInputService,
    @inject(TYPES.CreateMapping) private readonly createMapping: CreateMapping
  ) {}

  /**
   * Set callback to be called when learn mode completes
   */
  setOnLearnComplete(callback: () => void): void {
    this.onLearnCompleteCallback = callback;
  }

  async execute(input: StartLearnModeInput): Promise<Result<void, string>> {
    if (this.isLearning) {
      return failure('Learn mode is already active');
    }

    this.isLearning = true;
    this.pendingCommand = input;

    // Set up MIDI listener
    this.learnCallback = async (message: MidiMessage, sourceDevice: string) => {
      await this.handleLearnedMidiMessage(message, sourceDevice);
    };

    this.midiService.onMessage(this.learnCallback);

    return success(undefined);
  }

  private async handleLearnedMidiMessage(message: MidiMessage, sourceDevice: string): Promise<void> {
    if (!this.isLearning || !this.pendingCommand || !this.learnCallback) {
      return;
    }

    console.log('=== LEARN MODE: Received MIDI message ===', { 
      message: MidiMessage.toString(message), 
      sourceDevice 
    });

    // Save pending command before stopping (stopLearning clears it)
    const commandToMap = this.pendingCommand;

    // Stop learning (removes handler and clears state)
    this.stopLearning();

    // Create mapping name
    const mappingName = `MIDI ${MidiMessage.toString(message)} → ${commandToMap.commandAddress}`;

    // Create trigger from MIDI message
    const trigger = this.createTriggerFromMessage(message);

    console.log('=== LEARN MODE: Creating mapping ===', {
      name: mappingName,
      trigger,
      sourceDevice
    });

    // Create the mapping
    const createResult = await this.createMapping.execute({
      name: mappingName,
      trigger,
      command: {
        address: commandToMap.commandAddress,
        parameters: commandToMap.commandParameters
      },
      parameterMappings: commandToMap.parameterMappings,
      enabled: true,
      midiDevice: sourceDevice  // Assign to source device
    });

    if (createResult.isFailure()) {
      console.error('Failed to create learned mapping:', createResult.error);
    } else {
      console.log('=== LEARN MODE: Mapping created successfully ===', createResult.value);
      
      // Notify that learn mode is complete
      if (this.onLearnCompleteCallback) {
        this.onLearnCompleteCallback();
      }
    }
  }

  private createTriggerFromMessage(message: MidiMessage): any {
    switch (message.type) {
      case 'note':
        return {
          type: message.type,
          note: message.data.note,
          channel: message.data.channel
        };
      case 'cc':
        return {
          type: message.type,
          controller: message.data.controller,
          channel: message.data.channel
        };
      case 'program_change':
        return {
          type: message.type,
          program: message.data.program,
          channel: message.data.channel
        };
    }
  }

  private stopLearning(): void {
    if (this.learnCallback) {
      this.midiService.offMessage(this.learnCallback);
      this.learnCallback = null;
    }
    this.isLearning = false;
    this.pendingCommand = null;
  }

  isActive(): boolean {
    return this.isLearning;
  }

  cancel(): void {
    this.stopLearning();
  }
}

