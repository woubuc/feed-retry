import { NowRequest, NowResponse } from '@now/node';
import fetch from 'node-fetch';

export default async function(req: NowRequest, res: NowResponse) {
	let sourceUrl = req.query.url;
	if (typeof sourceUrl !== 'string') {
		res.status(400).end();
		return;
	}

	let url = getUrl(sourceUrl);
	if (url === undefined) {
		res.status(404).end();
		return;
	}

	await wait(100);
	let data = await loadFeed(url);

	res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600, stale-while-revalidate');
	res.setHeader('Content-Type', 'text/xml');
	res.status(200).send(data);
}

function getUrl(source : string) : URL | undefined {
	try {
		return new URL(source);
	} catch (err) {
		return undefined;
	}
}

function wait(max : number) : Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => resolve(), Math.random() * max);
	});
}

async function loadFeed(url : URL) : Promise<string> {
	let feed = await fetch(url);
	if (feed.status !== 200) {
		await wait(2000);
		return loadFeed(url);
	}
	return feed.text();
}