import ApiError from "../utils/ApiError.js";
const globalErrorHandler = (err, req, res, next) => {

	let statusCode = 500;
	let message = "Something went wrong!";

	if (err instanceof ApiError) {
		statusCode = err?.statusCode;
		message = err.message;
	} else if (err instanceof Error) {
		message = err.message;
	}

	res.status(statusCode).json({
		success: false,
		message,
		stack: process.env.NODE_ENV === "development" ? err?.stack : null,
	});
};

export default globalErrorHandler;
