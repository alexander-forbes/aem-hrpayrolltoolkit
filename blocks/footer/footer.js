import { readBlockConfig, wrapImgsInLinks } from '../../scripts/scripts.js';

function updateAriaLabelForSocialIcons(element) {
  element.querySelectorAll('ul li').forEach((li) => {
    const iconLabel = li.querySelector('a span').classList[1].split('icon-').pop();
    li.querySelector('a').setAttribute('aria-label', iconLabel);
  });
}

function updateAriaLabelFromInnerText(element) {
  element.querySelectorAll('a').forEach((link, index) => {
    if (link.innerText.trim() === '') {
      link.setAttribute('aria-label', `generic link ${index}`);
    } else {
      link.setAttribute('aria-label', link.innerText);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  const imgContainer = footer.children[footer.children.length - 2];
  const pTag = imgContainer.querySelector('p');
  imgContainer.append(...pTag.children);
  imgContainer.removeChild(pTag);
  wrapImgsInLinks(imgContainer);

  const footerDown = document.createElement('div');
  footerDown.append(footer.children[footer.children.length - 1]);
  footerDown.classList.add('footer-bottom');
  updateAriaLabelForSocialIcons(footerDown);
  footer.removeChild(footer.lastChild);

  const footerTop = document.createElement('div');
  footerTop.classList.add('footer-top');
  footerTop.append(...footer.children);
  updateAriaLabelFromInnerText(footerTop);

  footer.innerHTML = '';
  footer.append(footerTop);
  footer.append(footerDown);

  // await decorateIcons(footer);
  block.append(footer);
}
