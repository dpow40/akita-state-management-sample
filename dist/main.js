/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 669:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(609);

/***/ }),

/***/ 448:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var settle = __webpack_require__(26);
var cookies = __webpack_require__(372);
var buildURL = __webpack_require__(327);
var buildFullPath = __webpack_require__(97);
var parseHeaders = __webpack_require__(109);
var isURLSameOrigin = __webpack_require__(985);
var createError = __webpack_require__(61);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var bind = __webpack_require__(849);
var Axios = __webpack_require__(321);
var mergeConfig = __webpack_require__(185);
var defaults = __webpack_require__(655);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(263);
axios.CancelToken = __webpack_require__(972);
axios.isCancel = __webpack_require__(502);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(713);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ 263:
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ 972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(263);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 502:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 321:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var buildURL = __webpack_require__(327);
var InterceptorManager = __webpack_require__(782);
var dispatchRequest = __webpack_require__(572);
var mergeConfig = __webpack_require__(185);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ 782:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 97:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(793);
var combineURLs = __webpack_require__(303);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ 61:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(481);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ 572:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var transformData = __webpack_require__(527);
var isCancel = __webpack_require__(502);
var defaults = __webpack_require__(655);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 481:
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ 185:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ 26:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(61);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 527:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ 655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var normalizeHeaderName = __webpack_require__(16);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(448);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(448);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 849:
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 303:
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ 793:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ 16:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 713:
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 867:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(849);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
(() => {
"use strict";

// UNUSED EXPORTS: pageStore, sampleStore

;// CONCATENATED MODULE: ./node_modules/tslib/tslib.es6.js
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var tslib_es6_assign = function() {
    tslib_es6_assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return tslib_es6_assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function tslib_es6_values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function tslib_es6_spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof tslib_es6_values === "function" ? tslib_es6_values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isFunction.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isFunction(x) {
    return typeof x === 'function';
}
//# sourceMappingURL=isFunction.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/config.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
    Promise: undefined,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = /*@__PURE__*/ new Error();
            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
        }
        else if (_enable_super_gross_mode_that_will_cause_bad_things) {
            /*@__PURE__*/ console.log('RxJS: Back to a better error behavior. Thank you. <3');
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
};
//# sourceMappingURL=config.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/hostReportError.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function hostReportError(err) {
    setTimeout(function () { throw err; }, 0);
}
//# sourceMappingURL=hostReportError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Observer.js
/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */


var empty = {
    closed: true,
    next: function (value) { },
    error: function (err) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            throw err;
        }
        else {
            hostReportError(err);
        }
    },
    complete: function () { }
};
//# sourceMappingURL=Observer.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isArray.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();
//# sourceMappingURL=isArray.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isObject.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isObject(x) {
    return x !== null && typeof x === 'object';
}
//# sourceMappingURL=isObject.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/UnsubscriptionError.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return UnsubscriptionErrorImpl;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;
//# sourceMappingURL=UnsubscriptionError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Subscription.js
/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */




var Subscription = /*@__PURE__*/ (function () {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._ctorUnsubscribe = true;
            this._unsubscribe = unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) {
            _parentOrParents.remove(this);
        }
        else if (_parentOrParents !== null) {
            for (var index = 0; index < _parentOrParents.length; ++index) {
                var parent_1 = _parentOrParents[index];
                parent_1.remove(this);
            }
        }
        if (isFunction(_unsubscribe)) {
            if (_ctorUnsubscribe) {
                this._unsubscribe = undefined;
            }
            try {
                _unsubscribe.call(this);
            }
            catch (e) {
                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
            }
        }
        if (isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject(sub)) {
                    try {
                        sub.unsubscribe();
                    }
                    catch (e) {
                        errors = errors || [];
                        if (e instanceof UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                        }
                        else {
                            errors.push(e);
                        }
                    }
                }
            }
        }
        if (errors) {
            throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (teardown) {
        var subscription = teardown;
        if (!teardown) {
            return Subscription.EMPTY;
        }
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (!(subscription instanceof Subscription)) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default: {
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
        }
        var _parentOrParents = subscription._parentOrParents;
        if (_parentOrParents === null) {
            subscription._parentOrParents = this;
        }
        else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) {
                return subscription;
            }
            subscription._parentOrParents = [_parentOrParents, this];
        }
        else if (_parentOrParents.indexOf(this) === -1) {
            _parentOrParents.push(this);
        }
        else {
            return subscription;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions === null) {
            this._subscriptions = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return subscription;
    };
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());

function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
}
//# sourceMappingURL=Subscription.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var rxSubscriber = /*@__PURE__*/ (function () {
    return typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
})();
var $$rxSubscriber = (/* unused pure expression or super */ null && (rxSubscriber));
//# sourceMappingURL=rxSubscriber.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Subscriber.js
/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */







var Subscriber = /*@__PURE__*/ (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
            case 0:
                _this.destination = empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    _this.destination = empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        _this.destination = destinationOrNext;
                        destinationOrNext.add(_this);
                    }
                    else {
                        _this.syncErrorThrowable = true;
                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
                    }
                    break;
                }
            default:
                _this.syncErrorThrowable = true;
                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                break;
        }
        return _this;
    }
    Subscriber.prototype[rxSubscriber] = function () { return this; };
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(Subscription));

var SafeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if (isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) {
                    _this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
            if (this._error) {
                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                hostReportError(err);
            }
            else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                }
                else {
                    hostReportError(err);
                }
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        if (!config.useDeprecatedSynchronousErrorHandling) {
            throw new Error('bad call');
        }
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            else {
                hostReportError(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

//# sourceMappingURL=Subscriber.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/canReportError.js
/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */

function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) {
            return false;
        }
        else if (destination && destination instanceof Subscriber) {
            observer = destination;
        }
        else {
            observer = null;
        }
    }
    return true;
}
//# sourceMappingURL=canReportError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/toSubscriber.js
/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */



function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber]) {
            return nextOrObserver[rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber(empty);
    }
    return new Subscriber(nextOrObserver, error, complete);
}
//# sourceMappingURL=toSubscriber.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/symbol/observable.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var observable_observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();
//# sourceMappingURL=observable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/identity.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function identity(x) {
    return x;
}
//# sourceMappingURL=identity.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/pipe.js
/** PURE_IMPORTS_START _identity PURE_IMPORTS_END */

function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
//# sourceMappingURL=pipe.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Observable.js
/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */





var Observable = /*@__PURE__*/ (function () {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber(observerOrNext, error, complete);
        if (operator) {
            sink.add(operator.call(sink, this.source));
        }
        else {
            sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                this._subscribe(sink) :
                this._trySubscribe(sink));
        }
        if (config.useDeprecatedSynchronousErrorHandling) {
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if (canReportError(sink)) {
                sink.error(err);
            }
            else {
                console.warn(err);
            }
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[observable_observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());

function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) {
        promiseCtor = config.Promise || Promise;
    }
    if (!promiseCtor) {
        throw new Error('no Promise impl found');
    }
    return promiseCtor;
}
//# sourceMappingURL=Observable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ObjectUnsubscribedErrorImpl;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;
//# sourceMappingURL=ObjectUnsubscribedError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/SubjectSubscription.js
/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */


var SubjectSubscription = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, subscriber) {
        var _this = _super.call(this) || this;
        _this.subject = subject;
        _this.subscriber = subscriber;
        _this.closed = false;
        return _this;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.subscriber);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(Subscription));

//# sourceMappingURL=SubjectSubscription.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Subject.js
/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */







var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(Subscriber));

var Subject = /*@__PURE__*/ (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.observers = [];
        _this.closed = false;
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype[rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));

var AnonymousSubject = /*@__PURE__*/ (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));

//# sourceMappingURL=Subject.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/Action.js
/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */


var Action = /*@__PURE__*/ (function (_super) {
    __extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return this;
    };
    return Action;
}(Subscription));

//# sourceMappingURL=Action.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js
/** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */


var AsyncAction = /*@__PURE__*/ (function (_super) {
    __extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && this.delay === delay && this.pending === false) {
            return id;
        }
        clearInterval(id);
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, delay) {
        var errored = false;
        var errorValue = undefined;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = !!e && e || new Error(e);
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype._unsubscribe = function () {
        var id = this.id;
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        var index = actions.indexOf(this);
        this.work = null;
        this.state = null;
        this.pending = false;
        this.scheduler = null;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, null);
        }
        this.delay = null;
    };
    return AsyncAction;
}(Action));

//# sourceMappingURL=AsyncAction.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/QueueAction.js
/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */


var QueueAction = /*@__PURE__*/ (function (_super) {
    __extends(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return (delay > 0 || this.closed) ?
            _super.prototype.execute.call(this, state, delay) :
            this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        return scheduler.flush(this);
    };
    return QueueAction;
}(AsyncAction));

//# sourceMappingURL=QueueAction.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Scheduler.js
var Scheduler = /*@__PURE__*/ (function () {
    function Scheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        this.SchedulerAction = SchedulerAction;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        return new this.SchedulerAction(this, work).schedule(state, delay);
    };
    Scheduler.now = function () { return Date.now(); };
    return Scheduler;
}());

//# sourceMappingURL=Scheduler.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js
/** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */


var AsyncScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        var _this = _super.call(this, SchedulerAction, function () {
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                return AsyncScheduler.delegate.now();
            }
            else {
                return now();
            }
        }) || this;
        _this.actions = [];
        _this.active = false;
        _this.scheduled = undefined;
        return _this;
    }
    AsyncScheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
            return AsyncScheduler.delegate.schedule(work, delay, state);
        }
        else {
            return _super.prototype.schedule.call(this, work, delay, state);
        }
    };
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this.active) {
            actions.push(action);
            return;
        }
        var error;
        this.active = true;
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (action = actions.shift());
        this.active = false;
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler));

//# sourceMappingURL=AsyncScheduler.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/QueueScheduler.js
/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */


var QueueScheduler = /*@__PURE__*/ (function (_super) {
    __extends(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(AsyncScheduler));

//# sourceMappingURL=QueueScheduler.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/queue.js
/** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */


var queueScheduler = /*@__PURE__*/ new QueueScheduler(QueueAction);
var queue = queueScheduler;
//# sourceMappingURL=queue.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/empty.js
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

var empty_EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
function empty_empty(scheduler) {
    return scheduler ? emptyScheduled(scheduler) : empty_EMPTY;
}
function emptyScheduled(scheduler) {
    return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
}
//# sourceMappingURL=empty.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isScheduler.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isScheduler(value) {
    return value && typeof value.schedule === 'function';
}
//# sourceMappingURL=isScheduler.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/subscribeToArray.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var subscribeToArray = function (array) {
    return function (subscriber) {
        for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    };
};
//# sourceMappingURL=subscribeToArray.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js
/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */


function scheduleArray(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        var i = 0;
        sub.add(scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
                return;
            }
            subscriber.next(input[i++]);
            if (!subscriber.closed) {
                sub.add(this.schedule());
            }
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleArray.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/fromArray.js
/** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */



function fromArray(input, scheduler) {
    if (!scheduler) {
        return new Observable(subscribeToArray(input));
    }
    else {
        return scheduleArray(input, scheduler);
    }
}
//# sourceMappingURL=fromArray.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/of.js
/** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */



function of_of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args[args.length - 1];
    if (isScheduler(scheduler)) {
        args.pop();
        return scheduleArray(args, scheduler);
    }
    else {
        return fromArray(args);
    }
}
//# sourceMappingURL=of.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/throwError.js
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

function throwError(error, scheduler) {
    if (!scheduler) {
        return new Observable(function (subscriber) { return subscriber.error(error); });
    }
    else {
        return new Observable(function (subscriber) { return scheduler.schedule(dispatch, 0, { error: error, subscriber: subscriber }); });
    }
}
function dispatch(_a) {
    var error = _a.error, subscriber = _a.subscriber;
    subscriber.error(error);
}
//# sourceMappingURL=throwError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/Notification.js
/** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */



var NotificationKind;
/*@__PURE__*/ (function (NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
var Notification = /*@__PURE__*/ (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    Notification.prototype.observe = function (observer) {
        switch (this.kind) {
            case 'N':
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.error);
            case 'C':
                return observer.complete && observer.complete();
        }
    };
    Notification.prototype.do = function (next, error, complete) {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return next && next(this.value);
            case 'E':
                return error && error(this.error);
            case 'C':
                return complete && complete();
        }
    };
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
            return this.observe(nextOrObserver);
        }
        else {
            return this.do(nextOrObserver, error, complete);
        }
    };
    Notification.prototype.toObservable = function () {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return of_of(this.value);
            case 'E':
                return throwError(this.error);
            case 'C':
                return empty_empty();
        }
        throw new Error('unexpected notification kind value');
    };
    Notification.createNext = function (value) {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return Notification.undefinedValueNotification;
    };
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    Notification.undefinedValueNotification = new Notification('N', undefined);
    return Notification;
}());

//# sourceMappingURL=Notification.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/observeOn.js
/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */



function observeOn(scheduler, delay) {
    if (delay === void 0) {
        delay = 0;
    }
    return function observeOnOperatorFunction(source) {
        return source.lift(new ObserveOnOperator(scheduler, delay));
    };
}
var ObserveOnOperator = /*@__PURE__*/ ((/* unused pure expression or super */ null && (function () {
    function ObserveOnOperator(scheduler, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        this.scheduler = scheduler;
        this.delay = delay;
    }
    ObserveOnOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
    };
    return ObserveOnOperator;
}())));

var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ObserveOnSubscriber, _super);
    function ObserveOnSubscriber(destination, scheduler, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        var _this = _super.call(this, destination) || this;
        _this.scheduler = scheduler;
        _this.delay = delay;
        return _this;
    }
    ObserveOnSubscriber.dispatch = function (arg) {
        var notification = arg.notification, destination = arg.destination;
        notification.observe(destination);
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
        var destination = this.destination;
        destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber.prototype._next = function (value) {
        this.scheduleMessage(Notification.createNext(value));
    };
    ObserveOnSubscriber.prototype._error = function (err) {
        this.scheduleMessage(Notification.createError(err));
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype._complete = function () {
        this.scheduleMessage(Notification.createComplete());
        this.unsubscribe();
    };
    return ObserveOnSubscriber;
}(Subscriber));

var ObserveOnMessage = /*@__PURE__*/ (function () {
    function ObserveOnMessage(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
    return ObserveOnMessage;
}());

//# sourceMappingURL=observeOn.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/ReplaySubject.js
/** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */







var ReplaySubject = /*@__PURE__*/ (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(bufferSize, windowTime, scheduler) {
        if (bufferSize === void 0) {
            bufferSize = Number.POSITIVE_INFINITY;
        }
        if (windowTime === void 0) {
            windowTime = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this) || this;
        _this.scheduler = scheduler;
        _this._events = [];
        _this._infiniteTimeWindow = false;
        _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
        _this._windowTime = windowTime < 1 ? 1 : windowTime;
        if (windowTime === Number.POSITIVE_INFINITY) {
            _this._infiniteTimeWindow = true;
            _this.next = _this.nextInfiniteTimeWindow;
        }
        else {
            _this.next = _this.nextTimeWindow;
        }
        return _this;
    }
    ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
        if (!this.isStopped) {
            var _events = this._events;
            _events.push(value);
            if (_events.length > this._bufferSize) {
                _events.shift();
            }
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype.nextTimeWindow = function (value) {
        if (!this.isStopped) {
            this._events.push(new ReplayEvent(this._getNow(), value));
            this._trimBufferThenGetEvents();
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        var _infiniteTimeWindow = this._infiniteTimeWindow;
        var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
        var scheduler = this.scheduler;
        var len = _events.length;
        var subscription;
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.isStopped || this.hasError) {
            subscription = Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            subscription = new SubjectSubscription(this, subscriber);
        }
        if (scheduler) {
            subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
        }
        if (_infiniteTimeWindow) {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i]);
            }
        }
        else {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i].value);
            }
        }
        if (this.hasError) {
            subscriber.error(this.thrownError);
        }
        else if (this.isStopped) {
            subscriber.complete();
        }
        return subscription;
    };
    ReplaySubject.prototype._getNow = function () {
        return (this.scheduler || queue).now();
    };
    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
        var now = this._getNow();
        var _bufferSize = this._bufferSize;
        var _windowTime = this._windowTime;
        var _events = this._events;
        var eventsCount = _events.length;
        var spliceCount = 0;
        while (spliceCount < eventsCount) {
            if ((now - _events[spliceCount].time) < _windowTime) {
                break;
            }
            spliceCount++;
        }
        if (eventsCount > _bufferSize) {
            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
        }
        if (spliceCount > 0) {
            _events.splice(0, spliceCount);
        }
        return _events;
    };
    return ReplaySubject;
}(Subject));

var ReplayEvent = /*@__PURE__*/ (function () {
    function ReplayEvent(time, value) {
        this.time = time;
        this.value = value;
    }
    return ReplayEvent;
}());
//# sourceMappingURL=ReplaySubject.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/BehaviorSubject.js
/** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */



var BehaviorSubject = /*@__PURE__*/ (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: true,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        if (subscription && !subscription.closed) {
            subscriber.next(this._value);
        }
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        if (this.hasError) {
            throw this.thrownError;
        }
        else if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return this._value;
        }
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, this._value = value);
    };
    return BehaviorSubject;
}(Subject));

//# sourceMappingURL=BehaviorSubject.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isObservable.js
/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

function isObservable_isObservable(obj) {
    return !!obj && (obj instanceof Observable || (typeof obj.lift === 'function' && typeof obj.subscribe === 'function'));
}
//# sourceMappingURL=isObservable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/subscribeToPromise.js
/** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */

var subscribeToPromise = function (promise) {
    return function (subscriber) {
        promise.then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, hostReportError);
        return subscriber;
    };
};
//# sourceMappingURL=subscribeToPromise.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/symbol/iterator.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator_iterator = /*@__PURE__*/ getSymbolIterator();
var $$iterator = (/* unused pure expression or super */ null && (iterator_iterator));
//# sourceMappingURL=iterator.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/subscribeToIterable.js
/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

var subscribeToIterable = function (iterable) {
    return function (subscriber) {
        var iterator = iterable[iterator_iterator]();
        do {
            var item = void 0;
            try {
                item = iterator.next();
            }
            catch (err) {
                subscriber.error(err);
                return subscriber;
            }
            if (item.done) {
                subscriber.complete();
                break;
            }
            subscriber.next(item.value);
            if (subscriber.closed) {
                break;
            }
        } while (true);
        if (typeof iterator.return === 'function') {
            subscriber.add(function () {
                if (iterator.return) {
                    iterator.return();
                }
            });
        }
        return subscriber;
    };
};
//# sourceMappingURL=subscribeToIterable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/subscribeToObservable.js
/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

var subscribeToObservable = function (obj) {
    return function (subscriber) {
        var obs = obj[observable_observable]();
        if (typeof obs.subscribe !== 'function') {
            throw new TypeError('Provided object does not correctly implement Symbol.observable');
        }
        else {
            return obs.subscribe(subscriber);
        }
    };
};
//# sourceMappingURL=subscribeToObservable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isArrayLike.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });
//# sourceMappingURL=isArrayLike.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isPromise.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isPromise(value) {
    return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}
//# sourceMappingURL=isPromise.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/subscribeTo.js
/** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */









var subscribeTo = function (result) {
    if (!!result && typeof result[observable_observable] === 'function') {
        return subscribeToObservable(result);
    }
    else if (isArrayLike(result)) {
        return subscribeToArray(result);
    }
    else if (isPromise(result)) {
        return subscribeToPromise(result);
    }
    else if (!!result && typeof result[iterator_iterator] === 'function') {
        return subscribeToIterable(result);
    }
    else {
        var value = isObject(result) ? 'an invalid object' : "'" + result + "'";
        var msg = "You provided " + value + " where a stream was expected."
            + ' You can provide an Observable, Promise, Array, or Iterable.';
        throw new TypeError(msg);
    }
};
//# sourceMappingURL=subscribeTo.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduled/scheduleObservable.js
/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */



function scheduleObservable(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        sub.add(scheduler.schedule(function () {
            var observable = input[observable_observable]();
            sub.add(observable.subscribe({
                next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
            }));
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleObservable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduled/schedulePromise.js
/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */


function schedulePromise(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        sub.add(scheduler.schedule(function () {
            return input.then(function (value) {
                sub.add(scheduler.schedule(function () {
                    subscriber.next(value);
                    sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
                }));
            }, function (err) {
                sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
            });
        }));
        return sub;
    });
}
//# sourceMappingURL=schedulePromise.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduled/scheduleIterable.js
/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */



function scheduleIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        var iterator;
        sub.add(function () {
            if (iterator && typeof iterator.return === 'function') {
                iterator.return();
            }
        });
        sub.add(scheduler.schedule(function () {
            iterator = input[iterator_iterator]();
            sub.add(scheduler.schedule(function () {
                if (subscriber.closed) {
                    return;
                }
                var value;
                var done;
                try {
                    var result = iterator.next();
                    value = result.value;
                    done = result.done;
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                    this.schedule();
                }
            }));
        }));
        return sub;
    });
}
//# sourceMappingURL=scheduleIterable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isInteropObservable.js
/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */

