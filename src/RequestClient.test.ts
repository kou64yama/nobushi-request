import test from 'ava';
import * as nock from 'nock';
import RequestClient, { Request, Response } from './RequestClient';

test.beforeEach(() => {
  nock('http://localhost')
    // Echo the request body
    .post('/echo/body')
    .reply(200, (_uri: string, body: string) => body)
    .put('/echo/body')
    .reply(200, (_uri: string, body: string) => body)
    .delete('/echo/body')
    .reply(200, (_uri: string, body: string) => body);
});

test.afterEach(() => {
  nock.restore();
});

test('request filter', async (t) => {
  const client = new RequestClient();
  client.register({
    request: (req: Request) => ({
      ...req,
      body: typeof req.body === 'object' ? JSON.stringify(req.body) : undefined,
    }),
  });

  const res = await client
    .target('http://localhost')
    .path('/echo/body')
    .post({ foo: 'bar' });
  t.deepEqual(await res.json(), { foo: 'bar' });
});

test('response filter', async (t) => {
  const client = new RequestClient();
  client.register({
    response: async (res: Response<any>) => ({
      ...res,
      body: await res.json(),
    }),
  });

  const res = await client
    .target('http://localhost')
    .path('/echo/body')
    .post<{ foo: string }>(JSON.stringify({ foo: 'bar' }));
  t.deepEqual(await res.body, { foo: 'bar' });
});
