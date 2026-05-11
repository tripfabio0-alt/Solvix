import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SegmentProvider } from '../hooks/SegmentContext';
import { AppShell } from '../components/layout/AppShell';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SegmentProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </SegmentProvider>
  );
}
export default AppLayout;
