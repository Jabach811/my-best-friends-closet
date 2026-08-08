const grid = document.getElementById("grid");
const cards = [...grid.children];
const pills = [...document.querySelectorAll(".pill")];
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const count = document.getElementById("count");
const empty = document.getElementById("empty");

const state = { group: "*", q: "", sort: "new" };

const readUrl = () => {
  const p = new URLSearchParams(location.search);
  state.group = p.get("category") || "*";
  state.q = p.get("q") || "";
  state.sort = p.get("sort") || "new";
  if (!pills.some((b) => b.dataset.filter === state.group)) state.group = "*";
  search.value = state.q;
  sort.value = state.sort;
  pills.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === state.group));
};

const writeUrl = (replace) => {
  const p = new URLSearchParams();
  if (state.group !== "*") p.set("category", state.group);
  if (state.q) p.set("q", state.q);
  if (state.sort !== "new") p.set("sort", state.sort);
  const url = p.toString() ? `?${p}` : location.pathname;
  history[replace ? "replaceState" : "pushState"]({}, "", url);
};

const COMPARE = {
  new: (a, b) => a.dataset.index - b.dataset.index,
  low: (a, b) => a.dataset.price - b.dataset.price,
  high: (a, b) => b.dataset.price - a.dataset.price,
  az: (a, b) => a.dataset.name.localeCompare(b.dataset.name),
};

const render = () => {
  const q = state.q.trim().toLowerCase();
  let shown = 0;

  cards.forEach((c) => {
    const hit =
      (state.group === "*" || c.dataset.group === state.group) &&
      (!q || c.dataset.name.includes(q));
    c.hidden = !hit;
    if (hit) shown++;
  });

  [...cards].sort(COMPARE[state.sort]).forEach((c) => grid.append(c));

  count.textContent = shown;
  empty.hidden = shown > 0;
};

pills.forEach((b) =>
  b.addEventListener("click", () => {
    pills.forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    state.group = b.dataset.filter;
    writeUrl();
    render();
  })
);

let typing;
search.addEventListener("input", () => {
  clearTimeout(typing);
  typing = setTimeout(() => {
    state.q = search.value;
    writeUrl(true);
    render();
  }, 150);
});

sort.addEventListener("change", () => {
  state.sort = sort.value;
  writeUrl();
  render();
});

addEventListener("popstate", () => {
  readUrl();
  render();
});

readUrl();
render();
