import{t as c,r as d,b as o,o as f,d as v,e as a,i as s,j as u,h as b,l as V,s as k}from"./index-d3da3e67.js";import"./browser-ponyfill-2fa155e1.js";const h={class:"c-profile"},w=["src"],x=a("div",{class:"mdi mdi-arrow-left"},null,-1),g={__name:"Profile",setup(y){const _=k,n=c(_,"user");let l=d(n.value.profile.username);return(r,e)=>{const i=o("bunt-input"),m=o("bunt-button"),p=o("router-link");return f(),v("div",h,[a("img",{class:"avatar",src:n.value.profile.avatar_url},null,8,w),a("form",{onSubmit:e[1]||(e[1]=b((...t)=>r.save&&r.save(...t),["prevent"]))},[s(i,{modelValue:l.value,"onUpdate:modelValue":e[0]||(e[0]=t=>l.value=t),name:"username",label:"Username"},null,8,["modelValue"]),s(m,{type:"submit"},{default:u(()=>[V("Save")]),_:1})],32),s(p,{class:"back",to:"/"},{default:u(()=>[x]),_:1})])}}};export{g as default};