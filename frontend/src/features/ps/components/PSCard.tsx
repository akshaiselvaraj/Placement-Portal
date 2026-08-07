import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePS, useDisconnectPS, usePushPSData } from '../hooks';
import { ConnectPSCard } from './ConnectPSCard';
import { DisconnectDialog } from './DisconnectDialog';
import { LoadingSkeleton } from '@/components/common';
import { Loader2 } from 'lucide-react';
import { toast } from '@/store';

export function PSCard() {
  const queryClient = useQueryClient();
  const { data: psData, isLoading, isError, refetch } = usePS();
  const { mutate: disconnectPS, isPending: isDisconnecting } = useDisconnectPS();
  const { mutate: pushPSData, isPending: isPushing } = usePushPSData();
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = () => {
    const isInstalled = document.documentElement.getAttribute('data-ps-extension-installed') === 'true';
    if (!isInstalled) {
      toast.error('Chrome Extension is not installed or disabled. Please install the BIT PS Connector extension and refresh the page.');
      return;
    }

    setIsSyncing(true);
    const token = localStorage.getItem('token');
    
    // Dispatch message to Content Script for sync
    window.postMessage(
      {
        source: 'placement-portal',
        type: 'SYNC_PS',
        data: { token },
      },
      '*'
    );
    toast.info('Triggering synchronization via Chrome Extension...');
  };

  const handleDisconnect = () => {
    disconnectPS(undefined, {
      onSuccess: () => {
        setIsDisconnectOpen(false);
      },
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message) return;

      // Handle response from extension content script
      if (message.source === 'ps-extension' && message.type === 'SYNC_PS_RESPONSE') {
        setIsSyncing(false);
        const response = message.data;
        if (response && response.success) {
          toast.success(response.message || 'Synchronized successfully!');
          refetch(); // Reload data from DB
          queryClient.invalidateQueries({ queryKey: ['student-profile'] });
        } else {
          toast.error(response?.message || 'Sync failed.');
        }
      }

      // Handle direct actions triggered from the extension popup
      if (message.source === 'ps-extension-popup' && message.type === 'POPUP_SYNC') {
        handleSyncNow();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetch, queryClient]);

  // Date formatter helper: DD MMM YYYY • h:mm A
  const formatSyncDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = `${hours}:${minutes} ${ampm}`;
    
    return `${day} ${month} ${year} • ${strTime}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4">
        <LoadingSkeleton count={1} height="h-6" className="w-1/2" />
        <LoadingSkeleton count={3} height="h-10" />
      </div>
    );
  }

  // Handle disconnected state
  if (isError || !psData || !psData.psConnected) {
    return <ConnectPSCard />;
  }

  return (
    <>
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-5 animate-in relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Header: Title and Connection Badge */}
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))]">
            Personalized Skill (PS)
          </h4>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-555">
            🟢 Connected
          </span>
        </div>

        {/* Info Grid (Row-based list) */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
            <span className="text-[hsl(var(--text-secondary))] font-bold">Activity Points</span>
            <span className="font-black text-[hsl(var(--text-primary))]">
              {(psData.activityPoints ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
            <span className="text-[hsl(var(--text-secondary))] font-bold">Opportunity Points</span>
            <span className="font-black text-[hsl(var(--text-primary))]">
              {(psData.opportunityPoints ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
            <span className="text-[hsl(var(--text-secondary))] font-bold">Responsive Score</span>
            <span className="font-black text-[hsl(var(--text-primary))]">
              {(psData.responsiveScore ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
            <span className="text-[hsl(var(--text-secondary))] font-bold">PS Level</span>
            <span className="font-black text-[hsl(var(--text-primary))]">
              {psData.levelClearance || 'None'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
            <span className="text-[hsl(var(--text-secondary))] font-bold">Last Synced</span>
            <span className="font-black text-[hsl(var(--text-primary))] text-right">
              {formatSyncDate(psData.lastSynced)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
            <span className="text-[hsl(var(--text-secondary))] font-bold">Sharing Status</span>
            <span className={`font-bold text-[11px] ${psData.psPushed ? 'text-emerald-600' : 'text-amber-500'}`}>
              {psData.psPushed ? '🟢 Shared with PO' : '⚪ Not Shared with PO'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => pushPSData()}
            disabled={isPushing}
            className="w-full py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isPushing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {psData.psPushed ? 'Push Updates to PO' : 'Push to Placement Officer'}
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl transition-all cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSyncing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={() => setIsDisconnectOpen(true)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] transition-all cursor-pointer text-center"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Disconnect Dialog */}
      <DisconnectDialog
        isOpen={isDisconnectOpen}
        onClose={() => setIsDisconnectOpen(false)}
        onConfirm={handleDisconnect}
        isLoading={isDisconnecting}
      />
    </>
  );
}
export default PSCard;
