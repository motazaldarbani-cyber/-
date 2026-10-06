import { db } from "./firebase-config.js";
import { collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { el, videoEl } from "./utils.js";

const $ = s => document.querySelector(s);
const empty = (box, msg) => box.replaceChildren(el("p", "empty", msg));

function storyCard(d) {
  const a = el("a", "card"); a.href = `story.html?id=${d.id}`;
  const im = el("div", "card-image");
  if (d.imageUrl) { const i = el("img"); i.src = d.imageUrl; i.alt = d.title; i.loading = "lazy"; im.append(i); }
  const c = el("div", "card-content");
  c.append(el("h3", "", d.title), el("p", "", d.summary || ""), el("span", "read-more", "اقرأ الحكاية"));
  a.append(im, c); return a;
}
function videoCard(d) {
  const w = el("div", "card");
  const box = el("div", "video-box"); box.append(videoEl(d.videoUrl));
  const c = el("div", "card-content"); c.append(el("h3", "", d.title));
  w.append(box, c); return w;
}
function photoCard(d, open) {
  const b = el("button", "photo"); b.type = "button"; b.setAttribute("aria-label", d.title || "صورة");
  const i = el("img"); i.src = d.imageUrl; i.alt = d.title || ""; i.loading = "lazy";
  b.append(i); b.onclick = () => open(d); return b;
}
function lightbox() {
  const box = el("div", "lightbox"); box.hidden = true;
  const img = el("img"), cap = el("p");
  box.append(img, cap);
  box.onclick = () => (box.hidden = true);
  document.addEventListener("keydown", e => e.key === "Escape" && (box.hidden = true));
  document.body.append(box);
  return d => { img.src = d.imageUrl; cap.textContent = d.title || ""; box.hidden = false; };
}

const open = lightbox();
const sBox = $("#stories-grid"), vBox = $("#videos-grid"), pBox = $("#photos-grid");
onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(60)), snap => {
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const fill = (box, type, fn, msg) => {
    const arr = all.filter(x => x.type === type);
    arr.length ? box.replaceChildren(...arr.map(fn)) : empty(box, msg);
  };
  fill(sBox, "story", storyCard, "لسا ما في حكايات. ارجع قريب.");
  fill(vBox, "video", videoCard, "لسا ما في فيديوهات.");
  fill(pBox, "photo", x => photoCard(x, open), "لسا ما في صور.");
}, e => { console.error(e); [sBox, vBox, pBox].forEach(b => empty(b, "تعذر تحميل المحتوى.")); });
