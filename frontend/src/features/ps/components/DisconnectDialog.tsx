import { ConfirmDialog } from '@/components/common';

interface DisconnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DisconnectDialog({ isOpen, onClose, onConfirm, isLoading }: DisconnectDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Disconnect PS Account"
      message="Are you sure you want to disconnect your Personalized Skill (PS) account? Your connection status will be set to disconnected, but your existing points can be synced again at any time."
      confirmText="Disconnect"
      cancelText="Cancel"
      isDangerous
      isLoading={isLoading}
    />
  );
}
export default DisconnectDialog;
