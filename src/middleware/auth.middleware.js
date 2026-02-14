import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Auth middleware - authHeader:", authHeader);
  
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1].replace(/^"|"$/g, "");
  console.log("Auth middleware - extracted token:", token);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Auth middleware - JWT verification error:", err);
      return res.status(403).json({ message: "Invalid token", error: err.message });
    }
    console.log("Auth middleware - decoded user:", user);
    req.user = user;
    next();
  });
};
