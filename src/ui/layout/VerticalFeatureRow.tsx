import className from 'classnames';
import { useRouter } from 'next/router';
import { AnimationOnScroll } from 'react-animation-on-scroll';

type IVerticalFeatureRowProps = {
  title: string;
  description: string | React.ReactNode;
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
        <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
      <div className={`w-full px-2 text-center sm:text-left`}>
        <h3 className="text-3xl text-gray-900 font-semibold">{props.title}</h3>
        <div className="mt-6 text-lg">{props.description}</div>
      </div>
      </AnimationOnScroll>

      <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
      <div className="w-full p-2">
        <img
          src={`${router.basePath}${props.image}`}
          alt={props.imageAlt}
          className="rounded max-h-80 w-full min-w-[350px]"
        />
      </div>
      </AnimationOnScroll>
    </div>
  );
};

export { VerticalFeatureRow };
