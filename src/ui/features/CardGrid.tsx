import { Button, Card } from '@mui/material';
import Image from 'next/image';
import { Section } from '../layout/Section';

export type ICardGridListItemProps = {
  title: string;
  img?: `${string}`
  price?: string;
  description: string;
  cta?: {
    action: any;
    text: string;
  };
}

type ICardGridProps = {
  title?: string;
  description?: string;
  list: ICardGridListItemProps[]
}

const CardGrid = ({ title, description, list }: ICardGridProps) => {
  return (
  <Section
    title={title}
    description={description}
    className={``}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {list && list.map((el, i) => (
      <Card 
        className="p-3 md:p-4 shadow-md rounded-lg bg-neutral-100 flex flex-col justify-between gap-4"
        key={`card-grid-${el.title}-${i}`}
      >
        <div>
        <h4 className="text-lg font-semibold">{el.title}</h4>
        {el.price && (<span className="text-sm text-neutral-600">{el.price}</span>)}
        {el.img && (
        <Image src={el.img} />
        )}
        <p>{el.description}</p>
        </div>
        {el.cta && (
          <Button onClick={el.cta.action}>
            {el.cta.text}
          </Button>
        )}
      </Card>
    ))}
    </div>
  </Section>
)
        }

export { CardGrid };
