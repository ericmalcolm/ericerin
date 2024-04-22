import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import Modal from '../components/Modal';
import cloudinary from '../utils/cloudinary';
import getBase64ImageUrl from '../utils/generateBlurPlaceholder';
import type { ImageProps } from '../utils/types';
import { useLastViewedPhoto } from '../utils/useLastViewedPhoto';

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
	const router = useRouter();
	const { photoId } = router.query;
	const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

	const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		// This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
		if (lastViewedPhoto && !photoId) {
			lastViewedPhotoRef.current.scrollIntoView({ block: 'center' });
			setLastViewedPhoto(null);
		}
	}, [photoId, lastViewedPhoto, setLastViewedPhoto]);

	return (
		<>
			<Head>
				<title>Eric & Erin Picture Expanded View</title>
				<meta property='og:image' content='https://ericerin.com/og-image.png' />
				<meta
					name='twitter:image'
					content='https://ericerin.com/og-image.png'
				/>
			</Head>
			<main className='mx-auto max-w-[1960px] p-4'>
				{photoId && (
					<Modal
						images={images}
						onClose={() => {
							setLastViewedPhoto(photoId);
						}}
					/>
				)}
				<div className='after:content relative mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-16 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight'>
					<Image alt='E & E Logo' src='/e-e_white.png' />
					<h1 className='sr-only mb-4 mt-8 text-base font-bold uppercase tracking-widest'>
						Eric & Erin
					</h1>
					<p className='max-w-[40ch] text-white/75 sm:max-w-[32ch]'>
						Celebrating 10 years!
					</p>
					<p className='sr-only'>
						Hello there if you are visiting with a screen reader, I am sorry,
						but the image alt text descriptions are not descriptive at the
						moment. This was put up here for my wife, if I get he time to handle
						the logic to dynamically populate alt text I will.
					</p>
				</div>
				<div className='columns-2 gap-4 sm:columns-3 xl:columns-4 2xl:columns-5'>
					{images.map(({ id, public_id, format, blurDataUrl }) => (
						<Link
							key={id}
							href={`/?photoId=${id}`}
							as={`/p/${id}`}
							ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
							shallow
							className='after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight'>
							<Image
								alt=''
								// alt='Eric & Erin' // TODO: dynamic alt tags
								className='transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110'
								style={{ transform: 'translate3d(0, 0, 0)' }}
								placeholder='blur'
								blurDataURL={blurDataUrl}
								src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
								width={720}
								height={480}
								sizes='(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw'
							/>
						</Link>
					))}
				</div>
			</main>
			<footer className='p-6 text-center text-white/80 sm:p-12'>
				All pictures are property of Eric & Erin Malcolm.
			</footer>
		</>
	);
};

export default Home;

export async function getStaticProps() {
	const results = await cloudinary.v2.search
		.expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
		.sort_by('public_id', 'desc')
		.max_results(400)
		.execute();
	let reducedResults: ImageProps[] = [];

	let i = 0;
	for (let result of results.resources) {
		reducedResults.push({
			id: i,
			height: result.height,
			width: result.width,
			public_id: result.public_id,
			format: result.format,
		});
		i++;
	}

	const blurImagePromises = results.resources.map((image: ImageProps) => {
		return getBase64ImageUrl(image);
	});
	const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

	for (let i = 0; i < reducedResults.length; i++) {
		reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i];
	}

	return {
		props: {
			images: reducedResults,
		},
	};
}
