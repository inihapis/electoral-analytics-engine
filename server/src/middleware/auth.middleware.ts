import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.warn(`[AUTH] Missing token for ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: string };
    req.user = decoded;
    console.log(`[AUTH] Verified user: ${decoded.id} (${decoded.role})`);
    next();
  } catch (error: any) {
    console.error(`[AUTH] Token verification failed: ${error.message}`);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.error(`[AUTH] Authorization failed: No user found in request`);
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    if (!roles.includes(req.user.role)) {
      console.warn(`[AUTH] Forbidden access: User ${req.user.id} with role ${req.user.role} tried to access ${req.url}`);
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};