function isInteropObservable(input) {
    return input && typeof input[observable_observable] === 'function';
}
//# sourceMappingURL=isInteropObservable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isIterable.js
/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */

function isIterable(input) {
    return input && typeof input[iterator_iterator] === 'function';
}
//# sourceMappingURL=isIterable.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduled/scheduled.js
/** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */








function scheduled(input, scheduler) {
    if (input != null) {
        if (isInteropObservable(input)) {
            return scheduleObservable(input, scheduler);
        }
        else if (isPromise(input)) {
            return schedulePromise(input, scheduler);
        }
        else if (isArrayLike(input)) {
            return scheduleArray(input, scheduler);
        }
        else if (isIterable(input) || typeof input === 'string') {
            return scheduleIterable(input, scheduler);
        }
    }
    throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}
//# sourceMappingURL=scheduled.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/from.js
/** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */



function from_from(input, scheduler) {
    if (!scheduler) {
        if (input instanceof Observable) {
            return input;
        }
        return new Observable(subscribeTo(input));
    }
    else {
        return scheduled(input, scheduler);
    }
}
//# sourceMappingURL=from.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/OuterSubscriber.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


var OuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(OuterSubscriber, _super);
    function OuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    };
    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
        this.destination.error(error);
    };
    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
        this.destination.complete();
    };
    return OuterSubscriber;
}(Subscriber));

//# sourceMappingURL=OuterSubscriber.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/InnerSubscriber.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


var InnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(InnerSubscriber, _super);
    function InnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        _this.index = 0;
        return _this;
    }
    InnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
    };
    InnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error, this);
        this.unsubscribe();
    };
    InnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return InnerSubscriber;
}(Subscriber));

//# sourceMappingURL=InnerSubscriber.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/subscribeToResult.js
/** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo,_Observable PURE_IMPORTS_END */



function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
    if (innerSubscriber === void 0) {
        innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    }
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof Observable) {
        return result.subscribe(innerSubscriber);
    }
    return subscribeTo(result)(innerSubscriber);
}
//# sourceMappingURL=subscribeToResult.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/combineLatest.js
/** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */






var NONE = {};
function combineLatest_combineLatest() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var resultSelector = undefined;
    var scheduler = undefined;
    if (isScheduler(observables[observables.length - 1])) {
        scheduler = observables.pop();
    }
    if (typeof observables[observables.length - 1] === 'function') {
        resultSelector = observables.pop();
    }
    if (observables.length === 1 && isArray(observables[0])) {
        observables = observables[0];
    }
    return fromArray(observables, scheduler).lift(new CombineLatestOperator(resultSelector));
}
var CombineLatestOperator = /*@__PURE__*/ (function () {
    function CombineLatestOperator(resultSelector) {
        this.resultSelector = resultSelector;
    }
    CombineLatestOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
    };
    return CombineLatestOperator;
}());

var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(CombineLatestSubscriber, _super);
    function CombineLatestSubscriber(destination, resultSelector) {
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.active = 0;
        _this.values = [];
        _this.observables = [];
        return _this;
    }
    CombineLatestSubscriber.prototype._next = function (observable) {
        this.values.push(NONE);
        this.observables.push(observable);
    };
    CombineLatestSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            this.active = len;
            this.toRespond = len;
            for (var i = 0; i < len; i++) {
                var observable = observables[i];
                this.add(subscribeToResult(this, observable, undefined, i));
            }
        }
    };
    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
        if ((this.active -= 1) === 0) {
            this.destination.complete();
        }
    };
    CombineLatestSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        var values = this.values;
        var oldVal = values[outerIndex];
        var toRespond = !this.toRespond
            ? 0
            : oldVal === NONE ? --this.toRespond : this.toRespond;
        values[outerIndex] = innerValue;
        if (toRespond === 0) {
            if (this.resultSelector) {
                this._tryResultSelector(values);
            }
            else {
                this.destination.next(values.slice());
            }
        }
    };
    CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
        var result;
        try {
            result = this.resultSelector.apply(this, values);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return CombineLatestSubscriber;
}(OuterSubscriber));

//# sourceMappingURL=combineLatest.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/map.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function map_map(project, thisArg) {
    return function mapOperation(source) {
        if (typeof project !== 'function') {
            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
        }
        return source.lift(new MapOperator(project, thisArg));
    };
}
var MapOperator = /*@__PURE__*/ (function () {
    function MapOperator(project, thisArg) {
        this.project = project;
        this.thisArg = thisArg;
    }
    MapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator;
}());

var MapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MapSubscriber, _super);
    function MapSubscriber(destination, project, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.count = 0;
        _this.thisArg = thisArg || _this;
        return _this;
    }
    MapSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.project.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return MapSubscriber;
}(Subscriber));
//# sourceMappingURL=map.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/innerSubscribe.js
/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */




var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SimpleInnerSubscriber, _super);
    function SimpleInnerSubscriber(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    SimpleInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(value);
    };
    SimpleInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    SimpleInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete();
        this.unsubscribe();
    };
    return SimpleInnerSubscriber;
}(Subscriber));

var ComplexInnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ComplexInnerSubscriber, _super);
    function ComplexInnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        return _this;
    }
    ComplexInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this);
    };
    ComplexInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    ComplexInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return ComplexInnerSubscriber;
}(Subscriber));

var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SimpleOuterSubscriber, _super);
    function SimpleOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    SimpleOuterSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    SimpleOuterSubscriber.prototype.notifyComplete = function () {
        this.destination.complete();
    };
    return SimpleOuterSubscriber;
}(Subscriber));

var ComplexOuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ComplexOuterSubscriber, _super);
    function ComplexOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComplexOuterSubscriber.prototype.notifyNext = function (_outerValue, innerValue, _outerIndex, _innerSub) {
        this.destination.next(innerValue);
    };
    ComplexOuterSubscriber.prototype.notifyError = function (error) {
        this.destination.error(error);
    };
    ComplexOuterSubscriber.prototype.notifyComplete = function (_innerSub) {
        this.destination.complete();
    };
    return ComplexOuterSubscriber;
}(Subscriber));

function innerSubscribe(result, innerSubscriber) {
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof Observable) {
        return result.subscribe(innerSubscriber);
    }
    return subscribeTo(result)(innerSubscriber);
}
//# sourceMappingURL=innerSubscribe.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/mergeMap.js
/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */




function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    if (typeof resultSelector === 'function') {
        return function (source) { return source.pipe(mergeMap(function (a, i) { return from_from(project(a, i)).pipe(map_map(function (b, ii) { return resultSelector(a, b, i, ii); })); }, concurrent)); };
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return function (source) { return source.lift(new MergeMapOperator(project, concurrent)); };
}
var MergeMapOperator = /*@__PURE__*/ (function () {
    function MergeMapOperator(project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        this.project = project;
        this.concurrent = concurrent;
    }
    MergeMapOperator.prototype.call = function (observer, source) {
        return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
    };
    return MergeMapOperator;
}());

var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MergeMapSubscriber, _super);
    function MergeMapSubscriber(destination, project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.concurrent = concurrent;
        _this.hasCompleted = false;
        _this.buffer = [];
        _this.active = 0;
        _this.index = 0;
        return _this;
    }
    MergeMapSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            this._tryNext(value);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeMapSubscriber.prototype._tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.active++;
        this._innerSub(result);
    };
    MergeMapSubscriber.prototype._innerSub = function (ish) {
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = innerSubscribe(ish, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    MergeMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    MergeMapSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeMapSubscriber;
}(SimpleOuterSubscriber));

var flatMap = (/* unused pure expression or super */ null && (mergeMap));
//# sourceMappingURL=mergeMap.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/mergeAll.js
/** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */


function mergeAll(concurrent) {
    if (concurrent === void 0) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    return mergeMap(identity, concurrent);
}
//# sourceMappingURL=mergeAll.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/merge.js
/** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */




function merge() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    var concurrent = Number.POSITIVE_INFINITY;
    var scheduler = null;
    var last = observables[observables.length - 1];
    if (isScheduler(last)) {
        scheduler = observables.pop();
        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
            concurrent = observables.pop();
        }
    }
    else if (typeof last === 'number') {
        concurrent = observables.pop();
    }
    if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
        return observables[0];
    }
    return mergeAll(concurrent)(fromArray(observables, scheduler));
}
//# sourceMappingURL=merge.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/distinctUntilChanged.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function distinctUntilChanged(compare, keySelector) {
    return function (source) { return source.lift(new DistinctUntilChangedOperator(compare, keySelector)); };
}
var DistinctUntilChangedOperator = /*@__PURE__*/ (function () {
    function DistinctUntilChangedOperator(compare, keySelector) {
        this.compare = compare;
        this.keySelector = keySelector;
    }
    DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
    };
    return DistinctUntilChangedOperator;
}());
var DistinctUntilChangedSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DistinctUntilChangedSubscriber, _super);
    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.hasKey = false;
        if (typeof compare === 'function') {
            _this.compare = compare;
        }
        return _this;
    }
    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
        return x === y;
    };
    DistinctUntilChangedSubscriber.prototype._next = function (value) {
        var key;
        try {
            var keySelector = this.keySelector;
            key = keySelector ? keySelector(value) : value;
        }
        catch (err) {
            return this.destination.error(err);
        }
        var result = false;
        if (this.hasKey) {
            try {
                var compare = this.compare;
                result = compare(this.key, key);
            }
            catch (err) {
                return this.destination.error(err);
            }
        }
        else {
            this.hasKey = true;
        }
        if (!result) {
            this.key = key;
            this.destination.next(value);
        }
    };
    return DistinctUntilChangedSubscriber;
}(Subscriber));
//# sourceMappingURL=distinctUntilChanged.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/switchMap.js
/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */




function switchMap(project, resultSelector) {
    if (typeof resultSelector === 'function') {
        return function (source) { return source.pipe(switchMap(function (a, i) { return from_from(project(a, i)).pipe(map_map(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
    }
    return function (source) { return source.lift(new SwitchMapOperator(project)); };
}
var SwitchMapOperator = /*@__PURE__*/ (function () {
    function SwitchMapOperator(project) {
        this.project = project;
    }
    SwitchMapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
    };
    return SwitchMapOperator;
}());
var SwitchMapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SwitchMapSubscriber, _super);
    function SwitchMapSubscriber(destination, project) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.index = 0;
        return _this;
    }
    SwitchMapSubscriber.prototype._next = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (error) {
            this.destination.error(error);
            return;
        }
        this._innerSub(result);
    };
    SwitchMapSubscriber.prototype._innerSub = function (result) {
        var innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
        }
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        this.innerSubscription = innerSubscribe(result, innerSubscriber);
        if (this.innerSubscription !== innerSubscriber) {
            destination.add(this.innerSubscription);
        }
    };
    SwitchMapSubscriber.prototype._complete = function () {
        var innerSubscription = this.innerSubscription;
        if (!innerSubscription || innerSubscription.closed) {
            _super.prototype._complete.call(this);
        }
        this.unsubscribe();
    };
    SwitchMapSubscriber.prototype._unsubscribe = function () {
        this.innerSubscription = undefined;
    };
    SwitchMapSubscriber.prototype.notifyComplete = function () {
        this.innerSubscription = undefined;
        if (this.isStopped) {
            _super.prototype._complete.call(this);
        }
    };
    SwitchMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    return SwitchMapSubscriber;
}(SimpleOuterSubscriber));
//# sourceMappingURL=switchMap.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/filter.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function filter_filter(predicate, thisArg) {
    return function filterOperatorFunction(source) {
        return source.lift(new FilterOperator(predicate, thisArg));
    };
}
var FilterOperator = /*@__PURE__*/ (function () {
    function FilterOperator(predicate, thisArg) {
        this.predicate = predicate;
        this.thisArg = thisArg;
    }
    FilterOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
    };
    return FilterOperator;
}());
var FilterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, predicate, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.thisArg = thisArg;
        _this.count = 0;
        return _this;
    }
    FilterSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.predicate.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.destination.next(value);
        }
    };
    return FilterSubscriber;
}(Subscriber));
//# sourceMappingURL=filter.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ArgumentOutOfRangeErrorImpl = /*@__PURE__*/ (function () {
    function ArgumentOutOfRangeErrorImpl() {
        Error.call(this);
        this.message = 'argument out of range';
        this.name = 'ArgumentOutOfRangeError';
        return this;
    }
    ArgumentOutOfRangeErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ArgumentOutOfRangeErrorImpl;
})();
var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
//# sourceMappingURL=ArgumentOutOfRangeError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/take.js
/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */




function take(count) {
    return function (source) {
        if (count === 0) {
            return empty_empty();
        }
        else {
            return source.lift(new TakeOperator(count));
        }
    };
}
var TakeOperator = /*@__PURE__*/ (function () {
    function TakeOperator(total) {
        this.total = total;
        if (this.total < 0) {
            throw new ArgumentOutOfRangeError;
        }
    }
    TakeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TakeSubscriber(subscriber, this.total));
    };
    return TakeOperator;
}());
var TakeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TakeSubscriber, _super);
    function TakeSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.count = 0;
        return _this;
    }
    TakeSubscriber.prototype._next = function (value) {
        var total = this.total;
        var count = ++this.count;
        if (count <= total) {
            this.destination.next(value);
            if (count === total) {
                this.destination.complete();
                this.unsubscribe();
            }
        }
    };
    return TakeSubscriber;
}(Subscriber));
//# sourceMappingURL=take.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/scheduler/async.js
/** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */


var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
var async_async = asyncScheduler;
//# sourceMappingURL=async.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isDate.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isDate(value) {
    return value instanceof Date && !isNaN(+value);
}
//# sourceMappingURL=isDate.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/delay.js
/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_Subscriber,_Notification PURE_IMPORTS_END */





function delay(delay, scheduler) {
    if (scheduler === void 0) {
        scheduler = async_async;
    }
    var absoluteDelay = isDate(delay);
    var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);
    return function (source) { return source.lift(new DelayOperator(delayFor, scheduler)); };
}
var DelayOperator = /*@__PURE__*/ (function () {
    function DelayOperator(delay, scheduler) {
        this.delay = delay;
        this.scheduler = scheduler;
    }
    DelayOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
    };
    return DelayOperator;
}());
var DelaySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DelaySubscriber, _super);
    function DelaySubscriber(destination, delay, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.delay = delay;
        _this.scheduler = scheduler;
        _this.queue = [];
        _this.active = false;
        _this.errored = false;
        return _this;
    }
    DelaySubscriber.dispatch = function (state) {
        var source = state.source;
        var queue = source.queue;
        var scheduler = state.scheduler;
        var destination = state.destination;
        while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
            queue.shift().notification.observe(destination);
        }
        if (queue.length > 0) {
            var delay_1 = Math.max(0, queue[0].time - scheduler.now());
            this.schedule(state, delay_1);
        }
        else {
            this.unsubscribe();
            source.active = false;
        }
    };
    DelaySubscriber.prototype._schedule = function (scheduler) {
        this.active = true;
        var destination = this.destination;
        destination.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
            source: this, destination: this.destination, scheduler: scheduler
        }));
    };
    DelaySubscriber.prototype.scheduleNotification = function (notification) {
        if (this.errored === true) {
            return;
        }
        var scheduler = this.scheduler;
        var message = new DelayMessage(scheduler.now() + this.delay, notification);
        this.queue.push(message);
        if (this.active === false) {
            this._schedule(scheduler);
        }
    };
    DelaySubscriber.prototype._next = function (value) {
        this.scheduleNotification(Notification.createNext(value));
    };
    DelaySubscriber.prototype._error = function (err) {
        this.errored = true;
        this.queue = [];
        this.destination.error(err);
        this.unsubscribe();
    };
    DelaySubscriber.prototype._complete = function () {
        this.scheduleNotification(Notification.createComplete());
        this.unsubscribe();
    };
    return DelaySubscriber;
}(Subscriber));
var DelayMessage = /*@__PURE__*/ (function () {
    function DelayMessage(time, notification) {
        this.time = time;
        this.notification = notification;
    }
    return DelayMessage;
}());
//# sourceMappingURL=delay.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/debounceTime.js
/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */



function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) {
        scheduler = async_async;
    }
    return function (source) { return source.lift(new DebounceTimeOperator(dueTime, scheduler)); };
}
var DebounceTimeOperator = /*@__PURE__*/ (function () {
    function DebounceTimeOperator(dueTime, scheduler) {
        this.dueTime = dueTime;
        this.scheduler = scheduler;
    }
    DebounceTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
    };
    return DebounceTimeOperator;
}());
var DebounceTimeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DebounceTimeSubscriber, _super);
    function DebounceTimeSubscriber(destination, dueTime, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.dueTime = dueTime;
        _this.scheduler = scheduler;
        _this.debouncedSubscription = null;
        _this.lastValue = null;
        _this.hasValue = false;
        return _this;
    }
    DebounceTimeSubscriber.prototype._next = function (value) {
        this.clearDebounce();
        this.lastValue = value;
        this.hasValue = true;
        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
    };
    DebounceTimeSubscriber.prototype._complete = function () {
        this.debouncedNext();
        this.destination.complete();
    };
    DebounceTimeSubscriber.prototype.debouncedNext = function () {
        this.clearDebounce();
        if (this.hasValue) {
            var lastValue = this.lastValue;
            this.lastValue = null;
            this.hasValue = false;
            this.destination.next(lastValue);
        }
    };
    DebounceTimeSubscriber.prototype.clearDebounce = function () {
        var debouncedSubscription = this.debouncedSubscription;
        if (debouncedSubscription !== null) {
            this.remove(debouncedSubscription);
            debouncedSubscription.unsubscribe();
            this.debouncedSubscription = null;
        }
    };
    return DebounceTimeSubscriber;
}(Subscriber));
function dispatchNext(subscriber) {
    subscriber.debouncedNext();
}
//# sourceMappingURL=debounceTime.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/pairwise.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function pairwise() {
    return function (source) { return source.lift(new PairwiseOperator()); };
}
var PairwiseOperator = /*@__PURE__*/ (function () {
    function PairwiseOperator() {
    }
    PairwiseOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new PairwiseSubscriber(subscriber));
    };
    return PairwiseOperator;
}());
var PairwiseSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(PairwiseSubscriber, _super);
    function PairwiseSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasPrev = false;
        return _this;
    }
    PairwiseSubscriber.prototype._next = function (value) {
        var pair;
        if (this.hasPrev) {
            pair = [this.prev, value];
        }
        else {
            this.hasPrev = true;
        }
        this.prev = value;
        if (pair) {
            this.destination.next(pair);
        }
    };
    return PairwiseSubscriber;
}(Subscriber));
//# sourceMappingURL=pairwise.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/skip.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function skip_skip(count) {
    return function (source) { return source.lift(new SkipOperator(count)); };
}
var SkipOperator = /*@__PURE__*/ (function () {
    function SkipOperator(total) {
        this.total = total;
    }
    SkipOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SkipSubscriber(subscriber, this.total));
    };
    return SkipOperator;
}());
var SkipSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SkipSubscriber, _super);
    function SkipSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.count = 0;
        return _this;
    }
    SkipSubscriber.prototype._next = function (x) {
        if (++this.count > this.total) {
            this.destination.next(x);
        }
    };
    return SkipSubscriber;
}(Subscriber));
//# sourceMappingURL=skip.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/audit.js
/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


function audit(durationSelector) {
    return function auditOperatorFunction(source) {
        return source.lift(new AuditOperator(durationSelector));
    };
}
var AuditOperator = /*@__PURE__*/ (function () {
    function AuditOperator(durationSelector) {
        this.durationSelector = durationSelector;
    }
    AuditOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new AuditSubscriber(subscriber, this.durationSelector));
    };
    return AuditOperator;
}());
var AuditSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(AuditSubscriber, _super);
    function AuditSubscriber(destination, durationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.durationSelector = durationSelector;
        _this.hasValue = false;
        return _this;
    }
    AuditSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            var duration = void 0;
            try {
                var durationSelector = this.durationSelector;
                duration = durationSelector(value);
            }
            catch (err) {
                return this.destination.error(err);
            }
            var innerSubscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
            if (!innerSubscription || innerSubscription.closed) {
                this.clearThrottle();
            }
            else {
                this.add(this.throttled = innerSubscription);
            }
        }
    };
    AuditSubscriber.prototype.clearThrottle = function () {
        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
        if (throttled) {
            this.remove(throttled);
            this.throttled = undefined;
            throttled.unsubscribe();
        }
        if (hasValue) {
            this.value = undefined;
            this.hasValue = false;
            this.destination.next(value);
        }
    };
    AuditSubscriber.prototype.notifyNext = function () {
        this.clearThrottle();
    };
    AuditSubscriber.prototype.notifyComplete = function () {
        this.clearThrottle();
    };
    return AuditSubscriber;
}(SimpleOuterSubscriber));
//# sourceMappingURL=audit.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/isNumeric.js
/** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */

function isNumeric(val) {
    return !isArray(val) && (val - parseFloat(val) + 1) >= 0;
}
//# sourceMappingURL=isNumeric.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/observable/timer.js
/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */




