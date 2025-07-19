import { defineStore } from 'pinia';

interface Label {
  text: string;
}

interface Account {
  id: number;
  label: Label[];
  type: 'LDAP' | 'Локальная';
  login: string;
  password: string | null;
  isValid: boolean; // Добавляем поле для валидации
}

export const useAccountStore = defineStore('account', {
  state: () => ({
    accounts: [] as Account[],
    nextId: 1, // Для генерации уникальных ID
  }),
  actions: {
    addAccount() {
      const newAccount: Account = {
        id: this.nextId++,
        label: [],
        type: 'Локальная', // По умолчанию "Локальная"
        login: '',
        password: '',
        isValid: false, // Изначально невалидно
      };
      this.accounts.push(newAccount);
    },
    deleteAccount(id: number) {
      this.accounts = this.accounts.filter(account => account.id !== id);
    },
    updateAccount(updatedAccount: Account) {
      const index = this.accounts.findIndex(account => account.id === updatedAccount.id);
      if (index !== -1) {
        this.accounts[index] = updatedAccount;
      }
    },
    // Метод для сохранения состояния (для простоты - в localStorage)
    loadAccounts() {
      const savedAccounts = localStorage.getItem('accounts');
      if (savedAccounts) {
        this.accounts = JSON.parse(savedAccounts);
        // Обновляем nextId, чтобы избежать коллизий при добавлении
        const maxId = this.accounts.reduce((max, acc) => Math.max(max, acc.id), 0);
        this.nextId = maxId + 1;
      }
    },
    saveAccounts() {
      localStorage.setItem('accounts', JSON.stringify(this.accounts));
    },
  },
});