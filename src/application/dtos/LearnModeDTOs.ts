/**
 * Learn Mode DTOs
 */

export interface StartLearnModeInput {
  commandAddress: string;
  commandParameters: Array<number | string | boolean>;
  parameterMappings?: Array<{
    parameterIndex: number;
    substitution: string;
    trackName?: string;
    trackIndex?: number;
  }>;
}

export interface LearnModeResultOutput {
  success: boolean;
  mappingId?: string;
  error?: string;
}

