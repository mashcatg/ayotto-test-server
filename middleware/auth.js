import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import { handleAsync } from "../utils/handleAsync.js";

const auth = (...requiredRoles) => {
	return handleAsync(async (req, res, next) => {
		const token = req.headers.authorization
		//console.log( req.headers);
		console.log("token", token);
		// checking if the token is missing
		if (!token) {
			throw new ApiError(401, "You are not authorized!");
		}

		// checking if the given token is valid
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const { id, role } = decoded;
		console.log(role);

		// checking if the user is exist
		const user = await User.findById(id);

		if (!user) {
			throw new ApiError(404, "This user is not found !");
		}

		//console.log("role", role);

		if (requiredRoles && !requiredRoles.includes(role)) {
			throw new ApiError(401, "You are not authorized !");
		}

		req.user = {
			_id: id,
			role,
		};
		next();
	});
};

export default auth;
