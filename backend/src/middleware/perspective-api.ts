import { errorResponse } from './auth';

interface PerspectiveAPIResponse {
	attributeScores: {
		TOXICITY?: { summaryScore: { value: number } };
		SEVERE_TOXICITY?: { summaryScore: { value: number } };
		IDENTITY_ATTACK?: { summaryScore: { value: number } };
		INSULT?: { summaryScore: { value: number } };
		PROFANITY?: { summaryScore: { value: number } };
		THREAT?: { summaryScore: { value: number } };
		SPAM?: { summaryScore: { value: number } };
		FLIRTATION?: { summaryScore: { value: number } };
	};
	languages: string[];
	detectedLanguages: string[];
}

interface PerspectiveConfig {
	apiKey: string;
	thresholds: {
		toxicity: number;
		severeToxicity: number;
		identityAttack: number;
		insult: number;
		profanity: number;
		threat: number;
		spam: number;
		flirtation: number;
	};
	enabledAttributes: string[];
}

const DEFAULT_CONFIG: PerspectiveConfig = {
	apiKey: '',
	thresholds: {
		toxicity: 0.7,
		severeToxicity: 0.5,
		identityAttack: 0.6,
		insult: 0.7,
		profanity: 0.8,
		threat: 0.5,
		spam: 0.8,
		flirtation: 0.9, // High threshold for flirtation
	},
	enabledAttributes: ['TOXICITY', 'SEVERE_TOXICITY', 'IDENTITY_ATTACK', 'INSULT', 'PROFANITY', 'THREAT', 'SPAM'],
};

export const analyzeContentWithPerspective = async (
	content: string,
	config: Partial<PerspectiveConfig> = {},
): Promise<{ valid: boolean; error?: string; scores?: any }> => {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	if (!finalConfig.apiKey) {
		console.warn('Perspective API key not configured, skipping content analysis');
		return { valid: true };
	}

	try {
		const response = await fetch(
			`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${finalConfig.apiKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					comment: {
						text: content,
					},
					languages: ['en'],
					requestedAttributes: finalConfig.enabledAttributes.reduce((acc, attr) => {
						acc[attr] = {};
						return acc;
					}, {} as Record<string, {}>),
				}),
			},
		);

		if (!response.ok) {
			console.error('Perspective API error:', response.status, response.statusText);
			// If API fails, we'll allow the content but log the error
			return { valid: true };
		}

		const data: PerspectiveAPIResponse = await response.json();
		const scores = data.attributeScores;

		// Check each enabled attribute against its threshold
		const violations: string[] = [];

		if (scores.TOXICITY && scores.TOXICITY.summaryScore.value > finalConfig.thresholds.toxicity) {
			violations.push('toxic content');
		}

		if (scores.SEVERE_TOXICITY && scores.SEVERE_TOXICITY.summaryScore.value > finalConfig.thresholds.severeToxicity) {
			violations.push('severely toxic content');
		}

		if (scores.IDENTITY_ATTACK && scores.IDENTITY_ATTACK.summaryScore.value > finalConfig.thresholds.identityAttack) {
			violations.push('identity attack');
		}

		if (scores.INSULT && scores.INSULT.summaryScore.value > finalConfig.thresholds.insult) {
			violations.push('insulting content');
		}

		if (scores.PROFANITY && scores.PROFANITY.summaryScore.value > finalConfig.thresholds.profanity) {
			violations.push('profanity');
		}

		if (scores.THREAT && scores.THREAT.summaryScore.value > finalConfig.thresholds.threat) {
			violations.push('threatening content');
		}

		if (scores.SPAM && scores.SPAM.summaryScore.value > finalConfig.thresholds.spam) {
			violations.push('spam content');
		}

		if (scores.FLIRTATION && scores.FLIRTATION.summaryScore.value > finalConfig.thresholds.flirtation) {
			violations.push('inappropriate content');
		}

		if (violations.length > 0) {
			return {
				valid: false,
				error: `Comment contains ${violations.join(', ')} and has been rejected.`,
				scores,
			};
		}

		return { valid: true, scores };
	} catch (error) {
		console.error('Error calling Perspective API:', error);
		// If API fails, we'll allow the content but log the error
		return { valid: true };
	}
};

export const createPerspectiveValidator = (config: Partial<PerspectiveConfig> = {}) => async (request: Request, env: any): Promise<Response | null> => {
	try {
		const body = await request.json();
		const { content } = body;

		if (!content || typeof content !== 'string') {
			return errorResponse('Content is required and must be a string', env, 400);
		}

		// Get API key from environment
		const apiKey = env.PERSPECTIVE_API_KEY || config.apiKey;
		const perspectiveConfig = { ...config, apiKey };

		const analysis = await analyzeContentWithPerspective(content, perspectiveConfig);
		if (!analysis.valid) {
			return errorResponse(analysis.error!, env, 400);
		}

		return null; // Continue to next middleware/handler
	} catch (error) {
		console.error('Error in Perspective validator:', error);
		return errorResponse('Invalid request body', env, 400);
	}
};

// Predefined Perspective API configurations
export const perspectiveValidators = {
	// Strict validation for comment creation
	commentCreation: createPerspectiveValidator({
		thresholds: {
			toxicity: 0.7,
			severeToxicity: 0.5,
			identityAttack: 0.6,
			insult: 0.7,
			profanity: 0.8,
			threat: 0.5,
			spam: 0.8,
			flirtation: 0.9,
		},
		enabledAttributes: ['TOXICITY', 'SEVERE_TOXICITY', 'IDENTITY_ATTACK', 'INSULT', 'PROFANITY', 'THREAT', 'SPAM'],
	}),

	// Moderate validation for comment updates
	commentUpdate: createPerspectiveValidator({
		thresholds: {
			toxicity: 0.7,
			severeToxicity: 0.5,
			identityAttack: 0.6,
			insult: 0.7,
			profanity: 0.8,
			threat: 0.5,
			spam: 0.8,
			flirtation: 0.9,
		},
		enabledAttributes: ['TOXICITY', 'SEVERE_TOXICITY', 'IDENTITY_ATTACK', 'INSULT', 'PROFANITY', 'THREAT', 'SPAM'],
	}),
};
