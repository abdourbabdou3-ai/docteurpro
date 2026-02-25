import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { doctor: true },
                });

                if (!user) {
                    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                }

                if (user.status === 'PENDING') {
                    throw new Error('حسابك قيد المراجعة. يرجى الانتظار حتى يتم الموافقة عليه');
                }

                if (user.status === 'SUSPENDED') {
                    throw new Error('تم تعليق حسابك. يرجى التواصل مع الإدارة');
                }

                return {
                    id: user.id.toString(),
                    email: user.email,
                    role: user.role,
                    doctorId: user.doctor?.id,
                    doctorName: user.doctor?.name,
                    approved: user.doctor?.approved ?? false,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.doctorId = user.doctorId;
                token.doctorName = user.doctorName;
                token.approved = user.approved;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.doctorId = token.doctorId as number | undefined;
                session.user.doctorName = token.doctorName as string | undefined;
                session.user.approved = token.approved as boolean;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 60 * 24 * 60 * 60, // 60 days
        updateAge: 24 * 60 * 60, // Update session every 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
};
