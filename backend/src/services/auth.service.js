import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const accessSecret = process.env.JWT_ACCESS_SECRET;

if (!accessSecret) {
  throw new Error('JWT_ACCESS_SECRET is not configured');
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    accessSecret,
    { expiresIn: '15m' }
  );
}

export async function registerUser({ username, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    const error = new Error('Email is already registered');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      email: normalizedEmail,
      passwordHash
    }
  });

  return {
    user: toPublicUser(user),
    accessToken: createAccessToken(user)
  };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  return {
    user: toPublicUser(user),
    accessToken: createAccessToken(user)
  };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}
