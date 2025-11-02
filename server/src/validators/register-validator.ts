import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        notEmpty: true,
        errorMessage: "First name is required!",
        trim: true,
    },
    lastName: {
        notEmpty: true,
        errorMessage: "Last name is required!",
        trim: true,
    },
    email: {
        trim: true,
        notEmpty: true,
        errorMessage: "Email is required!",
        isEmail: {
            errorMessage: "Email should be a valid email",
        },
        customSanitizer: {
            options: (value: string) => value.toLowerCase(),
        },
    },
    password: {
        notEmpty: true,
        errorMessage: "Password is required!",
        trim: true,
        isLength: {
            options: { min: 6 },
            errorMessage: "Password should be at least 6 characters",
        },
        matches: {
            options: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
            errorMessage:
                "Password must contain letters, numbers, and special characters",
        },
    },
    address: {
        notEmpty: true,
        errorMessage: "Address is required!",
        trim: true,
    },
    mobileNo: {
        notEmpty: true,
        errorMessage: "Mobile No is required!",
        trim: true,
    },
    role: {
        optional: true,
    },
});
