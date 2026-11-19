"use server";

import { db } from "@/src/config/db";
import { applicants, employers, users } from "@/src/drizzle/schema";
import argon2 from "argon2";
import { eq, or } from "drizzle-orm";
import {
    LoginUserData,
    loginUserSchema,
    RegisterUserData,
    registerUserSchema,
} from "../auth.schema";
import {
    createSessionAndSetCookies,
    invalidateSession,
} from "./use-cases/sessions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { getCurrentUser } from "./auth.queries";

export const registerUserAction = async (data: RegisterUserData) => {
    try {
        const { data: validatedData, error } = registerUserSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const { name, userName, email, password, role } = validatedData;
        const [user] = await db
            .select()
            .from(users)
            .where(or(eq(users.email, email), eq(users.userName, userName)));
        if (user) {
            if (user.email === email)
                return {
                    status: "ERROR",
                    message: "Email already exists",
                };
            else
                return {
                    status: "ERROR",
                    message: "Username already exists",
                };
        }
        const hashedPassword = await argon2.hash(password);
        
        await db.transaction(async (tx) => {
            const [result] = await tx
                .insert(users)
                .values({ name, userName, email, password: hashedPassword, role });

            if (role == "applicant") {
                await tx.insert(applicants).values({ id: result.insertId });
            } else {
                await tx.insert(employers).values({ id: result.insertId });
            }

            await createSessionAndSetCookies(result.insertId, tx);
        });
        
        return {
            status: "SUCCESS",
            message: "User registered successfully",
        };
    } catch {
        return {
            status: "ERROR",
            message: "Something went wrong",
        };
    }
};

export const loginUserAction = async (data: LoginUserData) => {
    try {
        const { data: validatedData, error } = loginUserSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const { email, password } = validatedData;
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            return {
                status: "ERROR",
                message: "User not found",
            };
        }
        const isPasswordValid = await argon2.verify(user.password, password);
        if (!isPasswordValid) {
            return {
                status: "ERROR",
                message: "Invalid password",
            };
        }

        await createSessionAndSetCookies(user.id);

        return {
            status: "SUCCESS",
            message: "User logged in successfully",
        };
    } catch (error: any) {
        console.error(error);
        return {
            status: "ERROR",
            message: error.message,
        };
    }
};

export const logoutUserAction = async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) return redirect("/login");

    const hashedToken = createHash("sha-256").update(session).digest("hex");

    await invalidateSession(hashedToken);
    cookieStore.delete("session");

    return redirect("/login");
};

export const getCurrentUserAction = async () => {
    try {
        const user = await getCurrentUser();
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            userName: user.userName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
        };
    } catch {
        return null;
    }
};

