import axios from 'axios';
import { env } from '../config/env';

export class AiService {
  private openaiUrl = 'https://api.openai.com/v1/chat/completions';

  async generateProductDescription(
    productName: string,
    price: number | null,
    category: string,
    features: string[],
    tone: string,
    language: 'tr' | 'en'
  ) {
    const prompt = `
      You are an expert copywriter for e-commerce.
      Write a product description for: "${productName}".
      Price: ${price ? price : 'N/A'}.
      Category: ${category}.
      Key Features: ${features.join(', ')}.
      Tone: ${tone}.
      Language: ${language === 'tr' ? 'Turkish' : 'English'}.

      Output format: JSON with fields:
      - description (HTML format, SEO optimized)
      - bullet_points (array of strings)
      - seo_title
      - meta_description
    `;

    return this.callOpenAi(prompt);
  }

  async generateAdCopy(
    productName: string,
    description: string,
    platform: 'facebook' | 'google',
    language: 'tr' | 'en'
  ) {
    const prompt = `
      Generate high-conversion ad copy for: "${productName}".
      Product Description: "${description.substring(0, 500)}...".
      Platform: ${platform}.
      Language: ${language === 'tr' ? 'Turkish' : 'English'}.

      Output format: JSON with:
      - primary_text (for FB) or headlines (for Google)
      - headline (for FB) or descriptions (for Google)
      - cta_options (array of 3 options)
    `;

    return this.callOpenAi(prompt);
  }

  private async callOpenAi(content: string) {
    try {
      const response = await axios.post(
        this.openaiUrl,
        {
          model: 'gpt-4', // or gpt-3.5-turbo if 4 is not available
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant that responds in JSON.' },
            { role: 'user', content }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
        }
      );

      const contentStr = response.data.choices[0].message.content;
      // Basic JSON parsing cleanup if needed (sometimes GPT adds markdown code blocks)
      const jsonStr = contentStr.replace(/```json\n|\n```/g, '');
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new Error('Failed to generate content');
    }
  }
}
