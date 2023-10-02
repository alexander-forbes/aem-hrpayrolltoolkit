// eslint-disable-next-line import/no-cycle
import { decorateExternalLinks, sampleRUM } from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

function loadScript(url, type, callback) {
  const head = document.querySelector('head');
  let script = head.querySelector(`script[src="${url}"]`);
  if (!script) {
    script = document.createElement('script');
    script.src = url;
    if (type) script.setAttribute('type', type);
    head.append(script);
    script.onload = callback;
    return script;
  }
  return script;
}

// google tag manager
const gtmId = 'GTM-5J2M29FF';
// eslint-disable-next-line
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer',gtmId);

// google analytics
const gaId = 'G-5KKX1F3GQT';
loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`, 'async', () => {
  // eslint-disable-next-line
  window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', gaId);
});

// Back-to-top button
function loadBackToTop() {
  const arrowUp = document.createElement('i');
  arrowUp.className = 'bi bi-arrow-up-short';
  const backToTop = document.createElement('a');
  backToTop.href = '#top';
  backToTop.classList = 'back-to-top';
  backToTop.appendChild(document.createElement('span'));
  backToTop.children[0].append(arrowUp);
  document.body.appendChild(backToTop);
  document.addEventListener('scroll', () => (
    window.scrollY < 100 ? backToTop.classList.remove('active') : backToTop.classList.add('active')
  ));
}
loadBackToTop();
decorateExternalLinks(document.querySelector('footer'));
