import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link2, Loader2 } from 'lucide-react';
import { toast } from '@/store';

export function ConnectPSCard() {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    const isInstalled = document.documentElement.getAttribute('data-ps-extension-installed') === 'true';
    if (!isInstalled) {
      toast.error('Chrome Extension is not installed or disabled. Please install the BIT PS Connector extension and refresh the page.');
      return;
    }

    setIsConnecting(true);
    const token = localStorage.getItem('token');
    
    // Send postMessage to Content Script
    window.postMessage(
      {
        source: 'placement-portal',
        type: 'CONNECT_PS',
        data: { token },
      },
      '*'
    );
    toast.info('Connecting via Chrome Extension... Please launch the extension.');
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message) return;

      // Handle response from extension content script
      if (message.source === 'ps-extension' && message.type === 'CONNECT_PS_RESPONSE') {
        setIsConnecting(false);
        const response = message.data;
        if (response && response.success) {
          toast.success(response.message || 'Connected successfully!');
          queryClient.invalidateQueries({ queryKey: ['ps-data'] });
          queryClient.invalidateQueries({ queryKey: ['student-profile'] });
        } else {
          toast.error(response?.message || 'Connection failed.');
        }
      }

      // Handle direct actions triggered from the extension popup
      if (message.source === 'ps-extension-popup' && message.type === 'POPUP_CONNECT') {
        handleConnect();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col items-center text-center space-y-4 shadow-xs">
      <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
        {isConnecting ? (
          <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--primary))]" />
        ) : (
          <Link2 className="h-7 w-7 stroke-[1.5]" />
        )}
      </div>
      <div className="space-y-1.5">
        <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
          PS Account Disconnected
        </h4>
        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed max-w-[260px] font-semibold">
          Connect your Personalized Skill (PS) account to automatically synchronize your Activity Points, Opportunity Points, Responsive Score and Level Clearance.
        </p>
      </div>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] transition-all rounded-xl cursor-pointer shadow-xs shadow-primary/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        {isConnecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isConnecting ? 'Connecting...' : 'Connect PS Account'}
      </button>
    </div>
  );
}
export default ConnectPSCard;
