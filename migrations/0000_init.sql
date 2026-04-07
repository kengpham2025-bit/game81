-- Schema D1 cho GAMEVIET.IO.VN (tên bảng/cột tiếng Anh khớp với db-d1.ts)

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  showInNav INTEGER DEFAULT 1,
  navLabel TEXT DEFAULT '',
  customPath TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Game (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  avatar TEXT,
  banner TEXT,
  category TEXT,
  "order" INTEGER DEFAULT 0,
  isTopWeek INTEGER DEFAULT 0,
  isTopMonth INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Article (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  thumbnail TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  categoryId TEXT,
  categorySlug TEXT,
  author TEXT DEFAULT 'GAMEVIET',
  tags TEXT DEFAULT '[]',
  isHot INTEGER DEFAULT 0,
  isFeatured INTEGER DEFAULT 0,
  viewCount INTEGER DEFAULT 0,
  metaTitle TEXT,
  metaDescription TEXT,
  publishedAt TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  giftcodeGameId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES Category(id),
  FOREIGN KEY (giftcodeGameId) REFERENCES Game(id)
);

CREATE TABLE IF NOT EXISTS GiftCode (
  id TEXT PRIMARY KEY,
  gameId TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  codes TEXT DEFAULT '[]',
  quotaTotal INTEGER DEFAULT 0,
  lastUpdated TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (gameId) REFERENCES Game(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GiftCodeClaim (
  id TEXT PRIMARY KEY,
  articleSlug TEXT NOT NULL,
  gameId TEXT NOT NULL,
  ip TEXT NOT NULL,
  code TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(articleSlug, ip),
  FOREIGN KEY (gameId) REFERENCES Game(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_giftcodeclaim_articleSlug ON GiftCodeClaim(articleSlug);

CREATE TABLE IF NOT EXISTS ContactMessage (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  body TEXT NOT NULL,
  "read" INTEGER DEFAULT 0,
  ip TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Ad (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  categorySlugs TEXT DEFAULT '[]',
  imageUrl TEXT DEFAULT '',
  adText TEXT DEFAULT '',
  sponsorLabel TEXT DEFAULT '',
  linkUrl TEXT DEFAULT '',
  alt TEXT DEFAULT 'Banner quang cao',
  "order" INTEGER DEFAULT 0,
  isActive INTEGER DEFAULT 1,
  startAt TEXT,
  endAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS SeoSettings (
  id TEXT PRIMARY KEY,
  siteName TEXT DEFAULT 'GAMEVIET.IO.VN',
  siteTitle TEXT DEFAULT '',
  siteDescription TEXT DEFAULT '',
  siteKeywords TEXT DEFAULT '',
  ogImage TEXT DEFAULT '',
  ogType TEXT DEFAULT 'website',
  twitterCard TEXT DEFAULT 'summary_large_image',
  twitterSite TEXT DEFAULT '',
  canonicalBase TEXT DEFAULT '',
  robotsIndex INTEGER DEFAULT 1,
  robotsFollow INTEGER DEFAULT 1,
  locale TEXT DEFAULT 'vi_VN',
  jsonLdExtra TEXT DEFAULT '',
  googleAnalyticsId TEXT DEFAULT '',
  facebookUrl TEXT DEFAULT '',
  supportEmail TEXT DEFAULT '',
  spamEmail TEXT DEFAULT '',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
