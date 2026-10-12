import { redirect } from 'next/navigation';

export default function ControlCenterLoginRedirect() {
  redirect('/axr-secure-gate/login');
}