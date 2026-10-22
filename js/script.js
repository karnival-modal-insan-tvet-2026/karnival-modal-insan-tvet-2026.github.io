/* =========================
   MOD PRATONTON (untuk semak paparan mengikut tarikh & masa)
   Tambah ?masa=2026-10-24T11:30 pada alamat laman (waktu Malaysia).
   Contoh: https://karnival-modal-insan-tvet-2026.github.io/?masa=2026-10-24T11:30
========================= */
(function () {
    var m = new URLSearchParams(window.location.search).get("masa");
    if (!m) return;
    m = m.trim().replace(" ", "T");
    var t = Date.parse(/(Z|[+-]\d\d:?\d\d)$/i.test(m) ? m : m + "+08:00");
    if (isNaN(t)) return;
    var asal = Date.now.bind(Date), beza = t - asal();
    Date.now = function () { return asal() + beza; };
    window.PRATONTON = true;
    var bar = document.createElement("div");
    bar.className = "pratonton";
    var teks = document.createElement("span");
    var keluar = document.createElement("a");
    keluar.href = window.location.pathname;
    keluar.textContent = "Keluar";
    bar.appendChild(teks); bar.appendChild(keluar);
    document.body.appendChild(bar);
    function jam() {
        teks.textContent = "PRATONTON \u00b7 " + new Date(Date.now()).toLocaleString("ms-MY", {
            timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        });
    }
    jam(); setInterval(jam, 1000);
})();

/* =========================
   JADUAL ACARA & FASA LAMAN
   (semua masa waktu Malaysia, +08:00)
========================= */

const MASA = {
    mula:    Date.parse("2026-10-23T08:00:00+08:00"), // acara bermula
    hari2:   Date.parse("2026-10-24T00:00:00+08:00"), // hari kedua
    penutup: Date.parse("2026-10-24T11:00:00+08:00"), // majlis penutup & penyampaian hadiah
    selesai: Date.parse("2026-10-24T14:00:00+08:00")  // majlis tamat
};

/* Hebahan berjadual: tukar teks / masa di sini sahaja.
   tamat: null = kekal selepas itu. pautan: pilihan. */
const HEBAHAN = [
    {
        mula: "2026-10-23T11:00:00+08:00", tamat: "2026-10-23T13:00:00+08:00",
        ikon: "fa-mosque", tajuk: "Makluman Solat Jumaat",
        teks: "Solat Jumaat boleh dilaksanakan di Masjid Tepian Putra Kuantan, bersebelahan Kombes. Solat bermula jam 12.55 tengah hari. Semua peserta dan pegawai (lelaki) dijemput menunaikan solat Jumaat secara berjemaah. Waktu rehat solat Jumaat: 1.00 – 2.00 petang.",
        pautan: { teks: "Lihat Lokasi", href: "https://www.google.com/maps/search/?api=1&query=Masjid+Tepian+Putra+Kuantan" }
    },
    {
        mula: "2026-10-23T11:30:00+08:00", tamat: "2026-10-24T10:00:00+08:00",
        jenis: "keputusan",
        ikon: "fa-trophy", tajuk: "Keputusan Akhir Acara",
        teks: "Hanya kedudukan Johan, Naib Johan, Tempat Ketiga dan Tempat Keempat dihebahkan di sini. Bagi masa dan padanan perlawanan, sila rujuk Jadual.",
        pautan: [
            { teks: "Rujuk Jadual", href: "#jadual" },
            { teks: "Live Score", href: "#livescore" }
        ]
    },
    {
        mula: "2026-10-24T10:00:00+08:00", tamat: "2026-10-24T14:00:00+08:00",
        ikon: "fa-award", tajuk: "Majlis Penutup & Penyampaian Hadiah",
        teks: "Hari ini, 11.00 pagi hingga 2.00 petang di Gelanggang Bola Jaring Kombes. Dirasmikan oleh Ts. Mohd Anuar bin Said, Pengarah IKBN Pekan."
    },
    {
        mula: "2026-10-24T10:00:00+08:00", tamat: "2026-10-24T14:00:00+08:00",
        ikon: "fa-utensils", tajuk: "Jamuan Selepas Majlis Penutup",
        teks: "Makanan semua kontinjen disediakan secara bungkusan. Jamuan VIP (jemputan sahaja) diadakan di Kafe Kombes selepas majlis penutup."
    },
    {
        mula: "2026-10-24T14:00:00+08:00", tamat: "2026-10-24T15:00:00+08:00",
        ikon: "fa-key", tajuk: "Peringatan Daftar Keluar",
        teks: "Sila kosongkan bilik penginapan Kombes dan daftar keluar sebelum 3.00 petang. Semak semula barang peribadi sebelum bertolak.",
        pautan: { teks: "Hubungi En. Arep", href: "tel:+60132401930" }
    },
    {
        mula: "2026-10-24T15:00:00+08:00", tamat: null,
        ikon: "fa-heart", tajuk: "Terima Kasih",
        teks: "Terima kasih atas penglibatan anda dalam Karnival Kecemerlangan Modal Insan TVET ILKBS Zon Timur Tahun 2026. Semoga selamat sampai ke destinasi."
    }
];

