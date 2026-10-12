export type StudentStatus = 'NULL' | 'Pending' | 'Verified' | 'Discard' | 'Pending_Dispute';

export interface Student {
  user_id: number;
  student_custom_id?: string;
  username?: string;
  password_hash?: string;
  full_name: string;
  gender?: string;
  phone: string;
  email: string;
  payment_method?: 'CBE' | 'Telebirr';
  screenshot_file_id?: string;
  status: StudentStatus;
  admin_message?: string;
  handled_by?: string;
  round: number;
  referred_by?: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash?: string;
  full_name: string;
  role: 'owner' | 'assistant';
  is_active: boolean;
  created_at?: string;
}

export interface Certificate {
  certificate_id: string;
  user_id: number;
  student_name: string;
  course_name: string;
  round: number;
  issued_date: string;
  image_url: string;
}

export interface LocalJob {
  id: string;
  title: string;
  company: string;
  salary: string;
  description: string;
  apply_contact: string;
  created_at: string;
  expires_at: string;
}

export interface RemoteJob {
  title: string;
  company: string;
  url: string;
  date: string;
  level: string;
  source: string;
}

export interface DiscountInfo {
  total_joined: number;
  pending_count: number;
  verified_count: number;
  coins: number;
  percent: number;
  discount_amount: number;
  final_payable: number;
}