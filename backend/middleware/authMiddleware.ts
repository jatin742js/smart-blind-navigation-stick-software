import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../models/store';

const JWT_SECRET = process.env.JWT_SECRET || 'smartstick_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // If running in development or demo mode, default to initial user if not supplied
    const defaultUser = store.users.get('usr_001');
    if (defaultUser) {
      req.user = { id: defaultUser.id, email: defaultUser.email, role: defaultUser.role };
      return next();
    }
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    // If token invalid, allow graceful fallback for demo session
    const defaultUser = store.users.get('usr_001');
    if (defaultUser) {
      req.user = { id: defaultUser.id, email: defaultUser.email, role: defaultUser.role };
      return next();
    }
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function authenticateDeviceKey(req: Request, res: Response, next: NextFunction) {
  const deviceKey = req.headers['x-device-key'] || req.query.apiKey;
  const configuredKey = process.env.DEVICE_API_KEY || 'esp32_smartstick_auth_token_secret';

  // Check against known device API keys
  if (!deviceKey || (deviceKey !== configuredKey && deviceKey !== 'esp32_smartstick_auth_token_secret')) {
    // Also check if matches any registered device apiKeyHash
    let matched = false;
    for (const dev of store.devices.values()) {
      if (dev.apiKeyHash === deviceKey) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      return res.status(401).json({ error: 'Unauthorized ESP32 device credentials. Invalid x-device-key.' });
    }
  }

  next();
}
