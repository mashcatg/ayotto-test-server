class ApiError extends Error {
	constructor(statusCode, message = "Something went wrong", stack = "") {
		super(message);
		this.success = false;
		this.statusCode = statusCode;
		this.message = message;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export default ApiError;
