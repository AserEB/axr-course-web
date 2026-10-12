import { redirect } from 'next/navigation';

export default function ControlCenterDashboardRedirect() {
  redirect('/axr-secure-gate/dashboard');
}