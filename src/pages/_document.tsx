import {
  DocumentHeadTags,
  type DocumentHeadTagsProps,
  documentGetInitialProps,
} from '@mui/material-nextjs/v15-pagesRouter';
import Document, { type DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

class MyDocument extends Document<DocumentHeadTagsProps> {
  static async getInitialProps(ctx: DocumentContext) {
    return documentGetInitialProps(ctx);
  }

  render() {
    const locale = this.props.__NEXT_DATA__.locale ?? I18N_DEFAULT_LOCALE;
    return (
      <Html lang={locale}>
        <Head>
          <DocumentHeadTags {...this.props} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
