import Document, { Head, Html, Main, NextScript } from 'next/document';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

class MyDocument extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__.locale ?? I18N_DEFAULT_LOCALE;
    return (
      <Html lang={locale}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
