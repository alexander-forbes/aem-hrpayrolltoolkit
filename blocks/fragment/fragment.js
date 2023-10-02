/* eslint-disable import/no-cycle */
import { loadFragment } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const ref = block.textContent.trim();
  const path = new URL(ref, window.location.href).pathname;
  const main = await loadFragment(path);
  const blockSection = block.closest('.section');
  const fragmentSection = main.querySelector(':scope .section');
  while (fragmentSection && fragmentSection.firstChild) {
    blockSection.insertBefore(fragmentSection.firstChild, block.closest('.fragment-wrapper'));
  }
  block.closest('.fragment-wrapper').remove();
}
