const ICON = {
  game: "🎮",
  creative: "✨",
  music: "♪",
  "3d-sim": "🌐",
  productivity: "📋",
  "math-science": "∑",
  web: "◈",
  utility: "⚡",
};

let DATA = null;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" })[c],
  );
}

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (hash.startsWith("templates/")) {
    return { name: "detail", id: decodeURIComponent(hash.slice("templates/".length)) };
  }
  return { name: "home" };
}

function cardHtml(t) {
  const cat = DATA.CATEGORY_META[t.category];
  const diff = DATA.DIFFICULTY_META[t.difficulty];
  return `<a class="card" href="#/templates/${encodeURIComponent(t.id)}">
    <div class="card-top">
      <div class="card-icon">${ICON[t.category] || "•"}</div>
      <span class="card-cat">${esc(cat.labelKo)}</span>
    </div>
    <h3>${esc(t.nameKo)}</h3>
    <p class="en">${esc(t.name)}</p>
    <p class="tagline">${esc(t.tagline)}</p>
    <div class="card-foot"><span class="diff">${esc(diff.label)}</span><span class="more">상세 보기</span></div>
  </a>`;
}

function renderHome() {
  const { templates, CATEGORY_META, ALL_CATEGORIES } = DATA;
  const counts = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0]));
  templates.forEach((t) => {
    counts[t.category] += 1;
  });
  return `
  <main>
    <section class="wrap hero">
      <p class="badge">✦ Grok Build · Artifacts</p>
      <h1>템플릿 용도 가이드</h1>
      <p class="lead">Build 모드 아티팩트에 있는 템플릿 <strong style="color:var(--fg)">${templates.length}종</strong>의 목적, 적합한 사용 장면, 핵심 기능, 확장 아이디어를 한곳에서 살펴보세요.</p>
      <div class="stats">
        <div class="stat"><div class="label">템플릿</div><div class="value">${templates.length}</div><div class="hint">전체 아티팩트</div></div>
        <div class="stat"><div class="label">카테고리</div><div class="value">${ALL_CATEGORIES.length}</div><div class="hint">게임부터 생산성까지</div></div>
        <div class="stat"><div class="label">활용 축</div><div class="value">4</div><div class="hint">용도 · 장면 · 기능 · 확장</div></div>
      </div>
    </section>
    <section class="catalog" id="catalog">
      <div class="wrap">
        <div class="catalog-head">
          <div>
            <h2>카탈로그</h2>
            <p class="sub">카테고리와 검색으로 걸러 상세 페이지로 이동하세요.</p>
          </div>
          <div class="search-wrap">
            <span class="icon">⌕</span>
            <input id="search" type="search" placeholder="이름, 용도, 키워드 검색…" aria-label="템플릿 검색" />
          </div>
        </div>
        <div class="chips" id="chips">
          <button type="button" class="chip active" data-cat="all">전체 <span class="count">${templates.length}</span></button>
          ${ALL_CATEGORIES.map(
            (c) =>
              `<button type="button" class="chip" data-cat="${c}">${esc(CATEGORY_META[c].labelKo)} <span class="count">${counts[c]}</span></button>`,
          ).join("")}
        </div>
        <p class="result-meta" id="result-meta"></p>
        <div class="grid" id="grid"></div>
        <div class="empty hidden" id="empty">
          <p style="font-weight:500;color:var(--fg)">검색 결과가 없습니다</p>
          <p style="color:var(--muted);font-size:0.9rem;margin-top:0.5rem">다른 키워드를 쓰거나 카테고리 필터를 해제해 보세요.</p>
          <button type="button" id="reset-filters">필터 초기화</button>
        </div>
      </div>
    </section>
    <section class="how" id="how-to">
      <div class="wrap">
        <h2>템플릿을 고르는 방법</h2>
        <div class="how-grid">
          <article class="how-card"><div class="step">01</div><h3>목표를 한 문장으로</h3><p>‘누구에게 무엇을 보여/하게 할 것인가’를 먼저 정하세요. 마케팅이면 랜딩·바이오, 놀이면 게임, 설명이면 시뮬·수학 템플릿이 잘 맞습니다.</p></article>
          <article class="how-card"><div class="step">02</div><h3>카테고리로 좁히기</h3><p>8개 카테고리로 1차 필터링한 뒤, 상세 페이지의 ‘이런 때 쓰세요’와 ‘확장 아이디어’를 보고 한 개를 고르세요.</p></article>
          <article class="how-card"><div class="step">03</div><h3>Build에서 이터레이션</h3><p>템플릿 이름을 프롬프트에 넣고 톤·데이터·CTA를 구체화하세요. 한 턴에 기능 1~3개만 수정하면 품질이 안정적입니다.</p></article>
        </div>
      </div>
    </section>
  </main>
  <footer><div class="wrap footer-inner"><p>Grok Build 아티팩트 템플릿 레퍼런스 · 교육·선택 가이드용</p><p style="color:var(--faint)">${templates.length} templates documented</p></div></footer>`;
}

