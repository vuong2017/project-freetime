import User from "../models/user";
import { handleError } from "../helpers/error";
import { userConstants } from "../helpers/constants";
import { validateUrl } from "../helpers/validate";

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            const errors = {};
            if (!username) errors.username = userConstants.USERNAME_REQUIRED;
            if (!password) errors.password = userConstants.PASSWORD_REQUIRED;
            return handleError(res, errors, 422);
        }
        const user = await User.findOne({ username });
        if (!user || !user.checkPassword(password)) {
            const errors = { message: userConstants.ACCOUNT_PASSWORD_INCORRECT };
            return handleError(res, errors, 401);
        } else {
            const token = user.createToken();
            const userToObject = user.toObject();
            delete userToObject.password;
            res.status(200).json({
                status: true,
                message: userConstants.LOGIN_SUCCESS,
                data: {
                    ...userToObject,
                    token
                }
            });
        }
    } catch (error) {
        handleError(res, error);
    }
};

const register = async (req, res) => {
    const body = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    }
    const user = new User(body);
    try {
        const result = await user.save();
        const resultToObject = result.toObject();
        delete resultToObject.password;
        const token = user.createToken();
        res.status(200).json({
            status: true,
            message: userConstants.CREATE_SUCCESS,
            data: {
                ...resultToObject,
                token
            }
        });
    } catch (error) {
        handleError(res, error);
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.headers;
        const redis = req.app.get('redis');
        redis.get("backlist_token", (err, data) => {
            const backlistToken = JSON.parse(data || '[]');
            if (!backlistToken.some(x => x === token)) {
                redis.set("backlist_token", JSON.stringify([...backlistToken, token]))
            }
            res.status(200).json({
                status: true,
                message: userConstants.LOGOUT_SUCCESS
            });
        })
    } catch (error) {
        handleError(res, error);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, host } = req.body;
        const errors = {};
        if (!email || !host) {
            if (!email) errors.email = userConstants.EMAIL_REQUIRED
            if (!host) errors.host = userConstants.HOST_REQUIRED
            return handleError(res, errors, 422);
        }
        if (!validateUrl(host)) {
            errors.host = userConstants.URL_INCORRECT;
            return handleError(res, errors, 422);
        }
        const conditions = { email };
        const user = await User.findOne(conditions)
        if (!user) {
            const errors = {
                email: userConstants.EMAIL_NOTFOUND
            }
            return handleError(res, errors, 404);
        }
        user.sendMailForgotPassword(host);
        res.status(200).json({
            status: true,
            message: userConstants.SEND_MAIL_RESET_PASSWORD(email)
        });
    } catch (error) {
        handleError(res, error);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { password, reset_password_token } = req.body;
        const conditions = {
            reset_password_token,
            reset_password_expires: {
                $gt: Date.now()
            }
        };
        const user = await User.findOne(conditions);
        if (!user) {
            const errors = {
                reset_password_token: userConstants.TOKEN_NOTFOUND
            }
            return handleError(res, errors, 422);
        };
        user.password = password;
        user.reset_password_token = null;
        user.reset_password_expires = 0;
        await user.save();
        res.status(200).json({
            status: true,
            message: userConstants.RESET_PASSWORD_SUCCESS
        });
    } catch (error) {
        handleError(res, error);
    }
};

export default {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
};
