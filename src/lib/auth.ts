import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });
        if (!user) {
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          activeProfileType: user.activeProfileType,
          enabledProfiles: user.enabledProfiles,
          ownerProfileId: user.ownerProfileId?.toString(),
          tenantProfileId: user.tenantProfileId?.toString(),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.activeProfileType = user.activeProfileType;
        token.enabledProfiles = user.enabledProfiles;
        token.ownerProfileId = user.ownerProfileId;
        token.tenantProfileId = user.tenantProfileId;
      }

      // Handle profile switch via session update
      if (trigger === "update" && session) {
        if (session.activeProfileType !== undefined) {
          token.activeProfileType = session.activeProfileType;
        }
        if (session.enabledProfiles) {
          token.enabledProfiles = session.enabledProfiles;
        }
        if (session.ownerProfileId) {
          token.ownerProfileId = session.ownerProfileId;
        }
        if (session.tenantProfileId) {
          token.tenantProfileId = session.tenantProfileId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.activeProfileType = token.activeProfileType;
      session.user.enabledProfiles = token.enabledProfiles;
      session.user.ownerProfileId = token.ownerProfileId;
      session.user.tenantProfileId = token.tenantProfileId;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
};
