export default function decorate(block) {
  const imgDiv = document.createElement('div');
  const itemsDiv = document.createElement('div');

  imgDiv.classList.add('image-table-picture');
  itemsDiv.classList.add('image-table-rows');

  block.querySelectorAll(':scope>div').forEach((row, idx) => {
    if (idx === 0) {
      const pic = row.querySelectorAll('picture')[0];
      imgDiv.appendChild(pic);
    } else {
      const classes = ['icon', 'text'];
      row.querySelectorAll(':scope>div').forEach((item, j) => {
        item.classList.add(`${classes[j]}-box`);
      });
      row.classList.add('image-table-row');
      itemsDiv.appendChild(row);
    }
  });
  block.innerHTML = '';
  block.appendChild(imgDiv);
  block.appendChild(itemsDiv);
}
