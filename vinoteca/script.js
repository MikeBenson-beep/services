const products = (window.catalogProducts || [])
  .filter(product => product.category !== 'farockaway')
  .map((product, id) => ({ ...product, id }));
const $ = selector => document.querySelector(selector);
const money = value => `$${new Intl.NumberFormat('es-AR').format(value)}`;
const normal = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const safe = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const imageFor = (product, full = false) => {
  const image = product.image || 'assets/arte-liquido-logo.jpg';
  return image.replace('thumb_280_', '');
};

const categoryMeta = {
  'vinos-tintos': { name: 'Vinos tintos', short: 'Tintos', description: 'Malbec, blends y grandes etiquetas para guardar o abrir hoy.' },
  'vinos-blancos': { name: 'Vinos blancos', short: 'Blancos', description: 'Blancos frescos, aromáticos y expresivos para cada mesa.' },
  'espumante-champagne': { name: 'Espumantes', short: 'Espumantes', description: 'Burbujas argentinas e importadas para celebrar bien.' },
  aperitivos: { name: 'Aperitivos', short: 'Aperitivos', description: 'Vermouth, bitter, fernet y clásicos para abrir el apetito.' },
  whiskys: { name: 'Whiskys', short: 'Whiskys', description: 'Scotch, Tennessee, rye y etiquetas de colección.' },
  gin: { name: 'Gin', short: 'Gin', description: 'London dry, botánicos y expresiones de autor.' },
  vodka: { name: 'Vodka', short: 'Vodka', description: 'Vodkas clásicos y saborizados para tomar o mezclar.' },
  licores: { name: 'Licores', short: 'Licores', description: 'Licores frutales, herbales y de sobremesa.' },
  cervezas: { name: 'Cervezas', short: 'Cervezas', description: 'Artesanales, importadas, clásicas y sin alcohol.' },
  'mixologia-botanica': { name: 'Mixología botánica', short: 'Mixología', description: 'Botánicos y kits para llevar cada trago un poco más lejos.' },
  promociones: { name: 'Promociones', short: 'Promos', description: 'Combos y oportunidades seleccionadas por tiempo limitado.' },
  regalleria: { name: 'Regalería', short: 'Regalería', description: 'Estuches, colecciones y objetos con presencia propia.' },
  cristaleria: { name: 'Cristalería', short: 'Cristalería', description: 'Copas, vasos y piezas para servir como corresponde.' },
  'sin-alcohol': { name: 'Sin alcohol', short: 'Sin alcohol', description: 'Alternativas, gaseosas y opciones para todos.' },
  farockaway: { name: 'Cocina Farockaway', short: 'Cocina', description: 'Platos y algo dulce para acompañar la experiencia.' }
};

const families = [
  { id: 'vinos', name: 'Vinos & burbujas', tagline: 'Tintos, blancos y espumantes', categories: ['vinos-tintos', 'vinos-blancos', 'espumante-champagne'] },
  { id: 'destilados', name: 'Destilados', tagline: 'Whisky, gin, vodka y licores', categories: ['whiskys', 'gin', 'vodka', 'licores', 'aperitivos'] },
  { id: 'cervezas', name: 'Cervezas', tagline: 'Clásicas, artesanales y packs', categories: ['cervezas'] },
  { id: 'regalos', name: 'Regalos & bar', tagline: 'Regalería, cristalería y botánicos', categories: ['regalleria', 'cristaleria', 'mixologia-botanica', 'promociones'] },
  { id: 'alternativas', name: 'Sin alcohol', tagline: 'Alternativas para todos', categories: ['sin-alcohol'] }
];

const curatedNames = [
  'Gran Enemigo - CORTE -',
  'Gin Mare Mediterranean 700 Ml Colección De Autor España',
  'SCAPA THE ORCADIAN - ESTUCHE',
  'Coleccion *La Trifulca *'
];

let activeCategory = 'todos';
let activeSubcategory = 'todos';
let visibleCount = 20;

function familyFor(product) {
  return families.find(family => family.categories.includes(product.category))?.name || 'Selección';
}

