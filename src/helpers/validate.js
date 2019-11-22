import validator from "validator";

export const validateEmail = v => {
    return validator.isEmail(v);
}

export const validateUrl = v => {
    return validator.isURL(v);
}