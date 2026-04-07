/**
 * Cloudflare D1 (SQLite) Database Wrapper
 * Cloudflare D1 (SQLite) Database Wrapper
 */

import type { D1Database } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Lấy D1 từ OpenNext Cloudflare context hoặc global env (Workers runtime)
function getDB(): D1Database | null {
  try {
    const { env } = getCloudflareContext();
    if (env?.game81_db) return env.game81_db as D1Database;
  } catch {
    // Not in Cloudflare request context (e.g. build)
  }
  // @ts-expect-error - global env có thể được inject bởi Workers runtime
  if (typeof globalThis.env !== 'undefined' && globalThis.env?.game81_db) return globalThis.env.game81_db as D1Database;
  return null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function parseJSON<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// =============================================================================
// USER MODEL
// =============================================================================

export const userDB = {
  async findUnique(data: { where: { email: string } }): Promise<User | null> {
    const db = getDB();
    if (!db) return null;
    const stmt = db.prepare('SELECT * FROM User WHERE email = ?').bind(data.where.email);
    const result = await stmt.first();
    return result as unknown as User | null;
  },

  async create(data: { email: string; password: string; name?: string; role?: string }): Promise<User> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.email, data.password, data.name || null, data.role || 'editor', now, now);
    await stmt.run();
    return (await db.prepare('SELECT * FROM User WHERE id = last_insert_rowid()').first()) as unknown as User;
  },

  async update(data: { where: { email: string }; data: { password: string } }): Promise<User | null> {
    const db = getDB();
    if (!db) return null;
    const stmt = db.prepare('UPDATE User SET password = ?, updatedAt = ? WHERE email = ?')
      .bind(data.data.password, new Date().toISOString(), data.where.email);
    await stmt.run();
    return this.findUnique({ where: { email: data.where.email } });
  },
};

// =============================================================================
// GAME MODEL
// =============================================================================

export const gameDB = {
  async findMany(data?: {
    where?: { isTopWeek?: boolean; isTopMonth?: boolean };
    orderBy?: { order?: string };
    take?: number;
    skip?: number;
  }): Promise<Game[]> {
    const db = getDB();
    if (!db) return [];
    let query = 'SELECT * FROM Game';
    const conditions: string[] = [];
    if (data?.where?.isTopWeek) conditions.push('isTopWeek = 1');
    if (data?.where?.isTopMonth) conditions.push('isTopMonth = 1');
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY `order` ASC';
    if (data?.take) { query += ' LIMIT ?'; }
    if (data?.skip) { query += ' OFFSET ?'; }
    const params: (string | number)[] = [];
    if (data?.take) params.push(data.take);
    if (data?.skip) params.push(data.skip);
    const stmt = params.length > 0 ? db.prepare(query).bind(...params) : db.prepare(query);
    return (await stmt.all()).results as unknown as Game[];
  },

  async create(data: { name: string; slug: string; avatar?: string; banner?: string; category?: string; order?: number; isTopWeek?: boolean; isTopMonth?: boolean }): Promise<Game> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO Game (id, name, slug, avatar, banner, category, \`order\`, isTopWeek, isTopMonth, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.name, data.slug, data.avatar || null, data.banner || null, data.category || null, data.order || 0, data.isTopWeek ? 1 : 0, data.isTopMonth ? 1 : 0, now, now);
    await stmt.run();
    return (await db.prepare('SELECT * FROM Game WHERE id = last_insert_rowid()').first()) as Game;
  },

  async update(data: { where: { id: string }; data: Partial<Game> }): Promise<Game> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await db.prepare('SELECT * FROM Game WHERE id = ?').bind(data.where.id).first() as unknown as Game | null;
    if (!existing) throw new Error('Game not found');
    const updated = { ...existing, ...data.data, updatedAt: new Date().toISOString() };
    const stmt = db.prepare(`UPDATE Game SET name = ?, slug = ?, avatar = ?, banner = ?, category = ?, \`order\` = ?, isTopWeek = ?, isTopMonth = ?, updatedAt = ? WHERE id = ?`)
      .bind(updated.name, updated.slug, updated.avatar, updated.banner, updated.category, updated.order, updated.isTopWeek ? 1 : 0, updated.isTopMonth ? 1 : 0, updated.updatedAt, data.where.id);
    await stmt.run();
    return updated;
  },

  async delete(data: { where: { id: string } }): Promise<void> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('DELETE FROM Game WHERE id = ?').bind(data.where.id).run();
  },

  async findUnique(data: { where: { id: string } } | { where: { slug: string } }): Promise<Game | null> {
    const db = getDB();
    if (!db) return null;
    const keys = Object.keys(data.where);
    if (keys.length === 0) return null;
    const field = keys[0];
    const value = data.where[field as keyof typeof data.where];
    return await db.prepare(`SELECT * FROM Game WHERE ${field} = ?`).bind(value).first() as unknown as Game | null;
  },

  async count(): Promise<number> {
    const db = getDB();
    if (!db) return 0;
    const result = await db.prepare('SELECT COUNT(*) as count FROM Game').first() as { count: number } | null;
    return result?.count || 0;
  },
};

