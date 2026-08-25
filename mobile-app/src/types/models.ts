import type { User } from './user';

export type GroupMember = {
  id: number;
  group_id: number;
  user_id: number | null;
  name: string;
  user: User | null;
};

export type Group = {
  id: number;
  name: string;
  created_by: number;
  members: GroupMember[];
  members_count?: number;
  payer_id: number | null;
  payer: GroupMember | null;
};

export type GroupBalance = {
  group_member_id: number;
  user_id: number | null;
  name: string;
  balance: number;
  gross_balance: number;
  is_payer: boolean;
  status: 'pending' | 'paid';
};

export type BillStatus = 'processing' | 'parsed' | 'confirmed' | 'failed';
export type ShareType = 'equal' | 'percentage' | 'exact_amount';

export type Assignment = {
  id: number;
  item_id: number;
  group_member_id: number;
  share_type: ShareType;
  share_value: string | null;
  group_member?: GroupMember;
};

export type BillItem = {
  id: number;
  bill_id: number;
  name: string;
  quantity: string;
  unit_price: string;
  total_price: string;
  final_price: string;
  assignments: Assignment[];
};

export type Bill = {
  id: number;
  group_id: number;
  uploaded_by: number;
  image_url: string | null;
  merchant_name: string | null;
  bill_date: string | null;
  subtotal: string | null;
  tax_amount: string | null;
  tax_label: string | null;
  discount_amount: string | null;
  discount_type: 'flat' | 'percentage' | null;
  service_charge: string | null;
  tip_amount: string | null;
  total: string | null;
  status: BillStatus;
  items: BillItem[];
};

export type Buddy = {
  id: number;
  buddy_user_id: number;
  user: User;
  created_at: string;
};

export type Settlement = {
  id: number;
  group_id: number;
  paid_by: number;
  paid_to: number;
  amount: string;
  note: string | null;
  settled_at: string | null;
  payer?: GroupMember;
  payee?: GroupMember;
};

export type UserBalances = {
  groups: {
    group_id: number;
    group_name: string;
    group_member_id: number;
    balance: number;
    status: 'pending' | 'paid';
    is_payer: boolean;
    payer_id: number | null;
    payer_name: string | null;
  }[];
  overall_balance: number;
};

export type AppNotification = {
  id: number;
  user_id: number;
  type: string;
  message: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
};
