'use strict';

const isNode = typeof window === 'undefined';
let fsPromises;
let path;

if (isNode) {
  fsPromises = require('node:fs/promises');
  path = require('node:path');
}

const DEFAULT_INDEX = {
  apps: [],
  updated_at: null,
  source: 'logichub-publish'
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

class AppRegistry {
  constructor(options = {}) {
    this.indexPath = options.indexPath || (isNode
      ? path.resolve(process.cwd(), 'registry', 'app-index.json')
      : '/registry/app-index.json');
    this.fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
  }

  async load() {
    if (!isNode) {
      if (!this.fetchImpl) return { ...DEFAULT_INDEX };
      const response = await this.fetchImpl(this.indexPath, { cache: 'no-store' });
      if (!response.ok) return { ...DEFAULT_INDEX };
      return response.json();
    }

    try {
      const contents = await fsPromises.readFile(this.indexPath, 'utf8');
      const parsed = JSON.parse(contents);
      if (!Array.isArray(parsed.apps)) return { ...DEFAULT_INDEX };
      return parsed;
    } catch {
      return { ...DEFAULT_INDEX };
    }
  }

  async save(indexData) {
    if (!isNode) return indexData;
    const merged = {
      ...DEFAULT_INDEX,
      ...indexData,
      updated_at: nowIso()
    };
    await fsPromises.writeFile(this.indexPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
    return merged;
  }

  async register(metadata = {}) {
    const slug = normalizeSlug(metadata.slug || metadata.name || metadata.id);
    if (!slug) {
      throw new Error('App slug is required');
    }

    const indexData = await this.load();
    const apps = Array.isArray(indexData.apps) ? [...indexData.apps] : [];
    const now = nowIso();

    const record = {
      id: slug,
      slug,
      name: metadata.name || slug,
      creator: metadata.creator || 'unknown',
      category: metadata.category || 'utilities',
      description: metadata.description || '',
      version: metadata.version || '1.0',
      runtime: metadata.runtime || 'edge-runtime',
      deployment_url: metadata.deployment_url || `/apps/${slug}`,
      popularity: Number.isFinite(Number(metadata.popularity)) ? Number(metadata.popularity) : 0,
      installs: Number.isFinite(Number(metadata.installs)) ? Number(metadata.installs) : 0,
      created_at: metadata.created_at || now,
      updated_at: now
    };

    const existingIndex = apps.findIndex((app) => app.id === slug || app.slug === slug);
    if (existingIndex >= 0) {
      apps[existingIndex] = {
        ...apps[existingIndex],
        ...record,
        created_at: apps[existingIndex].created_at || record.created_at
      };
    } else {
      apps.push(record);
    }

    const nextIndex = {
      ...indexData,
      apps
    };

    return this.save(nextIndex);
  }

  async list(filters = {}) {
    const indexData = await this.load();
    const apps = Array.isArray(indexData.apps) ? [...indexData.apps] : [];
    const category = filters.category ? String(filters.category).toLowerCase() : '';
    const creator = filters.creator ? String(filters.creator).toLowerCase() : '';

    let filtered = apps.filter((app) => {
      if (category && String(app.category || '').toLowerCase() !== category) return false;
      if (creator && String(app.creator || '').toLowerCase() !== creator) return false;
      return true;
    });

    if (filters.sort === 'popularity') {
      filtered.sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
    } else if (filters.sort === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return filtered;
  }
}

module.exports = {
  AppRegistry,
  normalizeSlug
};
