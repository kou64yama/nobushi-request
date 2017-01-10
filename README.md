# NobushiRequest

NobushiRequest is a isomorphic HTTP request library.

## Usage

### Basic usage

```js
import { RequestClient } from 'nobushi-request';

const client = new RequestClient();

// POST http://localhost:3000/api/posts
client
  .target('http://localhost:3000')
  .path('/api/posts')
  .headers({ 'Content-Type': 'application/json' })
  .post(JSON.stringify({ title: '...', content: '...' }))
  .then(res => res.json())
  .then(({ id, title }) => {
    console.log(`Posted ${title} (#${id})`);
  });
```

### Register filters

##### `client.js`

```js
import { RequestClient } from 'nobushi-request';

const client = new RequestClient();

// Applies JSON.stringify() if the request has body.
client.register({
  response(req) {
    if (typeof req.body !== 'object') {
      return req;
    }

    const headers = { ...req.headers, 'Content-Type': 'application/json' };
    const body = JSON.stringify(req.body);
    return { ...req, headers, body };
  },
});

// Parses JSON if the content type is "application/json".
client.register({
  async response(res) {
    const contentType = res.headers.get('Content-Type');
    if (!/^application\/json(;.*)?$/i.test(contentType)) {
      return res;
    }

    const body = await res.json();
    return { ...res, body };
  },
});

export default client;
```

##### `main.js`

```js
import client from './client';

const request = client.target('http://localhost:3000/api');

request
  .path('/posts')
  .post({ title: '...', content: '...' })
  .then(({ id, title }) => {
    return request
      .path('/notify')
      .post({ message: `Posted ${title} (#${id})` });
  });
```

## License

MIT

## Author

[@kojyamad](https://twitter.com/kojyamad)
