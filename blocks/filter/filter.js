import ffetch from '../../scripts/ffetch.js';
import {
  clearSessionData, convertFileNameToSupportedCharacters, getFirstItemOfPath, isSidekick,
} from '../../scripts/scripts.js';

const clientName = isSidekick() ? 'investec' : getFirstItemOfPath(window.location.pathname);

function constructURLFromMetadata(context, type) {
  if (type === 'brochures') {
    return '/brochures.json';
  }

  if (context === 'global') {
    return type ? `/${type}.json` : 'forms.json';
  }

  return type ? `/${clientName}/${type}.json` : `/${clientName}/forms.json`;
}

// fetch the JSON data from excel
async function getFilterData({ context, type }) {
  try {
    const URL = constructURLFromMetadata(context, type);
    const entries = await ffetch(URL)
      .withFetch(fetch).all();
    return entries;
  } catch (err) {
    return err;
  }
}

function createFilterDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'filter-dropdown';

  return dropdown;
}

function findCommonElementsOrAll(arr1, arr2) {
  if (arr1.length === 0) {
    return arr2.slice();
  }

  if (arr2.length === 0) {
    return [];
  }

  // Create a Set from the first array for faster lookup
  const set1 = new Set(arr1);
  const commonElements = arr2.filter((item) => set1.has(item));

  return commonElements;
}

function getFilterDropdownItems(data, key, options) {
  if (key === 'Journey' || key === 'Client') {
    const uniqueFilterItemsWithPounds = [...new Set(data.map((item) => item[key]))];
    const uniqueItems = [...new Set(
      uniqueFilterItemsWithPounds.flatMap((item) => item.split(';#').map((str) => str.replace('#', ''))),
    )];
    const fromOptions = key === 'Journey' ? options.journey : options.client;

    return findCommonElementsOrAll(fromOptions, uniqueItems);
  }

  return [...new Set(
    data.map((item) => item[key])
      .filter((value) => value !== '' && value !== '<>'),
  )];
}

function getBlockName(block) {
  return block.dataset.blockName;
}

/**
 * Create dropdown items based on the key generated dynamically and also
 * inject the response into the respective dropdown
 */
function createMultiSelectDropdownItems(data, key, block, options) {
  const id = `-${Math.random().toString(16).slice(2)}`;
  const entries = data;
  const uniqueItems = getFilterDropdownItems(entries, key, options);

  // get the filter by data-filter-type
  const keyFilterType = block.querySelector(`[data-filter-type="${key}"]`);
  const keyDropdownUl = keyFilterType.querySelector('.filter-dropdown > ul');
  uniqueItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'filter-item';
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = item;
    checkboxLabel.setAttribute('for', `${item}${id}`);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = item;
    checkbox.id = `${item}${id}`;
    checkbox.value = item;
    li.appendChild(checkbox);
    li.appendChild(checkboxLabel);
    keyDropdownUl.appendChild(li);
  });
}

function createRadioBtnItems(data, key, block) {
  const id = `-${Math.random().toString(16).slice(2)}`;
  const entries = data;
  const uniqueItems = getFilterDropdownItems(entries, key);

  // get the filter by data-filter-type
  const keyFilterType = block.querySelector(`[data-filter-type="${key}"]`);
  const keyDropdownUl = keyFilterType.querySelector('.filter-dropdown > ul');
  uniqueItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'filter-item';
    const radioLabel = document.createElement('label');
    radioLabel.textContent = item;
    radioLabel.setAttribute('for', `${item}${id}`);
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'coverage';
    radio.id = `${item}${id}`;
    radio.value = item;
    li.appendChild(radio);
    li.appendChild(radioLabel);
    keyDropdownUl.appendChild(li);
  });
}

function createFilterheader(block, data, options) {
  const filterHeader = document.createElement('div');
  filterHeader.className = 'filter-header';
  block.appendChild(filterHeader);

  const blockName = getBlockName(block);
  const blockSection = block.closest(`.${blockName}-container`);

  const filterIconEl = document.createElement('img');
  filterIconEl.src = '/icons/filter.png';
  filterIconEl.alt = 'filter icon';
  filterHeader.appendChild(filterIconEl);

  const filterTextEl = document.createElement('h3');
  filterTextEl.textContent = 'Filter';
  filterHeader.appendChild(filterTextEl);

  const filters = ['Scheme', 'Coverage', 'Year', 'Categories', 'Product', 'Journey', 'Client', 'Communication'];
  filters.forEach((filter) => {
    const hasDataAttribute = Object.keys(blockSection.dataset).includes(filter.toLowerCase());
    if (!hasDataAttribute) return;

    const filterEl = document.createElement('div');
    filterEl.className = 'filter-dropdown-button';
    filterEl.setAttribute('aria-expanded', 'false');
    const filterElText = document.createTextNode(filter);
    const chevron = document.createElement('span');
    chevron.className = 'icon-chevron-down';

    filterEl.appendChild(filterElText);
    filterEl.appendChild(chevron);

    filterEl.setAttribute('data-filter-type', filter);

    filterHeader.appendChild(filterEl);

    const dropdown = createFilterDropdown();
    filterEl.appendChild(dropdown);

    const ul = document.createElement('ul');
    ul.className = 'filter-dropdown-ul';

    dropdown.appendChild(ul);

    if ((filter === 'Coverage') && options.type === 'brochures') {
      createRadioBtnItems(data, filter, block);
    } else {
      createMultiSelectDropdownItems(data, filter, block, options);
    }
  });
}