function subcategoryFor(product) {
  if (activeCategory === 'todos') return familyFor(product);
  if (activeCategory.startsWith('family:')) return categoryMeta[product.category]?.name || 'Selección';
  const n = normal(product.name);
  const has = (...terms) => terms.some(term => n.includes(term));
  switch (product.category) {
    case 'vinos-tintos':
      if (has('malbec')) return 'Malbec'; if (has('cabernet')) return 'Cabernet'; if (has('blend', 'corte')) return 'Blends & cortes'; if (has('pinot')) return 'Pinot Noir'; if (has('syrah')) return 'Syrah'; return 'Otras cepas';
    case 'vinos-blancos':
      if (has('chardonnay')) return 'Chardonnay'; if (has('sauvignon')) return 'Sauvignon Blanc'; if (has('pinot gris')) return 'Pinot Gris'; if (has('moscato', 'tardia', 'dulce')) return 'Dulces & aromáticos'; return 'Otros blancos';
    case 'espumante-champagne':
      if (has('rose', 'rosado')) return 'Rosé'; if (has('zero', '0%')) return 'Sin alcohol'; if (has('petnat', 'pet nat', 'naranjo')) return 'Pet Nat & naranjos'; if (has('brut', 'champagne', 'sparkling')) return 'Brut & espumantes'; return 'Especiales';
    case 'whiskys':
      if (has('jack daniel', 'tennessee', 'bourbon')) return 'Bourbon & Tennessee'; if (has('rye')) return 'Rye'; if (has('kamiki')) return 'Japonés'; if (has('chivas', 'scapa', 'scotch')) return 'Scotch'; return 'Kits & especiales';
    case 'gin':
      if (has('maracuya', 'royale', 'sabor')) return 'Saborizados'; if (has('london', 'dry', 'beefeater', 'tanqueray')) return 'London & Dry'; if (has('mare', 'hendrick', 'autor')) return 'Premium & autor'; return 'Otros gin';
    case 'vodka': return has('cherry', 'limon', 'cranberry', 'raspberry') ? 'Saborizados' : 'Clásicos';
    case 'aperitivos':
      if (has('fernet')) return 'Fernet'; if (has('martini', 'cinzano', 'vermouth', 'lillet')) return 'Vermouth'; if (has('aperol', 'bitter', 'campari', 'gancia')) return 'Bitter & spritz'; return 'Especiales';
    case 'cervezas':
      if (has('ipa', 'hoppy')) return 'IPA & Hoppy'; if (has('stout', 'porter', 'negra', 'noire')) return 'Negras'; if (has('cero', 'sin gluten')) return 'Alternativas'; if (has('box', 'degustacion')) return 'Packs'; return 'Lager & rubias';
    case 'licores':
      if (has('cafe', 'crema', 'cream')) return 'Cremosos & café'; if (has('orange', 'apricot', 'grenade', 'berry', 'frut')) return 'Frutales'; if (has('weed', 'herbal', 'amaro')) return 'Herbales'; return 'Clásicos & especiales';
    case 'cristaleria':
      if (has('gin', 'cocktail', 'martini', 'aperol')) return 'Coctelería'; if (has('vino', 'wine', 'agua', 'licor', 'copa')) return 'Copas'; if (has('vaso', 'whisky')) return 'Vasos'; if (has('decanter', 'botella')) return 'Decanters'; return 'Sets & accesorios';
    case 'mixologia-botanica':
      if (has('citric', 'naranja', 'pomelo')) return 'Cítricos'; if (has('spicy')) return 'Especiados'; if (has('kit', 'mix', 'six', 'ten', 'box')) return 'Kits botánicos'; return 'Botánicos';
    case 'regalleria':
      if (has('box', 'estuche', 'kit', 'coleccion')) return 'Boxes & estuches'; if (has('sacacorcho', 'ice', 'accesorio')) return 'Accesorios'; if (has('decanter', 'botella')) return 'Decanters'; return 'Ediciones especiales';
    case 'promociones': return has('box', 'caja', 'x 3', 'x 6') ? 'Boxes & combos' : has('aceite') ? 'Gourmet' : 'Botellas';
    case 'sin-alcohol': return has('miel') ? 'Gourmet' : has('cerveza', 'corona') ? 'Cervezas 0.0' : 'Gaseosas & jugos';
    case 'farockaway':
      if (has('pie', 'postre', 'torta', 'brownie')) return 'Postres'; if (has('sandwich', 'hamburguesa')) return 'Sándwiches'; if (has('ensalada')) return 'Ensaladas'; return 'Platos';
    default: return 'Selección';
  }
}

function currentPrice(product) { return product.salePrice && product.salePrice < product.price ? product.salePrice : product.price; }
function discountFor(product) { return product.salePrice && product.salePrice < product.price ? Math.round((1 - product.salePrice / product.price) * 100) : 0; }
function featuredScore(product) {
  const curatedIndex = curatedNames.indexOf(product.name);
  if (curatedIndex >= 0) return 2000 - curatedIndex * 50;
  const categoryWeight = { 'vinos-tintos': 90, whiskys: 80, gin: 70, 'espumante-champagne': 60, regalleria: 55, 'vinos-blancos': 50 }[product.category] || 0;
  return categoryWeight + Math.min(currentPrice(product) / 5000, 45) + (product.image ? 12 : 0) + Math.min(discountFor(product), 20);
}

function representative(category) {
  const family = category.startsWith('family:') ? families.find(item => item.id === category.split(':')[1]) : null;
  const candidates = products.filter(product => category === 'todos' || product.category === category || family?.categories.includes(product.category));
  return candidates.sort((a, b) => featuredScore(b) - featuredScore(a))[0];
}

