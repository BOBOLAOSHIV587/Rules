// ShadowLoc NoBoxJS 持久化存储兼容层
// 不使用 BoxJS，直接从代理工具本地持久化存储读取。
// keys:
// shadowloc.latitude
// shadowloc.longitude
// shadowloc.accuracy
// shadowloc.target

function ShadowLocReadStore(key, def) {
  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore && typeof $persistentStore.read === "function") {
      const v = $persistentStore.read(key);
      if (v !== null && v !== undefined && String(v).length > 0) return String(v);
    }
  } catch (_) {}

  try {
    if (typeof $prefs !== "undefined" && $prefs && typeof $prefs.valueForKey === "function") {
      const v = $prefs.valueForKey(key);
      if (v !== null && v !== undefined && String(v).length > 0) return String(v);
    }
  } catch (_) {}

  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore && typeof $persistentStore.read === "function") {
      const legacyMap = {
        "shadowloc.latitude": ["wloc.lat", "wloc.latitude"],
        "shadowloc.longitude": ["wloc.lon", "wloc.lng", "wloc.longitude"],
        "shadowloc.accuracy": ["wloc.accuracy"],
        "shadowloc.target": ["wloc.target"]
      };

      const arr = legacyMap[key] || [];
      for (const k of arr) {
        const v = $persistentStore.read(k);
        if (v !== null && v !== undefined && String(v).length > 0) return String(v);
      }
    }
  } catch (_) {}

  return def;
}

const SHADOWLOC_LATITUDE = ShadowLocReadStore("shadowloc.latitude", "");
const SHADOWLOC_LONGITUDE = ShadowLocReadStore("shadowloc.longitude", "");
const SHADOWLOC_ACCURACY = ShadowLocReadStore("shadowloc.accuracy", "");
const SHADOWLOC_TARGET = ShadowLocReadStore("shadowloc.target", "");


