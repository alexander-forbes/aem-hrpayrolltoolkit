import { createOptimizedPicture } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
        li.prepend(div);
      } else if (div.querySelector('.icon')) {
        div.className = 'cards-card-icon';
      } else {
        div.className = 'cards-card-body';
      }
    });
    setTimeout(() => {
      li.classList.add('cards-card-appear');
    }, (i + 1) * 100);
    if (block.classList.contains('highlight')) {
      block.parentElement.classList.add('highlight');
    }
    ul.append(li);
  });
  if (block.parentElement.classList.contains('highlight')) {
    const cardsContainer = document.createElement('ul');
    const li = document.createElement('li');
    [...ul.children].forEach((el, i) => {
      if (i !== 0) cardsContainer.append(el);
    });
    li.classList.add('cards-card-appear');
    [...cardsContainer.children].forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('cards-card-appear');
      }, (i + 1) * 100);
    });

    li.append(cardsContainer);
    ul.append(li);
  }
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
