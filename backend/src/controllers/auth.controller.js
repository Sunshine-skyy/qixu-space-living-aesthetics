import { ZodError } from 'zod';
import { getUserById, loginUser, registerUser } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

function validationResponse(error) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues
    }
  };
}

export async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);
    const data = await registerUser(input);
    return res.status(201).json({ success: true, data, message: 'Registration successful' });
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json(validationResponse(error));
    if (error.code === 'EMAIL_EXISTS' || error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email is already registered' }
      });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);
    const data = await loginUser(input);
    return res.json({ success: true, data, message: 'Login successful' });
  } catch (error) {
    if (error instanceof ZodError) return res.status(400).json(validationResponse(error));
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User no longer exists' }
      });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
}