function renderHero() {
  const chosen = curatedNames.slice(0, 2).map(name => products.find(product => product.name === name)).filter(Boolean);
  if (chosen.length < 2) chosen.push(...products.filter(product => product.image && product.salePrice).slice(0, 2 - chosen.length));
  const heroCard = product => product ? `<img src="${safe(imageFor(product, true))}" alt="${safe(product.name)}"><span>${safe(categoryMeta[product.category]?.short || product.category)}</span><strong>${safe(product.name)}</strong>` : '';
  $('#hero-product-main').innerHTML = heroCard(chosen[0]);
  $('#hero-product-side').innerHTML = heroCard(chosen[1]);
  $('#product-total').textContent = products.length;
  $('#menu-total').textContent = products.length;
}

function productCard(product, featured = false) {
  const discount = discountFor(product);
  return `<article class="product-card${featured ? ' is-featured' : ''}">
    <button class="product-open" type="button" data-id="${product.id}" aria-label="Ver ${safe(product.name)}">
      <span class="product-visual"><img loading="lazy" decoding="async" src="${safe(imageFor(product, featured))}" alt="${safe(product.name)}">${discount ? `<small class="sale-badge">-${discount}%</small>` : ''}${product.stock === 0 ? '<small class="stock-badge">Sin stock</small>' : ''}<i class="view-product">Ver detalle</i></span>
      <span class="product-body"><small>${safe(categoryMeta[product.category]?.short || product.category)}</small><strong>${safe(product.name)}</strong><span class="price-line">${discount ? `<s>${money(product.price)}</s>` : ''}<b>${money(currentPrice(product))}</b></span></span>
    </button>
  </article>`;
}

function renderFeatured() {
  let selection = curatedNames.map(name => products.find(product => product.name === name)).filter(Boolean);
  if (selection.length < 4) selection.push(...products.filter(product => product.image && product.salePrice && !selection.includes(product)).slice(0, 4 - selection.length));
  $('#featured-grid').innerHTML = selection.slice(0, 4).map(product => productCard(product, true)).join('');
}

function renderNavigation() {
  $('#menu-groups').innerHTML = families.map(family => `
    <section class="menu-group"><span>${safe(family.tagline)}</span><h3>${safe(family.name)}</h3><div>
      ${family.categories.map(category => `<button type="button" data-category="${category}"><span>${safe(categoryMeta[category].name)}</span><b>${products.filter(product => product.category === category).length}</b></button>`).join('')}
    </div></section>`).join('');

  $('#family-navigation').innerHTML = families.slice(0, 4).map(family => {
    const product = representative(family.categories[0]);
    return `<article class="family-card">
      <button type="button" data-category="family:${family.id}">
        <span class="family-image" style="background-image:url('${safe(imageFor(product, true))}')"></span>
        <span class="family-copy"><small>${safe(family.tagline)}</small><strong>${safe(family.name)}</strong><i>Explorar →</i></span>
      </button>
    </article>`;
  }).join('');
}

function renderSubcategories() {
  const activeFamily = activeCategory.startsWith('family:') ? families.find(family => family.id === activeCategory.split(':')[1]) : null;
  const categoryProducts = products.filter(product => activeCategory === 'todos' || product.category === activeCategory || activeFamily?.categories.includes(product.category));
  const subcategories = [...new Set(categoryProducts.map(subcategoryFor))].sort();
  if (!subcategories.includes(activeSubcategory)) activeSubcategory = 'todos';
  $('#subcategories').innerHTML = `<button type="button" class="subcategory ${activeSubcategory === 'todos' ? 'is-active' : ''}" data-subcategory="todos">Todos</button>` + subcategories.map(sub => `<button type="button" class="subcategory ${activeSubcategory === sub ? 'is-active' : ''}" data-subcategory="${safe(sub)}">${safe(sub)}</button>`).join('');
}

function filteredProducts() {
  const query = normal($('#search').value.trim());
  let result = products.filter(product => {
    const activeFamily = activeCategory.startsWith('family:') ? families.find(family => family.id === activeCategory.split(':')[1]) : null;
    const categoryMatch = activeCategory === 'todos' || product.category === activeCategory || activeFamily?.categories.includes(product.category);
    const subcategoryMatch = activeSubcategory === 'todos' || subcategoryFor(product) === activeSubcategory;
    const searchMatch = !query || normal(`${product.name} ${categoryMeta[product.category]?.name || ''} ${subcategoryFor(product)}`).includes(query);
    return categoryMatch && subcategoryMatch && searchMatch;
  });
  const sort = $('#sort').value;
  if (sort === 'price-asc') result.sort((a, b) => currentPrice(a) - currentPrice(b));
  else if (sort === 'price-desc') result.sort((a, b) => currentPrice(b) - currentPrice(a));
  else if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  else result.sort((a, b) => featuredScore(b) - featuredScore(a));
  return result;
}

