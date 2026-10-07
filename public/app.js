document.addEventListener('DOMContentLoaded', () => {
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
    let mandanaTakes = {};
    let schemesList = [];

    fetch('/schemes.json')
        .then((res) => res.json())
        .then((data) => { schemesList = data; })
        .catch((err) => console.error('Failed to load schemes:', err));

    // ---------- Matching engine (runs in the browser) ----------
    const norm = (v) => String(v ?? '').trim().toLowerCase();
    const allows = (rule, value) => {
        if (rule === undefined || rule === null) return true;
        if (typeof rule === 'string') return norm(rule) === 'all' || norm(rule) === norm(value);
        if (Array.isArray(rule)) return rule.some((r) => norm(r) === 'all' || norm(r) === norm(value));
        return true;
    };
    const listText = (rule) => (Array.isArray(rule) ? rule.join(', ') : String(rule));

    function matchSchemes(profile) {
        const matches = [];
        const near_misses = [];

        schemesList.forEach((scheme) => {
            const e = scheme.eligibility || {};

            // Hard filters: the student can't change these
            if (!allows(e.states, profile.domicile_state)) return;
            if (!allows(e.college_states, profile.college_state)) return;

            let failed = 0;
            let missing = '';

            if ((e.min_age != null && profile.age < e.min_age) || (e.max_age != null && profile.age > e.max_age)) {
                failed++;
                missing = `Age must be between ${e.min_age ?? 'any'} and ${e.max_age ?? 'any'}.`;
            }
            if (!allows(e.education_levels, profile.education_level)) {
                failed++;
                missing = `Requires education level: ${listText(e.education_levels)}.`;
            }
            if (!allows(e.categories, profile.category)) {
                failed++;
                missing = `Reserved for category: ${listText(e.categories)}.`;
            }
            if (e.max_family_income != null && profile.family_income > e.max_family_income) {
                failed++;
                missing = `Family income must be ₹${Number(e.max_family_income).toLocaleString('en-IN')} per year or less.`;
            }
            if (!allows(e.genders, profile.gender)) {
                failed++;
                missing = `Eligible for: ${listText(e.genders)} applicants only.`;
            }

            if (failed === 0) matches.push(scheme);
            else if (failed === 1) near_misses.push({ scheme, missing });
        });

        return { matches, near_misses };
    }

    fetch('/states.json')
        .then((res) => res.json())
        .then((data) => { statesList = data; })
        .catch((err) => console.error('Failed to load states:', err));

    // Optional pre-generated Mandana answers (file lives in the public folder)
    fetch('/mandana_takes.json')
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => { mandanaTakes = data; })
        .catch(() => {});

    const setVisible = (el, on) => {
        if (!el) return;
        el.classList.toggle('hidden', !on);
    };

    const escapeHtml = (t) => String(t ?? '').replace(/[&<>"']/g, (c) =>
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

    // ---------- State autocomplete ----------
    function setupAutocomplete(inputId, suggestionsId, errorId) {
        const input = $(inputId);
        const suggestionsBox = $(suggestionsId);

        input.addEventListener('input', function () {
            setFieldError(input, errorId, '');
            const val = this.value.trim().toLowerCase();
            suggestionsBox.innerHTML = '';

            if (!val) { setVisible(suggestionsBox, false); return; }

            const starts = statesList.filter((s) => s.toLowerCase().startsWith(val));
            const contains = statesList.filter((s) => !s.toLowerCase().startsWith(val) && s.toLowerCase().includes(val));
            const matches = [...starts, ...contains].slice(0, 6);
            if (matches.length === 0) { setVisible(suggestionsBox, false); return; }

            matches.forEach((match) => {
                const div = document.createElement('div');
                div.className = 'px-4 py-2 cursor-pointer hover:bg-blue-50 text-slate-700 text-sm';
                const i = match.toLowerCase().indexOf(val);
                div.innerHTML = escapeHtml(match.slice(0, i)) +
                    '<strong>' + escapeHtml(match.slice(i, i + val.length)) + '</strong>' +
                    escapeHtml(match.slice(i + val.length));
                div.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    input.value = match;
                    setVisible(suggestionsBox, false);
                    setFieldError(input, errorId, '');
                });
                suggestionsBox.appendChild(div);
            });
            setVisible(suggestionsBox, true);
        });

        input.addEventListener('blur', () => {
            setTimeout(() => setVisible(suggestionsBox, false), 150);
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
            setFieldError(ageInput, 'errorAge', 'Enter a whole number from 10 to 60');
            return false;
        }
        setFieldError(ageInput, 'errorAge', '');
        return true;
    }

    function validateIncome() {
        const val = incomeInput.value.trim();
        const n = Number(val);
        if (val === '' || !Number.isFinite(n) || n < 0) {
            setFieldError(incomeInput, 'errorIncome', 'Enter a valid yearly income (0 or more)');
            return false;
        }
        setFieldError(incomeInput, 'errorIncome', '');
        return true;
    }

    function validateState(input, errorId) {
        const val = input.value.trim().toLowerCase();
        if (!val) {
            setFieldError(input, errorId, 'State is required');
            return false;
        }
        const exact = statesList.find((s) => s.toLowerCase() === val);
        if (exact) {
            input.value = exact;
            setFieldError(input, errorId, '');
            return true;
        }
        setFieldError(input, errorId, 'Please choose a valid Indian state or union territory from the list');
        return false;
    }

    ageInput.addEventListener('blur', validateAge);
    incomeInput.addEventListener('blur', validateIncome);

    // ---------- Result cards ----------
    function createCard(scheme, type, missingReason = '') {
        const isMatch = type === 'match';
        const borderColor = isMatch ? 'border-green-200' : 'border-amber-200';
        const badgeClass = isMatch ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-amber-50 text-amber-800 ring-amber-600/20';

        const levelBadge = scheme.level === 'state'
            ? `<span class="inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">State scheme: ${escapeHtml(scheme.state_name || '')}</span>`
            : `<span class="inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200">Central scheme</span>`;
        const unverifiedBadge = scheme.verified === false
            ? `<span class="inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border bg-yellow-50 text-yellow-800 border-yellow-300">Unverified - confirm on the official portal</span>`
            : '';

        const icon = isMatch
            ? `<svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`
            : `<svg class="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;

        let html = `
            <div class="rounded-2xl border ${borderColor} bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div class="flex items-start justify-between gap-4 mb-3">
                    <h3 class="font-bold text-lg text-slate-900 leading-snug">${escapeHtml(scheme.name)}</h3>
                    <div class="flex-shrink-0 mt-1">${icon}</div>
                </div>
                <div class="flex flex-wrap gap-2 mb-3">${levelBadge}${unverifiedBadge}</div>
        `;

        if (!isMatch && missingReason) {
            html += `
                <div class="mb-4 inline-flex items-center gap-1.5 rounded-lg ${badgeClass} px-3 py-1.5 text-sm font-semibold ring-1 ring-inset">
                    <span>Missing:</span> ${escapeHtml(missingReason)}
                </div>
            `;
        }

        if (scheme.deadline) {
            html += `<p class="text-sm text-red-600 font-bold mb-3 flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Deadline: ${escapeHtml(scheme.deadline)}
            </p>`;
        }

        html += `<p class="text-slate-600 text-sm mb-4 leading-relaxed">${escapeHtml(scheme.description)}</p>`;

        html += `<div class="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                    <p class="text-sm"><strong class="text-slate-900">Benefit:</strong> <span class="text-slate-700">${escapeHtml(scheme.benefit_text)}</span></p>
                 </div>`;

        if (scheme.check_also) {
            html += `
                <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p class="text-sm text-blue-900"><strong class="font-semibold">Important Rule:</strong> ${escapeHtml(scheme.check_also)}</p>
                </div>
            `;
        }

        if (scheme.documents_needed && scheme.documents_needed.length > 0) {
            const docs = scheme.documents_needed.map((d) => `<span class="inline-block bg-white text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 mb-2 mr-2 shadow-sm">${escapeHtml(d)}</span>`).join('');
            html += `<div class="mb-4">
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documents Needed</p>
                        <div class="flex flex-wrap">${docs}</div>
                     </div>`;
        }

        const isUrl = (u) => typeof u === 'string' && /^https?:\/\//.test(u);

        const pdfLink = isUrl(scheme.source_url)
            ? `<a href="${escapeHtml(scheme.source_url)}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-1 mt-2">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                 Official Guidelines (PDF)
               </a>`
            : '';

        const applyUrl = isUrl(scheme.apply_url) ? scheme.apply_url : (isUrl(scheme.source_url) ? scheme.source_url : '');
        const applyBtn = applyUrl
            ? `<a href="${escapeHtml(applyUrl)}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto text-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors whitespace-nowrap shadow-sm">
                    View & Apply
               </a>`
            : '';

        html += `
                <div class="border-t border-slate-100 pt-5 mt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div class="w-full sm:w-auto">
                        <p class="text-xs text-slate-500 leading-relaxed"><strong class="text-slate-700 uppercase tracking-wider">How to apply:</strong><br>${escapeHtml(scheme.how_to_apply)}</p>
                        ${pdfLink}
                    </div>
                    ${applyBtn}
                </div>
            </div>
        `;
        return html;
    }

    // ---------- Mandana's take (pre-generated) ----------
    function renderMandana(matches) {
        setVisible(mandanaPanel, false);
        // Look up by central schemes only, so one entry works for every state
        const central = matches.filter((m) => m.level === 'central');
        if (!mandanaPanel || central.length < 2) return;
        const key = central.map((m) => m.id).sort().join('+');
        const t = mandanaTakes[key];
        if (!t || t.ready !== true) return;
        $('mandanaMeta').textContent = 'Pre-generated with Mandana AI (KriyagniAI) on ' + (t.generated_on || '') + ' for: ' + (t.profile_note || '');
        $('mandanaLean').textContent = t.lean || '';
        $('mandanaTension').textContent = t.tension || '';
        $('mandanaTake').textContent = t.take || '';
        $('mandanaAsk').textContent = t.ask || '';
        $('mandanaConfidence').textContent = t.confidence || '';
        setVisible(mandanaPanel, true);
    }

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
            domicile_state: domicileInput.value.trim(),
            college_state: collegeInput.value.trim(),
            education_level: $('education_level').value,
            category: $('category').value,
            gender: $('gender').value
        };

        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        setVisible(formError, false);

        try {
                if (schemesList.length === 0) {
                formError.textContent = 'Scheme data is still loading. Please try again in a moment.';
                setVisible(formError, true);
                return;
            }
            const data = matchSchemes(payload);

            setVisible(initialState, false);
            setVisible(resultsContainer, true);

            const matches = data.matches || [];
            const near = data.near_misses || [];

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
        } catch (err) {
            console.error(err);
            formError.textContent = 'Failed to connect to the server. Make sure the server is running (node server.js).';
            setVisible(formError, true);
        } finally {
            submitBtn.disabled = false;
            spinner.classList.add('hidden');
        }
    });
});
