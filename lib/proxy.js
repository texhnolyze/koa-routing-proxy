'use strict';

module.exports = ({ urlParser, requestPromise }) =>
  function proxyRequestTo(url = this.url) {
    return function* proxyMiddleware(next) {
      const self = this;

      const requestOptions = buildRequestOptions(url, this);
      const response = yield requestPromise(requestOptions);

      setResponseHeaders(response, self);
      setResponseStatus(response, self);
      setResponseBody(response, self);

      yield next;
    };

    function setResponseHeaders(proxyResponse, originResponse) {
      Object.keys(proxyResponse.headers).forEach((header) => {
        originResponse.set(header, proxyResponse.headers[header]);
      });
    }

    function setResponseStatus(proxyResponse, originResponse) {
      originResponse.status = proxyResponse.statusCode;
    }

    function setResponseBody(proxyResponse, originResponse) {
      originResponse.body = proxyResponse.body;
    }

    function buildRequestOptions(
      path,
      { method, query, headers, body, request }
    ) {
      const options = {
        url: path,
        method,
        headers,
        query,
      };

      if (shouldProxiedCallHaveABody(method)) {
        if (!body) {
          console.warn('sending PUT or POST but no request body found');
        } else if (isRequestBodyJSON(request)) {
          options.json = true;
          options.body = JSON.stringify(body);
        } else {
          options.body = body;
        }
      }

      return setRequestHeaders(options);
    }

    function isRequestBodyJSON(request) {
      return request.type === 'application/json';
    }

    function setRequestHeaders(options) {
      options.headers['x-forwarded-for'] = options.headers.host;
      options.headers.host = urlParser.parse(options.headers.host).host;

      return options;
    }

    function shouldProxiedCallHaveABody(requestMethod) {
      return (requestMethod === 'POST' || requestMethod === 'PUT');
    }
  };
