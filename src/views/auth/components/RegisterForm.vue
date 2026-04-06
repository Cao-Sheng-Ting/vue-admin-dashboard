<script setup lang="ts">
import axios from 'axios'
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RegisterForm, RegisterParams, } from '@/types/user'
import { roleOptions, QUICK_AUTH_CONFIG, type AgreementType } from '../types'
import { registerAPI } from '@/services/userService'


const router = useRouter()

const ruleFormRef = ref()
const ruleForm = ref<RegisterForm>({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  authCode: '',
  role: 'user',
})

const validateConfirmPassword = function (rule: unknown, value: string, callback: (error?: Error) => void) {
  if (value !== ruleForm.value.password) {
    callback(new Error('兩次輸入的密碼不一致！'))
  } else {
    callback()
  }
}

const validateAuthCode = function (rule: unknown, value: string, callback: (error?: Error) => void) {
  const isValid = Object.values(QUICK_AUTH_CONFIG).map((i) => i.code).includes(value)
  if (isValid || value == '') {
    callback()
  } else {
    callback(new Error('無效的授權碼'))
  }
}

//TODO: []
// 處理管理員/編輯者快速填入授權碼邏輯，並根據權限連動禁用不符的角色選項
const handleQuickAuth = function (roleType: 'admin' | 'editor') {
  const config = QUICK_AUTH_CONFIG[roleType]
  if (!config) return

  const { role, code, allowed } = config
  ruleForm.value.role = role
  ruleForm.value.authCode = code

  roleOptions.value.forEach((option) => {
    option.disabled = !allowed.includes(option.role)
  })
  ruleFormRef.value?.validateField('authCode')
  ElMessage.success(`[${role === 'admin' ? '最高權限' : '編輯權限'}] 授權成功`)
}

const rules = reactive({
  email: [
    { required: true, message: '請輸入email', trigger: 'blur' },
    { type: 'email', message: 'email格式錯誤', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    {
      pattern: /^[A-Z][a-zA-Z\d]{7,11}$/,
      message: '密碼格式錯誤,需以大寫字母開頭且長度為 8~12 字元',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '請輸入暱稱' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z\d_]{2,20}$/, message: '長度 2-20 位，不可使用空格或特殊符號', trigger: 'blur' }
  ],
  authCode: [
    { validator: validateAuthCode, trigger: 'blur' }
  ]

})

const agreementStatus = ref({
  service: {
    checked: false,
    visible: false,
    unread: true,
  },
  privacy: {
    checked: false,
    visible: false,
    unread: true
  }
})

const handleAgreementVisible = function (type: AgreementType) {
  agreementStatus.value[type].visible = true
}

const handleScroll = function (e: Event, type: AgreementType) {
  if (!agreementStatus.value[type].unread) return
  const target = e.target as HTMLElement
  const { scrollTop, clientHeight, scrollHeight } = target

  // 確認用戶已閱讀完畢，預留 5px 緩衝值
  if (Math.ceil(scrollTop) + clientHeight >= scrollHeight - 5) {
    agreementStatus.value[type].unread = false

  }
}

const isSubmitDisabled = computed(() => {
  //檢查協議是否都以勾選
  const { service, privacy } = agreementStatus.value
  const isAgreementInvalid = !service.checked || service.unread || !privacy.checked || privacy.unread

  //檢查表達必填項目
  const { email, password, confirmPassword, nickname } = ruleForm.value
  const isFormEmpty = !email.trim() || !password || !confirmPassword || !nickname.trim()

  return isAgreementInvalid || isFormEmpty
})

const register = async () => {
  if (isSubmitDisabled.value) return
  await ruleFormRef.value.validate()

  // 解構排除僅前端校驗用的 confirmPassword 與 authCode，確保送往後端的資料純淨
  const { confirmPassword, authCode, ...cleanData }: RegisterParams & { confirmPassword: unknown, authCode: unknown } = ruleForm.value;
  void confirmPassword;
  void authCode;

  try {
    await registerAPI(cleanData)
    ElMessage.success('註冊成功')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      ElMessage.error(error.response?.data?.message || '註冊失敗，請稍後再試')
    } else {
      console.log('發生其他錯誤：', error)
      ElMessage.error('系統發生預期外的錯誤：' + error)
    }
  }
}

