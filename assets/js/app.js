(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const categories = {
    smartphones: { title: "Smartphones", detail: "Apple, Samsung et autres références", code: "CT—01" },
    ordinateurs: { title: "Ordinateurs", detail: "MacBook, ASUS, Lenovo, Dell & HP", code: "CT—02" },
    tablettes: { title: "Tablettes", detail: "iPad, Galaxy Tab & autres références", code: "CT—03" },
    audio: { title: "Audio & écoute", detail: "Équipements et accessoires audio", code: "CT—04" },
    accessoires: { title: "Accessoires", detail: "Périphériques, stockage et accessoires", code: "CT—05" }
  };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let cart = read("ctrltech-cart");
  let compare = read("ctrltech-compare");
  let toastTimer;
  const toast = (message) => {
    const node = $("#toast"); node.textContent = message; node.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2600);
  };
  const updateCounts = () => {
    $("#cart-count").textContent = cart.length;
    $("#compare-count").textContent = compare.length;
    $("#drawer-count").textContent = "(" + cart.length + ")";
  };
  const renderCart = () => {
    const target = $("#cart-items");
    if (!cart.length) {
      target.innerHTML = '<div class="empty-cart"><span>＋</span><h3>Votre sélection commence ici.</h3><p>Ajoutez une gamme à votre sélection pour préparer votre demande.</p><button class="button button-dark" data-close-cart type="button">Explorer les collections ↗</button></div>';
    } else {
      target.innerHTML = cart.map((item, index) => '<div class="cart-line"><div class="cart-line-visual">CT</div><div><h4>' + item.title + '</h4><p>' + item.detail + '</p><p>Prix et disponibilité à confirmer</p></div><button type="button" data-remove-cart="' + index + '">Retirer</button></div>').join("");
    }
    updateCounts();
  };
  const openCart = () => { renderCart(); $("#cart-drawer").classList.add("open"); $("#drawer-backdrop").classList.add("open"); $("#cart-drawer").setAttribute("aria-hidden", "false"); document.body.classList.add("locked"); };
  const closeCart = () => { $("#cart-drawer").classList.remove("open"); $("#drawer-backdrop").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); };
  const openSearch = () => { $("#search-overlay").classList.add("open"); $("#search-overlay").setAttribute("aria-hidden", "false"); document.body.classList.add("locked"); setTimeout(() => $("#site-search").focus(), 100); };
  const closeSearch = () => { $("#search-overlay").classList.remove("open"); $("#search-overlay").setAttribute("aria-hidden", "true"); document.body.classList.remove("locked"); };
  const filter = (term) => {
    const normalized = term.trim().toLocaleLowerCase("fr");
    let visible = 0;
    $$("[data-product-card]").forEach(card => {
      const text = (card.textContent + " " + card.dataset.category).toLocaleLowerCase("fr");
      const show = !normalized || text.includes(normalized) || (categories[card.dataset.category]?.title.toLocaleLowerCase("fr").includes(normalized));
      card.classList.toggle("is-hidden", !show); if (show) visible++;
    });
    $("#search-results").textContent = normalized ? (visible ? visible + " gamme(s) correspondante(s) dans la sélection affichée." : "Aucune gamme ne correspond à cette recherche.") : "";
  };
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-open-cart]")) openCart();
    if (target.matches("[data-close-cart]")) closeCart();
    if (target.matches("[data-open-search]")) openSearch();
    if (target.matches("[data-close-search]")) closeSearch();
    if (target.matches("[data-menu-toggle]")) {
      const menu = $("#mobile-nav"); const isOpen = menu.classList.toggle("open");
      target.setAttribute("aria-expanded", String(isOpen));
    }
    if (target.matches(".mobile-nav a")) { $("#mobile-nav").classList.remove("open"); $("[data-menu-toggle]").setAttribute("aria-expanded", "false"); }
    if (target.matches("[data-filter]")) {
      const key = target.dataset.filter;
      $$(".filter-tab").forEach(tab => tab.classList.toggle("active", tab === target));
      $$("[data-product-card]").forEach(card => card.classList.toggle("is-hidden", key !== "all" && card.dataset.category !== key));
    }
    if (target.matches("[data-category]")) {
      const key = target.dataset.category;
      $$(".filter-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.filter === key));
      $$("[data-product-card]").forEach(card => card.classList.toggle("is-hidden", card.dataset.category !== key));
    }
    if (target.matches("[data-product-open]")) {
      const key = target.dataset.productOpen; const item = categories[key];
      if (item && !cart.some(entry => entry.key === key)) { cart.push({ key, title: item.title, detail: item.detail }); write("ctrltech-cart", cart); renderCart(); toast(item.title + " ajouté à votre sélection."); }
      else toast("Cette gamme est déjà dans votre sélection.");
      openCart();
    }
    if (target.matches("[data-remove-cart]")) {
      cart.splice(Number(target.dataset.removeCart), 1); write("ctrltech-cart", cart); renderCart();
    }
    if (target.matches("[data-search-term]")) {
      $("#site-search").value = target.dataset.searchTerm; filter(target.dataset.searchTerm);
    }
    if (target.matches('a[href^="#"]') && target.getAttribute("href") !== "#") {
      const dest = $(target.getAttribute("href"));
      if (dest && target.closest(".search-overlay")) closeSearch();
    }
  });
  $("#site-search").addEventListener("input", event => filter(event.target.value));
  $("#search-overlay").addEventListener("click", event => { if (event.target === $("#search-overlay")) closeSearch(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeSearch(); closeCart(); $("#mobile-nav").classList.remove("open"); $("[data-menu-toggle]").setAttribute("aria-expanded", "false"); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); }
  });
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) $$(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
    }), { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => observer.observe(section));
  }
  $("#year").textContent = new Date().getFullYear();
  updateCounts();
})();