// =============================================================================
// ARTICLE MODEL
// =============================================================================

export const articleDB = {
  async findMany(data?: {
    where?: {
      categoryId?: string;
      categorySlug?: string;
      status?: string;
      giftcodeGameId?: string;
      isFeatured?: boolean;
      isHot?: boolean;
    };
    orderBy?: { publishedAt?: string };
    take?: number;
    skip?: number;
  }): Promise<Article[]> {
    const db = getDB();
    if (!db) return [];
    let query = 'SELECT * FROM Article';
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    if (data?.where?.categoryId) { conditions.push('categoryId = ?'); params.push(data.where.categoryId); }
    if (data?.where?.categorySlug) { conditions.push('categorySlug = ?'); params.push(data.where.categorySlug); }
    if (data?.where?.status) { conditions.push('status = ?'); params.push(data.where.status); }
    if (data?.where?.giftcodeGameId) { conditions.push('giftcodeGameId = ?'); params.push(data.where.giftcodeGameId); }
    if (data?.where?.isFeatured !== undefined) { conditions.push('isFeatured = ?'); params.push(data.where.isFeatured ? 1 : 0); }
    if (data?.where?.isHot !== undefined) { conditions.push('isHot = ?'); params.push(data.where.isHot ? 1 : 0); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY publishedAt DESC';
    if (data?.take) { query += ' LIMIT ?'; params.push(data.take); }
    if (data?.skip) { query += ' OFFSET ?'; params.push(data.skip); }
    const results = await db.prepare(query).bind(...params).all();
    const mapped = ((results.results || []) as Array<Record<string, unknown>>).map((r) => {
      return Object.assign({}, r, {
        _id: String(r.id),
        images: parseJSON(r.images as string, [] as string[]),
        tags: parseJSON(r.tags as string, [] as string[]),
      });
    });
    return mapped as unknown as Article[];
  },

  async findFirst(data: {
    where: {
      slug?: string;
      status?: string;
      isFeatured?: boolean;
      isHot?: boolean;
      giftcodeGameId?: string;
    };
  }): Promise<Article | null> {
    const db = getDB();
    if (!db) return null;
    const { where } = data;
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    if (where.slug) { conditions.push('slug = ?'); params.push(where.slug); }
    if (where.status) { conditions.push('status = ?'); params.push(where.status); }
    if (where.isFeatured !== undefined) { conditions.push('isFeatured = ?'); params.push(where.isFeatured ? 1 : 0); }
    if (where.isHot !== undefined) { conditions.push('isHot = ?'); params.push(where.isHot ? 1 : 0); }
    if (where.giftcodeGameId) { conditions.push('giftcodeGameId = ?'); params.push(where.giftcodeGameId); }
    if (conditions.length === 0) return null;
    const query = `SELECT * FROM Article WHERE ${conditions.join(' AND ')} ORDER BY publishedAt DESC LIMIT 1`;
    const result = await db.prepare(query).bind(...params).first();
    if (!result) return null;
    const r = result as Record<string, unknown>;
    return Object.assign({}, r, {
      _id: r.id,
      images: parseJSON(r.images as string, [] as string[]),
      tags: parseJSON(r.tags as string, [] as string[]),
    }) as unknown as Article;
  },

  async findUnique(data: { where: { id: string } } | { where: { slug: string } }): Promise<Article | null> {
    const db = getDB();
    if (!db) return null;
    const keys = Object.keys(data.where);
    if (keys.length === 0) return null;
    const field = keys[0];
    const value = data.where[field as keyof typeof data.where];
    const result = await db.prepare(`SELECT * FROM Article WHERE ${field} = ?`).bind(value).first();
    if (!result) return null;
    const r = result as Record<string, unknown>;
    return Object.assign({}, r, {
      _id: r.id,
      images: parseJSON(r.images as string, [] as string[]),
      tags: parseJSON(r.tags as string, [] as string[]),
    }) as unknown as Article;
  },

  async create(data: {
    title: string; slug: string; excerpt?: string; content: string; thumbnail?: string;
    images?: string[]; categoryId?: string; categorySlug?: string; author?: string;
    tags?: string[]; isHot?: boolean; isFeatured?: boolean; metaTitle?: string;
    metaDescription?: string; publishedAt?: Date; status?: string; giftcodeGameId?: string;
  }): Promise<Article> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const id = cuid();
    const now = new Date().toISOString();
    const published = data.publishedAt ? data.publishedAt.toISOString() : now;
    const images = JSON.stringify(data.images || []);
    const tags = JSON.stringify(data.tags || []);
    const stmt = db.prepare(`INSERT INTO Article (id, title, slug, excerpt, content, thumbnail, images, categoryId, categorySlug, author, tags, isHot, isFeatured, viewCount, metaTitle, metaDescription, publishedAt, status, giftcodeGameId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, data.title, data.slug, data.excerpt || '', data.content, data.thumbnail || '', images, data.categoryId || null, data.categorySlug || null, data.author || 'GAMEVIET', tags, data.isHot ? 1 : 0, data.isFeatured ? 1 : 0, 0, data.metaTitle || null, data.metaDescription || null, published, data.status || 'published', data.giftcodeGameId || null, now, now);
    await stmt.run();
    const result = await db.prepare('SELECT * FROM Article WHERE id = ?').bind(id).first() as Record<string, unknown>;
    if (!result) throw new Error('Article create: failed to read back row');
    return Object.assign({}, result, { _id: result.id, images: parseJSON(result.images as string, [] as string[]), tags: parseJSON(result.tags as string, [] as string[]) }) as unknown as Article;
  },

  async update(data: {
    where: { id: string };
    data: Partial<{
      title: string; slug: string; excerpt: string; content: string; thumbnail: string;
      images: string[]; categoryId: string; categorySlug: string; author: string;
      tags: string[]; isHot: boolean; isFeatured: boolean; metaTitle: string;
      metaDescription: string; publishedAt: Date; status: string; giftcodeGameId: string;
    }>;
  }): Promise<Article> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await this.findUnique({ where: { id: data.where.id } });
    if (!existing) throw new Error('Article not found');
    const d = data.data;
    const updated: Record<string, unknown> = {
      ...existing,
      title: d.title ?? existing.title,
      slug: d.slug ?? existing.slug,
      excerpt: d.excerpt ?? existing.excerpt,
      content: d.content ?? existing.content,
      thumbnail: d.thumbnail ?? existing.thumbnail,
      images: d.images !== undefined ? JSON.stringify(d.images) : JSON.stringify(existing.images),
      categoryId: d.categoryId ?? existing.categoryId,
      categorySlug: d.categorySlug ?? existing.categorySlug,
      author: d.author ?? existing.author,
      tags: d.tags !== undefined ? JSON.stringify(d.tags) : JSON.stringify(existing.tags),
      isHot: d.isHot ?? existing.isHot,
      isFeatured: d.isFeatured ?? existing.isFeatured,
      metaTitle: d.metaTitle ?? existing.metaTitle,
      metaDescription: d.metaDescription ?? existing.metaDescription,
      publishedAt: d.publishedAt ? d.publishedAt.toISOString() : existing.publishedAt,
      status: d.status ?? existing.status,
      giftcodeGameId: d.giftcodeGameId ?? existing.giftcodeGameId,
      updatedAt: new Date().toISOString(),
    };
    const stmt = db.prepare(`UPDATE Article SET title = ?, slug = ?, excerpt = ?, content = ?, thumbnail = ?, images = ?, categoryId = ?, categorySlug = ?, author = ?, tags = ?, isHot = ?, isFeatured = ?, metaTitle = ?, metaDescription = ?, publishedAt = ?, status = ?, giftcodeGameId = ?, updatedAt = ? WHERE id = ?`)
      .bind(updated.title, updated.slug, updated.excerpt, updated.content, updated.thumbnail, updated.images, updated.categoryId, updated.categorySlug, updated.author, updated.tags, updated.isHot ? 1 : 0, updated.isFeatured ? 1 : 0, updated.metaTitle, updated.metaDescription, updated.publishedAt, updated.status, updated.giftcodeGameId, updated.updatedAt, data.where.id);
    await stmt.run();
    return Object.assign({}, updated, {
      _id: updated.id,
      images: parseJSON(updated.images as string, [] as string[]),
      tags: parseJSON(updated.tags as string, [] as string[]),
    }) as unknown as Article;
  },

  async delete(data: { where: { id: string } }): Promise<void> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('DELETE FROM Article WHERE id = ?').bind(data.where.id).run();
  },

  async updateViewCount(data: { where: { slug: string } }): Promise<void> {
    const db = getDB();
    if (!db) return;
    await db.prepare('UPDATE Article SET viewCount = viewCount + 1 WHERE slug = ?').bind(data.where.slug).run();
  },

  async count(data?: { where?: { categoryId?: string; categorySlug?: string; status?: string } }): Promise<number> {
    const db = getDB();
    if (!db) return 0;
    let query = 'SELECT COUNT(*) as count FROM Article';
    const conditions: string[] = [];
    const params: string[] = [];
    if (data?.where?.categoryId) { conditions.push('categoryId = ?'); params.push(data.where.categoryId); }
    if (data?.where?.categorySlug) { conditions.push('categorySlug = ?'); params.push(data.where.categorySlug); }
    if (data?.where?.status) { conditions.push('status = ?'); params.push(data.where.status); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    const result = await db.prepare(query).bind(...params).first() as { count: number } | null;
    return result?.count || 0;
  },
};

// =============================================================================
// CATEGORY MODEL
// =============================================================================

export const categoryDB = {
  async findMany(): Promise<Category[]> {
    const db = getDB();
    if (!db) return [];
    const results = await db.prepare('SELECT * FROM Category ORDER BY `order` ASC').all();
    return results.results as unknown as Category[];
  },

  async findUnique(data: { where: { id: string } } | { where: { slug: string } } | { where: { name: string } }): Promise<Category | null> {
    const db = getDB();
    if (!db) return null;
    const keys = Object.keys(data.where);
    if (keys.length === 0) return null;
    const field = keys[0];
    const value = data.where[field as keyof typeof data.where];
    return await db.prepare(`SELECT * FROM Category WHERE ${field} = ?`).bind(value).first() as unknown as Category | null;
  },

  async create(data: { name: string; slug: string; description?: string; order?: number; showInNav?: boolean; navLabel?: string; customPath?: string }): Promise<Category> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO Category (id, name, slug, description, \`order\`, showInNav, navLabel, customPath, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.name, data.slug, data.description || '', data.order || 0, data.showInNav ? 1 : 0, data.navLabel || '', data.customPath || '', now, now);
    await stmt.run();
    return (await db.prepare('SELECT * FROM Category WHERE id = last_insert_rowid()').first()) as unknown as Category;
  },

  async upsert(data: {
    where: { slug: string };
    create: { name: string; slug: string; description?: string; order?: number; showInNav?: boolean; navLabel?: string; customPath?: string };
    update: Partial<{ name: string; description: string; order: number; showInNav: boolean; navLabel: string; customPath: string }>;
  }): Promise<Category> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await this.findUnique({ where: { slug: data.where.slug } });
    if (existing) {
      const updated = { ...existing, ...data.update, updatedAt: new Date().toISOString() };
      await db.prepare(`UPDATE Category SET name = ?, description = ?, \`order\` = ?, showInNav = ?, navLabel = ?, customPath = ?, updatedAt = ? WHERE id = ?`)
        .bind(updated.name, updated.description, updated.order, updated.showInNav ? 1 : 0, updated.navLabel, updated.customPath, updated.updatedAt, existing.id).run();
      return updated;
    } else {
      return await this.create(data.create);
    }
  },

  async update(data: { where: { id: string }; data: Partial<Category> }): Promise<Category> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await this.findUnique({ where: { id: data.where.id } });
    if (!existing) throw new Error('Category not found');
    const updated = { ...existing, ...data.data, updatedAt: new Date().toISOString() };
    await db.prepare(`UPDATE Category SET name = ?, slug = ?, description = ?, \`order\` = ?, showInNav = ?, navLabel = ?, customPath = ?, updatedAt = ? WHERE id = ?`)
      .bind(updated.name, updated.slug, updated.description, updated.order, updated.showInNav ? 1 : 0, updated.navLabel, updated.customPath, updated.updatedAt, data.where.id).run();
    return updated;
  },

  async delete(data: { where: { id: string } }): Promise<void> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('DELETE FROM Category WHERE id = ?').bind(data.where.id).run();
  },

  async count(): Promise<number> {
    const db = getDB();
    if (!db) return 0;
    const result = await db.prepare('SELECT COUNT(*) as count FROM Category').first() as { count: number } | null;
    return result?.count || 0;
  },
};

