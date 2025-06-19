import jwt from "jsonwebtoken";

export async function getUserFromToken(req) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return { _id: decoded.userId, email: decoded.email };
  } catch (error) {
    return null;
  }
}
