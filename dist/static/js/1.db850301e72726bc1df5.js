webpackJsonp([1],{"3IRo":function(t,n,a){var e=a("QZ8t");"string"==typeof e&&(e=[[t.i,e,""]]),e.locals&&(t.exports=e.locals);a("8bSs")("4c6cb61a",e,!0)},"3MB+":function(t,n,a){var e=a("xmK5");"string"==typeof e&&(e=[[t.i,e,""]]),e.locals&&(t.exports=e.locals);a("8bSs")("071d3301",e,!0)},QZ8t:function(t,n,a){n=t.exports=a("BkJT")(!0),n.push([t.i,"\n.login-container {\n  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/\n  border-radius: 5px;\n  -moz-border-radius: 5px;\n  background-clip: padding-box;\n  margin: 160px auto;\n  width: 350px;\n  padding: 35px 35px 15px 35px;\n  background: #fff;\n  border: 1px solid #eaeaea;\n  -webkit-box-shadow: 0 0 25px #cac6c6;\n          box-shadow: 0 0 25px #cac6c6;\n  background: -o-linear-gradient(top, #fff, #6495ed);\n}\n.login-container .title {\n    margin: 0px auto 40px auto;\n    text-align: center;\n    color: #505458;\n}\n","",{version:3,sources:["D:/Program Files/WorkSpace/xpay/src/components/Login.vue"],names:[],mappings:";AACA;EACE,iFAAiF;EACjF,mBAAmB;EACnB,wBAAwB;EACxB,6BAA6B;EAC7B,mBAAmB;EACnB,aAAa;EACb,6BAA6B;EAC7B,iBAAiB;EACjB,0BAA0B;EAC1B,qCAAqC;UAC7B,6BAA6B;EACrC,mDAAmD;CACpD;AACD;IACI,2BAA2B;IAC3B,mBAAmB;IACnB,eAAe;CAClB",file:"Login.vue",sourcesContent:["\n.login-container {\n  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/\n  border-radius: 5px;\n  -moz-border-radius: 5px;\n  background-clip: padding-box;\n  margin: 160px auto;\n  width: 350px;\n  padding: 35px 35px 15px 35px;\n  background: #fff;\n  border: 1px solid #eaeaea;\n  -webkit-box-shadow: 0 0 25px #cac6c6;\n          box-shadow: 0 0 25px #cac6c6;\n  background: -o-linear-gradient(top, #fff, #6495ed);\n}\n.login-container .title {\n    margin: 0px auto 40px auto;\n    text-align: center;\n    color: #505458;\n}\n"],sourceRoot:""}])},xJsL:function(t,n,a){"use strict";function e(t){a("3MB+"),a("3IRo")}Object.defineProperty(n,"__esModule",{value:!0});var o=a("3cXf"),r=a.n(o),s=a("TIfe"),i={data:function(){return{logining:!1,userInfo:{account:"",password:""},rules:{account:[{required:!0,message:"请输入账号",trigger:"blur"}],password:[{required:!0,message:"请输入密码",trigger:"blur"}]}}},methods:{handleLogin:function(){var t=this;this.$refs.AccountFrom.validate(function(n){if(!n)return console.log("error submit!!"),!1;t.logining=!0;var a={account:t.userInfo.account,password:t.userInfo.password};t.$http.post("http://www.wfpay.xyz/xpay/admin/login",a).then(function(n){t.logining=!1,Object(s.c)(n.data.data.token);var a=n.data.data.id,e=n.data.data.role,o=n.data.data.storeId;sessionStorage.setItem("access-user",r()(n.data.data)),sessionStorage.setItem("role",n.data.data.role),"ADMIN"===e&&t.$http.get("http://www.wfpay.xyz/xpay/admin/agents").then(function(n){var e=n.data.data.map(function(t){return[t.id,t.account,t.password,t.name,t.role]}),o=e.filter(function(t){if("AGENT"===t[4])return t});t.$http.get("http://www.wfpay.xyz/xpay/admin/"+a+"/apps").then(function(t){var n=t.data.data;sessionStorage.setItem("appsInfo",r()(n))}),sessionStorage.setItem("adminsInfo",r()(e)),sessionStorage.setItem("agentsInfo",r()(o))}),"AGENT"!==e&&"ADMIN"!==e||t.$http.get("http://www.wfpay.xyz/xpay/admin/"+n.data.data.id+"/stores").then(function(t){if(t.data.data){var n=t.data.data.map(function(t){return[t.id,t.name,t.code,t.agentId]});sessionStorage.setItem("storesInfo",r()(n))}}),"STORE"===e&&(t.$http.get("http://www.wfpay.xyz/xpay/admin/"+n.data.data.id+"/stores").then(function(t){var n=t.data.data.map(function(t){return[t.id,t.name,t.code,o]});sessionStorage.setItem("storesInfo",r()(n))}),t.$http.get("http://www.wfpay.xyz/xpay/admin/"+n.data.data.id+"/apps").then(function(t){t.data.data&&(sessionStorage.setItem("key",t.data.data[0].key),sessionStorage.setItem("secret",t.data.data[0].secret))}),sessionStorage.setItem("storeId",n.data.data.storeId)),t.$router.push({path:"/"})}).catch(function(){t.logining=!1,t.$message.error("用户名或密码错误！")})})}}},d=function(){var t=this,n=t.$createElement,a=t._self._c||n;return a("el-form",{ref:"AccountFrom",staticClass:"demo-ruleForm login-container",attrs:{model:t.userInfo,rules:t.rules,"label-position":"left","label-width":"0px"}},[a("h3",{staticClass:"title"},[t._v("系统登录")]),t._v(" "),a("el-form-item",{attrs:{prop:"account"}},[a("el-input",{attrs:{type:"text","auto-complete":"off",placeholder:"账号"},model:{value:t.userInfo.account,callback:function(n){t.$set(t.userInfo,"account",n)},expression:"userInfo.account"}})],1),t._v(" "),a("el-form-item",{attrs:{prop:"password"}},[a("el-input",{attrs:{type:"password","auto-complete":"off",placeholder:"密码"},nativeOn:{keyup:function(n){if(!("button"in n)&&t._k(n.keyCode,"enter",13,n.key))return null;t.handleLogin(n)}},model:{value:t.userInfo.password,callback:function(n){t.$set(t.userInfo,"password",n)},expression:"userInfo.password"}})],1),t._v(" "),a("el-form-item",{staticStyle:{width:"100%"}},[a("el-button",{staticStyle:{width:"100%"},attrs:{type:"primary",loading:t.logining},nativeOn:{click:function(n){n.preventDefault(),t.handleLogin(n)}}},[t._v("登录")])],1)],1)},p=[],c={render:d,staticRenderFns:p},u=c,l=a("/Xao"),f=e,g=l(i,u,!1,f,null,null);n.default=g.exports},xmK5:function(t,n,a){n=t.exports=a("BkJT")(!0),n.push([t.i,"\nbody{\n  background: #DFE9FB;\n}\n","",{version:3,sources:["D:/Program Files/WorkSpace/xpay/src/components/Login.vue"],names:[],mappings:";AACA;EACE,oBAAoB;CACrB",file:"Login.vue",sourcesContent:["\nbody{\n  background: #DFE9FB;\n}\n"],sourceRoot:""}])}});
//# sourceMappingURL=1.db850301e72726bc1df5.js.map