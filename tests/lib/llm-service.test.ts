import { LLMService } from '@/lib/llm-service';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('LLMService', () => {
  let llmService: LLMService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            insightText: 'Insight',
            suggestedChartType: 'line',
          }),
        },
      ],
    });

    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => {
      return {
        messages: {
          create: mockCreate,
        },
      } as any;
    });

    llmService = new LLMService();
  });

  it('should process a query', async () => {
    const response = await llmService.processQuery('query', 'context');
    expect(response.insightText).toBe('Insight');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('should throw on invalid JSON', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'invalid' }],
    });
    await expect(llmService.processQuery('q', 'c')).rejects.toThrow('Invalid response from LLM.');
  });
});
