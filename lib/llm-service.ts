import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';
import { InsightResponse, ChartType } from '@/types';

/**
 * Service to handle LLM interactions via Anthropic Claude.
 */
export class LLMService {
  private client: Anthropic;

  constructor() {
    if (!env.llm.apiKey) {
      throw new Error('Missing Anthropic API Key in environment variables.');
    }
    this.client = new Anthropic({
      apiKey: env.llm.apiKey,
    });
  }

  async processQuery(userQuery: string, schemaContext: string): Promise<InsightResponse> {
    const prompt = `Translate to Flux: ${userQuery}. Schema: ${schemaContext}`;

    const response = await this.client.messages.create({
      model: env.llm.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    try {
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsedResponse = JSON.parse(content);
      
      return {
        insightText: parsedResponse.insightText,
        suggestedChartType: parsedResponse.suggestedChartType as ChartType,
        data: [],
      };
    } catch (error) {
      throw new Error('Invalid response from LLM.');
    }
  }
}

export const llmService = new LLMService();
