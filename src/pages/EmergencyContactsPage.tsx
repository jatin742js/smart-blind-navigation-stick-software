import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Phone, Mail, Shield, Check, X, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { EmergencyContact, ContactPriority, NotificationChannel } from '../types';

export const EmergencyContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  // Form states
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('Caregiver');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [notificationPreference, setNotificationPreference] = useState<NotificationChannel>('ALL');
  const [priority, setPriority] = useState<ContactPriority>('PRIMARY');
  const [isAuthorizedCaregiver, setIsAuthorizedCaregiver] = useState(false);
  const [formError, setFormError] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openCreateModal = () => {
    setEditingContact(null);
    setContactName('');
    setRelationship('Caregiver');
    setPhoneNumber('');
    setEmail('');
    setNotificationPreference('ALL');
    setPriority('PRIMARY');
    setIsAuthorizedCaregiver(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactName(contact.contactName);
    setRelationship(contact.relationship);
    setPhoneNumber(contact.phoneNumber);
    setEmail(contact.email);
    setNotificationPreference(contact.notificationPreference);
    setPriority(contact.priority);
    setIsAuthorizedCaregiver(contact.isAuthorizedCaregiver);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !phoneNumber.trim() || !email.trim()) {
      setFormError('Please enter contact name, phone number, and email.');
      return;
    }

    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, {
          contactName,
          relationship,
          phoneNumber,
          email,
          notificationPreference,
          priority,
          isAuthorizedCaregiver,
        });
      } else {
        await api.createContact({
          contactName,
          relationship,
          phoneNumber,
          email,
          notificationPreference,
          priority,
          isAuthorizedCaregiver,
        });
      }
      setIsModalOpen(false);
      loadContacts();
    } catch (err: any) {
      setFormError(err.message || 'Error saving contact');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from emergency contacts?`)) return;
    try {
      await api.deleteContact(id);
      loadContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const priorityColors: Record<ContactPriority, { badge: string; border: string }> = {
    PRIMARY: { badge: 'bg-red-50 text-red-700 border-red-200', border: 'border-red-200' },
    SECONDARY: { badge: 'bg-amber-50 text-amber-800 border-amber-200', border: 'border-amber-200' },
    TERTIARY: { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-blue-200' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Emergency Contacts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Individuals immediately notified when the smart stick's emergency button is pushed
            </p>
          </div>
        </div>

        {/* Clear "Add Emergency Contact" Button */}
        <button
          onClick={openCreateModal}
          id="add-emergency-contact-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md hover:shadow-blue-600/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Contacts List Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading emergency contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No Emergency Contacts Configured</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Add your primary caregivers, parents, or friends so they receive automatic SMS, Email, and Push alerts when you press the emergency button.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(c => {
            const colors = priorityColors[c.priority] || priorityColors.PRIMARY;
            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl bg-white border ${colors.border} shadow-sm flex flex-col justify-between space-y-4 relative group hover:border-slate-300 transition`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{c.contactName}</h4>
                      <p className="text-xs text-slate-500">{c.relationship}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${colors.badge}`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800">{c.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-800">{c.email}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Channel: {c.notificationPreference}
                    </span>
                    {c.isAuthorizedCaregiver && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Authorized Caregiver
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.contactName)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 transition"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
                  <select
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Brother/Sister">Brother / Sister</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Friend">Friend</option>
                    <option value="Physician">Doctor / Clinic</option>
                    <option value="Neighbor">Neighbor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Priority *</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as ContactPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="PRIMARY">Primary (First Alerted)</option>
                    <option value="SECONDARY">Secondary</option>
                    <option value="TERTIARY">Tertiary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (SMS/Call) *</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Channels</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['ALL', 'SMS', 'EMAIL', 'PUSH'] as NotificationChannel[]).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setNotificationPreference(ch)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        notificationPreference === ch
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Authorized Caregiver Access</span>
                  <p className="text-[11px] text-slate-500">Allows this contact to log in and monitor live GPS & telemetry</p>
                </div>
                <input
                  type="checkbox"
                  checked={isAuthorizedCaregiver}
                  onChange={e => setIsAuthorizedCaregiver(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
                >
                  {editingContact ? 'Save Changes' : 'Create Contact'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
