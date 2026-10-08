(function () {
  const STR = {
    en: {
      page_title: "ScholarScout | Scholarship Finder",
      nav_how: "How It Works",
      theme_toggle: "Toggle dark mode",
      brand_tagline: "Privacy-first, scholarship-fast.",
      hero_title: "Find your eligible scholarships",
      hero_sub: "Answer a few quick questions to discover the government schemes you qualify for.",
      tagline: "Private by design.",
      tagline_sub: "Your answers never leave your device. No login, nothing stored.",
      form_privacy: "Your answers stay on this device.",
      label_age: "Age",
      label_income: "Family Income (₹/yr)",
      label_domicile: "State of Domicile (Home State)",
      label_college: "State of College (Campus Location)",
      label_education: "Education Level",
      label_category: "Category",
      label_gender: "Gender",
      ph_age: "e.g. 18",
      ph_income: "e.g. 150000",
      ph_domicile: "Where is your permanent residence?",
      ph_college: "Where do you study?",
      opt_c10: "Class 10", opt_c11: "Class 11", opt_c12: "Class 12", opt_dip: "Diploma",
      opt_ug: "Undergraduate (Degree)", opt_pg: "Postgraduate",
      opt_general: "General", opt_obc: "OBC", opt_sc: "SC", opt_st: "ST", opt_ews: "EWS",
      opt_male: "Male", opt_female: "Female",
      btn_find: "Find Schemes",
      empty_title: "No searches yet",
      empty_text: "Fill in your details and press \"Find Schemes\" to see the government aid you are eligible for.",
      m_title: "Mandana's take: which one should you prioritise?",
      m_meta: "Pre-generated with Mandana AI (KriyagniAI) on {date} for: {profile}",
      m_lean: "Lean.", m_tension: "Tension.", m_take: "Take.", m_ask: "Think about:", m_conf: "Confidence:",
      m_note: "You can usually hold only one of these at a time. Always confirm the rules in the official guidelines before applying.",
      h_qualify: "You Qualify",
      h_near: "Almost There (Near Misses)",
      no_matches: "No exact matches found for your profile.",
      no_near: "No close matches found.",
      footer: "Privacy by design: no login, no personal data collected, aligned with the DPDP Act, 2023.",
      badge_central: "Central scheme",
      badge_state: "State scheme: {state}",
      badge_unverified: "Unverified - confirm on the official portal",
      lbl_missing: "Missing:",
      lbl_deadline: "Deadline: {date}",
      lbl_benefit: "Benefit:",
      lbl_rule: "Important Rule:",
      lbl_docs: "Documents Needed",
      lbl_how: "How to apply:",
      lnk_pdf: "Official Guidelines (PDF)",
      btn_apply: "View & Apply",
      any: "any",
      miss_age: "Age must be between {min} and {max}.",
      miss_edu: "Requires education level: {list}.",
      miss_cat: "Reserved for category: {list}.",
      miss_income: "Family income must be ₹{max} per year or less.",
      miss_gender: "Eligible for: {list} applicants only.",
      err_age: "Enter a whole number from 10 to 60",
      err_income: "Enter a valid yearly income (0 or more)",
      err_state_required: "State is required",
      err_state_invalid: "Please choose a valid Indian state or union territory from the list",
      err_loading: "Scheme data is still loading. Please try again in a moment.",
      err_generic: "Something went wrong. Please refresh the page and try again."
    },
    hi: {
      page_title: "ScholarScout | छात्रवृत्ति खोजक",
      nav_how: "यह कैसे काम करता है",
      theme_toggle: "डार्क मोड बदलें",
      brand_tagline: "पहले निजता, फिर तेज़ छात्रवृत्ति।",
      hero_title: "अपनी पात्र छात्रवृत्तियाँ खोजें",
      hero_sub: "कुछ आसान सवालों के जवाब दें और जानें कि आप किन सरकारी योजनाओं के पात्र हैं।",
      tagline: "डिज़ाइन से ही निजी।",
      tagline_sub: "आपके जवाब कभी आपके डिवाइस से बाहर नहीं जाते। न लॉगिन, न कोई डेटा सेव।",
      form_privacy: "आपके जवाब इसी डिवाइस पर रहते हैं।",
      label_age: "आयु",
      label_income: "पारिवारिक आय (₹ प्रति वर्ष)",
      label_domicile: "अधिवास राज्य (गृह राज्य)",
      label_college: "कॉलेज का राज्य (कैंपस स्थान)",
      label_education: "शिक्षा स्तर",
      label_category: "वर्ग",
      label_gender: "लिंग",
      ph_age: "जैसे 18",
      ph_income: "जैसे 150000",
      ph_domicile: "आपका स्थायी निवास कहाँ है?",
      ph_college: "आप कहाँ पढ़ते हैं?",
      opt_c10: "कक्षा 10", opt_c11: "कक्षा 11", opt_c12: "कक्षा 12", opt_dip: "डिप्लोमा",
      opt_ug: "स्नातक (डिग्री)", opt_pg: "स्नातकोत्तर",
      opt_general: "सामान्य", opt_obc: "ओबीसी", opt_sc: "एससी", opt_st: "एसटी", opt_ews: "ईडब्ल्यूएस",
      opt_male: "पुरुष", opt_female: "महिला",
      btn_find: "योजनाएँ खोजें",
      empty_title: "अभी तक कोई खोज नहीं",
      empty_text: "अपना विवरण भरें और \"योजनाएँ खोजें\" दबाएँ, ताकि आप अपनी पात्र सरकारी सहायता देख सकें।",
      m_title: "मंदाना की राय: आपको किसे प्राथमिकता देनी चाहिए?",
      m_meta: "मंदाना एआई (KriyagniAI) से {date} को पहले से तैयार किया गया, इस प्रोफ़ाइल के लिए: {profile}",
      m_lean: "झुकाव।", m_tension: "विरोधाभास।", m_take: "निष्कर्ष।", m_ask: "सोचिए:", m_conf: "विश्वास स्तर:",
      m_note: "आप आमतौर पर इनमें से एक समय में केवल एक ही ले सकते हैं। आवेदन से पहले हमेशा आधिकारिक दिशानिर्देशों में नियम जाँच लें।",
      h_qualify: "आप पात्र हैं",
      h_near: "लगभग पात्र (बस एक शर्त कम)",
      no_matches: "आपकी प्रोफ़ाइल के लिए कोई पूर्ण मिलान नहीं मिला।",
      no_near: "कोई नज़दीकी मिलान नहीं मिला।",
      footer: "डिज़ाइन से ही निजी: कोई लॉगिन नहीं, कोई व्यक्तिगत डेटा एकत्र नहीं किया जाता, डीपीडीपी अधिनियम, 2023 के अनुरूप।",
      badge_central: "केंद्रीय योजना",
      badge_state: "राज्य योजना: {state}",
      badge_unverified: "असत्यापित - आधिकारिक पोर्टल पर पुष्टि करें",
      lbl_missing: "कमी:",
      lbl_deadline: "अंतिम तिथि: {date}",
      lbl_benefit: "लाभ:",
      lbl_rule: "महत्वपूर्ण नियम:",
      lbl_docs: "आवश्यक दस्तावेज़",
      lbl_how: "आवेदन कैसे करें:",
      lnk_pdf: "आधिकारिक दिशानिर्देश (PDF)",
      btn_apply: "देखें और आवेदन करें",
      any: "कोई भी",
      miss_age: "आयु {min} से {max} के बीच होनी चाहिए।",
      miss_edu: "आवश्यक शिक्षा स्तर: {list}।",
      miss_cat: "इन वर्गों के लिए आरक्षित: {list}।",
      miss_income: "पारिवारिक आय ₹{max} प्रति वर्ष या उससे कम होनी चाहिए।",
      miss_gender: "केवल इन आवेदकों के लिए पात्र: {list}।",
      err_age: "10 से 60 के बीच की पूर्ण संख्या दर्ज करें",
      err_income: "वार्षिक आय सही दर्ज करें (0 या अधिक)",
      err_state_required: "राज्य चुनना आवश्यक है",
      err_state_invalid: "कृपया सूची से कोई सही भारतीय राज्य या केंद्र शासित प्रदेश चुनें",
      err_loading: "योजनाओं का डेटा अभी लोड हो रहा है। कृपया कुछ क्षण बाद पुनः प्रयास करें।",
      err_generic: "कुछ गड़बड़ हो गई। कृपया पेज रीफ़्रेश करके दोबारा प्रयास करें।"
    }
  };

  // Display names for list values (the values themselves stay in English for matching)
  const LV = {
    edu: {
      en: {},
      hi: { "Class 10": "कक्षा 10", "Class 11": "कक्षा 11", "Class 12": "कक्षा 12", "Diploma": "डिप्लोमा", "Undergraduate": "स्नातक", "Postgraduate": "स्नातकोत्तर" }
    },
    cat: {
      en: {},
      hi: { "General": "सामान्य", "OBC": "ओबीसी", "SC": "एससी", "ST": "एसटी", "EWS": "ईडब्ल्यूएस" }
    },
    gender: {
      en: { "male": "Male", "female": "Female" },
      hi: { "male": "पुरुष", "female": "महिला" }
    }
  };

  const STATES_HI = {
    "Andhra Pradesh": "आंध्र प्रदेश", "Arunachal Pradesh": "अरुणाचल प्रदेश", "Assam": "असम", "Bihar": "बिहार",
    "Chhattisgarh": "छत्तीसगढ़", "Goa": "गोवा", "Gujarat": "गुजरात", "Haryana": "हरियाणा",
    "Himachal Pradesh": "हिमाचल प्रदेश", "Jharkhand": "झारखंड", "Karnataka": "कर्नाटक", "Kerala": "केरल",
    "Madhya Pradesh": "मध्य प्रदेश", "Maharashtra": "महाराष्ट्र", "Manipur": "मणिपुर", "Meghalaya": "मेघालय",
    "Mizoram": "मिज़ोरम", "Nagaland": "नागालैंड", "Odisha": "ओडिशा", "Punjab": "पंजाब", "Rajasthan": "राजस्थान",
    "Sikkim": "सिक्किम", "Tamil Nadu": "तमिलनाडु", "Telangana": "तेलंगाना", "Tripura": "त्रिपुरा",
    "Uttar Pradesh": "उत्तर प्रदेश", "Uttarakhand": "उत्तराखंड", "West Bengal": "पश्चिम बंगाल",
    "Andaman and Nicobar Islands": "अंडमान और निकोबार द्वीप समूह", "Chandigarh": "चंडीगढ़",
    "Dadra and Nagar Haveli and Daman and Diu": "दादरा और नगर हवेली और दमन और दीव", "Delhi": "दिल्ली",
    "Jammu and Kashmir": "जम्मू और कश्मीर", "Ladakh": "लद्दाख", "Lakshadweep": "लक्षद्वीप", "Puducherry": "पुदुचेरी"
  };

  let lang = 'en';
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'hi' || saved === 'en') lang = saved;
  } catch (e) { /* storage blocked: keep English */ }

  function t(key, params) {
    let s = (STR[lang] && STR[lang][key]) || STR.en[key] || key;
    if (params) {
      Object.keys(params).forEach((k) => { s = s.split('{' + k + '}').join(String(params[k])); });
    }
    return s;
  }

  function label(kind, value) {
    const map = LV[kind] && LV[kind][lang];
    return (map && map[value]) || value;
  }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.title = t('page_title');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    const tb = document.getElementById('themeToggle');
    if (tb) { tb.setAttribute('aria-label', t('theme_toggle')); tb.title = t('theme_toggle'); }
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'hi' ? 'English' : 'हिन्दी';
  }

  function setLang(l) {
    lang = l === 'hi' ? 'hi' : 'en';
    try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }
    applyStatic();
  }

  window.I18N = { t, label, getLang: () => lang, setLang, applyStatic, STATES_HI };
})();
