
(function OmegaWebGLFx(){
  "use strict";
  var canvas=null, gl=null, prog=null, buf=null, aPos=null, aSeed=null, uTime=null, uRes=null, uHue=null;
  var n = (Math.min(screen.width,screen.height)<700)?36:72;
  var seeds = new Float32Array(n*3);
  for(var i=0;i<n;i++){ seeds[i*3]=Math.random(); seeds[i*3+1]=Math.random(); seeds[i*3+2]=0.4+Math.random()*0.6; }
  function make(){
    if(document.getElementById("omegaGlWorld")) return true;
    canvas=document.createElement("canvas");
    canvas.id="omegaGlWorld";
    canvas.setAttribute("aria-hidden","true");
    canvas.style.cssText="position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.55";
    document.body.appendChild(canvas);
    try { gl=canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:true}); } catch(e){}
    if(!gl) return false;
    function sh(type,src){ var o=gl.createShader(type); gl.shaderSource(o,src); gl.compileShader(o); return o; }
    var vs=sh(gl.VERTEX_SHADER,
      "attribute vec2 aSeed; attribute float aSize; uniform vec2 uRes; uniform float uTime;\n"+
      "void main(){\n"+
      "  float x=fract(aSeed.x+uTime*0.012);\n"+
      "  float y=fract(aSeed.y+sin(aSeed.x*12.0+uTime*0.2)*0.02);\n"+
      "  vec2 p=vec2(x,y)*2.0-1.0; p.y=-p.y;\n"+
      "  gl_Position=vec4(p,0.0,1.0);\n"+
      "  gl_PointSize=aSize*(uRes.y<500.0?1.2:2.0);\n"+
      "}");
    var fs=sh(gl.FRAGMENT_SHADER,
      "precision mediump float; uniform vec3 uHue;\n"+
      "void main(){ vec2 c=gl_PointCoord-0.5; float d=dot(c,c); if(d>0.25) discard;\n"+
      "  float a=smoothstep(0.25,0.0,d);\n"+
      "  gl_FragColor=vec4(uHue, a*0.55);\n"+
      "}");
    prog=gl.createProgram(); gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    buf=gl.createBuffer();
    var data=new Float32Array(n*3);
    data.set(seeds);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    aPos=gl.getAttribLocation(prog,"aSeed");
    aSeed=gl.getAttribLocation(prog,"aSize");
    uTime=gl.getUniformLocation(prog,"uTime");
    uRes=gl.getUniformLocation(prog,"uRes");
    uHue=gl.getUniformLocation(prog,"uHue");
    return true;
  }
  function resize(){
    if(!canvas||!gl) return;
    var dpr=Math.min(1.5, window.devicePixelRatio||1);
    var w=Math.max(1,innerWidth), h=Math.max(1,innerHeight);
    if(canvas.width!==Math.floor(w*dpr) || canvas.height!==Math.floor(h*dpr)){
      canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr);
      canvas.style.width=w+"px"; canvas.style.height=h+"px";
      gl.viewport(0,0,canvas.width,canvas.height);
    }
  }
  var last=0;
  function tick(ts){
    if(window.isLightweightMode || document.hidden){
      if(canvas) canvas.style.display="none";
      setTimeout(function(){ requestAnimationFrame(tick); }, 400);
      return;
    }
    if(canvas) canvas.style.display="";
    if(!gl){ requestAnimationFrame(tick); return; }
    if(ts-last<80){ requestAnimationFrame(tick); return; }
    last=ts; resize();
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,12,0);
    if(aSeed>=0){ gl.enableVertexAttribArray(aSeed); gl.vertexAttribPointer(aSeed,1,gl.FLOAT,false,12,8); }
    gl.uniform1f(uTime, ts*0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    if(!tick._hue || ts- (tick._hueAt||0) > 2000){
      var cs=getComputedStyle(document.documentElement);
      var col=(cs.getPropertyValue("--color-energy")||"#00ffcc").trim()||"#00ffcc";
      var hx=col.replace("#",""); if(hx.length===3) hx=hx[0]+hx[0]+hx[1]+hx[1]+hx[2]+hx[2];
      tick._hue=[parseInt(hx.slice(0,2),16)/255, parseInt(hx.slice(2,4),16)/255, parseInt(hx.slice(4,6),16)/255];
      tick._hueAt=ts;
    }
    gl.uniform3f(uHue, tick._hue[0], tick._hue[1], tick._hue[2]);
    gl.drawArrays(gl.POINTS, 0, n);
    requestAnimationFrame(tick);
  }
  function boot(){
    if(!make()) return;
    resize();
    addEventListener("resize", resize, {passive:true});
    requestAnimationFrame(tick);
  }
  if(document.readyState==="complete") setTimeout(boot, 120);
  else addEventListener("load", function(){ setTimeout(boot, 120); });
})();
