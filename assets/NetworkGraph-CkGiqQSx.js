import{r as m,j as r,R as ae}from"./index-D9i2hqzV.js";import{R as le,I as ce,F as k,a as I,b as C,W as de,B as H,S as K,V as L,c as fe,U as F,d as V,e as ee,M as ue,f as O,L as pe,g as he,h as me,u as xe,C as te,_ as q,i as ve,H as ne,j as ge,O as ye}from"./OrbitControls-CDL7GwcW.js";const ie=parseInt(le.replace(/\D+/g,"")),se=ie>=125?"uv1":"uv2",$=new H,N=new L;class G extends ce{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],s=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(s),this.setAttribute("position",new k(e,3)),this.setAttribute("uv",new k(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,s=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),s.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const s=new I(t,6,1);return this.setAttribute("instanceStart",new C(s,3,0)),this.setAttribute("instanceEnd",new C(s,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let s;e instanceof Float32Array?s=e:Array.isArray(e)&&(s=new Float32Array(e));const i=new I(s,t*2,1);return this.setAttribute("instanceColorStart",new C(i,t,0)),this.setAttribute("instanceColorEnd",new C(i,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new de(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new H);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),$.setFromBufferAttribute(t),this.boundingBox.union($))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new K),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const s=this.boundingSphere.center;this.boundingBox.getCenter(s);let i=0;for(let o=0,c=e.count;o<c;o++)N.fromBufferAttribute(e,o),i=Math.max(i,s.distanceToSquared(N)),N.fromBufferAttribute(t,o),i=Math.max(i,s.distanceToSquared(N));this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}class oe extends G{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,s=new Float32Array(2*t);for(let i=0;i<t;i+=3)s[2*i]=e[i],s[2*i+1]=e[i+1],s[2*i+2]=e[i+2],s[2*i+3]=e[i+3],s[2*i+4]=e[i+4],s[2*i+5]=e[i+5];return super.setPositions(s),this}setColors(e,t=3){const s=e.length-t,i=new Float32Array(2*s);if(t===3)for(let o=0;o<s;o+=t)i[2*o]=e[o],i[2*o+1]=e[o+1],i[2*o+2]=e[o+2],i[2*o+3]=e[o+3],i[2*o+4]=e[o+4],i[2*o+5]=e[o+5];else for(let o=0;o<s;o+=t)i[2*o]=e[o],i[2*o+1]=e[o+1],i[2*o+2]=e[o+2],i[2*o+3]=e[o+3],i[2*o+4]=e[o+4],i[2*o+5]=e[o+5],i[2*o+6]=e[o+6],i[2*o+7]=e[o+7];return super.setColors(i,t),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class W extends fe{constructor(e){super({type:"LineMaterial",uniforms:F.clone(F.merge([V.common,V.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ee(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${ie>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(t){this.uniforms.diffuse.value=t}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(t){this.uniforms.linewidth.value=t}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(t){!!t!="USE_DASH"in this.defines&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(t){this.uniforms.dashScale.value=t}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(t){this.uniforms.dashSize.value=t}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(t){this.uniforms.dashOffset.value=t}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(t){this.uniforms.gapSize.value=t}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(t){this.uniforms.opacity.value=t}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(t){this.uniforms.resolution.value.copy(t)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(t){!!t!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),t===!0?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}const P=new O,X=new L,J=new L,S=new O,E=new O,z=new O,R=new L,T=new he,_=new pe,Y=new L,D=new H,B=new K,M=new O;let j,U;function Z(n,e,t){return M.set(0,0,-e,1).applyMatrix4(n.projectionMatrix),M.multiplyScalar(1/M.w),M.x=U/t.width,M.y=U/t.height,M.applyMatrix4(n.projectionMatrixInverse),M.multiplyScalar(1/M.w),Math.abs(Math.max(M.x,M.y))}function be(n,e){const t=n.matrixWorld,s=n.geometry,i=s.attributes.instanceStart,o=s.attributes.instanceEnd,c=Math.min(s.instanceCount,i.count);for(let d=0,x=c;d<x;d++){_.start.fromBufferAttribute(i,d),_.end.fromBufferAttribute(o,d),_.applyMatrix4(t);const b=new L,a=new L;j.distanceSqToSegment(_.start,_.end,a,b),a.distanceTo(b)<U*.5&&e.push({point:a,pointOnLine:b,distance:j.origin.distanceTo(a),object:n,face:null,faceIndex:d,uv:null,[se]:null})}}function we(n,e,t){const s=e.projectionMatrix,o=n.material.resolution,c=n.matrixWorld,d=n.geometry,x=d.attributes.instanceStart,b=d.attributes.instanceEnd,a=Math.min(d.instanceCount,x.count),p=-e.near;j.at(1,z),z.w=1,z.applyMatrix4(e.matrixWorldInverse),z.applyMatrix4(s),z.multiplyScalar(1/z.w),z.x*=o.x/2,z.y*=o.y/2,z.z=0,R.copy(z),T.multiplyMatrices(e.matrixWorldInverse,c);for(let v=0,l=a;v<l;v++){if(S.fromBufferAttribute(x,v),E.fromBufferAttribute(b,v),S.w=1,E.w=1,S.applyMatrix4(T),E.applyMatrix4(T),S.z>p&&E.z>p)continue;if(S.z>p){const h=S.z-E.z,w=(S.z-p)/h;S.lerp(E,w)}else if(E.z>p){const h=E.z-S.z,w=(E.z-p)/h;E.lerp(S,w)}S.applyMatrix4(s),E.applyMatrix4(s),S.multiplyScalar(1/S.w),E.multiplyScalar(1/E.w),S.x*=o.x/2,S.y*=o.y/2,E.x*=o.x/2,E.y*=o.y/2,_.start.copy(S),_.start.z=0,_.end.copy(E),_.end.z=0;const y=_.closestPointToPointParameter(R,!0);_.at(y,Y);const u=me.lerp(S.z,E.z,y),g=u>=-1&&u<=1,A=R.distanceTo(Y)<U*.5;if(g&&A){_.start.fromBufferAttribute(x,v),_.end.fromBufferAttribute(b,v),_.start.applyMatrix4(c),_.end.applyMatrix4(c);const h=new L,w=new L;j.distanceSqToSegment(_.start,_.end,w,h),t.push({point:w,pointOnLine:h,distance:j.origin.distanceTo(w),object:n,face:null,faceIndex:v,uv:null,[se]:null})}}}class re extends ue{constructor(e=new G,t=new W({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,s=e.attributes.instanceEnd,i=new Float32Array(2*t.count);for(let c=0,d=0,x=t.count;c<x;c++,d+=2)X.fromBufferAttribute(t,c),J.fromBufferAttribute(s,c),i[d]=d===0?0:i[d-1],i[d+1]=i[d]+X.distanceTo(J);const o=new I(i,2,1);return e.setAttribute("instanceDistanceStart",new C(o,1,0)),e.setAttribute("instanceDistanceEnd",new C(o,1,1)),this}raycast(e,t){const s=this.material.worldUnits,i=e.camera;i===null&&!s&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const o=e.params.Line2!==void 0&&e.params.Line2.threshold||0;j=e.ray;const c=this.matrixWorld,d=this.geometry,x=this.material;U=x.linewidth+o,d.boundingSphere===null&&d.computeBoundingSphere(),B.copy(d.boundingSphere).applyMatrix4(c);let b;if(s)b=U*.5;else{const p=Math.max(i.near,B.distanceToPoint(j.origin));b=Z(i,p,x.resolution)}if(B.radius+=b,j.intersectsSphere(B)===!1)return;d.boundingBox===null&&d.computeBoundingBox(),D.copy(d.boundingBox).applyMatrix4(c);let a;if(s)a=U*.5;else{const p=Math.max(i.near,D.distanceToPoint(j.origin));a=Z(i,p,x.resolution)}D.expandByScalar(a),j.intersectsBox(D)!==!1&&(s?be(this,t):we(this,i,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(P),this.material.uniforms.resolution.value.set(P.z,P.w))}}class Se extends re{constructor(e=new oe,t=new W({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}const Ee=m.forwardRef(function({points:e,color:t=16777215,vertexColors:s,linewidth:i,lineWidth:o,segments:c,dashed:d,...x},b){var a,p;const v=xe(g=>g.size),l=m.useMemo(()=>c?new re:new Se,[c]),[f]=m.useState(()=>new W),y=(s==null||(a=s[0])==null?void 0:a.length)===4?4:3,u=m.useMemo(()=>{const g=c?new G:new oe,A=e.map(h=>{const w=Array.isArray(h);return h instanceof L||h instanceof O?[h.x,h.y,h.z]:h instanceof ee?[h.x,h.y,0]:w&&h.length===3?[h[0],h[1],h[2]]:w&&h.length===2?[h[0],h[1],0]:h});if(g.setPositions(A.flat()),s){t=16777215;const h=s.map(w=>w instanceof te?w.toArray():w);g.setColors(h.flat(),y)}return g},[e,c,s,y]);return m.useLayoutEffect(()=>{l.computeLineDistances()},[e,l]),m.useLayoutEffect(()=>{d?f.defines.USE_DASH="":delete f.defines.USE_DASH,f.needsUpdate=!0},[d,f]),m.useEffect(()=>()=>{u.dispose(),f.dispose()},[u]),m.createElement("primitive",q({object:l,ref:b},x),m.createElement("primitive",{object:u,attach:"geometry"}),m.createElement("primitive",q({object:f,attach:"material",color:t,vertexColors:!!s,resolution:[v.width,v.height],linewidth:(p=i??o)!==null&&p!==void 0?p:1,dashed:d,transparent:y===4},x)))});function _e({size:n=5,labels:e={}}){const t=m.useMemo(()=>[{dir:new L(1,0,0),color:"#ef4444",label:e.x||"X"},{dir:new L(0,1,0),color:"#22c55e",label:e.y||"Y"},{dir:new L(0,0,1),color:"#3b82f6",label:e.z||"Z"}],[e.x,e.y,e.z]);return r.jsx("group",{children:t.map(({dir:s,color:i,label:o})=>{const c=s.clone().multiplyScalar(n),d=[new L(0,0,0),c],x=new ve().setFromPoints(d);return r.jsxs("group",{children:[r.jsxs("line",{children:[r.jsx("primitive",{object:x,attach:"geometry"}),r.jsx("lineBasicMaterial",{color:i,transparent:!0,opacity:.4})]}),r.jsx(ne,{position:[c.x*1.12,c.y*1.12,c.z*1.12],center:!0,style:{pointerEvents:"none"},children:r.jsx("span",{className:"select-none rounded px-1.5 py-0.5 text-[10px] font-medium",style:{color:i,opacity:.7},children:o})})]},o)})})}const Le={doge:"#ef4444",neh:"#3b82f6",whitehouse:"#f59e0b",other:"#6b7280"},Ae={directive:"#ef4444",compliance:"#3b82f6",reporting:"#f59e0b",neutral:"#6b7280"};function ze(n,e,t){return t===e?.6:.3+(n-e)/(t-e)*1.2}function Me(n,e,t){const d=new Map;n.forEach((x,b)=>d.set(x.id,b));for(let x=0;x<t;x++){for(let a=0;a<n.length;a++)for(let p=a+1;p<n.length;p++){const v=n[a].x-n[p].x,l=n[a].y-n[p].y,f=n[a].z-n[p].z,y=v*v+l*l+f*f+.01,u=Math.sqrt(y),g=15/y,A=v/u*g,h=l/u*g,w=f/u*g;n[a].vx+=A,n[a].vy+=h,n[a].vz+=w,n[p].vx-=A,n[p].vy-=h,n[p].vz-=w}for(const a of e){const p=d.get(a.source),v=d.get(a.target);if(p===void 0||v===void 0)continue;const l=n[v].x-n[p].x,f=n[v].y-n[p].y,y=n[v].z-n[p].z,u=Math.sqrt(l*l+f*f+y*y+.01),g=u*.003*(a.weight||1),A=l/u*g,h=f/u*g,w=y/u*g;n[p].vx+=A,n[p].vy+=h,n[p].vz+=w,n[v].vx-=A,n[v].vy-=h,n[v].vz-=w}const b=1-x/t;for(const a of n){a.vx*=.9,a.vy*=.9,a.vz*=.9;const p=Math.sqrt(a.vx*a.vx+a.vy*a.vy+a.vz*a.vz),v=2*b;if(p>v){const l=v/p;a.vx*=l,a.vy*=l,a.vz*=l}a.x+=a.vx,a.y+=a.vy,a.z+=a.vz}}}function je({node:n,radius:e,color:t,isHighlighted:s,onHover:i,onClick:o}){const c=m.useRef(null),[d,x]=m.useState(!1),b=m.useCallback(f=>{f.stopPropagation(),x(!0),i(n.id),document.body.style.cursor="pointer"},[n.id,i]),a=m.useCallback(()=>{x(!1),i(null),document.body.style.cursor="auto"},[i]),p=m.useCallback(f=>{f.stopPropagation(),o(n.id)},[n.id,o]),v=m.useMemo(()=>new te(t),[t]),l=d||s?1.2:1;return r.jsxs("group",{position:[n.x,n.y,n.z],children:[r.jsxs("mesh",{ref:c,scale:l,onPointerOver:b,onPointerOut:a,onClick:p,children:[r.jsx("sphereGeometry",{args:[e,24,24]}),r.jsx("meshStandardMaterial",{color:t,emissive:v,emissiveIntensity:d||s?.6:.2,roughness:.4,metalness:.1})]}),d&&r.jsx(ne,{distanceFactor:10,zIndexRange:[100,0],center:!0,style:{pointerEvents:"none"},children:r.jsxs("div",{className:"rounded-lg border border-border/60 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-sm",style:{whiteSpace:"nowrap"},children:[r.jsx("p",{className:"text-sm font-semibold text-foreground",children:n.id}),r.jsx("p",{className:"text-xs text-muted-foreground",children:n.role}),r.jsx("p",{className:"text-xs text-muted-foreground",children:n.organization})]})})]})}function Ue({source:n,target:e,edge:t,isHighlighted:s,maxWeight:i}){const o=Ae[t.type]??"#6b7280",c=s?.9:.15+t.weight/i*.5,d=s?2:.5+t.weight/i*2,x=m.useMemo(()=>[[n.x,n.y,n.z],[e.x,e.y,e.z]],[n.x,n.y,n.z,e.x,e.y,e.z]),b=t.type==="reporting"?{dashed:!0,dashSize:.3,gapSize:.15}:{};return r.jsx(Ee,{points:x,color:o,lineWidth:d,transparent:!0,opacity:c,...b})}function Ce({data:n,animKey:e}){const t=m.useRef(null),[s,i]=m.useState(null),[,o]=m.useState(null),c=m.useMemo(()=>{const l=u=>{let g=2166136261;for(let A=0;A<u.length;A++)g^=u.charCodeAt(A),g=Math.imul(g,16777619);return(g>>>0)/4294967295-.5},f=n.nodes.map((u,g)=>({...u,x:l(u.id+":x:"+g+":"+e)*8,y:l(u.id+":y:"+g+":"+e)*8,z:l(u.id+":z:"+g+":"+e)*4,vx:0,vy:0,vz:0}));Me(f,n.edges,150);let y=0;for(const u of f)y=Math.max(y,Math.abs(u.x),Math.abs(u.y),Math.abs(u.z));if(y>0){const u=6/y;for(const g of f)g.x*=u,g.y*=u,g.z*=u}return{simNodes:f,minWeight:Math.min(...n.nodes.map(u=>u.weight)),maxWeight:Math.max(...n.nodes.map(u=>u.weight)),maxEdgeWeight:Math.max(...n.edges.map(u=>u.weight),1)}},[n,e]),{simNodes:d}=c,x=m.useMemo(()=>{const l=new Map;for(const f of d)l.set(f.id,f);return l},[d]),b=m.useMemo(()=>{if(!s)return new Set;const l=new Set;return n.edges.forEach((f,y)=>{(f.source===s||f.target===s)&&l.add(y)}),l},[s,n.edges]),a=m.useCallback(l=>{i(f=>f===l?null:l)},[]),p=m.useCallback(l=>{o(l)},[]),v=m.useCallback(()=>{i(null)},[]);return r.jsxs(r.Fragment,{children:[r.jsx("ambientLight",{intensity:.6}),r.jsx("pointLight",{position:[10,10,10],intensity:.8}),r.jsx("pointLight",{position:[-10,-10,-5],intensity:.3}),r.jsx(_e,{size:6,labels:{x:"Influence →",y:"Authority →",z:"Depth →"}}),r.jsxs("group",{onPointerMissed:v,children:[n.edges.map((l,f)=>{const y=x.get(l.source),u=x.get(l.target);return!y||!u?null:r.jsx(Ue,{source:y,target:u,edge:l,isHighlighted:b.has(f),maxWeight:c.maxEdgeWeight},`${l.source}-${l.target}-${f}`)}),d.map(l=>r.jsx(je,{node:l,radius:ze(l.weight,c.minWeight,c.maxWeight),color:Le[l.group]??"#6b7280",isHighlighted:s===l.id||s!==null&&n.edges.some(f=>f.source===s&&f.target===l.id||f.target===s&&f.source===l.id),onHover:p,onClick:a},l.id))]}),r.jsx(ye,{ref:t,autoRotate:!0,autoRotateSpeed:.4,enableDamping:!0,dampingFactor:.1,minDistance:5,maxDistance:30})]})}function Oe(){return r.jsxs("div",{className:"flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground",children:[r.jsxs("div",{className:"flex items-center gap-3",children:[r.jsx("span",{className:"font-medium text-foreground",children:"Nodes:"}),[{label:"DOGE",color:"#ef4444"},{label:"NEH",color:"#3b82f6"},{label:"White House",color:"#f59e0b"},{label:"Other",color:"#6b7280"}].map(n=>r.jsxs("span",{className:"flex items-center gap-1",children:[r.jsx("span",{className:"inline-block h-2.5 w-2.5 rounded-full",style:{backgroundColor:n.color}}),n.label]},n.label))]}),r.jsxs("div",{className:"flex items-center gap-3",children:[r.jsx("span",{className:"font-medium text-foreground",children:"Edges:"}),[{label:"Directive",color:"#ef4444",dashed:!1},{label:"Compliance",color:"#3b82f6",dashed:!1},{label:"Reporting",color:"#f59e0b",dashed:!0},{label:"Neutral",color:"#6b7280",dashed:!1}].map(n=>r.jsxs("span",{className:"flex items-center gap-1",children:[r.jsx("span",{className:"inline-block h-0.5 w-4",style:{backgroundColor:n.color,borderTop:n.dashed?`2px dashed ${n.color}`:void 0,height:n.dashed?0:void 0}}),n.label]},n.label))]})]})}function Q(){return r.jsx("div",{className:"flex h-full items-center justify-center",children:r.jsx("div",{className:"h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"})})}function Be(){const[n,e]=m.useState(null),[t,s]=m.useState(null),[i,o]=m.useState(0);return m.useEffect(()=>{fetch("/acls-v-neh/network.json").then(c=>{if(!c.ok)throw new Error(`Failed to load network.json (${c.status})`);return c.json()}).then(e).catch(c=>s(c instanceof Error?c.message:"Unknown error"))},[]),r.jsxs("section",{id:"network",className:"mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8",children:[r.jsxs("div",{className:"mb-6 text-center",children:[r.jsx("h2",{className:"text-2xl font-bold tracking-tight sm:text-3xl",children:"Mapping the Operation"}),r.jsx("p",{className:"mx-auto mt-2 max-w-2xl text-sm text-muted-foreground",children:"The chain of command behind the grant terminations. Node size reflects involvement. Red lines show DOGE directives flowing to NEH; blue lines show NEH compliance."})]}),r.jsxs("div",{className:"glass-card overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm",children:[r.jsx("div",{className:"h-[400px] sm:h-[500px]",children:t?r.jsx("div",{className:"flex h-full items-center justify-center text-sm text-destructive",children:t}):n?r.jsx(ae.Suspense,{fallback:r.jsx(Q,{}),children:r.jsx(ge,{dpr:[1,2],gl:{antialias:!0,alpha:!0},camera:{position:[0,0,15],fov:50},style:{background:"transparent"},children:r.jsx(Ce,{data:n,animKey:i})})}):r.jsx(Q,{})}),r.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3",children:[r.jsx(Oe,{}),r.jsx("button",{onClick:()=>o(c=>c+1),className:"rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors",children:"Replay Layout"})]})]})]})}export{Be as NetworkGraph,Be as default};
