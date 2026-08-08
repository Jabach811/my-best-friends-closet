const header = document.querySelector(".site-header");
const setHeaderH = () =>
  document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
setHeaderH();
addEventListener("resize", setHeaderH);

/* Open / closed line under the address. Hours are Pacific, where the shop is. */
const HOURS = {
  0: [10, 14],
  2: [10, 18],
  3: [10, 18],
  4: [10, 17.5],
  5: [10, 18],
  6: [10, 16.5],
};
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const clock = (h) => {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const suffix = hr >= 12 ? "pm" : "am";
  const twelve = hr % 12 === 0 ? 12 : hr % 12;
  return min ? `${twelve}:${String(min).padStart(2, "0")}${suffix}` : `${twelve}${suffix}`;
};

const openNow = document.getElementById("open-now");
if (openNow) {
  const shopTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const day = shopTime.getDay();
  const now = shopTime.getHours() + shopTime.getMinutes() / 60;
  const today = HOURS[day];

  if (today && now >= today[0] && now < today[1]) {
    openNow.dataset.state = "open";
    openNow.textContent = `Open now · until ${clock(today[1])}`;
  } else {
    let step = today && now < today[0] ? 0 : 1;
    let next = (day + step) % 7;
    while (!HOURS[next]) next = (next + 1) % 7;
    const when = step === 0 ? "today" : next === (day + 1) % 7 ? "tomorrow" : DAY_NAMES[next];
    openNow.dataset.state = "closed";
    openNow.textContent = `Closed now · opens ${when} at ${clock(HOURS[next][0])}`;
  }

  document.querySelectorAll("#hours div").forEach((row) => {
    if (row.dataset.day.split(" ").includes(String(day))) row.classList.add("is-today");
  });
}

/* Back to top, once you are a couple of screens down. */
const toTop = document.querySelector(".to-top");
if (toTop) {
  const toggle = () => toTop.classList.toggle("is-shown", scrollY > innerHeight * 2);
  toggle();
  addEventListener("scroll", toggle, { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
}