function renderCollection() {
  const result = filteredProducts();
  const shown = result.slice(0, visibleCount);
  $('#product-grid').innerHTML = shown.map(product => productCard(product)).join('');
  $('#result-count').textContent = `${result.length} ${result.length === 1 ? 'producto' : 'productos'}`;
  $('#empty-state').hidden = result.length !== 0;
  $('#load-more').hidden = shown.length >= result.length;
  const activeFamily = activeCategory.startsWith('family:') ? families.find(family => family.id === activeCategory.split(':')[1]) : null;
  const meta = activeCategory === 'todos'
    ? { name: 'Todo el catálogo', short: 'Todas', description: 'Una selección completa de vinos, bebidas y objetos para disfrutar mejor.' }
    : activeFamily
      ? { name: activeFamily.name, short: activeFamily.name, description: activeFamily.tagline + '. Una selección reunida para comparar y descubrir con facilidad.' }
      : categoryMeta[activeCategory];
  $('#active-category-title').textContent = meta.name;
  $('#active-category-description').textContent = meta.description;
  $('#browse-current').textContent = meta.short || meta.name;
  const imageProduct = representative(activeCategory);
  $('#collection-image').style.backgroundImage = imageProduct ? `url('${imageFor(imageProduct, true)}')` : '';
  document.querySelectorAll('[data-category]').forEach(button => button.classList.toggle('is-active', button.dataset.category === activeCategory));
}

function resetAndRender() { visibleCount = 20; renderSubcategories(); renderCollection(); }

function closeCatalogMenu() {
  $('#catalog-menu').classList.remove('is-open');
  $('#catalog-menu').setAttribute('aria-hidden', 'true');
  $('#catalog-menu-toggle').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

function openCatalogMenu() {
  $('#catalog-menu').classList.add('is-open');
  $('#catalog-menu').setAttribute('aria-hidden', 'false');
  $('#catalog-menu-toggle').setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  requestAnimationFrame(() => $('#catalog-menu-close').focus());
}

function selectCategory(category, shouldScroll = true) {
  activeCategory = category;
  activeSubcategory = 'todos';
  resetAndRender();
  closeCatalogMenu();
  if (shouldScroll) $('#collection-banner').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openProduct(id) {
  const product = products.find(item => item.id === Number(id));
  if (!product) return;
  const discount = discountFor(product);
  $('#dialog-image').innerHTML = `<img src="${safe(imageFor(product, true))}" alt="${safe(product.name)}">${discount ? `<span>-${discount}%</span>` : ''}`;
  $('#dialog-category').textContent = `${categoryMeta[product.category]?.name || product.category} · ${subcategoryFor(product)}`;
  $('#dialog-name').textContent = product.name;
  $('#dialog-price').innerHTML = `${discount ? `<s>${money(product.price)}</s>` : ''}<strong>${money(currentPrice(product))}</strong>`;
  $('#dialog-stock').textContent = product.stock === null ? 'Consultá disponibilidad' : product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock en este momento';
  $('#dialog-whatsapp').href = `https://wa.me/5491162136530?text=${encodeURIComponent(`Hola Arte Líquido, quiero consultar por ${product.name}.`)}`;
  $('#product-dialog').showModal();
}

document.addEventListener('click', event => {
  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) selectCategory(categoryButton.dataset.category);
  const productButton = event.target.closest('.product-open');
  if (productButton) openProduct(productButton.dataset.id);
});

$('#subcategories').addEventListener('click', event => {
  const button = event.target.closest('[data-subcategory]');
  if (!button) return;
  activeSubcategory = button.dataset.subcategory;
  visibleCount = 20;
  renderSubcategories();
  renderCollection();
});

$('#catalog-menu-toggle').addEventListener('click', openCatalogMenu);
$('#browse-button').addEventListener('click', openCatalogMenu);
$('#hero-catalog-button').addEventListener('click', openCatalogMenu);
$('#catalog-menu-close').addEventListener('click', closeCatalogMenu);
$('#menu-backdrop').addEventListener('click', closeCatalogMenu);
$('#header-search').addEventListener('click', () => { $('#catalogo').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#search').focus(), 500); });
$('#search').addEventListener('input', resetAndRender);
$('#sort').addEventListener('change', resetAndRender);
$('#load-more').addEventListener('click', () => { visibleCount += 20; renderCollection(); });
$('#dialog-close').addEventListener('click', () => $('#product-dialog').close());
$('#product-dialog').addEventListener('click', event => { if (event.target === $('#product-dialog')) $('#product-dialog').close(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCatalogMenu(); });

renderHero();
renderFeatured();
renderNavigation();
renderSubcategories();
renderCollection();
