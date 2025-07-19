<template>
  <div class="account-manager">
    <h1 class="title">Учетные записи</h1>
    <p class="hint">
      <el-icon><InfoFilled /></el-icon>
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель `;`
    </p>

    <el-button type="primary" class="add-button" @click="addAccount">
      <el-icon><Plus /></el-icon>
      Добавить
    </el-button>

    <div v-for="account in accounts" :key="account.id" class="account-item">
      <el-form :model="account" label-width="120px">
        <el-form-item
          label="Метка"
          :error="labelError(account)"
          class="form-item-label"
        >
          <el-input
            v-model="account.labelInput"
            @blur="updateLabel(account)"
            maxlength="50"
            placeholder="пример: tag1;tag2"
          />
        </el-form-item>

        <el-form-item label="Тип записи">
          <el-select v-model="account.type" @change="onTypeChange(account)">
            <el-option label="LDAP" value="LDAP" />
            <el-option label="Локальная" value="Локальная" />
          </el-select>
        </el-form-item>

        <el-form-item
          label="Логин"
          :class="{ 'is-error': !account.login && account.loginTouched }"
          :error="!account.login && account.loginTouched ? 'Обязательное поле' : ''"
        >
          <el-input
            v-model="account.login"
            @blur="markTouched(account, 'login')"
            @input="validate(account)"
            maxlength="100"
          />
        </el-form-item>

        <el-form-item
          v-if="account.type === 'Локальная'"
          label="Пароль"
          :class="{ 'is-error': !account.password && account.passwordTouched }"
          :error="!account.password && account.passwordTouched ? 'Обязательное поле' : ''"
        >
          <el-input
            v-model="account.password"
            @blur="markTouched(account, 'password')"
            @input="validate(account)"
            maxlength="100"
            show-password
          />
        </el-form-item>

        <el-button type="danger" @click="deleteAccount(account.id)" class="delete-button">
          <el-icon><Delete /></el-icon>
          Удалить
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAccountStore } from '../store/accountStore';
import { computed, onMounted, watch, ref } from 'vue';
import { ElMessage } from 'element-plus'; 
import { Plus, Delete, InfoFilled } from '@element-plus/icons-vue'; 

interface UIAccount {
  id: number;
  label: { text: string }[];
  type: 'LDAP' | 'Локальная';
  login: string;
  password: string | null;
  isValid: boolean;
  labelInput: string; 
  loginTouched: boolean; 
  passwordTouched: boolean; 
}

const store = useAccountStore();

const accounts = ref<UIAccount[]>([]);

watch(() => store.accounts, (newAccounts) => {
  accounts.value = newAccounts.map(account => ({
    ...account,
    labelInput: formatLabel(account.label),
    loginTouched: false,
    passwordTouched: false,
  }));
}, { immediate: true, deep: true });


const addAccount = () => {
  store.addAccount();
  store.saveAccounts(); 
};

const deleteAccount = (id: number) => {
  store.deleteAccount(id);
  store.saveAccounts(); 
  ElMessage.success('Учетная запись удалена'); 
};

const onTypeChange = (account: UIAccount) => {
  if (account.type === 'LDAP') {
    account.password = null;
    account.passwordTouched = false; 
  } else {
 
    if (account.password === null) {
      account.password = '';
    }
  }
  validate(account); 
  store.saveAccounts();
};

const validate = (account: UIAccount) => {
  const isLoginValid = account.login.trim() !== '';
  const isPasswordValid = account.type === 'LDAP' || (account.password?.trim() !== '');

  account.isValid = isLoginValid && isPasswordValid;

  
  if (account.isValid) {
  
    const accountToSave = {
      id: account.id,
      label: account.label,
      type: account.type,
      login: account.login,
      password: account.password,
      isValid: account.isValid,
    };
    store.updateAccount(accountToSave);
  }
  store.saveAccounts(); 
};


const markTouched = (account: UIAccount, field: 'login' | 'password') => {
  if (field === 'login') {
    account.loginTouched = true;
  } else if (field === 'password') {
    account.passwordTouched = true;
  }
  validate(account); 
};

const updateLabel = (account: UIAccount) => {
  account.label = account.labelInput
    .split(';')
    .map(v => v.trim())
    .filter(Boolean)
    .map(text => ({ text }));

  validate(account); 
  store.saveAccounts();
};

const formatLabel = (labels: { text: string }[]): string => {
  return labels.map(l => l.text).join(';');
};

const labelError = (account: UIAccount) => {
  return account.labelInput.length > 50 ? 'Максимум 50 символов' : '';
};

onMounted(() => {
  store.loadAccounts();
});

</script>

<style scoped>
.account-manager {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #31628d;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.add-button {
  width: 100%;
  margin-bottom: 30px;
}

.account-item {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative; 
}

.account-item .el-form-item {
  margin-bottom: 18px;
}

.account-item .el-form-item.is-error .el-input__wrapper {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}

.account-item .el-form-item.is-error .el-form-item__label {
  color: var(--el-color-danger);
}

.account-item .el-form-item__error {
  color: var(--el-color-danger);
}


.delete-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  padding: 8px 12px;
}

.el-form-item__label {
  min-width: 100px;
}
</style>