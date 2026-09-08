import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { DeviceController } from '../controllers/deviceController';
import { ContactController } from '../controllers/contactController';
import { EmergencyController } from '../controllers/emergencyController';
import { DemoController } from '../controllers/demoController';
import { authenticateJWT, authenticateDeviceKey } from '../middleware/authMiddleware';
import { sseClients } from '../models/store';

const router = Router();

// --- Health Check ---
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Smart Blind Navigation Stick Backend API',
    version: '1.4.2',
    timestamp: new Date().toISOString(),
  });
});

// --- Real-time SSE Stream ---
router.get('/device/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Send initial handshake ping
  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.findIndex(c => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// --- 1. Authentication & Profile ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.get('/users/profile', authenticateJWT as any, AuthController.getProfile as any);
router.put('/users/profile', authenticateJWT as any, AuthController.updateProfile as any);

// --- 2. Emergency Contacts ---
router.get('/contacts', authenticateJWT as any, ContactController.getContacts as any);
router.post('/contacts', authenticateJWT as any, ContactController.createContact as any);
router.put('/contacts/:id', authenticateJWT as any, ContactController.updateContact as any);
router.delete('/contacts/:id', authenticateJWT as any, ContactController.deleteContact as any);

// --- 3. Smart Stick Device Endpoints ---
router.post('/device/register', DeviceController.registerDevice);
router.get('/device/status', authenticateJWT as any, DeviceController.getDeviceStatus as any);
router.post('/device/location', DeviceController.recordLocation);
router.post('/device/sensor-data', DeviceController.recordSensorData);
router.post('/device/emergency', DeviceController.triggerEmergency);
router.post('/device/emergency/cancel', DeviceController.cancelEmergency);
router.post('/device/emergency/resolve', DeviceController.resolveEmergency);
router.post('/device/buzzer-command', DeviceController.triggerBuzzerCommand);
router.post('/device/heartbeat', DeviceController.heartbeat);

// --- 4. Emergency & Location History ---
router.get('/emergency/history', authenticateJWT as any, EmergencyController.getEmergencyHistory as any);
router.get('/emergency/active', authenticateJWT as any, EmergencyController.getActiveEmergency as any);
router.get('/location/history', authenticateJWT as any, EmergencyController.getLocationHistory as any);
router.get('/notifications', authenticateJWT as any, EmergencyController.getNotifications as any);
router.post('/notifications/send', authenticateJWT as any, EmergencyController.sendNotification as any);
router.post('/notifications/:id/retry', authenticateJWT as any, EmergencyController.retryNotification as any);

// --- 5. Caregiver Endpoints ---
router.get('/caregiver/patients', authenticateJWT as any, EmergencyController.getCaregiverPatients as any);

// --- 6. Demo Simulation Endpoints ---
router.post('/demo/simulate-emergency', DemoController.simulateEmergency);
router.post('/demo/simulate-gps', DemoController.simulateGPSUpdate);
router.post('/demo/simulate-obstacle', DemoController.simulateObstacle);
router.post('/demo/simulate-battery', DemoController.simulateLowBattery);
router.post('/demo/simulate-disconnect', DemoController.simulateDisconnect);
router.post('/demo/reset', DemoController.resetSimulation);

// --- 7. System & Database Status ---
router.get('/system/db-status', (req, res) => {
  const { getMongoStatus } = require('../config/mongo');
  res.json({
    engine: 'MongoDB',
    status: getMongoStatus(),
  });
});

export default router;