// =============================================================================
// GIFT CODE MODEL
// =============================================================================

export const giftCodeDB = {
  async findMany(data?: { where?: { gameId?: string }; include?: { game?: boolean }; take?: number; skip?: number }): Promise<GiftCode[]> {
    const db = getDB();
    if (!db) return [];
    let query = 'SELECT * FROM GiftCode';
    const params: string[] = [];
    if (data?.where?.gameId) { query += ' WHERE gameId = ?'; params.push(data.where.gameId); }
    query += ' ORDER BY createdAt DESC';
    if (data?.take) { query += ' LIMIT ?'; params.push(data.take.toString()); }
    if (data?.skip) { query += ' OFFSET ?'; params.push(data.skip.toString()); }
    const results = await db.prepare(query).bind(...params).all();
    const codes = results.results as Record<string, unknown>[];
    for (const gc of codes) {
      gc._id = gc.id as string;
      if (data?.include?.game) {
        gc.game = await db.prepare('SELECT * FROM Game WHERE id = ?').bind(gc.gameId as string).first() as unknown as Game || undefined;
      }
    }
    return codes as unknown as GiftCode[];
  },

  async findFirst(data: { where: { gameId: string } }): Promise<GiftCode | null> {
    const db = getDB();
    if (!db) return null;
    return await db.prepare('SELECT * FROM GiftCode WHERE gameId = ?').bind(data.where.gameId).first() as unknown as GiftCode | null;
  },

  async findUnique(data: { where: { id: string } }): Promise<GiftCode | null> {
    const db = getDB();
    if (!db) return null;
    return await db.prepare('SELECT * FROM GiftCode WHERE id = ?').bind(data.where.id).first() as unknown as GiftCode | null;
  },

  async create(data: { gameId: string; count?: number; codes?: string[]; quotaTotal?: number }): Promise<GiftCode> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const codes = JSON.stringify(data.codes || []);
    const stmt = db.prepare(`INSERT INTO GiftCode (id, gameId, count, codes, quotaTotal, lastUpdated, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.gameId, data.count || 0, codes, data.quotaTotal || 0, now, now, now);
    await stmt.run();
    return (await db.prepare('SELECT * FROM GiftCode WHERE id = last_insert_rowid()').first()) as unknown as GiftCode;
  },

  async update(data: {
    where: { id: string };
    data: Partial<{ count: number; codes: string[]; quotaTotal: number }>;
  }): Promise<GiftCode> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await this.findUnique({ where: { id: data.where.id } });
    if (!existing) throw new Error('GiftCode not found');
    const codes = data.data.codes !== undefined ? JSON.stringify(data.data.codes) : existing.codes;
    const updated = {
      ...existing,
      ...data.data,
      codes,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.prepare(`UPDATE GiftCode SET count = ?, codes = ?, quotaTotal = ?, lastUpdated = ?, updatedAt = ? WHERE id = ?`)
      .bind(updated.count, updated.codes, updated.quotaTotal, updated.lastUpdated, updated.updatedAt, data.where.id).run();
    return updated;
  },

  async delete(data: { where: { id: string } }): Promise<void> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('DELETE FROM GiftCode WHERE id = ?').bind(data.where.id).run();
  },

  async count(): Promise<number> {
    const db = getDB();
    if (!db) return 0;
    const result = await db.prepare('SELECT COUNT(*) as count FROM GiftCode').first() as { count: number } | null;
    return result?.count || 0;
  },
};

// =============================================================================
// GIFT CODE CLAIM MODEL
// =============================================================================

export const giftCodeClaimDB = {
  async findFirst(data: { where: { articleSlug: string; ip: string } }): Promise<GiftCodeClaim | null> {
    const db = getDB();
    if (!db) return null;
    return await db.prepare('SELECT * FROM GiftCodeClaim WHERE articleSlug = ? AND ip = ?').bind(data.where.articleSlug, data.where.ip).first() as unknown as GiftCodeClaim | null;
  },

  async create(data: { articleSlug: string; gameId: string; ip: string; code: string }): Promise<GiftCodeClaim> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO GiftCodeClaim (id, articleSlug, gameId, ip, code, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.articleSlug, data.gameId, data.ip, data.code, now, now);
    await stmt.run();
    return (await db.prepare('SELECT * FROM GiftCodeClaim WHERE id = last_insert_rowid()').first()) as unknown as GiftCodeClaim;
  },
};

// =============================================================================
// CONTACT MESSAGE MODEL
// =============================================================================

export const contactMessageDB = {
  async findMany(): Promise<ContactMessage[]> {
    const db = getDB();
    if (!db) return [];
    const results = await db.prepare('SELECT * FROM ContactMessage ORDER BY createdAt DESC').all();
    return results.results as unknown as ContactMessage[];
  },

  async create(data: { name: string; email: string; subject?: string; body: string; ip?: string }): Promise<ContactMessage> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const stmt = db.prepare(`INSERT INTO ContactMessage (id, name, email, subject, body, \`read\`, ip, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.name, data.email, data.subject || '', data.body, 0, data.ip || '', now, now);
    await stmt.run();
    return (await db.prepare('SELECT * FROM ContactMessage WHERE id = last_insert_rowid()').first()) as unknown as ContactMessage;
  },

  async update(data: { where: { id: string }; data: { read: boolean } }): Promise<ContactMessage> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('UPDATE ContactMessage SET `read` = ?, updatedAt = ? WHERE id = ?')
      .bind(data.data.read ? 1 : 0, new Date().toISOString(), data.where.id).run();
    return (await db.prepare('SELECT * FROM ContactMessage WHERE id = ?').bind(data.where.id).first()) as unknown as ContactMessage;
  },

  async delete(data: { where: { id: string } }): Promise<void> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('DELETE FROM ContactMessage WHERE id = ?').bind(data.where.id).run();
  },
};

// =============================================================================
// AD MODEL
// =============================================================================

export const adDB = {
  async findMany(data?: { where?: { position?: string } }): Promise<Ad[]> {
    const db = getDB();
    if (!db) return [];
    let query = 'SELECT * FROM Ad WHERE isActive = 1';
    const params: string[] = [];
    if (data?.where?.position) { query += ' AND position = ?'; params.push(data.where.position); }
    query += ' ORDER BY `order` ASC';
    const results = await db.prepare(query).bind(...params).all();
    return ((results.results || []) as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      categorySlugs: parseJSON(r.categorySlugs as string, [] as string[]),
    })) as unknown as Ad[];
  },

  async findManyAdmin(): Promise<Ad[]> {
    const db = getDB();
    if (!db) return [];
    const results = await db.prepare('SELECT * FROM Ad ORDER BY `order` ASC').all();
    return ((results.results || []) as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      categorySlugs: parseJSON(r.categorySlugs as string, [] as string[]),
    })) as unknown as Ad[];
  },

  async findUnique(data: { where: { id: string } }): Promise<Ad | null> {
    const db = getDB();
    if (!db) return null;
    const result = await db.prepare('SELECT * FROM Ad WHERE id = ?').bind(data.where.id).first();
    if (!result) return null;
    const r = result as Record<string, unknown>;
    return Object.assign({}, r, {
      categorySlugs: parseJSON(r.categorySlugs as string, [] as string[]),
    }) as unknown as Ad;
  },

  async create(data: {
    name: string; position: string; categorySlugs?: string[]; imageUrl?: string;
    adText?: string; sponsorLabel?: string; linkUrl?: string; alt?: string;
    order?: number; isActive?: boolean; startAt?: Date; endAt?: Date;
  }): Promise<Ad> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const now = new Date().toISOString();
    const categorySlugs = JSON.stringify(data.categorySlugs || []);
    const stmt = db.prepare(`INSERT INTO Ad (id, name, position, categorySlugs, imageUrl, adText, sponsorLabel, linkUrl, alt, \`order\`, isActive, startAt, endAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(cuid(), data.name, data.position, categorySlugs, data.imageUrl || '', data.adText || '', data.sponsorLabel || '', data.linkUrl || '', data.alt || 'Banner quang cao', data.order || 0, data.isActive ? 1 : 0, data.startAt ? data.startAt.toISOString() : null, data.endAt ? data.endAt.toISOString() : null, now, now);
    await stmt.run();
    const result = await db.prepare('SELECT * FROM Ad WHERE id = last_insert_rowid()').first() as Record<string, unknown>;
    return Object.assign({}, result, {
      categorySlugs: parseJSON(result.categorySlugs as string, [] as string[]),
    }) as unknown as Ad;
  },

  async update(data: {
    where: { id: string };
    data: Partial<{
      name: string; position: string; categorySlugs: string[]; imageUrl: string;
      adText: string; sponsorLabel: string; linkUrl: string; alt: string;
      order: number; isActive: boolean; startAt: Date; endAt: Date;
    }>;
  }): Promise<Ad> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await this.findUnique({ where: { id: data.where.id } });
    if (!existing) throw new Error('Ad not found');
    const d = data.data;
    const updated: Record<string, unknown> = {
      ...existing,
      name: d.name ?? existing.name,
      position: d.position ?? existing.position,
      categorySlugs: d.categorySlugs !== undefined ? JSON.stringify(d.categorySlugs) : JSON.stringify(existing.categorySlugs),
      imageUrl: d.imageUrl ?? existing.imageUrl,
      adText: d.adText ?? existing.adText,
      sponsorLabel: d.sponsorLabel ?? existing.sponsorLabel,
      linkUrl: d.linkUrl ?? existing.linkUrl,
      alt: d.alt ?? existing.alt,
      order: d.order ?? existing.order,
      isActive: d.isActive ?? existing.isActive,
      startAt: d.startAt !== undefined ? d.startAt.toISOString() : existing.startAt,
      endAt: d.endAt !== undefined ? d.endAt.toISOString() : existing.endAt,
      updatedAt: new Date().toISOString(),
    };
    await db.prepare(`UPDATE Ad SET name = ?, position = ?, categorySlugs = ?, imageUrl = ?, adText = ?, sponsorLabel = ?, linkUrl = ?, alt = ?, \`order\` = ?, isActive = ?, startAt = ?, endAt = ?, updatedAt = ? WHERE id = ?`)
      .bind(updated.name, updated.position, updated.categorySlugs, updated.imageUrl, updated.adText, updated.sponsorLabel, updated.linkUrl, updated.alt, updated.order, updated.isActive ? 1 : 0, updated.startAt, updated.endAt, updated.updatedAt, data.where.id).run();
    return Object.assign({}, updated, {
      categorySlugs: parseJSON(updated.categorySlugs as string, [] as string[]),
    }) as unknown as Ad;
  },

  async delete(data: { where: { id: string } }): Promise<void> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    await db.prepare('DELETE FROM Ad WHERE id = ?').bind(data.where.id).run();
  },

  async count(): Promise<number> {
    const db = getDB();
    if (!db) return 0;
    const result = await db.prepare('SELECT COUNT(*) as count FROM Ad').first() as { count: number } | null;
    return result?.count || 0;
  },
};