const countdownEl = document.getElementById("countdown");
const statusEl = document.getElementById("heroStatus");
const hebahanSec = document.getElementById("hebahan");
const hebahanList = document.getElementById("hebahanList");
let fasaSemasa = null;
let hebahanTanda = "";
let bekasKeputusan = null;
let sudahHari2 = Date.now() >= MASA.hari2;

/* 0 = sebelum acara, 1 = acara bermula, 2 = majlis penutup, 3 = selesai */
function kiraFasa(now) {
    if (now < MASA.mula) return 0;
    if (now < MASA.penutup) return 1;
    if (now < MASA.selesai) return 2;
    return 3;
}

function paparCountdown(now) {
    const distance = MASA.mula - now;
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    countdownEl.innerHTML =
        '<div class="countdown-box"><h2>' + days + '</h2><span>Hari</span></div>' +
        '<div class="countdown-box"><h2>' + hours + '</h2><span>Jam</span></div>' +
        '<div class="countdown-box"><h2>' + minutes + '</h2><span>Minit</span></div>' +
        '<div class="countdown-box"><h2>' + seconds + '</h2><span>Saat</span></div>';
}

function paparStatus(fasa, now) {
    let html = "";
    if (fasa === 1) {
        if (now < MASA.hari2) {
            html = '<span class="status-badge"><span class="live-dot"></span> LIVE</span>' +
                '<h3 class="status-title">Acara Telah Bermula</h3>' +
                '<p class="status-day">Hari Pertama · 23 Oktober 2026</p>' +
                '<p class="status-sub">Selamat bertanding kepada semua kontinjen. Pantau keputusan terkini pada Live Score.</p>';
        } else {
            html = '<span class="status-badge">HARI PENUTUP</span>' +
                '<h3 class="status-title">Hari Penutup Karnival</h3>' +
                '<p class="status-day">24 Oktober 2026</p>' +
                '<p class="status-sub">Majlis Penutup dan Penyampaian Hadiah bermula 11.00 pagi di Gelanggang Bola Jaring Kombes.</p>';
        }
    } else if (fasa === 2) {
        html = '<span class="status-badge"><span class="live-dot"></span> SEDANG BERLANGSUNG</span>' +
            '<h3 class="status-title">Majlis Penutup &amp; Penyampaian Hadiah</h3>' +
            '<p class="status-day">11.00 pagi – 2.00 petang · Gelanggang Bola Jaring Kombes</p>' +
            '<p class="status-sub">Dirasmikan oleh Ts. Mohd Anuar bin Said, Pengarah IKBN Pekan.</p>';
    } else {
        html = '<span class="status-badge status-badge-end">TAMAT</span>' +
            '<h3 class="status-title">Karnival Telah Selesai</h3>' +
            '<p class="status-sub">Terima kasih atas penyertaan dan sokongan semua pihak. Jumpa lagi pada karnival akan datang.</p>';
    }
    statusEl.innerHTML = html;
}