</script>
<template>
  <div class="register-content w-full max-w-[850px] mx-auto px-10 min-h-full h-auto">
    <!-- <el-page-header @back="router.back()"> -->
    <div>
      <el-icon @click="router.back()" size="30"
        class="cursor-pointer ml-[-10px] hover:-translate-x-2 hover:text-indigo-600">
        <icon-ic:baseline-arrow-back-ios />
      </el-icon>
    </div>
    <h2 class="text-5xl mb-11 text-center">建立管理員帳號</h2>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
      <el-row>
        <el-col :span="24">
          <div class="text-xs m-1">帳號基本資訊</div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item prop="email">
            <el-input placeholder="email" v-model="ruleForm.email" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="密碼" show-password v-model="ruleForm.password" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="nickname">
            <el-input placeholder="您的暱稱" v-model="ruleForm.nickname" clearable />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input type="password" placeholder="再次輸入密碼" show-password v-model="ruleForm.confirmPassword" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="text-xs m-1">權限設定</div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item prop="authCode">
            <el-input placeholder="授權碼" v-model="ruleForm.authCode" clearable></el-input>
          </el-form-item>
          <div class="w-full flex flex-col items-end">
            <div class="demo-actions flex items-center gap-2 mb-2">
              <span class="whitespace-nowrap">一鍵授權</span>
              <el-button type="success" size="small" plain @click="handleQuickAuth('admin')">Admin</el-button>
              <el-button type="primary" size="small" plain @click="handleQuickAuth('editor')">editor</el-button>
            </div>
            <p class="text-xs text-gray-500">選擇角色，系統自動帶入授權碼</p>
          </div>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="role">
            <el-select v-model="ruleForm.role" placeholder="角色">
              <el-option v-for="item in roleOptions" :key="item.role" :value="item.role" :label="item.label"
                :disabled="item.disabled"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20" justify="space-evenly" align="bottom" class="mt-2">
        <el-col :span="11">
          <el-form-item prop="role">
            <el-checkbox v-model="agreementStatus.service.checked" @click.prevent="handleAgreementVisible('service')">
              <span class="whitespace-normal"> 我已閱讀並同意《使用者服務協議》 </span>
            </el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item>
            <el-checkbox v-model="agreementStatus.privacy.checked" @click.prevent="handleAgreementVisible('privacy')">
              <span class="whitespace-normal"> 我已閱讀並同意《隱私保護政策》 </span>
            </el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="register-button py-3 text-center">
      <el-button :disabled="isSubmitDisabled" round @click="register" type="success" size='large'
        class="w-36">註冊</el-button>
    </div>

    <el-dialog v-model="agreementStatus.service.visible" title="使用者服務協議" width="600px" class="relative">
      <div @scroll="handleScroll($event, 'service')" class="max-h-[60vh] overflow-y-auto">
        <div class="space-y-6 text-gray-700 leading-relaxed text-sm ">
          <p class="font-bold text-gray-900 text-lg border-b pb-2">XXX 後台管理系統服務協議</p>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">一、 服務說明</h4>
            <p>本系統旨在提供企業級數據管理與自動化工作流服務。使用者必須註冊帳號並通過身分驗證後，方可進入管理後台進行操作。所有服務內容均受本協議之規範。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">二、 帳號與安全義務</h4>
            <p>使用者應妥善保管其登入憑證（含帳號、密碼及 API 授權金鑰）。凡經由正確憑證登入之行為，不論是否由本人操作，均視為使用者本人之行為。若發現帳號遭冒用或有安全性漏洞，請立即聯繫系統管理員進行凍結。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">三、 權限分配與行為準則</h4>
            <p>系統依據角色（如 Admin, Editor, Viewer）授予不同權限。使用者承諾僅在授權範圍內操作，嚴禁利用任何技術手段（如 SQL
              Injection、XSS、爬蟲攻擊、暴力破解）越權訪問非公開之敏感數據。任何惡意探測系統漏洞之行為，本平台保有法律追訴權。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">四、 數據合法性與智慧財產權</h4>
            <p>使用者在上傳、編輯或儲存數據時，應確保資料來源之真實性、完整性與合法性。嚴禁散佈非法、侵權、色情、暴力或含有惡意代碼之內容。系統中所有開發之組件、架構與介面設計，其智慧財產權均歸開發團隊所有。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">五、 隱私權保護與數據安全</h4>
            <p>
              我們重視您的個人隱私。系統會記錄登入日誌（Log）以供安全性稽核使用，相關日誌將受嚴格加密保護，未經法律程序或您的授權，不會向任何第三方披露。詳情請參閱《隱私保護政策》。使用者可隨時聯繫我們要求查閱、修改或刪除個人數據。
            </p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">六、 服務中斷與不可抗力</h4>
            <p>開發團隊保有隨時進行系統維護、硬體升級或架構調整之權利。因維護需要暫停服務時，將提前於首頁公告。對於因電信故障、自然災害、駭客攻擊等不可抗力因素導致之數據遺失或服務中斷，本平台不負賠償責任。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">七、 違規處理與帳號終止</h4>
            <p>若使用者違反本協議任何條款，系統將自動記錄違規行為並生成報告。系統管理員有權在充分取證後，採取限制權限、封鎖帳號或永久刪除數據之措施，並保留報警或採取法律行動之權利。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">八、 協議之修改與效力</h4>
            <p>本團隊保有隨時修改本協議內容之權利。修改後之條款將於系統登入頁面公佈，若您在公佈後繼續使用本服務，即代表您已接受修訂後之條款內容。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-green-500 pl-2">九、 數據備份與恢復</h4>
            <p>系統每日進行自動備份，以防數據意外遺失。使用者可透過管理後台的「備份管理」功能，查看備份歷史並在必要時進行數據復原。備份文件將保留 30 天，超期自動刪除。</p>
          </section>
          <div class="pt-4 ">
            <p class="text-[12px] text-gray-400 text-right italic">
              文件編號：SEC-2026-X01<br>
              最後更新日期：2026 年 X 月 XX 日
            </p>
          </div>
          <div class="flex sticky justify-center bottom-0 bg-white py-4 border-t border-dashed">
            <el-checkbox v-model="agreementStatus.service.checked" :disabled="agreementStatus.service.unread">
              <span class="whitespace-normal"> 我已閱讀並同意《使用者服務協議》 </span>
            </el-checkbox>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="agreementStatus.privacy.visible" title="隱私保護政策" width="600px" class="relative">
      <div @scroll="handleScroll($event, 'privacy')" class="max-h-[60vh] overflow-y-auto">
        <div class="space-y-6 text-gray-700 leading-relaxed text-sm">
          <p class="font-bold text-gray-900 text-lg border-b pb-2">XXX 後台管理系統隱私保護政策</p>
          <p>本政策旨在說明本系統如何收集、使用及保護您的個人資訊與系統數據。當您開始使用本服務，即代表您同意本政策之內容。</p>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">一、 資訊收集範圍</h4>
            <p>我們僅收集維持系統運作所必需的資訊：
            <ul class="list-disc ml-5 mt-1 space-y-1">
              <li>帳戶資訊：包含姓名、電子郵件、職位及登入憑證。</li>
              <li>系統日誌：包含 IP 地址、瀏覽器類型、操作時間及點擊流數據（用於安全性稽核）。</li>
              <li>設備資訊：硬體型號、作業系統版本及設備唯一識別碼。</li>
            </ul>
            </p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">二、 數據使用目的</h4>
            <p>所收集的數據將用於以下用途：
            <ul class="list-disc ml-5 mt-1 space-y-1">
              <li>身分驗證與存取權限控制，防止非法入侵。</li>
              <li>系統維護與故障排除，優化後台操作流暢度。</li>
              <li>安全性監控，偵測並攔截惡意代碼或暴力破解行為。</li>
            </ul>
            </p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">三、 數據保護技術</h4>
            <p>我們採取企業級加密措施：所有傳輸數據均通過 **SSL/TLS 加密**；敏感資訊（如密碼）採 **不可逆雜湊（Hash）** 存儲；數據庫具備每日備份與異地備援機制。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">四、 第三方披露原則</h4>
            <p>除非配合法律程序、政府調查或為保護本系統之合法權益，否則我們**絕不**將您的資訊提供、出售或出租給任何第三方。所有數據處理均符合當地個人資料保護法規（如 GDPR 或相關規範）。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">五、 Cookie 與追蹤技術</h4>
            <p>本系統使用必要之 Cookie 以維持您的登入狀態。您可以透過瀏覽器設置拒絕 Cookie，但這可能導致您無法正常使用本系統的部分功能。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">六、 您的權利</h4>
            <p>您有權隨時透過系統設置或聯繫管理員，要求查閱、更正、刪除您的個人資訊，或撤回對數據處理的授權。申請後我們將於 15 個工作日內完成處理。</p>
          </section>
          <section>
            <h4 class="font-bold mb-1 border-l-4 border-blue-500 pl-2">七、 政策更新</h4>
            <p>本隱私政策可能因法規變動或服務更新而不時修訂。重大修訂將於您登入時跳窗提示，繼續使用服務即視為同意新修訂之內容。</p>
          </section>
          <div class="pt-4">
            <p class="text-[12px] text-gray-400 text-right italic">
              文件編號：PRIV-2026-V01<br>
              最後更新日期：2026 年 X 月 XX 日
            </p>
          </div>
          <div class="flex sticky justify-center bottom-0 bg-white py-4 border-t border-dashed">
            <el-checkbox v-model="agreementStatus.privacy.checked" :disabled="agreementStatus.privacy.unread">
              <span class="whitespace-normal"> 我已閱讀並同意《隱私保護政策》 </span>
            </el-checkbox>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.demo-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
