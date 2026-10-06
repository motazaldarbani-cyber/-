import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { el, fmtDate, videoEl } from "./utils.js";

const root = document.querySelector("#story");
const id = new URLSearchParams(location.search).get("id");
const fail = t => root.replaceChildren(el("p", "empty", t));
(async () => {
  if (!id) return fail("الحكاية غير موجودة.");
  try {
    const s = await getDoc(doc(db, "posts", id));
    if (!s.exists()) return fail("الحكاية غير موجودة.");
    const d = s.data();
    document.title = `${d.title} | حكايات المخيم`;
    const nodes = [el("h1", "", d.title), el("p", "date", fmtDate(d.createdAt))];
    if (d.imageUrl) { const i = el("img", "story-cover"); i.src = d.imageUrl; i.alt = d.title; nodes.push(i); }
    (d.body || d.summary || "").split(/\n+/).filter(Boolean).forEach(t => nodes.push(el("p", "story-text", t)));
    if (d.videoUrl) { const b = el("div", "video-box"); b.append(videoEl(d.videoUrl)); nodes.push(b); }
    root.replaceChildren(...nodes);
  } catch (e) { fail("تعذر تحميل الحكاية."); }
})();
