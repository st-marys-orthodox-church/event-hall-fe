import type { FacebookPost } from '../utils/facebookPostsShared';
import { upsertFacebookPosts } from './facebookPostsStore';

type MetaAttachment = {
  description?: string;
  media?: {
    image?: {
      src?: string;
    };
  };
  media_type?: string;
  subattachments?: {
    data?: MetaAttachment[];
  };
  title?: string;
  type?: string;
  unshimmed_url?: string;
  url?: string;
};

type MetaPost = {
  attachments?: {
    data?: MetaAttachment[];
  };
  created_time?: string;
  full_picture?: string;
  id: string;
  message?: string;
  permalink_url?: string;
  status_type?: string;
};

type MetaFeedResponse = {
  data?: MetaPost[];
};

const GRAPH_API_VERSION = 'v23.0';
const GRAPH_FIELDS = [
  'attachments{description,media,media_type,subattachments,title,type,unshimmed_url,url}',
  'created_time',
  'full_picture',
  'message',
  'permalink_url',
  'status_type',
].join(',');

const readAttachmentImage = (attachment: MetaAttachment | undefined): string => {
  if (!attachment) {
    return '';
  }

  return (
    attachment.media?.image?.src ??
    attachment.subattachments?.data?.[0]?.media?.image?.src ??
    attachment.url ??
    attachment.unshimmed_url ??
    ''
  );
};

const compactText = (value: string) => value.replace(/\s+/g, ' ').trim();
const stripUrls = (value: string) => value.replace(/https?:\/\/\S+/gi, '').trim();

const truncate = (value: string, maxLength: number) =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}…`;

const deriveTitle = (attachment: MetaAttachment | undefined, message: string) => {
  const preferred = compactText(attachment?.title ?? '');
  if (preferred) {
    return truncate(preferred, 70);
  }

  const firstSentence = compactText(stripUrls(message).split(/[\n.!?]/)[0] ?? '');
  if (firstSentence) {
    return truncate(firstSentence, 70);
  }

  const fallbackDescription = compactText(attachment?.description ?? '');
  if (fallbackDescription) {
    return truncate(fallbackDescription, 70);
  }

  return 'Parish Update';
};

const deriveExcerpt = (message: string, attachment: MetaAttachment | undefined) => {
  const normalizedMessage = compactText(stripUrls(message));
  if (normalizedMessage) {
    return truncate(normalizedMessage, 180);
  }

  const description = compactText(attachment?.description ?? '');
  return description ? truncate(description, 180) : '';
};

const isLivePost = (post: MetaPost, attachment: MetaAttachment | undefined, message: string) => {
  const haystack = [message, attachment?.title, attachment?.description, post.permalink_url, post.status_type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    haystack.includes('was live') ||
    haystack.includes('went live') ||
    haystack.includes('live now') ||
    haystack.includes('live video') ||
    post.status_type?.toLowerCase() === 'live_video'
  );
};

const isRepost = (attachment: MetaAttachment | undefined, message: string) => {
  const attachmentType = (attachment?.type ?? attachment?.media_type ?? '').toLowerCase();
  const lowerMessage = message.toLowerCase();
  return (
    attachmentType.includes('share') ||
    lowerMessage.startsWith('shared ') ||
    lowerMessage.includes(' shared a post')
  );
};

const normalizePost = (post: MetaPost): (FacebookPost & { rawPayload: string }) | null => {
  const attachment = post.attachments?.data?.[0];
  const message = compactText(post.message ?? '');

  if (isLivePost(post, attachment, message)) {
    return null;
  }

  return {
    attachmentType: attachment?.media_type ?? attachment?.type ?? '',
    createdTime: post.created_time ?? new Date().toISOString(),
    excerpt: deriveExcerpt(message, attachment),
    facebookPostId: post.id,
    imageUrl: post.full_picture || readAttachmentImage(attachment),
    isLive: false,
    isRepost: isRepost(attachment, message),
    message,
    permalinkUrl: post.permalink_url ?? `https://www.facebook.com/${post.id}`,
    rawPayload: JSON.stringify(post),
    title: deriveTitle(attachment, message),
  };
};

const fetchFacebookPagePosts = async () => {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const limit = process.env.FACEBOOK_SYNC_PAGE_SIZE || '25';

  if (!pageId || !pageAccessToken) {
    throw new Error('Facebook Page credentials are not configured');
  }

  const params = new URLSearchParams({
    access_token: pageAccessToken,
    fields: GRAPH_FIELDS,
    limit,
  });

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/posts?${params.toString()}`,
    {
      headers: { Accept: 'application/json' },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Facebook sync failed with status ${response.status}: ${errorText}`);
  }

  const payload = (await response.json()) as MetaFeedResponse;
  return payload.data ?? [];
};

export const syncFacebookPosts = async () => {
  const remotePosts = await fetchFacebookPagePosts();
  const normalizedPosts = remotePosts
    .map(normalizePost)
    .filter((post): post is FacebookPost & { rawPayload: string } => post !== null);

  upsertFacebookPosts(normalizedPosts);

  return {
    importedCount: normalizedPosts.length,
    skippedCount: remotePosts.length - normalizedPosts.length,
  };
};
