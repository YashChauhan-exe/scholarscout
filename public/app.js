document.addEventListener('DOMContentLoaded', () => {
    const { t, label } = I18N;
    const $ = (id) => document.getElementById(id);
    const form = $('profile-form');

    // Inputs
    const ageInput = $('age');
    const incomeInput = $('family_income');
    const domicileInput = $('domicile_state');
    const collegeInput = $('college_state');

    // UI elements
    const submitBtn = $('submitBtn');
    const spinner = $('spinner');
    const formError = $('formError');
    const initialState = $('initialState');
    const resultsContainer = $('resultsContainer');
    const matchesBox = $('matchesBox');
    const nearBox = $('nearBox');
    const matchCount = $('matchCount');
    const nearCount = $('nearCount');
    const noMatchesMsg = $('noMatchesMsg');
    const noNearMsg = $('noNearMsg');
    const mandanaPanel = $('mandanaPanel');

    let statesList = [];
    let schemesList = [];
    let schemesHi = {};
    let mandanaTakes = {};
    let lastResult = null; // { matches, near }

    const isHi = () => I18N.getLang() === 'hi';

    // ---------- Data ----------
    fetch('/schemes.json')
        .then((res) => res.json())
        .then((data) => { schemesList = data; })
        .catch((err) => console.error('Failed to load schemes:', err));

    fetch('/schemes_hi.json')
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => { schemesHi = data; })
        .catch(() => {});

    fetch('/states.json')
        .then((res) => res.json())
        .then((data) => { statesList = data; })
        .catch((err) => console.error('Failed to load states:', err));

    fetch('/mandana_takes.json')
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => { mandanaTakes = data; })
        .catch(() => {});

    // Hindi text for a scheme field, falling back to English
    const sx = (scheme, field) => {
        const tr = isHi() && schemesHi[scheme.id];
        return (tr && tr[field]) || scheme[field];
    };

    // ---------- Helpers ----------
    const setVisible = (el, on) => {
        if (!el) return;
        el.classList.toggle('hidden', !on);
    };

    const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function setFieldError(input, errorElId, msg) {
        const errorEl = $(errorElId);
        if (msg) {
            errorEl.textContent = msg;
            setVisible(errorEl, true);
            input.classList.add('border-red-500', 'ring-red-500');
        } else {
            errorEl.textContent = '';
            setVisible(errorEl, false);
            input.classList.remove('border-red-500', 'ring-red-500');
        }
    }

    const fmtDate = (iso) => {
        const d = new Date(iso + 'T00:00:00Z');
        if (isNaN(d)) return iso;
        return d.toLocaleDateString(isHi() ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    };

    // ---------- Matching engine (runs in the browser) ----------
    const norm = (v) => String(v ?? '').trim().toLowerCase();
    const allows = (rule, value) => {
        if (rule === undefined || rule === null) return true;
        if (typeof rule === 'string') return norm(rule) === 'all' || norm(rule) === norm(value);
        if (Array.isArray(rule)) return rule.some((r) => norm(r) === 'all' || norm(r) === norm(value));
        return true;
    };
    const listLabels = (rule, kind) => (Array.isArray(rule) ? rule : [rule]).map((v) => label(kind, v)).join(', ');

    function matchSchemes(profile) {
        const matches = [];
        const near = [];

        schemesList.forEach((scheme) => {
            const e = scheme.eligibility || {};

            // Hard filters: the student can't change these
            if (!allows(e.states, profile.domicile_state)) return;
            if (!allows(e.college_states, profile.college_state)) return;

            const missing = [];
            if ((e.min_age != null && profile.age < e.min_age) || (e.max_age != null && profile.age > e.max_age)) {
                missing.push({ type: 'age', min: e.min_age, max: e.max_age });
            }
            if (!allows(e.education_levels, profile.education_level)) {
                missing.push({ type: 'education', rule: e.education_levels });
            }
            if (!allows(e.categories, profile.category)) {
                missing.push({ type: 'category', rule: e.categories });
            }
            if (e.max_family_income != null && profile.family_income > e.max_family_income) {
                missing.push({ type: 'income', max: e.max_family_income });
            }
            if (!allows(e.genders, profile.gender)) {
                missing.push({ type: 'gender', rule: e.genders });
            }

            if (missing.length === 0) matches.push(scheme);
            else if (missing.length === 1) near.push({ scheme, missing: missing[0] });
        });

        return { matches, near };
    }

    // The "missing" reason is stored as data and turned into text in the current language
    function missingText(m) {
        switch (m.type) {
            case 'age': return t('miss_age', { min: m.min ?? t('any'), max: m.max ?? t('any') });
            case 'education': return t('miss_edu', { list: listLabels(m.rule, 'edu') });
            case 'category': return t('miss_cat', { list: listLabels(m.rule, 'cat') });
            case 'income': return t('miss_income', { max: Number(m.max).toLocaleString('en-IN') });
            case 'gender': return t('miss_gender', { list: listLabels(m.rule, 'gender') });
            default: return '';
        }
    }

    // ---------- States (English or Hindi names) ----------
    const stateLabel = (en) => (isHi() ? (I18N.STATES_HI[en] || en) : en);
    const nf = (s) => String(s ?? '').trim().normalize('NFC').toLowerCase();

    function resolveState(text) {
        const v = nf(text);
        if (!v) return null;
        return statesList.find((s) => nf(s) === v || nf(I18N.STATES_HI[s]) === v) || null;
    }

    function setupAutocomplete(inputId, suggestionsId, errorId) {
        const input = $(inputId);
        const box = $(suggestionsId);

        function choose(en) {
            input.value = stateLabel(en);
            input.dataset.en = en;
            setVisible(box, false);
            setFieldError(input, errorId, '');
        }

        input.addEventListener('input', () => {
            delete input.dataset.en;
            setFieldError(input, errorId, '');
            const val = nf(input.value);
            box.innerHTML = '';
            if (!val) { setVisible(box, false); return; }

            const names = (s) => [nf(s), nf(I18N.STATES_HI[s])];
            const starts = statesList.filter((s) => names(s).some((n) => n.startsWith(val)));
            const contains = statesList.filter((s) => !starts.includes(s) && names(s).some((n) => n.includes(val)));
            const found = [...starts, ...contains].slice(0, 6);
            if (found.length === 0) { setVisible(box, false); return; }

            found.forEach((en) => {
                const shown = stateLabel(en);
                const lower = shown.normalize('NFC').toLowerCase();
                const i = lower.indexOf(val);
                const div = document.createElement('div');
                div.className = 'px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-700 text-sm';
                div.innerHTML = (i >= 0 && lower.length === shown.length)
                    ? escapeHtml(shown.slice(0, i)) + '<strong>' + escapeHtml(shown.slice(i, i + val.length)) + '</strong>' + escapeHtml(shown.slice(i + val.length))
                    : escapeHtml(shown);
                div.addEventListener('mousedown', (e) => { e.preventDefault(); choose(en); });
                box.appendChild(div);
            });
            setVisible(box, true);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => setVisible(box, false), 150);
            validateState(input, errorId);
        });
    }

    setupAutocomplete('domicile_state', 'domicile_suggestions', 'errorDomicile');
    setupAutocomplete('college_state', 'college_suggestions', 'errorCollege');

    // ---------- Validators ----------
    function validateAge() {
        const val = ageInput.value.trim();
        const n = Number(val);
        if (val === '' || !Number.isInteger(n) || n < 10 || n > 60) {
            setFieldError(ageInput, 'errorAge', t('err_age'));
            return false;
        }
        setFieldError(ageInput, 'errorAge', '');
        return true;
    }

    function validateIncome() {
        const val = incomeInput.value.trim();
        const n = Number(val);
        if (val === '' || !Number.isFinite(n) || n < 0) {
            setFieldError(incomeInput, 'errorIncome', t('err_income'));
            return false;
        }
        setFieldError(incomeInput, 'errorIncome', '');
        return true;
    }

    function validateState(input, errorId) {
        if (!input.value.trim()) {
            setFieldError(input, errorId, t('err_state_required'));
            return false;
        }
        const en = resolveState(input.value);
        if (en) {
            input.dataset.en = en;
            input.value = stateLabel(en);
            setFieldError(input, errorId, '');
            return true;
        }
        delete input.dataset.en;
        setFieldError(input, errorId, t('err_state_invalid'));
        return false;
    }

    ageInput.addEventListener('blur', validateAge);
    incomeInput.addEventListener('blur', validateIncome);

    // ---------- Result cards ----------
    function createCard(scheme, type, missing) {
        const isMatch = type === 'match';
        const borderColor = isMatch ? 'border-green-200' : 'border-amber-200';
        const badgeClass = isMatch ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-amber-50 text-amber-800 ring-amber-600/20';

        const levelBadge = scheme.level === 'state'
            ? `<span class="inline-block text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">${escapeHtml(t('badge_state', { state: stateLabel(scheme.state_name || '') }))}</span>`
            : `<span class="inline-block text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">${escapeHtml(t('badge_central'))}</span>`;
        const unverifiedBadge = scheme.verified === false
            ? `<span class="inline-block text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-md border bg-yellow-50 text-yellow-800 border-yellow-300">${escapeHtml(t('badge_unverified'))}</span>`
            : '';

        const icon = isMatch
            ? `<svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`
            : `<svg class="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;

        let html = `
            <div class="rounded-2xl border ${borderColor} bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <h3 class="font-bold text-lg text-slate-900 leading-snug">${escapeHtml(sx(scheme, 'name'))}</h3>
                    <div class="flex-shrink-0 mt-1">${icon}</div>
                </div>
                <div class="flex flex-wrap gap-2 mb-3">${levelBadge}${unverifiedBadge}</div>
        `;

        if (!isMatch && missing) {
            html += `
                <div class="mb-4 inline-flex items-center gap-1.5 rounded-lg ${badgeClass} px-3 py-1.5 text-sm font-semibold ring-1 ring-inset">
                    <span>${escapeHtml(t('lbl_missing'))}</span> ${escapeHtml(missingText(missing))}
                </div>
            `;
        }

        if (scheme.deadline) {
            html += `<p class="text-sm text-red-600 font-bold mb-3 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ${escapeHtml(t('lbl_deadline', { date: fmtDate(scheme.deadline) }))}
            </p>`;
        }

        html += `<p class="text-slate-600 text-sm mb-4 leading-relaxed">${escapeHtml(sx(scheme, 'description'))}</p>`;

        html += `<div class="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                    <p class="text-sm"><strong class="text-slate-900">${escapeHtml(t('lbl_benefit'))}</strong> <span class="text-slate-700">${escapeHtml(sx(scheme, 'benefit_text'))}</span></p>
                 </div>`;

        if (scheme.check_also) {
            html += `
                <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p class="text-sm text-blue-900"><strong class="font-semibold">${escapeHtml(t('lbl_rule'))}</strong> ${escapeHtml(sx(scheme, 'check_also'))}</p>
                </div>
            `;
        }

        const docList = sx(scheme, 'documents_needed');
        if (docList && docList.length > 0) {
            const docs = docList.map((d) => `<span class="inline-block bg-white text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 mb-2 mr-2 shadow-sm">${escapeHtml(d)}</span>`).join('');
            html += `<div class="mb-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">${escapeHtml(t('lbl_docs'))}</p>
                        <div class="flex flex-wrap">${docs}</div>
                     </div>`;
        }

        const isUrl = (u) => typeof u === 'string' && /^https?:\/\//.test(u);

        const pdfLink = isUrl(scheme.source_url)
            ? `<a href="${escapeHtml(scheme.source_url)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-1 mt-2">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                 ${escapeHtml(t('lnk_pdf'))}
               </a>`
            : '';

        const applyUrl = isUrl(scheme.apply_url) ? scheme.apply_url : (isUrl(scheme.source_url) ? scheme.source_url : '');
        const applyBtn = applyUrl
            ? `<a href="${escapeHtml(applyUrl)}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto text-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors whitespace-nowrap shadow-sm">
                    ${escapeHtml(t('btn_apply'))}
               </a>`
            : '';

        html += `
                <div class="border-t border-slate-100 pt-5 mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div class="w-full sm:w-auto">
                        <p class="text-xs text-slate-500 leading-relaxed"><strong class="text-slate-700 tracking-wider">${escapeHtml(t('lbl_how'))}</strong><br>${escapeHtml(sx(scheme, 'how_to_apply'))}</p>
                        ${pdfLink}
                    </div>
                    ${applyBtn}
                </div>
            </div>
        `;
        return html;
    }

    // ---------- Mandana's take (pre-generated; optional *_hi fields for Hindi) ----------
    function renderMandana(matches) {
        setVisible(mandanaPanel, false);
        if (!mandanaPanel || matches.length < 2) return;
        const key = matches.map((m) => m.id).sort().join('+');
        const take = mandanaTakes[key];
        if (!take || take.ready !== true) return;
        const pick = (f) => (isHi() && take[f + '_hi']) || take[f] || '';
        $('mandanaMeta').textContent = t('m_meta', { date: take.generated_on || '', profile: take.profile_note || '' });
        $('mandanaLean').textContent = pick('lean');
        $('mandanaTension').textContent = pick('tension');
        $('mandanaTake').textContent = pick('take');
        $('mandanaAsk').textContent = pick('ask');
        $('mandanaConfidence').textContent = pick('confidence');
        setVisible(mandanaPanel, true);
    }

    // ---------- Render results (also re-run when the language changes) ----------
    function renderResults() {
        if (!lastResult) return;
        const { matches, near } = lastResult;

        setVisible(initialState, false);
        setVisible(resultsContainer, true);

        matchCount.textContent = matches.length;
        nearCount.textContent = near.length;

        if (matches.length > 0) {
            matchesBox.innerHTML = matches.map((m) => createCard(m, 'match')).join('');
            setVisible(noMatchesMsg, false);
        } else {
            matchesBox.innerHTML = '';
            setVisible(noMatchesMsg, true);
        }

        if (near.length > 0) {
            nearBox.innerHTML = near.map((n) => createCard(n.scheme, 'near', n.missing)).join('');
            setVisible(noNearMsg, false);
        } else {
            nearBox.innerHTML = '';
            setVisible(noNearMsg, true);
        }

        renderMandana(matches);
    }

    // ---------- Language toggle ----------
    $('langToggle').addEventListener('click', () => {
        I18N.setLang(isHi() ? 'en' : 'hi');

        // Show state names in the new language
        [domicileInput, collegeInput].forEach((inp) => {
            if (inp.dataset.en) inp.value = stateLabel(inp.dataset.en);
        });

        // Clear messages written in the old language
        ['errorAge', 'errorIncome', 'errorDomicile', 'errorCollege'].forEach((id) => {
            const el = $(id);
            el.textContent = '';
            setVisible(el, false);
        });
        [ageInput, incomeInput, domicileInput, collegeInput].forEach((inp) => inp.classList.remove('border-red-500', 'ring-red-500'));
        setVisible(formError, false);

        renderResults();
    });

    // ---------- Submit ----------
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const okAge = validateAge();
        const okIncome = validateIncome();
        const okDom = validateState(domicileInput, 'errorDomicile');
        const okCol = validateState(collegeInput, 'errorCollege');

        if (!(okAge && okIncome && okDom && okCol)) return;

        const payload = {
            age: Number(ageInput.value),
            family_income: Number(incomeInput.value),
            domicile_state: domicileInput.dataset.en,
            college_state: collegeInput.dataset.en,
            education_level: $('education_level').value,
            category: $('category').value,
            gender: $('gender').value
        };

        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        setVisible(formError, false);

        try {
            if (schemesList.length === 0) {
                formError.textContent = t('err_loading');
                setVisible(formError, true);
                return;
            }
            const data = matchSchemes(payload);
            lastResult = { matches: data.matches, near: data.near };
            renderResults();
        } catch (err) {
            console.error(err);
            formError.textContent = t('err_generic');
            setVisible(formError, true);
        } finally {
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
        }
    });

    // Apply the saved language to the static page text
    I18N.applyStatic();
});
