import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { Hero } from '../ui/features/Hero';
import { ParishHomepageHub } from '../ui/features/ParishHomepageHub';
import type { ChurchCalendarEvent } from '../utils/churchCalendarShared';
import type { FacebookPost } from '../utils/facebookPostsShared';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

type HomePageProps = {
  calendarUnavailable: boolean;
  homepagePosts: Array<{
    date: string;
    excerpt: string;
    isRepost: boolean;
    permalinkUrl: string;
    title: string;
  }>;
  todayEvents: ChurchCalendarEvent[];
  upcomingDays: Array<{
    dayKey: string;
    events: ChurchCalendarEvent[];
  }>;
};

const Index = ({
  calendarUnavailable,
  homepagePosts,
  todayEvents,
  upcomingDays,
}: HomePageProps) => {
  const { t: tSeo } = useTranslation('seo');

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={tSeo('home.title')} description={tSeo('home.description')} />

      <Template>
        <Hero />
        <ParishHomepageHub
          calendarUnavailable={calendarUnavailable}
          homepagePosts={homepagePosts}
          todayEvents={todayEvents}
          upcomingDays={upcomingDays}
        />
      </Template>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async ({ locale }) => {
  const { getChurchCalendarEvents } = await import('../server/churchCalendar');
  const { getChurchCalendarEventDayKey } = await import('../utils/churchCalendarShared');
  const { listFacebookPosts } = await import('../server/facebookPostsStore');
  const { events, unavailable } = await getChurchCalendarEvents();
  const homepagePosts = listFacebookPosts(2).map((post: FacebookPost) => ({
    date: new Intl.DateTimeFormat(locale ?? undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(post.createdTime)),
    excerpt: post.excerpt || post.message,
    isRepost: post.isRepost,
    permalinkUrl: post.permalinkUrl,
    title: post.title,
  }));

  const now = new Date();
  const todayKey = getChurchCalendarEventDayKey({
    allDay: false,
    description: '',
    endIso: now.toISOString(),
    id: 'today',
    location: '',
    sourceKey: 'programLiturgic',
    startIso: now.toISOString(),
    title: 'today',
  });

  const todayEvents = events.filter((event) => getChurchCalendarEventDayKey(event) === todayKey);
  const upcomingLiturgicEvents = events.filter(
    (event) =>
      event.sourceKey === 'programLiturgic' && getChurchCalendarEventDayKey(event) > todayKey
  );

  const groupedUpcomingDays = upcomingLiturgicEvents.reduce<
    Array<{ dayKey: string; events: ChurchCalendarEvent[] }>
  >((days, event) => {
    const dayKey = getChurchCalendarEventDayKey(event);
    const existing = days.find((day) => day.dayKey === dayKey);

    if (existing) {
      existing.events.push(event);
      return days;
    }

    days.push({ dayKey, events: [event] });
    return days;
  }, []);

  return {
    props: {
      ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
        'common',
        'home',
        'packages',
        'seo',
        'contact',
      ])),
      calendarUnavailable: unavailable,
      homepagePosts,
      todayEvents,
      upcomingDays: groupedUpcomingDays.slice(0, 4),
    },
  };
};

export default Index;
