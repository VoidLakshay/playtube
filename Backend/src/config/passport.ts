import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import prisma from "../lib/prisma.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },

    async (
      _accessToken,

      _refreshToken,

      profile,

      done,
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("No email found"),

            undefined,
          );
        }

        let user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        // ======================================
        // CREATE USER IF NOT EXISTS
        // ======================================

        if (!user) {
          user = await prisma.user.create({
            data: {
              userName: profile.displayName,

              email,

              password: "",

              photoUrl: profile.photos?.[0]?.value || "",
            },
          });
        }

        // ======================================
        // GENERATE TOKENS
        // ======================================

        const accessToken = generateAccessToken({
          id: user.id,
        });

        const refreshToken = generateRefreshToken({
          id: user.id,
        });

        // ======================================
        // STORE REFRESH TOKEN
        // ======================================

        await prisma.user.update({
          where: {
            id: user.id,
          },

          data: {
            refreshToken,
          },
        });

        return done(
          null,

          {
            user,

            accessToken,

            refreshToken,
          },
        );
      } catch (error) {
        return done(error, undefined);
      }
    },
  ),
);

export default passport;
