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
    const systemPrompt = `
      You are HAM (Home Assistant Monitor) AI, a high-precision data analysis engine.
      Your task is to translate natural language into InfluxDB Flux queries and provide human-centric technical insights.
      
      SCHEMA CONTEXT:
      ${schemaContext}
      
      RULES:
      1. ONLY return a valid JSON object.
      2. 'fluxQuery' MUST be a single-string valid Flux query that correctly filters measurements and topics.
      3. 'suggestedChartType' MUST be one of: 'line', 'step', 'badge', 'text'.
      4. 'insightText' MUST be a professional, detailed technical report (3-5 sentences). 
         Explain:
         a) Which sensor topics you are targeting.
         b) What the specific data represents in a home monitoring context.
         c) Any notable technical details about the query structure (e.g., aggregation window).
      5. Use relative time ranges like -1h, -24h, or -7d based on the user's intent.
      6. For 'mqtt_consumer' measurements, ALWAYS filter by the 'topic' tag and ensure field is 'value'.
      
      RESPONSE FORMAT:
      {
        "insightText": "A detailed, human-readable technical report. Start with 'I have analyzed the [sensor name] data...' or similar.",
        "fluxQuery": "from(bucket: \\"ha_pfd\\") |> ...",
        "suggestedChartType": "line" | "step" | "badge" | "text"
      }
    `;

    const response = await this.client.messages.create({
      model: env.llm.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userQuery }],
    });

    try {
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      // Find JSON block if Claude adds preamble
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsedResponse = JSON.parse(jsonStr);
      
      return {
        insightText: parsedResponse.insightText || "No insight available.",
        suggestedChartType: (parsedResponse.suggestedChartType as ChartType) || 'line',
        fluxQuery: parsedResponse.fluxQuery,
        data: [],
        usage: response.usage ? {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('LLM Parsing Error:', error);
      throw new Error('AI engine failed to generate a valid response.');
    }
  }
}

export const llmService = new LLMService();
