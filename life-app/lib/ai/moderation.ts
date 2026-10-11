import OpenAI from 'openai';

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
  customGuidelineApplied?: { guidelineId: string; guidelineName: string; matchedKeywords: string[]; matchedPatterns: string[]; confidence: number };
  suggestedAction: 'allow' | 'flag' | 'block';
}

export interface ContentModerationRequest {
  content: string;
  contentType: 'post' | 'response' | 'comment' | 'blog' | 'community';
  userId: string;
  userRole: string;
}

export interface ModerationGuidelines {
  inappropriateTopics: string[];
  hateSpeechKeywords: string[];
  spamPatterns: string[];
  communityGuidelines: string;
}

// Community-specific moderation guidelines
export const MODERATION_GUIDELINES: ModerationGuidelines = {
  inappropriateTopics: [
    'explicit sexual content',
    'graphic violence',
    'illegal activities',
    'personal attacks',
    'harassment',
    'discrimination',
    'spam',
    'self-promotion without value',
    'offensive language',
    'religious intolerance'
  ],
  hateSpeechKeywords: [
    'hate speech',
    'discrimination',
    'racism',
    'sexism',
    'homophobia',
    'transphobia',
    'religious intolerance',
    'xenophobia'
  ],
  spamPatterns: [
    'repeated posting',
    'unrelated content',
    'excessive links',
    'commercial promotion',
    'bot-like behavior'
  ],
  communityGuidelines: `
    This is a Christian community focused on spiritual growth and biblical discussion.
    Content should be:
    - Respectful and edifying
    - Biblically sound
    - Encouraging to others
    - Relevant to the community topic
    - Free from personal attacks or divisive language
  `
};

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Moderation prompt template
export const MODERATION_PROMPT = `
You are an AI moderator for a Christian community platform. Your role is to ensure content is appropriate, respectful, and aligns with community guidelines.

Community Guidelines:
${MODERATION_GUIDELINES.communityGuidelines}

Inappropriate Topics to Flag:
${MODERATION_GUIDELINES.inappropriateTopics.join(', ')}

Hate Speech Keywords to Detect:
${MODERATION_GUIDELINES.hateSpeechKeywords.join(', ')}

Spam Patterns to Watch For:
${MODERATION_GUIDELINES.spamPatterns.join(', ')}

Analyze the following content and provide a moderation decision:

Content: {content}
Content Type: {contentType}
User Role: {userRole}

Please respond with a JSON object containing:
{
  "isAppropriate": boolean,
  "confidence": number (0-1),
  "flags": string[],
  "reason": string,
  "suggestedAction": "allow" | "flag" | "block"
}

Consider:
- Is the content respectful and edifying?
- Does it align with Christian values?
- Is it relevant to the community topic?
- Does it contain inappropriate language or topics?
- Is it spam or self-promotion?
- Does it encourage spiritual growth?

Respond only with the JSON object.
`; 