/* Live Score menjadi arkib selepas majlis tamat */
function tukarArkib(arkib) {
    const sec = document.getElementById("livescore");
    if (!sec || !arkib) return;
    const badge = sec.querySelector(".section-badge");
    const title = sec.querySelector(".section-title");
    const sub = sec.querySelector(".section-sub");
    const bar = sec.querySelector(".sheet-toolbar-title");
    if (badge) badge.textContent = "ARKIB";
    if (title) title.textContent = "Keputusan Akhir";
    if (sub) sub.textContent = "Arkib keputusan akhir pertandingan. Data direkodkan oleh urusetia.";
    if (bar) bar.textContent = "Keputusan Akhir";
    const btn = document.querySelector('.hero-buttons a[href="#livescore"]');
    if (btn) btn.textContent = "Keputusan Akhir";
}

function terapkanFasa(fasa, now, langsung) {
    if (fasa === 0) {
        statusEl.hidden = true;
        countdownEl.style.display = "";
    } else {
        countdownEl.style.display = "none";
        countdownEl.innerHTML = "";
        paparStatus(fasa, now);
        statusEl.hidden = false;
        if (langsung) statusEl.classList.add("status-masuk");
    }
    tukarArkib(fasa === 3);
    if (fasa > 0) letupKonfeti(fasa);
}

function kemasKiniHebahan(now) {
    const aktif = HEBAHAN.filter(function (h) {
        return now >= Date.parse(h.mula) && (h.tamat === null || now < Date.parse(h.tamat));
    });
    const tanda = aktif.map(function (h) { return h.tajuk; }).join("|");
    if (tanda === hebahanTanda) return;
    hebahanTanda = tanda;
    hebahanList.textContent = "";
    aktif.forEach(function (h) {
        const kad = document.createElement("article");
        kad.className = "hebahan-item";
        const ico = document.createElement("div");
        ico.className = "hebahan-ico";
        ico.innerHTML = '<i class="fas ' + h.ikon + '" aria-hidden="true"></i>';
        const isi = document.createElement("div");
        isi.className = "hebahan-body";
        const lencana = document.createElement("span");
        lencana.className = "hebahan-badge";
        lencana.textContent = "HEBAHAN";
        const t = document.createElement("h3");
        t.textContent = h.tajuk;
        const p = document.createElement("p");
        p.textContent = h.teks;
        isi.appendChild(lencana); isi.appendChild(t); isi.appendChild(p);
        if (h.jenis === "keputusan") {
            bekasKeputusan = document.createElement("div");
            bekasKeputusan.className = "kep-grid";
            isi.appendChild(bekasKeputusan);
        }
        if (h.pautan) {
            const senarai = Array.isArray(h.pautan) ? h.pautan : [h.pautan];
            const baris = document.createElement("div");
            baris.className = "hebahan-btns";
            senarai.forEach(function (l) {
                const a = document.createElement("a");
                a.className = "hebahan-btn";
                a.href = l.href;
                a.textContent = l.teks;
                baris.appendChild(a);
            });
            isi.appendChild(baris);
        }
        kad.appendChild(ico); kad.appendChild(isi);
        hebahanList.appendChild(kad);
    });
    hebahanSec.hidden = aktif.length === 0;
    paparKeputusan();
}

/* Konfeti: sekali bagi setiap fasa pada setiap peranti */
function letupKonfeti(fasa) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const kunci = "sm2026_konfeti_" + fasa;
    if (!window.PRATONTON) {
        try { if (localStorage.getItem(kunci) === "1") return; localStorage.setItem(kunci, "1"); } catch (e) {}
    }
    const kanvas = document.createElement("canvas");
    kanvas.className = "konfeti";
    kanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(kanvas);
    const ctx = kanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = kanvas.width = window.innerWidth * dpr;
    const H = kanvas.height = window.innerHeight * dpr;
    const warna = ["#ffc107", "#ffffff", "#2fa4e7", "#ff7a1a", "#e63946", "#7bd389"];
    const bil = window.innerWidth < 600 ? 70 : 130;
    const zarah = [];
    for (let i = 0; i < bil; i++) {
        zarah.push({
            x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
            vx: (Math.random() - 0.5) * 14 * dpr, vy: (-Math.random() * 13 - 4) * dpr,
            g: 0.28 * dpr, s: (Math.random() * 6 + 5) * dpr,
            r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
            c: warna[i % warna.length]
        });
    }
    const mula = performance.now();
    (function bingkai(t) {
        const e = t - mula;
        ctx.clearRect(0, 0, W, H);
        zarah.forEach(function (z) {
            z.vy += z.g; z.x += z.vx; z.y += z.vy; z.r += z.vr; z.vx *= 0.99;
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - e / 3800);
            ctx.translate(z.x, z.y); ctx.rotate(z.r);
            ctx.fillStyle = z.c; ctx.fillRect(-z.s / 2, -z.s / 4, z.s, z.s / 2);
            ctx.restore();
        });
        if (e < 3800) requestAnimationFrame(bingkai); else kanvas.remove();
    })(mula);
}

