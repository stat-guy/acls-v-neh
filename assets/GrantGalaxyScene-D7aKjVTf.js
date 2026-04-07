import{r as u,j as t}from"./index-D9i2hqzV.js";import{c as V,k as $,U as H,h as Z,R as B,l as X,P as Y,V as D,m as O,_,n as q,C as j,j as J,O as K,D as Q,H as M,o as ee}from"./OrbitControls-CDL7GwcW.js";function te(e,n,p,r){var i;return i=class extends V{constructor(d){super({vertexShader:n,fragmentShader:p,...d});for(const o in e)this.uniforms[o]=new $(e[o]),Object.defineProperty(this,o,{get(){return this.uniforms[o].value},set(a){this.uniforms[o].value=a}});this.uniforms=H.clone(this.uniforms)}},i.key=Z.generateUUID(),i}const ne=()=>parseInt(B.replace(/\D+/g,"")),oe=ne(),ie=te({cellSize:.5,sectionSize:1,fadeDistance:100,fadeStrength:1,fadeFrom:1,cellThickness:.5,sectionThickness:1,cellColor:new j,sectionColor:new j,infiniteGrid:!1,followCamera:!1,worldCamProjPosition:new D,worldPlanePosition:new D},`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,`
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      vec3 from = worldCamProjPosition*vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <${oe>=154?"colorspace_fragment":"encodings_fragment"}>
    }
  `),se=u.forwardRef(({args:e,cellColor:n="#000000",sectionColor:p="#2080ff",cellSize:r=.5,sectionSize:i=1,followCamera:d=!1,infiniteGrid:o=!1,fadeDistance:a=100,fadeStrength:c=1,fadeFrom:s=1,cellThickness:g=.5,sectionThickness:h=1,side:b=q,...z},l)=>{X({GridMaterial:ie});const y=u.useRef(null);u.useImperativeHandle(l,()=>y.current,[]);const I=new Y,f=new D(0,1,0),v=new D(0,0,0);O(x=>{I.setFromNormalAndCoplanarPoint(f,v).applyMatrix4(y.current.matrixWorld);const S=y.current.material,R=S.uniforms.worldCamProjPosition,w=S.uniforms.worldPlanePosition;I.projectPoint(x.camera.position,R.value),w.value.set(0,0,0).applyMatrix4(y.current.matrixWorld)});const P={cellSize:r,sectionSize:i,cellColor:n,sectionColor:p,cellThickness:g,sectionThickness:h},C={fadeDistance:a,fadeStrength:c,fadeFrom:s,infiniteGrid:o,followCamera:d};return u.createElement("mesh",_({ref:y,frustumCulled:!1},z),u.createElement("gridMaterial",_({transparent:!0,"extensions-derivatives":!0,side:b},P,C)),u.createElement("planeGeometry",{args:e}))}),T=[new j("#1e3a8a"),new j("#0ea5e9"),new j("#22c55e"),new j("#eab308"),new j("#ef4444")];function U(e,n,p){const r=Math.max(0,Math.min(1,(e-n)/(p-n||1))),i=T.length-1,d=r*i,o=Math.floor(d),a=Math.min(o+1,i),c=d-o;return T[o].clone().lerp(T[a],c)}const N=new j("#60a5fa"),re=4;function ae(e){return()=>{e|=0,e=e+1831565813|0;let n=Math.imul(e^e>>>15,1|e);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}const G=new ee;function A(e,n){const p=new Float32Array(e.length*3),r=ae(42),i=1.8,d=2.5,o=.7,a=.4;let c=1/0,s=-1/0;for(let g=0;g<e.length;g++){const h=e[g],b=h.c*i+(r()-.5)*o-n*i/2,z=h.s*d+(r()-.5)*a,l=h.z+(r()-.5)*.3;p[g*3]=b,p[g*3+1]=l,p[g*3+2]=z,l<c&&(c=l),l>s&&(s=l)}return{positions:p,zMin:c,zMax:s}}function le({width:e,depth:n}){return t.jsxs("mesh",{position:[0,0,n/2-.5],rotation:[-Math.PI/2,0,0],children:[t.jsx("planeGeometry",{args:[e,n]}),t.jsx("meshStandardMaterial",{color:"#ffffff",transparent:!0,opacity:.06,side:Q,depthWrite:!1})]})}function ce({categories:e,spendLabels:n,numCategories:p,zMin:r,zMax:i}){const a=p*1.8/2;return t.jsxs("group",{children:[e.map((c,s)=>{const g=s*1.8-a;return t.jsx(M,{position:[g,r-.8,-.5],center:!0,style:{pointerEvents:"none"},children:t.jsx("span",{className:"select-none text-[8px] font-medium",style:{color:"#94a3b8",whiteSpace:"nowrap",transform:"rotate(-45deg)",transformOrigin:"center",display:"block"},children:c})},c)}),n.map((c,s)=>t.jsx(M,{position:[a+1.5,r-.5,s*2.5],center:!0,style:{pointerEvents:"none"},children:t.jsx("span",{className:"select-none text-[9px] font-medium",style:{color:"#94a3b8",whiteSpace:"nowrap"},children:c})},c)),[{y:i,label:"Kept +"},{y:0,label:"$0 line"},{y:r,label:"Terminated -"}].map(({y:c,label:s})=>t.jsx(M,{position:[-a-1.5,c,-.5],center:!0,style:{pointerEvents:"none"},children:t.jsx("span",{className:"select-none text-[9px] font-medium",style:{color:s==="$0 line"?"#f59e0b":"#94a3b8",whiteSpace:"nowrap",fontWeight:s==="$0 line"?700:500},children:s})},s)),t.jsx(M,{position:[0,r-2,-.5],center:!0,style:{pointerEvents:"none"},children:t.jsx("span",{className:"select-none text-[10px] font-semibold",style:{color:"#ef4444"},children:"Program Category →"})}),t.jsx(M,{position:[a+3,r-.5,1*2.5],center:!0,style:{pointerEvents:"none"},children:t.jsx("span",{className:"select-none text-[10px] font-semibold",style:{color:"#3b82f6"},children:"Spend Status →"})}),t.jsx(M,{position:[-a-3,0,-.5],center:!0,style:{pointerEvents:"none"},children:t.jsx("span",{className:"select-none text-[10px] font-semibold",style:{color:"#22c55e",writingMode:"vertical-rl",textOrientation:"mixed"},children:"Funding Impact ↑"})})]})}function fe({data:e,animKey:n,playing:p,onAnimEnd:r}){const i=u.useRef(null),d=u.useRef(0),o=u.useRef(!1),a=u.useRef(n),c=u.useRef(r),[s,g]=u.useState(null);u.useEffect(()=>{c.current=r},[r]);const h=u.useMemo(()=>A(e.grants,e.categories.length),[e.grants,e.categories.length]);u.useEffect(()=>{const f=i.current;if(!f)return;const{positions:v,zMin:P,zMax:C}=h;for(let x=0;x<e.grants.length;x++){const S=v[x*3+1];G.position.set(v[x*3],S,v[x*3+2]);const w=.04+Math.abs(e.grants[x].z)*.012;G.scale.setScalar(w),G.updateMatrix(),f.setMatrixAt(x,G.matrix);const E=U(S,P,C);f.setColorAt(x,E)}f.instanceMatrix.needsUpdate=!0,f.instanceColor&&(f.instanceColor.needsUpdate=!0)},[e.grants,h]),u.useEffect(()=>{if(n!==a.current){a.current=n,d.current=0,o.current=!1;const f=i.current;if(f){for(let v=0;v<e.grants.length;v++)f.setColorAt(v,N);f.instanceColor&&(f.instanceColor.needsUpdate=!0)}}},[n,e.grants.length]),O((f,v)=>{if(!p||!i.current)return;const P=i.current,{positions:C,zMin:x,zMax:S}=h;if(!o.current){o.current=!0,d.current=0;for(let m=0;m<e.grants.length;m++)P.setColorAt(m,N);P.instanceColor&&(P.instanceColor.needsUpdate=!0)}d.current+=v;const R=Math.min(d.current/re,1);let w=1/0,E=-1/0;for(let m=0;m<e.grants.length;m++){const k=C[m*3];k<w&&(w=k),k>E&&(E=k)}const L=w+R*(E-w);let F=!1;for(let m=0;m<e.grants.length;m++)if(C[m*3]<=L){const W=C[m*3+1];P.setColorAt(m,U(W,x,S)),F=!0}F&&P.instanceColor&&(P.instanceColor.needsUpdate=!0),R>=1&&o.current&&(o.current=!1,c.current())});const b=f=>{f.stopPropagation(),f.instanceId!==void 0&&g(f.instanceId)},z=()=>{g(null)},l=s!==null?e.grants[s]:null,y=s!==null?new D(h.positions[s*3],h.positions[s*3+1],h.positions[s*3+2]):null,I={none:"No DEI flag",fox:"Fox flagged",gpt:"ChatGPT flagged",both:"Both flagged"};return t.jsxs(t.Fragment,{children:[t.jsxs("instancedMesh",{ref:i,args:[void 0,void 0,e.grants.length],onPointerMove:b,onPointerOut:z,children:[t.jsx("sphereGeometry",{args:[1,8,8]}),t.jsx("meshStandardMaterial",{roughness:.4,metalness:.3})]}),l&&y&&t.jsx(M,{position:[y.x,y.y+.5,y.z],center:!0,children:t.jsxs("div",{style:{background:"rgba(0,0,0,0.9)",color:"#fff",padding:"8px 12px",borderRadius:"8px",fontSize:"11px",lineHeight:1.5,maxWidth:"260px",pointerEvents:"none",whiteSpace:"nowrap",border:"1px solid rgba(255,255,255,0.15)"},children:[t.jsx("div",{style:{fontWeight:700,marginBottom:3},children:l.t}),t.jsx("div",{style:{opacity:.8,fontSize:10},children:l.r}),t.jsxs("div",{style:{opacity:.7,marginTop:3,fontSize:10},children:[e.categories[l.c]," ·"," ",l.a>0?"$"+l.a.toLocaleString():"Amount unknown"]}),t.jsxs("div",{style:{marginTop:3,fontSize:10},children:[t.jsx("span",{style:{color:l.x?"#ef4444":"#22c55e",fontWeight:600},children:l.x?"Terminated":"Kept"})," · ",I[l.d]||"No DEI flag",l.ep?` · EP: ${l.ep}`:""]})]})})]})}function pe({data:e,animKey:n,playing:p,onAnimEnd:r}){const i=u.useMemo(()=>A(e.grants,e.categories.length),[e.grants,e.categories.length]),d=e.categories.length,o=d*1.8+4,a=3*2.5+2;return t.jsxs(J,{dpr:[1,2],gl:{antialias:!0,alpha:!0},camera:{position:[8,6,18],fov:50},children:[t.jsx("ambientLight",{intensity:.5}),t.jsx("pointLight",{position:[10,15,10],intensity:.9}),t.jsx("pointLight",{position:[-10,-10,5],intensity:.3}),t.jsx(le,{width:o,depth:a}),t.jsx(se,{position:[0,0,a/2-.5],args:[o,a],cellSize:1.8,cellThickness:.5,cellColor:"#334155",sectionSize:1.8*4,sectionThickness:1,sectionColor:"#475569",fadeDistance:40,fadeStrength:1,infiniteGrid:!1}),t.jsx(ce,{categories:e.categories,spendLabels:e.spendLabels,numCategories:d,zMin:i.zMin,zMax:i.zMax}),t.jsx(fe,{data:e,animKey:n,playing:p,onAnimEnd:r}),t.jsx(K,{autoRotate:!0,autoRotateSpeed:.2,enableDamping:!0,minDistance:5,maxDistance:50,target:[0,-2,2]})]})}export{pe as GrantGalaxyScene,pe as default};
