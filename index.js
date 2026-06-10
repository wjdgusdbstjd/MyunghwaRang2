/* ── 화면 전환 ── */
    /* ── 화면 전환 ── */
    function goToScreen(id) {
      const t = document.getElementById("transition");
      t.classList.add("flash");
      setTimeout(() => {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        document.getElementById(id).classList.add("active");
        t.classList.remove("flash");
        if (id === "screen-puzzle") initPuzzle();
        if (id === "screen-story") initStory();
        if (id === "screen-drawing") initDrawingScreen();
        if (id === "screen-result") initResultScreen();
        if (id === "screen-gallery") console.log("갤러리 화면 로드됨"); // 이 한 줄을 추가해줘!

        if (id === "screen-drawing-lyrics") startLyrics();
      }, 220);
    }

    /* ── 퍼즐 조각 크기/위치 동적 계산 ── */
    /*
      퍼즐 이미지(puzzle-bear.png)를 4열 × 3행으로 잘라
      각 .bear-piece 셀에 정확하게 맞춰 표시한다.

      핵심 원리:
        셀 하나의 크기 = (w, h)
        전체 이미지 표시 크기 = (w * 4열,  h * 3행)
          → background-size: w*4 px  h*3 px
        각 조각의 오프셋(px):
          col 0→0,  col 1→-w,  col 2→-2w,  col 3→-3w
          row 0→0,  row 1→-h,  row 2→-2h

      이렇게 하면 프레임이 어떤 크기로 바뀌어도 항상 정확히 들어맞는다.
    */
    function initPuzzle() {
      // 그리드 안 아무 .puzzle-cell 하나의 실제 크기를 측정
      const cell = document.querySelector(".puzzle-cell");
      if (!cell) return;
      const w = cell.offsetWidth;
      const h = cell.offsetHeight;

      // 4열 × 3행 배치 정보: [col, row] (col: 0~3, row: 0~2)
      const pieceMap = {
        "bp-0-0": [0, 0],
        "bp-1-0": [1, 0],
        "bp-2-0": [2, 0],
        "bp-3-0": [3, 0],
        "bp-0-1": [0, 1],
        "bp-2-1": [2, 1],
        "bp-1-2": [1, 2],
      };

      // 전체 이미지 표시 크기 (셀 크기 × 열수/행수)
      const totalW = w * 4;
      const totalH = h * 3;

      document.querySelectorAll(".bear-piece").forEach(el => {
        // 어떤 조각인지 클래스명에서 찾기
        let col = 0, row = 0;
        for (const [cls, [c, r]] of Object.entries(pieceMap)) {
          if (el.classList.contains(cls)) { col = c; row = r; break; }
        }
        el.style.backgroundSize = `${totalW}px ${totalH}px`;
        el.style.backgroundPosition = `-${col * w}px -${row * h}px`;
      });
    }

    // 창 크기가 바뀔 때도 재계산 (100% 레이아웃이므로 필요)
    window.addEventListener("resize", () => {
      if (document.getElementById("screen-puzzle").classList.contains("active")) {
        initPuzzle();
      }
    });

    // 최초 로드 시 홈 화면이 active이므로, 퍼즐이 보일 때를 위해 미리 한 번 계산
    // (퍼즐이 display:none이면 offsetWidth=0이라 여기선 goToScreen 시점에만 호출)


    function showGalleryToast() {
      const t = document.getElementById("galleryToast");
      t.style.display = "block";
      setTimeout(() => { t.style.display = "none"; }, 2500);
    }

    /* ── 스토리 시스템 ── */
    const pages = [
  { text: "짜잔! 난 모네 아저씨야!", hasFact: false, duration: 4000, image: "images/mone-1.png" },
  { text: "여기 아저씨의 비밀 정원에 있는 커다란 연못이야. 물 위에 둥둥 떠 있는 초록색 잎들이 보이니? 꼭 물고기들의 우산 같지?", hasFact: false, duration: 7000, image: "images/mone-2.png" },
  { text: "이 식물은 '수련'이라고 해. 낮에는 햇살을 받아서 예쁜 분홍빛, 보랏빛 꽃을 활짝 피우고, 밤이 되면 졸린 눈을 비비며 꽃잎을 쏙 오므린단다.", hasFact: true, duration: 9000, image: "images/mone-3.png" },
  { text: "아저씨는 이 수련을 그리는 걸 정말 좋아해! 왜냐하면 아침, 점심, 저녁마다 햇님이 비추는 색이 달라서 연못이 매일 요술을 부리거든!", hasFact: false, duration: 7000, image: "images/mone-4.png" },
  { text: "햇살이 수면 위로 하얗게 부서지면, 연못 전체가 마치 보석을 뿌려 놓은 것처럼 반짝반짝 빛나. 이 아름다운 풍경을 너에게도 꼭 보여주고 싶었어.", hasFact: false, duration: 8000, image: "images/mone-5.png" },
  { text: "빛에 따라 반짝이는 물방울과 알록달록한 수련 꽃들! 자, 이제 너만의 멋진 색으로 나와 함께 반짝이는 연못을 그려볼까?", hasFact: false, duration: 0, isLast: true, image: "images/mone-6.png" }
];
    let cur = 0, autoT = null;

    function initStory() { cur = 0; buildDots(); renderPage(); }

    function buildDots() {
      const el = document.getElementById("storyDots");
      el.innerHTML = "";
      pages.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "story-dot" + (i === 0 ? " active" : "");
        el.appendChild(d);
      });
    }

    function renderPage() {
      const p = pages[cur];
      document.getElementById("storyText").textContent = p.text;

      document.getElementById("storyCharImg").src = p.image;


      document.getElementById("pageNum").textContent = (cur + 1) + " / " + pages.length;
      document.getElementById("prevBtn").disabled = cur === 0;
      document.getElementById("nextBtn").disabled = cur === pages.length - 1;
      document.getElementById("factBox").classList.toggle("visible", !!p.hasFact);
      document.getElementById("startDrawBtn").style.display = p.isLast ? "block" : "none";
      document.getElementById("storyDots").style.display = p.isLast ? "none" : "flex";
      document.querySelectorAll(".story-dot").forEach((d, i) => d.classList.toggle("active", i === cur));
      clearAuto();
      if (!p.isLast) startAuto(p.duration);
    }

    function startAuto(dur) {
      const f = document.getElementById("autoProgressFill");
      f.style.transition = "none"; f.style.width = "0%";
      setTimeout(() => { f.style.transition = `width ${dur}ms linear`; f.style.width = "100%"; }, 50);
      autoT = setTimeout(() => { if (cur < pages.length - 1) { cur++; renderPage(); } }, dur);
    }

    function clearAuto() {
      if (autoT) { clearTimeout(autoT); autoT = null; }
      const f = document.getElementById("autoProgressFill");
      f.style.transition = "none"; f.style.width = "0%";
    }

    function changeStoryPage(d) {
      clearAuto();
      const n = cur + d;
      if (n < 0 || n >= pages.length) return;
      cur = n; renderPage();
    }

    /* ── 그리기 화면 진입 (배경음악 재생) ── */
    function initDrawingScreen() {
      const music = document.getElementById("bgMusic");
      if (music) {
        music.play().catch(() => {
          // 브라우저 자동재생 정책으로 막힐 수 있음 — 사용자 첫 탭 후 재생됨
        });
      }
    }

    /* ── 결과 화면 진입 (배경음악 정지 + 파티클) ── */
    function initResultScreen() {
      const music = document.getElementById("bgMusic");
      if (music) { music.pause(); music.currentTime = 0; }
      createSparkles();
      runParticles();
    }

    /* ── 결과 화면 파티클 ── */
    function createSparkles() {
      const c = document.getElementById("sparkleContainer");
      c.innerHTML = "";
      const em = ["✨", "⭐", "🌟", "💫", "🎊", "🌸", "🦋", "🎉"];
      for (let i = 0; i < 18; i++) {
        const s = document.createElement("div");
        s.className = "sparkle";
        s.textContent = em[Math.floor(Math.random() * em.length)];
        s.style.cssText = `left:${Math.random() * 100}%;bottom:-30px;animation-delay:${Math.random() * 3}s;animation-duration:${2 + Math.random() * 2}s;font-size:${14 + Math.random() * 14}px;`;
        c.appendChild(s);
        setInterval(() => {
          s.style.left = Math.random() * 100 + "%";
          s.style.animationDuration = (2 + Math.random() * 2) + "s";
        }, 3000);
      }
    }

    function runParticles() {
      const cv = document.getElementById("particleCanvas");
      const sc = document.getElementById("screen-result");
      cv.width = sc.offsetWidth;
      cv.height = sc.offsetHeight;
      const ctx = cv.getContext("2d");
      const pts = Array.from({ length: 50 }, () => ({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        r: Math.random() * 2.5 + 1,
        dx: (Math.random() - .5) * .5, dy: (Math.random() - .5) * .5,
        color: `hsl(${Math.random() * 60 + 40},100%,70%)`
      }));
      (function tick() {
        if (!document.getElementById("screen-result").classList.contains("active")) return;
        ctx.clearRect(0, 0, cv.width, cv.height);
        pts.forEach(p => {
          p.x += p.dx; p.y += p.dy;
          if (p.x < 0 || p.x > cv.width) p.dx *= -1;
          if (p.y < 0 || p.y > cv.height) p.dy *= -1;
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(tick);
      })();
    }


// document.addEventListener("DOMContentLoaded", () => {
//   const slider = document.querySelector(".gallery-slider");

//   let current = 0;
//   let target = 0;
//   let isAnimating = false;

//   function animate() {
//     current += (target - current) * 0.12;

//     slider.scrollLeft = current;

//     if (Math.abs(target - current) > 0.5) {
//       requestAnimationFrame(animate);
//     } else {
//       current = target;
//       slider.scrollLeft = target;
//       isAnimating = false;
//     }
//   }

//   window.addEventListener(
//     "wheel",
//     (e) => {
//       e.preventDefault();

//       target += e.deltaY * 1.2;

//       const maxScroll =
//         slider.scrollWidth - slider.clientWidth;

//       target = Math.max(0, Math.min(target, maxScroll));

//       if (!isAnimating) {
//         isAnimating = true;
//         requestAnimationFrame(animate);
//       }
//     },
//     { passive: false }
//   );
// });




function goToScreen(id) {

  console.log("새 goToScreen");
  
  const t = document.getElementById("transition");
  t.classList.add("flash");
  setTimeout(() => {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    t.classList.remove("flash");
    
    if (id === "screen-puzzle") initPuzzle();
    if (id === "screen-story") initStory();
    if (id === "screen-drawing") initDrawingScreen();
    if (id === "screen-result") initResultScreen();
    if (id === "screen-gallery") console.log("갤러리 화면 로드됨");
    
    // 🌟 가사 화면 로드 시 실행될 함수 추가!
    if (id === "screen-drawing-lyrics") startLyrics(); 
  }, 220);
}

/* ── 가사 하이라이트 시스템 ── */
// 각 가사 번호마다 몇 초 동안 파란색으로 머물지 설정 (밀리초 단위: 1000 = 1초)
const lyricTimings = [
  1000, // 0번 줄: 안녕 하윤아... (5초)
  1000, // 1번 줄: 이 그림을 그린... (7초)
  1000, // 2번 줄: 그런데 이 연꽃들은... (7.5초)
  1000, // 3번 줄: 모네 할아버지는... (6.5초)
  1000, // 4번 줄: 어라? 지금은... (3초)
  1000, // 5번 줄: 와 해가 지니까... (4.5초)
  1000, // 6번 줄: 모네 할아버지는 매일... (5.5초)
  1000  /* 7번 줄: 우리도 모네 할아버지처럼... (4초) */
];

let lyricTimer = null;

function startLyrics() {
  // 타이머 초기화
  if (lyricTimer) clearTimeout(lyricTimer);
  
  const totalLines = lyricTimings.length;
  let currentLine = 0;
  
  // 모든 가사 라인의 active 클래스 제거하고 버튼 숨기기
  document.querySelectorAll(".lyric-line").forEach(el => el.classList.remove("active"));
  document.getElementById("lyricsNextBtn").style.display = "none";

  function showNextLine() {
    // 이전 줄 파란색 해제
    if (currentLine > 0) {
      document.getElementById(`lyric-${currentLine - 1}`).classList.remove("active");
    }
    
    // 모든 가사가 끝났을 때
    if (currentLine >= totalLines) {
      document.getElementById("lyricsNextBtn").style.display = "block"; // 다음 버튼 등장
      return;
    }
    
    // 현재 줄 파란색 활성화
    const activeLine = document.getElementById(`lyric-${currentLine}`);
    activeLine.classList.add("active");
    
    // 현재 읽는 가사 위치로 스크롤을 부드럽게 이동 (글이 길어 아래로 내려갈 때 유용)
    activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 설정된 시간 뒤에 다음 줄로 이동
    lyricTimer = setTimeout(() => {
      currentLine++;
      showNextLine();
    }, lyricTimings[currentLine]);

    
  }

  // 첫 번째 줄 시작!
  showNextLine();
}




// function openGalleryPopup() {
//   document
//     .getElementById("galleryPopup")
//     .classList.add("active");
// }

function closeGalleryPopup() {
  document
    .getElementById("galleryPopup")
    .classList.remove("active");
}


function openGalleryPopup() {
  const popup = document.getElementById("galleryPopup");

  popup.classList.add("active");

  gsap.from(".popup-content", {
    scale: 0.7,
    opacity: 0,
    duration: 0.4,
    ease: "back.out(1.7)"
  });

  gsap.from(".gallery-popup", {
  opacity: 0,
  duration: 0.3
  });
  
  
  gsap.to(".mattise", {
  y: -15,
  duration: 2,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
  });
  
gsap.from(".pop-up-left h2", {
  scale: 1.5,
  opacity: 0,
  duration: 0.6,
  ease: "back.out(2)"
});

  
  

  
}

function closeGalleryPopup() {
  document
    .getElementById("galleryPopup")
    .classList.remove("active");
}



// function animateGallery() {
//   gsap.from(".gallery-slider", {
//     y: 100,
//     opacity: 0,
//     duration: 1,
//     ease: "power3.out"
//   });
// }