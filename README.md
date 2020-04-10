# feed-retry
Retries an RSS feed until it succeeds. This helps to work around rate limiting,
as long as it doesn't matter that the request may take several seconds longer
(or however long until it succeeds).

## How to use
Clone the repository and deploy to [Zeit Now](https://zeit.co/home).