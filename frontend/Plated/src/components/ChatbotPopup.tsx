interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotPopup({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 76, width: 320, height: 420, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Cooking Assistant</strong>
        <button onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div style={{ marginTop: 12, color: '#6b7280' }}>
        Ask me anything about recipes while you browse.
      </div>
    </div>
  );
}


