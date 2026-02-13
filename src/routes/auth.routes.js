import express from "express";
import passport from "../config/passport.js";
import { generateToken } from "../utils/jwt.js";

const router = express.Router();

// Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    session: false,
  }),
  (req, res) => {
    try {
      const user = req.user;
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Redirect to mobile app with token
      const redirectUrl = `${process.env.MOBILE_APP_SCHEME || "constructionbooking"}://auth/callback?token=${token}&role=${user.role}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect("/auth/failure");
    }
  }
);

// Auth failure
router.get("/failure", (req, res) => {
  res.status(401).json({
    status: "error",
    message: "Authentication failed",
  });
});

export default router;
