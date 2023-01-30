import className from 'classnames';
import { useRouter } from 'next/router';

type IVerticalFeatureRowProps = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

const VerticalFeatureRow = (props: IVerticalFeatureRowProps) => {
  const verticalFeatureClass = className(
    'mt-20',
    'flex',
    'flex-col sm:flex-row',
    'items-center',
    'gap-2',
    {
      'sm:flex-row-reverse': props.reverse,
    }
  );

  const router = useRouter();

  return (
    <div className={`${verticalFeatureClass}`}>
      <div className={`w-full px-2 text-center ${props.reverse ? 'sm:text-right' : 'sm:text-left'}`}>
        <h3 className="text-3xl text-gray-900 font-semibold">{props.title}</h3>
        <div className="mt-6 text-lg">{props.description}</div>
      </div>

      <div className="w-full p-2">
        <img src={`${router.basePath}${props.image}`} alt={props.imageAlt} className="rounded max-h-80 w-full" />
      </div>
    </div>
  );
};

export { VerticalFeatureRow };
