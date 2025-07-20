import { errorResponse } from './auth';

// URL patterns for basic validation
const URL_PATTERN = /https?:\/\/[^\s]+/g;

// Repeated character patterns (e.g., "aaaaaaa", "!!!!!!!")
const REPEATED_CHAR_PATTERN = /(.)\1{4,}/g;

interface ContentValidationConfig {
	maxLength: number;
	minLength: number;
	allowUrls: boolean;
	maxUrls: number;
}

const DEFAULT_CONFIG: ContentValidationConfig = {
	maxLength: 2000,
	minLength: 1,
	allowUrls: true,
	maxUrls: 3,
};

export const validateContent = (content: string, config: Partial<ContentValidationConfig> = {}) => {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };

	// Check content length
	if (content.length > finalConfig.maxLength) {
		return {
			valid: false,
			error: `Comment is too long. Maximum ${finalConfig.maxLength} characters allowed.`,
		};
	}

	if (content.length < finalConfig.minLength) {
		return {
			valid: false,
			error: `Comment is too short. Minimum ${finalConfig.minLength} characters required.`,
		};
	}

	// Check for repeated characters (spam indicator)
	if (REPEATED_CHAR_PATTERN.test(content)) {
		return {
			valid: false,
			error: 'Comment contains too many repeated characters.',
		};
	}

	// Check URL count
	if (finalConfig.allowUrls) {
		const urls = content.match(URL_PATTERN) || [];
		if (urls.length > finalConfig.maxUrls) {
			return {
				valid: false,
				error: `Too many URLs. Maximum ${finalConfig.maxUrls} URLs allowed.`,
			};
		}
	} else {
		const urls = content.match(URL_PATTERN) || [];
		if (urls.length > 0) {
			return {
				valid: false,
				error: 'URLs are not allowed in comments.',
			};
		}
	}

	return { valid: true };
};

export const createContentValidator = (config: Partial<ContentValidationConfig> = {}) => async (
	request: Request,
	env: any,
): Promise<Response | null> => {
	try {
		// Clone the request body so it can be read multiple times
		const clonedRequest = request.clone();
		const body = await clonedRequest.json() as { content?: string };
		const { content } = body;

		if (!content || typeof content !== 'string') {
			return errorResponse('Content is required and must be a string', env, 400);
		}

		const validation = validateContent(content, config);
		if (!validation.valid) {
			return errorResponse(validation.error, env, 400);
		}

		return null; // Continue to next middleware/handler
	} catch (error) {
		return errorResponse('Invalid request body', env, 400);
	}
};

// Predefined content validation configurations
export const contentValidators = {
	// Basic validation for comment creation (length, URLs, etc.)
	commentCreation: createContentValidator({
		maxLength: 2000,
		minLength: 1,
		allowUrls: true,
		maxUrls: 3,
	}),

	// Basic validation for comment updates (length, URLs, etc.)
	commentUpdate: createContentValidator({
		maxLength: 2000,
		minLength: 1,
		allowUrls: true,
		maxUrls: 3,
	}),
};
