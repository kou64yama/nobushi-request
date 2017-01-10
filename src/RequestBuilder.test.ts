import test from 'ava';
import * as nock from 'nock';
import RequestBuilder from './RequestBuilder';
import RequestClient from './RequestClient';

const client = new RequestClient();

test.beforeEach(() => {
  nock('http://localhost')
    // Echo the request method
    .get('/')
    .reply(200, 'get')
    .post('/')
    .reply(201, 'post')
    .put('/')
    .reply(200, 'put')
    .delete('/')
    .reply(200, 'delete')
    // Echo the request URI
    .get(/\/echo\/uri/)
    .reply(200, (uri: string) => uri)
    // Echo the request body
    .post('/echo/body')
    .reply(200, (_uri: string, body: string) => body)
    .put('/echo/body')
    .reply(200, (_uri: string, body: string) => body)
    .delete('/echo/body')
    .reply(200, (_uri: string, body: string) => body)
    // Echo the request headers
    .get('/echo/headers')
    .reply(200, '', { 'X-Echo-Reply': (_req, _res, _body) => _req.headers['x-echo'] });
});

test.afterEach(() => {
  nock.restore();
});

const builder = new RequestBuilder(client, { target: 'http://localhost' });

test('#get() sends a GET request', async (t) => {
  const res = await builder.get();
  t.is(await res.text(), 'get');
});

test('#post() sends a POST request', async (t) => {
  const res = await builder.post();
  t.is(await res.text(), 'post');
});

test('#put() sends a PUT request', async (t) => {
  const res = await builder.put();
  t.is(await res.text(), 'put');
});

test('#delete() sends a DELETE request', async (t) => {
  const res = await builder.delete();
  t.is(await res.text(), 'delete');
});

test('#query() sets query parameters', async (t) => {
  const res = await builder.path('/echo/uri').query({ foo: 'bar' }).get();
  t.is(await res.text(), '/echo/uri?foo=bar');
});

test('#post() sends a request body', async (t) => {
  const res = await builder.path('/echo/body').post('foobar');
  t.is(await res.text(), 'foobar');
});

test('#put() sends a request body', async (t) => {
  const res = await builder.path('/echo/body').put('foobar');
  t.is(await res.text(), 'foobar');
});

test('#delete() sends a request body', async (t) => {
  const res = await builder.path('/echo/body').delete('foobar');
  t.is(await res.text(), 'foobar');
});

test('#headers() sets a request headers', async (t) => {
  const res = await builder.path('/echo/headers').headers({ 'X-Echo': 'foobar' }).get();
  t.is(res.headers.get('X-Echo-Reply'), 'foobar');
});
