import{u as c,t as _,k as d,b as v,o as f,c as m,e as s,d as t,x as p,g as y,p as b,j as h,s as x}from"./index-6feeac89.js";import{_ as g}from"./Map-11d10475.js";import{_ as j}from"./Journey-98bee2fc.js";import"./browser-ponyfill-2fa155e1.js";import"./Scrollbars-229115c9.js";const k={class:"v-friend"},D={class:"sidebar"},$={class:"profile"},B=["src"],C={class:"username"},S={__name:"friend",props:{friendId:String},setup(o){const r=c(),i=x,l=_(i,"friends"),e=d(()=>l.value.find(a=>a.id===o.friendId));return(a,n)=>{const u=v("bunt-icon-button");return f(),m("div",k,[s(g,{journey:e.value.activeJourney,user:e.value},null,8,["journey","user"]),t("div",D,[t("div",$,[t("img",{class:"avatar",src:e.value.avatar_url||e.value.profile.avatar_url},null,8,B),t("div",C,p(e.value.username),1)]),s(j,{journey:e.value.activeJourney,travelledDistance:e.value.travelledDistance,readonly:!0},null,8,["journey","travelledDistance"])]),s(u,{id:"btn-back",onClick:n[0]||(n[0]=N=>b(r).push({name:"fellowship"}))},{default:y(()=>[h("close")]),_:1})])}}};export{S as default};