import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET;

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization');
  const [scheme, token] = authorization?.split(' ') || [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  try {
    const payload = jwt.verify(token, accessSecret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    });
  }
}
