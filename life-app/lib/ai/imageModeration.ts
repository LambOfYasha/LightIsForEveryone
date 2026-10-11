import OpenAI from 'openai';
import { ModerationResult } from './moderation';

export interface ImageModerationRequest {
  imageUrl: string;
  contentType: 'post' | 'response' | 'comment' | 'blog';
  userId: string;
  userRole: string;
}

export interface ImageModerationResult extends ModerationResult {
  description?: string;
  content?: string[];
  imageAnalysis?: {
    description: string;
    content: string[];
    isAppropriate: boolean;
    confidence: number;
  };
}

export class ImageModerationService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Analyze image content using GPT-4 Vision
   */
  static async moderateImage(request: ImageModerationRequest): Promise<ImageModerationResult> {
    try {
      // Use GPT-4 Vision to analyze the image
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI moderator for a Christian community platform. Analyze the image for appropriateness.

Community Guidelines:
- Images should be respectful and edifying
- No explicit sexual content, graphic violence, or inappropriate material
- No hate speech, discrimination, or offensive symbols
- No spam, commercial content, or self-promotion
- Images should align with Christian values and community standards

Analyze the image and respond with a JSON object:
{
  "isAppropriate": boolean,
  "confidence": number (0-1),
  "description": "Brief description of the image",
  "content": ["list", "of", "detected", "elements"],
  "flags": ["any", "issues", "found"],
  "reason": "Explanation of moderation decision",
  "suggestedAction": "allow" | "flag" | "block"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image for community appropriateness:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: request.imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from GPT-4 Vision');
      }

      // Parse the JSON response
      let result: ImageModerationResult;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse image moderation response:', content);
        return this.fallbackImageModeration(request);
      }

      return {
        ...result,
        imageAnalysis: {
          description: result.description || '',
          content: result.content || [],
          isAppropriate: result.isAppropriate,
          confidence: result.confidence || 0.5
        }
      };

    } catch (error: any) {
      console.error('Image moderation error:', error);
      
      // Handle quota exceeded or other OpenAI errors
      if (error?.code === 'insufficient_quota' || error?.status === 429) {
        console.log('OpenAI quota exceeded, using fallback image moderation');
        return this.fallbackImageModeration(request);
      }
      
      return this.fallbackImageModeration(request);
    }
  }

  /**
   * Fallback image moderation when OpenAI is unavailable
   */
  private static fallbackImageModeration(request: ImageModerationRequest): ImageModerationResult {
    // Basic fallback - allow most images in development
    return {
      isAppropriate: true,
      confidence: 0.6,
      flags: ['fallback_image_moderation'],
      reason: 'Image reviewed using fallback moderation (OpenAI unavailable)',
      suggestedAction: 'allow',
      imageAnalysis: {
        description: 'Image analysis unavailable',
        content: ['image'],
        isAppropriate: true,
        confidence: 0.6
      }
    };
  }

  /**
   * Check if image is appropriate for immediate posting
   */
  static async isImageAppropriate(request: ImageModerationRequest): Promise<boolean> {
    const result = await this.moderateImage(request);
    return result.isAppropriate && result.suggestedAction === 'allow';
  }

  /**
   * Get detailed image analysis
   */
  static async getImageAnalysis(request: ImageModerationRequest): Promise<ImageModerationResult> {
    return await this.moderateImage(request);
  }
} 