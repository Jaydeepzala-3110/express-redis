import jwt from "jsonwebtoken";

function verifyToken(token: string) {
  const secret: any = process.env.JWT_SECRET;
  const verifiedToken = jwt.verify(token, secret);
  return verifiedToken;
}

function generateToken(payload: any, type: any) {
  const secret: any = process.env.JWT_SECRET;
  const generatedToken = jwt.sign(payload, secret);
  return generateToken;
}
export { verifyToken, generateToken };
