<template>
  <div class="search-form-box bg-white p-3 mb-1 ">
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="項目名稱"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button>搜尋</el-button>
      </el-form-item>
      <el-form-item>
        <el-button>編輯</el-button>
      </el-form-item>

    </el-form>
  </div>
  <div class="main-box bg-white flex-1">
    <el-row>
      <el-col :span="24">
        <p>卡片內容</p>
      </el-col>
    </el-row>
  </div>
</template>
