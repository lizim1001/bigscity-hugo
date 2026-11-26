(() => {
      const canvas = document.getElementById('stars');
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const state = { themeKey: 'ice', arcContrast: .85 };
      const THEMES = {
        ice: {coreWhite:[233,245,252],primary:[158,204,229],secondary:[107,155,193],streamHead:[224,245,255]},
        light: {coreWhite:[53,88,113],primary:[77,118,152],secondary:[111,143,170],streamHead:[41,89,128]}
      };
      const sprites = {};
      function createGlowSprite(rgb, size, coreStop, midAlpha) {
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');
        const half = size / 2;
        const g = octx.createRadialGradient(half, half, 0, half, half, half);
        g.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
        g.addColorStop(coreStop, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${midAlpha})`);
        g.addColorStop(0.55, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${midAlpha * 0.20})`);
        g.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
        octx.fillStyle = g;
        octx.fillRect(0, 0, size, size);
        return off;
      }

      function rebuildSprites() {
        const t = THEMES[state.themeKey];
        sprites.white = createGlowSprite(t.coreWhite, 28, 0.24, 0.78);
        sprites.primary = createGlowSprite(t.primary, 32, 0.22, 0.62);
        sprites.secondary = createGlowSprite(t.secondary, 36, 0.18, 0.48);
        sprites.streamHead = createGlowSprite(t.streamHead, 32, 0.26, 0.88);
      }
      function angleDiff(a, b) {
        let d = a - b;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return d;
      }

      function denseArcWeight(angle) {
        const d1 = Math.abs(angleDiff(angle, -0.92));
        const w1 = Math.exp(-Math.pow(d1 / 0.78, 2.4));

        const d2 = Math.abs(angleDiff(angle, 2.44));
        const w2 = Math.exp(-Math.pow(d2 / 0.78, 2.4));

        const d3 = Math.abs(angleDiff(angle, 0.0));
        const w3 = 0.56 * Math.exp(-Math.pow(d3 / 0.34, 2.0));

        return Math.min(1.0, Math.max(w1, w2, w3));
      }

      function rotate3D(x, y, z, rx, ry, rz) {
        const cy = Math.cos(rx), sy = Math.sin(rx);
        const y1 = y * cy - z * sy;
        const z1 = y * sy + z * cy;
        const cx = Math.cos(ry), sx = Math.sin(ry);
        const x2 = x * cx + z1 * sx;
        const z2 = -x * sx + z1 * cx;
        const cz = Math.cos(rz), sz = Math.sin(rz);
        return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
      }

      const coreLatticeParticles=[],outerHaloParticles=[],tendrilParticles=[],highlightParticles=[];
      function initParticles(){

        // 1. ORGANIC FIGURE-3 AI CORE (SOFT, FLUID, ZERO SHARP CORNERS)
        const organicRings = [
          { r: 0.095, count: 220, tiltX: 0.16, tiltY: 0.12, speed: 0.58, thick: 0.024, waveA: 0.008, waveF: 3, sprite: 'white',   alphaMin: 0.52 },
          { r: 0.158, count: 270, tiltX: -0.34, tiltY: 0.24, speed: -0.44, thick: 0.034, waveA: 0.014, waveF: 2, sprite: 'white',   alphaMin: 0.44 },
          { r: 0.230, count: 300, tiltX: 0.46, tiltY: -0.36, speed: 0.32, thick: 0.046, waveA: 0.020, waveF: 3, sprite: 'primary', alphaMin: 0.32 },
          { r: 0.312, count: 320, tiltX: -0.24, tiltY: 0.42, speed: -0.22, thick: 0.060, waveA: 0.026, waveF: 4, sprite: 'primary', alphaMin: 0.24 }
        ];
        organicRings.forEach((ring, ri) => {
          for (let i = 0; i < ring.count; i++) {
            const a = (i / ring.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
            const organicR = ring.r + Math.sin(a * ring.waveF + ri * 1.4) * ring.waveA
              + (Math.random() + Math.random() - 1) * ring.thick;
            const px = Math.cos(a) * organicR;
            const py = Math.sin(a) * organicR;
            const pz = (Math.random() + Math.random() - 1) * ring.thick * 1.5;
            const [rx, ry, rz] = rotate3D(px, py, pz, ring.tiltX, ring.tiltY, 0);
            coreLatticeParticles.push({
              kind: 'eyeRing',
              speed: ring.speed,
              x: rx,
              y: ry,
              z: rz,
              size: ri < 2 ? (1.0 + Math.random() * 1.2) : (0.85 + Math.random() * 1.1),
              alpha: ring.alphaMin + Math.random() * 0.38,
              phase: a + ri * 1.3,
              sprite: Math.random() > 0.35 ? ring.sprite : (ri < 2 ? 'primary' : 'secondary')
            });
          }
        });

        // 1b. Swirling 3D cosmic spiral wisps wrapping softly around the nucleus
        const spiralArms = 5;
        for (let arm = 0; arm < spiralArms; arm++) {
          const baseAngle = (arm / spiralArms) * Math.PI * 2;
          const armDots = 140;
          for (let i = 0; i < armDots; i++) {
            const t = i / armDots;
            const rad = 0.075 + t * 0.31;
            const twistA = baseAngle + t * Math.PI * 2.1 + (Math.random() + Math.random() - 1) * (0.14 + t * 0.24);
            const px = Math.cos(twistA) * rad;
            const py = Math.sin(twistA) * rad;
            const pz = (Math.random() + Math.random() - 1) * (0.04 + t * 0.14);
            const [rx, ry, rz] = rotate3D(px, py, pz, 0.38 * Math.sin(arm), 0.34 * Math.cos(arm), 0);
            coreLatticeParticles.push({
              kind: 'spiralWisp',
              speed: (arm % 2 === 0 ? 1 : -1) * (0.26 + (1 - t) * 0.22),
              x: rx,
              y: ry,
              z: rz,
              size: (0.80 + Math.random() * 1.1) * (1.15 - t * 0.38),
              alpha: (0.24 + Math.random() * 0.44) * (1 - t * 0.45),
              phase: twistA + arm,
              sprite: t < 0.38 ? 'white' : (Math.random() > 0.35 ? 'primary' : 'secondary')
            });
          }
        }

        // 1c. Soft spherical luminous AI heart cloud
        for (let i = 0; i < 300; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const rad = Math.pow(Math.random(), 1.9) * 0.145;
          coreLatticeParticles.push({
            kind: 'nucleus',
            x: rad * Math.sin(phi) * Math.cos(theta),
            y: rad * Math.sin(phi) * Math.sin(theta),
            z: rad * Math.cos(phi),
            size: 1.05 + Math.random() * 1.65,
            alpha: (0.42 + Math.random() * 0.48) * (1 - rad / 0.18),
            phase: Math.random() * Math.PI * 2,
            sprite: rad < 0.06 || Math.random() > 0.3 ? 'white' : 'primary'
          });
        }

        // 2. OUTER SWIRLING AI VORTEX FILAMENTS (dense arcs with a faint connecting rim)
        const strands = [
          { baseR: 0.88, freq: 3, amp: 0.055, phase: 0.2,  spread: 0.034, count: 880, speed: 0.10 },
          { baseR: 0.94, freq: 2, amp: 0.048, phase: 1.7,  spread: 0.040, count: 660, speed: 0.08 },
          { baseR: 0.72, freq: 4, amp: 0.052, phase: 0.9,  spread: 0.046, count: 500, speed: 0.13 },
          { baseR: 0.56, freq: 3, amp: 0.045, phase: 2.5,  spread: 0.044, count: 360, speed: 0.16 },
          { baseR: 1.06, freq: 5, amp: 0.038, phase: 3.4,  spread: 0.070, count: 340, speed: 0.06 }
        ];
        strands.forEach((st, si) => {
          for (let i = 0; i < st.count; i++) {
            let angle = Math.random() * Math.PI * 2 - Math.PI;
            let w = denseArcWeight(angle);
            if (Math.random() > 0.18 + w * 0.82) {
              angle = Math.random() < 0.5
                ? -0.92 + (Math.random() + Math.random() - 1) * 1.15
                :  2.44 + (Math.random() + Math.random() - 1) * 1.15;
              w = denseArcWeight(angle);
            }
            const waveR = Math.sin(angle * st.freq + st.phase) * st.amp + Math.cos(angle * 2 - 0.6) * 0.028;
            const tightSpread = st.spread * (0.55 + (1 - w) * 0.95);
            const r = st.baseR + waveR + (Math.random() + Math.random() - 1) * tightSpread;
            const z = (Math.random() - 0.5) * 0.34;
            outerHaloParticles.push({
              angle,
              baseR: r,
              z,
              orbitSpeed: st.speed * (0.85 + Math.random() * 0.35),
              wobbleFreq: 1.4 + Math.random() * 2.2,
              wobbleAmp: 0.010 + Math.random() * 0.022,
              phase: Math.random() * Math.PI * 2,
              size: (0.75 + Math.random() * 1.10) * (0.80 + w * 0.40),
              baseAlpha: 0.26 + Math.random() * 0.50,
              sprite: w > 0.62 && Math.random() > 0.52 ? 'white' : (si < 3 ? 'primary' : 'secondary')
            });
          }
        });

        // A faint, irregular continuation of the outer strands fills gaps between the dense arcs.
        for (let i = 0; i < 360; i++) {
          const angle = ((i + Math.random()) / 360 - 0.5) * Math.PI * 2;
          const strand = strands[i % 3 === 0 ? 0 : 1];
          const spread = (Math.random() + Math.random() - 1) * 0.045;
          outerHaloParticles.push({
            angle,
            baseR: strand.baseR + Math.sin(angle * strand.freq + strand.phase) * strand.amp
              + Math.cos(angle * 2 - 0.6) * 0.028 + spread,
            z: (Math.random() - 0.5) * 0.24,
            orbitSpeed: strand.speed,
            wobbleFreq: 1.6 + Math.random(),
            wobbleAmp: 0.018,
            phase: Math.random() * Math.PI * 2,
            size: 0.75 + Math.random() * 0.65,
            baseAlpha: 0.15 + Math.random() * 0.23,
            sprite: 'primary',
            outline: true
          });
        }

        // 3. ORGANIC SPIRALING ENERGY TENDRILS
        const tendrils = [
          { startA: -Math.PI / 2 - 0.12, endA: -Math.PI / 2 + 0.14, count: 220, spread: 0.068 },
          { startA:  Math.PI - 0.08,     endA:  Math.PI + 0.22,     count: 200, spread: 0.072 },
          { startA:  Math.PI / 2 - 0.10, endA:  Math.PI / 2 + 0.18, count: 190, spread: 0.068 },
          { startA: -0.14,               endA:  0.04,               count: 190, spread: 0.095 },
          { startA:  0.14,               endA: -0.02,               count: 190, spread: 0.095 }
        ];
        tendrils.forEach((td) => {
          for (let i = 0; i < td.count; i++) {
            const t = Math.random();
            const curve = Math.sin(t * Math.PI) * 0.14;
            const angle = td.startA + (td.endA - td.startA) * t + curve + (Math.random() + Math.random() - 1) * td.spread * (0.4 + t * 0.8);
            tendrilParticles.push({
              baseAngle: angle,
              t,
              phase: Math.random() * Math.PI * 2,
              size: 0.78 + Math.random() * 1.10,
              alpha: 0.30 + Math.random() * 0.45,
              sprite: Math.random() > 0.55 ? 'white' : 'primary'
            });
          }
        });

        // The outer rim reads as a sphere. Shorter bands follow its front and back surfaces.
        const shellBands = [
          { radius: 1.025, start: -Math.PI, sweep: Math.PI * 2, count: 2200, spread: .048, depth: .99, tilt: -.12, strength: .90 },
          { radius: .93, start: -.14, sweep: 3.18, count: 1320, spread: .038, depth: 1.025, tilt: -.18, strength: .94 },
          { radius: .88, start: -3.08, sweep: 3.10, count: 1050, spread: .037, depth: .92, tilt: -.19, strength: .71 },
          { radius: .86, start: .17, sweep: 2.82, count: 960, spread: .046, depth: .77, tilt: .24, strength: .61 },
          { radius: .76, start: -2.43, sweep: 2.18, count: 680, spread: .048, depth: .76, tilt: .28, strength: .45 }
        ];
        for (const [bandIndex, band] of shellBands.entries()) {
          const cosTilt = Math.cos(band.tilt), sinTilt = Math.sin(band.tilt);
          for (let i = 0; i < band.count; i++) {
            const progress = (i + Math.random()) / band.count;
            const angle = band.start + band.sweep * progress;
            const arcTaper = bandIndex === 0 ? 1 : .16 + .84 * Math.sin(progress * Math.PI) ** .58;
            const clusters = .49 + .51 * Math.cos(angle * 11 + bandIndex + Math.sin(angle * 5)) ** 2;
            const crest = .73 + .27 * Math.abs(Math.sin(angle + .35));
            const fold = .021 * Math.sin(angle * 3 + bandIndex * .48)
              + .016 * Math.cos(angle * 7 - bandIndex * .64);
            const spread = (Math.random() + Math.random() + Math.random() - 1.5) * band.spread;
            const spark = Math.random() > .92;
            outerHaloParticles.push({
              angle,
              baseR: band.radius + fold + spread,
              z: (Math.random() - .5) * .18,
              orbitSpeed: .028 + bandIndex * .006,
              wobbleFreq: 1.25 + Math.random(),
              wobbleAmp: .009,
              phase: Math.random() * Math.PI * 2,
              size: spark ? 1.65 + Math.random() * .42 : .72 + Math.random() * .88,
              baseAlpha: band.strength * arcTaper * clusters * crest * (spark ? 1.14 : 1),
              sprite: spark ? 'white' : 'primary',
              shell: { depth: band.depth, sinTilt, cosTilt }
            });
          }
        }
        // Denser fragments at the upper-left shoulder, the descending strands, and the lower bowl.
        const highlightArcs = [
          {curve: [[-.97,-.46],[-.79,-.46],[-.68,-.28],[-.36,-.20]], count: 460, width: .106, strength: .78},
          {curve: [[-.91,-.32],[-.74,-.22],[-.53,-.32],[-.28,-.19]], count: 310, width: .067, strength: .59},
          {curve: [[-.64,-.14],[-.65,.14],[-.53,.40],[-.39,.58]], count: 345, width: .066, strength: .62},
          {curve: [[-.06,.24],[-.09,.37],[-.04,.49],[-.12,.66]], count: 210, width: .045, strength: .55},
          {curve: [[.08,.25],[.10,.38],[.11,.52],[.04,.67]], count: 175, width: .037, strength: .50},
          {curve: [[-.62,.49],[-.59,.85],[-.22,1.05],[.25,.83]], count: 535, width: .102, strength: .85},
          {curve: [[-.50,.56],[-.36,.80],[-.10,.90],[.24,.68]], count: 410, width: .081, strength: .70}
        ];
        for (const [index, arc] of highlightArcs.entries()) {
          const [a,b,c,d] = arc.curve;
          for (let i = 0; i < arc.count; i++) {
            const v = (i + Math.random()) / arc.count;
            const u = 1 - v;
            const [x,y] = a.map((value,j) => u**3*value + 3*u*u*v*b[j] + 3*u*v*v*c[j] + v**3*d[j]);
            const jitter = () => (Math.random() + Math.random() - 1) * arc.width;
            const cluster = .53 + .47 * Math.cos(v*14 + index*.6) ** 2;
            const taper = Math.sin(v * Math.PI) ** .47;
            const spark = Math.random() < .11;
            highlightParticles.push({
              x: x + jitter(),
              y: y + jitter(),
              phase: Math.random() * Math.PI * 2,
              size: spark ? 1.7 : .78 + Math.random()*.63,
              alpha: arc.strength * cluster * taper * (.72 + Math.random()*.28),
              sprite: spark ? 'white' : 'primary'
            });
          }
        }
      }
  const lanes=[
    [.02,.17,.49,.46,.23,-.14], [.28,.32,.47,.53,.39,.17],
    [.70,.68,.50,.57,.60,.59], [1.06,.88,.55,.61,.78,1.01]
  ];
  const xs=[-.13,.17,.46,.65,.83,1.15];
  const widths=[.20,.13,.032,.036,.095,.24];
  const palettes = {
    ice: [[112,151,184],[128,195,217],[153,193,222],[151,171,202]],
    light: [[74,111,142],[62,123,154],[104,135,168],[90,117,150]]
  };

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pulseInterval = 7.5;
  const pulseDelay = 1.35;
  const burstCount = 19;
  const ambientInterval = .78;
  const minTravelTime = 2.65;
  const travelTimeVariation = .95;
  const ambientHistory = Math.ceil((minTravelTime + travelTimeVariation) / ambientInterval);
  const smoothstep = x => x*x*(3-2*x);
  const sample = n => {
    const value = Math.sin(n*127.1+311.7)*43758.5453;
    return value-Math.floor(value);
  };

  function expansionAt(time) {
    const sinceStart = time-pulseDelay;
    if (sinceStart < 0) return 0;
    const phase = sinceStart % pulseInterval;
    if (phase < .27) return smoothstep(phase/.27);
    return 1-smoothstep(Math.min(1,(phase-.27)/.85));
  }

  let bed, paths, elapsed=.8, last=0, raf=0;
  function layout(){
    const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio,1.5);
    if (!w || !h) return;
    const palette = palettes[state.themeKey];
    Object.assign(state,{width:w,height:h,cx:w*.25,cy:h*.5,coreRadius:Math.min(w*.177,h*.30)});
    canvas.width=Math.round(w*d);canvas.height=Math.round(h*d); ctx.setTransform(d,0,0,d,0,0);
    bed=document.createElement('canvas');bed.width=canvas.width;bed.height=canvas.height;
    const pen=bed.getContext('2d');pen.scale(d,d);paths=[];
    for(let g=0;g<4;g++)for(let i=0;i<26;i++){
      const r=i/25,spread=2*r-1;
      const anchors=[[state.cx,state.cy],[.35*w,h*(.5+.014*spread+.006*(g-1.5))]];
      for(let k=2;k<6;k++){
        anchors.push([w*(xs[k]+(k===2?.055*spread:k===3?-.035*spread:0)),
          h*(lanes[g][k]+spread*widths[k]+.016*Math.sin(r*5.5+g*1.7+k*.88)+.012*Math.sin(.98*k+g*.66))]);
      }
      const pts=[];
      for(let k=0;k<5;k++){
        const a=anchors[Math.max(0,k-1)],b=anchors[k],c=anchors[k+1],d=anchors[Math.min(5,k+2)];
        for(let j=0;j<=32;j++){
          const v=j/32,u=1-v;
          pts.push(b.map((n,m)=>u*u*u*n+3*u*u*v*(n+.19*(c[m]-a[m]))+3*u*v*v*(c[m]-.19*(d[m]-n))+v*v*v*c[m]));
        }
      }
      const grad=pen.createLinearGradient(state.cx,0,w,0);
      const lineVisibility = (w < 600 ? .57 : 1) * (state.themeKey === 'light' ? .70 : 1);
      for(const [v,alpha] of [[0,.03],[.3,.15],[.60,.60],[1,.45]])grad.addColorStop(v,'rgba('+palette[g]+','+(alpha * lineVisibility)+')');
      pen.beginPath();pts.forEach(([x,y],j)=>j?pen.lineTo(x,y):pen.moveTo(x,y));pen.strokeStyle=grad;pen.lineWidth=i%7===0?.93:.66;pen.stroke();
      paths.push(pts);
    }
    render();
  }
  function render(){
    if (!bed) return;
    const {width:w,height:h,cx:px,cy:py,coreRadius:R}=state,t=elapsed,theme=THEMES[state.themeKey],coreReadabilityScale=w < 600 ? .40 : .72;
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,w,h);ctx.drawImage(bed,0,0,w,h);
    ctx.globalCompositeOperation=state.themeKey === 'light' ? 'source-over' : 'lighter';
        function drawDot(spriteKey, x, y, size, alpha) {
          if (alpha <= 0.014) return;
          const spr = sprites[spriteKey];
          const d = size * 3.2;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.drawImage(spr, x - d * 0.5, y - d * 0.5, d, d);
        }


    function drawStreamPoint(age, seed, burst) {
      const duration = minTravelTime + sample(seed + 3) * travelTimeVariation;
      const progress = age / duration;
      if (progress < 0 || progress >= 1) return;
      const points = paths[Math.floor(sample(seed) * paths.length)];
      const position = progress * (points.length - 1);
      const index = Math.floor(position), fraction = position - index;
      const [ax, ay] = points[index], [bx, by] = points[index + 1];
      const fade = Math.min(1, progress * 17, (1 - progress) * 12);
      const brightness = (burst ? .94 : .63) * (w < 600 ? .72 : 1);
      const size = (burst ? 1.75 : 1.45) + sample(seed + 5) * .72;
      drawDot('streamHead', ax + fraction * (bx - ax), ay + fraction * (by - ay), size, brightness * fade);
    }

    const latestAmbient = Math.floor(t / ambientInterval);
    for (let i = latestAmbient - ambientHistory; i <= latestAmbient; i++) {
      drawStreamPoint(t - i * ambientInterval, i + 80, false);
    }
    const pulseIndex = Math.floor((t - pulseDelay) / pulseInterval);
    if (pulseIndex >= 0) {
      const pulseAge = t - pulseDelay - pulseIndex * pulseInterval;
      for (let i = 0; i < burstCount; i++) {
        drawStreamPoint(pulseAge - .12 - i * .017, pulseIndex * burstCount + i + 400, true);
      }
    }

        const contrast = state.arcContrast;
        const expansion = expansionAt(t);
        const pulseScale = 1 + expansion * .085;
        for (let i = 0; i < outerHaloParticles.length; i++) {
          const p = outerHaloParticles[i];
          if (p.shell && w < 600 && i % 3 !== 0) continue;
          const curAngle = p.angle + t * p.orbitSpeed;
          const arcWeight = denseArcWeight(curAngle);

          const minAlphaFactor = 1.0 - contrast * 0.86;
          const zoneAlpha = p.shell ? 1 : p.outline ? .63 * (1 - .68 * arcWeight)
            : minAlphaFactor + arcWeight * (1.0 - minAlphaFactor);
          const wobble = Math.sin(t * p.wobbleFreq + p.phase) * p.wobbleAmp;
          const rad = (p.baseR + wobble) * R * pulseScale;

          let x3 = Math.cos(curAngle) * rad;
          let y3 = Math.sin(curAngle) * rad;
          if (p.shell) {
            const {depth, cosTilt, sinTilt} = p.shell;
            y3 *= depth;
            [x3, y3] = [x3*cosTilt - y3*sinTilt, x3*sinTilt + y3*cosTilt];
          }
          const z3 = p.z * R + Math.sin(curAngle * 2 + t * 0.65) * R * 0.08;
          const persp = 1 / (1 - z3 / (R * 4.6));

          const sx = px + x3 * persp;
          const sy = py + y3 * persp;
          const alpha = (p.baseAlpha * zoneAlpha * (1 + expansion * .12)) * (0.68 + 0.32 * persp) * coreReadabilityScale;
          const size = p.size * persp * (0.82 + arcWeight * 0.34);

          drawDot(p.sprite, sx, sy, size, alpha);
        }

        for (let i = 0; i < highlightParticles.length; i++) {
          if (w < 600 && i % 3 !== 0) continue;
          const point = highlightParticles[i];
          const shimmer = Math.sin(t * 1.7 + point.phase);
          const drift = .011 * shimmer;
          drawDot(point.sprite, px + (point.x + drift) * R * pulseScale,
            py + (point.y + drift * .45) * R * pulseScale,
            point.size, point.alpha * coreReadabilityScale * (.90 + shimmer * .10));
        }

        // 5. ORGANIC SPIRALING ENERGY TENDRILS
        for (let i = 0; i < tendrilParticles.length; i++) {
          const p = tendrilParticles[i];
          const flowShift = (p.t + t * 0.14) % 1.0;
          const r = (0.30 + flowShift * 0.58) * R * pulseScale;
          const sway = Math.sin(t * 1.3 + p.phase + flowShift * 3.8) * 0.045;
          const a = p.baseAngle + sway;

          const sx = px + Math.cos(a) * r;
          const sy = py + Math.sin(a) * r;
          const endFade = Math.sin(flowShift * Math.PI);
          const contrastBoost = 0.52 + contrast * 0.58;
          const alpha = (p.alpha * endFade * contrastBoost) * coreReadabilityScale;
          drawDot(p.sprite, sx, sy, p.size * 0.9, alpha);
        }

        // 6. ORGANIC FIGURE-3 AI CORE (SOFT CONCENTRIC RINGS + SPIRAL WISPS + NUCLEUS)
        const corePulse = 1 + Math.sin(t * 2.0) * 0.022;

        for (let i = 0; i < coreLatticeParticles.length; i++) {
          const p = coreLatticeParticles[i];
          let x, y, z;

          if (p.kind === 'eyeRing') {
            const spin = t * p.speed;
            [x, y, z] = rotate3D(p.x, p.y, p.z, spin * 0.22, spin * 0.30, spin);
          } else if (p.kind === 'spiralWisp') {
            const spin = t * p.speed;
            [x, y, z] = rotate3D(p.x, p.y, p.z, spin * 0.30, -spin * 0.24, spin * 0.85);
          } else {
            [x, y, z] = rotate3D(p.x, p.y, p.z, t * 0.55, -t * 0.42, t * 0.35);
          }

          const persp = 1 / (1 - (z * R) / (R * 3.6));
          const sx = px + x * R * corePulse * persp;
          const sy = py + y * R * corePulse * persp;
          const depthAlpha = Math.max(0.28, Math.min(1.0, 0.62 + z * 1.15));
          const twinkle = 0.84 + 0.16 * Math.sin(t * 3.6 + p.phase);

          drawDot(
            p.sprite,
            sx,
            sy,
            p.size * persp,
            p.alpha * depthAlpha * twinkle * coreReadabilityScale
          );
        }
        const coreBloomR = R * 0.38;
        const bloom = ctx.createRadialGradient(px, py, 0, px, py, coreBloomR);
        const cw = theme.coreWhite;
        const pr = theme.primary;
        bloom.addColorStop(0, `rgba(${cw[0]}, ${cw[1]}, ${cw[2]}, ${0.34 * coreReadabilityScale})`);
        bloom.addColorStop(0.35, `rgba(${pr[0]}, ${pr[1]}, ${pr[2]}, ${0.15 * coreReadabilityScale})`);
        bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(px, py, coreBloomR, 0, Math.PI * 2);
        ctx.fill();
      }

  function tick(now){
    raf=0;if(!visible||document.hidden||reduced.matches)return;
    if(!last||now-last>=32){elapsed+=last?Math.min(100,now-last)/1000:0;last=now;render();}
    raf=requestAnimationFrame(tick);
  }
  function restart(){cancelAnimationFrame(raf);last=0;if(visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(tick);}
  let visible=true;
  function syncTheme() {
    state.themeKey = document.documentElement.dataset.theme === 'light' ? 'light' : 'ice';
    rebuildSprites();
    layout();
  }
  initParticles();
  syncTheme();
  restart();
  addEventListener('mairl-theme-change', syncTheme);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;restart();}).observe(canvas);
  new ResizeObserver(layout).observe(canvas.parentElement);
  document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);
})();
