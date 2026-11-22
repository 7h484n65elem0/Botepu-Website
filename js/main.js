(function () {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  var scrim = document.getElementById('scrim');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
    scrim.classList.toggle('show', open);
    document.body.classList.toggle('locked', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  scrim.addEventListener('click', function () { setMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width:861px)').addEventListener('change', function () { setMenu(false); });

  // ---------------------------------------------------------------
  // FORM SETTINGS: paste your Formspree form URL here (see README.txt)
  // ---------------------------------------------------------------
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrpqyndl';
  var WHATSAPP = '27732675875'; // your WhatsApp number in international format, e.g. 27732675875

  function status(el, msg, ok) {
    el.textContent = msg;
    el.classList.toggle('ok', !!ok);
  }

  function whatsapp(text) {
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener'); // open in new tab, so user can return to site after sending
  }

  // Sends the payload to Formspree, which emails it to you.
  function sendToFormspree(payload, formEl, statusEl, btn) {
    if (FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1) {
      status(statusEl, 'Online sending is not switched on yet. Please use the WhatsApp button instead.', false);
      return;
    }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending...';
    status(statusEl, '', false);
    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('bad response');
      formEl.reset();
      if (formEl.id === 'quoteForm') document.getElementById('companyRow').hidden = true;
      status(statusEl, 'Thank you. We have received your request and will contact you soon.', true);
    }).catch(function () {
      status(statusEl, 'Sorry, that did not send. Please try again or use the WhatsApp button.', false);
    }).then(function () {
      btn.disabled = false; btn.textContent = label;
    });
  }

  // Contact form
  var form = document.getElementById('form');
  var err = document.getElementById('err');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var how = e.submitter ? e.submitter.value : 'send';
    var name = (d.get('name') || '').trim(), phone = (d.get('phone') || '').trim();
    var email = (d.get('email') || '').trim(), msg = (d.get('msg') || '').trim();
    if (!name || !phone || !msg) { status(err, 'Please fill in your name, phone number and message.', false); return; }
    status(err, '', false);
    if (how === 'whatsapp') {
      whatsapp('Hi Botepu, my name is ' + name + ' (' + phone + '). ' + msg);
      return;
    }
    var payload = { _subject: 'Website message from ' + name, name: name, phone: phone, message: msg };
    if (email) payload.email = email;
    sendToFormspree(payload, form, err, e.submitter);
  });

  // Quotation form
  var qf = document.getElementById('quoteForm');
  var qerr = document.getElementById('qerr');
  var companyRow = document.getElementById('companyRow');
  qf.querySelectorAll('input[name="type"]').forEach(function (r) {
    r.addEventListener('change', function () { companyRow.hidden = qf.elements.type.value !== 'Company'; });
  });
  qf.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(qf);
    var how = e.submitter ? e.submitter.value : 'send';
    var name = (d.get('name') || '').trim(), phone = (d.get('phone') || '').trim();
    var email = (d.get('email') || '').trim(), msg = (d.get('msg') || '').trim();
    var company = (d.get('company') || '').trim();
    var svc = d.getAll('svc');
    if (!name || !phone) { status(qerr, 'Please enter your name and phone number.', false); return; }
    if (!svc.length) { status(qerr, 'Please tick at least one service.', false); return; }
    status(qerr, '', false);
    var type = d.get('type');
    if (how === 'whatsapp') {
      var lines = ['Quotation request', 'Type: ' + type];
      if (type === 'Company' && company) lines.push('Company: ' + company);
      lines.push('Services: ' + svc.join(', '), 'Name: ' + name, 'Phone: ' + phone);
      if (email) lines.push('Email: ' + email);
      if (msg) lines.push('Details: ' + msg);
      whatsapp(lines.join('\n'));
      return;
    }
    var payload = {
      _subject: 'Quotation request from ' + name,
      type: type, services: svc.join(', '), name: name, phone: phone, details: msg
    };
    if (type === 'Company' && company) payload.company = company;
    if (email) payload.email = email;
    sendToFormspree(payload, qf, qerr, e.submitter);
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
