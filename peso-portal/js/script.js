(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s),
    $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const rid = (p) =>
    "#PESO-" + p + "2026-" + (1000 + Math.floor(Math.random() * 9000));
  let user = null,
    timers = [],
    wiz = 1,
    wdata = {};

  function toast(m, t = "ok") {
    const e = document.createElement("div");
    e.className = "toast " + t;
    e.innerHTML =
      "<span>" +
      esc(m) +
      '</span><button type="button" aria-label="Dismiss notification">×</button>';
    $("#toasts").append(e);
    let h;
    const k = () => {
        e.classList.add("out");
        setTimeout(() => e.remove(), 260);
      },
      a = () => {
        h = setTimeout(k, 5000);
      };
    a();
    e.onmouseenter = () => clearTimeout(h);
    e.onmouseleave = a;
    $("button", e).onclick = k;
  }

  function theme(t) {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("peso-theme", t);
    } catch (e) {}
    $$(".themeBtn").forEach((b) => {
      const d = t === "dark",
        l = $(".lbl", b);
      if (l) {
        l.textContent = d ? " Light mode" : " Dark mode";
        b.setAttribute("aria-label", d ? "Light mode" : "Dark mode");
      } else b.textContent = d ? "Light mode" : "Dark mode";
    });
  }
  let sv;
  try {
    sv = localStorage.getItem("peso-theme");
  } catch (e) {}
  theme(
    sv ||
      (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"),
  );
  document.addEventListener("click", (e) => {
    if (e.target.closest(".themeBtn"))
      theme(
        document.documentElement.dataset.theme === "dark" ? "light" : "dark",
      );
  });

  const F = (o) => {
    const rq = o.r === false ? "" : " required",
      d = (o.h ? o.id + "-h " : "") + o.id + "-err";
    let c;
    if (o.cb)
      return `<div class="field full"><div class="ck"><input type="checkbox" id="${o.id}" name="${o.id}"${rq} aria-describedby="${d}"><label for="${o.id}">${o.l}</label></div><span class="error" id="${o.id}-err"></span></div>`;
    if (o.opts)
      c = `<select id="${o.id}" name="${o.id}"${rq} aria-describedby="${d}"><option value="">Select an option</option>${o.opts.map((x) => `<option>${x}</option>`).join("")}</select>`;
    else if (o.ta)
      c = `<textarea id="${o.id}" name="${o.id}"${rq} ${o.a || ""} aria-describedby="${d}"></textarea>`;
    else {
      c = `<input id="${o.id}" name="${o.id}" type="${o.t || "text"}"${rq} ${o.a || ""} aria-describedby="${d}">`;
      if (o.t === "password")
        c = `<div class="pw">${c}<button type="button" aria-pressed="false" aria-label="Show password">Show</button></div>`;
    }
    return `<div class="field${o.full ? " full" : ""}"><label for="${o.id}">${o.l}${o.r === false ? "" : ' <span class="req" aria-hidden="true">*</span>'}</label>${c}${o.h ? `<span class="hint" id="${o.id}-h">${o.h}</span>` : ""}<span class="error" id="${o.id}-err"></span></div>`;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".pw button");
    if (!b) return;
    const i = $("input", b.parentNode),
      s = i.type === "password";
    i.type = s ? "text" : "password";
    b.textContent = s ? "Hide" : "Show";
    b.setAttribute("aria-pressed", s);
    b.setAttribute("aria-label", s ? "Hide password" : "Show password");
  });
  const MOB =
      'pattern="^(\\+63|0)9\\d{9}$" inputmode="tel" autocomplete="tel" placeholder="09123456789"',
    PW = 'minlength="8" autocomplete="new-password"';
  const EDU = [
    "High school graduate",
    "Vocational diploma",
    "College undergraduate",
    "College graduate",
  ];
  const PROG = [
    "Technical and mechanical skills",
    "Customer service and BPO training",
    "Digital literacy and IT basics",
  ];
  const CAT = [
    "Technical and Trades",
    "Customer Service and BPO",
    "IT and Digital",
    "Administrative",
    "Healthcare",
    "Hospitality and Retail",
  ];
  const LOC = ["Local municipality", "Provincial district"],
    TYP = ["Full-time", "Part-time", "Contractual"];
  const SUB = '<div class="acts"><button class="btn btn-p" type="submit">';

  function msg(el) {
    const l = (el.labels[0] ? el.labels[0].textContent : "this field")
        .replace("*", "")
        .trim()
        .toLowerCase(),
      v = el.validity;
    if (v.valueMissing)
      return el.type === "file"
        ? "Attach your resume to continue."
        : el.type === "checkbox"
          ? "Accept the data privacy consent to continue."
          : el.tagName === "SELECT"
            ? "Select " + l + "."
            : "Enter " + l + ".";
    if (v.typeMismatch)
      return "Enter a valid email address, such as name@example.com.";
    if (v.patternMismatch)
      return el.id === "vpay"
        ? "Enter pay in pesos, such as ₱18,000–22,000/mo."
        : "Use a valid mobile number, such as 09123456789.";
    if (v.tooShort) return "Enter at least " + el.minLength + " characters.";
    if (v.rangeUnderflow)
      return el.type === "date"
        ? "Choose today or a later date."
        : "Enter " + el.min + " or more.";
    if (v.rangeOverflow) return "Enter " + el.max + " or less.";
    return "Check this entry.";
  }
  function vf(el) {
    let m = "";
    if (!el.checkValidity()) m = msg(el);
    else if (el.type === "file" && el.files[0]) {
      const f = el.files[0];
      if (!/\.(pdf|docx?)$/i.test(f.name)) m = "Upload a PDF or Word file.";
      else if (f.size > 5242880)
        m = "File is larger than 5 MB. Upload a smaller file.";
    }
    el.closest(".field").classList.toggle("bad", !!m);
    el.setAttribute("aria-invalid", !!m);
    const er = $("#" + el.id + "-err");
    if (er) er.textContent = m;
    return !m;
  }
  function vForm(f) {
    const bad = $$("input,select,textarea", f).filter((x) => !vf(x)),
      al = $(".alert", f.closest(".wpanel,.fp,.dlg,.card") || document);
    if (al) {
      al.textContent = bad.length
        ? "Please correct " +
          bad.length +
          (bad.length > 1 ? " fields" : " field") +
          " before continuing."
        : "";
      al.classList.toggle("show", !!bad.length);
    }
    if (bad.length) {
      bad[0].focus();
      return false;
    }
    return true;
  }
  function live(f) {
    $$("input,select,textarea", f).forEach((x) => {
      x.addEventListener("blur", () => {
        if (x.value || x.closest(".field").classList.contains("bad")) vf(x);
      });
      ["input", "change"].forEach((v) =>
        x.addEventListener(v, () => {
          if (x.closest(".field").classList.contains("bad")) vf(x);
        }),
      );
    });
  }

  const tg = $("#navToggle"),
    lk = $("#navLinks"),
    sc = $("#scrim");
  function drawer(o) {
    lk.classList.toggle("open", o);
    sc.classList.toggle("on", o);
    tg.setAttribute("aria-expanded", o);
    tg.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    if (o) $("a,button", lk).focus();
  }
  tg.onclick = () => drawer(!lk.classList.contains("open"));
  sc.onclick = () => {
    drawer(false);
    tg.focus();
  };
  lk.addEventListener("click", (e) => {
    if (e.target.closest("a,button")) drawer(false);
  });
  document.addEventListener("keydown", (e) => {
    if (!lk.classList.contains("open")) return;
    if (e.key === "Escape") {
      drawer(false);
      tg.focus();
    }
    if (e.key === "Tab") {
      const f = [tg, ...$$("a,button", lk)],
        i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
  matchMedia("(min-width:901px)").addEventListener("change", () =>
    drawer(false),
  );
  $("#noticeX").onclick = () => $("#notice").remove();

  let rays = "";
  for (let i = 0; i < 24; i++) {
    const big = i % 3 === 0;
    rays += `<line x1="0" y1="-84" x2="0" y2="${big ? -190 : -140}" transform="rotate(${i * 15})" stroke-width="${big ? 3 : 1.5}"/>`;
  }
  $("#sun").insertAdjacentHTML("beforeend", rays);
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count,
      t0 = performance.now(),
      f = (n) => {
        const p = Math.min((n - t0) / 1500, 1);
        el.textContent = Math.round(
          to * (1 - Math.pow(1 - p, 3)),
        ).toLocaleString("en-PH");
        if (p < 1) requestAnimationFrame(f);
      };
    reduced
      ? (el.textContent = to.toLocaleString("en-PH"))
      : requestAnimationFrame(f);
  });
  let vac = 1248;
  setInterval(() => {
    if (document.hidden || $("#landing").hidden) return;
    vac += 1 + Math.floor(Math.random() * 3);
    $("#cVac").textContent = vac.toLocaleString("en-PH");
    $("#upd").textContent =
      "Sample figures. Last tick: " +
      new Date().toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
  }, 7000);
  const SK = [
    ["Customer support (voice and chat)", "+22%"],
    ["Data entry and virtual assistance", "+18%"],
    ["Welding and fabrication", "+15%"],
    ["Electrical maintenance", "+12%"],
    ["Digital marketing basics", "+17%"],
    ["Caregiving and nursing aide", "+14%"],
    ["Web development", "+19%"],
    ["Food service and hospitality", "+9%"],
  ];
  const tl = `<ul>${SK.map((s) => `<li>${s[0]}<b>${s[1]}</b></li>`).join("")}</ul>`;
  $("#tkIn").innerHTML = tl + tl.replace("<ul>", '<ul aria-hidden="true">');
  $("#tkBtn").onclick = (e) => {
    const p = $("#tk").classList.toggle("paused");
    e.target.textContent = p ? "Play" : "Pause";
    e.target.setAttribute("aria-pressed", p);
  };

  function setJoin(role, focus) {
    const j = role === "jobseeker";
    $("#tabJ").setAttribute("aria-selected", j);
    $("#tabE").setAttribute("aria-selected", !j);
    $("#tabJ").tabIndex = j ? 0 : -1;
    $("#tabE").tabIndex = j ? -1 : 0;
    $("#pJ").hidden = !j;
    $("#pE").hidden = j;
    if (focus) $("#tab" + (j ? "J" : "E")).focus();
  }
  $$("[data-role]").forEach((b) => {
    b.onclick = () => setJoin(b.dataset.role);
    b.onkeydown = (e) => {
      if (/Arrow(Left|Right)/.test(e.key))
        setJoin(
          b.dataset.role === "jobseeker" ? "employer" : "jobseeker",
          true,
        );
    };
  });
  $$("[data-join]").forEach((a) =>
    a.addEventListener("click", () => setJoin(a.dataset.join)),
  );

  const WP = [
    `<h3>Create your account</h3><p class="help">Tell us who you are so we can match you with work.</p><div class="alert" role="alert"></div><form class="fg" novalidate data-s="1">${F({ id: "fullName", l: "Full name", full: 1, a: 'autocomplete="name" minlength="3" placeholder="e.g. Juan Dela Cruz"' })}${F({ id: "email", l: "Email address", t: "email", a: 'autocomplete="email" placeholder="name@example.com"' })}${F({ id: "mobile", l: "Mobile number", t: "tel", a: MOB, h: "09123456789 or +639123456789" })}${F({ id: "pw", l: "Password", t: "password", a: PW, h: "At least 8 characters" })}${F({ id: "edu", l: "Highest educational attainment", opts: EDU })}${SUB}Save and continue</button></div></form>`,
    `<h3>Skills and resume</h3><p class="help">Pick a training track and attach your latest resume.</p><div class="alert" role="alert"></div><form class="fg" novalidate data-s="2">${F({ id: "prog", l: "Training program", full: 1, opts: PROG })}${F({ id: "resume", l: "Resume", full: 1, t: "file", a: 'accept=".pdf,.doc,.docx"', h: "PDF or Word file, maximum 5 MB" })}<div class="acts"><button class="btn btn-line" type="button" data-back="1">Back</button><button class="btn btn-p" type="submit">Save and continue</button></div></form>`,
    `<h3>Job preferences</h3><p class="help">Tell us the work you want and where you can report.</p><div class="alert" role="alert"></div><form class="fg" novalidate data-s="3">${F({ id: "role", l: "Preferred job field or title", a: 'minlength="2" placeholder="e.g. Administrative assistant"' })}${F({ id: "loc", l: "Preferred work location", opts: LOC })}${F({ id: "consent", cb: 1, l: "I agree that PESO may process my details to match me with employers, in line with the Data Privacy Act." })}<div class="acts"><button class="btn btn-line" type="button" data-back="2">Back</button><button class="btn btn-gold" type="submit">Submit application</button></div></form>`,
  ];
  $("#wbody").innerHTML = WP.map(
    (h, i) =>
      `<section class="wpanel" data-step="${i + 1}" aria-label="Step ${i + 1} of 3"${i ? " hidden" : ""}>${h}</section>`,
  ).join("");
  function go(n) {
    const d = n >= wiz ? "next" : "prev";
    wiz = n;
    $$(".wpanel").forEach((p) => {
      const on = +p.dataset.step === n;
      p.hidden = !on;
      p.classList.remove("next", "prev");
      if (on) {
        void p.offsetWidth;
        if (!reduced) p.classList.add(d);
      }
    });
    $("#wbar").style.width = (n / 3) * 100 + "%";
    $("#wprog").setAttribute("aria-valuenow", n);
    $("#wprog").setAttribute("aria-valuetext", "Step " + n + " of 3");
    $$("#wsteps li").forEach((li, i) => {
      li.className = i + 1 === n ? "on" : i + 1 < n ? "done" : "";
      $("i", li).textContent = i + 1 < n ? "✓" : i + 1;
      i + 1 === n
        ? li.setAttribute("aria-current", "step")
        : li.removeAttribute("aria-current");
    });
    const f = $(".wpanel:not([hidden]) input,.wpanel:not([hidden]) select");
    if (f) f.focus({ preventScroll: true });
  }
  $$("#wbody form").forEach((f) => {
    live(f);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!vForm(f)) return;
      $$("input:not([type=file]):not([type=password]),select", f).forEach(
        (x) => (wdata[x.name] = x.value.trim()),
      );
      const n = +f.dataset.s;
      if (n < 3) {
        toast("Step " + n + " saved.");
        go(n + 1);
        return;
      }
      const id = rid("");
      wdata.id = id;
      $("#wizard").hidden = true;
      $("#confirm").hidden = false;
      $("#cId").textContent = id;
      $("#cName").textContent = wdata.fullName;
      $("#cMail").textContent = wdata.email;
      $("#cTl").innerHTML = timeline(0);
      toast("Application submitted. Your tracking ID is " + id + ".");
      $("#cId").scrollIntoView({
        block: "center",
        behavior: reduced ? "auto" : "smooth",
      });
      $("#cGo").focus({ preventScroll: true });
    });
  });
  $$("[data-back]").forEach((b) => (b.onclick = () => go(+b.dataset.back)));
  $("#cCopy").onclick = () => {
    const t = $("#cId").textContent;
    (navigator.clipboard
      ? navigator.clipboard.writeText(t)
      : Promise.reject()
    ).then(
      () => toast("Tracking ID copied."),
      () => toast("Copy failed. Select the ID and copy it manually.", "err"),
    );
  };
  $("#cGo").onclick = () =>
    enter({
      role: "jobseeker",
      name: wdata.fullName,
      email: wdata.email,
      id: wdata.id,
      prog: wdata.prog,
      pref: wdata.role,
      resume: ($("#resume").files[0] || {}).name,
      stage: 0,
    });

  $("#empForm").innerHTML =
    F({ id: "co", l: "Company name", a: 'autocomplete="organization"' }) +
    F({ id: "cp", l: "Contact person", a: 'autocomplete="name"' }) +
    F({
      id: "eEmail",
      l: "Work email",
      t: "email",
      a: 'autocomplete="email"',
    }) +
    F({ id: "eMob", l: "Mobile number", t: "tel", a: MOB }) +
    F({ id: "ind", l: "Industry", opts: CAT }) +
    F({
      id: "need",
      l: "What do you need first?",
      opts: ["Post vacancies", "Request recruitment assistance"],
    }) +
    F({
      id: "ePw",
      l: "Password",
      t: "password",
      a: PW,
      h: "At least 8 characters",
      full: 1,
    }) +
    F({
      id: "eCons",
      cb: 1,
      l: "I confirm my business is registered and agree to PESO verification.",
    }) +
    SUB +
    "Create employer account</button></div>";
  live($("#empForm"));
  $("#empForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!vForm(e.target)) return;
    enter({
      role: "employer",
      name: $("#cp").value.trim(),
      email: $("#eEmail").value.trim(),
      co: $("#co").value.trim(),
      tab: $("#need").value === "Post vacancies" ? "post" : "assist",
    });
  });

  const dlg = $("#dlg");
  let lrole = "jobseeker";
  $("#loginForm").innerHTML =
    F({
      id: "lEmail",
      l: "Email address",
      t: "email",
      a: 'autocomplete="email"',
    }) +
    F({
      id: "lPw",
      l: "Password",
      t: "password",
      a: 'minlength="8" autocomplete="current-password"',
    }) +
    '<div class="alert" role="alert"></div><button class="btn btn-p" type="submit">Log in</button>';
  live($("#loginForm"));
  function openLogin(r) {
    lrole = r;
    $$("[data-r]", dlg).forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.r === r),
    );
    dlg.showModal();
  }
  $$("[data-login]").forEach(
    (b) => (b.onclick = () => openLogin(b.dataset.login)),
  );
  $$("[data-r]", dlg).forEach(
    (b) =>
      (b.onclick = () => {
        lrole = b.dataset.r;
        $$("[data-r]", dlg).forEach((x) =>
          x.setAttribute("aria-pressed", x === b),
        );
      }),
  );
  $("#dX").onclick = () => dlg.close();
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
  $("#dJoin").onclick = () => {
    dlg.close();
    setJoin(lrole);
  };
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!vForm(e.target)) return;
    const m = $("#lEmail").value.trim(),
      n = m
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    dlg.close();
    e.target.reset();
    enter({
      role: lrole,
      name: n,
      email: m,
      co: lrole === "employer" ? companyFrom(m) : "",
      id: rid(""),
      stage: 0,
    });
  });

  const STG = [
    ["Submitted", "PESO has received your application."],
    ["Under review", "A PESO officer is checking your profile."],
    ["Interview scheduled", "Expect a text message with the date and venue."],
  ];
  function timeline(s) {
    return `<ol class="timeline">${STG.map((x, i) => `<li class="${i < s ? "done" : i === s ? "cur" : ""}"${i === s ? ' aria-current="step"' : ""}><b>${x[0]}</b><span>${x[1]}</span></li>`).join("")}</ol>`;
  }
  /* ====================================================================
   UNIFIED APP: session, view controller, jobseeker dashboard, employer center
   Session lives in localStorage ('peso-session'); theme in 'peso-theme'.
   ==================================================================== */
  const J = [
    [
      "Production Machine Operator",
      "Northgate Manufacturing",
      "Local municipality",
      "₱18,000–22,000/mo",
      ["Full-Time"],
      "Operate and monitor line machinery.",
      [
        "Vocational diploma preferred",
        "Shift work",
        "Safety training provided",
      ],
    ],
    [
      "Customer Support Representative",
      "BrightLine Contact Solutions",
      "Local municipality",
      "₱20,000–25,000/mo",
      ["Full-Time"],
      "Handle inbound customer calls and chats.",
      [
        "Clear English communication",
        "Night shift allowance",
        "Training provided",
      ],
    ],
    [
      "Chat Support Associate",
      "Orbit CX",
      "Remote",
      "₱19,000–23,000/mo",
      ["Full-Time", "Remote"],
      "Support customers by chat from home.",
      ["Own laptop and stable internet", "Customer service experience a plus"],
    ],
    [
      "Junior Web Developer",
      "Kawayan Digital Studio",
      "Remote",
      "₱28,000–38,000/mo",
      ["Full-Time", "Remote"],
      "Build and maintain client websites.",
      ["HTML, CSS and JavaScript", "Portfolio or project samples"],
    ],
    [
      "Data Encoder",
      "Lakbay Travel Services",
      "Local municipality",
      "₱12,000–15,000/mo",
      ["Part-Time"],
      "Encode bookings and records accurately.",
      ["Typing speed 35 WPM or higher", "Morning shift, 4 hours"],
    ],
    [
      "Service Crew",
      "Tindahan Fresh Market",
      "Local municipality",
      "₱11,000–14,000/mo",
      ["Part-Time"],
      "Assist customers and stock shelves.",
      ["Weekend availability", "Training on the job"],
    ],
    [
      "Welding NC II Scholarship",
      "PESO Training Partners",
      "Provincial district",
      "Free, with allowance",
      ["Training"],
      "Funded 3-month welding course with assessment.",
      ["Age 18 and above", "Registered PESO jobseeker"],
    ],
    [
      "Digital Literacy Bootcamp",
      "City Technical Institute",
      "Local municipality",
      "Free",
      ["Training"],
      "Four-week course on office apps and online work.",
      ["Basic computer access", "Open to out-of-school youth"],
    ],
    [
      "Virtual Assistant",
      "Harbor Light Services",
      "Remote",
      "₱16,000–20,000/mo",
      ["Part-Time", "Remote"],
      "Calendar, email and data support for overseas clients.",
      ["Good written English", "Own computer"],
    ],
    [
      "Nursing Aide",
      "Mabuhay Community Clinic",
      "Provincial district",
      "₱16,000–20,000/mo",
      ["Full-Time"],
      "Assist nurses with patient care.",
      ["Caregiving certificate preferred", "Rotating shifts"],
    ],
  ];
  const TAGS = ["All", "Full-Time", "Part-Time", "Training", "Remote"];
  const DB0 = {
    jobs: [
      [
        "Warehouse Associate",
        "Local municipality",
        3,
        "Active",
        "₱15,000–18,000/mo",
      ],
      [
        "Delivery Rider",
        "Local municipality",
        5,
        "Active",
        "₱14,000–17,000/mo",
      ],
      [
        "Accounting Clerk",
        "Provincial district",
        1,
        "Pending",
        "₱20,000–24,000/mo",
      ],
      ["Customer Support Agent", "Remote", 4, "Closed", "₱18,000–22,000/mo"],
    ],
    apps: [
      ["Maria Santos", "maria.santos@example.com", "0917 000 0001", 0, "New"],
      [
        "Ramon Reyes",
        "ramon.reyes@example.com",
        "0917 000 0002",
        0,
        "Shortlisted",
      ],
      ["Liza Cruz", "liza.cruz@example.com", "0917 000 0003", 0, "New"],
      ["Paolo Garcia", "paolo.garcia@example.com", "0917 000 0004", 1, "New"],
      [
        "Ana Flores",
        "ana.flores@example.com",
        "0917 000 0005",
        1,
        "Interview · Nov 12, 10:00 AM",
      ],
      [
        "Joel Bautista",
        "joel.bautista@example.com",
        "0917 000 0006",
        3,
        "Rejected",
      ],
    ],
    reqs: [],
  };
  const SKEY = "peso-session",
    V = { landing: $("#landing"), js: $("#jsView"), em: $("#emView") };
  let db,
    tag = "All",
    saved = new Set(),
    applied = new Set(),
    open = new Set(),
    NOTES = [],
    cur = null,
    cvName = "",
    pend = "",
    ivI = null,
    last = null;
  const adlg = $("#applyDlg"),
    af = $("#af");
  const stopTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const saveSession = () => {
    try {
      user
        ? localStorage.setItem(SKEY, JSON.stringify(user))
        : localStorage.removeItem(SKEY);
    } catch (e) {}
  };
  const today = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 6e4)
      .toISOString()
      .slice(0, 10);
  const sub = (t) =>
    `<div class="acts"><button class="btn btn-gold" type="submit">${t}</button></div>`;
  function companyFrom(m) {
    const d = (m.split("@")[1] || "company").split(".")[0];
    return d.charAt(0).toUpperCase() + d.slice(1);
  }
  function clearForm(f) {
    f.reset();
    $$(".field.bad", f).forEach((x) => x.classList.remove("bad"));
    $$(".error", f).forEach((x) => (x.textContent = ""));
    $$("[aria-invalid]", f).forEach((x) => x.removeAttribute("aria-invalid"));
    const a = $(".alert", f.closest(".dlg,.card") || f);
    if (a) a.classList.remove("show");
  }

  /* ---- view controller ---- */
  function show(v) {
    Object.keys(V).forEach((k) => {
      V[k].hidden = k !== v;
    });
    $("#appbar").hidden = v === "landing";
    $("#skip").href =
      v === "landing" ? "#main" : v === "js" ? "#jsMain" : "#emMain";
    V[v].classList.remove("vin");
    void V[v].offsetWidth;
    V[v].classList.add("vin");
  }
  function enter(u, quiet) {
    stopTimers();
    user = u;
    saveSession();
    if (dlg.open) dlg.close();
    const js = u.role === "jobseeker",
      nm = js ? u.name : u.co || u.name;
    $("#rolePill").textContent = js ? "Jobseeker" : "Employer";
    $("#appSub").textContent = js
      ? "Jobseeker dashboard"
      : "Employer command center";
    $("#meName").textContent = nm;
    $("#av").textContent = nm.charAt(0).toUpperCase();
    $("#bell").hidden = !js;
    pop(false);
    show(js ? "js" : "em");
    window.scrollTo(0, 0);
    document.title = (js ? "Dashboard" : "Command center") + " | PESO";
    js ? initJs() : initEm();
    if (!quiet)
      toast("Welcome, " + u.name.split(" ")[0] + ". You are now logged in.");
    $(js ? "#jsMain" : "#emMain").focus({ preventScroll: true });
  }
  function logout() {
    stopTimers();
    pop(false);
    [adlg, $("#dJ"), $("#dI")].forEach((d) => d.open && d.close());
    user = null;
    saveSession();
    show("landing");
    document.title = "Public Employment Service Office";
    window.scrollTo(0, 0);
    toast("You have been logged out.");
  }
  $("#logout").onclick = logout;
  $("#appHome").onclick = (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
  };

  /* ---- notifications ---- */
  function notes() {
    const n = NOTES.filter((x) => x[2]).length;
    $("#nl").innerHTML = NOTES.map(
      (x) =>
        `<li class="${x[2] ? "new" : ""}">${esc(x[0])}<time>${x[1]}</time></li>`,
    ).join("");
    $("#badge").hidden = !n;
    $("#badge").textContent = n;
    $("#bell").setAttribute(
      "aria-label",
      "Notifications, " + (n ? n + " unread" : "none unread"),
    );
  }
  function pop(o) {
    $("#pop").hidden = !o;
    $("#bell").setAttribute("aria-expanded", o);
  }
  $("#bell").onclick = () => pop($("#pop").hidden);
  $("#readAll").onclick = () => {
    NOTES.forEach((x) => (x[2] = 0));
    notes();
    toast("All notifications marked as read.");
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#pop").hidden) {
      pop(false);
      $("#bell").focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!$("#pop").hidden && !e.target.closest("#pop,#bell")) pop(false);
  });

  /* ---- jobseeker dashboard ---- */
  function initJs() {
    const u = user;
    saved = new Set();
    applied = new Set();
    open = new Set();
    tag = "All";
    cvName = u.resume || "";
    NOTES = [
      ["Welcome to PESO Online. Browse job offers below.", "Just now", 1],
      ["New job fair: Mega Job Fair on Nov 14, 2026.", "Today", 1],
    ];
    $("#jsHi").textContent = "Welcome, " + u.name.split(" ")[0];
    $("#jsId").textContent = u.id || "";
    $("#q").value = "";
    $("#jsLoc").innerHTML =
      '<option value="">All locations</option>' +
      [...new Set(J.map((j) => j[2]))]
        .map((l) => `<option>${l}</option>`)
        .join("");
    $("#chips").innerHTML = TAGS.map(
      (t) =>
        `<button type="button" aria-pressed="${t === "All"}" data-t="${t}">${t}</button>`,
    ).join("");
    track();
    stats();
    notes();
    render();
    [
      [1, 6000, "Your application is now under review."],
      [2, 15000, "Good news: an interview has been scheduled."],
    ].forEach(([s, t, m]) => {
      if ((u.stage || 0) < s) timers.push(setTimeout(() => step(s, m), t));
    });
  }
  function step(s, m) {
    if (!user || user.role !== "jobseeker") return;
    user.stage = s;
    saveSession();
    track();
    stats();
    NOTES.unshift([m, "Just now", 1]);
    notes();
    toast(m);
  }
  const track = () => {
    $("#tkBox").innerHTML = timeline(user.stage || 0);
  };
  const stats = () => {
    $("#sSaved").textContent = saved.size;
    $("#sApps").textContent = 1 + applied.size;
    $("#sInt").textContent = (user.stage || 0) >= 2 ? 1 : 0;
  };
  function render() {
    const q = $("#q").value.toLowerCase().trim(),
      l = $("#jsLoc").value;
    const L = J.map((j, i) => ({ j, i })).filter(
      ({ j }) =>
        (tag === "All" || j[4].includes(tag)) &&
        (!l || j[2] === l) &&
        (!q || (j[0] + j[1] + j[5] + j[6].join(" ")).toLowerCase().includes(q)),
    );
    $("#cnt").textContent = L.length
      ? L.length + " job offer" + (L.length > 1 ? "s" : "") + " found"
      : "No job offers match your filters. Clear the search or choose All.";
    $("#grid").innerHTML = L.map(({ j, i }) => {
      const a = applied.has(i),
        o = open.has(i);
      return `<article class="card jc" aria-labelledby="t${i}"><div class="tags">${j[4].map((t) => `<span class="tag${t === "Remote" ? " r" : ""}">${t}</span>`).join("")}</div><h3 id="t${i}">${j[0]}</h3><p class="cname">${j[1]}</p><div class="meta"><span>📍 ${j[2]}</span></div><p class="pay">${j[3]}</p>${o ? `<div class="det" id="d${i}"><p>${j[5]}</p><ul>${j[6].map((r) => `<li>${r}</li>`).join("")}</ul></div>` : ""}<div class="row"><button class="btn btn-p" type="button" data-a="${i}"${a ? " disabled" : ""}>${a ? "Applied" : "Apply Now"}</button><button class="btn btn-line" type="button" data-v="${i}" aria-expanded="${o}"${o ? ` aria-controls="d${i}"` : ""}>${o ? "Hide details" : "View Details"}</button><button class="btn btn-line" type="button" data-s="${i}" aria-pressed="${saved.has(i)}" aria-label="${saved.has(i) ? "Unsave" : "Save"} ${esc(j[0])}">${saved.has(i) ? "★" : "☆"}</button></div></article>`;
    }).join("");
  }
  $("#chips").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    tag = b.dataset.t;
    $$("#chips button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
  };
  $("#q").oninput = render;
  $("#jsLoc").onchange = render;
  $("#grid").onclick = (e) => {
    const a = e.target.closest("[data-a]"),
      v = e.target.closest("[data-v]"),
      s = e.target.closest("[data-s]");
    if (v) {
      const i = +v.dataset.v;
      open.has(i) ? open.delete(i) : open.add(i);
      render();
      $('[data-v="' + i + '"]').focus();
    }
    if (s) {
      const i = +s.dataset.s;
      saved.has(i) ? saved.delete(i) : saved.add(i);
      stats();
      render();
      $('[data-s="' + i + '"]').focus();
      toast(saved.has(i) ? "Job saved." : "Job removed from saved.");
    }
    if (a) {
      cur = +a.dataset.a;
      af.reset();
      pend = "";
      $("#rf").setCustomValidity("");
      $("#rf").required = !cvName;
      $("#rn").textContent = cvName
        ? cvName + " (on file)"
        : "No resume on file yet";
      $("#re").textContent = $("#ce").textContent = "";
      $("#rs").classList.remove("bad");
      $("#dJob").textContent = J[cur][0];
      $("#dMeta").textContent = J[cur][1] + ", " + J[cur][2] + ", " + J[cur][3];
      adlg.showModal();
    }
  };
  const closeApply = () => {
    adlg.close();
    const b = $('[data-a="' + cur + '"]');
    b && b.focus();
  };
  $("#dx").onclick = $("#dc").onclick = closeApply;
  adlg.addEventListener("click", (e) => {
    if (e.target === adlg) closeApply();
  });
  /* resume check via Constraint Validation: required + custom validity for type/size */
  function cvCheck() {
    const rf = $("#rf"),
      f = rf.files[0];
    let m = "";
    if (f) {
      if (!/\.(pdf|docx?)$/i.test(f.name)) m = "Upload a PDF or Word file.";
      else if (f.size > 5242880)
        m = "File is larger than 5 MB. Upload a smaller file.";
    }
    rf.setCustomValidity(m);
    return m;
  }
  $("#rf").onchange = () => {
    const m = cvCheck(),
      f = $("#rf").files[0];
    $("#re").textContent = m;
    $("#rs").classList.toggle("bad", !!m);
    if (f && !m) {
      pend = f.name;
      $("#rn").textContent = f.name + " (new)";
    }
  };
  af.addEventListener("submit", (e) => {
    e.preventDefault();
    const rf = $("#rf"),
      ok = $("#ok");
    cvCheck();
    const rm = rf.checkValidity()
        ? ""
        : rf.validity.valueMissing
          ? "Attach your resume to continue."
          : rf.validationMessage,
      cm = ok.checkValidity() ? "" : "Confirm the statement above to submit.";
    $("#re").textContent = rm;
    $("#rs").classList.toggle("bad", !!rm);
    $("#ce").textContent = cm;
    ok.setAttribute("aria-invalid", !!cm);
    if (rm || cm) {
      (rm ? rf : ok).focus();
      return;
    }
    if (pend) cvName = pend;
    applied.add(cur);
    adlg.close();
    stats();
    render();
    toast("Application sent to " + J[cur][1] + " for " + J[cur][0] + ".");
    NOTES.unshift([
      "You applied to " + J[cur][0] + " at " + J[cur][1] + ".",
      "Just now",
      1,
    ]);
    notes();
    const b = $('[data-v="' + cur + '"]');
    b && b.focus();
  });

  /* ---- employer command center ---- */
  $("#fJf").innerHTML =
    F({ id: "vtitle", l: "Job title", full: 1 }) +
    F({
      id: "vcat",
      l: "Employment type",
      opts: ["Full-Time", "Part-Time", "Training", "Remote"],
    }) +
    F({
      id: "vloc",
      l: "Location",
      a: 'placeholder="e.g. Local municipality"',
    }) +
    F({
      id: "vpay",
      l: "Pay range (₱)",
      a: 'pattern="₱.*\\d.*" placeholder="e.g. ₱18,000–22,000/mo"',
      h: "Pesos only, starting with ₱",
    }) +
    F({
      id: "vslots",
      l: "Slots available",
      t: "number",
      a: 'min="1" max="500"',
    }) +
    F({
      id: "vdesc",
      l: "Description and requirements",
      ta: 1,
      full: 1,
      a: 'minlength="20"',
    }) +
    sub("Submit for approval");
  $("#fIf").innerHTML =
    F({ id: "iD", l: "Date", t: "date" }) +
    F({ id: "iT", l: "Time", t: "time" }) +
    F({
      id: "iV",
      l: "Venue or link",
      full: 1,
      r: false,
      a: 'placeholder="PESO office or video link"',
    }) +
    sub("Confirm interview");
  $("#fH").innerHTML =
    F({
      id: "hT",
      l: "What do you need?",
      full: 1,
      opts: [
        "Special hiring event",
        "Mega Job Fair participation",
        "Talent matching by a PESO officer",
      ],
    }) +
    F({ id: "hN", l: "Headcount needed", t: "number", a: 'min="1"' }) +
    F({ id: "hD", l: "Preferred date", t: "date" }) +
    F({
      id: "hX",
      l: "Details",
      ta: 1,
      full: 1,
      r: false,
      a: 'placeholder="Roles, skills and schedule"',
    }) +
    sub("Send request");
  ["#fJ", "#fI", "#fH"].forEach((s) => live($(s)));
  function initEm() {
    db = JSON.parse(JSON.stringify(DB0));
    $("#emHi").textContent = user.co || user.name;
    $("#hD").min = $("#iD").min = today();
    renderAll();
    mtab(user.tab === "assist" ? "h" : "p");
  }
  function mtab(v, f) {
    $$("#mt button").forEach((b) => {
      const on = b.dataset.v === v;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
      if (on && f) b.focus();
    });
    $$("#emView .view").forEach((p) => (p.hidden = p.id !== "v-" + v));
  }
  $("#mt").onclick = (e) => {
    const b = e.target.closest("button");
    if (b) mtab(b.dataset.v);
  };
  $("#mt").onkeydown = (e) => {
    if (!/Arrow(Left|Right)/.test(e.key)) return;
    const a = $$("#mt button"),
      i = a.findIndex((b) => b.getAttribute("aria-selected") === "true");
    mtab(
      a[(i + (e.key === "ArrowRight" ? 1 : a.length - 1)) % a.length].dataset.v,
      true,
    );
  };
  const cls = (s) => s.split(" ")[0],
    lbl = (s) => (s === "Pending" ? "Pending approval" : s);
  function renderAll() {
    const Jb = db.jobs,
      A = db.apps;
    $("#s1").textContent = Jb.filter((j) => j[3] === "Active").length;
    $("#s2").textContent = Jb.filter((j) => j[3] === "Pending").length;
    $("#s3").textContent = A.length;
    $("#s4").textContent = A.filter((a) => a[4].startsWith("Interview")).length;
    $("#jb").innerHTML = Jb.map(
      (j, i) =>
        `<tr><td><b>${esc(j[0])}</b>${j[5] ? `<small>${esc(j[5])}</small>` : ""}</td><td>${esc(j[1])}</td><td>${j[4] ? esc(j[4]) : "Not stated"}</td><td>${j[2]}</td><td>${A.filter((a) => a[3] === i).length}</td><td><span class="b ${j[3]}">${lbl(j[3])}</span></td><td>${j[3] === "Pending" ? '<span class="hint">Awaiting PESO</span>' : `<button class="btn btn-line sm" type="button" data-tog="${i}">${j[3] === "Active" ? "Close posting" : "Reopen"}</button>`}</td></tr>`,
    ).join("");
    const sel = $("#fp").value;
    $("#fp").innerHTML =
      '<option value="">All postings</option>' +
      Jb.map((j, i) => `<option value="${i}">${esc(j[0])}</option>`).join("");
    $("#fp").value = sel;
    renderApps();
    $("#rb").innerHTML = db.reqs.length
      ? db.reqs
          .map(
            (r) =>
              `<tr><td><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${r[2]}</td><td><span class="b Pending">Received</span></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4" class="empty">No requests yet. Send one using the form above.</td></tr>';
  }
  function renderApps() {
    const p = $("#fp").value,
      s = $("#fs").value,
      L = db.apps
        .map((a, i) => ({ a, i }))
        .filter(({ a }) => (p === "" || a[3] == +p) && (!s || cls(a[4]) === s));
    $("#ac").textContent =
      L.length + " applicant" + (L.length === 1 ? "" : "s") + " shown";
    $("#ab").innerHTML = L.length
      ? L.map(({ a, i }) => {
          const f = cls(a[4]),
            done = f === "Rejected";
          return `<tr><td><b>${esc(a[0])}</b><small>${esc(a[1])}, ${esc(a[2])}</small></td><td>${esc(db.jobs[a[3]][0])}</td><td><button class="btn btn-line sm" type="button" data-cv="${i}" aria-label="Download resume of ${esc(a[0])}">Download</button></td><td><span class="b ${f}">${esc(a[4])}</span></td><td><div class="ra"><button class="btn btn-line sm" type="button" data-st="${i}:Shortlisted"${f !== "New" ? " disabled" : ""}>Shortlist</button><button class="btn btn-p sm" type="button" data-iv="${i}"${done ? " disabled" : ""}>Schedule interview</button><button class="btn btn-line sm" type="button" data-st="${i}:Rejected"${done ? " disabled" : ""}>Reject</button></div></td></tr>`;
        }).join("")
      : '<tr><td colspan="5" class="empty">No applicants match these filters.</td></tr>';
  }
  $("#fp").onchange = $("#fs").onchange = renderApps;
  $("#emView").addEventListener("click", (e) => {
    const t = e.target.closest(
      "[data-tog],[data-st],[data-iv],[data-cv],[data-pre]",
    );
    if (!t) return;
    last = t;
    if (t.dataset.tog) {
      const j = db.jobs[+t.dataset.tog];
      j[3] = j[3] === "Active" ? "Closed" : "Active";
      renderAll();
      toast(j[0] + " is now " + j[3].toLowerCase() + ".");
    }
    if (t.dataset.st) {
      const [i, s] = t.dataset.st.split(":"),
        a = db.apps[+i];
      a[4] = s;
      renderAll();
      toast(a[0] + " marked as " + s.toLowerCase() + ".");
    }
    if (t.dataset.cv) {
      const a = db.apps[+t.dataset.cv],
        u = URL.createObjectURL(
          new Blob(
            [
              "Sample resume for " +
                a[0] +
                "\n" +
                a[1] +
                "\nDemonstration file only.",
            ],
            { type: "text/plain" },
          ),
        ),
        l = document.createElement("a");
      l.href = u;
      l.download = a[0].replace(/ /g, "_") + "_Resume.txt";
      document.body.append(l);
      l.click();
      l.remove();
      setTimeout(() => URL.revokeObjectURL(u), 500);
      toast("Resume of " + a[0] + " downloaded (sample file).");
    }
    if (t.dataset.iv) {
      ivI = +t.dataset.iv;
      $("#diW").textContent = "Applicant: " + db.apps[ivI][0];
      clearForm($("#fI"));
      $("#iD").min = today();
      $("#dI").showModal();
    }
    if (t.dataset.pre) {
      $("#hT").value = t.dataset.pre;
      $("#hT").scrollIntoView({
        block: "center",
        behavior: reduced ? "auto" : "smooth",
      });
      $("#hT").focus({ preventScroll: true });
    }
  });
  $("#newJob").onclick = (e) => {
    last = e.currentTarget;
    clearForm($("#fJ"));
    $("#dJ").showModal();
  };
  ["dJ", "dI"].forEach((id) => {
    const d = $("#" + id);
    d.addEventListener("click", (e) => {
      if (e.target === d || e.target.closest("[data-x]")) {
        d.close();
        last && last.focus();
      }
    });
  });
  $("#fJ").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!vForm(e.target)) return;
    const t = $("#vtitle").value.trim();
    db.jobs.unshift([
      t,
      $("#vloc").value.trim(),
      +$("#vslots").value,
      "Pending",
      $("#vpay").value.trim(),
      $("#vcat").value,
    ]);
    db.apps.forEach((a) => a[3]++);
    $("#dJ").close();
    renderAll();
    mtab("p");
    toast('"' + t + '" submitted. It will go live after PESO approval.');
    last && last.focus();
  });
  $("#fI").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!vForm(e.target)) return;
    const a = db.apps[ivI],
      d = new Date($("#iD").value + "T" + $("#iT").value),
      w =
        d.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        }) +
        ", " +
        d.toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
        });
    a[4] = "Interview · " + w;
    $("#dI").close();
    renderAll();
    toast("Interview with " + a[0] + " set for " + w + ".");
    last && last.focus();
  });
  $("#fH").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!vForm(e.target)) return;
    const r = rid("REQ-");
    db.reqs.unshift([r, $("#hT").value, $("#hN").value]);
    clearForm(e.target);
    renderAll();
    toast("Request sent. Your reference is " + r + ".");
  });

  /* ---- restore session on load; keep tabs in sync ---- */
  addEventListener("storage", (e) => {
    if (e.key !== SKEY) return;
    let s = null;
    try {
      s = e.newValue && JSON.parse(e.newValue);
    } catch (_) {}
    if (!s && user) {
      stopTimers();
      user = null;
      show("landing");
    } else if (s && !user) enter(s, true);
  });
  try {
    const s = JSON.parse(localStorage.getItem(SKEY) || "null");
    if (
      s &&
      (s.role === "jobseeker" || s.role === "employer") &&
      typeof s.name === "string" &&
      s.name
    )
      enter(s, true);
  } catch (e) {}
})();
