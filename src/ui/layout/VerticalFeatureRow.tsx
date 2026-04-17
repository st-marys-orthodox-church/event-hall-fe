import className from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { useScrollParallax } from '../../hooks';

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
    'gap-6 sm:gap-12',
    {
      'sm:flex-row-reverse': props.reverse,
    }
  );

  const router = useRouter();
  const { ref, offset } = useScrollParallax<HTMLDivElement>({ speed: 0.18, max: 80 });

  return (
    <div className={`${verticalFeatureClass}`}>
      <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
        <div className="w-full px-2 text-center sm:text-left">
          <span className="eyebrow text-[#c9a86c]">The Venue</span>
          <h3 className="mt-3 text-4xl md:text-5xl text-stone-900 font-display font-medium leading-tight">
            {props.title}
          </h3>
          <div className="mt-3 w-12 h-px bg-[#c9a86c] mx-auto sm:mx-0" />
          <div className="mt-6 text-lg text-stone-600 leading-relaxed">{props.description}</div>
        </div>
      </AnimationOnScroll>

      <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
        <div className="w-full p-2">
          <div
            ref={ref}
            className="relative overflow-hidden shadow-luxe"
            style={{ aspectRatio: '7 / 5' }}
          >
            <div
              className="absolute -inset-y-12 inset-x-0 will-change-transform"
              style={{ transform: `translate3d(0, ${offset}px, 0)` }}
            >
              <Image
                src={`${router.basePath}${props.image}`}
                alt={props.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </AnimationOnScroll>
    </div>
  );
};

export { VerticalFeatureRow };