function bindHome() {
  let query = "";
  let category = "all";
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const meta = document.getElementById("result-meta");
  const search = document.getElementById("search");
  const chips = document.getElementById("chips");

  function paint() {
    const q = query.trim().toLowerCase();
    const filtered = DATA.templates.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      const hay = [
        t.name,
        t.nameKo,
        t.tagline,
        t.summary,
        t.purpose,
        t.audience,
        ...t.keywords,
        ...t.bestFor,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    meta.innerHTML =
      `<strong style="color:var(--fg)">${filtered.length}</strong>개 템플릿` +
      (category !== "all" ? ` · ${esc(DATA.CATEGORY_META[category].labelKo)}` : "") +
      (q ? ` · “${esc(query)}”` : "");
    if (!filtered.length) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      grid.innerHTML = filtered.map(cardHtml).join("");
    }
  }

  search.addEventListener("input", (e) => {
    query = e.target.value;
    paint();
  });
  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    category = btn.getAttribute("data-cat");
    chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));
    paint();
  });
  document.getElementById("reset-filters").addEventListener("click", () => {
    query = "";
    category = "all";
    search.value = "";
    chips
      .querySelectorAll(".chip")
      .forEach((c) => c.classList.toggle("active", c.getAttribute("data-cat") === "all"));
    paint();
  });
  document.getElementById("nav-how").addEventListener("click", (e) => {
    e.preventDefault();
    location.hash = "#/";
    setTimeout(() => document.getElementById("how-to")?.scrollIntoView({ behavior: "smooth" }), 50);
  });
  paint();
}

