(function () {
  "use strict";
  /* ---------- registration wizard ---------- */
  const form = document.getElementById("joinForm");
  if (form) {
    const roleInput = document.getElementById("roleInput");
    const tabs = Array.from(document.querySelectorAll("[data-role]"));
    const panels = Array.from(form.querySelectorAll("[data-step]"));
    const roleOnly = Array.from(form.querySelectorAll("[data-role-only]"));
    const steps = Array.from(document.querySelectorAll("#wizSteps li"));
    const bar = document.getElementById("wizBar");
    const head = document.getElementById("wizHead");
    const alertBox = document.getElementById("formAlert");
    let step = 1;

    const controls = (el) =>
      el.matches("input,select,textarea,button")
        ? [el]
        : Array.from(el.querySelectorAll("input,select,textarea,button"));

    function applyRole() {
      const role = roleInput.value;
      roleOnly.forEach((el) => {
        const mine = el.dataset.roleOnly === role;
        el.hidden = !mine;
        const panel = el.closest("[data-step]");
        const panelOn = panel && !panel.hidden;
        controls(el).forEach((c) => {
          c.disabled = !(mine && panelOn);
        });
      });
      if (head) head.hidden = role === "employer";
    }

    function showStep(n, dir) {
      step = n;
      panels.forEach((p) => {
        const on = Number(p.dataset.step) === n;
        p.hidden = !on;
        controls(p).forEach((c) => {
          c.disabled = !on;
        });
        p.classList.remove("next", "prev");
        if (on && dir) p.classList.add(dir);
      });
      steps.forEach((li, i) => {
        li.classList.toggle("on", i === n - 1);
        li.classList.toggle("done", i < n - 1);
      });
      if (bar) bar.style.width = (n / 3) * 100 + "%";
      applyRole();
      const h = panels.find((p) => !p.hidden)?.querySelector("h3");
      if (h) {
        h.setAttribute("tabindex", "-1");
        h.focus();
      }
    }

    function setRole(role) {
      roleInput.value = role;
      tabs.forEach((t) =>
        t.setAttribute("aria-selected", String(t.dataset.role === role)),
      );
      showStep(1);
      if (alertBox) alertBox.classList.remove("show");
    }

    function fieldOf(el) {
      return el.closest(".field");
    }

    function validate(panel) {
      let ok = true,
        first = null;
      panel.querySelectorAll("input,select,textarea").forEach((el) => {
        if (el.disabled) return;
        const f = fieldOf(el);
        let bad = !el.checkValidity();
        if (el.id === "confirm_password") {
          bad =
            el.value !== document.getElementById("password").value || !el.value;
        }
        if (f) f.classList.toggle("bad", bad);
        if (bad) {
          ok = false;
          first = first || el;
        }
      });
      if (first) first.focus();
      return ok;
    }

    form.addEventListener("click", (e) => {
      const next = e.target.closest("[data-next]");
      const back = e.target.closest("[data-back]");
      if (next) {
        const panel = panels.find((p) => !p.hidden);
        if (validate(panel)) {
          if (alertBox) alertBox.classList.remove("show");
          showStep(step + 1, "next");
        } else if (alertBox) {
          alertBox.textContent = "Please correct the highlighted fields.";
          alertBox.classList.add("show");
        }
      }
      if (back) showStep(step - 1, "prev");
    });

    form.addEventListener("input", (e) => {
      const f = fieldOf(e.target);
      if (f && f.classList.contains("bad") && e.target.checkValidity())
        f.classList.remove("bad");
    });

    /* =========================================================
		FIXED SUBMIT HANDLER
		Ensures fields are ENABLED before submission so the browser
		actually sends their values to PHP.
		========================================================= */
    form.addEventListener("submit", (e) => {
      let badStep = null;
      // 1. Validate all relevant steps
      panels.forEach((p) => {
        const isJobseeker = roleInput.value === "jobseeker";
        const relevant = isJobseeker || p.dataset.step === "1";
        if (!relevant) return;

        const wasHidden = p.hidden;
        if (wasHidden) p.hidden = false;
        controls(p).forEach((c) => {
          const roleOnly = c.closest("[data-role-only]");
          if (!roleOnly || roleOnly.dataset.roleOnly === roleInput.value) {
            c.disabled = false;
          }
        });

        if (!validate(p) && !badStep) {
          badStep = Number(p.dataset.step);
        }
      });

      // 2. If validation failed, stop submission and go to the bad step
      if (badStep) {
        e.preventDefault();
        showStep(badStep);
        if (alertBox) {
          alertBox.textContent =
            "Please correct the highlighted fields before submitting.";
          alertBox.classList.add("show");
        }
        return;
      }

      // 3. CRITICAL FIX: Ensure all relevant fields are ENABLED for submission.
      panels.forEach((p) => {
        const isJobseeker = roleInput.value === "jobseeker";
        const relevant = isJobseeker || p.dataset.step === "1";
        if (!relevant) return;
        controls(p).forEach((c) => {
          const roleOnly = c.closest("[data-role-only]");
          if (!roleOnly || roleOnly.dataset.roleOnly === roleInput.value) {
            c.disabled = false;
          }
        });
      });

      // 4. Disable fields from the OTHER role so they aren't submitted
      roleOnly.forEach((el) => {
        if (el.dataset.roleOnly !== roleInput.value) {
          controls(el).forEach((c) => (c.disabled = true));
        }
      });

      // 5. Prevent double submission
      const btn = form.querySelector('button[type="submit"]:not([disabled])');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Creating account…";
      }
    });

    tabs.forEach((t) =>
      t.addEventListener("click", () => setRole(t.dataset.role)),
    );

    document
      .querySelectorAll("[data-role-link]")
      .forEach((a) =>
        a.addEventListener("click", () => setRole(a.dataset.roleLink)),
      );

    const preset = new URLSearchParams(location.search).get("role");
    setRole(preset === "employer" ? "employer" : "jobseeker");
  }

  /* ---------- password reveal ---------- */
  // REMOVED: This logic was duplicated in script.js.
  // Having both caused them to fire sequentially and cancel each other out.
  // script.js already handles all ".pw button" clicks globally.

  /* ---------- file name preview ---------- */
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => {
      const label = document.querySelector(
        '[data-file-label="' + input.id + '"]',
      );
      if (label && input.files[0])
        label.textContent = "Selected: " + input.files[0].name;
    });
  });

  /* ---------- copy tracking ID ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = "Copy ID";
        }, 1800);
      } catch (_) {
        /* clipboard unavailable */
      }
    });
  });

  /* ---------- generic dialog close ---------- */
  document
    .querySelectorAll("[data-close]")
    .forEach((btn) =>
      btn.addEventListener("click", () => btn.closest("dialog")?.close()),
    );
})();
