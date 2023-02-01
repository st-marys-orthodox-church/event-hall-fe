import { Button, Card } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Section } from '../layout/Section';

export type ICardGridListItemProps = {
  title: string;
  img?: `${string}`;
  price?: string;
  description: string | ReactNode;
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
};

const CardGrid = ({ title, description, list }: ICardGridProps) => {
  const { push } = useRouter();
  return (
    <Section title={title} description={description} className={``}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list &&
          list.map((el, i) => (
            <Card
              className="p-3 md:p-4 shadow-md rounded-lg bg-neutral-100 flex flex-col justify-between gap-4"
              key={`card-grid-${i}`}
            >
              <div>
                <h4 className="text-xl font-semibold">{el.title}</h4>
                {el.price && (
                  <span className="text-neutral-600">{el.price}</span>
                )}
                {el.img && (
                  <img
                    src={el.img}
                    alt={el.title}
                    className="rounded mt-2 h-60 object-cover w-full"
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
          ))}
      </div>
    </Section>
  );
};

export { CardGrid };
