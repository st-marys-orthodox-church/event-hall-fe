import { Button, Card } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { Section } from '../layout/Section';

export type ICardGridListItemProps = {
  title: string;
  img?: `${string}`;
  price?: string;
  description?: string | ReactNode;
  cta?: {
    action?: any;
    text: string;
    link?: string;
  };
};

type ICardGridProps = {
  title?: string;
  description?: string;
  list: ICardGridListItemProps[];
  seeall?: boolean;
};

const CardGrid = ({ title, description, list, seeall }: ICardGridProps) => {
  const { push } = useRouter();
  return (
    <Section title={title} description={description} className={``}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list &&
          list.map((el, i) => (
            <AnimationOnScroll
              animateIn="animate__fadeInUp"
              delay={i * 150}
              key={`card-grid-${i}`}
              animateOnce
            >
              <Card className="p-3 md:p-4 shadow-md rounded-lg bg-neutral-100 flex flex-col justify-between gap-4 h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold">{el.title}</h4>
                    {el.price && (
                      <span className="text-neutral-600">{el.price}</span>
                    )}
                  </div>
                  {el.img && (
                    <img
                      src={el.img}
                      alt={el.title}
                      className="rounded mt-2 h-60 object-cover w-full object-top"
                    />
                  )}
                  <div className="pt-2">{el.description}</div>
                </div>
                {el.cta && (
                  <Button
                    onClick={
                      el.cta.action
                        ? el.cta.action
                        : () =>
                            push({
                              pathname: el.cta?.link || '',
                              query: {
                                tab: i,
                              },
                            })
                    }
                  >
                    {el.cta.text}
                  </Button>
                )}
              </Card>
            </AnimationOnScroll>
          ))}
      </div>
      {seeall && (
        <div className="flex justify-center w-full mt-6">
          <Button className="!px-4" onClick={() => push({pathname: '/packages'})}>See All Our Packages</Button>
        </div>
      )}
    </Section>
  );
};

export { CardGrid };
