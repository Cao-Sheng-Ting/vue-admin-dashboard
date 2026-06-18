import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// 1定義配置
const config = defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,

  {
    name: 'app/custom-rules',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      'vue/multi-word-component-names': ['error', { ignores: ['index'] }],
      '@typescript-eslint/no-explicit-any': [
        'warn',
        {
          fixToUnknown: false,
          ignoreRestArgs: true,
        },
      ],
      // 新增規則：允許底線開頭的變數不被檢查 (用於解構時忽略不需要的欄位)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
)

// 使用 ReturnType 獲取該函數的回傳型別並導出
// 既解決了 "Not portable" 報錯，又不需要手動維護不相容的型別
export default config as ReturnType<typeof defineConfigWithVueTs>
