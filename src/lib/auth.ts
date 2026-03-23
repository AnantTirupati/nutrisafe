import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import { User } from "@/models/User";
import { HealthProfile } from "@/models/HealthProfile";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            accounts: [{ provider: account.provider, providerAccountId: account.providerAccountId ?? "" }],
          });
          await HealthProfile.create({
            userId: dbUser._id,
            medicalConditions: [],
            allergies: [],
            dietaryPreference: "Non-Vegetarian",
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        if (user.email) {
          token.email = user.email;
        }
        // Always use our MongoDB user _id (not OAuth provider id) so HealthProfile userId is valid ObjectId
        if (user.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email }).select("_id isPremium").lean();
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.isPremium = dbUser.isPremium ?? false;
          }
        } else if (user.id) token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { email?: string }).email = token.email as string;
        (session.user as { isPremium?: boolean }).isPremium = token.isPremium as boolean;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