// WLOC ProxyPin Script v5.3.0 - preserve binary request body, gunzip response, then patch in place
/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).pako={})}(this,(function(e){"use strict";var t=(e,t,i,n)=>{let a=65535&e|0,r=e>>>16&65535|0,o=0;for(;0!==i;){o=i>2e3?2e3:i,i-=o;do{a=a+t[n++]|0,r=r+a|0}while(--o);a%=65521,r%=65521}return a|r<<16|0};const i=new Uint32Array((()=>{let e,t=[];for(var i=0;i<256;i++){e=i;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[i]=e}return t})());var n=(e,t,n,a)=>{const r=i,o=a+n;e^=-1;for(let i=a;i<o;i++)e=e>>>8^r[255&(e^t[i])];return-1^e};const a=16209;var r=function(e,t){let i,n,r,o,s,l,d,f,c,h,u,w,b,m,k,_,g,p,v,x,y,E,R,A;const Z=e.state;i=e.next_in,R=e.input,n=i+(e.avail_in-5),r=e.next_out,A=e.output,o=r-(t-e.avail_out),s=r+(e.avail_out-257),l=Z.dmax,d=Z.wsize,f=Z.whave,c=Z.wnext,h=Z.window,u=Z.hold,w=Z.bits,b=Z.lencode,m=Z.distcode,k=(1<<Z.lenbits)-1,_=(1<<Z.distbits)-1;e:do{w<15&&(u+=R[i++]<<w,w+=8,u+=R[i++]<<w,w+=8),g=b[u&k];t:for(;;){if(p=g>>>24,u>>>=p,w-=p,p=g>>>16&255,0===p)A[r++]=65535&g;else{if(!(16&p)){if(0==(64&p)){g=b[(65535&g)+(u&(1<<p)-1)];continue t}if(32&p){Z.mode=16191;break e}e.msg="invalid literal/length code",Z.mode=a;break e}v=65535&g,p&=15,p&&(w<p&&(u+=R[i++]<<w,w+=8),v+=u&(1<<p)-1,u>>>=p,w-=p),w<15&&(u+=R[i++]<<w,w+=8,u+=R[i++]<<w,w+=8),g=m[u&_];i:for(;;){if(p=g>>>24,u>>>=p,w-=p,p=g>>>16&255,!(16&p)){if(0==(64&p)){g=m[(65535&g)+(u&(1<<p)-1)];continue i}e.msg="invalid distance code",Z.mode=a;break e}if(x=65535&g,p&=15,w<p&&(u+=R[i++]<<w,w+=8,w<p&&(u+=R[i++]<<w,w+=8)),x+=u&(1<<p)-1,x>l){e.msg="invalid distance too far back",Z.mode=a;break e}if(u>>>=p,w-=p,p=r-o,x>p){if(p=x-p,p>f&&Z.sane){e.msg="invalid distance too far back",Z.mode=a;break e}if(y=0,E=h,0===c){if(y+=d-p,p<v){v-=p;do{A[r++]=h[y++]}while(--p);y=r-x,E=A}}else if(c<p){if(y+=d+c-p,p-=c,p<v){v-=p;do{A[r++]=h[y++]}while(--p);if(y=0,c<v){p=c,v-=p;do{A[r++]=h[y++]}while(--p);y=r-x,E=A}}}else if(y+=c-p,p<v){v-=p;do{A[r++]=h[y++]}while(--p);y=r-x,E=A}for(;v>2;)A[r++]=E[y++],A[r++]=E[y++],A[r++]=E[y++],v-=3;v&&(A[r++]=E[y++],v>1&&(A[r++]=E[y++]))}else{y=r-x;do{A[r++]=A[y++],A[r++]=A[y++],A[r++]=A[y++],v-=3}while(v>2);v&&(A[r++]=A[y++],v>1&&(A[r++]=A[y++]))}break}}break}}while(i<n&&r<s);v=w>>3,i-=v,w-=v<<3,u&=(1<<w)-1,e.next_in=i,e.next_out=r,e.avail_in=i<n?n-i+5:5-(i-n),e.avail_out=r<s?s-r+257:257-(r-s),Z.hold=u,Z.bits=w};const o=15,s=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),l=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),d=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),f=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]);var c=(e,t,i,n,a,r,c,h)=>{const u=h.bits;let w,b,m,k,_,g,p=0,v=0,x=0,y=0,E=0,R=0,A=0,Z=0,S=0,T=0,O=null;const U=new Uint16Array(16),D=new Uint16Array(16);let I,B,N,C=null;for(p=0;p<=o;p++)U[p]=0;for(v=0;v<n;v++)U[t[i+v]]++;for(E=u,y=o;y>=1&&0===U[y];y--);if(E>y&&(E=y),0===y)return a[r++]=20971520,a[r++]=20971520,h.bits=1,0;for(x=1;x<y&&0===U[x];x++);for(E<x&&(E=x),Z=1,p=1;p<=o;p++)if(Z<<=1,Z-=U[p],Z<0)return-1;if(Z>0&&(0===e||1!==y))return-1;for(D[1]=0,p=1;p<o;p++)D[p+1]=D[p]+U[p];for(v=0;v<n;v++)0!==t[i+v]&&(c[D[t[i+v]]++]=v);if(0===e?(O=C=c,g=20):1===e?(O=s,C=l,g=257):(O=d,C=f,g=0),T=0,v=0,p=x,_=r,R=E,A=0,m=-1,S=1<<E,k=S-1,1===e&&S>852||2===e&&S>592)return 1;for(;;){I=p-A,c[v]+1<g?(B=0,N=c[v]):c[v]>=g?(B=C[c[v]-g],N=O[c[v]-g]):(B=96,N=0),w=1<<p-A,b=1<<R,x=b;do{b-=w,a[_+(T>>A)+b]=I<<24|B<<16|N|0}while(0!==b);for(w=1<<p-1;T&w;)w>>=1;if(0!==w?(T&=w-1,T+=w):T=0,v++,0==--U[p]){if(p===y)break;p=t[i+c[v]]}if(p>E&&(T&k)!==m){for(0===A&&(A=E),_+=x,R=p-A,Z=1<<R;R+A<y&&(Z-=U[R+A],!(Z<=0));)R++,Z<<=1;if(S+=1<<R,1===e&&S>852||2===e&&S>592)return 1;m=T&k,a[m]=E<<24|R<<16|_-r|0}}return 0!==T&&(a[_+T]=p-A<<24|64<<16|0),h.bits=E,0},h={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{Z_FINISH:u,Z_BLOCK:w,Z_TREES:b,Z_OK:m,Z_STREAM_END:k,Z_NEED_DICT:_,Z_STREAM_ERROR:g,Z_DATA_ERROR:p,Z_MEM_ERROR:v,Z_BUF_ERROR:x,Z_DEFLATED:y}=h,E=16180,R=16190,A=16191,Z=16192,S=16194,T=16199,O=16200,U=16206,D=16209,I=e=>(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24);function B(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const N=e=>{if(!e)return 1;const t=e.state;return!t||t.strm!==e||t.mode<E||t.mode>16211?1:0},C=e=>{if(N(e))return g;const t=e.state;return e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=E,t.last=0,t.havedict=0,t.flags=-1,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new Int32Array(852),t.distcode=t.distdyn=new Int32Array(592),t.sane=1,t.back=-1,m},z=e=>{if(N(e))return g;const t=e.state;return t.wsize=0,t.whave=0,t.wnext=0,C(e)},F=(e,t)=>{let i;if(N(e))return g;const n=e.state;return t<0?(i=0,t=-t):(i=5+(t>>4),t<48&&(t&=15)),t&&(t<8||t>15)?g:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=i,n.wbits=t,z(e))},L=(e,t)=>{if(!e)return g;const i=new B;e.state=i,i.strm=e,i.window=null,i.mode=E;const n=F(e,t);return n!==m&&(e.state=null),n};let M,H,j=!0;const K=e=>{if(j){M=new Int32Array(512),H=new Int32Array(32);let t=0;for(;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(c(1,e.lens,0,288,M,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;c(2,e.lens,0,32,H,0,e.work,{bits:5}),j=!1}e.lencode=M,e.lenbits=9,e.distcode=H,e.distbits=5},P=(e,t,i,n)=>{let a;const r=e.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new Uint8Array(r.wsize)),n>=r.wsize?(r.window.set(t.subarray(i-r.wsize,i),0),r.wnext=0,r.whave=r.wsize):(a=r.wsize-r.wnext,a>n&&(a=n),r.window.set(t.subarray(i-n,i-n+a),r.wnext),(n-=a)?(r.window.set(t.subarray(i-n,i),0),r.wnext=n,r.whave=r.wsize):(r.wnext+=a,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=a))),0};var Y={inflateReset:z,inflateReset2:F,inflateResetKeep:C,inflateInit:e=>L(e,15),inflateInit2:L,inflate:(e,i)=>{let a,o,s,l,d,f,h,B,C,z,F,L,M,H,j,Y,G,X,W,q,J,Q,V=0;const $=new Uint8Array(4);let ee,te;const ie=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(N(e)||!e.output||!e.input&&0!==e.avail_in)return g;a=e.state,a.mode===A&&(a.mode=Z),d=e.next_out,s=e.output,h=e.avail_out,l=e.next_in,o=e.input,f=e.avail_in,B=a.hold,C=a.bits,z=f,F=h,Q=m;e:for(;;)switch(a.mode){case E:if(0===a.wrap){a.mode=Z;break}for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(2&a.wrap&&35615===B){0===a.wbits&&(a.wbits=15),a.check=0,$[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0),B=0,C=0,a.mode=16181;break}if(a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&B)<<8)+(B>>8))%31){e.msg="incorrect header check",a.mode=D;break}if((15&B)!==y){e.msg="unknown compression method",a.mode=D;break}if(B>>>=4,C-=4,J=8+(15&B),0===a.wbits&&(a.wbits=J),J>15||J>a.wbits){e.msg="invalid window size",a.mode=D;break}a.dmax=1<<a.wbits,a.flags=0,e.adler=a.check=1,a.mode=512&B?16189:A,B=0,C=0;break;case 16181:for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(a.flags=B,(255&a.flags)!==y){e.msg="unknown compression method",a.mode=D;break}if(57344&a.flags){e.msg="unknown header flags set",a.mode=D;break}a.head&&(a.head.text=B>>8&1),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0)),B=0,C=0,a.mode=16182;case 16182:for(;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.head&&(a.head.time=B),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,$[2]=B>>>16&255,$[3]=B>>>24&255,a.check=n(a.check,$,4,0)),B=0,C=0,a.mode=16183;case 16183:for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.head&&(a.head.xflags=255&B,a.head.os=B>>8),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0)),B=0,C=0,a.mode=16184;case 16184:if(1024&a.flags){for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.length=B,a.head&&(a.head.extra_len=B),512&a.flags&&4&a.wrap&&($[0]=255&B,$[1]=B>>>8&255,a.check=n(a.check,$,2,0)),B=0,C=0}else a.head&&(a.head.extra=null);a.mode=16185;case 16185:if(1024&a.flags&&(L=a.length,L>f&&(L=f),L&&(a.head&&(J=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Uint8Array(a.head.extra_len)),a.head.extra.set(o.subarray(l,l+L),J)),512&a.flags&&4&a.wrap&&(a.check=n(a.check,o,L,l)),f-=L,l+=L,a.length-=L),a.length))break e;a.length=0,a.mode=16186;case 16186:if(2048&a.flags){if(0===f)break e;L=0;do{J=o[l+L++],a.head&&J&&a.length<65536&&(a.head.name+=String.fromCharCode(J))}while(J&&L<f);if(512&a.flags&&4&a.wrap&&(a.check=n(a.check,o,L,l)),f-=L,l+=L,J)break e}else a.head&&(a.head.name=null);a.length=0,a.mode=16187;case 16187:if(4096&a.flags){if(0===f)break e;L=0;do{J=o[l+L++],a.head&&J&&a.length<65536&&(a.head.comment+=String.fromCharCode(J))}while(J&&L<f);if(512&a.flags&&4&a.wrap&&(a.check=n(a.check,o,L,l)),f-=L,l+=L,J)break e}else a.head&&(a.head.comment=null);a.mode=16188;case 16188:if(512&a.flags){for(;C<16;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(4&a.wrap&&B!==(65535&a.check)){e.msg="header crc mismatch",a.mode=D;break}B=0,C=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),e.adler=a.check=0,a.mode=A;break;case 16189:for(;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}e.adler=a.check=I(B),B=0,C=0,a.mode=R;case R:if(0===a.havedict)return e.next_out=d,e.avail_out=h,e.next_in=l,e.avail_in=f,a.hold=B,a.bits=C,_;e.adler=a.check=1,a.mode=A;case A:if(i===w||i===b)break e;case Z:if(a.last){B>>>=7&C,C-=7&C,a.mode=U;break}for(;C<3;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}switch(a.last=1&B,B>>>=1,C-=1,3&B){case 0:a.mode=16193;break;case 1:if(K(a),a.mode=T,i===b){B>>>=2,C-=2;break e}break;case 2:a.mode=16196;break;case 3:e.msg="invalid block type",a.mode=D}B>>>=2,C-=2;break;case 16193:for(B>>>=7&C,C-=7&C;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if((65535&B)!=(B>>>16^65535)){e.msg="invalid stored block lengths",a.mode=D;break}if(a.length=65535&B,B=0,C=0,a.mode=S,i===b)break e;case S:a.mode=16195;case 16195:if(L=a.length,L){if(L>f&&(L=f),L>h&&(L=h),0===L)break e;s.set(o.subarray(l,l+L),d),f-=L,l+=L,h-=L,d+=L,a.length-=L;break}a.mode=A;break;case 16196:for(;C<14;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(a.nlen=257+(31&B),B>>>=5,C-=5,a.ndist=1+(31&B),B>>>=5,C-=5,a.ncode=4+(15&B),B>>>=4,C-=4,a.nlen>286||a.ndist>30){e.msg="too many length or distance symbols",a.mode=D;break}a.have=0,a.mode=16197;case 16197:for(;a.have<a.ncode;){for(;C<3;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.lens[ie[a.have++]]=7&B,B>>>=3,C-=3}for(;a.have<19;)a.lens[ie[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,ee={bits:a.lenbits},Q=c(0,a.lens,0,19,a.lencode,0,a.work,ee),a.lenbits=ee.bits,Q){e.msg="invalid code lengths set",a.mode=D;break}a.have=0,a.mode=16198;case 16198:for(;a.have<a.nlen+a.ndist;){for(;V=a.lencode[B&(1<<a.lenbits)-1],j=V>>>24,Y=V>>>16&255,G=65535&V,!(j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(G<16)B>>>=j,C-=j,a.lens[a.have++]=G;else{if(16===G){for(te=j+2;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(B>>>=j,C-=j,0===a.have){e.msg="invalid bit length repeat",a.mode=D;break}J=a.lens[a.have-1],L=3+(3&B),B>>>=2,C-=2}else if(17===G){for(te=j+3;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=j,C-=j,J=0,L=3+(7&B),B>>>=3,C-=3}else{for(te=j+7;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=j,C-=j,J=0,L=11+(127&B),B>>>=7,C-=7}if(a.have+L>a.nlen+a.ndist){e.msg="invalid bit length repeat",a.mode=D;break}for(;L--;)a.lens[a.have++]=J}}if(a.mode===D)break;if(0===a.lens[256]){e.msg="invalid code -- missing end-of-block",a.mode=D;break}if(a.lenbits=9,ee={bits:a.lenbits},Q=c(1,a.lens,0,a.nlen,a.lencode,0,a.work,ee),a.lenbits=ee.bits,Q){e.msg="invalid literal/lengths set",a.mode=D;break}if(a.distbits=6,a.distcode=a.distdyn,ee={bits:a.distbits},Q=c(2,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,ee),a.distbits=ee.bits,Q){e.msg="invalid distances set",a.mode=D;break}if(a.mode=T,i===b)break e;case T:a.mode=O;case O:if(f>=6&&h>=258){e.next_out=d,e.avail_out=h,e.next_in=l,e.avail_in=f,a.hold=B,a.bits=C,r(e,F),d=e.next_out,s=e.output,h=e.avail_out,l=e.next_in,o=e.input,f=e.avail_in,B=a.hold,C=a.bits,a.mode===A&&(a.back=-1);break}for(a.back=0;V=a.lencode[B&(1<<a.lenbits)-1],j=V>>>24,Y=V>>>16&255,G=65535&V,!(j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(Y&&0==(240&Y)){for(X=j,W=Y,q=G;V=a.lencode[q+((B&(1<<X+W)-1)>>X)],j=V>>>24,Y=V>>>16&255,G=65535&V,!(X+j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=X,C-=X,a.back+=X}if(B>>>=j,C-=j,a.back+=j,a.length=G,0===Y){a.mode=16205;break}if(32&Y){a.back=-1,a.mode=A;break}if(64&Y){e.msg="invalid literal/length code",a.mode=D;break}a.extra=15&Y,a.mode=16201;case 16201:if(a.extra){for(te=a.extra;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.length+=B&(1<<a.extra)-1,B>>>=a.extra,C-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=16202;case 16202:for(;V=a.distcode[B&(1<<a.distbits)-1],j=V>>>24,Y=V>>>16&255,G=65535&V,!(j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(0==(240&Y)){for(X=j,W=Y,q=G;V=a.distcode[q+((B&(1<<X+W)-1)>>X)],j=V>>>24,Y=V>>>16&255,G=65535&V,!(X+j<=C);){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}B>>>=X,C-=X,a.back+=X}if(B>>>=j,C-=j,a.back+=j,64&Y){e.msg="invalid distance code",a.mode=D;break}a.offset=G,a.extra=15&Y,a.mode=16203;case 16203:if(a.extra){for(te=a.extra;C<te;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}a.offset+=B&(1<<a.extra)-1,B>>>=a.extra,C-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){e.msg="invalid distance too far back",a.mode=D;break}a.mode=16204;case 16204:if(0===h)break e;if(L=F-h,a.offset>L){if(L=a.offset-L,L>a.whave&&a.sane){e.msg="invalid distance too far back",a.mode=D;break}L>a.wnext?(L-=a.wnext,M=a.wsize-L):M=a.wnext-L,L>a.length&&(L=a.length),H=a.window}else H=s,M=d-a.offset,L=a.length;L>h&&(L=h),h-=L,a.length-=L;do{s[d++]=H[M++]}while(--L);0===a.length&&(a.mode=O);break;case 16205:if(0===h)break e;s[d++]=a.length,h--,a.mode=O;break;case U:if(a.wrap){for(;C<32;){if(0===f)break e;f--,B|=o[l++]<<C,C+=8}if(F-=h,e.total_out+=F,a.total+=F,4&a.wrap&&F&&(e.adler=a.check=a.flags?n(a.check,s,F,d-F):t(a.check,s,F,d-F)),F=h,4&a.wrap&&(a.flags?B:I(B))!==a.check){e.msg="incorrect data check",a.mode=D;break}B=0,C=0}a.mode=16207;case 16207:if(a.wrap&&a.flags){for(;C<32;){if(0===f)break e;f--,B+=o[l++]<<C,C+=8}if(4&a.wrap&&B!==(4294967295&a.total)){e.msg="incorrect length check",a.mode=D;break}B=0,C=0}a.mode=16208;case 16208:Q=k;break e;case D:Q=p;break e;case 16210:return v;default:return g}return e.next_out=d,e.avail_out=h,e.next_in=l,e.avail_in=f,a.hold=B,a.bits=C,(a.wsize||F!==e.avail_out&&a.mode<D&&(a.mode<U||i!==u))&&P(e,e.output,e.next_out,F-e.avail_out),z-=e.avail_in,F-=e.avail_out,e.total_in+=z,e.total_out+=F,a.total+=F,4&a.wrap&&F&&(e.adler=a.check=a.flags?n(a.check,s,F,e.next_out-F):t(a.check,s,F,e.next_out-F)),e.data_type=a.bits+(a.last?64:0)+(a.mode===A?128:0)+(a.mode===T||a.mode===S?256:0),(0===z&&0===F||i===u)&&Q===m&&(Q=x),Q},inflateEnd:e=>{if(N(e))return g;let t=e.state;return t.window&&(t.window=null),e.state=null,m},inflateGetHeader:(e,t)=>{if(N(e))return g;const i=e.state;return 0==(2&i.wrap)?g:(i.head=t,t.done=!1,m)},inflateSetDictionary:(e,i)=>{const n=i.length;let a,r,o;return N(e)?g:(a=e.state,0!==a.wrap&&a.mode!==R?g:a.mode===R&&(r=1,r=t(r,i,n,0),r!==a.check)?p:(o=P(e,i,n,n),o?(a.mode=16210,v):(a.havedict=1,m)))},inflateInfo:"pako inflate (from Nodeca project)"};const G=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var X=function(e){const t=Array.prototype.slice.call(arguments,1);for(;t.length;){const i=t.shift();if(i){if("object"!=typeof i)throw new TypeError(i+"must be non-object");for(const t in i)G(i,t)&&(e[t]=i[t])}}return e},W=e=>{let t=0;for(let i=0,n=e.length;i<n;i++)t+=e[i].length;const i=new Uint8Array(t);for(let t=0,n=0,a=e.length;t<a;t++){let a=e[t];i.set(a,n),n+=a.length}return i};let q=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){q=!1}const J=new Uint8Array(256);for(let e=0;e<256;e++)J[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;J[254]=J[254]=1;var Q=e=>{if("function"==typeof TextEncoder&&TextEncoder.prototype.encode)return(new TextEncoder).encode(e);let t,i,n,a,r,o=e.length,s=0;for(a=0;a<o;a++)i=e.charCodeAt(a),55296==(64512&i)&&a+1<o&&(n=e.charCodeAt(a+1),56320==(64512&n)&&(i=65536+(i-55296<<10)+(n-56320),a++)),s+=i<128?1:i<2048?2:i<65536?3:4;for(t=new Uint8Array(s),r=0,a=0;r<s;a++)i=e.charCodeAt(a),55296==(64512&i)&&a+1<o&&(n=e.charCodeAt(a+1),56320==(64512&n)&&(i=65536+(i-55296<<10)+(n-56320),a++)),i<128?t[r++]=i:i<2048?(t[r++]=192|i>>>6,t[r++]=128|63&i):i<65536?(t[r++]=224|i>>>12,t[r++]=128|i>>>6&63,t[r++]=128|63&i):(t[r++]=240|i>>>18,t[r++]=128|i>>>12&63,t[r++]=128|i>>>6&63,t[r++]=128|63&i);return t},V=(e,t)=>{const i=t||e.length;if("function"==typeof TextDecoder&&TextDecoder.prototype.decode)return(new TextDecoder).decode(e.subarray(0,t));let n,a;const r=new Array(2*i);for(a=0,n=0;n<i;){let t=e[n++];if(t<128){r[a++]=t;continue}let o=J[t];if(o>4)r[a++]=65533,n+=o-1;else{for(t&=2===o?31:3===o?15:7;o>1&&n<i;)t=t<<6|63&e[n++],o--;o>1?r[a++]=65533:t<65536?r[a++]=t:(t-=65536,r[a++]=55296|t>>10&1023,r[a++]=56320|1023&t)}}return((e,t)=>{if(t<65534&&e.subarray&&q)return String.fromCharCode.apply(null,e.length===t?e:e.subarray(0,t));let i="";for(let n=0;n<t;n++)i+=String.fromCharCode(e[n]);return i})(r,a)},$=(e,t)=>{(t=t||e.length)>e.length&&(t=e.length);let i=t-1;for(;i>=0&&128==(192&e[i]);)i--;return i<0||0===i?t:i+J[e[i]]>t?i:t},ee={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"};var te=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0};var ie=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1};const ne=Object.prototype.toString,{Z_NO_FLUSH:ae,Z_FINISH:re,Z_OK:oe,Z_STREAM_END:se,Z_NEED_DICT:le,Z_STREAM_ERROR:de,Z_DATA_ERROR:fe,Z_MEM_ERROR:ce}=h;function he(e){this.options=X({chunkSize:65536,windowBits:15,to:""},e||{});const t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(t.windowBits>=0&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new te,this.strm.avail_out=0;let i=Y.inflateInit2(this.strm,t.windowBits);if(i!==oe)throw new Error(ee[i]);if(this.header=new ie,Y.inflateGetHeader(this.strm,this.header),t.dictionary&&("string"==typeof t.dictionary?t.dictionary=Q(t.dictionary):"[object ArrayBuffer]"===ne.call(t.dictionary)&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(i=Y.inflateSetDictionary(this.strm,t.dictionary),i!==oe)))throw new Error(ee[i])}function ue(e,t){const i=new he(t);if(i.push(e),i.err)throw i.msg||ee[i.err];return i.result}he.prototype.push=function(e,t){const i=this.strm,n=this.options.chunkSize,a=this.options.dictionary;let r,o,s;if(this.ended)return!1;for(o=t===~~t?t:!0===t?re:ae,"[object ArrayBuffer]"===ne.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;;){for(0===i.avail_out&&(i.output=new Uint8Array(n),i.next_out=0,i.avail_out=n),r=Y.inflate(i,o),r===le&&a&&(r=Y.inflateSetDictionary(i,a),r===oe?r=Y.inflate(i,o):r===fe&&(r=le));i.avail_in>0&&r===se&&i.state.wrap>0&&0!==e[i.next_in];)Y.inflateReset(i),r=Y.inflate(i,o);switch(r){case de:case fe:case le:case ce:return this.onEnd(r),this.ended=!0,!1}if(s=i.avail_out,i.next_out&&(0===i.avail_out||r===se))if("string"===this.options.to){let e=$(i.output,i.next_out),t=i.next_out-e,a=V(i.output,e);i.next_out=t,i.avail_out=n-t,t&&i.output.set(i.output.subarray(e,e+t),0),this.onData(a)}else this.onData(i.output.length===i.next_out?i.output:i.output.subarray(0,i.next_out));if(r!==oe||0!==s){if(r===se)return r=Y.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,!0;if(0===i.avail_in)break}}return!0},he.prototype.onData=function(e){this.chunks.push(e)},he.prototype.onEnd=function(e){e===oe&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=W(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};var we=he,be=ue,me=function(e,t){return(t=t||{}).raw=!0,ue(e,t)},ke=ue,_e=h,ge={Inflate:we,inflate:be,inflateRaw:me,ungzip:ke,constants:_e};e.Inflate=we,e.constants=_e,e.default=ge,e.inflate=be,e.inflateRaw=me,e.ungzip=ke,Object.defineProperty(e,"__esModule",{value:!0})}));

var onRequest = async function (context, request) {
  if (request && request.rawBody && typeof request.rawBody.length === "number") {
    request.body = request.rawBody;
  }
  return request;
};

var onResponse = (function () {
  var VERSION = "5.4.0";

  // No default target: script only patches when panel has enabled transmission and saved valid coordinates.
  var TARGET_LONGITUDE = NaN;
  var TARGET_LATITUDE = NaN;
  var TARGET_ACCURACY = 25;

  // BoxJS persistent keys.
  // BoxJS 页面中修改下面三个 key 即可实时生效：
  // shadowloc.longitude = 经度，例如 113.94114
  // shadowloc.latitude  = 纬度，例如 22.544577
  // shadowloc.accuracy  = 精度，单位米，例如 25
  var BOXJS_KEYS = {
    longitude: ["shadowloc.longitude", "shadowloc.lon", "wloc.longitude", "wloc.lon"],
    latitude:  ["shadowloc.latitude",  "shadowloc.lat", "wloc.latitude",  "wloc.lat"],
    accuracy:  ["shadowloc.accuracy",  "wloc.accuracy"],
    target:    ["shadowloc.target", "wloc.target"],
    enabled:   ["shadowloc.enabled", "wloc.enabled"]
  };

  function psRead(key) {
    try {
      if (typeof $persistentStore !== "undefined" && $persistentStore && typeof $persistentStore.read === "function") {
        var v = $persistentStore.read(key);
        if (v !== null && v !== undefined && String(v).length > 0) return String(v);
      }
    } catch (_) {}
    try {
      if (typeof $prefs !== "undefined" && $prefs && typeof $prefs.valueForKey === "function") {
        var qv = $prefs.valueForKey(key);
        if (qv !== null && qv !== undefined && String(qv).length > 0) return String(qv);
      }
    } catch (_) {}
    return null;
  }

  function readFirst(keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = psRead(keys[i]);
      if (v !== null && v !== undefined && String(v).length > 0) return String(v);
    }
    return null;
  }

  function toNumber(value, fallback) {
    if (value === null || value === undefined) return fallback;
    var s = String(value).trim();
    if (!s) return fallback;
    s = s.replace(/，/g, ",").replace(/\s+/g, "");
    var n = Number(s);
    return isFinite(n) ? n : fallback;
  }

  function loadTargetFromBoxJS() {
    var enabledText = readFirst(BOXJS_KEYS.enabled);
    if (String(enabledText || "0") !== "1") return false;

    var lon = NaN;
    var lat = NaN;
    var acc = TARGET_ACCURACY;

    // 支持一个 JSON key：shadowloc.target = {"longitude":113.94114,"latitude":22.544577,"accuracy":25}
    // 也支持字符串：113.94114,22.544577,25
    var target = readFirst(BOXJS_KEYS.target);
    if (target) {
      try {
        var obj = JSON.parse(target);
        lon = toNumber(obj.longitude !== undefined ? obj.longitude : obj.lon, lon);
        lat = toNumber(obj.latitude !== undefined ? obj.latitude : obj.lat, lat);
        acc = toNumber(obj.accuracy !== undefined ? obj.accuracy : obj.acc, acc);
      } catch (_) {
        var m = String(target).replace(/，/g, ",").split(",");
        if (m.length >= 2) {
          lon = toNumber(m[0], lon);
          lat = toNumber(m[1], lat);
          if (m.length >= 3) acc = toNumber(m[2], acc);
        }
      }
    }

    lon = toNumber(readFirst(BOXJS_KEYS.longitude), lon);
    lat = toNumber(readFirst(BOXJS_KEYS.latitude), lat);
    acc = toNumber(readFirst(BOXJS_KEYS.accuracy), acc);

    if (!(lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90)) return false;
    if (Math.abs(lon) < 0.000001 && Math.abs(lat) < 0.000001) return false;

    TARGET_LONGITUDE = lon;
    TARGET_LATITUDE = lat;
    if (acc > 0 && acc <= 10000) TARGET_ACCURACY = Math.round(acc);
    return true;
  }

  function isWloc(request) {
    var host = String(request.host || "").toLowerCase();
    var path = String(request.path || "").split("?", 1)[0];
    return (host === "gs-loc-cn.apple.com" || host === "gs-loc.apple.com") && path === "/clls/wloc";
  }

  function setHeader(response, name, value) {
    response.headers = response.headers || {};
    response.headers[name] = String(value);
  }

  function removeHeader(response, name) {
    if (!response.headers) return;
    var lower = name.toLowerCase();
    for (var k in response.headers) {
      if (String(k).toLowerCase() === lower) delete response.headers[k];
    }
  }

  function byteArray(value) {
    if (!value || typeof value.length !== "number") return [];
    var out = [];
    for (var i = 0; i < value.length; i++) out.push(value[i] & 255);
    return out;
  }

  function concat(parts) {
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      for (var j = 0; j < parts[i].length; j++) out.push(parts[i][j] & 255);
    }
    return out;
  }

  function readVarint(data, offset) {
    var value = 0;
    var mul = 1;
    var shift = 0;
    while (offset < data.length) {
      var b = data[offset++] & 255;
      value += (b & 127) * mul;
      if ((b & 128) === 0) return [value, offset];
      mul *= 128;
      shift += 7;
      if (shift >= 56) throw new Error("varint is too long at " + offset);
    }
    throw new Error("truncated varint");
  }

  function writeVarint(value) {
    var v = Math.floor(value);
    if (v < 0) throw new Error("negative varint is not supported");
    var out = [];
    while (v >= 128) {
      out.push((v % 128) | 128);
      v = Math.floor(v / 128);
    }
    out.push(v);
    return out;
  }

  function skipValue(data, offset, wireType) {
    if (wireType === 0) return readVarint(data, offset)[1];
    if (wireType === 1) return offset + 8;
    if (wireType === 2) {
      var lenResult = readVarint(data, offset);
      return lenResult[1] + lenResult[0];
    }
    if (wireType === 5) return offset + 4;
    throw new Error("unsupported wire type " + wireType);
  }

  function parseFields(data) {
    var out = [];
    var offset = 0;
    while (offset < data.length) {
      var start = offset;
      var tagResult = readVarint(data, offset);
      var tag = tagResult[0];
      offset = tagResult[1];
      var fieldNo = Math.floor(tag / 8);
      var wireType = tag & 7;
      if (fieldNo === 0) throw new Error("invalid protobuf field 0 at " + start);

      var valueStart = offset;
      var value;
      if (wireType === 0) {
        var valueResult = readVarint(data, offset);
        value = valueResult[0];
        offset = valueResult[1];
      } else if (wireType === 1) {
        offset = skipValue(data, offset, wireType);
        value = data.slice(valueStart, offset);
      } else if (wireType === 2) {
        var lenResult = readVarint(data, offset);
        var length = lenResult[0];
        offset = lenResult[1];
        value = data.slice(offset, offset + length);
        offset += length;
      } else if (wireType === 5) {
        offset = skipValue(data, offset, wireType);
        value = data.slice(valueStart, offset);
      } else {
        throw new Error("unsupported wire type " + wireType);
      }
      out.push({
        fieldNo: fieldNo,
        wireType: wireType,
        value: value,
        raw: data.slice(start, offset)
      });
    }
    return out;
  }

  function encodeField(fieldNo, wireType, value) {
    var head = writeVarint(fieldNo * 8 + wireType);
    if (wireType === 0) return concat([head, writeVarint(value)]);
    if (wireType === 1 || wireType === 5) return concat([head, value]);
    if (wireType === 2) return concat([head, writeVarint(value.length), value]);
    throw new Error("cannot encode wire type " + wireType);
  }

  function patchLocationMessage(data, stats) {
    var fields = parseFields(data);
    var hasLat = false;
    var hasLon = false;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldNo === 1 && fields[i].wireType === 0) hasLat = true;
      if (fields[i].fieldNo === 2 && fields[i].wireType === 0) hasLon = true;
    }
    if (!hasLat || !hasLon) return data;

    var parts = [];
    for (var j = 0; j < fields.length; j++) {
      var f = fields[j];
      if (f.fieldNo === 1 && f.wireType === 0) {
        parts.push(encodeField(1, 0, Math.round(TARGET_LATITUDE * 100000000)));
      } else if (f.fieldNo === 2 && f.wireType === 0) {
        parts.push(encodeField(2, 0, Math.round(TARGET_LONGITUDE * 100000000)));
      } else if (f.fieldNo === 3 && f.wireType === 0) {
        parts.push(encodeField(3, 0, TARGET_ACCURACY));
      } else {
        parts.push(f.raw);
      }
    }
    stats.locations += 1;
    return concat(parts);
  }

  function patchWifiDevice(data, stats) {
    var fields = parseFields(data);
    var looksLikeWifi = false;
    for (var b = 0; b < fields.length; b++) {
      if (fields[b].fieldNo === 1 && fields[b].wireType === 2) {
        var s = "";
        for (var c = 0; c < fields[b].value.length; c++) s += String.fromCharCode(fields[b].value[c] & 255);
        looksLikeWifi = /^[0-9a-fA-F]{1,2}(:[0-9a-fA-F]{1,2}){5}$/.test(s);
      }
    }
    if (!looksLikeWifi) return data;

    var changed = false;
    var parts = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === 2 && f.wireType === 2) {
        try {
          var patchedLocation = patchLocationMessage(f.value, stats);
          changed = changed || patchedLocation.length !== f.value.length || patchedLocation.join(",") !== f.value.join(",");
          parts.push(encodeField(f.fieldNo, f.wireType, patchedLocation));
        } catch (error) {
          stats.skipped += 1;
          parts.push(f.raw);
        }
      } else {
        parts.push(f.raw);
      }
    }
    if (changed) stats.wifi += 1;
    return concat(parts);
  }

  function patchCellTower(data, stats) {
    var fields = parseFields(data);
    var changed = false;
    var parts = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === 5 && f.wireType === 2) {
        try {
          var patchedLocation = patchLocationMessage(f.value, stats);
          changed = changed || patchedLocation.length !== f.value.length || patchedLocation.join(",") !== f.value.join(",");
          parts.push(encodeField(f.fieldNo, f.wireType, patchedLocation));
        } catch (error) {
          stats.skipped += 1;
          parts.push(f.raw);
        }
      } else {
        parts.push(f.raw);
      }
    }
    if (changed) stats.cell += 1;
    return concat(parts);
  }

  function patchPayload(payload, stats) {
    var fields = parseFields(payload);
    var parts = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.wireType === 2 && f.fieldNo === 2) {
        parts.push(encodeField(f.fieldNo, f.wireType, patchWifiDevice(f.value, stats)));
      } else if (f.wireType === 2 && (f.fieldNo === 22 || f.fieldNo === 24)) {
        parts.push(encodeField(f.fieldNo, f.wireType, patchCellTower(f.value, stats)));
      } else {
        parts.push(f.raw);
      }
    }
    return concat(parts);
  }

  function sameBytes(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if ((a[i] & 255) !== (b[i] & 255)) return false;
    }
    return true;
  }

  function cloneStats(stats) {
    return {
      wifi: stats.wifi || 0,
      cell: stats.cell || 0,
      locations: stats.locations || 0,
      skipped: stats.skipped || 0,
      gzip: !!stats.gzip
    };
  }

  function restoreStats(stats, oldStats) {
    stats.wifi = oldStats.wifi;
    stats.cell = oldStats.cell;
    stats.locations = oldStats.locations;
    stats.skipped = oldStats.skipped;
    stats.gzip = oldStats.gzip;
  }

  function patchFrameAt(body, base, stats) {
    if (body.length < base + 10) throw new Error("body too short: " + body.length + ", base=" + base);

    // Apple wloc response is usually: 8-byte frame prefix + uint16 payload length + protobuf payload.
    // Some proxy engines strip/decode outer bytes differently, so base may be 0/4/other small offset.
    var payloadLen = ((body[base + 8] & 255) << 8) | (body[base + 9] & 255);
    if (payloadLen <= 0) throw new Error("invalid empty frame length at " + base);
    if (payloadLen + base + 10 > body.length) {
      throw new Error("invalid frame length " + payloadLen + " at " + base + " for " + body.length);
    }

    var prefix = body.slice(0, base + 8);
    var payload = body.slice(base + 10, base + 10 + payloadLen);
    var suffix = body.slice(base + 10 + payloadLen);
    var before = cloneStats(stats);
    var patchedPayload = patchPayload(payload, stats);
    var patchedCount = (stats.locations - before.locations) + (stats.wifi - before.wifi) + (stats.cell - before.cell);

    if (patchedPayload.length > 65535) throw new Error("patched payload too large: " + patchedPayload.length);
    if (patchedCount <= 0 || sameBytes(payload, patchedPayload)) {
      restoreStats(stats, before);
      throw new Error("frame parsed but no patchable wloc payload at " + base);
    }

    stats.frameBase = base;
    stats.payloadLen = payloadLen;
    return concat([
      prefix,
      [(patchedPayload.length >> 8) & 255, patchedPayload.length & 255],
      patchedPayload,
      suffix
    ]);
  }

  function patchRawPayload(body, stats) {
    // Fallback for engines that pass protobuf payload with unknown Apple/Surge prefix.
    // Try every small offset and keep untouched prefix/suffix. This avoids "varint is too long"
    // when Surge has already decompressed the body but kept a short wloc wrapper.
    var errors = [];
    var maxStart = Math.min(256, body.length);
    for (var start = 0; start <= maxStart; start++) {
      var before = cloneStats(stats);
      try {
        var candidate = body.slice(start);
        var patched = patchPayload(candidate, stats);
        var patchedCount = (stats.locations - before.locations) + (stats.wifi - before.wifi) + (stats.cell - before.cell);
        if (patchedCount > 0 && !sameBytes(candidate, patched)) {
          stats.frameBase = -1;
          stats.rawBase = start;
          stats.payloadLen = candidate.length;
          return concat([body.slice(0, start), patched]);
        }
        restoreStats(stats, before);
      } catch (e) {
        restoreStats(stats, before);
        if (errors.length < 6) errors.push("raw@" + start + ":" + String(e && e.message ? e.message : e));
      }
    }
    throw new Error("raw protobuf scan failed; " + errors.join(" | "));
  }

  function patchFrame(body, stats) {
    if (body.length < 10) throw new Error("body too short: " + body.length);

    var errors = [];
    var candidates = [0, 2, 4, 6, 8, 10, 12, 14, 16];
    var maxScan = Math.min(96, Math.max(0, body.length - 10));
    for (var n = 0; n <= maxScan; n++) {
      if (candidates.indexOf(n) < 0) candidates.push(n);
    }

    for (var i = 0; i < candidates.length; i++) {
      var base = candidates[i];
      var snap = cloneStats(stats);
      try {
        return patchFrameAt(body, base, stats);
      } catch (e) {
        restoreStats(stats, snap);
        if (errors.length < 6) errors.push("@" + base + ":" + String(e && e.message ? e.message : e));
      }
    }

    try {
      return patchRawPayload(body, stats);
    } catch (rawError) {
      errors.push("raw:" + String(rawError && rawError.message ? rawError.message : rawError));
    }

    throw new Error("no patchable wloc payload found; " + errors.join(" | "));
  }

  function responseBody(response) {
    // ProxyPin: response.rawBody
    if (response.rawBody && typeof response.rawBody.length === "number") return byteArray(response.rawBody);

    // Surge/Loon/Shadowrocket binary-body-mode: $response.bodyBytes -> response.bodyBytes
    if (response.bodyBytes && typeof response.bodyBytes.length === "number") return byteArray(response.bodyBytes);

    // ArrayBuffer / typed-array safe path
    if (response.body && typeof ArrayBuffer !== "undefined") {
      if (response.body instanceof ArrayBuffer) return byteArray(new Uint8Array(response.body));
      if (ArrayBuffer.isView && ArrayBuffer.isView(response.body)) return byteArray(new Uint8Array(response.body.buffer, response.body.byteOffset, response.body.byteLength));
    }

    // ProxyPin sometimes passes Uint8Array/number[] as body
    if (response.body && typeof response.body.length === "number" && typeof response.body !== "string") return byteArray(response.body);

    // Last fallback: keep byte values 0-255 from binary string. Do not UTF-8 encode protobuf.
    if (typeof response.body === "string") {
      var out = [];
      for (var i = 0; i < response.body.length; i++) out.push(response.body.charCodeAt(i) & 255);
      return out;
    }

    return [];
  }

  function decodedBody(body, stats) {
    if (body.length >= 2 && body[0] === 31 && body[1] === 139) {
      stats.gzip = true;
      var root = (function () { return this; })();
      var lib =
        (typeof pako !== "undefined" && pako) ||
        (typeof globalThis !== "undefined" && globalThis.pako) ||
        (typeof self !== "undefined" && self.pako) ||
        (root && root.pako);
      if (!lib || typeof lib.ungzip !== "function") {
        throw new Error("gzip response but pako.ungzip is unavailable");
      }
      return byteArray(lib.ungzip(new Uint8Array(body)));
    }
    return body;
  }

  return async function (context, request, response) {
    if (!isWloc(request)) return response;

    var enabled = loadTargetFromBoxJS();
    if (!enabled) {
      setHeader(response, "X-WLOC-shadowloc", "v" + VERSION);
      setHeader(response, "X-WLOC-Mode", "disabled-no-coordinate");
      return response;
    }

    var stats = { wifi: 0, cell: 0, locations: 0, skipped: 0, gzip: false };
    setHeader(response, "X-WLOC-shadowloc", "v" + VERSION);
    setHeader(response, "X-WLOC-Mode", "patch-original-response");
    setHeader(response, "X-WLOC-Origin-Status", response.statusCode || "");

    try {
      var body = responseBody(response);
      setHeader(response, "X-WLOC-Input-Len", body.length);
      var decoded = decodedBody(body, stats);
      setHeader(response, "X-WLOC-Decoded-Len", decoded.length);
      var patched = patchFrame(decoded, stats);
      setHeader(response, "X-WLOC-Patched-Locations", stats.locations);
      setHeader(response, "X-WLOC-Patched-Wifi", stats.wifi);
      setHeader(response, "X-WLOC-Patched-Cell", stats.cell);
      setHeader(response, "X-WLOC-Skipped", stats.skipped);
      setHeader(response, "X-WLOC-Frame-Base", typeof stats.frameBase === "number" ? String(stats.frameBase) : "");
      setHeader(response, "X-WLOC-Payload-Len", typeof stats.payloadLen === "number" ? String(stats.payloadLen) : "");
      setHeader(response, "X-WLOC-Raw-Base", typeof stats.rawBase === "number" ? String(stats.rawBase) : "");
      setHeader(response, "X-WLOC-Gzip", stats.gzip ? "1" : "0");
      setHeader(response, "X-WLOC-Target", TARGET_LONGITUDE + "," + TARGET_LATITUDE);
      setHeader(response, "X-WLOC-Accuracy", TARGET_ACCURACY);
      // Output is uncompressed protobuf frame. Remove gzip header and old length first.
      removeHeader(response, "Content-Encoding");
      removeHeader(response, "content-encoding");
      removeHeader(response, "Transfer-Encoding");
      removeHeader(response, "transfer-encoding");

      // Surge/Loon usually recalculate Content-Length, but setting patched length is safe for ProxyPin.
      removeHeader(response, "Content-Length");
      removeHeader(response, "content-length");
      setHeader(response, "Content-Length", patched.length);

      response.statusCode = 200;
      response.body = patched;
      response.rawBody = patched;
      response.bodyBytes = patched;
      return response;
    } catch (error) {
      setHeader(response, "X-WLOC-Gzip", stats.gzip ? "1" : "0");
      setHeader(response, "X-WLOC-Target", TARGET_LONGITUDE + "," + TARGET_LATITUDE);
      setHeader(response, "X-WLOC-Accuracy", TARGET_ACCURACY);
      setHeader(response, "X-WLOC-Error", String(error && error.message ? error.message : error));
      return response;
    }
  };
})();


/* Universal runner for Surge / Loon / Quantumult X / Shadowrocket
 * Surge/Loon: binary-body-mode old way.
 * Quantumult X: binary ArrayBuffer body return.
 */
(function () {
  if (typeof $done === "undefined") return;

  function isQX() {
    try {
      if (typeof $task !== "undefined" && typeof $prefs !== "undefined") return true;
    } catch (_) {}
    return false;
  }

  function copyHeaders(headers) {
    var out = {};
    headers = headers || {};
    for (var k in headers) out[k] = headers[k];
    return out;
  }

  function parseUrl(url) {
    var u = String(url || "");
    var m = u.match(/^https?:\/\/([^\/]+)(\/[^?#]*)?/i);
    return {
      host: m ? m[1].toLowerCase() : "",
      path: m ? (m[2] || "/") : "",
      url: u
    };
  }

  function toBytes(value) {
    if (!value) return [];

    try {
      if (typeof ArrayBuffer !== "undefined") {
        if (value instanceof ArrayBuffer) return Array.prototype.slice.call(new Uint8Array(value));

        if (ArrayBuffer.isView && ArrayBuffer.isView(value)) {
          return Array.prototype.slice.call(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
        }
      }
    } catch (_) {}

    if (typeof value === "string") {
      var out = [];
      for (var i = 0; i < value.length; i++) out.push(value.charCodeAt(i) & 255);
      return out;
    }

    if (typeof value.length === "number") {
      var arr = [];
      for (var j = 0; j < value.length; j++) arr.push(value[j] & 255);
      return arr;
    }

    return [];
  }

  function makeUint8(bytes) {
    try {
      return new Uint8Array(bytes);
    } catch (_) {
      var u8 = new Uint8Array(bytes.length);
      for (var i = 0; i < bytes.length; i++) u8[i] = bytes[i] & 255;
      return u8;
    }
  }

  function cleanBinaryHeaders(headers, len) {
    headers = copyHeaders(headers);

    for (var k in headers) {
      var lk = String(k).toLowerCase();
      if (lk === "content-encoding" || lk === "transfer-encoding" || lk === "content-length") {
        delete headers[k];
      }
    }

    headers["Content-Length"] = String(len);
    headers["X-WLOC-Runner"] = isQX() ? "QuantumultX-ArrayBuffer" : "Surge-Loon-Binary";
    return headers;
  }

  function readResponseBytes() {
    if (typeof $response === "undefined" || !$response) return [];

    if ($response.bodyBytes) return toBytes($response.bodyBytes);
    if ($response.rawBody) return toBytes($response.rawBody);
    if ($response.body) return toBytes($response.body);

    return [];
  }

  function finishResponse(res) {
    var bytes = toBytes(res.bodyBytes || res.rawBody || res.body);
    var headers = cleanBinaryHeaders(res.headers || {}, bytes.length);
    var status = res.statusCode || res.status || 200;
    var u8 = makeUint8(bytes);

    if (isQX()) {
      try {
        $done({
          status: status,
          headers: headers,
          body: u8.buffer
        });
        return;
      } catch (e1) {
        try {
          $done({
            response: {
              status: status,
              headers: headers,
              body: u8.buffer
            }
          });
          return;
        } catch (e2) {
          $done({
            status: status,
            headers: headers,
            bodyBytes: u8
          });
          return;
        }
      }
    }

    $done({
      status: status,
      headers: headers,
      body: u8,
      bodyBytes: u8,
      rawBody: u8
    });
  }

  function finishRequest(req) {
    var headers = copyHeaders(req.headers || {});
    var bytes = toBytes(req.bodyBytes || req.rawBody || req.body);
    var u8 = makeUint8(bytes);

    if (isQX()) {
      $done({
        headers: headers,
        body: bytes.length ? u8.buffer : undefined
      });
      return;
    }

    $done({
      headers: headers,
      body: bytes.length ? u8 : undefined,
      bodyBytes: bytes.length ? u8 : undefined,
      rawBody: bytes.length ? u8 : undefined
    });
  }

  function runnerError(e) {
    var headers = copyHeaders((typeof $response !== "undefined" && $response && $response.headers) || {});
    headers["X-WLOC-shadowloc"] = "runner-error";
    headers["X-WLOC-Error"] = String(e && e.message ? e.message : e);

    if (typeof $response !== "undefined") {
      var bytes = readResponseBytes();
      var u8 = makeUint8(bytes);

      if (isQX()) {
        $done({
          status: ($response && ($response.status || $response.statusCode)) || 200,
          headers: headers,
          body: u8.buffer
        });
      } else {
        $done({
          status: ($response && ($response.status || $response.statusCode)) || 200,
          headers: headers,
          body: u8,
          bodyBytes: u8,
          rawBody: u8
        });
      }
    } else {
      $done({});
    }
  }

  try {
    var req0 = typeof $request !== "undefined" ? $request : {};
    var info = parseUrl(req0.url || "");
    var reqBytes = toBytes(req0.bodyBytes || req0.rawBody || req0.body);

    var req = {
      url: req0.url || "",
      method: req0.method || "GET",
      headers: copyHeaders(req0.headers || {}),
      host: info.host,
      path: info.path,
      bodyBytes: reqBytes,
      rawBody: reqBytes,
      body: reqBytes
    };

    if (typeof $response !== "undefined") {
      var resBytes = readResponseBytes();

      var res = {
        statusCode: $response.status || $response.statusCode || 200,
        status: $response.status || $response.statusCode || 200,
        headers: copyHeaders($response.headers || {}),
        bodyBytes: resBytes,
        rawBody: resBytes,
        body: resBytes
      };

      Promise.resolve(onResponse(null, req, res))
        .then(finishResponse)
        .catch(runnerError);
    } else {
      Promise.resolve(onRequest(null, req))
        .then(finishRequest)
        .catch(function () { $done({}); });
    }
  } catch (e) {
    runnerError(e);
  }
})();