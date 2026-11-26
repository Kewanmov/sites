(function () {
  const S = window.SITE;
  const app = document.getElementById("app");

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const icons = {
    star: '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M12.3 14.3l-1.1-4.9L15 6.1l-5-.5L8 1 6 5.6l-5 .5 3.8 3.3-1.1 4.9L8 11.7z"/></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.5V8l2.4 1.6"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 14.5s4.8-4.3 4.8-8a4.8 4.8 0 10-9.6 0c0 3.7 4.8 8 4.8 8z"/><circle cx="8" cy="6.5" r="1.7"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3.2 1.8h2.4l1.2 3-1.6 1a8.4 8.4 0 004 4l1-1.6 3 1.2v2.4a1.4 1.4 0 01-1.5 1.4A12.4 12.4 0 011.8 3.3a1.4 1.4 0 011.4-1.5z"/></svg>',
    check: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  const mainPhone = S.phones[0];
  const pricesTitle = S.pricesTitle || "Цены";
  const hasAnyPrice = S.prices.some((g) => g.items.some((it) => it[1]));
  const mapSrc = "https://yandex.ru/map-widget/v1/?text=" + encodeURIComponent(S.mapQuery) + "&z=16";
  const routeHref = "https://yandex.ru/maps/?rtext=~" + encodeURIComponent(S.mapQuery);

  const nav = `
    <header class="nav">
      <div class="container nav-inner">
        <a class="brand" href="#top">${esc(S.name)}</a>
        <nav class="nav-links" aria-label="Разделы">
          <a href="#prices">${esc(pricesTitle)}</a>
          <a href="#reviews">Отзывы</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <a class="nav-phone" href="tel:${esc(mainPhone.tel)}">${esc(mainPhone.label)}</a>
        <a class="btn btn-primary" href="tel:${esc(mainPhone.tel)}">Позвонить</a>
      </div>
    </header>`;

  const chips = S.problems.map((p) => `<button type="button" class="chip" aria-pressed="false">${esc(p)}</button>`).join("");

  const hero = `
    <section class="hero" id="top">
      <div class="container hero-grid">
        <div class="hero-copy">
          <h1>${esc(S.headline)}</h1>
          <p class="hero-lead">${esc(S.lead)}</p>
          <ul class="hero-facts">
            <li><a class="fact" href="${esc(S.rating.url)}" target="_blank" rel="noopener">${icons.star}${esc(S.rating.value)} в ${esc(S.rating.source)}, ${esc(S.rating.count)}</a></li>
            <li><span class="fact">${icons.clock}${esc(S.hoursShort)}</span></li>
            <li><a class="fact" href="#contacts">${icons.pin}${esc(S.address.replace(/^Томск,\s*/, ""))}</a></li>
          </ul>
          ${S.heroPhoto ? `<img class="hero-photo" src="${esc(S.heroPhoto.src)}" alt="${esc(S.heroPhoto.alt)}" width="1280" height="960" fetchpriority="high"${S.heroPhoto.position ? ` style="object-position:${esc(S.heroPhoto.position)}"` : ""}>` : ""}
        </div>
        <div class="request" id="request">
          <form class="request-inner" novalidate>
            <h2>Что с машиной?</h2>
            <p class="request-sub">Выберите, что подходит, и оставьте телефон. Перезвоним, назовём цену и время.</p>
            <fieldset class="chips">
              <legend>Проблема</legend>
              ${chips}
            </fieldset>
            <div class="fields">
              <label class="field">
                <span class="field-label">Марка и модель</span>
                <input name="car" autocomplete="off" placeholder="Например, Toyota Camry 2015">
              </label>
              <label class="field">
                <span class="field-label">Подробнее, если нужно</span>
                <textarea name="details" rows="2" placeholder="Стучит справа на кочках"></textarea>
              </label>
              <label class="field" data-field="phone">
                <span class="field-label">Телефон</span>
                <input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required>
                <span class="field-error">Введите номер, чтобы мы могли перезвонить</span>
              </label>
            </div>
            <button type="submit" class="submit">Отправить заявку</button>
            <p class="request-fine">Перезваниваем в рабочее время: ${esc(S.hoursShort.toLowerCase())}</p>
          </form>
        </div>
      </div>
    </section>`;

  const tabs = S.prices.map((g, i) => `<button type="button" class="tab" role="tab" id="tab-${i}" aria-controls="panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(g.group)}</button>`).join("");

  const priceRows = (g) => g.items.map(([n, v]) => {
    if (!v) return `<li class="price-row"><span class="price-name">${esc(n)}</span></li>`;
    const free = /бесплатно/i.test(v);
    return `<li class="price-row"><span class="price-name">${esc(n)}</span><span class="price-value${free ? " is-free" : ""}">${esc(v)}</span></li>`;
  }).join("");

  const prices = `
    <section class="section" id="prices">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>${esc(pricesTitle)}</h2>
            <p class="section-sub">${esc(S.pricesNote)}</p>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="Категории услуг">${tabs}</div>
        <div class="price-panel" id="panel" role="tabpanel" aria-labelledby="tab-0">
          <ul class="price-list">${priceRows(S.prices[0])}</ul>
        </div>
        <div class="price-cta">
          <p>${hasAnyPrice ? "Не нашли свою поломку в списке? Опишите её в заявке, и мастер скажет, сколько это будет стоить." : "Опишите проблему в заявке, и мастер перезвонит, чтобы назвать цену и время."}</p>
          <a class="btn btn-primary" href="#request">Оставить заявку</a>
        </div>
      </div>
    </section>`;

  const gallery = S.gallery && S.gallery.length ? `
    <section class="section section-tight" id="gallery">
      <div class="container">
        <h2>${esc(S.galleryTitle)}</h2>
        <p class="section-sub">${esc(S.gallerySub)}</p>
        <div class="gallery" style="--cols:${S.gallery.length}${S.galleryAspect ? ";--aspect:" + esc(S.galleryAspect) : ""}">
          ${S.gallery.map((p) => `<img src="${esc(p.src)}" alt="${esc(p.alt)}" width="1050" height="1400" loading="lazy"${p.position ? ` style="object-position:${esc(p.position)}"` : ""}>`).join("")}
        </div>
      </div>
    </section>` : "";

  const reviews = `
    <section class="section band on-dark" id="reviews">
      <div class="container">
        <h2>Что пишут клиенты</h2>
        <p class="section-sub">${esc(S.rating.value)} из 5 по ${esc(S.rating.count)} в ${esc(S.rating.source)}.${S.badge ? " " + esc(S.badge) + "." : ""}</p>
        <div class="reviews">
          ${S.reviews.map((r) => `<figure class="review"><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.author)}, отзыв в ${esc(S.rating.source)}</figcaption></figure>`).join("")}
        </div>
        <p style="margin-top:32px"><a class="band-link" href="${esc(S.rating.url)}" target="_blank" rel="noopener">Все отзывы в ${esc(S.rating.source)}</a></p>
      </div>
    </section>`;

  const contacts = `
    <section class="section" id="contacts">
      <div class="container">
        <h2>Как добраться</h2>
        <div class="contacts-grid">
          <div class="map"><iframe src="${mapSrc}" title="Карта: ${esc(S.address)}" loading="lazy" allowfullscreen></iframe></div>
          <div class="contact-card">
            <div class="contact-block">
              <h3>${esc(S.address)}</h3>
              ${S.addressNote ? `<p class="contact-muted">${esc(S.addressNote)}</p>` : ""}
              ${(S.branches || []).map((b) => `<p class="contact-muted" style="margin-top:6px">${esc(b)}</p>`).join("")}
            </div>
            <div class="contact-block">
              ${S.phones.map((p) => `<a class="phone-link" href="tel:${esc(p.tel)}">${esc(p.label)}</a>`).join("")}
              ${S.email ? `<p class="contact-muted" style="margin-top:4px">${esc(S.email)}</p>` : ""}
              ${S.messengers && S.messengers.length ? `<div class="messengers">${S.messengers.map((m) => `<a class="fact" href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.label)}</a>`).join("")}</div>` : ""}
            </div>
            <div class="contact-block">
              <table class="hours"><tbody>${S.hours.map(([d, t]) => `<tr><td>${esc(d)}</td><td>${esc(t)}</td></tr>`).join("")}</tbody></table>
              ${S.payment ? `<p class="contact-muted" style="margin-top:8px">Оплата: ${esc(S.payment.charAt(0).toLowerCase() + S.payment.slice(1))}</p>` : ""}
            </div>
            <div class="contact-actions">
              <a class="btn btn-primary" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
              <a class="btn btn-secondary" href="${routeHref}" target="_blank" rel="noopener">Построить маршрут</a>
            </div>
          </div>
        </div>
      </div>
    </section>`;

  const footer = `
    <footer class="footer on-dark">
      <div class="container footer-inner">
        <div>
          <a class="brand" href="#top">${esc(S.name)}</a>
          <p class="footer-meta" style="margin-top:4px">${esc(S.kind)}, ${esc(S.address)}</p>
        </div>
        <div class="footer-meta">
          <p><a href="tel:${esc(mainPhone.tel)}">${esc(mainPhone.label)}</a></p>
          <p>${esc(S.demoNote)}</p>
        </div>
      </div>
    </footer>`;

  const dock = `
    <div class="dock">
      <a class="btn btn-subtle" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить</a>
      <a class="btn btn-primary" href="#request">Заявка</a>
    </div>`;

  app.innerHTML = nav + "<main>" + hero + prices + gallery + reviews + contacts + "</main>" + footer + dock;

  const tabEls = [...app.querySelectorAll(".tab")];
  const panel = app.querySelector("#panel");
  const selectTab = (i, focus) => {
    tabEls.forEach((t, j) => {
      t.setAttribute("aria-selected", String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
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

  app.querySelectorAll(".chip").forEach((c) => {
    c.addEventListener("click", () => c.setAttribute("aria-pressed", String(c.getAttribute("aria-pressed") !== "true")));
  });

  const form = app.querySelector(".request form");
  const phoneField = form.querySelector('[data-field="phone"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  phoneInput.addEventListener("input", () => phoneField.classList.remove("is-invalid"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const digits = phoneInput.value.replace(/\D/g, "");
    if (digits.length < 10) {
      phoneField.classList.add("is-invalid");
      phoneInput.focus();
      return;
    }
    const picked = [...form.querySelectorAll('.chip[aria-pressed="true"]')].map((c) => c.textContent);
    const lead = {
      problems: picked,
      car: form.car.value.trim(),
      details: form.details.value.trim(),
      phone: phoneInput.value.trim()
    };
    const box = app.querySelector(".request");
    box.innerHTML = `
      <div class="request-done" role="status" tabindex="-1">
        <div class="done-mark">${icons.check}</div>
        <h2>Заявка отправлена</h2>
        <p>Перезвоним на ${esc(lead.phone)} в рабочее время${lead.problems.length ? ": " + esc(lead.problems.join(", ").toLowerCase()) : ""}.</p>
        <div class="demo-note">Это демо. На рабочем сайте заявка сразу придёт владельцу в Telegram.</div>
        <a class="btn btn-subtle" href="tel:${esc(mainPhone.tel)}">${icons.phone}Позвонить сейчас</a>
      </div>`;
    box.querySelector(".request-done").focus();
  });
})();
