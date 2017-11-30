<template>
  <el-form-item>
    <el-button :loading="updateLoading" type="info" @click="handleUpload">选择excel文件导出</el-button>
    <input id="excel-upload-input" type="file" accept=".xlsx, .xls" class="c-hide" @change="handkeFileChange">
  </el-form-item>
</template>

<script>

</script>

<style scoped>
  #excel-upload-input{
    display: none;
    z-index: -9999;
  }
</style>
