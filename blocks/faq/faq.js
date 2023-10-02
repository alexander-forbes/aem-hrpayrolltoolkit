import ffetch from '../../scripts/ffetch.js';
import { clearSessionData, getFirstItemOfPath, isSidekick } from '../../scripts/scripts.js';

const client = isSidekick() ? 'investec' : getFirstItemOfPath(window.location.pathname);

function closeAllOtherFaqs(faq) {
  document.querySelectorAll('.faq-accordion').forEach((acc) => {
    if (acc !== faq && acc.classList.contains('active')) {
      acc.classList.remove('active');
    }
  });
}

function toggleFaq(e) {
  const faq = e.target.parentElement;
  closeAllOtherFaqs(faq);
  faq.classList.toggle('active');
}

function addFaqEventListeners(block) {
  block.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', toggleFaq);
    question.addEventListener('keydown', (event) => {
      const { keyCode } = event;
      if (keyCode === 32 || keyCode === 13) {
        toggleFaq(event);
      }
    });
  });
}

async function fetchAccordionData() {
  try {
    const response = await ffetch(`/${client}/accordion-data.json`)
      .withFetch(fetch).all();
    return response;
  } catch (err) {
    return err;
  }
}

function updatedFaqs(data, faqs) {
  data.forEach(({ question, answer }) => {
    faqs.push({
      question, answer,
    });
  });
  return faqs;
}

async function handleDynamicAccordion(block, faqs) {
  if (!block.closest('.faq-container').dataset.accordiontype) {
    return faqs;
  }

  /*
   * There seems to be multiple calls for API when faq
   * is used multiple times on the page
   * store the data in a session storage
   * and use that value if already present
   */
  const faqApiDataFromSession = sessionStorage.getItem('faqApiData');
  const data = faqApiDataFromSession
    ? JSON.parse(faqApiDataFromSession) : await fetchAccordionData();

  if (data.length > 0) {
    sessionStorage.setItem('faqApiData', JSON.stringify(data));
  }

  return updatedFaqs(data, faqs);
}

export default async function decorate(block) {
  let faqs = [];
  const rows = Array.from(block.children);
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    const question = cells[0] && cells[0].textContent;
    const answer = cells[1] && cells[1].innerHTML;
    faqs.push({
      question, answer,
    });
  });

  block.innerHTML = '';

  faqs = await handleDynamicAccordion(block, faqs);

  faqs.forEach((faq, i) => {
    const { question, answer } = faq;

    const accordion = document.createElement('div');
    accordion.className = 'faq-accordion';
    block.append(accordion);

    const questionDiv = document.createElement('div');
    questionDiv.className = 'faq-question';
    accordion.append(questionDiv);
    questionDiv.innerHTML = question;

    const chevron = document.createElement('i');
    chevron.className = 'chevron';
    questionDiv.append(chevron);

    const answerDiv = document.createElement('div');
    answerDiv.className = 'faq-answer';
    accordion.append(answerDiv);
    answerDiv.innerHTML = answer;

    if (i === 0) {
      accordion.classList.add('active');
    }
  });

  /**
   * Look for anchor tags and add a class if it's a link
   * pointing to a PDF file. This is to render them similar to
   * how PDF links are rendered outside this block.
   */
  const anchorEls = Array.from(block.querySelectorAll('a'));
  anchorEls.forEach((el) => {
    if (el.href.includes('.pdf')) {
      el.classList.add('faq-file');
    }
  });

  addFaqEventListeners(block);

  window.addEventListener('beforeunload', clearSessionData);
}