function constructPdfUrl(entry, { context, type }) {
  if (context === 'global') {
    return `${window.location.origin}/common/assets/pdf/${type}/${entry.Year}/${(entry.Scheme).replace(/\s/g, '')}/${convertFileNameToSupportedCharacters(entry.Name)}`;
  }

  if (type === 'communication' && context !== 'global') {
    return `${window.location.origin}/${clientName}/common/assets/pdf/${type}/${entry.Year}/${convertFileNameToSupportedCharacters(entry.Name)}`;
  }

  return `${window.location.origin}/${clientName}/common/assets/pdf/${type}/${entry.Year}/${(entry.Scheme).replace(/\s/g, '')}/${convertFileNameToSupportedCharacters(entry.Name)}`;
}

function renderFilteredResults(block, data, options) {
  const filterBodyUl = block.querySelector('.filter-body-ul');
  filterBodyUl.innerHTML = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const entry of data) {
    const pdfLinkEl = document.createElement('a');
    pdfLinkEl.setAttribute('target', '_blank');
    pdfLinkEl.href = constructPdfUrl(entry, options);

    const filterBodyLi = document.createElement('li');
    filterBodyLi.className = 'filter-body-li';

    pdfLinkEl.innerText = entry.Title;

    filterBodyLi.appendChild(pdfLinkEl);
    filterBodyUl.appendChild(filterBodyLi);
  }
}

function createFilterBody(block, data, options) {
  const filterBody = document.createElement('div');
  filterBody.className = 'filter-body';
  block.appendChild(filterBody);

  const filterBodyUl = document.createElement('ul');
  filterBodyUl.className = 'filter-body-ul';
  const entries = data;

  filterBody.appendChild(filterBodyUl);
  renderFilteredResults(block, entries, options);
}

function closeOpenDropdowns() {
  document.querySelectorAll('.filter-dropdown-button[aria-expanded="true"]')?.forEach((dropdown) => {
    dropdown.setAttribute('aria-expanded', 'false');
  });
}

function applyFilters(data, filters) {
  return data.filter((item) => Object.keys(filters).every((key) => {
    const filterValues = filters[key];
    const itemValue = item[key];
    // If filterValues is an empty array, it acts as a wildcard
    if (filterValues.length === 0) {
      return true;
    }
    // Use the some() method to handle multiple items in filterValues
    if (key === 'Journey' || key === 'Client') {
      return filterValues.some((filterValue) => {
        const filterValueMainPart = filterValue.split(';')[0].trim();
        return itemValue.includes(filterValueMainPart);
      });
    }
    return Array.isArray(filterValues)
      ? filterValues.some((filterValue) => filterValue === itemValue)
      : filterValues === itemValue;
  }));
}

function getFiltersByDataAttribute(options, data) {
  const {
    year, scheme, journey, coverage, product, categories, client, communication,
  } = options;
  let d = data;

  if (year) {
    d = d.filter((item) => year.includes(item.Year));
  }
  if (scheme) {
    d = d.filter((item) => scheme.includes(item.Scheme));
  }
  if (journey) {
    d = d.filter((item) => {
      const journeyItems = item.Journey;
      return journey.some((jItem) => journeyItems.includes(jItem));
    });
  }
  if (client) {
    d = d.filter((item) => {
      const clientItems = item.Client;
      return client.some((cItem) => clientItems.includes(cItem));
    });
  }
  if (coverage) {
    d = d.filter((item) => coverage.includes(item.Coverage));
  }
  if (communication) {
    d = d.filter((item) => communication.includes(item.Communication));
  }
  if (product) {
    d = d.filter((item) => product.includes(item.Product));
  }
  if (categories) {
    d = d.filter((item) => categories.includes(item.Categories));
  }

  return d;
}

