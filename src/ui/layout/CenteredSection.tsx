import { ReactNode } from 'react';
import { AppConfig } from '../../utils/AppConfig';

type ICenteredSectionProps = {
  logo: ReactNode;
  children: ReactNode;
};

const CenteredSection = (props: ICenteredSectionProps) => (
  <div className="text-center">
    {props.logo}

    <nav>
      <ul className="navbar mt-5 flex flex-row justify-center font-medium text-xl text-gray-800">
        {props.children}
      </ul>
    </nav>


    <div className="mt-8 text-sm">
    <div className="section-copyright">
    <span>© Copyright {new Date().getFullYear()} {AppConfig.title}. </span>
  </div>
    </div>

    <style jsx>
      {`
        .navbar :global(li) {
          @apply mx-4;
        }
        .section-copyright :global(a) {
          @apply text-primary-500;
        }

        .section-copyright :global(a:hover) {
          @apply underline;
        }
        .section-icon-list :global(a:not(:last-child)) {
              @apply mr-3;
            }

            .section-icon-list :global(a) {
              @apply text-gray-500;
            }

            .section-icon-list :global(a:hover) {
              @apply text-gray-700;
            }

            .section-icon-list :global(svg) {
              @apply fill-current w-5 h-5;
            }
            .section-icon-list :global(a:not(:last-child)) {
              @apply mr-3;
            }

            .section-icon-list :global(a) {
              @apply text-gray-500;
            }

            .section-icon-list :global(a:hover) {
              @apply text-gray-700;
            }

            .section-icon-list :global(svg) {
              @apply fill-current w-5 h-5;
            }
      `}
    </style>
  </div>
);

export { CenteredSection };
