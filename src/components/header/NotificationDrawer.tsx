import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Droplet, Sparkles, Utensils, Flame, Check, Bell, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useWellness();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplet size={18} color="var(--color-water)" />;
      case 'activity':
        return <Sparkles size={18} color="var(--color-healthy)" />;
      case 'meal':
        return <Utensils size={18} color="var(--color-notice)" />;
      case 'streak':
        return <Flame size={18} color="var(--color-notice)" />;
      default:
        return <Bell size={18} color="var(--color-primary)" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications Panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-xl)',
        borderLeft: '1px solid var(--color-border)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Notifications</h2>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close notifications panel"
          className="btn-secondary"
          style={{ padding: '0.4rem', minHeight: 'auto' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Actions Bar */}
      {unreadCount > 0 && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={markAllNotificationsRead}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600
            }}
          >
            <Check size={14} /> Mark all as read
          </button>
        </div>
      )}

      {/* Notification List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <Bell size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>You have no notifications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                role="article"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: notif.read ? 'var(--color-bg-card)' : 'var(--color-primary-light)',
                  border: `1px solid ${notif.read ? 'var(--color-border)' : 'var(--color-primary-border)'}`,
                  display: 'flex',
                  gap: '0.75rem',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {notif.title}
                    </h3>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
                      {notif.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                    {notif.message}
                  </p>
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      style={{
                        marginTop: '0.5rem',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Check size={12} /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
