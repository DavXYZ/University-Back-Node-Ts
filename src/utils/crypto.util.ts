import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../entities/user.entity'
import { AppDataSource } from '../data-source';
import redisClient from '../config/redis';


// Secret key for signing JWT
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh';
const userRepository = AppDataSource.getRepository(User);

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Validate password
export const validatePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate Access Token (short-lived) and Refresh Token (long-lived)
export const generateTokens = (payload: any,remember_me:boolean) => {
  const refreshTokenExpiry = remember_me
  ? process.env.JWT_REFRESH_EXPIRATION_LONG
  : process.env.JWT_REFRESH_EXPIRATION_SHORT;

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET,{expiresIn: process.env.JWT_EXPIRATION});
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET,{expiresIn: refreshTokenExpiry});
  return { accessToken, refreshToken };
};

// Verify Access Token
export const verifyAccessToken = (token: string): Record<string, any> | null => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as Record<string, any>;
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): Record<string, any> | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as Record<string, any>;
  } catch (error) {
    return null;
  }
};

// Refresh Access Token using Refresh Token
export const refreshTokens = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    // Invalid refresh token → reset remember_me in DB
    const payload = jwt.decode(refreshToken) as { id?: string };
    if (payload?.id) {
      await userRepository.update(payload.id, { remember_me: false });
    }
    return null;
  }

  // Double check with Redis
  const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);
  if (!storedToken || storedToken !== refreshToken) {
    await userRepository.update(decoded.id, { remember_me: false });
    return null;
  }

  const user = await userRepository.findOneBy({ id: decoded.id });
  const remember_me = user?.remember_me || false;

  const newTokens = generateTokens({
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
    full_name: decoded.full_name,
    remember_me
  },    remember_me);

  return {
    ...newTokens,
    remember_me,
    id: decoded.id
  };
};
