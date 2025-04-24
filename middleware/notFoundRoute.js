const notFoundRoute = (req, res, next) => {
	res.status(404).json({
		message: "Oops! API Not Found",
		error: "",
		success: false,
	});
};

export default notFoundRoute;
