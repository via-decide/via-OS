'use strict';

function createAppCard(app, actions = {}) {
  const card = document.createElement('article');
  card.className = 'marketplace-card';
  card.style.cssText = [
    'background:#101726',
    'border:1px solid #22334f',
    'border-radius:12px',
    'padding:14px',
    'display:flex',
    'flex-direction:column',
    'gap:8px'
  ].join(';');

  const title = document.createElement('h3');
  title.textContent = app.name;
  title.style.margin = '0';

  const meta = document.createElement('p');
  meta.textContent = `Creator: ${app.creator} • Category: ${app.category}`;
  meta.style.cssText = 'margin:0;color:#9fb3d1;font-size:13px';

  const description = document.createElement('p');
  description.textContent = app.description || 'No description';
  description.style.cssText = 'margin:0;color:#dce7ff;font-size:13px';

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';

  const launchButton = document.createElement('button');
  launchButton.type = 'button';
  launchButton.textContent = 'Launch';
  launchButton.addEventListener('click', () => actions.onLaunch && actions.onLaunch(app));

  const duplicateButton = document.createElement('button');
  duplicateButton.type = 'button';
  duplicateButton.textContent = 'Duplicate';
  duplicateButton.addEventListener('click', () => actions.onDuplicate && actions.onDuplicate(app));

  const installButton = document.createElement('button');
  installButton.type = 'button';
  installButton.textContent = 'Install';
  installButton.addEventListener('click', () => actions.onInstall && actions.onInstall(app));

  controls.append(launchButton, duplicateButton, installButton);
  card.append(title, meta, description, controls);

  return card;
}

window.DaxiniMarketplaceCard = {
  createAppCard
};
