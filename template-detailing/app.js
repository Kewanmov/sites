(function () {
  const S = window.SITE;
  const app = document.getElementById("app");
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  if (S.accent) document.documentElement.style.setProperty("--accent", S.accent);
  if (S.theme) Object.entries(S.theme).forEach(([k, v]) => document.documentElement.style.setProperty("--" + k, v));

  const icons = {
    star: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.3 14.3l-1.1-4.9L15 6.1l-5-.5L8 1 6 5.6l-5 .5 3.8 3.3-1.1 4.9L8 11.7z"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3.2 1.8h2.4l1.2 3-1.6 1a8.4 8.4 0 004 4l1-1.6 3 1.2v2.4a1.4 1.4 0 01-1.5 1.4A12.4 12.4 0 011.8 3.3a1.4 1.4 0 011.4-1.5z"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 14.5s4.8-4.3 4.8-8a4.8 4.8 0 10-9.6 0c0 3.7 4.8 8 4.8 8z"/><circle cx="8" cy="6.5" r="1.7"/></svg>',
    check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  const mainPhone = S.phones[0];
  const street = S.address.replace(/^Томск,\s*/, "");
  const mapSrc = "https://yandex.ru/map-widget/v1/?text=" + encodeURIComponent(S.mapQuery) + "&z=16";
  const routeHref = "https://yandex.ru/maps/?rtext=~" + encodeURIComponent(S.mapQuery);

  const tomskNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tomsk" }));
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
  const dayNames = ["понедельник", "вторник", "среду", "четверг", "пятницу", "субботу", "воскресенье"];
  const openState = () => {
    if (!S.schedule) return null;
    const now = tomskNow();
    const day = (now.getDay() + 6) % 7;
    const mins = now.getHours() * 60 + now.getMinutes();
    const today = S.schedule[day];
    if (today && mins >= toMin(today[0]) && mins < toMin(today[1])) return { open: true, text: "Открыто до " + today[1] };
    if (today && mins < toMin(today[0])) return { open: false, text: "Откроемся сегодня в " + today[0] };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (S.schedule[d]) return { open: false, text: "Откроемся " + (i === 1 ? "завтра" : "в " + dayNames[d]) + " в " + S.schedule[d][0] };
    }
    return null;
  };
  const st = openState();

  const bookingDays = () => {
    const now = tomskNow();
    const out = [];
    for (let i = 0; i < 7 && out.length < 4; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i);
      const wd = (d.getDay() + 6) % 7;
      const sch = S.schedule ? S.schedule[wd] : true;
      if (!sch) continue;
      if (i === 0 && sch !== true && now.getHours() * 60 + now.getMinutes() > toMin(sch[1]) - 60) continue;
      const label = i === 0 ? "Сегодня" : i === 1 ? "Завтра" : d.toLocaleDateString("ru-RU", { weekday: "short" }).replace(/^./, (c) => c.toUpperCase());
      out.push({ label, sub: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }).replace(".", "") });
    }
    return out;
  };

  const navLinks = [["#prices", "Цены"], ["#booking", "Запись"], ["#studio", "Студия"], ["#reviews", "Отзывы"], ["#contacts", "Контакты"]];
  const nav = `
    <header class="nav">
      <a class="brand" href="#top">${esc(S.name)}</a>
      <nav class="nav-links" aria-label="Разделы">${navLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <div class="nav-right">
        <a class="nav-call" href="tel:${esc(mainPhone.tel)}" aria-label="Позвонить ${esc(mainPhone.label)}">${icons.phone}<span>${esc(mainPhone.label)}</span></a>
        <button type="button" class="nav-menu" aria-expanded="false" aria-controls="menu">Меню</button>
      </div>
    </header>
    <div class="menu" id="menu" hidden>
      <nav aria-label="Меню">${navLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <div class="menu-foot">
        <a class="btn btn-accent btn-wide" href="tel:${esc(mainPhone.tel)}">${icons.phone}${esc(mainPhone.label)}</a>
        ${S.messengers && S.messengers.length ? `<div class="menu-pills">${S.messengers.map((m) => `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.label)}</a>`).join("")}</div>` : ""}
      </div>
    </div>`;

  const zigzag = [
    "M-20 64 L90 18 L200 64 L310 18 L420 64",
    "M-20 150 L60 112 L140 150 L220 112 L300 150 L380 112 L440 140",
    "M200 64 L200 112",
    "M30 236 L120 196 L210 236",
    "M250 226 L330 190 L410 226"
  ];
  const hexes = () => {
    const out = [];
    const r = 34, w = Math.sqrt(3) * r;
    for (let row = 0; row < 4; row++) {
      for (let col = -1; col < 6; col++) {
        const cx = col * w + (row % 2 ? w / 2 : 0) + 20;
        const cy = row * r * 1.5 + 30;
        const pts = [];
        for (let k = 0; k < 6; k++) {
          const ang = Math.PI / 180 * (60 * k - 30);
          pts.push((cx + r * Math.cos(ang)).toFixed(1) + " " + (cy + r * Math.sin(ang)).toFixed(1));
        }
        out.push("M" + pts.join(" L") + " Z");
      }
    }
    return out;
  };
  const linePaths = S.lights === "hex" ? hexes() : zigzag;
  const lines = `
    <svg class="lines${S.lights === "hex" ? " is-hex" : ""}" viewBox="0 0 400 ${S.lights === "hex" ? 230 : 260}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g filter="url(#glow)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${linePaths.map((d, i) => `<path pathLength="1" style="--d:${(S.lights === "hex" ? (i % 7) * 0.08 + Math.floor(i / 7) * 0.12 : i * 0.15).toFixed(2)}s" d="${d}"/>`).join("")}
      </g>
    </svg>`;

  const neonWords = String(S.name).split(/\s+/);
  const neonTri = `
    <svg class="neon-tri" viewBox="0 0 220 160" aria-hidden="true">
      <g fill="none" stroke-linejoin="round" stroke-width="3">
        <path class="t1" d="M30 130 L80 40 L130 130 Z"/>
        <path class="t2" d="M110 120 L150 52 L190 120 Z"/>
        <path class="t3" d="M150 40 L172 6 L194 40 Z"/>
      </g>
    </svg>`;
  const wave = (y, amp, len) => {
    let d = "M-40 " + y;
    for (let x = -40; x < 440; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
    return d;
  };
  const heroPhoto = S.hero === "photo" && S.heroPhoto ? `
    <section class="hero hero-photo" id="top">
      <img class="hero-img" src="${esc(S.heroPhoto.src)}" alt="${esc(S.heroPhoto.alt)}" width="1600" height="900" fetchpriority="high"${S.heroPhoto.position ? ` style="object-position:${esc(S.heroPhoto.position)}"` : ""}>
      <span class="hero-tone" aria-hidden="true"></span>
      <svg class="waves" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
        <path class="w1" d="${wave(30, 14, 80)}"/>
        <path class="w2" d="${wave(38, 10, 120)}"/>
      </svg>
      <div class="hero-body">
        ${S.badge ? `<p class="hero-badge">${icons.star}${esc(S.badge)}</p>` : ""}
        <p class="hero-kind">${esc(S.kind)} в Томске</p>
        <h1 class="hero-name">${esc(S.name)}</h1>
        <p class="hero-lead">${esc(S.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-accent" href="#booking">Записаться</a>
          <a class="btn btn-glass" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
        </div>
      </div>
    </section>` : "";
  const hero = heroPhoto || (S.hero === "neon" ? `
    <section class="hero hero-neon" id="top">
      ${neonTri}
      <div class="hero-body">
        ${S.badge ? `<p class="hero-badge">${icons.star}${esc(S.badge)}</p>` : ""}
        <p class="hero-kind">${esc(S.kind)} в Томске</p>
        <h1 class="neon-sign" aria-label="${esc(S.name)}">${neonWords.map((w, i) => `<span class="neon-word" style="--i:${i}" aria-hidden="true">${esc(w)}</span>`).join("")}</h1>
        <p class="hero-lead">${esc(S.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-accent" href="#booking">Записаться</a>
          <a class="btn btn-glass" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
        </div>
      </div>
    </section>` : `
    <section class="hero" id="top">
      ${lines}
      <div class="hero-body">
        ${S.badge ? `<p class="hero-badge">${icons.star}${esc(S.badge)}</p>` : ""}
        <p class="hero-kind">${esc(S.kind)} в Томске</p>
        <h1 class="hero-name">${esc(S.name)}</h1>
        <p class="hero-lead">${esc(S.lead)}</p>
        <div class="hero-actions">
          <a class="btn btn-accent" href="#booking">Записаться</a>
          <a class="btn btn-glass" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
        </div>
      </div>
    </section>`);

  const facts = `
    <div class="facts">
      <a class="fact" href="${esc(S.rating.url)}" target="_blank" rel="noopener">
        <span class="fact-big">${esc(S.rating.value)}</span>
        <span class="fact-small"><span class="stars">${icons.star.repeat(5)}</span>${esc(S.rating.count)} в ${esc(S.rating.source)}</span>
      </a>
      <div class="fact">
        ${st ? `<span class="status${st.open ? " is-open" : ""}"><i></i>${esc(st.text)}</span>` : ""}
        <span class="fact-small">${esc(S.hoursShort)}</span>
      </div>
      <a class="fact fact-wide" href="#contacts">
        <span class="fact-mid">${icons.pin}${esc(street)}</span>
        <span class="fact-small">${esc(S.addressNote)}</span>
      </a>
    </div>`;

  const phases = S.phases && S.phases.length ? `
    <section class="section" id="wash">
      <h2 class="title">${esc(S.phasesTitle || "Как моем")}</h2>
      <p class="sub">${esc(S.phasesNote || "Основные программы и цены.")}</p>
      ${S.phasesStyle === "photos" ? `
      <div class="shots">
        ${S.phases.map((p) => `
          <a class="shot${p.photo ? "" : " is-plain"}" href="#booking" data-pick="${esc(p.pick || p.title)}">
            ${p.photo ? `<img src="${esc(p.photo.src)}" alt="${esc(p.photo.alt)}" width="1600" height="900" loading="lazy"${p.photo.position ? ` style="object-position:${esc(p.photo.position)}"` : ""}>` : ""}
            <span class="shot-body">
              <span class="shot-price">${esc(p.price)}</span>
              <span class="shot-title">${esc(p.title)}</span>
              ${p.text ? `<span class="shot-text">${esc(p.text)}</span>` : ""}
            </span>
          </a>`).join("")}
      </div>` : S.phasesStyle === "tiers" ? `
      <div class="tiers">
        ${S.phases.map((p) => `
          <article class="tier${p.combo ? " is-top" : ""}">
            ${p.tag ? `<p class="tier-tag">${esc(p.tag)}</p>` : ""}
            <h3>${esc(p.title)}</h3>
            <p class="tier-price">${esc(p.price)}</p>
            <ul class="checks">${(p.items || []).map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
            <a class="btn ${p.combo ? "btn-accent" : "btn-line"} btn-wide" href="#booking" data-pick="${esc(p.title)}">Выбрать</a>
          </article>`).join("")}
      </div>` : `
      <ol class="phases">
        ${S.phases.map((p, i) => `
          <li class="phase${p.combo ? " is-combo" : ""}">
            <span class="phase-n"${p.combo && !p.mark ? ' aria-hidden="true"' : ""}>${p.combo ? esc(p.mark || "+") : i + 1}</span>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.text)}</p>
            <span class="phase-price">${esc(p.price)}</span>
          </li>`).join("")}
      </ol>`}
    </section>` : "";

  const days = bookingDays();
  const services = S.services.map((x) => (typeof x === "string" ? { name: x } : x));
  const rub = (n) => n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₽";
  const contactWays = [["call", "Звонок"]].concat((S.messengers || []).filter((m) => /Telegram|WhatsApp/.test(m.label)).map((m) => [m.label.toLowerCase(), m.label]));
  const booking = `
    <section class="booking-wrap" id="booking">
      <form class="booking" novalidate>
        <h2 class="title">Запись</h2>
        <p class="sub on-dark">Оставьте номер. Администратор перезвонит или напишет и подберёт время.</p>
        <fieldset class="group"><legend>Услуга, если уже знаете</legend>
          <div class="pills">${services.map((x, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="false"><span>${esc(x.name)}</span></button>`).join("")}</div>
          <p class="total-sum" aria-live="polite"></p>
        </fieldset>
        <fieldset class="group"><legend>Когда удобно</legend>
          <div class="days" role="radiogroup">${days.map((d, i) => `<button type="button" class="day" role="radio" aria-checked="${i === 0}"><b>${esc(d.label)}</b><span>${esc(d.sub)}</span></button>`).join("")}</div>
        </fieldset>
        <div class="group">
          <label class="field" data-field="phone"><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required aria-describedby="phone-err"></label>
          <p class="field-error" id="phone-err" role="alert">Введите номер полностью, 10 цифр после +7</p>
          <div class="ways" role="radiogroup" aria-label="Как связаться">${contactWays.map((w, i) => `<button type="button" class="seg-btn" role="radio" data-group="way" aria-checked="${i === 0}">${esc(w[1])}</button>`).join("")}</div>
        </div>
        <button type="submit" class="btn btn-accent btn-wide btn-big">Записаться</button>
        <p class="fine">Точную стоимость уточнит администратор.</p>
      </form>
    </section>`;

  const tabs = S.prices.map((g, i) => `<button type="button" class="tab" role="tab" id="tab-${i}" aria-controls="panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(g.group)}</button>`).join("");
  const priceRows = (g) => g.items.map(([n, v]) => `<li class="price-row"><span class="price-name">${esc(n)}</span>${v ? `<span class="price-value">${esc(v)}</span>` : ""}</li>`).join("");
  const prices = `
    <section class="section" id="prices">
      <h2 class="title">Цены</h2>
      <p class="sub">${esc(S.pricesNote)}</p>
      <div class="tabs" role="tablist" aria-label="Категории услуг">${tabs}</div>
      <div id="panel" role="tabpanel" aria-labelledby="tab-0"><ul class="price-list">${priceRows(S.prices[0])}</ul></div>
    </section>`;

  const studio = S.studio && S.studio.length ? `
    <section class="studio" id="studio" aria-roledescription="карусель" aria-label="Фото студии">
      <div class="studio-head">
        <h2 class="title">Студия</h2>
        <p class="sub on-dark">Фото из карточки ${esc(S.rating.source)}.</p>
      </div>
      <div class="stage" tabindex="0" aria-label="Фото студии, стрелки влево и вправо листают">
        ${S.studio.map((p, i) => `<figure class="slide${i === 0 ? " is-on" : ""}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" width="900" height="1200"${i < 2 ? "" : ' loading="lazy"'}${p.position ? ` style="object-position:${esc(p.position)}"` : ""}><figcaption>${esc(p.alt)}</figcaption></figure>`).join("")}
        <div class="bars" aria-hidden="true">${S.studio.map(() => "<span><i></i></span>").join("")}</div>
        <button type="button" class="tap tap-prev" aria-label="Предыдущее фото"><span>‹</span></button>
        <button type="button" class="tap tap-next" aria-label="Следующее фото"><span>›</span></button>
        <button type="button" class="pause" aria-pressed="false" aria-label="Пауза"><i></i></button>
      </div>
    </section>` : "";

  const lounge = S.lounge ? `
    <section class="lounge">
      <img src="${esc(S.lounge.photo.src)}" alt="${esc(S.lounge.photo.alt)}" width="900" height="1200" loading="lazy">
      <div class="lounge-body">
        <h2 class="title">${esc(S.lounge.title)}</h2>
        <p class="sub">${esc(S.lounge.text)}</p>
      </div>
    </section>` : "";

  const reviews = `
    <section class="section" id="reviews">
      <div class="score">
        <span class="score-num">${esc(S.rating.value)}</span>
        <div><span class="stars stars-lg">${icons.star.repeat(5)}</span><p class="sub">${esc(S.rating.count)} в ${esc(S.rating.source)}</p></div>
      </div>
      ${S.reviewsStyle === "chat" ? `
      <div class="chat">${S.reviews.map((r, i) => `<figure class="bubble${i % 2 ? " is-right" : ""}"><figcaption><span class="ava" aria-hidden="true">${esc(r.author.trim().charAt(0))}</span>${esc(r.author)}</figcaption><blockquote>${esc(r.text)}</blockquote></figure>`).join("")}</div>` : S.reviewsStyle === "stickers" ? `
      <div class="stickers">${S.reviews.map((r, i) => `<figure class="sticker" style="--r:${[-2, 1.5, -1, 2, -1.5][i % 5]}deg"><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.author)}</figcaption></figure>`).join("")}</div>` : `
      <div class="rail rail-light">${S.reviews.map((r) => `<figure class="review"><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.author)}</figcaption></figure>`).join("")}</div>`}
      <a class="link" href="${esc(S.rating.url)}" target="_blank" rel="noopener">Все отзывы в ${esc(S.rating.source)}</a>
    </section>`;

  const contacts = `
    <section class="section section-tint" id="contacts">
      <h2 class="title">Как добраться</h2>
      <div class="contacts">
        <div class="map"><iframe src="${mapSrc}" title="Карта: ${esc(S.address)}" loading="lazy" allowfullscreen></iframe></div>
        <div>
          <div class="c-row"><span class="c-label">Адрес</span><p class="c-main">${esc(street)}</p><p class="c-muted">${esc(S.addressNote)}</p></div>
          <div class="c-row"><span class="c-label">Телефон</span>${S.phones.map((p) => `<a class="c-main" href="tel:${esc(p.tel)}">${esc(p.label)}</a>`).join("")}
            ${S.messengers && S.messengers.length ? `<div class="c-pills">${S.messengers.map((m) => `<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.label)}</a>`).join("")}</div>` : ""}</div>
          <div class="c-row"><span class="c-label">Часы</span>${S.hours.map(([d, t]) => `<p class="c-hours"><span>${esc(d)}</span><span>${esc(t)}</span></p>`).join("")}
            ${S.payment ? `<p class="c-muted">Оплата: ${esc(S.payment.charAt(0).toLowerCase() + S.payment.slice(1))}</p>` : ""}</div>
          <div class="c-actions">
            <a class="btn btn-dark" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
            <a class="btn btn-line" href="${routeHref}" target="_blank" rel="noopener">Маршрут</a>
          </div>
        </div>
      </div>
    </section>`;

  const footer = `
    <footer class="footer">
      <p class="footer-name">${esc(S.name)}</p>
      <p>${esc(S.kind)}, ${esc(S.address)}</p>
      <p class="footer-note">${esc(S.demoNote)}</p>
    </footer>`;

  const dock = `
    <div class="dock">
      <a class="btn btn-glass" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
      <a class="btn btn-accent" href="#booking">Записаться</a>
    </div>`;

  const blocks = { studio, phases, booking, prices, lounge, reviews, contacts };
  const order = S.sections || ["studio", "phases", "booking", "prices", "lounge", "reviews", "contacts"];
  app.innerHTML = nav + "<main>" + hero + facts + order.map((k) => blocks[k] || "").join("") + "</main>" + footer + dock;
  if (S.variant) document.body.classList.add("v-" + S.variant);

  const nameEl = app.querySelector(".hero-name");
  const fitName = () => {
    if (!nameEl) return;
    nameEl.style.fontSize = "";
    const box = nameEl.parentElement;
    const cs = getComputedStyle(box);
    const room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const max = parseFloat(getComputedStyle(nameEl).fontSize);
    if (nameEl.scrollWidth > room) nameEl.style.fontSize = Math.max(28, Math.floor(max * room / nameEl.scrollWidth)) + "px";
  };
  fitName();
  if (document.fonts) document.fonts.ready.then(fitName);
  window.addEventListener("resize", fitName);
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-ready")));

  const hexSvg = app.querySelector(".lines.is-hex");
  if (hexSvg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const cells = [...hexSvg.querySelectorAll("path")].map((el) => { const b = el.getBBox(); return { el, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    const heroEl = app.querySelector(".hero");
    let raf = 0, px = -999, py = -999;
    const paint = () => {
      raf = 0;
      cells.forEach((c) => {
        const d = Math.hypot(c.x - px, c.y - py);
        c.el.style.setProperty("--lit", Math.max(0, 1 - d / 90).toFixed(2));
      });
    };
    const move = (e) => {
      const m = hexSvg.getScreenCTM();
      if (!m) return;
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      px = pt.x; py = pt.y;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    heroEl.addEventListener("pointermove", move, { passive: true });
    heroEl.addEventListener("pointerdown", move, { passive: true });
    heroEl.addEventListener("pointerleave", () => { px = py = -999; if (!raf) raf = requestAnimationFrame(paint); });
  }

  const slideEls = [...app.querySelectorAll(".studio .slide")];
  const barEls = [...app.querySelectorAll(".studio .bars i")];
  if (slideEls.length > 1) {
    const DUR = 4500;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cur = 0, start = performance.now(), paused = false, pausedAt = 0;
    const show = (n) => {
      cur = (n + slideEls.length) % slideEls.length;
      slideEls.forEach((el, i) => el.classList.toggle("is-on", i === cur));
      barEls.forEach((b, i) => { b.style.transform = "scaleX(" + (i < cur ? 1 : 0) + ")"; });
      start = performance.now();
    };
    const tick = (t) => {
      if (!paused && !still) {
        const k = Math.min(1, (t - start) / DUR);
        barEls[cur].style.transform = "scaleX(" + k + ")";
        if (k >= 1) show(cur + 1);
      }
      requestAnimationFrame(tick);
    };
    const stage = app.querySelector(".stage");
    const pauseBtn = app.querySelector(".pause");
    let held = false, offscreen = false, manual = false;
    const setPaused = () => {
      const p = held || offscreen || manual || document.hidden;
      if (p && !paused) { paused = true; pausedAt = performance.now(); }
      else if (!p && paused) { paused = false; start += performance.now() - pausedAt; }
      pauseBtn.setAttribute("aria-pressed", String(manual));
      pauseBtn.setAttribute("aria-label", manual ? "Продолжить показ" : "Пауза");
    };
    pauseBtn.addEventListener("click", () => { manual = !manual; setPaused(); });
    stage.addEventListener("pointerdown", (e) => { if (!e.target.closest(".pause")) { held = true; setPaused(); } });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => stage.addEventListener(ev, () => { held = false; setPaused(); }));
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
    });
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => { offscreen = !es[0].isIntersecting; setPaused(); }).observe(stage);
    app.querySelector(".tap-prev").addEventListener("click", () => show(cur - 1));
    app.querySelector(".tap-next").addEventListener("click", () => show(cur + 1));
    document.addEventListener("visibilitychange", setPaused);
    show(0);
    if (still) barEls[0].style.transform = "scaleX(1)";
    requestAnimationFrame(tick);
  }

  const navEl = app.querySelector(".nav");
  const menuBtn = app.querySelector(".nav-menu");
  const menu = app.querySelector("#menu");
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Закрыть" : "Меню";
    document.body.classList.toggle("menu-open", open);
    navEl.classList.toggle("is-solid", open || window.scrollY > 40);
  };
  menuBtn.addEventListener("click", () => { setMenu(menu.hidden); if (!menu.hidden) menu.querySelector("a").focus(); });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  const dockEl = app.querySelector(".dock");
  const onScroll = () => {
    navEl.classList.toggle("is-solid", !menu.hidden || window.scrollY > 40);
    dockEl.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.7);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if ("IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      dockEl.classList.toggle("is-away", seen.size > 0);
    }, { threshold: 0.2 });
    ["#booking", "#contacts"].forEach((s) => io.observe(app.querySelector(s)));
  }

  const bubbles = [...app.querySelectorAll(".bubble")];
  if (bubbles.length) {
    if ("IntersectionObserver" in window) {
      const bo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-seen"); bo.unobserve(e.target); } }), { threshold: 0.3 });
      bubbles.forEach((b) => bo.observe(b));
    } else bubbles.forEach((b) => b.classList.add("is-seen"));
  }

  const tabEls = [...app.querySelectorAll(".tab")];
  const panel = app.querySelector("#panel");
  const selectTab = (i, focus) => {
    tabEls.forEach((t, j) => { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    panel.setAttribute("aria-labelledby", "tab-" + i);
    panel.querySelector(".price-list").innerHTML = priceRows(S.prices[i]);
    if (focus) tabEls[i].focus();
  };
  tabEls.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(i));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") selectTab((i + 1) % tabEls.length, true);
      if (e.key === "ArrowLeft") selectTab((i - 1 + tabEls.length) % tabEls.length, true);
    });
  });

  const form = app.querySelector(".booking");
  const totalEl = form.querySelector(".total-sum");
  const picked = () => [...form.querySelectorAll('.chip[aria-pressed="true"]')].map((c) => services[+c.dataset.i]);
  const updateTotal = () => {
    const list = picked();
    const sum = list.reduce((acc, x) => acc + (x.from || 0), 0);
    totalEl.textContent = sum ? "Ориентир: от " + rub(sum) + (list.some((x) => !x.from) ? " и осмотр" : "") : list.length ? "Цену назовут после осмотра" : "";
  };
  app.querySelectorAll("[data-pick]").forEach((a) => a.addEventListener("click", () => {
    const chip = [...form.querySelectorAll(".chip")].find((c) => c.querySelector("span").textContent === a.dataset.pick);
    if (chip && chip.getAttribute("aria-pressed") !== "true") { chip.setAttribute("aria-pressed", "true"); updateTotal(); }
  }));
  form.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true"));
    updateTotal();
  }));
  const radio = (els) => els.forEach((d) => d.addEventListener("click", () => els.forEach((x) => x.setAttribute("aria-checked", String(x === d)))));
  radio([...form.querySelectorAll(".day")]);
  radio([...form.querySelectorAll('.seg-btn[data-group="way"]')]);
  const val = (g) => { const el = form.querySelector('.seg-btn[data-group="' + g + '"][aria-checked="true"]'); return el ? el.textContent : ""; };

  const phoneInput = form.querySelector('input[name="phone"]');
  const digitsOf = (v) => { v = v.trim(); let d; if (v.startsWith("+7")) d = v.slice(2).replace(/\D/g, ""); else { d = v.replace(/\D/g, ""); if (d[0] === "8" || d[0] === "7") d = d.slice(1); } return d.slice(0, 10); };
  const fmt = (d) => {
    if (!d) return "";
    let out = "+7 " + d.slice(0, 3);
    if (d.length > 3) out += " " + d.slice(3, 6);
    if (d.length > 6) out += "-" + d.slice(6, 8);
    if (d.length > 8) out += "-" + d.slice(8, 10);
    return out;
  };
  phoneInput.addEventListener("input", () => {
    const d = digitsOf(phoneInput.value);
    phoneInput.value = d ? fmt(d) : /\d/.test(phoneInput.value) ? "+7 " : "";
    if (digitsOf(phoneInput.value).length === 10) form.classList.remove("is-invalid");
  });
  phoneInput.addEventListener("blur", () => {
    const n = digitsOf(phoneInput.value).length;
    form.classList.toggle("is-invalid", n > 0 && n < 10);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (digitsOf(phoneInput.value).length < 10) {
      form.classList.add("is-invalid");
      phoneInput.focus();
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.textContent = "Отправляем";
    const list = picked().map((x) => x.name);
    const dayEl = form.querySelector('.day[aria-checked="true"]');
    const when = dayEl ? dayEl.querySelector("b").textContent + ", " + dayEl.querySelector("span").textContent : "";
    const way = val("way") || "Звонок";
    const lead = [
      ["Услуги", list.length ? list.join(", ") : "уточнить"],
      ["Когда", when || "уточнить"],
      ["Телефон", phoneInput.value],
      ["Связаться", way]
    ];
    if (totalEl.textContent) lead.push(["Ориентир", totalEl.textContent.replace(/^Ориентир: /, "")]);
    const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    setTimeout(() => {
      form.innerHTML = `
        <div class="done" role="status" tabindex="-1">
          <div class="done-mark">${icons.check}</div>
          <h2 class="title">Заявка принята</h2>
          <p class="sub on-dark">${way === "Звонок" ? "Перезвоним" : "Напишем в " + esc(way)} на ${esc(phoneInput.value)} и подтвердим время.</p>
          <div class="tg">
            <p class="tg-label">Так заявка придёт владельцу в Telegram</p>
            <div class="tg-chat">
              <div class="tg-bubble">
                <b>Новая заявка с сайта</b>
                ${lead.map(([k, v]) => `<p><span>${esc(k)}:</span> ${esc(v)}</p>`).join("")}
                <time>${esc(time)}</time>
              </div>
            </div>
          </div>
          <p class="done-demo">Это демо, заявка никуда не ушла. На рабочем сайте она придёт сразу.</p>
        </div>`;
      form.querySelector(".done").focus();
    }, 700);
  });
})();