// =============================================================================
// SEO SETTINGS MODEL
// =============================================================================

export const seoSettingsDB = {
  async findFirst(): Promise<SeoSettings | null> {
    const db = getDB();
    if (!db) return null;
    return await db.prepare('SELECT * FROM SeoSettings LIMIT 1').first() as unknown as SeoSettings | null;
  },

  async upsert(data: {
    where: { id?: string };
    create: Partial<SeoSettings>;
    update: Partial<SeoSettings>;
  }): Promise<SeoSettings> {
    const db = getDB();
    if (!db) throw new Error('DB not available');
    const existing = await this.findFirst();
    if (existing) {
      const updated = { ...existing, ...data.update, updatedAt: new Date().toISOString() };
      const stmt = db.prepare(`UPDATE SeoSettings SET siteName = ?, siteTitle = ?, siteDescription = ?, siteKeywords = ?, ogImage = ?, ogType = ?, twitterCard = ?, twitterSite = ?, canonicalBase = ?, robotsIndex = ?, robotsFollow = ?, locale = ?, jsonLdExtra = ?, googleAnalyticsId = ?, facebookUrl = ?, supportEmail = ?, spamEmail = ?, updatedAt = ? WHERE id = ?`)
        .bind(updated.siteName, updated.siteTitle, updated.siteDescription, updated.siteKeywords, updated.ogImage, updated.ogType, updated.twitterCard, updated.twitterSite, updated.canonicalBase, updated.robotsIndex ? 1 : 0, updated.robotsFollow ? 1 : 0, updated.locale, updated.jsonLdExtra, updated.googleAnalyticsId, updated.facebookUrl, updated.supportEmail, updated.spamEmail, updated.updatedAt, existing.id);
      await stmt.run();
      return updated;
    } else {
      const now = new Date().toISOString();
      const d = { ...data.create };
      const stmt = db.prepare(`INSERT INTO SeoSettings (id, siteName, siteTitle, siteDescription, siteKeywords, ogImage, ogType, twitterCard, twitterSite, canonicalBase, robotsIndex, robotsFollow, locale, jsonLdExtra, googleAnalyticsId, facebookUrl, supportEmail, spamEmail, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(cuid(), d.siteName || 'GAMEVIET.IO.VN', d.siteTitle || '', d.siteDescription || '', d.siteKeywords || '', d.ogImage || '', d.ogType || 'website', d.twitterCard || 'summary_large_image', d.twitterSite || '', d.canonicalBase || '', d.robotsIndex ? 1 : 0, d.robotsFollow ? 1 : 0, d.locale || 'vi_VN', d.jsonLdExtra || '', d.googleAnalyticsId || '', d.facebookUrl || '', d.supportEmail || '', d.spamEmail || '', now, now);
      await stmt.run();
      return (await db.prepare('SELECT * FROM SeoSettings WHERE id = last_insert_rowid()').first()) as SeoSettings;
    }
  },
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  showInNav: boolean | number;
  navLabel: string;
  customPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  banner: string | null;
  category: string | null;
  order: number;
  isTopWeek: boolean | number;
  isTopMonth: boolean | number;
  createdAt: string;
  updatedAt: string;
  giftCodes?: GiftCode[];
  giftCodeClaims?: GiftCodeClaim[];
  giftcodeArticles?: Article[];
}

export interface Article {
  id: string;
  _id?: string; // Alias for MongoDB compatibility
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  images: string[];
  categoryId: string | null;
  categorySlug: string | null;
  category?: Category | null;
  author: string;
  tags: string[];
  isHot: boolean | number;
  isFeatured: boolean | number;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string;
  status: string;
  giftcodeGameId: string | null;
  giftcodeGame?: Game | null;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCode {
  id: string;
  _id?: string; // Alias for MongoDB compatibility
  gameId: string;
  game?: Game;
  count: number;
  codes: string;
  quotaTotal: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCodeClaim {
  id: string;
  articleSlug: string;
  gameId: string;
  game?: Game;
  ip: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean | number;
  ip: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  id: string;
  name: string;
  position: string;
  categorySlugs: string[];
  imageUrl: string;
  adText: string;
  sponsorLabel: string;
  linkUrl: string;
  alt: string;
  order: number;
  isActive: boolean | number;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeoSettings {
  id: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterSite: string;
  canonicalBase: string;
  robotsIndex: boolean | number;
  robotsFollow: boolean | number;
  locale: string;
  jsonLdExtra: string;
  googleAnalyticsId: string;
  facebookUrl: string;
  supportEmail: string;
  spamEmail: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// CUID GENERATOR (cho local dev)
// =============================================================================

function cuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}
