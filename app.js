const storageKey = 'recall-study-sets';
const $ = (selector) => document.querySelector(selector);
const views = ['home-view', 'editor-view', 'study-view'];
let sets = [];
let editingId = null;
let studyingId = null;
let cardIndex = 0;
let showingDefinition = false;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    sets = saved.filter((set) => set && typeof set.id === 'string' && typeof set.title === 'string' &&
      Array.isArray(set.cards) && set.cards.length && set.cards.every((card) =>
        card && typeof card.term === 'string' && typeof card.definition === 'string'));
  }
} catch {
  // Storage may be unavailable or contain invalid data.
}

function showView(id) {
  views.forEach((view) => { document.getElementById(view).hidden = view !== id; });
  window.scrollTo(0, 0);
}

function saveSets(updated) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
    sets = updated;
    return true;
  } catch {
    alert('Your changes could not be saved. Check that browser storage is available and try again.');
    return false;
  }
}

function renderSets() {
  const list = $('#set-list');
  list.replaceChildren();
  $('#empty-state').hidden = sets.length > 0;
  $('#set-count').textContent = `${sets.length} ${sets.length === 1 ? 'SET' : 'SETS'}`;
  sets.forEach((set, index) => {
    const item = document.createElement('article');
    item.className = 'set-card';
    const top = document.createElement('div');
    top.className = 'set-card-top';
    const badge = document.createElement('span');
    badge.className = 'set-badge';
    badge.textContent = `SET ${String(index + 1).padStart(2, '0')}`;
    const star = document.createElement('span');
    star.textContent = '✳';
    top.append(badge, star);
    const title = document.createElement('h3');
    title.textContent = set.title;
    const description = document.createElement('p');
    description.textContent = set.description || 'Ready when you are.';
    const count = document.createElement('span');
    count.className = 'card-count';
    count.textContent = `${set.cards.length} ${set.cards.length === 1 ? 'CARD' : 'CARDS'}`;
    const actions = document.createElement('div');
    actions.className = 'set-actions';
    const study = document.createElement('button');
    study.className = 'button button-dark';
    study.type = 'button';
    study.textContent = 'Study set ↗';
    study.addEventListener('click', () => startStudy(set.id));
    const edit = document.createElement('button');
    edit.className = 'text-button';
    edit.type = 'button';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => openEditor(set.id));
    const remove = document.createElement('button');
    remove.className = 'text-button';
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      if (confirm(`Delete "${set.title}" and all its cards?`) && saveSets(sets.filter((entry) => entry.id !== set.id))) renderSets();
    });
    actions.append(study, edit, remove);
    item.append(top, title, description, count, actions);
    list.append(item);
  });
}

function updateCardNumbers() {
  const cards = [...$('#card-fields').children];
  cards.forEach((card, index) => {
    card.querySelector('.card-number').textContent = `CARD ${String(index + 1).padStart(2, '0')}`;
    card.querySelector('.remove-card').disabled = cards.length === 1;
  });
}

function addCard(card = { term: '', definition: '' }) {
  const field = $('#card-template').content.firstElementChild.cloneNode(true);
  field.querySelector('.term-input').value = card.term;
  field.querySelector('.definition-input').value = card.definition;
  field.querySelector('.remove-card').addEventListener('click', () => {
    field.remove();
    updateCardNumbers();
  });
  $('#card-fields').append(field);
  updateCardNumbers();
}

function openEditor(id = null) {
  const set = sets.find((entry) => entry.id === id);
  editingId = set ? id : null;
  $('#editor-title').textContent = set ? 'Edit your study set.' : 'Create a study set.';
  $('#set-title').value = set ? set.title : '';
  $('#set-description').value = set ? set.description || '' : '';
  $('#card-fields').replaceChildren();
  (set ? set.cards : [{ term: '', definition: '' }, { term: '', definition: '' }]).forEach(addCard);
  showView('editor-view');
  $('#set-title').focus();
}

function startStudy(id) {
  studyingId = id;
  cardIndex = 0;
  showingDefinition = false;
  const set = sets.find((entry) => entry.id === id);
  $('#study-title').textContent = set.title;
  $('#study-description').textContent = set.description || 'Take your time. You’ve got this.';
  renderCard();
  showView('study-view');
}

function renderCard() {
  const set = sets.find((entry) => entry.id === studyingId);
  const card = set.cards[cardIndex];
  $('#flashcard-side').textContent = showingDefinition ? 'DEFINITION' : 'TERM';
  $('#flashcard-text').textContent = showingDefinition ? card.definition : card.term;
  $('#study-progress').textContent = `${cardIndex + 1} / ${set.cards.length}`;
  $('#previous-card').disabled = cardIndex === 0;
  $('#next-card').disabled = cardIndex === set.cards.length - 1;
}

['#new-set', '#hero-create', '#empty-create'].forEach((selector) => $(selector).addEventListener('click', () => openEditor()));
document.querySelectorAll('[data-home]').forEach((button) => button.addEventListener('click', () => { renderSets(); showView('home-view'); }));
$('.brand').addEventListener('click', (event) => { event.preventDefault(); renderSets(); showView('home-view'); });
$('#add-card').addEventListener('click', () => addCard());
$('#set-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const title = $('#set-title').value.trim();
  const cards = [...$('#card-fields').children].map((field) => ({
    term: field.querySelector('.term-input').value.trim(),
    definition: field.querySelector('.definition-input').value.trim()
  }));
  if (!title || cards.some((card) => !card.term || !card.definition)) {
    alert('Please enter a title, term, and definition without leaving any fields blank.');
    return;
  }
  const set = { id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, description: $('#set-description').value.trim(), cards };
  const updated = editingId ? sets.map((entry) => entry.id === editingId ? set : entry) : [...sets, set];
  if (saveSets(updated)) { renderSets(); showView('home-view'); }
});
$('#flashcard').addEventListener('click', () => { showingDefinition = !showingDefinition; renderCard(); });
$('#previous-card').addEventListener('click', () => { if (cardIndex > 0) { cardIndex--; showingDefinition = false; renderCard(); } });
$('#next-card').addEventListener('click', () => {
  const set = sets.find((entry) => entry.id === studyingId);
  if (cardIndex < set.cards.length - 1) { cardIndex++; showingDefinition = false; renderCard(); }
});
renderSets();
