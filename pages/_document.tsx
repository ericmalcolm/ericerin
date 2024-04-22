import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
	render() {
		return (
			<Html lang='en'>
				<Head>
					<link rel='icon' href='/favicon.ico' />
					<meta
						name='description'
						content='Quick image gallery for celebrating 10 years of Eric and Erin being together.'
					/>
					<meta property='og:site_name' content='Eric & Erin - 10 Years!' />
					<meta
						property='og:description'
						content='See pictures from Next.js Conf and the After Party.'
					/>
					<meta property='og:title' content='Eric & Erin - 10 Years!' />
				</Head>
				<body className='bg-black antialiased'>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
