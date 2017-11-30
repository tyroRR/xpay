<template>
  <el-form-item>
    <el-button :loading="loading" type="info" @click="handleUpload">select excel file</el-button>
    <input id="excel-upload-input" type="file" accept=".xlsx, .xls" class="c-hide" @change="handkeFileChange">
  </el-form-item>
</template>

<script>
  import XLSX from 'xlsx'
  export default {
    data() {
      return {
        loading: false,
        excelData: null
      }
    },
    methods: {
      generateDate(excelData) {
        this.excelData= results
        this.loading = false
        this.$emit('on-selected-file', this.excelData)
      },
      handleUpload() {
        document.getElementById('excel-upload-input').click()
      },
      handkeFileChange(e) {
        this.loading = true
        const files = e.target.files
        const itemFile = files[0] // only use files[0]
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const fixedData = this.fixdata(data)
          const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const results = XLSX.utils.sheet_to_json(worksheet)
          this.generateDate({ header, results })
        }
        reader.readAsArrayBuffer(itemFile)
      },
      fixdata(data) {
        let o = ''
        let l = 0
        const w = 10240
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
        return o
      }
    }
  }
</script>

<style scoped>
  #excel-upload-input{
    display: none;
    z-index: -9999;
  }
</style>
