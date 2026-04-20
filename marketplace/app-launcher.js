'use strict';

function getAppSlug(appOrSlug) {
  if (typeof appOrSlug === 'string') return appOrSlug;
  if (appOrSlug && typeof appOrSlug === 'object') return appOrSlug.slug || appOrSlug.id || '';
  return '';
}

function launchApp(appOrSlug, options = {}) {
  const slug = getAppSlug(appOrSlug);
  if (!slug) return;
  const basePath = options.basePath || '/apps';
  window.location.href = `${basePath}/${slug}`;
}

function installToWorkspace(appOrSlug, options = {}) {
  const slug = getAppSlug(appOrSlug);
  if (!slug) return null;

  const storageKey = options.storageKey || 'daxini.workspace.apps';
  const installRoot = options.installRoot || 'workspace/apps';

  const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const alreadyInstalled = current.find((entry) => entry.slug === slug);
  if (alreadyInstalled) return alreadyInstalled;

  const installRecord = {
    slug,
    path: `${installRoot}/${slug}`,
    installed_at: new Date().toISOString()
  };

  current.push(installRecord);
  localStorage.setItem(storageKey, JSON.stringify(current));
  return installRecord;
}

window.DaxiniAppLauncher = {
  launchApp,
  installToWorkspace
};
