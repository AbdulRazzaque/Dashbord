import createHttpError from "http-errors";
import userModel from "../models/userModel";
import bcrypt from "bcryptjs";
import { backgroundColors } from "../constants";

export class UserService {
    async create({
        firstName,
        lastName,
        email,
        password,
        address,
        mobileNo,
        role,
    }: any) {
        const user = await userModel.findOne({ email });

        if (user) {
            const err = createHttpError(400, "Email is already exists!");
            throw err;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Choose a random background color from the array
        const randomBackgroundColor =
            backgroundColors[
                Math.floor(Math.random() * backgroundColors.length)
            ];

        const newUser = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            address,
            mobileNo,
            avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&&color=fff&&background=${randomBackgroundColor}&&rounded=true&&font-size=0.44`,
        });

        return { user: newUser };
    }

    async findByEmailWithPassword(email: string) {
        return await userModel.findOne({ email }).select("+password");
    }

    async findById(id: string) {
        return await userModel.findById(id);
    }

    async update(userId: string, { firstName, lastName, avatar }: any) {
        return await userModel.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                ...(avatar && { avatar: avatar }),
            },
            { new: true },
        );
    }

    async updatePassword(password: string, userId: string) {
        return await userModel.findByIdAndUpdate(
            userId,
            {
                password,
            },
            { new: true },
        );
    }

    async verifyUser(userId: string) {
        return await userModel.findByIdAndUpdate(
            userId,
            {
                isVerified: true,
            },
            { new: true },
        );
    }

    async savedFCMToken(userId: string, FCMToken: string) {
        return await userModel.findByIdAndUpdate(
            userId,
            {
                FCMToken: FCMToken,
            },
            { new: true },
        );
    }

    async removedFCMToken(userId: string) {
        return await userModel.findByIdAndUpdate(
            userId,
            {
                $unset: { FCMToken: "FCMToken" },
            },
            { new: true },
        );
    }
}
