import RequestClient, { Response } from './RequestClient';

const END_SLASHES = /(\/*)$/;
const START_OR_END_SLASHES = /(^\/|\/$)/g;

/**
 * An interface representing request content.
 */
interface Request {
  target?: string;
  method?: string;
  path?: string;
  query?: { [name: string]: any };
  headers?: { [name: string]: any };
  body?: any;
}

/**
 * A class that builds request content.
 */
export default class RequestBuilder {
  private client: RequestClient;
  private request: Request;

  /**
   * A constructor.
   *
   * @param client  The request client that called this constructor.
   * @param filters  The request or response, or both filters.
   */
  public constructor(client: RequestClient, request: Request = {}) {
    this.client = client;
    this.request = { ...request };
  }

  /**
   * Sets the headers, and returns this.
   *
   * @param headers  The headers.
   * @returns this
   */
  public headers(headers: { [name: string]: any }): RequestBuilder {
    return new RequestBuilder(this.client, {
      ...this.request,
      headers,
    });
  }

  /**
   * Sets the target, and returns this.
   *
   * @param target  The target.
   * @returns this
   */
  public target(target: string): RequestBuilder {
    return new RequestBuilder(this.client, {
      ...this.request,
      target: target.replace(END_SLASHES, ''),
    });
  }

  /**
   * Sets the path, and returns this.
   *
   * @param path  The path.
   * @returns this
   */
  public path(path: string): RequestBuilder {
    return new RequestBuilder(this.client, {
      ...this.request,
      path: encodeURI(path.replace(START_OR_END_SLASHES, '')),
    });
  }

  /**
   * Sets the query parameters, and returns this.
   *
   * @param query  The path.
   * @returns this
   */
  public query(query: { [name: string]: any }): RequestBuilder {
    return new RequestBuilder(this.client, {
      ...this.request,
      query,
    });
  }

  /**
   * Gets request headers object.
   *
   * @returns  Non-null object
   */
  private getHeaders(): { [name: string]: any } {
    const { headers = {} } = this.request;
    return headers;
  }

  /**
   * Sends the GET request, and returns the response content.
   *
   * @param T  The type of response body.
   * @returns The response content.
   */
  public get<T>(): Promise<Response<T>> {
    const headers = this.getHeaders();
    return this.client.send({ ...this.request, method: 'get', headers });
  }

  /**
   * Sends the POST request, and returns the response content.
   *
   * @param T  The type of response body.
   * @param body  The request body.
   * @returns The response content.
   */
  public post<T>(body?: any): Promise<Response<T>> {
    const headers = this.getHeaders();
    return this.client.send({ ...this.request, method: 'post', headers, body });
  }

  /**
   * Sends the PUT request, and returns the response content.
   *
   * @param T  The type of response body.
   * @param body  The request body.
   * @returns The response content.
   */
  public put<T>(body?: any): Promise<Response<T>> {
    const headers = this.getHeaders();
    return this.client.send({ ...this.request, method: 'put', headers, body });
  }

  /**
   * Sends the DELETE request, and returns the response content.
   *
   * @param T  The type of response body.
   * @param body  The request body.
   * @returns The response content.
   */
  public delete<T>(body?: any): Promise<Response<T>> {
    const headers = this.getHeaders();
    return this.client.send({ ...this.request, method: 'delete', headers, body });
  }
}
