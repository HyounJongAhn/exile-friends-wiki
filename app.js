'use strict';
(() => {
  const $ = (query, root = document) => root.querySelector(query);
  const data = window.EXILE_GUIDE;
  if (!data || !Array.isArray(data.guides)) {
    $('#main').innerHTML = '<section class="article-header"><h1>공략을 불러오지 못했어요</h1><p>페이지를 새로고침해주세요. 파일로 보고 있다면 공략 폴더 전체를 함께 옮겨주세요.</p><button class="button" onclick="location.reload()">다시 불러오기</button></section>';
    return;
  }
  const paths = {
    crest:'M12 2 3 5v6c0 5 4 8 9 11 5-3 9-6 9-11V5ZM7 15l5-8 5 8M10 12h4',
    sword:'m14 3 7 0 0 7-10 10-7-7ZM3 21l4-4m-5-5 10 10',
    gem:'m3 8 5-5h8l5 5-9 13ZM3 8h18M8 3l4 18 4-18',
    users:'M16 21v-3c0-3-3-5-7-5s-7 2-7 5v3m19 0v-3c0-2-1-4-3-4M14 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0m3-4a5 5 0 0 1 0 10',
    sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
    home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    download:'M12 2v13m-5-5 5 5 5-5M3 15v6h18v-6',
    keyboard:'M2 5h20v14H2ZM5 9h1m3 0h1m3 0h1m3 0h1M5 12h1m3 0h1m3 0h1m3 0h1M6 16h12',
    server:'M4 3h16v7H4Zm0 11h16v7H4ZM7 6h.1M7 17h.1M11 6h6m-6 11h6',
    help:'M9 8a3 3 0 1 1 4 3c-1 .5-1 1-1 3m0 3h.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    check:'m7 12 3 3 7-7M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    book:'M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16',
    code:'m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
    search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    menu:'M4 6h16M4 12h16M4 18h16',
    arrow:'M4 12h16m-6-6 6 6-6 6',
    link:'m10 13 4-4M8 15l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 3 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.book}"/></svg>`;
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = text => String(text).toLocaleLowerCase().replace(/\s+/g, '');
  const guides = new Map(data.guides.map(guide => [guide.id, guide]));
  const searchCorpus = data.guides.map(guide => ({guide, text:normalize(guide.title + ' ' + guide.description + ' ' + guide.text)}));
  const roles = [
    {id:'warrior', name:'가까이서 묵직하게', title:'전사', tag:'근접 전투', skill:'태세 · 강타', text:'앞에서 맞붙는 전투가 좋다면 전사부터. 무기와 스킬을 맞추며 가까운 적을 상대해요.', note:'첫 스킬을 고른 뒤 단축키에 넣고, 가까운 적에게 한 번 써봐요.'},
    {id:'hunter', name:'거리를 두고 빠르게', title:'사냥꾼', tag:'원거리 전투', skill:'연발 화살', text:'활을 쏘며 움직이는 전투가 좋다면 사냥꾼부터. 적과의 거리를 보며 공격할 기회를 만들어요.', note:'화살을 쏜 뒤 자리도 옮겨봐요. 친구와 같은 적을 노리면 전투가 한결 편해요.'},
    {id:'sorcerer', name:'마법을 터뜨리며', title:'원소술사', tag:'마법 전투', skill:'화염구', text:'원소 마법으로 싸우고 싶다면 원소술사부터. 새 장비와 스킬을 하나씩 바꾸며 내 전투를 찾아요.', note:'스킬에 필요한 자원을 확인하고, 무리한 연속 사용보다 공격 타이밍부터 익혀봐요.'},
  ];
  let selectedRole = 'warrior', searchIndex = -1, searchResults = [], toastTimer;
  const route = () => location.hash.slice(1) || 'home';
  function fillIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(node => node.innerHTML = icon(node.dataset.icon)); }
  function nav() {
    const groups = [...new Set(data.guides.map(guide => guide.group))];
    $('#navigation').innerHTML = groups.map(group => `<div class="nav-group"><p>${escape(group)}</p>${data.guides.filter(guide => guide.group === group).map(guide => `<a class="nav-link" href="#guide/${guide.id}">${icon(guide.icon)}<span>${escape(guide.title)}</span></a>`).join('')}</div>`).join('');
  }
  function home() {
    document.title = '우리의 원정대 · Craft to Exile 2';
    $('#main').innerHTML = `<div class="page-top"><span>여섯 친구, 하나의 원정대</span><span class="edition">CRAFT TO EXILE 2 · ${escape(data.packVersion)}</span></div>
      <section class="hero" aria-labelledby="hero-title">${data.hasBanner ? '<img class="hero-art" src="assets/rpg-banner.png" alt="등불이 켜진 중세 성문과 모험가들의 콘셉트 그림" fetchpriority="high" width="1536" height="512">' : ''}<div class="hero-copy"><p class="hero-kicker">OUR NEXT ADVENTURE</p><h1 id="hero-title">돌아올 곳은 함께.<br>모험은 각자의 방식으로.</h1><p class="hero-description">새 스킬, 뜻밖의 장비, 다음 던전.<br>친구들과 떠나는 우리의 첫 원정.</p><div class="buttons"><a class="button primary" href="#guide/rpg">우리의 첫 30분 ${icon('arrow')}</a><a class="button ghost" href="#guide/rpg-install">설치하고 합류하기</a></div></div><span class="art-note">분위기 일러스트 · 실제 게임 화면이 아니에요</span></section>
      <div class="quickbar"><span>${icon('users')}최대 6명, 함께 시작</span><span>${icon('sword')}직업 · 스킬 · 장비 파밍</span><span>${icon('home')}건축과 생활도 함께</span><span>Minecraft Java 1.20.1</span></div>
      <section class="section"><div class="section-heading"><div><p class="eyebrow">ADVENTURE NOTES</p><h2>오늘은, 무엇부터 해볼까?</h2></div><a class="text-link" href="#guide/rpg-keys">자주 쓰는 키 ${icon('arrow')}</a></div><div class="path-grid">${[
        ['01','sword','내 전투를 찾기','직업과 스킬을 고르고, 레벨 5부터는 용병과 함께 싸워요.','rpg-combat','직업 · 스킬 · 용병'],
        ['02','gem','다음 장비를 모으기','전리품을 정리하고 유니크 도감을 하나씩 채워봐요.','rpg-loot','가방 · 장비 · 도감'],
        ['03','users','친구와 함께 출발','전투 파티와 퀘스트 팀을 맞춰, 같은 목표로 떠나요.','rpg-team','파티 · 퀘스트 · 던전'],
      ].map(([n, ico, title, body, id, tag]) => `<a class="path-card" href="#guide/${id}"><div class="card-top"><span class="card-icon">${icon(ico)}</span><span>${n}</span></div><h3>${title}</h3><p>${body}</p><div class="card-bottom"><span>${tag}</span>${icon('arrow')}</div></a>`).join('')}</div></section>
      <section class="section play-style"><div class="section-heading"><div><p class="eyebrow">FIND YOUR WAY</p><h2>나는 어떤 전투가 좋을까?</h2></div><span class="section-caption">처음 고를 때 참고해요</span></div><div class="style-picker" aria-label="전투 취향 선택">${roles.map(role => `<button data-role="${role.id}" aria-pressed="${role.id === selectedRole}">${role.name}</button>`).join('')}</div><div id="style-detail" class="style-detail" aria-live="polite"></div></section>
      <section class="section start-route"><div><p class="eyebrow">THE FIRST EVENING</p><h2>첫날은 이 세 가지만.</h2><p>처음부터 모든 기능을 배울 필요는 없어요.<br>오늘 함께 할 작은 목표를 정해봐요.</p><a class="text-link" href="#guide/rpg">첫 30분 안내 보기 ${icon('arrow')}</a></div><ol class="route-steps"><li><span class="step-number">1</span><div><h3><kbd>U</kbd>를 눌러 첫 보상 받기</h3><p>시작 퀘스트를 확인하고 철 배낭과 빵을 챙겨요.</p></div></li><li><span class="step-number">2</span><div><h3>첫 스킬 한 번 써보기</h3><p>내 전투 방식을 고르고 스킬을 단축키에 넣어요.</p></div></li><li><span class="step-number">3</span><div><h3>친구와 가까운 곳부터 탐험</h3><p>전투 파티를 만들고, 돌아올 거점을 함께 정해요.</p></div></li></ol></section>
      <section class="section"><div class="section-heading"><div><p class="eyebrow">KEEP THIS CLOSE</p><h2>막히면, 여기서 찾아봐요.</h2></div></div><div class="guide-directory">${data.guides.filter(guide => ['rpg-install','rpg-map','rpg-life','rpg-host','rpg-help','rpg-keys'].includes(guide.id)).map(guide => `<a class="directory-link" href="#guide/${guide.id}">${icon(guide.icon)}<div><h3>${escape(guide.title)}</h3><p>${escape(guide.description)}</p></div>${icon('arrow')}</a>`).join('')}</div></section>
      <div class="scope-note">${icon('book')}<p>원본 팩의 퀘스트·전투·생활 기능을 바탕으로 정리했어요. 장비의 자세한 수치와 조합은 게임 안 퀘스트와 아이템 설명도 함께 확인해주세요. <a href="#guide/rpg-verification">실제로 확인한 범위</a></p></div>`;
    updateRole();
    document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => { selectedRole = button.dataset.role; updateRole(); }));
  }
  function updateRole() {
    const role = roles.find(item => item.id === selectedRole);
    $('#style-detail').innerHTML = `<div class="style-identity"><span class="role-symbol">${icon(role.id === 'warrior' ? 'sword' : role.id === 'hunter' ? 'crest' : 'sun')}</span><div><span>${role.tag}</span><h3>${role.title}</h3></div></div><div class="style-description"><p>${role.text}</p><div class="skill-note"><strong>시작 스킬 · ${role.skill}</strong><span>${role.note}</span></div><a class="text-link" href="#guide/rpg-combat">직업과 용병 알아보기 ${icon('arrow')}</a></div>`;
    document.querySelectorAll('[data-role]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.role === selectedRole)));
  }
  async function copyLink() {
    const text = data.publicWiki + location.hash;
    try { await navigator.clipboard.writeText(text); showToast('이 공략의 주소를 복사했어요.'); }
    catch { showToast('주소창의 페이지 주소를 복사해주세요.'); }
  }
  function article(guide) {
    document.title = guide.title + ' · 우리의 원정대';
    const headings = guide.headings || [];
    $('#main').innerHTML = `<div class="page-top"><a href="#home">원정대의 기록</a><span>${escape(guide.group)}</span></div><header class="article-header"><span class="article-symbol">${icon(guide.icon)}</span><p class="eyebrow">${escape(guide.group)}</p><h1>${escape(guide.title)}</h1><p>${escape(guide.description)}</p><div class="article-tools"><span>Craft to Exile 2 ${escape(data.packVersion)}</span><button class="text-link" id="copy-link">${icon('link')}공략 주소 복사</button></div></header><div class="article-layout"><article class="prose">${guide.html}<div class="article-end"><a href="#home">${icon('arrow')} 공략 첫 화면으로</a><a href="#guide/rpg-help">막힌 곳이 있나요?</a></div></article><aside class="toc" aria-label="이 공략의 목차"><p>이 공략에서</p>${headings.map(heading => `<a href="#${escape(heading.id)}" data-section="${escape(heading.id)}">${escape(heading.title)}</a>`).join('')}</aside></div>`;
    $('#copy-link').addEventListener('click', copyLink);
    $('#main').querySelectorAll('.table-scroll').forEach(wrap => { wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', guide.title + ' 표, 가로로 스크롤할 수 있어요'); });
    $('#main').querySelectorAll('[data-section]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); const heading = document.getElementById(link.dataset.section); heading?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'}); if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); } }));
  }
  function render() {
    const path = route();
    const id = path.startsWith('guide/') ? path.slice(6) : path === 'items' ? 'rpg-loot' : null;
    if (id && guides.has(id)) article(guides.get(id));
    else if (path === 'home' || path === 'main') home();
    else $('#main').innerHTML = `<header class="article-header"><h1>공략을 찾지 못했어요</h1><p>메뉴나 검색에서 다시 찾아볼 수 있어요.</p><a class="button primary" href="#home">첫 화면으로</a></header>`;
    document.querySelectorAll('.nav-link').forEach(link => { const active = link.getAttribute('href') === '#' + (id ? 'guide/' + id : path); link.classList.toggle('active', active); if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    closeMenu();
    window.scrollTo(0,0);
  }
  function showToast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200); }
  function closeMenu() { const restoreFocus = document.body.classList.contains('menu-open') && $('#sidebar').contains(document.activeElement); document.body.classList.remove('menu-open'); $('#backdrop').hidden = true; $('#menu-button').setAttribute('aria-expanded','false'); if (restoreFocus) $('#menu-button').focus(); }
  function openSearch() { closeMenu(); $('#search-dialog').showModal(); $('#search-input').value = ''; search(); $('#search-input').focus(); }
  function search() {
    const query = normalize($('#search-input').value);
    searchResults = searchCorpus.filter(item => !query || item.text.includes(query)).sort((a,b) => Number(normalize(b.guide.title).includes(query)) - Number(normalize(a.guide.title).includes(query))).slice(0,12).map(item => item.guide);
    searchIndex = -1;
    $('#search-status').textContent = query ? `${searchResults.length}개 공략을 찾았어요.` : '찾고 싶은 단어를 쓰거나 공략을 골라주세요.';
    $('#search-results').innerHTML = searchResults.length ? searchResults.map((guide, index) => `<a class="search-result" href="#guide/${guide.id}" data-result="${index}">${icon(guide.icon)}<div><small>${escape(guide.group)}</small><strong>${escape(guide.title)}</strong><p>${escape(guide.description)}</p></div>${icon('arrow')}</a>`).join('') : '<p class="empty-search">다른 단어로 찾아볼까요? 예: 스킬, 파티, 설치</p>';
    document.querySelectorAll('[data-result]').forEach(link => link.addEventListener('click', () => { $('#search-dialog').close(); requestAnimationFrame(() => $('#main').focus({preventScroll:true})); }));
  }
  document.addEventListener('keydown', event => {
    if (event.isComposing || event.keyCode === 229) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!$('#search-dialog').open) openSearch(); }
    if (event.key === 'Escape') { closeMenu(); if ($('#search-dialog').open) { event.preventDefault(); $('#search-dialog').close(); } }
    if (event.key === 'Tab' && document.body.classList.contains('menu-open')) {
      const links = [...$('#sidebar').querySelectorAll('a[href]')], first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $('#search-input').addEventListener('input', search);
  $('#search-input').addEventListener('keydown', event => {
    if (event.isComposing || event.keyCode === 229 || !searchResults.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); searchIndex = searchIndex < 0 ? (event.key === 'ArrowDown' ? 0 : searchResults.length - 1) : (searchIndex + (event.key === 'ArrowDown' ? 1 : -1) + searchResults.length) % searchResults.length;
      document.querySelectorAll('[data-result]').forEach((link,index) => link.classList.toggle('selected', index === searchIndex));
      $(`[data-result="${searchIndex}"]`).scrollIntoView({block:'nearest'});
    } else if (event.key === 'Enter' && searchIndex >= 0) { event.preventDefault(); $(`[data-result="${searchIndex}"]`).click(); }
  });
  document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', openSearch));
  $('#search-close').addEventListener('click', () => $('#search-dialog').close());
  $('#search-dialog').addEventListener('click', event => { if (event.target === $('#search-dialog')) { const bounds = event.target.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close(); } });
  $('#menu-button').addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); $('#backdrop').hidden = !open; $('#menu-button').setAttribute('aria-expanded', String(open)); if (open) $('#sidebar a')?.focus(); });
  $('#backdrop').addEventListener('click', closeMenu);
  document.querySelector('.skip').addEventListener('click', event => { event.preventDefault(); $('#main').focus(); });
  window.addEventListener('hashchange', render);
  nav(); fillIcons();
  if (data.hasIcon) $('.brand-emblem').innerHTML = '<img src="assets/rpg-icon.png" alt="" width="48" height="48">';
  $('#version').textContent = '공략 ' + data.version + ' · ' + data.updated;
  render();
})();