function tick() {
    const now = Date.now();
    const fasa = kiraFasa(now);
    if (fasa === 0) paparCountdown(now);
    if (fasa !== fasaSemasa) {
        const langsung = fasaSemasa !== null;
        fasaSemasa = fasa;
        terapkanFasa(fasa, now, langsung);
    } else if (fasa === 1) {
        // tukar label hari pada tengah malam jika halaman dibiarkan terbuka
        const hari2 = now >= MASA.hari2;
        if (hari2 !== sudahHari2) { sudahHari2 = hari2; paparStatus(fasa, now); }
    }
    kemasKiniHebahan(now);
}

/* =========================
   HEBAHAN KEPUTUSAN (Johan, Naib Johan, Tempat Ketiga, Tempat Keempat)
   Sumber 1 (automatik): tab "Hebahan" dalam Google Sheet Live Score
        dengan lajur: Acara | Johan | Naib Johan | Ketiga | Keempat
   Sumber 2 (cadangan jika Sheet gagal): senarai KEPUTUSAN_MANUAL di bawah.
========================= */
const SHEET_HEBAHAN = "https://docs.google.com/spreadsheets/d/17N7YiwIFVp7z97-4aGp2DZ36Dq1uYAwDCfvKNDifgik/gviz/tq?tqx=out:csv&sheet=Hebahan";
const KEPUTUSAN_MANUAL = [
    // { acara: "Futsal", johan: "IKBN Pekan", naib: "IKTBN Temerloh", ketiga: "IKBN Kemasik", keempat: "IKBN Tanah Merah" },
];
let dataKeputusan = KEPUTUSAN_MANUAL.slice();

function urai(csv) {
    const baris = []; let sel = "", r = [], dlm = false;
    for (let i = 0; i < csv.length; i++) {
        const c = csv[i];
        if (dlm) {
            if (c === '"' && csv[i + 1] === '"') { sel += '"'; i++; }
            else if (c === '"') dlm = false;
            else sel += c;
        } else if (c === '"') dlm = true;
        else if (c === ",") { r.push(sel); sel = ""; }
        else if (c === "\n" || c === "\r") {
            if (c === "\r" && csv[i + 1] === "\n") i++;
            r.push(sel); sel = ""; baris.push(r); r = [];
        } else sel += c;
    }
    if (sel !== "" || r.length) { r.push(sel); baris.push(r); }
    return baris;
}

function daripadaSheet(csv) {
    const b = urai(csv);
    // cari baris tajuk (boleh bukan baris pertama): mesti ada "acara" dan "johan" tepat
    let hb = -1, h = [];
    for (let i = 0; i < Math.min(b.length, 15); i++) {
        const t = b[i].map(function (x) { return x.trim().toLowerCase(); });
        if (t.indexOf("acara") !== -1 && t.indexOf("johan") !== -1) { hb = i; h = t; break; }
    }
    // jika tab "Hebahan" belum wujud, Google memulangkan tab pertama: tolak
    if (hb < 0) return null;
    const cari = function (fn) { return h.findIndex(fn); };
    const iA = h.indexOf("acara"), iJ = h.indexOf("johan");
    const iN  = cari(function (x) { return x.indexOf("naib") !== -1 || /^n\.?\s*johan/.test(x); });
    const iK3 = cari(function (x) { return x.indexOf("ketiga") !== -1; });
    const iK4 = cari(function (x) { return x.indexOf("keempat") !== -1 || x.indexOf("kempat") !== -1; });
    if (iN < 0) return null;
    const ambil = function (r, i) { return i >= 0 ? (r[i] || "").trim() : ""; };
    const isi = [];
    for (let k = hb + 1; k < b.length; k++) {
        const r = b[k];
        const a = (r[iA] || "").trim();
        if (!a) break; // jadual tamat pada baris kosong pertama
        isi.push({ acara: a, johan: ambil(r, iJ), naib: ambil(r, iN), ketiga: ambil(r, iK3), keempat: ambil(r, iK4) });
    }
    return isi; // termasuk acara yang belum ada keputusan
}

