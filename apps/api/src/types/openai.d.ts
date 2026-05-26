declare module 'openai' {
  class OpenAI {
    constructor(config: { apiKey?: string });
    embeddings: {
      create(params: { model: string; input: string }): Promise<{
        data: Array<{ embedding: number[] }>;
      }>;
    };
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: Array<{ role: string; content: string }>;
          response_format?: { type: 'json_object' };
          temperature?: number;
        }): Promise<{
          choices: Array<{
            message: {
              content: string | null;
            };
          }>;
        }>;
      };
    };
  }
  export default OpenAI;
}
