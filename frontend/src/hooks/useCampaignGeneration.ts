import { useCallback, useState } from 'react';
import { generateCampaign } from '../api/campaignApi';
import type { CampaignResponse } from '../types/campaign.types';

interface UseCampaignGenerationState {
  isGenerating: boolean;
  error: string | null;
  campaignResult: CampaignResponse | null;
  generateCampaignFromGoal: (businessGoal: string) => Promise<CampaignResponse | null>;
  clearError: () => void;
  clearResult: () => void;
}

export const useCampaignGeneration = (): UseCampaignGenerationState => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignResult, setCampaignResult] = useState<CampaignResponse | null>(null);

  const generateCampaignFromGoal = useCallback(async (businessGoal: string): Promise<CampaignResponse | null> => {
    const trimmedGoal = businessGoal.trim();

    if (!trimmedGoal) {
      const validationError = 'Business goal cannot be empty.';
      setError(validationError);
      throw new Error(validationError);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateCampaign({ business_goal: trimmedGoal });
      setCampaignResult(result);
      return result;
    } catch (caughtError) {
      const messageText = caughtError instanceof Error ? caughtError.message : 'Something went wrong while generating the campaign brief.';
      setError(messageText);
      throw new Error(messageText);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearResult = useCallback(() => setCampaignResult(null), []);

  return {
    isGenerating,
    error,
    campaignResult,
    generateCampaignFromGoal,
    clearError,
    clearResult,
  };
};

export default useCampaignGeneration;
