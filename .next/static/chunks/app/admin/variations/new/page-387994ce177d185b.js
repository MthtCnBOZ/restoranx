(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6480],{285:(e,a,r)=>{"use strict";r.d(a,{$:()=>d});var s=r(5155);r(2115);var t=r(9708),n=r(2085),i=r(9434);let l=(0,n.F)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",{variants:{variant:{default:"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",destructive:"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",secondary:"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2 has-[>svg]:px-3",sm:"h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",lg:"h-10 rounded-md px-6 has-[>svg]:px-4",icon:"size-9"}},defaultVariants:{variant:"default",size:"default"}});function d(e){let{className:a,variant:r,size:n,asChild:d=!1,...o}=e,c=d?t.DX:"button";return(0,s.jsx)(c,{"data-slot":"button",className:(0,i.cn)(l({variant:r,size:n,className:a})),...o})}},333:(e,a,r)=>{"use strict";r.d(a,{d:()=>i});var s=r(5155);r(2115);var t=r(4884),n=r(9434);function i(e){let{className:a,...r}=e;return(0,s.jsx)(t.bL,{"data-slot":"switch",className:(0,n.cn)("peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",a),...r,children:(0,s.jsx)(t.zi,{"data-slot":"switch-thumb",className:(0,n.cn)("bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0")})})}},1217:(e,a,r)=>{Promise.resolve().then(r.bind(r,5418))},2523:(e,a,r)=>{"use strict";r.d(a,{p:()=>n});var s=r(5155);r(2115);var t=r(9434);function n(e){let{className:a,type:r,...n}=e;return(0,s.jsx)("input",{type:r,"data-slot":"input",className:(0,t.cn)("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm","focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]","aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",a),...n})}},5057:(e,a,r)=>{"use strict";r.d(a,{J:()=>i});var s=r(5155);r(2115);var t=r(968),n=r(9434);function i(e){let{className:a,...r}=e;return(0,s.jsx)(t.b,{"data-slot":"label",className:(0,n.cn)("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",a),...r})}},5418:(e,a,r)=>{"use strict";r.r(a),r.d(a,{default:()=>b});var s=r(5155),t=r(2115),n=r(285),i=r(6695),l=r(2523),d=r(5057),o=r(8539),c=r(5695),u=r(6671),m=r(6874),p=r.n(m),x=r(7550),h=r(4616),f=r(1492),g=r(4416),v=r(333);function b(){let e=(0,c.useRouter)(),[a,r]=(0,t.useState)(!1),[m,b]=(0,t.useState)({name:"",description:""}),[y,j]=(0,t.useState)([{name:"",price:"",isDefault:!0}]),k=e=>{let{name:a,value:r}=e.target;b({...m,[a]:r})},N=(e,a,r)=>{let s=[...y];s[e]={...s[e],[a]:r},j(s)},w=e=>{if(1===y.length){u.oR.error("En az bir se\xe7enek gereklidir");return}let a=[...y];a.splice(e,1),y[e].isDefault&&a.length>0&&(a[0].isDefault=!0),j(a)},z=e=>{j(y.map((a,r)=>({...a,isDefault:r===e})))},C=(e,a)=>{if("up"===a&&0===e||"down"===a&&e===y.length-1)return;let r=[...y],s="up"===a?e-1:e+1;[r[e],r[s]]=[r[s],r[e]],j(r)},V=e=>""===e||/^[0-9]*\.?[0-9]*$/.test(e),S=async a=>{a.preventDefault(),r(!0);try{if(!m.name){u.oR.error("Varyasyon adı zorunludur"),r(!1);return}if(y.some(e=>!e.name)){u.oR.error("T\xfcm se\xe7enekler i\xe7in isim belirtilmelidir"),r(!1);return}let a=await fetch("/api/admin/variations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...m,options:y})}),s=await a.json();if(!a.ok)throw Error(s.error||"Varyasyon eklenirken bir hata oluştu");u.oR.success("Varyasyon başarıyla eklendi"),e.push("/admin/variations")}catch(e){console.error("Varyasyon ekleme hatası:",e),u.oR.error(e.message||"Varyasyon eklenirken bir hata oluştu")}finally{r(!1)}};return(0,s.jsxs)("div",{className:"flex flex-col gap-4 md:gap-6",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2",children:[(0,s.jsx)(n.$,{variant:"ghost",size:"sm",asChild:!0,children:(0,s.jsxs)(p(),{href:"/admin/variations",className:"flex items-center gap-1",children:[(0,s.jsx)(x.A,{className:"h-4 w-4"}),"Geri"]})}),(0,s.jsx)("h1",{className:"text-2xl md:text-3xl font-bold",children:"Yeni Varyasyon"})]}),(0,s.jsx)(i.Zp,{children:(0,s.jsxs)("form",{onSubmit:S,children:[(0,s.jsxs)(i.aR,{children:[(0,s.jsx)(i.ZB,{children:"Varyasyon Bilgileri"}),(0,s.jsx)(i.BT,{children:"\xdcr\xfcnlere eklenebilecek yeni bir varyasyon oluşturun (\xf6rn. Boyut, Hamur Tipi, vb.)"})]}),(0,s.jsxs)(i.Wu,{className:"space-y-6",children:[(0,s.jsxs)("div",{className:"grid gap-2",children:[(0,s.jsxs)(d.J,{htmlFor:"name",children:["Varyasyon Adı ",(0,s.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,s.jsx)(l.p,{id:"name",name:"name",placeholder:"\xd6rn: Pizza Boyutu",value:m.name,onChange:k,required:!0})]}),(0,s.jsxs)("div",{className:"grid gap-2",children:[(0,s.jsx)(d.J,{htmlFor:"description",children:"A\xe7ıklama"}),(0,s.jsx)(o.T,{id:"description",name:"description",placeholder:"Varyasyon hakkında a\xe7ıklama (opsiyonel)",value:m.description,onChange:k,rows:3})]}),(0,s.jsxs)("div",{className:"border-t pt-4",children:[(0,s.jsxs)("div",{className:"flex justify-between items-center mb-4",children:[(0,s.jsx)("h3",{className:"text-lg font-medium",children:"Varyasyon Se\xe7enekleri"}),(0,s.jsxs)(n.$,{type:"button",onClick:()=>{j([...y,{name:"",price:"",isDefault:!1}])},variant:"outline",size:"sm",className:"flex items-center gap-1",children:[(0,s.jsx)(h.A,{className:"h-4 w-4"}),"Yeni Se\xe7enek Ekle"]})]}),(0,s.jsx)("div",{className:"space-y-4",children:y.map((e,a)=>(0,s.jsx)("div",{className:"border rounded-md p-4 relative",children:(0,s.jsxs)("div",{className:"grid grid-cols-12 gap-4",children:[(0,s.jsxs)("div",{className:"col-span-5",children:[(0,s.jsxs)(d.J,{htmlFor:"option-name-".concat(a),children:["Se\xe7enek Adı ",(0,s.jsx)("span",{className:"text-red-500",children:"*"})]}),(0,s.jsx)(l.p,{id:"option-name-".concat(a),placeholder:"\xd6rn: B\xfcy\xfck Boy",value:e.name,onChange:e=>N(a,"name",e.target.value),required:!0,className:"mt-1"})]}),(0,s.jsxs)("div",{className:"col-span-3",children:[(0,s.jsx)(d.J,{htmlFor:"option-price-".concat(a),children:"Ek Fiyat (₺)"}),(0,s.jsx)(l.p,{id:"option-price-".concat(a),placeholder:"\xd6rn: 10.50",value:e.price,onChange:e=>{V(e.target.value)&&N(a,"price",e.target.value)},className:"mt-1",type:"text",inputMode:"decimal"})]}),(0,s.jsxs)("div",{className:"col-span-4 flex items-end space-x-2",children:[(0,s.jsxs)("div",{className:"flex items-center space-x-2 mt-1",children:[(0,s.jsx)(v.d,{id:"option-default-".concat(a),checked:e.isDefault,onCheckedChange:()=>z(a)}),(0,s.jsx)(d.J,{htmlFor:"option-default-".concat(a),className:"cursor-pointer",children:"Varsayılan"})]}),(0,s.jsxs)("div",{className:"flex space-x-1 mt-1",children:[(0,s.jsxs)(n.$,{type:"button",variant:"ghost",size:"icon",onClick:()=>C(a,"up"),disabled:0===a,className:"h-8 w-8",children:[(0,s.jsx)(f.A,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Sırayı Değiştir"})]}),(0,s.jsxs)(n.$,{type:"button",variant:"ghost",size:"icon",onClick:()=>w(a),className:"h-8 w-8 text-red-500 hover:text-red-600",children:[(0,s.jsx)(g.A,{className:"h-4 w-4"}),(0,s.jsx)("span",{className:"sr-only",children:"Sil"})]})]})]})]})},a))})]})]}),(0,s.jsxs)(i.wL,{className:"flex justify-between",children:[(0,s.jsx)(n.$,{type:"button",variant:"outline",onClick:()=>e.push("/admin/variations"),disabled:a,children:"İptal"}),(0,s.jsx)(n.$,{type:"submit",disabled:a,children:a?"Kaydediliyor...":"Varyasyon Ekle"})]})]})})]})}},6695:(e,a,r)=>{"use strict";r.d(a,{BT:()=>d,Wu:()=>o,ZB:()=>l,Zp:()=>n,aR:()=>i,wL:()=>c});var s=r(5155);r(2115);var t=r(9434);function n(e){let{className:a,...r}=e;return(0,s.jsx)("div",{"data-slot":"card",className:(0,t.cn)("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",a),...r})}function i(e){let{className:a,...r}=e;return(0,s.jsx)("div",{"data-slot":"card-header",className:(0,t.cn)("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",a),...r})}function l(e){let{className:a,...r}=e;return(0,s.jsx)("div",{"data-slot":"card-title",className:(0,t.cn)("leading-none font-semibold",a),...r})}function d(e){let{className:a,...r}=e;return(0,s.jsx)("div",{"data-slot":"card-description",className:(0,t.cn)("text-muted-foreground text-sm",a),...r})}function o(e){let{className:a,...r}=e;return(0,s.jsx)("div",{"data-slot":"card-content",className:(0,t.cn)("px-6",a),...r})}function c(e){let{className:a,...r}=e;return(0,s.jsx)("div",{"data-slot":"card-footer",className:(0,t.cn)("flex items-center px-6 [.border-t]:pt-6",a),...r})}},8539:(e,a,r)=>{"use strict";r.d(a,{T:()=>i});var s=r(5155),t=r(2115),n=r(9434);let i=t.forwardRef((e,a)=>{let{className:r,...t}=e;return(0,s.jsx)("textarea",{className:(0,n.cn)("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",r),ref:a,...t})});i.displayName="Textarea"},9434:(e,a,r)=>{"use strict";r.d(a,{cn:()=>n});var s=r(2596),t=r(9688);function n(){for(var e=arguments.length,a=Array(e),r=0;r<e;r++)a[r]=arguments[r];return(0,t.QP)((0,s.$)(a))}}},e=>{var a=a=>e(e.s=a);e.O(0,[9352,6671,6874,618,8441,1684,7358],()=>a(1217)),_N_E=e.O()}]);