function timer(dueTime, periodOrScheduler, scheduler) {
    if (dueTime === void 0) {
        dueTime = 0;
    }
    var period = -1;
    if (isNumeric(periodOrScheduler)) {
        period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
    }
    else if (isScheduler(periodOrScheduler)) {
        scheduler = periodOrScheduler;
    }
    if (!isScheduler(scheduler)) {
        scheduler = async_async;
    }
    return new Observable(function (subscriber) {
        var due = isNumeric(dueTime)
            ? dueTime
            : (+dueTime - scheduler.now());
        return scheduler.schedule(timer_dispatch, due, {
            index: 0, period: period, subscriber: subscriber
        });
    });
}
function timer_dispatch(state) {
    var index = state.index, period = state.period, subscriber = state.subscriber;
    subscriber.next(index);
    if (subscriber.closed) {
        return;
    }
    else if (period === -1) {
        return subscriber.complete();
    }
    state.index = index + 1;
    this.schedule(state, period);
}
//# sourceMappingURL=timer.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/auditTime.js
/** PURE_IMPORTS_START _scheduler_async,_audit,_observable_timer PURE_IMPORTS_END */



function auditTime_auditTime(duration, scheduler) {
    if (scheduler === void 0) {
        scheduler = async_async;
    }
    return audit(function () { return timer(duration, scheduler); });
}
//# sourceMappingURL=auditTime.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/EmptyError.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var EmptyErrorImpl = /*@__PURE__*/ (function () {
    function EmptyErrorImpl() {
        Error.call(this);
        this.message = 'no elements in sequence';
        this.name = 'EmptyError';
        return this;
    }
    EmptyErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return EmptyErrorImpl;
})();
var EmptyError = EmptyErrorImpl;
//# sourceMappingURL=EmptyError.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js
/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */


function defaultIfEmpty(defaultValue) {
    if (defaultValue === void 0) {
        defaultValue = null;
    }
    return function (source) { return source.lift(new DefaultIfEmptyOperator(defaultValue)); };
}
var DefaultIfEmptyOperator = /*@__PURE__*/ (function () {
    function DefaultIfEmptyOperator(defaultValue) {
        this.defaultValue = defaultValue;
    }
    DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
    };
    return DefaultIfEmptyOperator;
}());
var DefaultIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DefaultIfEmptySubscriber, _super);
    function DefaultIfEmptySubscriber(destination, defaultValue) {
        var _this = _super.call(this, destination) || this;
        _this.defaultValue = defaultValue;
        _this.isEmpty = true;
        return _this;
    }
    DefaultIfEmptySubscriber.prototype._next = function (value) {
        this.isEmpty = false;
        this.destination.next(value);
    };
    DefaultIfEmptySubscriber.prototype._complete = function () {
        if (this.isEmpty) {
            this.destination.next(this.defaultValue);
        }
        this.destination.complete();
    };
    return DefaultIfEmptySubscriber;
}(Subscriber));
//# sourceMappingURL=defaultIfEmpty.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js
/** PURE_IMPORTS_START tslib,_util_EmptyError,_Subscriber PURE_IMPORTS_END */



function throwIfEmpty(errorFactory) {
    if (errorFactory === void 0) {
        errorFactory = defaultErrorFactory;
    }
    return function (source) {
        return source.lift(new ThrowIfEmptyOperator(errorFactory));
    };
}
var ThrowIfEmptyOperator = /*@__PURE__*/ (function () {
    function ThrowIfEmptyOperator(errorFactory) {
        this.errorFactory = errorFactory;
    }
    ThrowIfEmptyOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ThrowIfEmptySubscriber(subscriber, this.errorFactory));
    };
    return ThrowIfEmptyOperator;
}());
var ThrowIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ThrowIfEmptySubscriber, _super);
    function ThrowIfEmptySubscriber(destination, errorFactory) {
        var _this = _super.call(this, destination) || this;
        _this.errorFactory = errorFactory;
        _this.hasValue = false;
        return _this;
    }
    ThrowIfEmptySubscriber.prototype._next = function (value) {
        this.hasValue = true;
        this.destination.next(value);
    };
    ThrowIfEmptySubscriber.prototype._complete = function () {
        if (!this.hasValue) {
            var err = void 0;
            try {
                err = this.errorFactory();
            }
            catch (e) {
                err = e;
            }
            this.destination.error(err);
        }
        else {
            return this.destination.complete();
        }
    };
    return ThrowIfEmptySubscriber;
}(Subscriber));
function defaultErrorFactory() {
    return new EmptyError();
}
//# sourceMappingURL=throwIfEmpty.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/first.js
/** PURE_IMPORTS_START _util_EmptyError,_filter,_take,_defaultIfEmpty,_throwIfEmpty,_util_identity PURE_IMPORTS_END */






function first(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) { return source.pipe(predicate ? filter_filter(function (v, i) { return predicate(v, i, source); }) : identity, take(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function () { return new EmptyError(); })); };
}
//# sourceMappingURL=first.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/util/noop.js
/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function noop() { }
//# sourceMappingURL=noop.js.map

;// CONCATENATED MODULE: ./node_modules/rxjs/_esm5/internal/operators/tap.js
/** PURE_IMPORTS_START tslib,_Subscriber,_util_noop,_util_isFunction PURE_IMPORTS_END */




