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
  response: (res: Response<any>, req?: Request, originalReq?: Request) =>
    Response<any> | Promise<Response<any>>;
}

/**
 * A type of request or response, or both filter.
 */
export type Filter = RequestFilter | ResponseFilter | (RequestFilter & ResponseFilter);

/**
 * A class that sends the request.
 */
export default class RequestClient {
  private filters: Filter[] = [];

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

    const { target = '', method, path = '', query, headers, body } = request;
    const uri = `${target}/${path}`;
    const url = query ? `${uri}?${queryString.stringify(query)}` : uri;

    const response = await fetch(url, { method, headers, body });

    return await Bluebird.reduce<Filter, Response<T>>(
      this.filters.reverse(),
      async (res, filter: ResponseFilter) =>
        (filter.response ? await filter.response(res, request, originalRequest) : res),
      response,
    );
  }
}
