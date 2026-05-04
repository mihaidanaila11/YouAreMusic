'use server'

import bcrypt from "bcryptjs";

import { User } from "@/generated/prisma/client";
import { prisma } from "@/prisma";

export const addUser = async (user: Omit<User, "id">) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await prisma.user.create({
        data: {
            ...user,
            password: hashedPassword,
        },
    });

    return result;
}