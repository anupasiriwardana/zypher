import User from "@/models/User";
import connectDB from "@/utils/db";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        try {
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("User not found");
          }

          // Prevent Google users from using password
          if (user.provider !== "local") {
            const providerName = user.provider === "google" ? "Google" : user.provider === "github" ? "GitHub" : user.provider;
            throw new Error(`Please sign in with ${providerName}`);
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'primary-user',
            image: user.image || null,
            provider: user.provider || 'local'
          };
        } catch (error) {
          throw new Error(`Login failed : ${error.message}`);
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'primary-user', // Default role for Google users
          provider: 'google'
        };
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email repo"
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: 'primary-user', // Default role for GitHub users
          provider: 'github'
        };
      }
    })
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user role to the token on initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image || null; // Handle image if available
        token.provider = user.provider;
      }
      
      // Store GitHub access token for API calls
      if (account && account.provider === "github") {
        token.githubAccessToken = account.access_token;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image || null; // Handle image if available
        session.user.provider = token.provider;
        session.githubAccessToken = token.githubAccessToken; // Add GitHub access token to session
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        // Prevent local users from using OAuth
        if (existingUser && existingUser.provider !== account.provider) {
          const providerName = account.provider === "google" ? "Google" : "GitHub";
          if (existingUser.provider === "local") {
            return `/login?error=This email is already registered with a local account`;
          } else {
            const existingProviderName = existingUser.provider === "google" ? "Google" : "GitHub";
            return `/login?error=This email is already registered with ${existingProviderName}`;
          }
        }

        // If user doesn't exist and it's a signup
        if (!existingUser) {
          const newUser = new User({
            name: user.name,
            email: user.email,
            role: user.role || 'primary-user',
            provider: user.provider || account.provider,
            image: user.image || null // Handle image if available
          });

          await newUser.save();
          user.id = newUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
          user.role = existingUser.role;

          // Update image if it's changed on the provider
          if (user.image && existingUser.image !== user.image) {
            existingUser.image = user.image;
            await existingUser.save();
          }
        }
      }

      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };