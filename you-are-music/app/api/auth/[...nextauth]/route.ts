import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/prisma";
import { compare } from "bcryptjs";
export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                console.log("Attempting to authorize user with email:", credentials?.email, "and password:", credentials?.password ? "********" : "No password provided");
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                console.log("User found:", user);
                if (!user) return null;

                

                const ok = await compare(credentials.password, user.password);
                if (!ok) return null;

                console.log("User authorized:", user);

                return { id: user.id, email: user.email } as any;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = (user as any).id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) (session.user as any).id = token.sub;
            return session;
        },
    },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };