#### 當前進度🚨🚨🚨✅

- [✅] 1.onMounted 將 data.ts資料放到store
- [] 2.搜尋匡用 v-model 跟 ref 變量綁定
- [✅] 3.computed 去監聽搜尋匡、status、tags，用.filter去跑整個放在store的資料，如果沒有進行任何篩選的話 return 原始資料
- [✅] 4.補全防抖知識並給搜尋匡加上，
- [] 5.了解v-model.lazy(失焦才觸發)、debounce 函式、lodash等等效能優化
- [✅] 6.父組件 ProjectsView 傳參給子組件 ProjectsCard 改傳 computed return 結果

### 🌍 全局設定

- [ ] [app.vue] 寫 onMounted 來監測每次重新整理時是否還是登入狀態
- [ ] [src/components/common/GlobalLoading.vue] 寫全站讀取，每個頁面導入，用v-if判斷是否拿到資料，拿到前顯示讀取，除了要使用骨架屏的頁面

### 🚗 Route設定

- [ ] 跳轉後加上 Loading 效果 (轉圈圈)
- [ ] 需驗證身分頁面加上驗證，不通過跳轉登入畫面

### 🔐 登入模組 (Auth)

- [ ] [ForgotPasswordView.vue] 忘記密碼頁面有空再寫

- [ ] Google登入

### 🔐 註冊模組 (Auth)

- [ ] [RegisterForm.vue]給註冊授權 Button 加上setTimeout 模擬網路延遲 和 Loading 效果 (轉圈圈)
- [ ] [RegisterForm.vue]欄位加上icon
- [ ] [RegisterForm.vue] 註冊成功後跳轉到登入頁，並把email填入欄位
- [ ] [RegisterForm.vue] 給 input 加上 <template #prefix> 給前綴位置加上 icon

### 🏠 Layout

- [ ] [layouts/index.vue] 用遞歸寫sidebar
- [ ] [layouts/index.vue] header-left 和 header-right 在視窗寬度小於多少時變成垂直排列

### 📦 專案管理 (Projects)

- [ ] ❤️‍🔥必要功能[UI] 響應式佈局：卡片在寬螢幕應該是 4 欄，平板 2 欄，手機 1 欄
- [ ] ❤️‍🔥必要功能[UI] 實作 `ProjectsView.vue`，展示作品，用卡片展示
- [ ] ❤️‍🔥必要功能[UI + Logic] Header：搜尋：搜尋專案名稱、描述關鍵字..，過濾：分類下拉菜單，新增專案...
- [ ] ❤️‍🔥必要功能[UI + Logic] Main：card 另外封裝，花時間設計好卡片UI和顯示內容，已想到內容：Title、截圖、技術棧標籤、描述、Demo連結、各種操作按鍵
- [ ] ❤️‍🔥必要功能[card] 圖片外層容器加上 aspect-video (16:9) 和 object-cover
- [ ] ❤️‍🔥必要功能[UI + Logic] Footer：資料分頁
- [ ] ❤️‍🔥必要功能[] 決定用 Dialog 或 Drawer 或是其他更好的來做卡片新增、編輯
- [ ] ❤️‍🔥必要功能[] 設計好卡片內的操作頁面全局操作
- [ ] ❤️‍🔥必要功能[UI] 空狀態處理：搜尋不到結果時，要顯示"暫無數據"等圖示
- [ ] ❤️‍🔥必要功能[Logic] 狀態更新：編輯或新增、刪除等等操作後會更新頁面

- [ ] 🟠加分功能[UI + Logic]卡片顯示摘要，有時間決定點開卡片後顯示 Dialog 或 Drawer 或詳情頁顯示詳情
- [ ] 🟠加分功能[UI] 骨架屏：在資料還沒載入前，顯示灰色的卡片輪廓
- [ ] 🟠加分功能[UI] Hover 效果：滑鼠移過卡片時有陰影加深或微小的位移
- [ ] 🟠加分功能[UI] 確認動畫、視窗：對卡片或全局操作時跳出確認視窗或動畫
- [ ] 🟠加分功能[UI] 寫通用毛玻璃效果，讓輸入匡輸入時

- [ ] 🟩有空再做[Logic] 排序功能：按創建日期或優先級排序等等...
- [ ] 🟩有空再做[Logic] 篩選功能： 技術棧篩選、狀態篩選等等...
- [ ] 🟩有空再做[Logic] 拖拽排序：拖拽改變位置，但要想好跟排序功能如何相容
- [ ] 🟩有空再做[Logic] 全局操作：、批量編輯、刪除

- [ ] 🟩有空再做[View] 新增一個tags管理頁面，使用者可以自己整理tags，可以增刪改查，旁邊有一區會有專案有用過但還沒整理的tags，可以拖拉整理

### 📊 數據看板 (Dashboard)

- [ ] [UI] 實作 `DashboardView.vue`

### 📊 經歷 (Experience)

- [ ] [UI] 實作 `ExperienceView,vue` 可拉動的時間軸

### 🛠️ 技能管理 (Skills)

- [ ] [UI] 實作 `SkillsView.vue` 技能分類標籤

### ⚙️ 系統設定 (Settings)

- [ ] [UI] 實作 `SettingsView.vue` 白天黑夜色調切換

### 👮🏻‍♀️users 用戶設定
