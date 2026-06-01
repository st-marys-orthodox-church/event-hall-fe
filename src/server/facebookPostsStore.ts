import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { FacebookPost } from '../utils/facebookPostsShared';

type FacebookPostRow = {
  attachment_type: string | null;
  created_time: string;
  excerpt: string;
  facebook_post_id: string;
  image_url: string | null;
  is_live: number;
  is_repost: number;
  message: string;
  permalink_url: string;
  title: string;
};

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'facebook-posts.db');

let dbInstance: Database.Database | null = null;

const resolveDbPath = () => process.env.FACEBOOK_POSTS_DB_PATH || DEFAULT_DB_PATH;

const ensureDbDirectory = (dbPath: string) => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
};

const getDb = () => {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = resolveDbPath();
  ensureDbDirectory(dbPath);
  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS facebook_posts (
      facebook_post_id TEXT PRIMARY KEY,
      created_time TEXT NOT NULL,
      permalink_url TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      message TEXT NOT NULL,
      image_url TEXT,
      attachment_type TEXT,
      is_live INTEGER NOT NULL DEFAULT 0,
      is_repost INTEGER NOT NULL DEFAULT 0,
      raw_payload TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_facebook_posts_created_time
    ON facebook_posts (created_time DESC);
  `);

  return dbInstance;
};

const mapRow = (row: FacebookPostRow): FacebookPost => ({
  attachmentType: row.attachment_type ?? '',
  createdTime: row.created_time,
  excerpt: row.excerpt,
  facebookPostId: row.facebook_post_id,
  imageUrl: row.image_url ?? '',
  isLive: row.is_live === 1,
  isRepost: row.is_repost === 1,
  message: row.message,
  permalinkUrl: row.permalink_url,
  title: row.title,
});

export const listFacebookPosts = (limit = 24): FacebookPost[] => {
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT
          facebook_post_id,
          created_time,
          permalink_url,
          title,
          excerpt,
          message,
          image_url,
          attachment_type,
          is_live,
          is_repost
        FROM facebook_posts
        WHERE is_live = 0
        ORDER BY datetime(created_time) DESC
        LIMIT ?
      `
    )
    .all(limit) as FacebookPostRow[];

  return rows.map(mapRow);
};

export const getFacebookPostCount = () => {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) AS count FROM facebook_posts').get() as { count: number };
  return row.count;
};

export const upsertFacebookPosts = (
  posts: Array<FacebookPost & { rawPayload: string }>
) => {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO facebook_posts (
      facebook_post_id,
      created_time,
      permalink_url,
      title,
      excerpt,
      message,
      image_url,
      attachment_type,
      is_live,
      is_repost,
      raw_payload,
      synced_at
    ) VALUES (
      @facebookPostId,
      @createdTime,
      @permalinkUrl,
      @title,
      @excerpt,
      @message,
      @imageUrl,
      @attachmentType,
      @isLive,
      @isRepost,
      @rawPayload,
      @syncedAt
    )
    ON CONFLICT(facebook_post_id) DO UPDATE SET
      created_time = excluded.created_time,
      permalink_url = excluded.permalink_url,
      title = excluded.title,
      excerpt = excluded.excerpt,
      message = excluded.message,
      image_url = excluded.image_url,
      attachment_type = excluded.attachment_type,
      is_live = excluded.is_live,
      is_repost = excluded.is_repost,
      raw_payload = excluded.raw_payload,
      synced_at = excluded.synced_at
  `);

  const transaction = db.transaction((items: Array<FacebookPost & { rawPayload: string }>) => {
    const syncedAt = new Date().toISOString();
    for (const post of items) {
      statement.run({
        ...post,
        attachmentType: post.attachmentType || null,
        imageUrl: post.imageUrl || null,
        isLive: post.isLive ? 1 : 0,
        isRepost: post.isRepost ? 1 : 0,
        syncedAt,
      });
    }
  });

  transaction(posts);
};
