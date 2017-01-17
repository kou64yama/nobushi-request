import * as fetch from 'isomorphic-fetch';
import * as queryString from 'query-string';
import * as Bluebird from 'bluebird';
import RequestBuilder from './RequestBuilder';

/**
 * An interface representing request content.
 */
export interface Request {
  target?: string;
  method: string;
  path?: string;
  query?: { [name: string]: any };
  headers: { [name: string]: any };
  body?: any;
}

/**
 * An interface representing response content.
 *
 * @param T  The type of body.
 */
export interface Response<T> extends IResponse {
  body: T;
}

/**
 * An interface representing request filter object.
 */
export interface RequestFilter {
  /**
   * Converts `Request` object.
   *
   * @param req The request object.
   * @returns A converted request object.
   */
  request: (req: Request) => Request;
}

/**
 * An interface representing response filter object.
 */
export interface ResponseFilter {
  /**
   * Converts `Response` object.
   *
   * @param res  The converting response.
   * @param req  The sent request object.
   * @param originalReq  The original request object.
   * @returns A converted response.
   */
  response: (res: Response<any>, req: Request, originalReq: Request) =>
    Response<any> | Promise<Response<any>>;
}

/**
 * A type of request or response, or both filter.
 */
export type Filter = RequestFilter | ResponseFilter | (RequestFilter & ResponseFilter);

/**
 * A Request client options object containing any custom settings that you
 * want to apply to the request.
 */
interface Options {
  /**
   * The mode you want to use for the request, e.g., `cors`, `no-cors`, or
   * `same-origin`.
   */
  mode?: 'cors' | 'no-cors' | 'same-origin';

  /**
   * The request credentials you want to use for the request: `omit`,
   * `same-origin`, or `include`. To automatically send cookies for the current
   * domain, this option must be provided.
   */
  credentials?: 'omit' | 'same-origin' | 'include';

  /**
   * The cache mode you want to use for the request: `default`, `no-store`,
   * `reload`, `no-cache`, `force-cache`, or `only-if-cached`.
   */
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache';

  /**
   * The redurect mode to use: `follow` (automatically follow redirects),
   * `error` (abort with an error if a redirect occurs), or `manual` (handle
   * redirects manually).
   */
  redirect?: 'follow' | 'error' | 'manual';

  /**
   * A USVString specifying `no-referrer`, `client`, or a URL.
   */
  referrer?: string;

  /**
   * Specifies the value of the referer HTTP header. May be one of
   * `no-referrer`, `no-referrer-when-downgrade`, `origin`,
   * `origin-when-cross-origin`, `unsafe-url`.
   */
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'unsafe-url';
}

/**
 * A class that sends the request.
 */
export default class RequestClient {
  private options: Options;
  private filters: Filter[] = [];

  public constructor(options: Options = {}) {
    this.options = { ...options };
  }

  /**
   * Registers a request or response, or both filter.
   *
   * @param filter  The request or response filter.
   */
  public register(filter: Filter) {
    this.filters.push(filter);
  }

  /**
   * Sets the request target, and returns the `RequestBuilder` instance.
   *
   * @param target  The request target.
   * @returns The request builder.
   */
  public target(target: string): RequestBuilder {
    return new RequestBuilder(this).target(target);
  }

  /**
   * Sends the request, and returns the response object.
   *
   * The request filters are applied in the order of registration,
   * and the response filters are in reversed order.
   *
   * @param T  The type of response body.
   * @param originalRequest  The request content.
   * @returns  The response content
   */
  public async send<T>(originalRequest: Request): Promise<Response<T>> {
    const request = this.filters.reduce<Request>(
      (req, filter: RequestFilter) => (filter.request ? filter.request(req) : req),
      originalRequest,
    );

    const { target, method, path = '', query, headers, body } = request;
    const uri = `${target}/${path}`;
    const url = query ? `${uri}?${queryString.stringify(query)}` : uri;

    const response = await fetch(url, { method, headers, body, ...this.options });

    return await Bluebird.reduce<Filter, Response<T>>(
      this.filters,
      async (res, filter: ResponseFilter) =>
        (filter.response ? await filter.response(res, request, originalRequest) : res),
      response,
    );
  }
}