function renderDetail(id) {
  const t = DATA.templates.find((x) => x.id === id);
  if (!t) {
    return `<main class="wrap detail" style="text-align:center;padding:5rem 1rem">
      <h1 style="font-family:var(--font-display)">템플릿을 찾을 수 없습니다</h1>
      <p style="color:var(--muted)">목록에 없는 ID이거나 주소가 잘못되었습니다.</p>
      <p style="margin-top:1.5rem"><a href="#/" style="background:var(--primary);color:var(--primary-fg);padding:0.65rem 1rem;border-radius:0.75rem;font-weight:600">카탈로그로 돌아가기</a></p>
    </main>`;
  }
  const cat = DATA.CATEGORY_META[t.category];
  const diff = DATA.DIFFICULTY_META[t.difficulty];
  const index = DATA.templates.findIndex((x) => x.id === t.id);
  const prev = index > 0 ? DATA.templates[index - 1] : null;
  const next = index < DATA.templates.length - 1 ? DATA.templates[index + 1] : null;
  const related = DATA.templates
    .filter((x) => x.category === t.category && x.id !== t.id)
    .slice(0, 3);
  const prompt = `"${t.name}" 템플릿을 기반으로 만들어 줘.\n목표: ${t.tagline}\n핵심: ${t.bestFor[0]}\n톤: 세련되고 모바일 우선. 동작하는 프리뷰까지 완성해 줘.`;

  return `
  <main class="wrap detail">
    <a class="back" href="#/">← 카탈로그로</a>
    <div class="detail-grid">
      <article>
        <div class="pills">
          <span class="pill">${ICON[t.category] || ""} ${esc(cat.labelKo)}</span>
          <span class="pill faint">${esc(diff.label)} · ${esc(diff.labelEn)}</span>
          <span class="pill faint" style="font-family:var(--font-mono)">#${String(index + 1).padStart(2, "0")}</span>
        </div>
        <div class="title-row">
          <div class="title-icon">${ICON[t.category] || "•"}</div>
          <div>
            <h1>${esc(t.nameKo)}</h1>
            <div class="en-name">${esc(t.name)}</div>
            <p class="tag">${esc(t.tagline)}</p>
          </div>
        </div>
        <section class="block">
          <h2>◎ 한줄 요약</h2>
          <p>${esc(t.summary)}</p>
        </section>
        <section class="block purpose-box">
          <h2>이 템플릿의 용도</h2>
          <p>${esc(t.purpose)}</p>
        </section>
        <div class="two-col">
          <div class="list-box"><h2>✓ 이런 때 쓰세요</h2><ul>${t.bestFor.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>
          <div class="list-box"><h2>⚙ 기본으로 갖추는 것</h2><ul>${t.features.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>
        </div>
        <section class="block">
          <h2>💡 확장 아이디어</h2>
          <p style="font-size:0.875rem;margin:0 0 0.5rem">Build 채팅에서 이어서 요청하면 좋은 변형입니다.</p>
          <div class="ideas">${t.iterateIdeas.map((i) => `<div class="idea">${esc(i)}</div>`).join("")}</div>
        </section>
        <div class="audience">
          <div>👥</div>
          <div><strong style="color:var(--fg);font-size:0.875rem">주요 사용자</strong><p style="margin:0.35rem 0 0">${esc(t.audience)}</p></div>
        </div>
        <section class="block">
          <h2 style="font-size:0.9rem">프롬프트 시드</h2>
          <pre class="prompt">${esc(prompt)}</pre>
        </section>
      </article>
      <aside class="aside">
        <div class="aside-card">
          <h3>카테고리</h3>
          <p style="margin:0;font-weight:500;color:var(--fg)">${esc(cat.labelKo)}</p>
          <p style="margin:0.35rem 0 0;font-size:0.875rem;color:var(--muted)">${esc(cat.description)}</p>
        </div>
        <div class="aside-card">
          <h3>키워드</h3>
          <div class="keywords">${t.keywords.map((k) => `<span>${esc(k)}</span>`).join("")}</div>
        </div>
        ${
          related.length
            ? `<div class="aside-card related">
          <h3>같은 카테고리</h3>
          ${related
            .map(
              (r) =>
                `<a href="#/templates/${encodeURIComponent(r.id)}"><span class="ko">${esc(r.nameKo)}</span><span class="en">${esc(r.name)}</span></a>`,
            )
            .join("")}
        </div>`
            : ""
        }
      </aside>
    </div>
    <nav class="nav-pair">
      ${
        prev
          ? `<a href="#/templates/${encodeURIComponent(prev.id)}"><div class="lab">이전</div><div class="ko">${esc(prev.nameKo)}</div><div class="en">${esc(prev.name)}</div></a>`
          : "<div></div>"
      }
      ${
        next
          ? `<a class="right" href="#/templates/${encodeURIComponent(next.id)}"><div class="lab">다음</div><div class="ko">${esc(next.nameKo)}</div><div class="en">${esc(next.name)}</div></a>`
          : ""
      }
    </nav>
  </main>`;
}

async function mount() {
  if (!DATA) {
    DATA = await fetch("/data.json").then((r) => r.json());
  }
  const r = route();
  const app = document.getElementById("app");
  if (r.name === "detail") {
    app.innerHTML = renderDetail(r.id);
    const t = DATA.templates.find((x) => x.id === r.id);
    document.title = t ? `${t.nameKo} (${t.name}) — Build Templates` : "Template";
  } else {
    app.innerHTML = renderHome();
    document.title = "Grok Build Templates — 아티팩트 템플릿 용도 가이드";
    bindHome();
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", mount);
mount();
