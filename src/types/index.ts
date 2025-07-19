export type AccountType = 'LDAP' | 'Локальная';

export interface Account {
  id: number;
  label: { text: string }[];
  type: AccountType;
  login: string;
  password: string | null;
  isValid: boolean;
}
