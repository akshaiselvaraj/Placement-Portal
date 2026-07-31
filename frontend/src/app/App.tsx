import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';
import { ToastProvider } from '@/components/feedback/ToastProvider';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ToastProvider />
    </Providers>
  );
}

export default App;
