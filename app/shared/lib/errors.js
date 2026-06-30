export class AppError extends Error {
    code;
    statusCode;
    retryable;
    constructor(code, message, statusCode = 500, retryable = false) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.name = "AppError";
    }
    toResponse() {
        return Response.json({ error: this.code, message: this.message }, { status: this.statusCode });
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super("VALIDATION_ERROR", message, 400, false);
        this.name = "ValidationError";
    }
}
export class RateLimitError extends AppError {
    retryAfter;
    constructor(retryAfter) {
        super("RATE_LIMIT_EXCEEDED", "Too many requests. Please wait before trying again.", 429, true);
        this.retryAfter = retryAfter;
        this.name = "RateLimitError";
    }
    toResponse() {
        return Response.json({ error: this.code, message: this.message, retryAfter: this.retryAfter }, { status: 429, headers: { "Retry-After": String(this.retryAfter) } });
    }
}
export class DatabaseError extends AppError {
    constructor(message) {
        super("DATABASE_ERROR", message, 500, false);
        this.name = "DatabaseError";
    }
}
export class ClaudeParamError extends AppError {
    constructor(message) {
        super("CLAUDE_PARAM_ERROR", message, 500, false);
        this.name = "ClaudeParamError";
    }
}
export class ClaudeAuthError extends AppError {
    constructor() {
        super("CLAUDE_AUTH_ERROR", "Claude API authentication failed.", 500, false);
        this.name = "ClaudeAuthError";
    }
}
export class ClaudeRateLimitError extends AppError {
    constructor() {
        super("CLAUDE_RATE_LIMIT", "Claude API rate limit reached.", 429, true);
        this.name = "ClaudeRateLimitError";
    }
}
export class ClaudeOverloadError extends AppError {
    constructor() {
        super("CLAUDE_OVERLOADED", "Claude API is temporarily overloaded.", 503, true);
        this.name = "ClaudeOverloadError";
    }
}
export class ClaudeRefusalError extends AppError {
    constructor() {
        super("CLAUDE_REFUSAL", "Claude declined this request.", 200, false);
        this.name = "ClaudeRefusalError";
    }
}
export class ClaudeCircuitOpenError extends AppError {
    constructor() {
        super("CIRCUIT_OPEN", "Claude API is temporarily unavailable. Please try again in a moment.", 503, true);
        this.name = "ClaudeCircuitOpenError";
    }
}
export function toAppError(err) {
    if (err instanceof AppError)
        return err;
    const message = err instanceof Error ? err.message : String(err);
    // Map Anthropic SDK errors
    if (err && typeof err === "object" && "status" in err) {
        const status = err.status;
        if (status === 400)
            return new ClaudeParamError(message);
        if (status === 401)
            return new ClaudeAuthError();
        if (status === 429)
            return new ClaudeRateLimitError();
        if (status === 529 || status === 500)
            return new ClaudeOverloadError();
    }
    return new AppError("INTERNAL_ERROR", message, 500, false);
}
