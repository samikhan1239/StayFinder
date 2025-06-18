import jwt from "jsonwebtoken";

export async function getUserFromToken(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    console.log("getUserFromToken: Auth header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("getUserFromToken: No valid Authorization header");
      return null;
    }
    const token = authHeader.split(" ")[1];
    console.log("getUserFromToken: Token:", token.substring(0, 20) + "...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("getUserFromToken: Decoded:", {
      userId: decoded.userId,
      email: decoded.email,
    });
    return { _id: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error("getUserFromToken: Token verification error:", error.message);
    return null;
  }
}
