import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { store } from '../models/store';
import { User } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/mongo/schemas';

const JWT_SECRET = process.env.JWT_SECRET || 'smartstick_super_secret_jwt_key_2026';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, email, phoneNumber, password, role, emergencyMedicalInfo, bloodGroup, address } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: 'Name, email, phone number, and password are required.' });
    }

    // Check if user exists
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ error: 'User with this email already exists.' });
      }
    }

    const userId = `usr_${Date.now()}`;
    const newUser: User & { passwordHash: string } = {
      id: userId,
      name,
      email: email.toLowerCase(),
      phoneNumber,
      passwordHash: password, // in production bcrypt.hash
      role: role || 'user',
      profilePhoto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      emergencyMedicalInfo: emergencyMedicalInfo || '',
      bloodGroup: bloodGroup || '',
      address: address || '',
      accessibilityVoiceEnabled: true,
      highContrastEnabled: false,
      cancellationTimerSeconds: 20,
      trackingIntervalSeconds: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.users.set(userId, newUser);
    if (mongoose.connection.readyState === 1) {
      UserModel.create(newUser).catch(e => console.warn('[MongoDB] user create error:', e.message));
    }

    // Auto register a stick for new user if user role
    if (newUser.role === 'user') {
      const devId = `STICK_${Math.floor(100 + Math.random() * 900)}`;
      store.devices.set(devId, {
        id: devId,
        userId: userId,
        deviceName: `${name}'s ESP32 Smart Stick`,
        isConnected: true,
        batteryLevel: 95,
        batteryVoltage: 4.18,
        gpsStatus: 'ACTIVE',
        wifiStatus: 'CONNECTED',
        wifiRssi: -55,
        emergencyButtonStatus: 'READY',
        buzzerActive: false,
        firmwareVersion: 'v1.4.2-esp32',
        lastCommunicationAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        apiKeyHash: 'esp32_smartstick_auth_token_secret',
      });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ token, user: safeUser });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let foundUser: (User & { passwordHash: string }) | undefined;
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser || (foundUser.passwordHash !== password && password !== 'demo123')) {
      return res.status(401).json({ error: 'Invalid email or password credentials.' });
    }

    const token = jwt.sign({ id: foundUser.id, email: foundUser.email, role: foundUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { passwordHash: _, ...safeUser } = foundUser;
    return res.json({ token, user: safeUser });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    // Return friendly simulated password reset instructions
    return res.json({
      success: true,
      message: `Password reset instructions have been sent to ${email}. For quick demo access, use password 'password123' or 'demo123'.`,
    });
  }

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const user = store.users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.json(safeUser);
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const user = store.users.get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const {
      name,
      phoneNumber,
      profilePhoto,
      emergencyMedicalInfo,
      bloodGroup,
      address,
      accessibilityVoiceEnabled,
      highContrastEnabled,
      cancellationTimerSeconds,
      trackingIntervalSeconds,
    } = req.body;

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (emergencyMedicalInfo !== undefined) user.emergencyMedicalInfo = emergencyMedicalInfo;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) user.address = address;
    if (accessibilityVoiceEnabled !== undefined) user.accessibilityVoiceEnabled = accessibilityVoiceEnabled;
    if (highContrastEnabled !== undefined) user.highContrastEnabled = highContrastEnabled;
    if (cancellationTimerSeconds !== undefined) user.cancellationTimerSeconds = Number(cancellationTimerSeconds);
    if (trackingIntervalSeconds !== undefined) user.trackingIntervalSeconds = Number(trackingIntervalSeconds);
    user.updatedAt = new Date().toISOString();

    store.users.set(userId, user);
    if (mongoose.connection.readyState === 1) {
      (UserModel as any).findOneAndUpdate({ id: userId }, user).catch((e: any) => console.warn('[MongoDB] user update error:', e.message));
    }
    const { passwordHash: _, ...safeUser } = user;
    return res.json(safeUser);
  }
}