function tap_tap(nextOrObserver, error, complete) {
    return function tapOperatorFunction(source) {
        return source.lift(new DoOperator(nextOrObserver, error, complete));
    };
}
var DoOperator = /*@__PURE__*/ (function () {
    function DoOperator(nextOrObserver, error, complete) {
        this.nextOrObserver = nextOrObserver;
        this.error = error;
        this.complete = complete;
    }
    DoOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
    };
    return DoOperator;
}());
var TapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TapSubscriber, _super);
    function TapSubscriber(destination, observerOrNext, error, complete) {
        var _this = _super.call(this, destination) || this;
        _this._tapNext = noop;
        _this._tapError = noop;
        _this._tapComplete = noop;
        _this._tapError = error || noop;
        _this._tapComplete = complete || noop;
        if (isFunction(observerOrNext)) {
            _this._context = _this;
            _this._tapNext = observerOrNext;
        }
        else if (observerOrNext) {
            _this._context = observerOrNext;
            _this._tapNext = observerOrNext.next || noop;
            _this._tapError = observerOrNext.error || noop;
            _this._tapComplete = observerOrNext.complete || noop;
        }
        return _this;
    }
    TapSubscriber.prototype._next = function (value) {
        try {
            this._tapNext.call(this._context, value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(value);
    };
    TapSubscriber.prototype._error = function (err) {
        try {
            this._tapError.call(this._context, err);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.error(err);
    };
    TapSubscriber.prototype._complete = function () {
        try {
            this._tapComplete.call(this._context);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        return this.destination.complete();
    };
    return TapSubscriber;
}(Subscriber));
//# sourceMappingURL=tap.js.map

;// CONCATENATED MODULE: ./node_modules/@datorama/akita/fesm5/datorama-akita.js




var currentAction = {
    type: null,
    entityIds: null,
    skip: false,
};
var customActionActive = false;
function resetCustomAction() {
    customActionActive = false;
}
// public API for custom actions. Custom action always wins
function logAction(type, entityIds) {
    setAction(type, entityIds);
    customActionActive = true;
}
function setAction(type, entityIds) {
    if (customActionActive === false) {
        currentAction.type = type;
        currentAction.entityIds = entityIds;
    }
}
function setSkipAction(skip) {
    if (skip === void 0) { skip = true; }
    currentAction.skip = skip;
}
function action(action, entityIds) {
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            logAction(action, entityIds);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}

// @internal
function hasEntity(entities, id) {
    return entities.hasOwnProperty(id);
}

// @internal
function addEntities(_a) {
    var state = _a.state, entities = _a.entities, idKey = _a.idKey, _b = _a.options, options = _b === void 0 ? {} : _b, preAddEntity = _a.preAddEntity;
    var e_1, _c;
    var newEntities = {};
    var newIds = [];
    var hasNewEntities = false;
    try {
        for (var entities_1 = tslib_es6_values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
            var entity = entities_1_1.value;
            if (hasEntity(state.entities, entity[idKey]) === false) {
                // evaluate the middleware first to support dynamic ids
                var current = preAddEntity(entity);
                var entityId = current[idKey];
                newEntities[entityId] = current;
                if (options.prepend)
                    newIds.unshift(entityId);
                else
                    newIds.push(entityId);
                hasNewEntities = true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (entities_1_1 && !entities_1_1.done && (_c = entities_1.return)) _c.call(entities_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return hasNewEntities
        ? {
            newState: tslib_es6_assign({}, state, { entities: tslib_es6_assign({}, state.entities, newEntities), ids: options.prepend ? tslib_es6_spread(newIds, state.ids) : tslib_es6_spread(state.ids, newIds) }),
            newIds: newIds
        }
        : null;
}

// @internal
function isNil(v) {
    return v === null || v === undefined;
}

// @internal
function coerceArray(value) {
    if (isNil(value)) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

var DEFAULT_ID_KEY = 'id';

var EntityActions;
(function (EntityActions) {
    EntityActions["Set"] = "Set";
    EntityActions["Add"] = "Add";
    EntityActions["Update"] = "Update";
    EntityActions["Remove"] = "Remove";
})(EntityActions || (EntityActions = {}));

var isBrowser = typeof window !== 'undefined';
var isNotBrowser = !isBrowser;
// export const isNativeScript = typeof global !== 'undefined' && (<any>global).__runtimeVersion !== 'undefined'; TODO is this used?
var hasLocalStorage = function () {
    try {
        return typeof localStorage !== 'undefined';
    }
    catch (_a) {
        return false;
    }
};
var hasSessionStorage = function () {
    try {
        return typeof sessionStorage !== 'undefined';
    }
    catch (_a) {
        return false;
    }
};

var __DEV__ = true;
function enableAkitaProdMode() {
    __DEV__ = false;
    if (isBrowser) {
        delete window.$$stores;
        delete window.$$queries;
    }
}
// @internal
function isDev() {
    return __DEV__;
}

// @internal
function datorama_akita_isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
}

// @internal
function datorama_akita_isArray(value) {
    return Array.isArray(value);
}

// @internal
function getActiveEntities(idOrOptions, ids, currentActive) {
    var result;
    if (datorama_akita_isArray(idOrOptions)) {
        result = idOrOptions;
    }
    else {
        if (datorama_akita_isObject(idOrOptions)) {
            if (isNil(currentActive))
                return;
            idOrOptions = Object.assign({ wrap: true }, idOrOptions);
            var currentIdIndex = ids.indexOf(currentActive);
            if (idOrOptions.prev) {
                var isFirst = currentIdIndex === 0;
                if (isFirst && !idOrOptions.wrap)
                    return;
                result = isFirst ? ids[ids.length - 1] : ids[currentIdIndex - 1];
            }
            else if (idOrOptions.next) {
                var isLast = ids.length === currentIdIndex + 1;
                if (isLast && !idOrOptions.wrap)
                    return;
                result = isLast ? ids[0] : ids[currentIdIndex + 1];
            }
        }
        else {
            if (idOrOptions === currentActive)
                return;
            result = idOrOptions;
        }
    }
    return result;
}

// @internal
var getInitialEntitiesState = function () {
    return ({
        entities: {},
        ids: [],
        loading: true,
        error: null
    });
};

// @internal
function isDefined(val) {
    return isNil(val) === false;
}

// @internal
function isEmpty(arr) {
    if (datorama_akita_isArray(arr)) {
        return arr.length === 0;
    }
    return false;
}

// @internal
function datorama_akita_isFunction(value) {
    return typeof value === 'function';
}

// @internal
function isUndefined(value) {
    return value === undefined;
}

// @internal
function hasActiveState(state) {
    return state.hasOwnProperty('active');
}
// @internal
function isMultiActiveState(active) {
    return datorama_akita_isArray(active);
}
// @internal
function resolveActiveEntity(_a) {
    var active = _a.active, ids = _a.ids, entities = _a.entities;
    if (isMultiActiveState(active)) {
        return getExitingActives(active, ids);
    }
    if (hasEntity(entities, active) === false) {
        return null;
    }
    return active;
}
// @internal
function getExitingActives(currentActivesIds, newIds) {
    var filtered = currentActivesIds.filter(function (id) { return newIds.indexOf(id) > -1; });
    /** Return the same reference if nothing has changed */
    if (filtered.length === currentActivesIds.length) {
        return currentActivesIds;
    }
    return filtered;
}

// @internal
function removeEntities(_a) {
    var state = _a.state, ids = _a.ids;
    var e_1, _b;
    if (isNil(ids))
        return removeAllEntities(state);
    var entities = state.entities;
    var newEntities = {};
    try {
        for (var _c = tslib_es6_values(state.ids), _d = _c.next(); !_d.done; _d = _c.next()) {
            var id = _d.value;
            if (ids.includes(id) === false) {
                newEntities[id] = entities[id];
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var newState = tslib_es6_assign({}, state, { entities: newEntities, ids: state.ids.filter(function (current) { return ids.includes(current) === false; }) });
    if (hasActiveState(state)) {
        newState.active = resolveActiveEntity(newState);
    }
    return newState;
}
// @internal
function removeAllEntities(state) {
    return tslib_es6_assign({}, state, { entities: {}, ids: [], active: isMultiActiveState(state.active) ? [] : null });
}

// @internal
function toEntitiesObject(entities, idKey, preAddEntity) {
    var e_1, _a;
    var acc = {
        entities: {},
        ids: []
    };
    try {
        for (var entities_1 = tslib_es6_values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
            var entity = entities_1_1.value;
            // evaluate the middleware first to support dynamic ids
            var current = preAddEntity(entity);
            acc.entities[current[idKey]] = current;
            acc.ids.push(current[idKey]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return acc;
}

// @internal
function isEntityState(state) {
    return state.entities && state.ids;
}
// @internal
function applyMiddleware(entities, preAddEntity) {
    var e_1, _a;
    var mapped = {};
    try {
        for (var _b = tslib_es6_values(Object.keys(entities)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var id = _c.value;
            mapped[id] = preAddEntity(entities[id]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return mapped;
}
// @internal
function setEntities(_a) {
    var state = _a.state, entities = _a.entities, idKey = _a.idKey, preAddEntity = _a.preAddEntity, isNativePreAdd = _a.isNativePreAdd;
    var newEntities;
    var newIds;
    if (datorama_akita_isArray(entities)) {
        var resolve = toEntitiesObject(entities, idKey, preAddEntity);
        newEntities = resolve.entities;
        newIds = resolve.ids;
    }
    else if (isEntityState(entities)) {
        newEntities = isNativePreAdd ? entities.entities : applyMiddleware(entities.entities, preAddEntity);
        newIds = entities.ids;
    }
    else {
        // it's an object
        newEntities = isNativePreAdd ? entities : applyMiddleware(entities, preAddEntity);
        newIds = Object.keys(newEntities).map(function (id) { return (isNaN(id) ? id : Number(id)); });
    }
    var newState = tslib_es6_assign({}, state, { entities: newEntities, ids: newIds, loading: false });
    if (hasActiveState(state)) {
        newState.active = resolveActiveEntity(newState);
    }
    return newState;
}

var CONFIG = {
    resettable: false,
    ttl: null,
    producerFn: undefined
};
function akitaConfig(config) {
    CONFIG = __assign({}, CONFIG, config);
}
// @internal
function getAkitaConfig() {
    return CONFIG;
}
function getGlobalProducerFn() {
    return CONFIG.producerFn;
}

// @internal
function deepFreeze(o) {
    Object.freeze(o);
    var oIsFunction = typeof o === 'function';
    var hasOwnProp = Object.prototype.hasOwnProperty;
    Object.getOwnPropertyNames(o).forEach(function (prop) {
        if (hasOwnProp.call(o, prop) &&
            (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true) &&
            o[prop] !== null &&
            (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
            !Object.isFrozen(o[prop])) {
            deepFreeze(o[prop]);
        }
    });
    return o;
}

// @internal
var $$deleteStore = new Subject();
// @internal
var $$addStore = new ReplaySubject(50, 5000);
// @internal
var $$updateStore = new Subject();
// @internal
function dispatchDeleted(storeName) {
    $$deleteStore.next(storeName);
}
// @internal
function dispatchAdded(storeName) {
    $$addStore.next(storeName);
}
// @internal
function dispatchUpdate(storeName, action) {
    $$updateStore.next({ storeName: storeName, action: action });
}

// @internal
var AkitaError = /** @class */ (function (_super) {
    __extends(AkitaError, _super);
    function AkitaError(message) {
        return _super.call(this, message) || this;
    }
    return AkitaError;
}(Error));
// @internal
function assertStoreHasName(name, className) {
    if (!name) {
        console.error("@StoreConfig({ name }) is missing in " + className);
    }
}

// @internal
function toBoolean(value) {
    return value != null && "" + value !== 'false';
}

// @internal
function isPlainObject(value) {
    return toBoolean(value) && value.constructor.name === 'Object';
}

var configKey = 'akitaConfig';
function StoreConfig(metadata) {
    return function (constructor) {
        constructor[configKey] = { idKey: 'id' };
        for (var i = 0, keys = Object.keys(metadata); i < keys.length; i++) {
            var key = keys[i];
            /* name is preserved read only key */
            if (key === 'name') {
                constructor[configKey]['storeName'] = metadata[key];
            }
            else {
                constructor[configKey][key] = metadata[key];
            }
        }
    };
}

// @internal
var __stores__ = {};
// @internal
var __queries__ = {};
if (isBrowser) {
    window.$$stores = __stores__;
    window.$$queries = __queries__;
}

// @internal
var transactionFinished = new Subject();
// @internal
var transactionInProcess = new BehaviorSubject(false);
// @internal
var transactionManager = {
    activeTransactions: 0,
    batchTransaction: null
};
// @internal
function startBatch() {
    if (!isTransactionInProcess()) {
        transactionManager.batchTransaction = new Subject();
    }
    transactionManager.activeTransactions++;
    transactionInProcess.next(true);
}
// @internal
function endBatch() {
    if (--transactionManager.activeTransactions === 0) {
        transactionManager.batchTransaction.next(true);
        transactionManager.batchTransaction.complete();
        transactionInProcess.next(false);
        transactionFinished.next(true);
    }
}
// @internal
function isTransactionInProcess() {
    return transactionManager.activeTransactions > 0;
}
// @internal
function commit() {
    return transactionManager.batchTransaction ? transactionManager.batchTransaction.asObservable() : of_of(true);
}
/**
 *  A logical transaction.
 *  Use this transaction to optimize the dispatch of all the stores.
 *  The following code will update the store, BUT  emits only once
 *
 *  @example
 *  applyTransaction(() => {
 *    this.todosStore.add(new Todo(1, title));
 *    this.todosStore.add(new Todo(2, title));
 *  });
 *
 */
function applyTransaction(action, thisArg) {
    if (thisArg === void 0) { thisArg = undefined; }
    startBatch();
    try {
        return action.apply(thisArg);
    }
    finally {
        logAction('@Transaction');
        endBatch();
    }
}
/**
 *  A logical transaction.
 *  Use this transaction to optimize the dispatch of all the stores.
 *
 *  The following code will update the store, BUT  emits only once.
 *
 *  @example
 *  @transaction
 *  addTodos() {
 *    this.todosStore.add(new Todo(1, title));
 *    this.todosStore.add(new Todo(2, title));
 *  }
 *
 *
 */
function transaction() {
    return function (target, propertyKey, descriptor) {
        var originalMethod = descriptor.value;
        descriptor.value = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return applyTransaction(function () {
                return originalMethod.apply(_this, args);
            }, this);
        };
        return descriptor;
    };
}
/**
 *
 * RxJS custom operator that wraps the callback inside transaction
 *
 * @example
 *
 * return http.get().pipe(
 *    withTransaction(response > {
 *      store.setActive(1);
 *      store.update();
 *      store.updateEntity(1, {});
 *    })
 * )
 *
 */
function withTransaction(next) {
    return function (source) {
        return source.pipe(tap(function (value) { return applyTransaction(function () { return next(value); }); }));
    };
}

/**
 *
 * Store for managing any type of data
 *
 * @example
 *
 * export interface SessionState {
 *   token: string;
 *   userDetails: UserDetails
 * }
 *
 * export function createInitialState(): SessionState {
 *  return {
 *    token: '',
 *    userDetails: null
 *  };
 * }
 *
 * @StoreConfig({ name: 'session' })
 * export class SessionStore extends Store<SessionState> {
 *   constructor() {
 *    super(createInitialState());
 *   }
 * }
 */
var Store = /** @class */ (function () {
    function Store(initialState, options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.inTransaction = false;
        this.cache = {
            active: new BehaviorSubject(false),
            ttl: null,
        };
        this.onInit(initialState);
    }
    /**
     *  Set the loading state
     *
     *  @example
     *
     *  store.setLoading(true)
     *
     */
    Store.prototype.setLoading = function (loading) {
        if (loading === void 0) { loading = false; }
        if (loading !== this._value().loading) {
            isDev() && setAction('Set Loading');
            this._setState(function (state) { return (tslib_es6_assign({}, state, { loading: loading })); });
        }
    };
    /**
     *
     * Set whether the data is cached
     *
     * @example
     *
     * store.setHasCache(true)
     * store.setHasCache(false)
     * store.setHasCache(true, { restartTTL: true })
     *
     */
    Store.prototype.setHasCache = function (hasCache, options) {
        var _this = this;
        if (options === void 0) { options = { restartTTL: false }; }
        if (hasCache !== this.cache.active.value) {
            this.cache.active.next(hasCache);
        }
        if (options.restartTTL) {
            var ttlConfig = this.getCacheTTL();
            if (ttlConfig) {
                if (this.cache.ttl !== null) {
                    clearTimeout(this.cache.ttl);
                }
                this.cache.ttl = setTimeout(function () { return _this.setHasCache(false); }, ttlConfig);
            }
        }
    };
    /**
     *
     * Sometimes we need to access the store value from a store
     *
     * @example middleware
     *
     */
    Store.prototype.getValue = function () {
        return this.storeValue;
    };
    /**
     *  Set the error state
     *
     *  @example
     *
     *  store.setError({text: 'unable to load data' })
     *
     */
    Store.prototype.setError = function (error) {
        if (error !== this._value().error) {
            isDev() && setAction('Set Error');
            this._setState(function (state) { return (tslib_es6_assign({}, state, { error: error })); });
        }
    };
    // @internal
    Store.prototype._select = function (project) {
        return this.store.asObservable().pipe(map_map(function (snapshot) { return project(snapshot.state); }), distinctUntilChanged());
    };
    // @internal
    Store.prototype._value = function () {
        return this.storeValue;
    };
    // @internal
    Store.prototype._cache = function () {
        return this.cache.active;
    };
    Object.defineProperty(Store.prototype, "config", {
        // @internal
        get: function () {
            return this.constructor[configKey] || {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "storeName", {
        // @internal
        get: function () {
            return this.config.storeName || this.options.storeName || this.options.name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "deepFreeze", {
        // @internal
        get: function () {
            return this.config.deepFreezeFn || this.options.deepFreezeFn || deepFreeze;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "cacheConfig", {
        // @internal
        get: function () {
            return this.config.cache || this.options.cache;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "_producerFn", {
        get: function () {
            return this.config.producerFn || this.options.producerFn || getGlobalProducerFn();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "resettable", {
        // @internal
        get: function () {
            return isDefined(this.config.resettable) ? this.config.resettable : this.options.resettable;
        },
        enumerable: true,
        configurable: true
    });
    // @internal
    Store.prototype._setState = function (newState, _dispatchAction) {
        var _this = this;
        if (_dispatchAction === void 0) { _dispatchAction = true; }
        if (datorama_akita_isFunction(newState)) {
            var _newState = newState(this._value());
            this.storeValue = __DEV__ ? this.deepFreeze(_newState) : _newState;
        }
        else {
            this.storeValue = newState;
        }
        if (!this.store) {
            this.store = new BehaviorSubject({ state: this.storeValue });
            if (isDev()) {
                this.store.subscribe(function (_a) {
                    var action = _a.action;
                    if (action) {
                        dispatchUpdate(_this.storeName, action);
                    }
                });
            }
            return;
        }
        if (isTransactionInProcess()) {
            this.handleTransaction();
            return;
        }
        this.dispatch(this.storeValue, _dispatchAction);
    };
    /**
     *
     * Reset the current store back to the initial value
     *
     * @example
     *
     * store.reset()
     *
     */
    Store.prototype.reset = function () {
        var _this = this;
        if (this.isResettable()) {
            isDev() && setAction('Reset');
            this._setState(function () { return Object.assign({}, _this._initialState); });
            this.setHasCache(false);
        }
        else {
            isDev() && console.warn("You need to enable the reset functionality");
        }
    };
    Store.prototype.update = function (stateOrCallback) {
        isDev() && setAction('Update');
        var newState;
        var currentState = this._value();
        if (datorama_akita_isFunction(stateOrCallback)) {
            newState = datorama_akita_isFunction(this._producerFn) ? this._producerFn(currentState, stateOrCallback) : stateOrCallback(currentState);
        }
        else {
            newState = stateOrCallback;
        }
        var withHook = this.akitaPreUpdate(currentState, tslib_es6_assign({}, currentState, newState));
        var resolved = isPlainObject(currentState) ? withHook : new currentState.constructor(withHook);
        this._setState(resolved);
    };
    Store.prototype.updateStoreConfig = function (newOptions) {
        this.options = tslib_es6_assign({}, this.options, newOptions);
    };
    // @internal
    Store.prototype.akitaPreUpdate = function (_, nextState) {
        return nextState;
    };
    Store.prototype.ngOnDestroy = function () {
        this.destroy();
    };
    /**
     *
     * Destroy the store
     *
     * @example
     *
     * store.destroy()
     *
     */
    Store.prototype.destroy = function () {
        var hmrEnabled = isBrowser ? window.hmrEnabled : false;
        if (!hmrEnabled && this === __stores__[this.storeName]) {
            delete __stores__[this.storeName];
            dispatchDeleted(this.storeName);
            this.setHasCache(false);
            this.cache.active.complete();
            this.store.complete();
        }
    };
    Store.prototype.onInit = function (initialState) {
        __stores__[this.storeName] = this;
        this._setState(function () { return initialState; });
        dispatchAdded(this.storeName);
        if (this.isResettable()) {
            this._initialState = initialState;
        }
        isDev() && assertStoreHasName(this.storeName, this.constructor.name);
    };
    Store.prototype.dispatch = function (state, _dispatchAction) {
        if (_dispatchAction === void 0) { _dispatchAction = true; }
        var action = undefined;
        if (_dispatchAction) {
            action = currentAction;
            resetCustomAction();
        }
        this.store.next({ state: state, action: action });
    };
    Store.prototype.watchTransaction = function () {
        var _this = this;
        commit().subscribe(function () {
            _this.inTransaction = false;
            _this.dispatch(_this._value());
        });
    };
    Store.prototype.isResettable = function () {
        if (this.resettable === false) {
            return false;
        }
        return this.resettable || getAkitaConfig().resettable;
    };
    Store.prototype.handleTransaction = function () {
        if (!this.inTransaction) {
            this.watchTransaction();
            this.inTransaction = true;
        }
    };
    Store.prototype.getCacheTTL = function () {
        return (this.cacheConfig && this.cacheConfig.ttl) || getAkitaConfig().ttl;
    };
    return Store;
}());

// @internal
function updateEntities(_a) {
    var state = _a.state, ids = _a.ids, idKey = _a.idKey, newStateOrFn = _a.newStateOrFn, preUpdateEntity = _a.preUpdateEntity, producerFn = _a.producerFn, onEntityIdChanges = _a.onEntityIdChanges;
    var e_1, _b;
    var updatedEntities = {};
    var isUpdatingIdKey = false;
    var idToUpdate;
    try {
        for (var ids_1 = tslib_es6_values(ids), ids_1_1 = ids_1.next(); !ids_1_1.done; ids_1_1 = ids_1.next()) {
            var id = ids_1_1.value;
            // if the entity doesn't exist don't do anything
            if (hasEntity(state.entities, id) === false) {
                continue;
            }
            var oldEntity = state.entities[id];
            var newState = void 0;
            if (datorama_akita_isFunction(newStateOrFn)) {
                newState = datorama_akita_isFunction(producerFn) ? producerFn(oldEntity, newStateOrFn) : newStateOrFn(oldEntity);
            }
            else {
                newState = newStateOrFn;
            }
            var isIdChanged = newState.hasOwnProperty(idKey) && newState[idKey] !== oldEntity[idKey];
            var newEntity = void 0;
            idToUpdate = id;
            if (isIdChanged) {
                isUpdatingIdKey = true;
                idToUpdate = newState[idKey];
            }
            var merged = tslib_es6_assign({}, oldEntity, newState);
            if (isPlainObject(oldEntity)) {
                newEntity = merged;
            }
            else {
                /**
                 * In case that new state is class of it's own, there's
                 * a possibility that it will be different than the old
                 * class.
                 * For example, Old state is an instance of animal class
                 * and new state is instance of person class.
                 * To avoid run over new person class with the old animal
                 * class we check if the new state is a class of it's own.
                 * If so, use it. Otherwise, use the old state class
                 */
                if (isPlainObject(newState)) {
                    newEntity = new oldEntity.constructor(merged);
                }
                else {
                    newEntity = new newState.constructor(merged);
                }
            }
            updatedEntities[idToUpdate] = preUpdateEntity(oldEntity, newEntity);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (ids_1_1 && !ids_1_1.done && (_b = ids_1.return)) _b.call(ids_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var updatedIds = state.ids;
    var stateEntities = state.entities;
    if (isUpdatingIdKey) {
        var _c = __read(ids, 1), id_1 = _c[0];
        var _d = state.entities, _e = id_1, deletedEntity = _d[_e], rest = __rest(_d, [typeof _e === "symbol" ? _e : _e + ""]);
        stateEntities = rest;
        updatedIds = state.ids.map(function (current) { return (current === id_1 ? idToUpdate : current); });
        onEntityIdChanges(id_1, idToUpdate);
    }
    return tslib_es6_assign({}, state, { entities: tslib_es6_assign({}, stateEntities, updatedEntities), ids: updatedIds });
}

/**
 *
 * Store for managing a collection of entities
 *
 * @example
 *
 * export interface WidgetsState extends EntityState<Widget> { }
 *
 * @StoreConfig({ name: 'widgets' })
 *  export class WidgetsStore extends EntityStore<WidgetsState> {
 *   constructor() {
 *     super();
 *   }
 * }
 *
 *
 */
var EntityStore = /** @class */ (function (_super) {
    __extends(EntityStore, _super);
    function EntityStore(initialState, options) {
        if (initialState === void 0) { initialState = {}; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, tslib_es6_assign({}, getInitialEntitiesState(), initialState), options) || this;
        _this.options = options;
        _this.entityActions = new Subject();
        _this.entityIdChanges = new Subject();
        return _this;
    }
    Object.defineProperty(EntityStore.prototype, "selectEntityAction$", {
        // @internal
        get: function () {
            return this.entityActions.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityStore.prototype, "selectEntityIdChanges$", {
        // @internal
        get: function () {
            return this.entityIdChanges.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityStore.prototype, "idKey", {
        // @internal
        get: function () {
            return this.config.idKey || this.options.idKey || DEFAULT_ID_KEY;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     * Replace current collection with provided collection
     *
     * @example
     *
     * this.store.set([Entity, Entity])
     * this.store.set({ids: [], entities: {}})
     * this.store.set({ 1: {}, 2: {}})
     *
     */
    EntityStore.prototype.set = function (entities, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        if (isNil(entities))
            return;
        isDev() && setAction('Set Entity');
        var isNativePreAdd = this.akitaPreAddEntity === EntityStore.prototype.akitaPreAddEntity;
        this.setHasCache(true, { restartTTL: true });
        this._setState(function (state) {
            var newState = setEntities({
                state: state,
                entities: entities,
                idKey: _this.idKey,
                preAddEntity: _this.akitaPreAddEntity,
                isNativePreAdd: isNativePreAdd,
            });
            if (isUndefined(options.activeId) === false) {
                newState.active = options.activeId;
            }
            return newState;
        });
        if (this.hasInitialUIState()) {
            this.handleUICreation();
        }
        this.entityActions.next({ type: EntityActions.Set, ids: this.ids });
    };
    /**
     * Add entities
     *
     * @example
     *
     * this.store.add([Entity, Entity])
     * this.store.add(Entity)
     * this.store.add(Entity, { prepend: true })
     *
     * this.store.add(Entity, { loading: false })
     */
    EntityStore.prototype.add = function (entities, options) {
        if (options === void 0) { options = { loading: false }; }
        var collection = coerceArray(entities);
        if (isEmpty(collection))
            return;
        var data = addEntities({
            state: this._value(),
            preAddEntity: this.akitaPreAddEntity,
            entities: collection,
            idKey: this.idKey,
            options: options,
        });
        if (data) {
            isDev() && setAction('Add Entity');
            data.newState.loading = options.loading;
            this._setState(function () { return data.newState; });
            if (this.hasInitialUIState()) {
                this.handleUICreation(true);
            }
            this.entityActions.next({ type: EntityActions.Add, ids: data.newIds });
        }
    };
    EntityStore.prototype.update = function (idsOrFnOrState, newStateOrFn) {
        var _this = this;
        if (isUndefined(newStateOrFn)) {
            _super.prototype.update.call(this, idsOrFnOrState);
            return;
        }
        var ids = [];
        if (datorama_akita_isFunction(idsOrFnOrState)) {
            // We need to filter according the predicate function
            ids = this.ids.filter(function (id) { return idsOrFnOrState(_this.entities[id]); });
        }
        else {
            // If it's nil we want all of them
            ids = isNil(idsOrFnOrState) ? this.ids : coerceArray(idsOrFnOrState);
        }
        if (isEmpty(ids))
            return;
        isDev() && setAction('Update Entity', ids);
        var entityIdChanged;
        this._setState(function (state) {
            return updateEntities({
                idKey: _this.idKey,
                ids: ids,
                preUpdateEntity: _this.akitaPreUpdateEntity,
                state: state,
                newStateOrFn: newStateOrFn,
                producerFn: _this._producerFn,
                onEntityIdChanges: function (oldId, newId) {
                    entityIdChanged = { oldId: oldId, newId: newId };
                    _this.entityIdChanges.next(tslib_es6_assign({}, entityIdChanged, { pending: true }));
                },
            });
        });
        if (entityIdChanged) {
            this.entityIdChanges.next(tslib_es6_assign({}, entityIdChanged, { pending: false }));
        }
        this.entityActions.next({ type: EntityActions.Update, ids: ids });
    };
    EntityStore.prototype.upsert = function (ids, newState, onCreate, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var toArray = coerceArray(ids);
        var predicate = function (isUpdate) { return function (id) { return hasEntity(_this.entities, id) === isUpdate; }; };
        var baseClass = datorama_akita_isFunction(onCreate) ? options.baseClass : onCreate ? onCreate.baseClass : undefined;
        var isClassBased = datorama_akita_isFunction(baseClass);
        var updateIds = toArray.filter(predicate(true));
        var newEntities = toArray.filter(predicate(false)).map(function (id) {
            var _a;
            var newStateObj = typeof newState === 'function' ? newState({}) : newState;
            var entity = datorama_akita_isFunction(onCreate) ? onCreate(id, newStateObj) : newStateObj;
            var withId = tslib_es6_assign({}, entity, (_a = {}, _a[_this.idKey] = id, _a));
            if (isClassBased) {
                return new baseClass(withId);
            }
            return withId;
        });
        // it can be any of the three types
        this.update(updateIds, newState);
        this.add(newEntities);
        isDev() && logAction('Upsert Entity');
    };
    /**
     *
     * Upsert entity collection (idKey must be present)
     *
     * @example
     *
     * store.upsertMany([ { id: 1 }, { id: 2 }]);
     *
     * store.upsertMany([ { id: 1 }, { id: 2 }], { loading: true  });
     * store.upsertMany([ { id: 1 }, { id: 2 }], { baseClass: Todo  });
     *
     */
    EntityStore.prototype.upsertMany = function (entities, options) {
        if (options === void 0) { options = {}; }
        var e_1, _a;
        var addedIds = [];
        var updatedIds = [];
        var updatedEntities = {};
        try {
            // Update the state directly to optimize performance
            for (var entities_1 = tslib_es6_values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
                var entity = entities_1_1.value;
                var withPreCheckHook = this.akitaPreCheckEntity(entity);
                var id = withPreCheckHook[this.idKey];
                if (hasEntity(this.entities, id)) {
                    var prev = this._value().entities[id];
                    var merged = tslib_es6_assign({}, this._value().entities[id], withPreCheckHook);
                    var next = options.baseClass ? new options.baseClass(merged) : merged;
                    var withHook = this.akitaPreUpdateEntity(prev, next);
                    var nextId = withHook[this.idKey];
                    updatedEntities[nextId] = withHook;
                    updatedIds.push(nextId);
                }
                else {
                    var newEntity = options.baseClass ? new options.baseClass(withPreCheckHook) : withPreCheckHook;
                    var withHook = this.akitaPreAddEntity(newEntity);
                    var nextId = withHook[this.idKey];
                    addedIds.push(nextId);
                    updatedEntities[nextId] = withHook;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        isDev() && logAction('Upsert Many');
        this._setState(function (state) { return (tslib_es6_assign({}, state, { ids: addedIds.length ? tslib_es6_spread(state.ids, addedIds) : state.ids, entities: tslib_es6_assign({}, state.entities, updatedEntities), loading: !!options.loading })); });
        updatedIds.length && this.entityActions.next({ type: EntityActions.Update, ids: updatedIds });
        addedIds.length && this.entityActions.next({ type: EntityActions.Add, ids: addedIds });
        if (addedIds.length && this.hasUIStore()) {
            this.handleUICreation(true);
        }
    };
    /**
     *
     * Replace one or more entities (except the id property)
     *
     *
     * @example
     *
     * this.store.replace(5, newEntity)
     * this.store.replace([1,2,3], newEntity)
     */
    EntityStore.prototype.replace = function (ids, newState) {
        var e_2, _a;
        var toArray = coerceArray(ids);
        if (isEmpty(toArray))
            return;
        var replaced = {};
        try {
            for (var toArray_1 = tslib_es6_values(toArray), toArray_1_1 = toArray_1.next(); !toArray_1_1.done; toArray_1_1 = toArray_1.next()) {
                var id = toArray_1_1.value;
                newState[this.idKey] = id;
                replaced[id] = newState;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (toArray_1_1 && !toArray_1_1.done && (_a = toArray_1.return)) _a.call(toArray_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        isDev() && setAction('Replace Entity', ids);
        this._setState(function (state) { return (tslib_es6_assign({}, state, { entities: tslib_es6_assign({}, state.entities, replaced) })); });
    };
    /**
     *
     * Move entity inside the collection
     *
     *
     * @example
     *
     * this.store.move(fromIndex, toIndex)
     */
    EntityStore.prototype.move = function (from, to) {
        var ids = this.ids.slice();
        ids.splice(to < 0 ? ids.length + to : to, 0, ids.splice(from, 1)[0]);
        isDev() && setAction('Move Entity');
        this._setState(function (state) { return (tslib_es6_assign({}, state, { 
            // Change the entities reference so that selectAll emit
            entities: tslib_es6_assign({}, state.entities), ids: ids })); });
    };
    EntityStore.prototype.remove = function (idsOrFn) {
        var _this = this;
        if (isEmpty(this.ids))
            return;
        var idPassed = isDefined(idsOrFn);
        // null means remove all
        var ids = [];
        if (datorama_akita_isFunction(idsOrFn)) {
            ids = this.ids.filter(function (entityId) { return idsOrFn(_this.entities[entityId]); });
        }
        else {
            ids = idPassed ? coerceArray(idsOrFn) : this.ids;
        }
        if (isEmpty(ids))
            return;
        isDev() && setAction('Remove Entity', ids);
        this._setState(function (state) { return removeEntities({ state: state, ids: ids }); });
        if (!idPassed) {
            this.setHasCache(false);
        }
        this.handleUIRemove(ids);
        this.entityActions.next({ type: EntityActions.Remove, ids: ids });
    };
    /**
     *
     * Update the active entity
     *
     * @example
     *
     * this.store.updateActive({ completed: true })
     * this.store.updateActive(active => {
     *   return {
     *     config: {
     *      ..active.config,
     *      date
     *     }
     *   }
     * })
     */
    EntityStore.prototype.updateActive = function (newStateOrCallback) {
        var ids = coerceArray(this.active);
        isDev() && setAction('Update Active', ids);
        this.update(ids, newStateOrCallback);
    };
    EntityStore.prototype.setActive = function (idOrOptions) {
        var active = getActiveEntities(idOrOptions, this.ids, this.active);
        if (active === undefined) {
            return;
        }
        isDev() && setAction('Set Active', active);
        this._setActive(active);
    };
    /**
     * Add active entities
     *
     * @example
     *
     * store.addActive(2);
     * store.addActive([3, 4, 5]);
     */
    EntityStore.prototype.addActive = function (ids) {
        var _this = this;
        var toArray = coerceArray(ids);
        if (isEmpty(toArray))
            return;
        var everyExist = toArray.every(function (id) { return _this.active.indexOf(id) > -1; });
        if (everyExist)
            return;
        isDev() && setAction('Add Active', ids);
        this._setState(function (state) {
            /** Protect against case that one of the items in the array exist */
            var uniques = Array.from(new Set(tslib_es6_spread(state.active, toArray)));
            return tslib_es6_assign({}, state, { active: uniques });
        });
    };
    /**
     * Remove active entities
     *
     * @example
     *
     * store.removeActive(2)
     * store.removeActive([3, 4, 5])
     */
    EntityStore.prototype.removeActive = function (ids) {
        var _this = this;
        var toArray = coerceArray(ids);
        if (isEmpty(toArray))
            return;
        var someExist = toArray.some(function (id) { return _this.active.indexOf(id) > -1; });
        if (!someExist)
            return;
        isDev() && setAction('Remove Active', ids);
        this._setState(function (state) {
            return tslib_es6_assign({}, state, { active: Array.isArray(state.active) ? state.active.filter(function (currentId) { return toArray.indexOf(currentId) === -1; }) : null });
        });
    };
    /**
     * Toggle active entities
     *
     * @example
     *
     * store.toggle(2)
     * store.toggle([3, 4, 5])
     */
    EntityStore.prototype.toggleActive = function (ids) {
        var _this = this;
        var toArray = coerceArray(ids);
        var filterExists = function (remove) { return function (id) { return _this.active.includes(id) === remove; }; };
        var remove = toArray.filter(filterExists(true));
        var add = toArray.filter(filterExists(false));
        this.removeActive(remove);
        this.addActive(add);
        isDev() && logAction('Toggle Active');
    };
    /**
     *
     * Create sub UI store for managing Entity's UI state
     *
     * @example
     *
     * export type ProductUI = {
     *   isLoading: boolean;
     *   isOpen: boolean
     * }
     *
     * interface ProductsUIState extends EntityState<ProductUI> {}
     *
     * export class ProductsStore EntityStore<ProductsState, Product> {
     *   ui: EntityUIStore<ProductsUIState, ProductUI>;
     *
     *   constructor() {
     *     super();
     *     this.createUIStore();
     *   }
     *
     * }
     */
    EntityStore.prototype.createUIStore = function (initialState, storeConfig) {
        if (initialState === void 0) { initialState = {}; }
        if (storeConfig === void 0) { storeConfig = {}; }
        var defaults = { name: "UI/" + this.storeName, idKey: this.idKey };
        this.ui = new EntityUIStore(initialState, tslib_es6_assign({}, defaults, storeConfig));
        return this.ui;
    };
    // @internal
    EntityStore.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.ui instanceof EntityStore) {
            this.ui.destroy();
        }
        this.entityActions.complete();
    };
    // @internal
    EntityStore.prototype.akitaPreUpdateEntity = function (_, nextEntity) {
        return nextEntity;
    };
    // @internal
    EntityStore.prototype.akitaPreAddEntity = function (newEntity) {
        return newEntity;
    };
    // @internal
    EntityStore.prototype.akitaPreCheckEntity = function (newEntity) {
        return newEntity;
    };
    Object.defineProperty(EntityStore.prototype, "ids", {
        get: function () {
            return this._value().ids;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityStore.prototype, "entities", {
        get: function () {
            return this._value().entities;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EntityStore.prototype, "active", {
        get: function () {
            return this._value().active;
        },
        enumerable: true,
        configurable: true
    });
    EntityStore.prototype._setActive = function (ids) {
        this._setState(function (state) {
            return tslib_es6_assign({}, state, { active: ids });
        });
    };
    EntityStore.prototype.handleUICreation = function (add) {
        var _this = this;
        if (add === void 0) { add = false; }
        var ids = this.ids;
        var isFunc = datorama_akita_isFunction(this.ui._akitaCreateEntityFn);
        var uiEntities;
        var createFn = function (id) {
            var _a;
            var current = _this.entities[id];
            var ui = isFunc ? _this.ui._akitaCreateEntityFn(current) : _this.ui._akitaCreateEntityFn;
            return tslib_es6_assign((_a = {}, _a[_this.idKey] = current[_this.idKey], _a), ui);
        };
        if (add) {
            uiEntities = this.ids.filter(function (id) { return isUndefined(_this.ui.entities[id]); }).map(createFn);
        }
        else {
            uiEntities = ids.map(createFn);
        }
        add ? this.ui.add(uiEntities) : this.ui.set(uiEntities);
    };
    EntityStore.prototype.hasInitialUIState = function () {
        return this.hasUIStore() && isUndefined(this.ui._akitaCreateEntityFn) === false;
    };
    EntityStore.prototype.handleUIRemove = function (ids) {
        if (this.hasUIStore()) {
            this.ui.remove(ids);
        }
    };
    EntityStore.prototype.hasUIStore = function () {
        return this.ui instanceof EntityUIStore;
    };
    var _a, _b;
    __decorate([
        transaction(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object, Object]),
        __metadata("design:returntype", void 0)
    ], EntityStore.prototype, "upsert", null);
    __decorate([
        transaction(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [typeof (_b = typeof T !== "undefined" && T) === "function" ? _b : Object]),
        __metadata("design:returntype", void 0)
    ], EntityStore.prototype, "toggleActive", null);
    return EntityStore;
}(Store));
// @internal
var EntityUIStore = /** @class */ (function (_super) {
    __extends(EntityUIStore, _super);
    function EntityUIStore(initialState, storeConfig) {
        if (initialState === void 0) { initialState = {}; }
        if (storeConfig === void 0) { storeConfig = {}; }
        return _super.call(this, initialState, storeConfig) || this;
    }
    /**
     *
     * Set the initial UI entity state. This function will determine the entity's
     * initial state when we call `set()` or `add()`.
     *
     * @example
     *
     * constructor() {
     *   super();
     *   this.createUIStore().setInitialEntityState(entity => ({ isLoading: false, isOpen: true }));
     *   this.createUIStore().setInitialEntityState({ isLoading: false, isOpen: true });
     * }
     *
     */
    EntityUIStore.prototype.setInitialEntityState = function (createFn) {
        this._akitaCreateEntityFn = createFn;
    };
    return EntityUIStore;
}(EntityStore));

// @internal
function find(collection, idsOrPredicate, idKey) {
    var e_1, _a, e_2, _b;
    var result = [];
    if (datorama_akita_isFunction(idsOrPredicate)) {
        try {
            for (var collection_1 = __values(collection), collection_1_1 = collection_1.next(); !collection_1_1.done; collection_1_1 = collection_1.next()) {
                var entity = collection_1_1.value;
                if (idsOrPredicate(entity) === true) {
                    result.push(entity);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (collection_1_1 && !collection_1_1.done && (_a = collection_1.return)) _a.call(collection_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else {
        var toSet = coerceArray(idsOrPredicate).reduce(function (acc, current) { return acc.add(current); }, new Set());
        try {
            for (var collection_2 = __values(collection), collection_2_1 = collection_2.next(); !collection_2_1.done; collection_2_1 = collection_2.next()) {
                var entity = collection_2_1.value;
                if (toSet.has(entity[idKey])) {
                    result.push(entity);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (collection_2_1 && !collection_2_1.done && (_b = collection_2.return)) _b.call(collection_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return result;
}
// @internal
function distinctUntilArrayItemChanged() {
    return distinctUntilChanged(function (prevCollection, currentCollection) {
        if (prevCollection === currentCollection) {
            return true;
        }
        if (datorama_akita_isArray(prevCollection) === false || datorama_akita_isArray(currentCollection) === false) {
            return false;
        }
        if (isEmpty(prevCollection) && isEmpty(currentCollection)) {
            return true;
        }
        // if item is new in the current collection but not exist in the prev collection
        var hasNewItem = hasChange(currentCollection, prevCollection);
        if (hasNewItem) {
            return false;
        }
        var isOneOfItemReferenceChanged = hasChange(prevCollection, currentCollection);
        // return false means there is a change and we want to call next()
        return isOneOfItemReferenceChanged === false;
    });
}
// @internal
function hasChange(first, second) {
    var hasChange = second.some(function (currentItem) {
        var oldItem = first.find(function (prevItem) { return prevItem === currentItem; });
        return oldItem === undefined;
    });
    return hasChange;
}
function arrayFind(idsOrPredicate, idKey) {
    return function (source) {
        return source.pipe(map(function (collection) {
            // which means the user deleted the root entity or set the collection to nil
            if (datorama_akita_isArray(collection) === false) {
                return collection;
            }
            return find(collection, idsOrPredicate, idKey || DEFAULT_ID_KEY);
        }), distinctUntilArrayItemChanged(), map(function (value) {
            if (datorama_akita_isArray(value) === false) {
                return value;
            }
            if (datorama_akita_isArray(idsOrPredicate) || datorama_akita_isFunction(idsOrPredicate)) {
                return value;
            }
            return value[0];
        }));
    };
}

var Order;
(function (Order) {
    Order["ASC"] = "asc";
    Order["DESC"] = "desc";
})(Order || (Order = {}));
// @internal
function compareValues(key, order) {
    if (order === void 0) { order = Order.ASC; }
    return function (a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            return 0;
        }
        var varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        var varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
        var comparison = 0;
        if (varA > varB) {
            comparison = 1;
        }
        else if (varA < varB) {
            comparison = -1;
        }
        return order == Order.DESC ? comparison * -1 : comparison;
    };
}

// @internal
function entitiesToArray(state, options) {
    var arr = [];
    var ids = state.ids, entities = state.entities;
    var filterBy = options.filterBy, limitTo = options.limitTo, sortBy = options.sortBy, sortByOrder = options.sortByOrder;
    var _loop_1 = function (i) {
        var entity = entities[ids[i]];
        if (!filterBy) {
            arr.push(entity);
            return "continue";
        }
        var toArray = coerceArray(filterBy);
        var allPass = toArray.every(function (fn) { return fn(entity, i); });
        if (allPass) {
            arr.push(entity);
        }
    };
    for (var i = 0; i < ids.length; i++) {
        _loop_1(i);
    }
    if (sortBy) {
        var _sortBy_1 = datorama_akita_isFunction(sortBy) ? sortBy : compareValues(sortBy, sortByOrder);
        arr = arr.sort(function (a, b) { return _sortBy_1(a, b, state); });
    }
    var length = Math.min(limitTo || arr.length, arr.length);
    return length === arr.length ? arr : arr.slice(0, length);
}

// @internal
function entitiesToMap(state, options) {
    var map = {};
    var filterBy = options.filterBy, limitTo = options.limitTo;
    var ids = state.ids, entities = state.entities;
    if (!filterBy && !limitTo) {
        return entities;
    }
    var hasLimit = isNil(limitTo) === false;
    if (filterBy && hasLimit) {
        var count = 0;
        var _loop_1 = function (i, length_1) {
            if (count === limitTo)
                return "break";
            var id = ids[i];
            var entity = entities[id];
            var allPass = coerceArray(filterBy).every(function (fn) { return fn(entity, i); });
            if (allPass) {
                map[id] = entity;
                count++;
            }
        };
        for (var i = 0, length_1 = ids.length; i < length_1; i++) {
            var state_1 = _loop_1(i, length_1);
            if (state_1 === "break")
                break;
        }
    }
    else {
        var finalLength = Math.min(limitTo || ids.length, ids.length);
        var _loop_2 = function (i) {
            var id = ids[i];
            var entity = entities[id];
            if (!filterBy) {
                map[id] = entity;
                return "continue";
            }
            var allPass = coerceArray(filterBy).every(function (fn) { return fn(entity, i); });
            if (allPass) {
                map[id] = entity;
            }
        };
        for (var i = 0; i < finalLength; i++) {
            _loop_2(i);
        }
    }
    return map;
}

// @internal
function isString(value) {
    return typeof value === 'string';
}

// @internal
function findEntityByPredicate(predicate, entities) {
    var e_1, _a;
    try {
        for (var _b = tslib_es6_values(Object.keys(entities)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var entityId = _c.value;
            if (predicate(entities[entityId]) === true) {
                return entityId;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return undefined;
}
// @internal
function getEntity(id, project) {
    return function (entities) {
        var entity = entities[id];
        if (isUndefined(entity)) {
            return undefined;
        }
        if (!project) {
            return entity;
        }
        if (isString(project)) {
            return entity[project];
        }
        return project(entity);
    };
}

// @internal
function mapSkipUndefined(arr, callbackFn) {
    return arr.reduce(function (result, value, index, array) {
        var val = callbackFn(value, index, array);
        if (val !== undefined) {
            result.push(val);
        }
        return result;
    }, []);
}

var queryConfigKey = 'akitaQueryConfig';
function QueryConfig(metadata) {
    return function (constructor) {
        constructor[queryConfigKey] = {};
        for (var i = 0, keys = Object.keys(metadata); i < keys.length; i++) {
            var key = keys[i];
            constructor[queryConfigKey][key] = metadata[key];
        }
    };
}

function compareKeys(keysOrFuncs) {
    return function (prevState, currState) {
        var isFns = datorama_akita_isFunction(keysOrFuncs[0]);
        // Return when they are NOT changed
        return keysOrFuncs.some(function (keyOrFunc) {
            if (isFns) {
                return keyOrFunc(prevState) !== keyOrFunc(currState);
            }
            return prevState[keyOrFunc] !== currState[keyOrFunc];
        }) === false;
    };
}

var Query = /** @class */ (function () {
    function Query(store) {
        this.store = store;
        this.__store__ = store;
        if (isDev()) {
            // @internal
            __queries__[store.storeName] = this;
        }
    }
    Query.prototype.select = function (project) {
        var mapFn;
        if (datorama_akita_isFunction(project)) {
            mapFn = project;
        }
        else if (isString(project)) {
            mapFn = function (state) { return state[project]; };
        }
        else if (Array.isArray(project)) {
            return this.store
                ._select(function (state) { return state; })
                .pipe(distinctUntilChanged(compareKeys(project)), map_map(function (state) {
                if (datorama_akita_isFunction(project[0])) {
                    return project.map(function (func) { return func(state); });
                }
                return project.reduce(function (acc, k) {
                    acc[k] = state[k];
                    return acc;
                }, {});
            }));
        }
        else {
            mapFn = function (state) { return state; };
        }
        return this.store._select(mapFn);
    };
    /**
     * Select the loading state
     *
     * @example
     *
     * this.query.selectLoading().subscribe(isLoading => {})
     */
    Query.prototype.selectLoading = function () {
        return this.select(function (state) { return state.loading; });
    };
    /**
     * Select the error state
     *
     * @example
     *
     * this.query.selectError().subscribe(error => {})
     */
    Query.prototype.selectError = function () {
        return this.select(function (state) { return state.error; });
    };
    /**
     * Get the store's value
     *
     * @example
     *
     * this.query.getValue()
     *
     */
    Query.prototype.getValue = function () {
        return this.store._value();
    };
    /**
     * Select the cache state
     *
     * @example
     *
     * this.query.selectHasCache().pipe(
     *   switchMap(hasCache => {
     *     return hasCache ? of() : http().pipe(res => store.set(res))
     *   })
     * )
     */
    Query.prototype.selectHasCache = function () {
        return this.store._cache().asObservable();
    };
    /**
     * Whether we've cached data
     *
     * @example
     *
     * this.query.getHasCache()
     *
     */
    Query.prototype.getHasCache = function () {
        return this.store._cache().value;
    };
    Object.defineProperty(Query.prototype, "config", {
        // @internal
        get: function () {
            return this.constructor[queryConfigKey];
        },
        enumerable: true,
        configurable: true
    });
    return Query;
}());

// @internal
function sortByOptions(options, config) {
    options.sortBy = options.sortBy || (config && config.sortBy);
    options.sortByOrder = options.sortByOrder || (config && config.sortByOrder);
}

/**
 *
 *  The Entity Query is similar to the general Query, with additional functionality tailored for EntityStores.
 *
 *  class WidgetsQuery extends QueryEntity<WidgetsState> {
 *     constructor(protected store: WidgetsStore) {
 *       super(store);
 *     }
 *  }
 *
 *
 *
 */
var QueryEntity = /** @class */ (function (_super) {
    __extends(QueryEntity, _super);
    function QueryEntity(store, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, store) || this;
        _this.options = options;
        _this.__store__ = store;
        return _this;
    }
    QueryEntity.prototype.selectAll = function (options) {
        var _this = this;
        if (options === void 0) { options = {
            asObject: false,
        }; }
        return this.select(function (state) { return state.entities; }).pipe(map_map(function () { return _this.getAll(options); }));
    };
    QueryEntity.prototype.getAll = function (options) {
        if (options === void 0) { options = { asObject: false, filterBy: undefined, limitTo: undefined }; }
        if (options.asObject) {
            return entitiesToMap(this.getValue(), options);
        }
        sortByOptions(options, this.config || this.options);
        return entitiesToArray(this.getValue(), options);
    };
    QueryEntity.prototype.selectMany = function (ids, project) {
        if (!ids || !ids.length)
            return of_of([]);
        return this.select(function (state) { return state.entities; }).pipe(map_map(function (entities) { return mapSkipUndefined(ids, function (id) { return getEntity(id, project)(entities); }); }), distinctUntilArrayItemChanged());
    };
    QueryEntity.prototype.selectEntity = function (idOrPredicate, project) {
        var id = idOrPredicate;
        if (datorama_akita_isFunction(idOrPredicate)) {
            // For performance reason we expect the entity to be in the store
            id = findEntityByPredicate(idOrPredicate, this.getValue().entities);
        }
        return this.select(function (state) { return state.entities; }).pipe(map_map(getEntity(id, project)), distinctUntilChanged());
    };
    /**
     * Get an entity by id
     *
     * @example
     *
     * this.query.getEntity(1);
     */
    QueryEntity.prototype.getEntity = function (id) {
        return this.getValue().entities[id];
    };
    /**
     * Select the active entity's id
     *
     * @example
     *
     * this.query.selectActiveId()
     */
    QueryEntity.prototype.selectActiveId = function () {
        return this.select(function (state) { return state.active; });
    };
    /**
     * Get the active id
     *
     * @example
     *
     * this.query.getActiveId()
     */
    QueryEntity.prototype.getActiveId = function () {
        return this.getValue().active;
    };
    QueryEntity.prototype.selectActive = function (project) {
        var _this = this;
        if (datorama_akita_isArray(this.getActive())) {
            return this.selectActiveId().pipe(switchMap(function (ids) { return _this.selectMany(ids, project); }));
        }
        return this.selectActiveId().pipe(switchMap(function (ids) { return _this.selectEntity(ids, project); }));
    };
    QueryEntity.prototype.getActive = function () {
        var _this = this;
        var activeId = this.getActiveId();
        if (datorama_akita_isArray(activeId)) {
            return activeId.map(function (id) { return _this.getValue().entities[id]; });
        }
        return toBoolean(activeId) ? this.getEntity(activeId) : undefined;
    };
    /**
     * Select the store's entity collection length
     *
     * @example
     *
     * this.query.selectCount()
     * this.query.selectCount(entity => entity.completed)
     */
    QueryEntity.prototype.selectCount = function (predicate) {
        var _this = this;
        return this.select(function (state) { return state.entities; }).pipe(map_map(function () { return _this.getCount(predicate); }));
    };
    /**
     * Get the store's entity collection length
     *
     * @example
     *
     * this.query.getCount()
     * this.query.getCount(entity => entity.completed)
     */
    QueryEntity.prototype.getCount = function (predicate) {
        if (datorama_akita_isFunction(predicate)) {
            return this.getAll().filter(predicate).length;
        }
        return this.getValue().ids.length;
    };
    QueryEntity.prototype.selectLast = function (project) {
        return this.selectAt(function (ids) { return ids[ids.length - 1]; }, project);
    };
    QueryEntity.prototype.selectFirst = function (project) {
        return this.selectAt(function (ids) { return ids[0]; }, project);
    };
    QueryEntity.prototype.selectEntityAction = function (actionOrActions) {
        if (isNil(actionOrActions)) {
            return this.store.selectEntityAction$;
        }
        var project = datorama_akita_isArray(actionOrActions) ? function (action) { return action; } : function (_a) {
            var ids = _a.ids;
            return ids;
        };
        var actions = coerceArray(actionOrActions);
        return this.store.selectEntityAction$.pipe(filter_filter(function (_a) {
            var type = _a.type;
            return actions.includes(type);
        }), map_map(function (action) { return project(action); }));
    };
    QueryEntity.prototype.hasEntity = function (projectOrIds) {
        var _this = this;
        if (isNil(projectOrIds)) {
            return this.getValue().ids.length > 0;
        }
        if (datorama_akita_isFunction(projectOrIds)) {
            return this.getAll().some(projectOrIds);
        }
        if (datorama_akita_isArray(projectOrIds)) {
            return projectOrIds.every(function (id) { return id in _this.getValue().entities; });
        }
        return projectOrIds in this.getValue().entities;
    };
    /**
     * Returns whether entity store has an active entity
     *
     * @example
     *
     * this.query.hasActive()
     * this.query.hasActive(3)
     *
     */
    QueryEntity.prototype.hasActive = function (id) {
        var active = this.getValue().active;
        var isIdProvided = isDefined(id);
        if (Array.isArray(active)) {
            if (isIdProvided) {
                return active.includes(id);
            }
            return active.length > 0;
        }
        return isIdProvided ? active === id : isDefined(active);
    };
    /**
     *
     * Create sub UI query for querying Entity's UI state
     *
     * @example
     *
     *
     * export class ProductsQuery extends QueryEntity<ProductsState> {
     *   ui: EntityUIQuery<ProductsUIState>;
     *
     *   constructor(protected store: ProductsStore) {
     *     super(store);
     *     this.createUIQuery();
     *   }
     *
     * }
     */
    QueryEntity.prototype.createUIQuery = function () {
        this.ui = new EntityUIQuery(this.__store__.ui);
    };
    QueryEntity.prototype.selectAt = function (mapFn, project) {
        var _this = this;
        return this.select(function (state) { return state.ids; }).pipe(map_map(mapFn), distinctUntilChanged(), switchMap(function (id) { return _this.selectEntity(id, project); }));
    };
    return QueryEntity;
}(Query));
// @internal
var EntityUIQuery = /** @class */ (function (_super) {
    __extends(EntityUIQuery, _super);
    function EntityUIQuery(store) {
        return _super.call(this, store) || this;
    }
    return EntityUIQuery;
}(QueryEntity));

/**
 * @example
 *
 * query.selectEntity(2).pipe(filterNil)
 */
var filterNil = function (source) { return source.pipe(filter_filter(function (value) { return value !== null && typeof value !== 'undefined'; })); };

/**
 * @internal
 *
 * @example
 *
 * getValue(state, 'todos.ui')
 *
 */
function getValue(obj, prop) {
    /** return the whole state  */
    if (prop.split('.').length === 1) {
        return obj;
    }
    var removeStoreName = prop
        .split('.')
        .slice(1)
        .join('.');
    return removeStoreName.split('.').reduce(function (acc, part) { return acc && acc[part]; }, obj);
}

/**
 * @internal
 *
 * @example
 * setValue(state, 'todos.ui', { filter: {} })
 */
function setValue(obj, prop, val) {
    var split = prop.split('.');
    if (split.length === 1) {
        return tslib_es6_assign({}, obj, val);
    }
    obj = tslib_es6_assign({}, obj);
    var lastIndex = split.length - 2;
    var removeStoreName = prop.split('.').slice(1);
    removeStoreName.reduce(function (acc, part, index) {
        if (index !== lastIndex) {
            acc[part] = tslib_es6_assign({}, acc[part]);
            return acc && acc[part];
        }
        acc[part] = Array.isArray(acc[part]) || !datorama_akita_isObject(acc[part]) ? val : tslib_es6_assign({}, acc[part], val);
        return acc && acc[part];
    }, obj);
    return obj;
}

var skipStorageUpdate = false;
var _persistStateInit = new ReplaySubject(1);
function selectPersistStateInit() {
    return _persistStateInit.asObservable();
}
function setSkipStorageUpdate(skip) {
    skipStorageUpdate = skip;
}
function getSkipStorageUpdate() {
    return skipStorageUpdate;
}
function datorama_akita_isPromise(v) {
    return v && datorama_akita_isFunction(v.then);
}
function observify(asyncOrValue) {
    if (datorama_akita_isPromise(asyncOrValue) || isObservable(asyncOrValue)) {
        return from(asyncOrValue);
    }
    return of(asyncOrValue);
}
function persistState(params) {
    var defaults = {
        key: 'AkitaStores',
        enableInNonBrowser: false,
        storage: !hasLocalStorage() ? params.storage : localStorage,
        deserialize: JSON.parse,
        serialize: JSON.stringify,
        include: [],
        select: [],
        persistOnDestroy: false,
        preStorageUpdate: function (storeName, state) {
            return state;
        },
        preStoreUpdate: function (storeName, state) {
            return state;
        },
        skipStorageUpdate: getSkipStorageUpdate,
        preStorageUpdateOperator: function () { return function (source) { return source; }; },
    };
    var _a = Object.assign({}, defaults, params), storage = _a.storage, enableInNonBrowser = _a.enableInNonBrowser, deserialize = _a.deserialize, serialize = _a.serialize, include = _a.include, select = _a.select, key = _a.key, preStorageUpdate = _a.preStorageUpdate, persistOnDestroy = _a.persistOnDestroy, preStorageUpdateOperator = _a.preStorageUpdateOperator, preStoreUpdate = _a.preStoreUpdate, skipStorageUpdate = _a.skipStorageUpdate;
    if ((isNotBrowser && !enableInNonBrowser) || !storage)
        return;
    var hasInclude = include.length > 0;
    var hasSelect = select.length > 0;
    var includeStores;
    var selectStores;
    if (hasInclude) {
        includeStores = include.reduce(function (acc, path) {
            if (datorama_akita_isFunction(path)) {
                acc.fns.push(path);
            }
            else {
                var storeName = path.split('.')[0];
                acc[storeName] = path;
            }
            return acc;
        }, { fns: [] });
    }
    if (hasSelect) {
        selectStores = select.reduce(function (acc, selectFn) {
            acc[selectFn.storeName] = selectFn;
            return acc;
        }, {});
    }
    var stores = {};
    var acc = {};
    var subscriptions = [];
    var buffer = [];
    function _save(v) {
        observify(v).subscribe(function () {
            var next = buffer.shift();
            next && _save(next);
        });
    }
    // when we use the local/session storage we perform the serialize, otherwise we let the passed storage implementation to do it
    var isLocalStorage = (hasLocalStorage() && storage === localStorage) || (hasSessionStorage() && storage === sessionStorage);
    observify(storage.getItem(key)).subscribe(function (value) {
        var storageState = datorama_akita_isObject(value) ? value : deserialize(value || '{}');
        function save(storeCache) {
            storageState['$cache'] = __assign({}, (storageState['$cache'] || {}), storeCache);
            storageState = Object.assign({}, storageState, acc);
            buffer.push(storage.setItem(key, isLocalStorage ? serialize(storageState) : storageState));
            _save(buffer.shift());
        }
        function subscribe(storeName, path) {
            stores[storeName] = __stores__[storeName]
                ._select(function (state) { return getValue(state, path); })
                .pipe(skip(1), map(function (store) {
                if (hasSelect && selectStores[storeName]) {
                    return selectStores[storeName](store);
                }
                return store;
            }), filter(function () { return skipStorageUpdate() === false; }), preStorageUpdateOperator())
                .subscribe(function (data) {
                acc[storeName] = preStorageUpdate(storeName, data);
                Promise.resolve().then(function () {
                    var _a;
                    return save((_a = {}, _a[storeName] = __stores__[storeName]._cache().getValue(), _a));
                });
            });
        }
        function setInitial(storeName, store, path) {
            if (storeName in storageState) {
                setAction('@PersistState');
                store._setState(function (state) {
                    return setValue(state, path, preStoreUpdate(storeName, storageState[storeName], state));
                });
                var hasCache = storageState['$cache'] ? storageState['$cache'][storeName] : false;
                __stores__[storeName].setHasCache(hasCache, { restartTTL: true });
            }
        }
        subscriptions.push($$deleteStore.subscribe(function (storeName) {
            var _a;
            if (stores[storeName]) {
                if (persistOnDestroy === false) {
                    save((_a = {}, _a[storeName] = false, _a));
                }
                stores[storeName].unsubscribe();
                delete stores[storeName];
            }
        }));
        subscriptions.push($$addStore.subscribe(function (storeName) {
            if (storeName === 'router') {
                return;
            }
            var store = __stores__[storeName];
            if (hasInclude) {
                var path = includeStores[storeName];
                if (!path) {
                    var passPredicate = includeStores.fns.some(function (fn) { return fn(storeName); });
                    if (passPredicate) {
                        path = storeName;
                    }
                    else {
                        return;
                    }
                }
                setInitial(storeName, store, path);
                subscribe(storeName, path);
            }
            else {
                setInitial(storeName, store, storeName);
                subscribe(storeName, storeName);
            }
        }));
        _persistStateInit.next();
    });
    return {
        destroy: function () {
            subscriptions.forEach(function (s) { return s.unsubscribe(); });
            for (var i = 0, keys = Object.keys(stores); i < keys.length; i++) {
                var storeName = keys[i];
                stores[storeName].unsubscribe();
            }
            stores = {};
        },
        clear: function () {
            storage.clear();
        },
        clearStore: function (storeName) {
            if (isNil(storeName)) {
                var value_1 = observify(storage.setItem(key, '{}'));
                value_1.subscribe();
                return;
            }
            var value = storage.getItem(key);
            observify(value).subscribe(function (v) {
                var storageState = deserialize(v || '{}');
                if (storageState[storeName]) {
                    delete storageState[storeName];
                    var value_2 = observify(storage.setItem(key, serialize(storageState)));
                    value_2.subscribe();
                }
            });
        },
    };
}

var SnapshotManager = /** @class */ (function () {
    function SnapshotManager() {
    }
    /**
     * Get a snapshot of the whole state or a specific stores
     * Use it ONLY for things such as saving the state in the server
     */
    SnapshotManager.prototype.getStoresSnapshot = function (stores) {
        if (stores === void 0) { stores = []; }
        var acc = {};
        var hasInclude = stores.length > 0;
        var keys = hasInclude ? stores : Object.keys(__stores__);
        for (var i = 0; i < keys.length; i++) {
            var storeName = keys[i];
            if (storeName !== 'router') {
                acc[storeName] = __stores__[storeName]._value();
            }
        }
        return acc;
    };
    SnapshotManager.prototype.setStoresSnapshot = function (stores, options) {
        var mergedOptions = tslib_es6_assign({ skipStorageUpdate: false, lazy: false }, options);
        mergedOptions.skipStorageUpdate && setSkipStorageUpdate(true);
        var normalizedStores = stores;
        if (isString(stores)) {
            normalizedStores = JSON.parse(normalizedStores);
        }
        var size = Object.keys(normalizedStores).length;
        if (mergedOptions.lazy) {
            $$addStore
                .pipe(filter_filter(function (name) { return normalizedStores.hasOwnProperty(name); }), take(size))
                .subscribe(function (name) { return __stores__[name]._setState(function () { return normalizedStores[name]; }); });
        }
        else {
            var _loop_1 = function (i, keys) {
                var storeName = keys[i];
                if (__stores__[storeName]) {
                    __stores__[storeName]._setState(function () { return normalizedStores[storeName]; });
                }
            };
            for (var i = 0, keys = Object.keys(normalizedStores); i < keys.length; i++) {
                _loop_1(i, keys);
            }
        }
        mergedOptions.skipStorageUpdate && setSkipStorageUpdate(false);
    };
    return SnapshotManager;
}());
var snapshotManager = new SnapshotManager();

var AkitaPlugin = /** @class */ (function () {
    function AkitaPlugin(query, config) {
        this.query = query;
        if (config && config.resetFn) {
            if (getAkitaConfig().resettable) {
                this.onReset(config.resetFn);
            }
        }
    }
    /** This method is responsible for getting access to the query. */
    AkitaPlugin.prototype.getQuery = function () {
        return this.query;
    };
    /** This method is responsible for getting access to the store. */
    AkitaPlugin.prototype.getStore = function () {
        return this.getQuery().__store__;
    };
    /** This method is responsible tells whether the plugin is entityBased or not.  */
    AkitaPlugin.prototype.isEntityBased = function (entityId) {
        return toBoolean(entityId);
    };
    /** This method is responsible for selecting the source; it can be the whole store or one entity. */
    AkitaPlugin.prototype.selectSource = function (entityId, property) {
        var _this = this;
        if (this.isEntityBased(entityId)) {
            return this.getQuery().selectEntity(entityId).pipe(filterNil);
        }
        if (property) {
            return this.getQuery().select(function (state) { return getValue(state, _this.withStoreName(property)); });
        }
        return this.getQuery().select();
    };
    AkitaPlugin.prototype.getSource = function (entityId, property) {
        if (this.isEntityBased(entityId)) {
            return this.getQuery().getEntity(entityId);
        }
        var state = this.getQuery().getValue();
        if (property) {
            return getValue(state, this.withStoreName(property));
        }
        return state;
    };
    AkitaPlugin.prototype.withStoreName = function (prop) {
        return this.storeName + "." + prop;
    };
    Object.defineProperty(AkitaPlugin.prototype, "storeName", {
        get: function () {
            return this.getStore().storeName;
        },
        enumerable: true,
        configurable: true
    });
    /** This method is responsible for updating the store or one entity; it can be the whole store or one entity. */
    AkitaPlugin.prototype.updateStore = function (newState, entityId, property) {
        var _this = this;
        if (this.isEntityBased(entityId)) {
            this.getStore().update(entityId, newState);
        }
        else {
            if (property) {
                this.getStore()._setState(function (state) {
                    return setValue(state, _this.withStoreName(property), newState);
                });
                return;
            }
            this.getStore()._setState(function (state) { return (tslib_es6_assign({}, state, newState)); });
        }
    };
    /**
     * Function to invoke upon reset
     */
    AkitaPlugin.prototype.onReset = function (fn) {
        var _this = this;
        var original = this.getStore().reset;
        this.getStore().reset = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            /** It should run after the plugin destroy method */
            setTimeout(function () {
                original.apply(_this.getStore(), params);
                fn();
            });
        };
    };
    return AkitaPlugin;
}());

var paginatorDefaults = {
    pagesControls: false,
    range: false,
    startWith: 1,
    cacheTimeout: undefined,
    clearStoreWithCache: true
};
var PaginatorPlugin = /** @class */ (function (_super) {
    __extends(PaginatorPlugin, _super);
    function PaginatorPlugin(query, config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, query, {
            resetFn: function () {
                _this.initial = false;
                _this.destroy({ clearCache: true, currentPage: 1 });
            }
        }) || this;
        _this.query = query;
        _this.config = config;
        /** Save current filters, sorting, etc. in cache */
        _this.metadata = new Map();
        _this.pages = new Map();
        _this.pagination = {
            currentPage: 1,
            perPage: 0,
            total: 0,
            lastPage: 0,
            data: []
        };
        /**
         * When the user navigates to a different page and return
         * we don't want to call `clearCache` on first time.
         */
        _this.initial = true;
        /**
         * Proxy to the query loading
         */
        _this.isLoading$ = _this.query.selectLoading().pipe(delay(0));
        _this.config = Object.assign(paginatorDefaults, config);
        var _a = _this.config, startWith = _a.startWith, cacheTimeout = _a.cacheTimeout;
        _this.page = new BehaviorSubject(startWith);
        if (isObservable_isObservable(cacheTimeout)) {
            _this.clearCacheSubscription = cacheTimeout.subscribe(function () { return _this.clearCache(); });
        }
        return _this;
    }
    Object.defineProperty(PaginatorPlugin.prototype, "pageChanges", {
        /**
         * Listen to page changes
         */
        get: function () {
            return this.page.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PaginatorPlugin.prototype, "currentPage", {
        /**
         * Get the current page number
         */
        get: function () {
            return this.pagination.currentPage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PaginatorPlugin.prototype, "isFirst", {
        /**
         * Check if current page is the first one
         */
        get: function () {
            return this.currentPage === 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PaginatorPlugin.prototype, "isLast", {
        /**
         * Check if current page is the last one
         */
        get: function () {
            return this.currentPage === this.pagination.lastPage;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Whether to generate an array of pages for *ngFor
     * [1, 2, 3, 4]
     */
    PaginatorPlugin.prototype.withControls = function () {
        this.config.pagesControls = true;
        return this;
    };
    /**
     * Whether to generate the `from` and `to` keys
     * [1, 2, 3, 4]
     */
    PaginatorPlugin.prototype.withRange = function () {
        this.config.range = true;
        return this;
    };
    /**
     * Set the loading state
     */
    PaginatorPlugin.prototype.setLoading = function (value) {
        if (value === void 0) { value = true; }
        this.getStore().setLoading(value);
    };
    /**
     * Update the pagination object and add the page
     */
    PaginatorPlugin.prototype.update = function (response) {
        this.pagination = response;
        this.addPage(response.data);
    };
    /**
     *
     * Set the ids and add the page to store
     */
    PaginatorPlugin.prototype.addPage = function (data) {
        var _this = this;
        this.pages.set(this.currentPage, { ids: data.map(function (entity) { return entity[_this.getStore().idKey]; }) });
        this.getStore().upsertMany(data);
    };
    /**
     * Clear the cache.
     */
    PaginatorPlugin.prototype.clearCache = function (options) {
        if (options === void 0) { options = {}; }
        if (!this.initial) {
            logAction('@Pagination - Clear Cache');
            if (options.clearStore !== false && (this.config.clearStoreWithCache || options.clearStore)) {
                this.getStore().remove();
            }
            this.pages = new Map();
            this.metadata = new Map();
        }
        this.initial = false;
    };
    PaginatorPlugin.prototype.clearPage = function (page) {
        this.pages.delete(page);
    };
    /**
     * Clear the cache timeout and optionally the pages
     */
    PaginatorPlugin.prototype.destroy = function (_a) {
        var _b = _a === void 0 ? {} : _a, clearCache = _b.clearCache, currentPage = _b.currentPage;
        if (this.clearCacheSubscription) {
            this.clearCacheSubscription.unsubscribe();
        }
        if (clearCache) {
            this.clearCache();
        }
        if (!isUndefined(currentPage)) {
            this.setPage(currentPage);
        }
        this.initial = true;
    };
    /**
     * Whether the provided page is active
     */
    PaginatorPlugin.prototype.isPageActive = function (page) {
        return this.currentPage === page;
    };
    /**
     * Set the current page
     */
    PaginatorPlugin.prototype.setPage = function (page) {
        if (page !== this.currentPage || !this.hasPage(page)) {
            this.page.next((this.pagination.currentPage = page));
        }
    };
    /**
     * Increment current page
     */
    PaginatorPlugin.prototype.nextPage = function () {
        if (this.currentPage !== this.pagination.lastPage) {
            this.setPage(this.pagination.currentPage + 1);
        }
    };
    /**
     * Decrement current page
     */
    PaginatorPlugin.prototype.prevPage = function () {
        if (this.pagination.currentPage > 1) {
            this.setPage(this.pagination.currentPage - 1);
        }
    };
    /**
     * Set current page to last
     */
    PaginatorPlugin.prototype.setLastPage = function () {
        this.setPage(this.pagination.lastPage);
    };
    /**
     * Set current page to first
     */
    PaginatorPlugin.prototype.setFirstPage = function () {
        this.setPage(1);
    };
    /**
     * Check if page exists in cache
     */
    PaginatorPlugin.prototype.hasPage = function (page) {
        return this.pages.has(page);
    };
    /**
     * Get the current page if it's in cache, otherwise invoke the request
     */
    PaginatorPlugin.prototype.getPage = function (req) {
        var _this = this;
        var page = this.pagination.currentPage;
        if (this.hasPage(page)) {
            return this.selectPage(page);
        }
        else {
            this.setLoading(true);
            return from_from(req()).pipe(switchMap(function (config) {
                page = config.currentPage;
                applyTransaction(function () {
                    _this.setLoading(false);
                    _this.update(config);
                });
                return _this.selectPage(page);
            }));
        }
    };
    PaginatorPlugin.prototype.getQuery = function () {
        return this.query;
    };
    PaginatorPlugin.prototype.refreshCurrentPage = function () {
        if (isNil(this.currentPage) === false) {
            this.clearPage(this.currentPage);
            this.setPage(this.currentPage);
        }
    };
    PaginatorPlugin.prototype.getFrom = function () {
        if (this.isFirst) {
            return 1;
        }
        return (this.currentPage - 1) * this.pagination.perPage + 1;
    };
    PaginatorPlugin.prototype.getTo = function () {
        if (this.isLast) {
            return this.pagination.total;
        }
        return this.currentPage * this.pagination.perPage;
    };
    /**
     * Select the page
     */
    PaginatorPlugin.prototype.selectPage = function (page) {
        var _this = this;
        return this.query.selectAll({ asObject: true }).pipe(take(1), map_map(function (entities) {
            var response = tslib_es6_assign({}, _this.pagination, { data: _this.pages.get(page).ids.map(function (id) { return entities[id]; }) });
            var _a = _this.config, range = _a.range, pagesControls = _a.pagesControls;
            /** If no total - calc it */
            if (isNaN(_this.pagination.total)) {
                if (response.lastPage === 1) {
                    response.total = response.data ? response.data.length : 0;
                }
                else {
                    response.total = response.perPage * response.lastPage;
                }
                _this.pagination.total = response.total;
            }
            if (range) {
                response.from = _this.getFrom();
                response.to = _this.getTo();
            }
            if (pagesControls) {
                response.pageControls = generatePages(_this.pagination.total, _this.pagination.perPage);
            }
            return response;
        }));
    };
    __decorate([
        action('@Pagination - New Page'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], PaginatorPlugin.prototype, "update", null);
    return PaginatorPlugin;
}(AkitaPlugin));
/**
 * Generate an array so we can ngFor them to navigate between pages
 */
function generatePages(total, perPage) {
    var len = Math.ceil(total / perPage);
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr.push(i + 1);
    }
    return arr;
}
/** backward compatibility */
var Paginator = (/* unused pure expression or super */ null && (PaginatorPlugin));

var PersistNgFormPlugin = /** @class */ (function (_super) {
    __extends(PersistNgFormPlugin, _super);
    function PersistNgFormPlugin(query, factoryFnOrPath, params) {
        if (params === void 0) { params = {}; }
        var _this = _super.call(this, query) || this;
        _this.query = query;
        _this.factoryFnOrPath = factoryFnOrPath;
        _this.params = params;
        _this.params = tslib_es6_assign({ debounceTime: 300, formKey: 'akitaForm', emitEvent: false, arrControlFactory: function (v) { return _this.builder.control(v); } }, params);
        _this.isRootKeys = toBoolean(factoryFnOrPath) === false;
        _this.isKeyBased = isString(factoryFnOrPath) || _this.isRootKeys;
        return _this;
    }
    PersistNgFormPlugin.prototype.setForm = function (form, builder) {
        this.form = form;
        this.builder = builder;
        this.activate();
        return this;
    };
    PersistNgFormPlugin.prototype.reset = function (initialState) {
        var _this = this;
        var _a;
        var value;
        if (initialState) {
            value = initialState;
        }
        else {
            value = this.isKeyBased ? this.initialValue : this.factoryFnOrPath();
        }
        if (this.isKeyBased) {
            Object.keys(this.initialValue).forEach(function (stateKey) {
                var value = _this.initialValue[stateKey];
                if (Array.isArray(value) && _this.builder) {
                    var formArray = _this.form.controls[stateKey];
                    _this.cleanArray(formArray);
                    value.forEach(function (v, i) {
                        _this.form.get(stateKey).insert(i, _this.params.arrControlFactory(v));
                    });
                }
            });
        }
        this.form.patchValue(value, { emitEvent: this.params.emitEvent });
        var storeValue = this.isKeyBased ? setValue(this.getQuery().getValue(), this.getStore().storeName + "." + this.factoryFnOrPath, value) : (_a = {}, _a[this.params.formKey] = value, _a);
        this.updateStore(storeValue);
    };
    PersistNgFormPlugin.prototype.cleanArray = function (control) {
        while (control.length !== 0) {
            control.removeAt(0);
        }
    };
    PersistNgFormPlugin.prototype.resolveInitialValue = function (formValue, root) {
        var _this = this;
        if (!formValue)
            return;
        return Object.keys(formValue).reduce(function (acc, stateKey) {
            var value = root[stateKey];
            if (Array.isArray(value) && _this.builder) {
                var factory_1 = _this.params.arrControlFactory;
                _this.cleanArray(_this.form.get(stateKey));
                value.forEach(function (v, i) {
                    _this.form.get(stateKey).insert(i, factory_1(v));
                });
            }
            acc[stateKey] = root[stateKey];
            return acc;
        }, {});
    };
    PersistNgFormPlugin.prototype.activate = function () {
        var _this = this;
        var _a;
        var path;
        if (this.isKeyBased) {
            if (this.isRootKeys) {
                this.initialValue = this.resolveInitialValue(this.form.value, this.getQuery().getValue());
                this.form.patchValue(this.initialValue, { emitEvent: this.params.emitEvent });
            }
            else {
                path = this.getStore().storeName + "." + this.factoryFnOrPath;
                var root = getValue(this.getQuery().getValue(), path);
                this.initialValue = this.resolveInitialValue(root, root);
                this.form.patchValue(this.initialValue, { emitEvent: this.params.emitEvent });
            }
        }
        else {
            if (!this.getQuery().getValue()[this.params.formKey]) {
                logAction('@PersistNgFormPlugin activate');
                this.updateStore((_a = {}, _a[this.params.formKey] = this.factoryFnOrPath(), _a));
            }
            var value = this.getQuery().getValue()[this.params.formKey];
            this.form.patchValue(value);
        }
        this.formChanges = this.form.valueChanges.pipe(debounceTime(this.params.debounceTime)).subscribe(function (value) {
            logAction('@PersistForm - Update');
            var newState;
            if (_this.isKeyBased) {
                if (_this.isRootKeys) {
                    newState = function (state) { return (tslib_es6_assign({}, state, value)); };
                }
                else {
                    newState = function (state) { return setValue(state, path, value); };
                }
            }
            else {
                newState = function () {
                    var _a;
                    return (_a = {}, _a[_this.params.formKey] = value, _a);
                };
            }
            _this.updateStore(newState(_this.getQuery().getValue()));
        });
    };
    PersistNgFormPlugin.prototype.destroy = function () {
        this.formChanges && this.formChanges.unsubscribe();
        this.form = null;
        this.builder = null;
    };
    return PersistNgFormPlugin;
}(AkitaPlugin));

// @internal
function capitalize(value) {
    return value && value.charAt(0).toUpperCase() + value.slice(1);
}

var subs = (/* unused pure expression or super */ null && ([]));
function akitaDevtools(ngZoneOrOptions, options) {
    if (options === void 0) { options = {}; }
    if (isNotBrowser)
        return;
    if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
        return;
    }
    subs.length &&
        subs.forEach(function (s) {
            if (s.unsubscribe) {
                s.unsubscribe();
            }
            else {
                s && s();
            }
        });
    var isAngular = ngZoneOrOptions && ngZoneOrOptions['run'];
    if (!isAngular) {
        ngZoneOrOptions = ngZoneOrOptions || {};
        ngZoneOrOptions.run = function (cb) { return cb(); };
        options = ngZoneOrOptions;
    }
    var defaultOptions = { name: 'Akita', shallow: true, storesWhitelist: [] };
    var merged = Object.assign({}, defaultOptions, options);
    var storesWhitelist = merged.storesWhitelist;
    var devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(merged);
    var appState = {};
    var isAllowed = function (storeName) {
        if (!storesWhitelist.length) {
            return true;
        }
        return storesWhitelist.indexOf(storeName) > -1;
    };
    subs.push($$addStore.subscribe(function (storeName) {
        var _a;
        if (isAllowed(storeName) === false)
            return;
        appState = __assign({}, appState, (_a = {}, _a[storeName] = __stores__[storeName]._value(), _a));
        devTools.send({ type: "[" + capitalize(storeName) + "] - @@INIT" }, appState);
    }));
    subs.push($$deleteStore.subscribe(function (storeName) {
        if (isAllowed(storeName) === false)
            return;
        delete appState[storeName];
        devTools.send({ type: "[" + storeName + "] - Delete Store" }, appState);
    }));
    subs.push($$updateStore.subscribe(function (_a) {
        var storeName = _a.storeName, action = _a.action;
        var _b;
        if (isAllowed(storeName) === false)
            return;
        var type = action.type, entityIds = action.entityIds, skip = action.skip;
        if (skip) {
            setSkipAction(false);
            return;
        }
        var store = __stores__[storeName];
        if (!store) {
            return;
        }
        if (options.shallow === false && appState[storeName]) {
            var isEqual = JSON.stringify(store._value()) === JSON.stringify(appState[storeName]);
            if (isEqual)
                return;
        }
        appState = __assign({}, appState, (_b = {}, _b[storeName] = store._value(), _b));
        var normalize = capitalize(storeName);
        var msg = isDefined(entityIds) ? "[" + normalize + "] - " + type + " (ids: " + entityIds + ")" : "[" + normalize + "] - " + type;
        if (options.logTrace) {
            console.group(msg);
            console.trace();
            console.groupEnd();
        }
        if (options.sortAlphabetically) {
            var sortedAppState = Object.keys(appState)
                .sort()
                .reduce(function (acc, storeName) {
                acc[storeName] = appState[storeName];
                return acc;
            }, {});
            devTools.send({ type: msg }, sortedAppState);
            return;
        }
        devTools.send({ type: msg }, appState);
    }));
    subs.push(devTools.subscribe(function (message) {
        if (message.type === 'DISPATCH') {
            var payloadType = message.payload.type;
            if (payloadType === 'COMMIT') {
                devTools.init(appState);
                return;
            }
            if (message.state) {
                var rootState_1 = JSON.parse(message.state);
                var _loop_1 = function (i, keys) {
                    var storeName = keys[i];
                    if (__stores__[storeName]) {
                        ngZoneOrOptions.run(function () {
                            __stores__[storeName]._setState(function () { return rootState_1[storeName]; }, false);
                        });
                    }
                };
                for (var i = 0, keys = Object.keys(rootState_1); i < keys.length; i++) {
                    _loop_1(i, keys);
                }
            }
        }
    }));
}

/**
 * Each plugin that wants to add support for entities should extend this interface.
 */
var EntityCollectionPlugin = /** @class */ (function () {
    function EntityCollectionPlugin(query, entityIds) {
        this.query = query;
        this.entityIds = entityIds;
        this.entities = new Map();
    }
    /**
     * Get the entity plugin instance.
     */
    EntityCollectionPlugin.prototype.getEntity = function (id) {
        return this.entities.get(id);
    };
    /**
     * Whether the entity plugin exist.
     */
    EntityCollectionPlugin.prototype.hasEntity = function (id) {
        return this.entities.has(id);
    };
    /**
     * Remove the entity plugin instance.
     */
    EntityCollectionPlugin.prototype.removeEntity = function (id) {
        this.destroy(id);
        return this.entities.delete(id);
    };
    /**
     * Set the entity plugin instance.
     */
    EntityCollectionPlugin.prototype.createEntity = function (id, plugin) {
        return this.entities.set(id, plugin);
    };
    /**
     * If the user passes `entityIds` we take them; otherwise, we take all.
     */
    EntityCollectionPlugin.prototype.getIds = function () {
        return isUndefined(this.entityIds) ? this.query.getValue().ids : coerceArray(this.entityIds);
    };
    /**
     * When you call one of the plugin methods, you can pass id/ids or undefined which means all.
     */
    EntityCollectionPlugin.prototype.resolvedIds = function (ids) {
        return isUndefined(ids) ? this.getIds() : coerceArray(ids);
    };
    /**
     * Call this method when you want to activate the plugin on init or when you need to listen to add/remove of entities dynamically.
     *
     * For example in your plugin you may do the following:
     *
     * this.query.select(state => state.ids).pipe(skip(1)).subscribe(ids => this.activate(ids));
     */
    EntityCollectionPlugin.prototype.rebase = function (ids, actions) {
        var _this = this;
        if (actions === void 0) { actions = {}; }
        /**
         *
         * If the user passes `entityIds` & we have new ids check if we need to add/remove instances.
         *
         * This phase will be called only upon update.
         */
        if (toBoolean(ids)) {
            /**
             * Which means all
             */
            if (isUndefined(this.entityIds)) {
                for (var i = 0, len = ids.length; i < len; i++) {
                    var entityId = ids[i];
                    if (this.hasEntity(entityId) === false) {
                        datorama_akita_isFunction(actions.beforeAdd) && actions.beforeAdd(entityId);
                        var plugin = this.instantiatePlugin(entityId);
                        this.entities.set(entityId, plugin);
                        datorama_akita_isFunction(actions.afterAdd) && actions.afterAdd(plugin);
                    }
                }
                this.entities.forEach(function (plugin, entityId) {
                    if (ids.indexOf(entityId) === -1) {
                        datorama_akita_isFunction(actions.beforeRemove) && actions.beforeRemove(plugin);
                        _this.removeEntity(entityId);
                    }
                });
            }
            else {
                /**
                 * Which means the user passes specific ids
                 */
                var _ids = coerceArray(this.entityIds);
                for (var i = 0, len = _ids.length; i < len; i++) {
                    var entityId = _ids[i];
                    /** The Entity in current ids and doesn't exist, add it. */
                    if (ids.indexOf(entityId) > -1 && this.hasEntity(entityId) === false) {
                        datorama_akita_isFunction(actions.beforeAdd) && actions.beforeAdd(entityId);
                        var plugin = this.instantiatePlugin(entityId);
                        this.entities.set(entityId, plugin);
                        datorama_akita_isFunction(actions.afterAdd) && actions.afterAdd(plugin);
                    }
                    else {
                        this.entities.forEach(function (plugin, entityId) {
                            /** The Entity not in current ids and exists, remove it. */
                            if (ids.indexOf(entityId) === -1 && _this.hasEntity(entityId) === true) {
                                datorama_akita_isFunction(actions.beforeRemove) && actions.beforeRemove(plugin);
                                _this.removeEntity(entityId);
                            }
                        });
                    }
                }
            }
        }
        else {
            /**
             * Otherwise, start with the provided ids or all.
             */
            this.getIds().forEach(function (id) {
                if (!_this.hasEntity(id))
                    _this.createEntity(id, _this.instantiatePlugin(id));
            });
        }
    };
    /**
     * Listen for add/remove entities.
     */
    EntityCollectionPlugin.prototype.selectIds = function () {
        return this.query.select(function (state) { return state.ids; });
    };
    /**
     * Base method for activation, you can override it if you need to.
     */
    EntityCollectionPlugin.prototype.activate = function (ids) {
        this.rebase(ids);
    };
    /**
     * Loop over each id and invoke the plugin method.
     */
    EntityCollectionPlugin.prototype.forEachId = function (ids, cb) {
        var _ids = this.resolvedIds(ids);
        for (var i = 0, len = _ids.length; i < len; i++) {
            var id = _ids[i];
            if (this.hasEntity(id)) {
                cb(this.getEntity(id));
            }
        }
    };
    return EntityCollectionPlugin;
}());

var StateHistoryPlugin = /** @class */ (function (_super) {
    __extends(StateHistoryPlugin, _super);
    function StateHistoryPlugin(query, params, _entityId) {
        if (params === void 0) { params = {}; }
        var _this = _super.call(this, query, {
            resetFn: function () { return _this.clear(); }
        }) || this;
        _this.query = query;
        _this.params = params;
        _this._entityId = _entityId;
        /** Allow skipping an update from outside */
        _this.skip = false;
        _this.history = {
            past: [],
            present: null,
            future: []
        };
        /** Skip the update when redo/undo */
        _this.skipUpdate = false;
        params.maxAge = !!params.maxAge ? params.maxAge : 10;
        params.comparator = params.comparator || (function () { return true; });
        _this.activate();
        return _this;
    }
    Object.defineProperty(StateHistoryPlugin.prototype, "hasPast$", {
        /**
         * Observable stream representing whether the history plugin has an available past
         *
         */
        get: function () {
            return this._hasPast$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateHistoryPlugin.prototype, "hasFuture$", {
        /**
         * Observable stream representing whether the history plugin has an available future
         *
         */
        get: function () {
            return this._hasFuture$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateHistoryPlugin.prototype, "hasPast", {
        get: function () {
            return this.history.past.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateHistoryPlugin.prototype, "hasFuture", {
        get: function () {
            return this.history.future.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateHistoryPlugin.prototype, "property", {
        get: function () {
            return this.params.watchProperty;
        },
        enumerable: true,
        configurable: true
    });
    /* Updates the hasPast$ hasFuture$ observables*/
    StateHistoryPlugin.prototype.updateHasHistory = function () {
        this.hasFutureSubject.next(this.hasFuture);
        this.hasPastSubject.next(this.hasPast);
    };
    StateHistoryPlugin.prototype.activate = function () {
        var _this = this;
        this.hasPastSubject = new BehaviorSubject(false);
        this._hasPast$ = this.hasPastSubject.asObservable().pipe(distinctUntilChanged());
        this.hasFutureSubject = new BehaviorSubject(false);
        this._hasFuture$ = this.hasFutureSubject.asObservable().pipe(distinctUntilChanged());
        this.history.present = this.getSource(this._entityId, this.property);
        this.subscription = this
            .selectSource(this._entityId, this.property)
            .pipe(pairwise())
            .subscribe(function (_a) {
            var _b = __read(_a, 2), past = _b[0], present = _b[1];
            if (_this.skip) {
                _this.skip = false;
                return;
            }
            /**
             *  comparator: (prev, current) => isEqual(prev, current) === false
             */
            var shouldUpdate = _this.params.comparator(past, present);
            if (!_this.skipUpdate && shouldUpdate) {
                if (_this.history.past.length === _this.params.maxAge) {
                    _this.history.past = _this.history.past.slice(1);
                }
                _this.history.past = tslib_es6_spread(_this.history.past, [past]);
                _this.history.present = present;
                _this.updateHasHistory();
            }
        });
    };
    StateHistoryPlugin.prototype.undo = function () {
        if (this.history.past.length > 0) {
            var _a = this.history, past = _a.past, present = _a.present;
            var previous = past[past.length - 1];
            this.history.past = past.slice(0, past.length - 1);
            this.history.present = previous;
            this.history.future = tslib_es6_spread([present], this.history.future);
            this.update();
        }
    };
    StateHistoryPlugin.prototype.redo = function () {
        if (this.history.future.length > 0) {
            var _a = this.history, past = _a.past, present = _a.present;
            var next = this.history.future[0];
            var newFuture = this.history.future.slice(1);
            this.history.past = tslib_es6_spread(past, [present]);
            this.history.present = next;
            this.history.future = newFuture;
            this.update('Redo');
        }
    };
    StateHistoryPlugin.prototype.jumpToPast = function (index) {
        if (index < 0 || index >= this.history.past.length)
            return;
        var _a = this.history, past = _a.past, future = _a.future, present = _a.present;
        /**
         *
         * const past = [1, 2, 3, 4, 5];
         * const present = 6;
         * const future = [7, 8, 9];
         * const index = 2;
         *
         * newPast = past.slice(0, index) = [1, 2];
         * newPresent = past[index] = 3;
         * newFuture = [...past.slice(index + 1),present, ...future] = [4, 5, 6, 7, 8, 9];
         *
         */
        var newPast = past.slice(0, index);
        var newFuture = tslib_es6_spread(past.slice(index + 1), [present], future);
        var newPresent = past[index];
        this.history.past = newPast;
        this.history.present = newPresent;
        this.history.future = newFuture;
        this.update();
    };
    StateHistoryPlugin.prototype.jumpToFuture = function (index) {
        if (index < 0 || index >= this.history.future.length)
            return;
        var _a = this.history, past = _a.past, future = _a.future, present = _a.present;
        /**
         *
         * const past = [1, 2, 3, 4, 5];
         * const present = 6;
         * const future = [7, 8, 9, 10]
         * const index = 1
         *
         * newPast = [...past, present, ...future.slice(0, index) = [1, 2, 3, 4, 5, 6, 7];
         * newPresent = future[index] = 8;
         * newFuture = futrue.slice(index+1) = [9, 10];
         *
         */
        var newPast = tslib_es6_spread(past, [present], future.slice(0, index));
        var newPresent = future[index];
        var newFuture = future.slice(index + 1);
        this.history.past = newPast;
        this.history.present = newPresent;
        this.history.future = newFuture;
        this.update('Redo');
    };
    /**
     *
     * jump n steps in the past or forward
     *
     */
    StateHistoryPlugin.prototype.jump = function (n) {
        if (n > 0)
            return this.jumpToFuture(n - 1);
        if (n < 0)
            return this.jumpToPast(this.history.past.length + n);
    };
    /**
     * Clear the history
     *
     * @param customUpdateFn Callback function for only clearing part of the history
     *
     * @example
     *
     * stateHistory.clear((history) => {
     *  return {
     *    past: history.past,
     *    present: history.present,
     *    future: []
     *  };
     * });
     */
    StateHistoryPlugin.prototype.clear = function (customUpdateFn) {
        this.history = datorama_akita_isFunction(customUpdateFn)
            ? customUpdateFn(this.history)
            : {
                past: [],
                present: null,
                future: []
            };
        this.updateHasHistory();
    };
    StateHistoryPlugin.prototype.destroy = function (clearHistory) {
        if (clearHistory === void 0) { clearHistory = false; }
        if (clearHistory) {
            this.clear();
        }
        this.subscription.unsubscribe();
    };
    StateHistoryPlugin.prototype.ignoreNext = function () {
        this.skip = true;
    };
    StateHistoryPlugin.prototype.update = function (action) {
        if (action === void 0) { action = 'Undo'; }
        this.skipUpdate = true;
        logAction("@StateHistory - " + action);
        this.updateStore(this.history.present, this._entityId, this.property);
        this.updateHasHistory();
        this.skipUpdate = false;
    };
    return StateHistoryPlugin;
}(AkitaPlugin));

var EntityStateHistoryPlugin = /** @class */ (function (_super) {
    __extends(EntityStateHistoryPlugin, _super);
    function EntityStateHistoryPlugin(query, params) {
        if (params === void 0) { params = {}; }
        var _this = _super.call(this, query, params.entityIds) || this;
        _this.query = query;
        _this.params = params;
        params.maxAge = toBoolean(params.maxAge) ? params.maxAge : 10;
        _this.activate();
        _this.selectIds()
            .pipe(skip_skip(1))
            .subscribe(function (ids) { return _this.activate(ids); });
        return _this;
    }
    EntityStateHistoryPlugin.prototype.redo = function (ids) {
        this.forEachId(ids, function (e) { return e.redo(); });
    };
    EntityStateHistoryPlugin.prototype.undo = function (ids) {
        this.forEachId(ids, function (e) { return e.undo(); });
    };
    EntityStateHistoryPlugin.prototype.hasPast = function (id) {
        if (this.hasEntity(id)) {
            return this.getEntity(id).hasPast;
        }
    };
    EntityStateHistoryPlugin.prototype.hasFuture = function (id) {
        if (this.hasEntity(id)) {
            return this.getEntity(id).hasFuture;
        }
    };
    EntityStateHistoryPlugin.prototype.jumpToFuture = function (ids, index) {
        this.forEachId(ids, function (e) { return e.jumpToFuture(index); });
    };
    EntityStateHistoryPlugin.prototype.jumpToPast = function (ids, index) {
        this.forEachId(ids, function (e) { return e.jumpToPast(index); });
    };
    EntityStateHistoryPlugin.prototype.clear = function (ids) {
        this.forEachId(ids, function (e) { return e.clear(); });
    };
    EntityStateHistoryPlugin.prototype.destroy = function (ids, clearHistory) {
        if (clearHistory === void 0) { clearHistory = false; }
        this.forEachId(ids, function (e) { return e.destroy(clearHistory); });
    };
    EntityStateHistoryPlugin.prototype.ignoreNext = function (ids) {
        this.forEachId(ids, function (e) { return e.ignoreNext(); });
    };
    EntityStateHistoryPlugin.prototype.instantiatePlugin = function (id) {
        return new StateHistoryPlugin(this.query, this.params, id);
    };
    return EntityStateHistoryPlugin;
}(EntityCollectionPlugin));

var ɵ0 = function (head, current) { return JSON.stringify(head) !== JSON.stringify(current); };
var dirtyCheckDefaultParams = {
    comparator: ɵ0
};
function getNestedPath(nestedObj, path) {
    var pathAsArray = path.split('.');
    return pathAsArray.reduce(function (obj, key) { return (obj && obj[key] !== 'undefined' ? obj[key] : undefined); }, nestedObj);
}
var DirtyCheckPlugin = /** @class */ (function (_super) {
    __extends(DirtyCheckPlugin, _super);
    function DirtyCheckPlugin(query, params, _entityId) {
        var _this = _super.call(this, query) || this;
        _this.query = query;
        _this.params = params;
        _this._entityId = _entityId;
        _this.dirty = new BehaviorSubject(false);
        _this.active = false;
        _this._reset = new Subject();
        _this.isDirty$ = _this.dirty.asObservable().pipe(distinctUntilChanged());
        _this.reset$ = _this._reset.asObservable();
        _this.params = tslib_es6_assign({}, dirtyCheckDefaultParams, params);
        if (_this.params.watchProperty) {
            var watchProp = coerceArray(_this.params.watchProperty);
            if (query instanceof QueryEntity && watchProp.includes('entities') && !watchProp.includes('ids')) {
                watchProp.push('ids');
            }
            _this.params.watchProperty = watchProp;
        }
        return _this;
    }
    DirtyCheckPlugin.prototype.reset = function (params) {
        if (params === void 0) { params = {}; }
        var currentValue = this.head;
        if (datorama_akita_isFunction(params.updateFn)) {
            if (this.isEntityBased(this._entityId)) {
                currentValue = params.updateFn(this.head, this.getQuery().getEntity(this._entityId));
            }
            else {
                currentValue = params.updateFn(this.head, this.getQuery().getValue());
            }
        }
        logAction("@DirtyCheck - Revert");
        this.updateStore(currentValue, this._entityId);
        this._reset.next();
    };
    DirtyCheckPlugin.prototype.setHead = function () {
        if (!this.active) {
            this.activate();
            this.active = true;
        }
        else {
            this.head = this._getHead();
        }
        this.updateDirtiness(false);
        return this;
    };
    DirtyCheckPlugin.prototype.isDirty = function () {
        return !!this.dirty.value;
    };
    DirtyCheckPlugin.prototype.hasHead = function () {
        return !!this.getHead();
    };
    DirtyCheckPlugin.prototype.destroy = function () {
        this.head = null;
        this.subscription && this.subscription.unsubscribe();
        this._reset && this._reset.complete();
    };
    DirtyCheckPlugin.prototype.isPathDirty = function (path) {
        var head = this.getHead();
        var current = this.getQuery().getValue();
        var currentPathValue = getNestedPath(current, path);
        var headPathValue = getNestedPath(head, path);
        return this.params.comparator(currentPathValue, headPathValue);
    };
    DirtyCheckPlugin.prototype.getHead = function () {
        return this.head;
    };
    DirtyCheckPlugin.prototype.activate = function () {
        var _this = this;
        this.head = this._getHead();
        /** if we are tracking specific properties select only the relevant ones */
        var source = this.params.watchProperty
            ? this.params.watchProperty.map(function (prop) {
                return _this.query
                    .select(function (state) { return state[prop]; })
                    .pipe(map_map(function (val) { return ({
                    val: val,
                    __akitaKey: prop
                }); }));
            })
            : [this.selectSource(this._entityId)];
        this.subscription = combineLatest_combineLatest.apply(void 0, tslib_es6_spread(source)).pipe(skip_skip(1))
            .subscribe(function (currentState) {
            if (isUndefined(_this.head))
                return;
            /** __akitaKey is used to determine if we are tracking a specific property or a store change */
            var isChange = currentState.some(function (state) {
                var head = state.__akitaKey ? _this.head[state.__akitaKey] : _this.head;
                var compareTo = state.__akitaKey ? state.val : state;
                return _this.params.comparator(head, compareTo);
            });
            _this.updateDirtiness(isChange);
        });
    };
    DirtyCheckPlugin.prototype.updateDirtiness = function (isDirty) {
        this.dirty.next(isDirty);
    };
    DirtyCheckPlugin.prototype._getHead = function () {
        var head = this.getSource(this._entityId);
        if (this.params.watchProperty) {
            head = this.getWatchedValues(head);
        }
        return head;
    };
    DirtyCheckPlugin.prototype.getWatchedValues = function (source) {
        return this.params.watchProperty.reduce(function (watched, prop) {
            watched[prop] = source[prop];
            return watched;
        }, {});
    };
    return DirtyCheckPlugin;
}(AkitaPlugin));

var EntityDirtyCheckPlugin = /** @class */ (function (_super) {
    __extends(EntityDirtyCheckPlugin, _super);
    function EntityDirtyCheckPlugin(query, params) {
        if (params === void 0) { params = {}; }
        var _this = _super.call(this, query, params.entityIds) || this;
        _this.query = query;
        _this.params = params;
        _this._someDirty = new Subject();
        _this.someDirty$ = merge(_this.query.select(function (state) { return state.entities; }), _this._someDirty.asObservable()).pipe(auditTime_auditTime(0), map_map(function () { return _this.checkSomeDirty(); }));
        _this.params = tslib_es6_assign({}, dirtyCheckDefaultParams, params);
        // TODO lazy activate?
        _this.activate();
        _this.selectIds()
            .pipe(skip_skip(1))
            .subscribe(function (ids) {
            _super.prototype.rebase.call(_this, ids, { afterAdd: function (plugin) { return plugin.setHead(); } });
        });
        return _this;
    }
    EntityDirtyCheckPlugin.prototype.setHead = function (ids) {
        if (this.params.entityIds && ids) {
            var toArray_1 = coerceArray(ids);
            var someAreWatched = coerceArray(this.params.entityIds).some(function (id) { return toArray_1.indexOf(id) > -1; });
            if (someAreWatched === false) {
                return this;
            }
        }
        this.forEachId(ids, function (e) { return e.setHead(); });
        this._someDirty.next();
        return this;
    };
    EntityDirtyCheckPlugin.prototype.hasHead = function (id) {
        if (this.entities.has(id)) {
            var entity = this.getEntity(id);
            return entity.hasHead();
        }
        return false;
    };
    EntityDirtyCheckPlugin.prototype.reset = function (ids, params) {
        if (params === void 0) { params = {}; }
        this.forEachId(ids, function (e) { return e.reset(params); });
    };
    EntityDirtyCheckPlugin.prototype.isDirty = function (id, asObservable) {
        if (asObservable === void 0) { asObservable = true; }
        if (this.entities.has(id)) {
            var entity = this.getEntity(id);
            return asObservable ? entity.isDirty$ : entity.isDirty();
        }
        return false;
    };
    EntityDirtyCheckPlugin.prototype.someDirty = function () {
        return this.checkSomeDirty();
    };
    EntityDirtyCheckPlugin.prototype.isPathDirty = function (id, path) {
        if (this.entities.has(id)) {
            var head = this.getEntity(id).getHead();
            var current = this.query.getEntity(id);
            var currentPathValue = getNestedPath(current, path);
            var headPathValue = getNestedPath(head, path);
            return this.params.comparator(currentPathValue, headPathValue);
        }
        return null;
    };
    EntityDirtyCheckPlugin.prototype.destroy = function (ids) {
        this.forEachId(ids, function (e) { return e.destroy(); });
        /** complete only when the plugin destroys */
        if (!ids) {
            this._someDirty.complete();
        }
    };
    EntityDirtyCheckPlugin.prototype.instantiatePlugin = function (id) {
        return new DirtyCheckPlugin(this.query, this.params, id);
    };
    EntityDirtyCheckPlugin.prototype.checkSomeDirty = function () {
        var e_1, _a;
        var entitiesIds = this.resolvedIds();
        try {
            for (var entitiesIds_1 = tslib_es6_values(entitiesIds), entitiesIds_1_1 = entitiesIds_1.next(); !entitiesIds_1_1.done; entitiesIds_1_1 = entitiesIds_1.next()) {
                var id = entitiesIds_1_1.value;
                if (this.getEntity(id).isDirty()) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (entitiesIds_1_1 && !entitiesIds_1_1.done && (_a = entitiesIds_1.return)) _a.call(entitiesIds_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    };
    return EntityDirtyCheckPlugin;
}(EntityCollectionPlugin));

/**
 * Generate random guid
 *
 * @example
 *
 * {
 *   id: guid()
 * }
 *
 * @remarks this isn't a GUID, but a 10 char random alpha-num
 */
function guid() {
    return Math.random()
        .toString(36)
        .slice(2);
}

// @internal
function toEntitiesIds(entities, idKey) {
    if (idKey === void 0) { idKey = DEFAULT_ID_KEY; }
    var e_1, _a;
    var ids = [];
    try {
        for (var entities_1 = __values(entities), entities_1_1 = entities_1.next(); !entities_1_1.done; entities_1_1 = entities_1.next()) {
            var entity = entities_1_1.value;
            ids.push(entity[idKey]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (entities_1_1 && !entities_1_1.done && (_a = entities_1.return)) _a.call(entities_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return ids;
}

/**
 * Reset stores back to their initial state
 *
 * @example
 *
 * resetStores()
 * resetStores({
 *   exclude: ['auth']
 * })
 */
function resetStores(options) {
    var defaults = {
        exclude: []
    };
    options = Object.assign({}, defaults, options);
    var stores = Object.keys(__stores__);
    applyTransaction(function () {
        var e_1, _a;
        try {
            for (var stores_1 = __values(stores), stores_1_1 = stores_1.next(); !stores_1_1.done; stores_1_1 = stores_1.next()) {
                var store = stores_1_1.value;
                var s = __stores__[store];
                if (!options.exclude) {
                    s.reset();
                }
                else {
                    if (options.exclude.indexOf(s.storeName) === -1) {
                        s.reset();
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (stores_1_1 && !stores_1_1.done && (_a = stores_1.return)) _a.call(stores_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}

// @internal
function isNumber(value) {
    return !datorama_akita_isArray(value) && value - parseFloat(value) + 1 >= 0;
}

var _a, _b;
var StoreAction;
(function (StoreAction) {
    StoreAction["Update"] = "UPDATE";
})(StoreAction || (StoreAction = {}));
var StoreActionMapping = (_a = {},
    _a[StoreAction.Update] = 'update',
    _a);
var EntityStoreAction;
(function (EntityStoreAction) {
    EntityStoreAction["Update"] = "UPDATE";
    EntityStoreAction["AddEntities"] = "ADD_ENTITIES";
    EntityStoreAction["SetEntities"] = "SET_ENTITIES";
    EntityStoreAction["UpdateEntities"] = "UPDATE_ENTITIES";
    EntityStoreAction["RemoveEntities"] = "REMOVE_ENTITIES";
    EntityStoreAction["UpsertEntities"] = "UPSERT_ENTITIES";
    EntityStoreAction["UpsertManyEntities"] = "UPSERT_MANY_ENTITIES";
})(EntityStoreAction || (EntityStoreAction = {}));
var EntityStoreActionMapping = (_b = {},
    _b[EntityStoreAction.Update] = 'update',
    _b[EntityStoreAction.AddEntities] = 'add',
    _b[EntityStoreAction.SetEntities] = 'set',
    _b[EntityStoreAction.UpdateEntities] = 'update',
    _b[EntityStoreAction.RemoveEntities] = 'remove',
    _b[EntityStoreAction.UpsertEntities] = 'upsert',
    _b[EntityStoreAction.UpsertManyEntities] = 'upsertMany',
    _b);
/**
 * Get a {@link Store} from the global store registry.
 * @param storeClass The {@link Store} class of the instance to be returned.
 */
function getStore(storeClass) {
    return getStoreByName(storeClass[configKey]['storeName']);
}
/**
 * Get a {@link Store} from the global store registry.
 * @param storeName The {@link Store} name of the instance to be returned.
 */
function getStoreByName(storeName) {
    var store = __stores__[storeName];
    if (isNil(store)) {
        throw new AkitaError(store + " doesn't exist");
    }
    return store;
}
/**
 * Get a {@link EntityStore} from the global store registry.
 * @param storeClass The {@link EntityStore} class of the instance to be returned.
 */
function getEntityStore(storeClass) {
    return getStore(storeClass);
}
/**
 * Get a {@link EntityStore} from the global store registry.
 * @param storeName The {@link EntityStore} name of the instance to be returned.
 */
function getEntityStoreByName(storeName) {
    return getStoreByName(storeName);
}
function runStoreAction(storeClassOrName, action, operation) {
    var store = typeof storeClassOrName === 'string' ? getStoreByName(storeClassOrName) : getStore(storeClassOrName);
    operation(store[StoreActionMapping[action]].bind(store));
}
function runEntityStoreAction(storeClassOrName, action, operation) {
    var store = typeof storeClassOrName === 'string' ? getEntityStoreByName(storeClassOrName) : getEntityStore(storeClassOrName);
    operation(store[EntityStoreActionMapping[action]].bind(store));
}

/**
 * Update item in a collection
 *
 * @example
 *
 *
 * store.update(1, entity => ({
 *   comments: arrayUpdate(entity.comments, 1, { name: 'newComment' })
 * }))
 */
function arrayUpdate(arr, predicateOrIds, obj, idKey) {
    if (idKey === void 0) { idKey = DEFAULT_ID_KEY; }
    var condition;
    if (datorama_akita_isFunction(predicateOrIds)) {
        condition = predicateOrIds;
    }
    else {
        var ids_1 = coerceArray(predicateOrIds);
        condition = function (item) { return ids_1.includes(datorama_akita_isObject(item) ? item[idKey] : item) === true; };
    }
    var updateFn = function (state) {
        return state.map(function (entity, index) {
            if (condition(entity, index) === true) {
                return datorama_akita_isObject(entity)
                    ? __assign({}, entity, obj) : obj;
            }
            return entity;
        });
    };
    return updateFn(arr);
}

/**
 * Add item to a collection
 *
 * @example
 *
 *
 * store.update(state => ({
 *   comments: arrayAdd(state.comments, { id: 2 })
 * }))
 *
 */
function arrayAdd(arr, newEntity, options) {
    if (options === void 0) { options = {}; }
    var newEntities = coerceArray(newEntity);
    var toArr = arr || [];
    return options.prepend ? __spread(newEntities, toArr) : __spread(toArr, newEntities);
}

/**
 * Upsert item in a collection
 *
 * @example
 *
 *
 * store.update(1, entity => ({
 *   comments: arrayUpsert(entity.comments, 1, { name: 'newComment' })
 * }))
 */
function arrayUpsert(arr, id, obj, idKey) {
    if (idKey === void 0) { idKey = DEFAULT_ID_KEY; }
    var _a;
    var entityIsObject = datorama_akita_isObject(obj);
    var entityExists = arr.some(function (entity) { return (entityIsObject ? entity[idKey] === id : entity === id); });
    if (entityExists) {
        return arrayUpdate(arr, id, obj, idKey);
    }
    else {
        return arrayAdd(arr, entityIsObject ? __assign({}, obj, (_a = {}, _a[idKey] = id, _a)) : obj);
    }
}

// @internal
function not(pred) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return !pred.apply(void 0, __spread(args));
    };
}

/**
 * Remove item from collection
 *
 * @example
 *
 *
 * store.update(state => ({
 *   names: arrayRemove(state.names, ['one', 'second'])
 * }))
 */
function arrayRemove(arr, identifier, idKey) {
    if (idKey === void 0) { idKey = DEFAULT_ID_KEY; }
    var identifiers;
    var filterFn;
    if (datorama_akita_isFunction(identifier)) {
        filterFn = not(identifier);
    }
    else {
        identifiers = coerceArray(identifier);
        filterFn = function (current) {
            return identifiers.includes(datorama_akita_isObject(current) ? current[idKey] : current) === false;
        };
    }
    if (Array.isArray(arr)) {
        return arr.filter(filterFn);
    }
}

/**
 * Create an array value comparator for a specific key of the value.
 * @param prop The property of the value to be compared.
 */
function byKey(prop) {
    return function (a, b) { return a[prop] === b[prop]; };
}
/**
 * Create an array value comparator for the id field of an array value.
 */
function byId() {
    return byKey('id');
}
/**
 * Adds or removes a value from an array by comparing its values. If a matching value exists it is removed, otherwise
 * it is added to the array.
 *
 * @param array The array to modify.
 * @param newValue The new value to toggle.
 * @param compare A compare function to determine equality of array values. Default is an equality test by object identity.
 */
function arrayToggle(array, newValue, compare) {
    if (compare === void 0) { compare = function (a, b) { return a === b; }; }
    var index = array.findIndex(function (oldValue) { return compare(newValue, oldValue); });
    return !!~index ? __spread(array.slice(0, index), array.slice(index + 1)) : __spread(array, [newValue]);
}

function createStore(initialState, options) {
    return new Store(initialState, options);
}
function createQuery(store) {
    return new Query(store);
}
function createEntityStore(initialState, options) {
    return new EntityStore(initialState, options);
}
function createEntityQuery(store, options) {
    if (options === void 0) { options = {}; }
    return new QueryEntity(store, options);
}

/**
 *
 * Helper function for checking if we have data in cache
 *
 * export class ProductsService {
 *   constructor(private productsStore: ProductsStore) {}

 *   get(): Observable<void> {
 *     const request = this.http.get().pipe(
 *       tap(this.productsStore.set(response))
 *     );
 *
 *     return cacheable(this.productsStore, request);
 *   }
 * }
 */
function cacheable(store, request$, options) {
    if (options === void 0) { options = { emitNext: false }; }
    if (store._cache().value) {
        return options.emitNext ? of(undefined) : EMPTY;
    }
    return request$;
}

function combineQueries(observables) {
    return combineLatest(observables).pipe(auditTime(0));
}

var EntityService = /** @class */ (function () {
    function EntityService() {
    }
    return EntityService;
}());

function setLoading(store) {
    return function (source) {
        return defer(function () {
            store.setLoading(true);
            return source.pipe(finalize(function () { return store.setLoading(false); }));
        });
    };
}

/**
 * Track id updates of an entity and re-evaluation the query with the changed entity id.
 * Hint: Don't place the operator after other operators in the same pipeline as those will be skipped on
 * re-evaluation. Also, it can't be used with the selection operator, e.g <code>selectEntity(1, e => e.title)</code>
 * @param query The query from which the entity is selected.
 * @example
 *
 *   query.selectEntity(1).pipe(trackIdChanges(query)).subscribe(entity => { ... })
 *
 */
function trackIdChanges(query) {
    return function (source) { return source.lift(new TrackIdChanges(query)); };
}
var TrackIdChanges = /** @class */ (function () {
    function TrackIdChanges(query) {
        this.query = query;
    }
    TrackIdChanges.prototype.call = function (subscriber, source) {
        var _this = this;
        return source
            .pipe(first(), switchMap(function (entity) {
            var currId = entity[_this.query.__store__.config.idKey];
            var pending = false;
            return merge(of_of({ newId: undefined, oldId: currId, pending: false }), _this.query.__store__.selectEntityIdChanges$).pipe(
            // the new id must differ form the old id
            filter_filter(function (change) { return change.oldId === currId; }), 
            // extract the current pending state of the id update
            tap_tap(function (change) { return (pending = change.pending); }), 
            // only update the selection query if the id update is already applied to the store
            filter_filter(function (change) { return change.newId !== currId && !pending; }), 
            // build a selection query for the new entity id
            switchMap(function (change) {
                return _this.query
                    .selectEntity((currId = change.newId || currId))
                    // skip undefined value if pending.
                    .pipe(filter_filter(function () { return !pending; }));
            }));
        }))
            .subscribe(subscriber);
    };
    return TrackIdChanges;
}());

/**
 * Generated bundle index. Do not edit.
 */


//# sourceMappingURL=datorama-akita.js.map

;// CONCATENATED MODULE: ./state/sample.store.js

/*
* A store is used more high level management of data. Data
* that we might want to keep for the whole user session or
* that we want persisted as he revisits 
*/
const sample_store_store = createStore({
  joke: {
    category: '',
    delivery: ''
  }
   }, { name: 'sampleStore' });


;// CONCATENATED MODULE: ./state/sample.query.js



const query = createQuery(sample_store_store);

// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__(669);
;// CONCATENATED MODULE: ./ajax.service.js



async function getJoke() {
    return axios.get('https://sv443.net/jokeapi/v2/joke/Any')
}
;// CONCATENATED MODULE: ./models/joke.model.js
class Joke {
    constructor(options) {
        this.category = options.category;
        this.delivery = options.delivery;
    }
}
;// CONCATENATED MODULE: ./state/sample.service.js




async function update() {
  await Promise.resolve();
  const result = await getJoke();
  sample_store_store.update( state => {
    console.log(state)
    const newJoke = new Joke(result.data);
    console.log('creating joke')
    console.log(newJoke);
    return {
      category: newJoke.category,
      delivery: newJoke.delivery
    }
  });
}

async function remove(id) {
  await Promise.resolve();
  store.remove(id);
}

;// CONCATENATED MODULE: ./state/page.store.js


const initialState = {
  pages: [1,2,3]
};

const pageStore = createEntityStore(initialState, {
  name: 'page'
});

;// CONCATENATED MODULE: ./state/page.query.js



const pageQuery = createEntityQuery(pageStore);

;// CONCATENATED MODULE: ./state/index.js





const sampleStore = query.select();
sampleStore.subscribe(x => {
    console.log(`Subscription fired ${x}`)
    console.log(x)
})
console.log('starting update 1')
update()
console.log('finished update 1')
update()

const state_pageStore = pageQuery.select('pages')

state_pageStore.subscribe(x => console.log(x))
})();

/******/ })()
;
//# sourceMappingURL=main.js.map