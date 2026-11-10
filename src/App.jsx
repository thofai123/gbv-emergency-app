import React, { useState, useEffect } from 'react';
import { Phone, ShieldAlert, UserPlus, Trash2, MapPin, AlertCircle, HeartHandshake, Lock, UserCheck } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('gbv_auth_token') || '');

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+260');
  const [regPin, setRegPin] = useState('');

  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+260');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const [pinUnlock, setPinUnlock] = useState(false);

  const defaultHelplines = [
    { label: 'Gender Based Violence Toll-Free Helpline', number: '990' },
    { label: 'Childline / GBV Support Services', number: '116' },
    { label: 'Police Emergency Response', number: '999' }
  ];

  useEffect(() => {
    const savedProfile = localStorage.getItem('gbv_user_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    if (authToken) {
      fetchContacts(authToken);
    } else {
      const savedContacts = localStorage.getItem('gbv_emergency_contacts');
      if (savedContacts) {
        try { setContacts(JSON.parse(savedContacts)); } catch (e) { console.error(e); }
      }
    }
    fetchLocation();
  }, [authToken]);

  const fetchContacts = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
        localStorage.setItem('gbv_emergency_contacts', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to cached local contacts.', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || regPin.length < 4) {
      alert('Please fill in your name, a valid phone number, and a 4-digit PIN.');
      return;
    }

    const payload = { name: regName.trim(), phone: regPhone.trim(), pin: regPin.trim() };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed');
        return;
      }

      setUserProfile(data.user);
      setAuthToken(data.token);
      localStorage.setItem('gbv_user_profile', JSON.stringify(data.user));
      localStorage.setItem('gbv_auth_token', data.token);
      setPinUnlock(true);
    } catch (err) {
      alert('Network error connecting to backend server. Storing profile locally.');
      setUserProfile({ name: payload.name, phone: payload.phone });
      localStorage.setItem('gbv_user_profile', JSON.stringify(payload));
    }
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError('');
        setLocating(false);
      },
      () => {
        setLocationError('Unable to retrieve location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const newContact = { name: name.trim(), phone: phone.trim() };

    if (authToken) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(newContact)
        });
        if (res.ok) {
          const saved = await res.json();
          const updated = [...contacts, saved];
          setContacts(updated);
          localStorage.setItem('gbv_emergency_contacts', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Failed to sync contact to server:', err);
      }
    } else {
      const updated = [...contacts, { id: Date.now(), ...newContact }];
      setContacts(updated);
      localStorage.setItem('gbv_emergency_contacts', JSON.stringify(updated));
    }

    setName('');
    setPhone('+260');
  };

  const handleDeleteContact = async (id) => {
    if (authToken) {
      try {
        await fetch(`${API_BASE_URL}/contacts/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch (err) {
        console.error('Failed to delete contact from server:', err);
      }
    }
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem('gbv_emergency_contacts', JSON.stringify(updated));
  };

  const getEmergencyMessage = () => {
    let msg = `EMERGENCY SOS ALERT! ${userProfile ? userProfile.name : 'A victim'} (${userProfile ? userProfile.phone : 'Unregistered'}) needs immediate help!`;
    if (location) {
      msg += ` Location: https://maps.google.com/?q=${location.lat},${location.lng}`;
    }
    return encodeURIComponent(msg);
  };

  const primaryContact = contacts[0]?.phone || defaultHelplines[0].number;

  if (!userProfile) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '24px 16px', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <HeartHandshake size={48} color="#dc2626" />
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>SafeAssist Portal</h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Register user account to back up contacts & protect SOS alerts.</p>
        </header>

        <form onSubmit={handleRegister} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="#2563eb" /> Create Registered Profile
          </h2>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Mary Banda"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Phone Number</label>
            <input
              type="tel"
              placeholder="+260971234567"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Set 4-Digit PIN</label>
            <input
              type="password"
              maxLength={4}
              placeholder="****"
              value={regPin}
              onChange={(e) => setRegPin(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{ padding: '12px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}
          >
            Complete Registration
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HeartHandshake size={28} color="#dc2626" />
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>SafeAssist</h1>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Registered to: <strong>{userProfile.name} ({userProfile.phone})</strong></p>
      </header>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <a
          href={`tel:${primaryContact}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '170px',
            height: '170px',
            borderRadius: '50%',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            textDecoration: 'none',
            margin: '0 auto',
            boxShadow: '0 10px 25px rgba(220, 38, 38, 0.4)',
            border: '4px solid #fca5a5'
          }}
        >
          <ShieldAlert size={52} />
          <span style={{ fontWeight: '800', fontSize: '18px', marginTop: '6px' }}>CALL SOS</span>
        </a>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '10px' }}>
          Dials: <strong>{contacts[0] ? `${contacts[0].name} (${contacts[0].phone})` : 'GBV Helpline (990)'}</strong>
        </p>
      </div>

      {contacts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <a
            href={`sms:${contacts.map(c => c.phone).join(',')}?body=${getEmergencyMessage()}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Phone size={18} />
            Send Broadcast SMS Alert to All Contacts
          </a>
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color={location ? '#16a34a' : '#ea580c'} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>
            {locating ? 'Acquiring GPS location...' : location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'GPS Inactive'}
          </span>
        </div>
        <button
          onClick={fetchLocation}
          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
        >
          Refresh
        </button>
      </div>

      <section style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={18} /> Trusted Personal Contacts ({contacts.length})
          </h2>
          <button
            onClick={() => setPinUnlock(!pinUnlock)}
            style={{ background: 'none', border: 'none', color: pinUnlock ? '#16a34a' : '#64748b', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
          >
            {pinUnlock ? <UserCheck size={14} /> : <Lock size={14} />}
            {pinUnlock ? 'Unlocked' : 'Unlock Settings'}
          </button>
        </div>

        {!pinUnlock ? (
          <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0' }}>Unlock settings to manage contacts.</p>
            <button
              onClick={() => setPinUnlock(true)}
              style={{ padding: '6px 12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Unlock Controls
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Contact Name (e.g. Sister, Friend)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <input
                type="tel"
                placeholder="Phone (+260...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
              <button
                type="submit"
                style={{ padding: '8px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Add Trusted Contact
              </button>
            </form>

            {contacts.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No contacts saved yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {contacts.map((c) => (
                  <li key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{c.phone}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} /> National Helplines (Zambia)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {defaultHelplines.map((h, i) => (
            <a
              key={i}
              href={`tel:${h.number}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ fontSize: '12px', fontWeight: '500' }}>{h.label}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>{h.number}</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