/* Paparan berputar: satu acara pada satu masa, 10 saat setiap satu, urutan rawak */
const KEP_MS = 10000;
let kepTimer = null, kepGilir = [], kepKini = null, kepSlaid = [], kepMasa = 0;

function senaraiMalay(arr) {
    if (arr.length <= 1) return arr.join("");
    return arr.slice(0, -1).join(", ") + " dan " + arr[arr.length - 1];
}
function kocok(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

function lukisSlaid(s) {
    const kad = document.createElement("div");
    kad.className = "kep-kad kep-slaid";
    const t = document.createElement("h4");
    if (s.info) {
        kad.classList.add("kep-info");
        t.textContent = "Acara Masih Berlangsung";
        const p = document.createElement("p");
        p.textContent = "Keputusan rasmi bagi " + senaraiMalay(s.nama) +
            " belum dikeluarkan. Permainan masih berlangsung, harap bersabar. Rujuk Live Score untuk makluman terkini.";
        kad.appendChild(t); kad.appendChild(p);
        return kad;
    }
    t.textContent = s.d.acara;
    kad.appendChild(t);
    [["johan", "Johan"], ["naib", "Naib Johan"], ["ketiga", "Tempat Ketiga"], ["keempat", "Tempat Keempat"]].forEach(function (l, i) {
        if (!s.d[l[0]]) return;
        const b = document.createElement("div");
        b.className = "kep-baris kep-" + (i + 1);
        const no = document.createElement("span");
        no.className = "kep-no"; no.textContent = String(i + 1);
        const lb = document.createElement("span");
        lb.className = "kep-label"; lb.textContent = l[1];
        const nm = document.createElement("strong");
        s.d[l[0]].split(" | ").forEach(function (bhg) {
            const x = document.createElement("span");
            x.className = "kep-nama"; x.textContent = bhg;
            nm.appendChild(x);
        });
        b.appendChild(no); b.appendChild(lb); b.appendChild(nm);
        kad.appendChild(b);
    });
    return kad;
}

function tunjukSlaid(s, animasi, telahLalu) {
    bekasKeputusan.textContent = "";
    const k = lukisSlaid(s);
    if (!animasi) k.classList.add("kep-tanpa-anim");
    bekasKeputusan.appendChild(k);
    if (kepSlaid.length > 1) {
        const bar = document.createElement("div");
        bar.className = "kep-bar";
        const isiBar = document.createElement("span");
        isiBar.style.animationDuration = KEP_MS + "ms";
        if (telahLalu) isiBar.style.animationDelay = "-" + telahLalu + "ms";
        bar.appendChild(isiBar);
        bekasKeputusan.appendChild(bar);
    }
    kepKini = s.kunci;
    if (!telahLalu) kepMasa = Date.now();
}

function kepLangkah() {
    kepTimer = null;
    if (!bekasKeputusan || !document.body.contains(bekasKeputusan) || kepSlaid.length < 2) return;
    if (!kepGilir.length) {
        kepGilir = kocok(kepSlaid.slice());
        if (kepGilir[kepGilir.length - 1].kunci === kepKini) kepGilir.unshift(kepGilir.pop()); // elak ulang serta-merta
    }
    tunjukSlaid(kepGilir.pop(), true);
    kepTimer = setTimeout(kepLangkah, KEP_MS);
}

function paparKeputusan() {
    if (!bekasKeputusan) return;
    if (kepTimer) { clearTimeout(kepTimer); kepTimer = null; }
    bekasKeputusan.textContent = "";
    const siap = dataKeputusan.filter(function (d) { return d.johan; });
    const belum = dataKeputusan.filter(function (d) { return !d.johan; }).map(function (d) { return d.acara; });
    if (!siap.length) {
        kepSlaid = []; kepKini = null; kepGilir = []; kepMasa = 0;
        const p = document.createElement("p");
        p.className = "kep-kosong";
        p.textContent = "Keputusan akan dipaparkan di sini sebaik sahaja setiap acara tamat.";
        bekasKeputusan.appendChild(p);
        return;
    }
    kepSlaid = siap.map(function (d) { return { kunci: "a:" + d.acara, d: d }; });
    if (belum.length) kepSlaid.push({ kunci: "info", info: true, nama: belum });
    // data dimuat semula: jangan ganggu masa slaid semasa jika ia masih wujud
    const kini = kepSlaid.filter(function (x) { return x.kunci === kepKini; })[0];
    if (kini && kepMasa) {
        const lalu = Math.min(KEP_MS - 500, Date.now() - kepMasa);
        const ada = {};
        kepSlaid.forEach(function (x) { ada[x.kunci] = x; });
        const baki = kepGilir.filter(function (x) { return ada[x.kunci] && x.kunci !== kepKini; }).map(function (x) { return ada[x.kunci]; });
        kepSlaid.forEach(function (x) {
            if (x.kunci !== kepKini && !baki.some(function (y) { return y.kunci === x.kunci; }))
                baki.splice(Math.floor(Math.random() * (baki.length + 1)), 0, x);
        });
        kepGilir = baki;
        tunjukSlaid(kini, false, lalu);
        if (kepSlaid.length > 1) kepTimer = setTimeout(kepLangkah, KEP_MS - lalu);
        return;
    }
    const mula = kepSlaid[Math.floor(Math.random() * kepSlaid.length)];
    kepGilir = kocok(kepSlaid.filter(function (x) { return x.kunci !== mula.kunci; }));
    tunjukSlaid(mula, false);
    if (kepSlaid.length > 1) kepTimer = setTimeout(kepLangkah, KEP_MS);
}

function muatKeputusan() {
    if (bekasKeputusan === null || document.visibilityState === "hidden") return;
    fetch(SHEET_HEBAHAN, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("sheet"); return r.text(); })
        .then(function (csv) {
            const isi = daripadaSheet(csv);
            if (isi !== null) { dataKeputusan = isi.length ? isi : KEPUTUSAN_MANUAL.slice(); paparKeputusan(); }
        })
        .catch(function () { /* senyap: kekal dengan senarai manual */ });
}
setInterval(muatKeputusan, 60000);
setTimeout(muatKeputusan, 1500);

