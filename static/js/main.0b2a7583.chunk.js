(this["webpackJsonpmy-redux-thunk"]=this["webpackJsonpmy-redux-thunk"]||[]).push([[0],{28:function(t,e,n){"use strict";n.r(e);var r=n(0),c=n(5),u=n.n(c),a=n(3),o=n(4),i=n(2);function s(t){return function(e){var n=e.dispatch,r=e.getState;return function(e){return function(c){return"function"===typeof c?c(n,r,t):e(c)}}}}var j=s();j.withExtraArgs=s;var d=j,b={userInfo:{id:0,name:""},count:0},O=Object(i.c)((function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:b,e=arguments.length>1?arguments[1]:void 0;switch(e.type){case"SET_USER":return Object(o.a)(Object(o.a)({},t),{},{userInfo:e.payload});case"SET_COUNT":return Object(o.a)(Object(o.a)({},t),{},{count:e.payload});default:return t}}),b,Object(i.a)(d.withExtraArgs("development"))),f=n(9),l=n.n(f),p=n(13),h=n(10),v=n(1),x=function(t){return function(e,n,r){return console.log("\u5f53\u524d\u73af\u5883",r),new Promise((function(r){setTimeout((function(){var c={id:t,name:t+"\u53f7\u6280\u5e08"},u=n();e({type:"SET_USER",payload:c}),e({type:"SET_COUNT",payload:u.count+1}),r(c)}),1e3)}))}},m=function(){var t=Object(a.b)(),e=Object(a.c)((function(t){return t})),n=e.userInfo,c=e.count,u=Object(r.useState)(!1),o=Object(h.a)(u,2),i=o[0],s=o[1],j=Object(r.useState)(""),d=Object(h.a)(j,2),b=d[0],O=d[1],f=function(){var e=Object(p.a)(l.a.mark((function e(){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return s(!0),e.next=3,t(x(b));case 3:s(!1);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(v.jsxs)("div",{children:[Object(v.jsxs)("div",{children:[Object(v.jsx)("input",{value:b,onChange:function(t){return O(t.target.value)}}),Object(v.jsx)("button",{onClick:f,children:"getUserInfo"})]}),Object(v.jsxs)("p",{children:["\u5df2\u641c\u7d22: ",c," \u6b21"]}),i?Object(v.jsx)("div",{children:"\u52a0\u8f7d\u4e2d..."}):Object(v.jsxs)("div",{children:[Object(v.jsxs)("p",{children:["Id: ",n.id]}),Object(v.jsxs)("p",{children:["Name: ",n.name]})]})]})};var y=function(){return Object(v.jsx)(a.a,{store:O,children:Object(v.jsx)(m,{})})};u.a.render(Object(v.jsx)(y,{}),document.getElementById("root"))}},[[28,1,2]]]);
//# sourceMappingURL=main.0b2a7583.chunk.js.map