function getDataAttributes(blockName, block) {
  const options = {};
  const filterParentSection = block.closest(`.${blockName}-container`);
  options.scheme = filterParentSection.dataset.scheme ? filterParentSection.dataset.scheme.split(',').map((item) => item.trim()) : undefined;
  options.journey = filterParentSection.dataset.journey ? filterParentSection.dataset.journey.split(',').map((item) => item.trim()) : undefined;
  options.year = filterParentSection.dataset.year ? filterParentSection.dataset.year.split(',').map((item) => item.trim()) : undefined;
  options.categories = filterParentSection.dataset.categories ? filterParentSection.dataset.categories.split(',').map((item) => item.trim()) : undefined;
  options.communication = filterParentSection.dataset.communication ? filterParentSection.dataset.communication.split(',').map((item) => item.trim()) : undefined;
  options.journey = filterParentSection.dataset.journey ? filterParentSection.dataset.journey.split(',').map((item) => item.trim()) : undefined;
  options.client = filterParentSection.dataset.client ? filterParentSection.dataset.client.split(',').map((item) => item.trim()) : undefined;
  options.coverage = filterParentSection.dataset.coverage ? filterParentSection.dataset.coverage.split(',').map((item) => item.trim()) : undefined;
  options.product = filterParentSection.dataset.product ? filterParentSection.dataset.product.split(',').map((item) => item.trim()) : undefined;
  options.showFilter = filterParentSection.dataset.filter ? (filterParentSection.dataset.filter).toLowerCase() === 'show' : undefined;
  options.context = filterParentSection.dataset.context
    ? filterParentSection.dataset.context.trim() : undefined;
  options.type = filterParentSection.dataset.type
    ? filterParentSection.dataset.type.trim() : undefined;

  return options;
}

/*
 * Close the dropdown when you click anywhere outside
 * the dropdown
 */
document.addEventListener('click', (event) => {
  const withinDropdown = event.target.closest('.filter-dropdown');
  const isDropdownOpen = document.querySelector('.filter-dropdown-button[aria-expanded="true"]');
  if (!withinDropdown && isDropdownOpen) {
    closeOpenDropdowns();
  }
});

function sortDataByTitle(data) {
  return data.sort((a, b) => {
    const titleA = a.Title.toLowerCase();
    const titleB = b.Title.toLowerCase();

    if (titleA < titleB) {
      return -1;
    }
    if (titleA > titleB) {
      return 1;
    }
    return 0;
  });
}

export default async function decorate(block) {
  const blockName = getBlockName(block);
  const options = getDataAttributes(blockName, block);

  /* Saving the session key with type so that
   * it saves different key for different type and
   * and will ensure that the data received by filters
   * are unique.
   */
  const sessionKey = options.type ? `${constructURLFromMetadata(options.context, options.type)}-ApiData` : 'filterApiData';

  /*
   * There seems to be multiple calls for API when filter
   * is used multiple times on the page
   * store the data in a session storage
   * and use that value if already present
   */
  const filterApiDataFromSession = sessionStorage.getItem(sessionKey);
  let data = filterApiDataFromSession
    ? JSON.parse(filterApiDataFromSession) : await getFilterData(options);
  if (data.length > 0) {
    data = sortDataByTitle(data);
    sessionStorage.setItem(sessionKey, JSON.stringify(data));
  }

  data = getFiltersByDataAttribute(options, data);

  if (options.showFilter) createFilterheader(block, data, options);
  createFilterBody(block, data, options);

  // handle checkbox click
  const entries = data;
  const filterObj = {};
  filterObj.Scheme = [];
  filterObj.Journey = [];
  filterObj.Coverage = [];
  filterObj.Year = [];
  filterObj.Categories = [];
  filterObj.Communication = [];
  filterObj.Product = [];
  filterObj.Client = [];

  block.addEventListener('click', (event) => {
    if (event.target.className === 'filter-dropdown-button') {
      const dropdownBtn = event.target;
      const isExpanded = dropdownBtn.getAttribute('aria-expanded');
      setTimeout(() => {
        dropdownBtn.setAttribute('aria-expanded', isExpanded === 'true' ? 'false' : 'true');
      }, 0);
    }

    if (event.target.type === 'checkbox' && event.target.checked) {
      const fType = event.target.closest('.filter-dropdown-button').dataset.filterType;
      if (!filterObj[fType].includes(event.target.value)) {
        filterObj[fType].push(event.target.value);
        const filteredData = applyFilters(entries, filterObj);
        renderFilteredResults(block, filteredData, options);
      }
    } else if (event.target.type === 'checkbox' && !event.target.checked) {
      const fType = event.target.closest('.filter-dropdown-button').dataset.filterType;
      if (filterObj[fType].includes(event.target.value)) {
        filterObj[fType] = filterObj[fType].filter((item) => item !== event.target.value);
        const filteredData = applyFilters(entries, filterObj);
        renderFilteredResults(block, filteredData, options);
      }
    }

    if (event.target.type === 'radio' && event.target.checked) {
      const fType = event.target.closest('.filter-dropdown-button').dataset.filterType;
      if (!filterObj[fType].includes(event.target.value)) {
        filterObj[fType][0] = event.target.value;
        const filteredData = applyFilters(entries, filterObj);
        renderFilteredResults(block, filteredData, options);
      }
    }
  });

  window.addEventListener('beforeunload', clearSessionData);
}