if (countdownEl && statusEl && hebahanSec) {
    tick();
    setInterval(tick, 1000);
}

/* =========================
   MUAT SEMULA LIVE SCORE / JADUAL
========================= */

document.querySelectorAll("[data-reload]").forEach(function (btn) {

    btn.addEventListener("click", function () {

        const frame = document.getElementById(btn.dataset.reload);
        if (!frame) return;

        btn.classList.add("is-loading");

        frame.addEventListener("load", function done() {
            btn.classList.remove("is-loading");
            frame.removeEventListener("load", done);
        });

        // Tetapkan semula src untuk paksa iframe dimuat semula
        const src = frame.getAttribute("src");
        frame.setAttribute("src", src);
    });
});

/* =========================
   KAUNTER PELAWAT
   (sekali bagi setiap browser; guna Abacus counting API)
========================= */

(function () {

    const el = document.getElementById("visitorCount");
    if (!el) return;

    const API       = "https://abacus.jasoncameron.dev";
    const NAMESPACE = "sukan-muhibbah-ilkbs-2026";
    const KEY       = "pelawat";
    const FLAG      = "sm2026_sudah_dikira";

    // Ujian setempat (Live Server / Wi-Fi sendiri) hanya BACA kiraan, tidak menambah
    const host = location.hostname;
    const isLocal = host === "" || host === "localhost" || host === "127.0.0.1" ||
        host === "[::1]" || /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);

    function show(value) {
        const n = Number(value);
        el.textContent = Number.isFinite(n) ? n.toLocaleString("en-US") : "-";
    }

    function request(action) {
        return fetch(API + "/" + action + "/" + NAMESPACE + "/" + KEY)
            .then(function (res) {
                return res.ok ? res.json() : Promise.reject(res.status);
            });
    }

    let alreadyCounted = false;
    try { alreadyCounted = localStorage.getItem(FLAG) === "1"; } catch (e) {}

    const action = (isLocal || alreadyCounted) ? "get" : "hit";

    request(action)
        .then(function (data) {
            show(data.value);
            if (action === "hit") {
                try { localStorage.setItem(FLAG, "1"); } catch (e) {}
            }
        })
        .catch(function () {
            show("-");
        });

})();

