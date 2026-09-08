import { Response } from 'express';
import { store, broadcastSSE } from '../models/store';
import { EmergencyContact } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { persistContactToMongo, deleteContactFromMongo } from '../services/mongoSync';

export class ContactController {
  static async getContacts(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const contacts: EmergencyContact[] = [];

    for (const c of store.contacts.values()) {
      if (c.userId === userId) {
        contacts.push(c);
      }
    }

    // Sort by priority (Primary first, then Secondary, then Tertiary)
    const priorityWeight = { PRIMARY: 1, SECONDARY: 2, TERTIARY: 3 };
    contacts.sort((a, b) => (priorityWeight[a.priority] || 4) - (priorityWeight[b.priority] || 4));

    return res.json(contacts);
  }

  static async createContact(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id || 'usr_001';
    const { contactName, relationship, phoneNumber, email, notificationPreference, priority, isAuthorizedCaregiver } = req.body;

    if (!contactName || !relationship || !phoneNumber || !email) {
      return res.status(400).json({ error: 'Contact name, relationship, phone number, and email are required.' });
    }

    const contactId = `cnt_${Date.now()}`;
    const newContact: EmergencyContact = {
      id: contactId,
      userId,
      contactName,
      relationship,
      phoneNumber,
      email,
      notificationPreference: notificationPreference || 'ALL',
      priority: priority || 'PRIMARY',
      isAuthorizedCaregiver: isAuthorizedCaregiver === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.contacts.set(contactId, newContact);
    persistContactToMongo(newContact);

    // If marked as authorized caregiver, ensure caregiver permission mapping exists
    if (newContact.isAuthorizedCaregiver) {
      const permId = `perm_${Date.now()}`;
      store.caregiverPermissions.set(permId, {
        id: permId,
        caregiverUserId: `caregiver_${contactId}`,
        patientUserId: userId,
        patientName: store.users.get(userId)?.name || 'Alex Johnson',
        patientPhone: store.users.get(userId)?.phoneNumber || '',
        canViewLiveLocation: true,
        canViewEmergencyAlerts: true,
        canTriggerDeviceBuzzer: true,
        canViewHealthStatus: true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }

    broadcastSSE('CONTACT_CREATED', newContact);
    return res.status(201).json(newContact);
  }

  static async updateContact(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const contact = store.contacts.get(id);

    if (!contact) {
      return res.status(404).json({ error: 'Emergency contact not found.' });
    }

    const { contactName, relationship, phoneNumber, email, notificationPreference, priority, isAuthorizedCaregiver } = req.body;
    if (contactName) contact.contactName = contactName;
    if (relationship) contact.relationship = relationship;
    if (phoneNumber) contact.phoneNumber = phoneNumber;
    if (email) contact.email = email;
    if (notificationPreference) contact.notificationPreference = notificationPreference;
    if (priority) contact.priority = priority;
    if (isAuthorizedCaregiver !== undefined) contact.isAuthorizedCaregiver = isAuthorizedCaregiver;
    contact.updatedAt = new Date().toISOString();

    store.contacts.set(id, contact);
    persistContactToMongo(contact);
    broadcastSSE('CONTACT_UPDATED', contact);
    return res.json(contact);
  }

  static async deleteContact(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    if (!store.contacts.has(id)) {
      return res.status(404).json({ error: 'Emergency contact not found.' });
    }

    store.contacts.delete(id);
    deleteContactFromMongo(id);
    broadcastSSE('CONTACT_DELETED', { id });
    return res.json({ success: true, message: 'Emergency contact deleted successfully.' });
  }
}
