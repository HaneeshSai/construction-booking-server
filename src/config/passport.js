import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../utils/prismaClient.js";

passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role });
});

passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.role === "customer") {
      user = await prisma.customer.findUnique({ where: { id: data.id } });
    } else if (data.role === "vendor") {
      user = await prisma.vendor.findUnique({ where: { id: data.id } });
    }
    done(null, user ? { ...user, role: data.role } : null);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        // Check if user exists as customer
        let customer = await prisma.customer.findUnique({
          where: { email },
        });

        if (customer) {
          // Update googleId if not set
          if (!customer.googleId) {
            customer = await prisma.customer.update({
              where: { id: customer.id },
              data: { googleId },
            });
          }
          return done(null, { ...customer, role: "customer" });
        }

        // Create new customer with Google account
        customer = await prisma.customer.create({
          data: {
            email,
            fullName,
            googleId,
            phone: "", // Will be updated later by user
            password: "", // No password for OAuth users
          },
        });

        return done(null, { ...customer, role: "customer" });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