/* =========================
   MENU TELEFON: TUTUP AUTOMATIK
   (klik pautan, klik di luar, kursor keluar, atau tekan Esc)
========================= */

(function () {

    const nav     = document.querySelector(".custom-navbar");
    const menu    = document.getElementById("menu");
    const toggler = document.querySelector(".navbar-toggler");

    if (!nav || !menu || !toggler || typeof bootstrap === "undefined") return;

    const mobileMenu = window.matchMedia("(max-width: 1199.98px)");
    let leaveTimer = null;

    function isOpen() {
        return menu.classList.contains("show");
    }

    function closeMenu() {
        clearTimeout(leaveTimer);
        if (!isOpen() || !mobileMenu.matches) return;
        bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
    }

    // 1) Klik pada pautan menu atau logo -> tutup serta-merta
    nav.querySelectorAll(".nav-link, .navbar-brand").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    // 2) Klik / sentuh di luar menu -> tutup
    document.addEventListener("pointerdown", function (e) {
        if (isOpen() && !nav.contains(e.target)) closeMenu();
    });

    // 3) Kursor (tetikus) keluar dari kawasan menu -> tutup selepas jeda pendek
    nav.addEventListener("mouseleave", function () {
        if (!isOpen()) return;
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(closeMenu, 300);
    });

    nav.addEventListener("mouseenter", function () {
        clearTimeout(leaveTimer);
    });

    // 4) Tekan Esc -> tutup
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
    });

})();

/* SISIPAN KANAN: PENDAFTARAN & KEHADIRAN */
(function () {
    const tab = document.getElementById("qrTab");
    const overlay = document.getElementById("qrOverlay");
    if (!tab || !overlay) return;

    const KEY = "sm2026_daftar_klik";
    const TAMAT = new Date("2026-10-25T00:00:00+08:00").getTime(); // paparan ditutup mulai 25 Oktober 2026
    const aktif = document.getElementById("qrAktif");
    const tamat = document.getElementById("qrTamat");
    const kadDaftar = document.getElementById("qrKadDaftar");
    const stepHadir = document.getElementById("qrStepHadir");
    const grid = document.getElementById("qrGrid");
    const nota = document.getElementById("qrDahDaftar");
    const semulaWrap = document.getElementById("qrSemulaWrap");
    const footerLink = document.getElementById("qrBukaSemula");

    function sudahTamat() { return Date.now() >= TAMAT; }
    function sudahDaftar() { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
    function simpanDaftar(v) { try { v ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch (e) {} }

    function render() {
        if (sudahTamat()) { aktif.hidden = true; tamat.hidden = false; return; }
        tamat.hidden = true; aktif.hidden = false;
        const daftar = sudahDaftar();
        kadDaftar.hidden = daftar;
        nota.hidden = !daftar;
        semulaWrap.hidden = !daftar;
        grid.classList.toggle("is-single", daftar);
        stepHadir.textContent = daftar ? "✓" : "2";
    }

    function buka() {
        render();
        overlay.hidden = false;
        document.body.classList.add("qr-lock");
        overlay.scrollTop = 0;
        document.getElementById("qrTutup").focus();
    }
    function tutup() {
        overlay.hidden = true;
        document.body.classList.remove("qr-lock");
        tab.focus();
    }

    // Tab hilang selepas tarikh tamat
    if (sudahTamat()) tab.hidden = true;

    tab.addEventListener("click", buka);
    document.getElementById("qrTutup").addEventListener("click", tutup);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) tutup(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !overlay.hidden) tutup(); });

    // Tanda "sudah daftar" apabila butang pendaftaran ditekan
    document.getElementById("qrBtnDaftar").addEventListener("click", function () { simpanDaftar(true); });
    document.getElementById("qrPapar").addEventListener("click", function () { simpanDaftar(false); render(); });

    if (footerLink) footerLink.addEventListener("click", function (e) { e.preventDefault(); buka(); });
})();
