import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: "/giris",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }
        
        console.log("Giriş başarılı. Kullanıcı:", {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback çalışıyor");
      console.log("User bilgisi:", user);
      console.log("Önceki token:", token);
      
      if (user) {
        // Kullanıcı ilk kez giriş yaptığında
        token.id = user.id;
        token.role = user.role;
        
        console.log("JWT'ye yeni bilgiler eklendi:", token);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback çalışıyor");
      console.log("Token:", token);
      
      if (token) {
        // JWT'den gelen bilgileri session'a aktar
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        console.log("Session güncellenmiş hali:", session);
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export const getAuthSession = () => getServerSession(authOptions); 