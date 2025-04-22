export interface NetWorth {
  id: number;
  name: string;
  value: number;
  user?: number;
}

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: 'I' | 'E';
  category: string;
  description: string;
}

export interface GoalTransaction {
  id: number;
  date: string;
  amount: number;
  description: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  goal_transactions: GoalTransaction[];
}

export interface UserFinanceData {
  id: number;
  username: string;
  email: string ;
  assets: NetWorth[];
  transactions: Transaction[];
  goals: Goal[];
}
