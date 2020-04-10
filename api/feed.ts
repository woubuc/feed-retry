import { NowRequest, NowResponse } from '@now/node';
import fetch from 'node-fetch';

export default async function(req: NowRequest, res: NowResponse) {
	// Make sure the `url` query parameter exists
	let sourceUrl = req.query.url;
	if (typeof sourceUrl !== 'string') {
		res.status(400).end();
		return;
	}

	// Parse the query parameter into an URL
	let url = getUrl(sourceUrl);
	if (url === undefined) {
		res.status(404).end();
		return;
	}

	// Wait a little while to spread out simultaneous requests
	await waitRandom(200);

	let data = await loadFeed(url);

	// Cache the results on the Zeit CDN for up to an hour and use "stale while
	// revalidate" caching rule. This means that the cached results will be returned,
	// and then the CDN edge server will load the updated data. This means the
	// response will be sent very quickly if the result was cached, but it may be
	// outdated up to 1 hour.
	res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600, stale-while-revalidate');

	res.setHeader('Content-Type', 'text/xml');
	res.status(200).send(data);
}

/**
 * Parses a string into a URL
 *
 * @param source - The source string
 *
 * @returns the URL instance, or undefined if `source` isn't a valid URL
 */
function getUrl(source : string) : URL | undefined {
	try {
		return new URL(source);
	} catch (err) {
		return undefined;
	}
}

/**
 * Resolves after a random number of milliseconds
 *
 * @param max - Maximum time to wait before resolving
 */
function waitRandom(max : number) : Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => resolve(), Math.random() * max);
	});
}

/**
 * Loads the feed
 *
 * Recursively calls itself until successful
 *
 * @param url - The feed URL
 */
async function loadFeed(url : URL) : Promise<string> {
	let feed = await fetch(url);
	if (feed.status !== 200) {
		await waitRandom(2000);
		return loadFeed(url);
	}
	return feed.text();
}