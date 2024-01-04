"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@sentry/utils/cjs/is.js
var require_is = __commonJS({
  "node_modules/@sentry/utils/cjs/is.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var objectToString = Object.prototype.toString;
    function isError(wat) {
      switch (objectToString.call(wat)) {
        case "[object Error]":
        case "[object Exception]":
        case "[object DOMException]":
          return true;
        default:
          return isInstanceOf(wat, Error);
      }
    }
    function isBuiltin(wat, className) {
      return objectToString.call(wat) === `[object ${className}]`;
    }
    function isErrorEvent(wat) {
      return isBuiltin(wat, "ErrorEvent");
    }
    function isDOMError(wat) {
      return isBuiltin(wat, "DOMError");
    }
    function isDOMException(wat) {
      return isBuiltin(wat, "DOMException");
    }
    function isString(wat) {
      return isBuiltin(wat, "String");
    }
    function isPrimitive(wat) {
      return wat === null || typeof wat !== "object" && typeof wat !== "function";
    }
    function isPlainObject(wat) {
      return isBuiltin(wat, "Object");
    }
    function isEvent(wat) {
      return typeof Event !== "undefined" && isInstanceOf(wat, Event);
    }
    function isElement(wat) {
      return typeof Element !== "undefined" && isInstanceOf(wat, Element);
    }
    function isRegExp(wat) {
      return isBuiltin(wat, "RegExp");
    }
    function isThenable(wat) {
      return Boolean(wat && wat.then && typeof wat.then === "function");
    }
    function isSyntheticEvent(wat) {
      return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
    }
    function isNaN2(wat) {
      return typeof wat === "number" && wat !== wat;
    }
    function isInstanceOf(wat, base) {
      try {
        return wat instanceof base;
      } catch (_e) {
        return false;
      }
    }
    function isVueViewModel(wat) {
      return !!(typeof wat === "object" && wat !== null && (wat.__isVue || wat._isVue));
    }
    exports.isDOMError = isDOMError;
    exports.isDOMException = isDOMException;
    exports.isElement = isElement;
    exports.isError = isError;
    exports.isErrorEvent = isErrorEvent;
    exports.isEvent = isEvent;
    exports.isInstanceOf = isInstanceOf;
    exports.isNaN = isNaN2;
    exports.isPlainObject = isPlainObject;
    exports.isPrimitive = isPrimitive;
    exports.isRegExp = isRegExp;
    exports.isString = isString;
    exports.isSyntheticEvent = isSyntheticEvent;
    exports.isThenable = isThenable;
    exports.isVueViewModel = isVueViewModel;
  }
});

// node_modules/@sentry/utils/cjs/string.js
var require_string = __commonJS({
  "node_modules/@sentry/utils/cjs/string.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    function truncate(str, max = 0) {
      if (typeof str !== "string" || max === 0) {
        return str;
      }
      return str.length <= max ? str : `${str.slice(0, max)}...`;
    }
    function snipLine(line, colno) {
      let newLine = line;
      const lineLength = newLine.length;
      if (lineLength <= 150) {
        return newLine;
      }
      if (colno > lineLength) {
        colno = lineLength;
      }
      let start = Math.max(colno - 60, 0);
      if (start < 5) {
        start = 0;
      }
      let end = Math.min(start + 140, lineLength);
      if (end > lineLength - 5) {
        end = lineLength;
      }
      if (end === lineLength) {
        start = Math.max(end - 140, 0);
      }
      newLine = newLine.slice(start, end);
      if (start > 0) {
        newLine = `'{snip} ${newLine}`;
      }
      if (end < lineLength) {
        newLine += " {snip}";
      }
      return newLine;
    }
    function safeJoin(input, delimiter) {
      if (!Array.isArray(input)) {
        return "";
      }
      const output = [];
      for (let i = 0; i < input.length; i++) {
        const value = input[i];
        try {
          if (is.isVueViewModel(value)) {
            output.push("[VueViewModel]");
          } else {
            output.push(String(value));
          }
        } catch (e) {
          output.push("[value cannot be serialized]");
        }
      }
      return output.join(delimiter);
    }
    function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
      if (!is.isString(value)) {
        return false;
      }
      if (is.isRegExp(pattern)) {
        return pattern.test(value);
      }
      if (is.isString(pattern)) {
        return requireExactStringMatch ? value === pattern : value.includes(pattern);
      }
      return false;
    }
    function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
      return patterns.some((pattern) => isMatchingPattern(testString, pattern, requireExactStringMatch));
    }
    exports.isMatchingPattern = isMatchingPattern;
    exports.safeJoin = safeJoin;
    exports.snipLine = snipLine;
    exports.stringMatchesSomePattern = stringMatchesSomePattern;
    exports.truncate = truncate;
  }
});

// node_modules/@sentry/utils/cjs/aggregate-errors.js
var require_aggregate_errors = __commonJS({
  "node_modules/@sentry/utils/cjs/aggregate-errors.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    var string = require_string();
    function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, maxValueLimit = 250, key, limit, event, hint) {
      if (!event.exception || !event.exception.values || !hint || !is.isInstanceOf(hint.originalException, Error)) {
        return;
      }
      const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
      if (originalException) {
        event.exception.values = truncateAggregateExceptions(
          aggregateExceptionsFromError(
            exceptionFromErrorImplementation,
            parser,
            limit,
            hint.originalException,
            key,
            event.exception.values,
            originalException,
            0
          ),
          maxValueLimit
        );
      }
    }
    function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error, key, prevExceptions, exception, exceptionId) {
      if (prevExceptions.length >= limit + 1) {
        return prevExceptions;
      }
      let newExceptions = [...prevExceptions];
      if (is.isInstanceOf(error[key], Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId);
        const newException = exceptionFromErrorImplementation(parser, error[key]);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
        newExceptions = aggregateExceptionsFromError(
          exceptionFromErrorImplementation,
          parser,
          limit,
          error[key],
          key,
          [newException, ...newExceptions],
          newException,
          newExceptionId
        );
      }
      if (Array.isArray(error.errors)) {
        error.errors.forEach((childError, i) => {
          if (is.isInstanceOf(childError, Error)) {
            applyExceptionGroupFieldsForParentException(exception, exceptionId);
            const newException = exceptionFromErrorImplementation(parser, childError);
            const newExceptionId = newExceptions.length;
            applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
            newExceptions = aggregateExceptionsFromError(
              exceptionFromErrorImplementation,
              parser,
              limit,
              childError,
              key,
              [newException, ...newExceptions],
              newException,
              newExceptionId
            );
          }
        });
      }
      return newExceptions;
    }
    function applyExceptionGroupFieldsForParentException(exception, exceptionId) {
      exception.mechanism = exception.mechanism || { type: "generic", handled: true };
      exception.mechanism = {
        ...exception.mechanism,
        is_exception_group: true,
        exception_id: exceptionId
      };
    }
    function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
      exception.mechanism = exception.mechanism || { type: "generic", handled: true };
      exception.mechanism = {
        ...exception.mechanism,
        type: "chained",
        source,
        exception_id: exceptionId,
        parent_id: parentId
      };
    }
    function truncateAggregateExceptions(exceptions, maxValueLength) {
      return exceptions.map((exception) => {
        if (exception.value) {
          exception.value = string.truncate(exception.value, maxValueLength);
        }
        return exception;
      });
    }
    exports.applyAggregateErrorsToEvent = applyAggregateErrorsToEvent;
  }
});

// node_modules/@sentry/utils/cjs/worldwide.js
var require_worldwide = __commonJS({
  "node_modules/@sentry/utils/cjs/worldwide.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isGlobalObj(obj) {
      return obj && obj.Math == Math ? obj : void 0;
    }
    var GLOBAL_OBJ3 = typeof globalThis == "object" && isGlobalObj(globalThis) || // eslint-disable-next-line no-restricted-globals
    typeof window == "object" && isGlobalObj(window) || typeof self == "object" && isGlobalObj(self) || typeof global == "object" && isGlobalObj(global) || function() {
      return this;
    }() || {};
    function getGlobalObject() {
      return GLOBAL_OBJ3;
    }
    function getGlobalSingleton(name, creator, obj) {
      const gbl = obj || GLOBAL_OBJ3;
      const __SENTRY__ = gbl.__SENTRY__ = gbl.__SENTRY__ || {};
      const singleton = __SENTRY__[name] || (__SENTRY__[name] = creator());
      return singleton;
    }
    exports.GLOBAL_OBJ = GLOBAL_OBJ3;
    exports.getGlobalObject = getGlobalObject;
    exports.getGlobalSingleton = getGlobalSingleton;
  }
});

// node_modules/@sentry/utils/cjs/browser.js
var require_browser = __commonJS({
  "node_modules/@sentry/utils/cjs/browser.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    var worldwide = require_worldwide();
    var WINDOW = worldwide.getGlobalObject();
    var DEFAULT_MAX_STRING_LENGTH = 80;
    function htmlTreeAsString(elem, options = {}) {
      if (!elem) {
        return "<unknown>";
      }
      try {
        let currentElem = elem;
        const MAX_TRAVERSE_HEIGHT = 5;
        const out = [];
        let height = 0;
        let len = 0;
        const separator = " > ";
        const sepLength = separator.length;
        let nextStr;
        const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
        const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
        while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
          nextStr = _htmlElementAsString(currentElem, keyAttrs);
          if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) {
            break;
          }
          out.push(nextStr);
          len += nextStr.length;
          currentElem = currentElem.parentNode;
        }
        return out.reverse().join(separator);
      } catch (_oO) {
        return "<unknown>";
      }
    }
    function _htmlElementAsString(el, keyAttrs) {
      const elem = el;
      const out = [];
      let className;
      let classes;
      let key;
      let attr;
      let i;
      if (!elem || !elem.tagName) {
        return "";
      }
      out.push(elem.tagName.toLowerCase());
      const keyAttrPairs = keyAttrs && keyAttrs.length ? keyAttrs.filter((keyAttr) => elem.getAttribute(keyAttr)).map((keyAttr) => [keyAttr, elem.getAttribute(keyAttr)]) : null;
      if (keyAttrPairs && keyAttrPairs.length) {
        keyAttrPairs.forEach((keyAttrPair) => {
          out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
        });
      } else {
        if (elem.id) {
          out.push(`#${elem.id}`);
        }
        className = elem.className;
        if (className && is.isString(className)) {
          classes = className.split(/\s+/);
          for (i = 0; i < classes.length; i++) {
            out.push(`.${classes[i]}`);
          }
        }
      }
      const allowedAttrs = ["aria-label", "type", "name", "title", "alt"];
      for (i = 0; i < allowedAttrs.length; i++) {
        key = allowedAttrs[i];
        attr = elem.getAttribute(key);
        if (attr) {
          out.push(`[${key}="${attr}"]`);
        }
      }
      return out.join("");
    }
    function getLocationHref() {
      try {
        return WINDOW.document.location.href;
      } catch (oO) {
        return "";
      }
    }
    function getDomElement(selector) {
      if (WINDOW.document && WINDOW.document.querySelector) {
        return WINDOW.document.querySelector(selector);
      }
      return null;
    }
    exports.getDomElement = getDomElement;
    exports.getLocationHref = getLocationHref;
    exports.htmlTreeAsString = htmlTreeAsString;
  }
});

// node_modules/@sentry/utils/cjs/debug-build.js
var require_debug_build = __commonJS({
  "node_modules/@sentry/utils/cjs/debug-build.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
    exports.DEBUG_BUILD = DEBUG_BUILD;
  }
});

// node_modules/@sentry/utils/cjs/logger.js
var require_logger = __commonJS({
  "node_modules/@sentry/utils/cjs/logger.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var debugBuild = require_debug_build();
    var worldwide = require_worldwide();
    var PREFIX = "Sentry Logger ";
    var CONSOLE_LEVELS = [
      "debug",
      "info",
      "warn",
      "error",
      "log",
      "assert",
      "trace"
    ];
    var originalConsoleMethods = {};
    function consoleSandbox(callback) {
      if (!("console" in worldwide.GLOBAL_OBJ)) {
        return callback();
      }
      const console2 = worldwide.GLOBAL_OBJ.console;
      const wrappedFuncs = {};
      const wrappedLevels = Object.keys(originalConsoleMethods);
      wrappedLevels.forEach((level) => {
        const originalConsoleMethod = originalConsoleMethods[level];
        wrappedFuncs[level] = console2[level];
        console2[level] = originalConsoleMethod;
      });
      try {
        return callback();
      } finally {
        wrappedLevels.forEach((level) => {
          console2[level] = wrappedFuncs[level];
        });
      }
    }
    function makeLogger() {
      let enabled = false;
      const logger6 = {
        enable: () => {
          enabled = true;
        },
        disable: () => {
          enabled = false;
        },
        isEnabled: () => enabled
      };
      if (debugBuild.DEBUG_BUILD) {
        CONSOLE_LEVELS.forEach((name) => {
          logger6[name] = (...args) => {
            if (enabled) {
              consoleSandbox(() => {
                worldwide.GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
              });
            }
          };
        });
      } else {
        CONSOLE_LEVELS.forEach((name) => {
          logger6[name] = () => void 0;
        });
      }
      return logger6;
    }
    var logger5 = makeLogger();
    exports.CONSOLE_LEVELS = CONSOLE_LEVELS;
    exports.consoleSandbox = consoleSandbox;
    exports.logger = logger5;
    exports.originalConsoleMethods = originalConsoleMethods;
  }
});

// node_modules/@sentry/utils/cjs/dsn.js
var require_dsn = __commonJS({
  "node_modules/@sentry/utils/cjs/dsn.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var debugBuild = require_debug_build();
    var logger5 = require_logger();
    var DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
    function isValidProtocol(protocol) {
      return protocol === "http" || protocol === "https";
    }
    function dsnToString2(dsn, withPassword = false) {
      const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
      return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
    }
    function dsnFromString(str) {
      const match = DSN_REGEX.exec(str);
      if (!match) {
        logger5.consoleSandbox(() => {
          console.error(`Invalid Sentry Dsn: ${str}`);
        });
        return void 0;
      }
      const [protocol, publicKey, pass = "", host, port = "", lastPath] = match.slice(1);
      let path = "";
      let projectId = lastPath;
      const split = projectId.split("/");
      if (split.length > 1) {
        path = split.slice(0, -1).join("/");
        projectId = split.pop();
      }
      if (projectId) {
        const projectMatch = projectId.match(/^\d+/);
        if (projectMatch) {
          projectId = projectMatch[0];
        }
      }
      return dsnFromComponents({ host, pass, path, projectId, port, protocol, publicKey });
    }
    function dsnFromComponents(components) {
      return {
        protocol: components.protocol,
        publicKey: components.publicKey || "",
        pass: components.pass || "",
        host: components.host,
        port: components.port || "",
        path: components.path || "",
        projectId: components.projectId
      };
    }
    function validateDsn(dsn) {
      if (!debugBuild.DEBUG_BUILD) {
        return true;
      }
      const { port, projectId, protocol } = dsn;
      const requiredComponents = ["protocol", "publicKey", "host", "projectId"];
      const hasMissingRequiredComponent = requiredComponents.find((component) => {
        if (!dsn[component]) {
          logger5.logger.error(`Invalid Sentry Dsn: ${component} missing`);
          return true;
        }
        return false;
      });
      if (hasMissingRequiredComponent) {
        return false;
      }
      if (!projectId.match(/^\d+$/)) {
        logger5.logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
        return false;
      }
      if (!isValidProtocol(protocol)) {
        logger5.logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
        return false;
      }
      if (port && isNaN(parseInt(port, 10))) {
        logger5.logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
        return false;
      }
      return true;
    }
    function makeDsn(from) {
      const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
      if (!components || !validateDsn(components)) {
        return void 0;
      }
      return components;
    }
    exports.dsnFromString = dsnFromString;
    exports.dsnToString = dsnToString2;
    exports.makeDsn = makeDsn;
  }
});

// node_modules/@sentry/utils/cjs/error.js
var require_error = __commonJS({
  "node_modules/@sentry/utils/cjs/error.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SentryError = class extends Error {
      /** Display name of this error instance. */
      constructor(message, logLevel = "warn") {
        super(message);
        this.message = message;
        this.name = new.target.prototype.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
        this.logLevel = logLevel;
      }
    };
    exports.SentryError = SentryError;
  }
});

// node_modules/@sentry/utils/cjs/object.js
var require_object = __commonJS({
  "node_modules/@sentry/utils/cjs/object.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var browser = require_browser();
    var debugBuild = require_debug_build();
    var is = require_is();
    var logger5 = require_logger();
    var string = require_string();
    function fill(source, name, replacementFactory) {
      if (!(name in source)) {
        return;
      }
      const original = source[name];
      const wrapped = replacementFactory(original);
      if (typeof wrapped === "function") {
        markFunctionWrapped(wrapped, original);
      }
      source[name] = wrapped;
    }
    function addNonEnumerableProperty(obj, name, value) {
      try {
        Object.defineProperty(obj, name, {
          // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
          value,
          writable: true,
          configurable: true
        });
      } catch (o_O) {
        debugBuild.DEBUG_BUILD && logger5.logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
      }
    }
    function markFunctionWrapped(wrapped, original) {
      try {
        const proto = original.prototype || {};
        wrapped.prototype = original.prototype = proto;
        addNonEnumerableProperty(wrapped, "__sentry_original__", original);
      } catch (o_O) {
      }
    }
    function getOriginalFunction(func) {
      return func.__sentry_original__;
    }
    function urlEncode(object) {
      return Object.keys(object).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join("&");
    }
    function convertToPlainObject(value) {
      if (is.isError(value)) {
        return {
          message: value.message,
          name: value.name,
          stack: value.stack,
          ...getOwnProperties(value)
        };
      } else if (is.isEvent(value)) {
        const newObj = {
          type: value.type,
          target: serializeEventTarget(value.target),
          currentTarget: serializeEventTarget(value.currentTarget),
          ...getOwnProperties(value)
        };
        if (typeof CustomEvent !== "undefined" && is.isInstanceOf(value, CustomEvent)) {
          newObj.detail = value.detail;
        }
        return newObj;
      } else {
        return value;
      }
    }
    function serializeEventTarget(target) {
      try {
        return is.isElement(target) ? browser.htmlTreeAsString(target) : Object.prototype.toString.call(target);
      } catch (_oO) {
        return "<unknown>";
      }
    }
    function getOwnProperties(obj) {
      if (typeof obj === "object" && obj !== null) {
        const extractedProps = {};
        for (const property in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, property)) {
            extractedProps[property] = obj[property];
          }
        }
        return extractedProps;
      } else {
        return {};
      }
    }
    function extractExceptionKeysForMessage(exception, maxLength = 40) {
      const keys = Object.keys(convertToPlainObject(exception));
      keys.sort();
      if (!keys.length) {
        return "[object has no keys]";
      }
      if (keys[0].length >= maxLength) {
        return string.truncate(keys[0], maxLength);
      }
      for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
        const serialized = keys.slice(0, includedKeys).join(", ");
        if (serialized.length > maxLength) {
          continue;
        }
        if (includedKeys === keys.length) {
          return serialized;
        }
        return string.truncate(serialized, maxLength);
      }
      return "";
    }
    function dropUndefinedKeys2(inputValue) {
      const memoizationMap = /* @__PURE__ */ new Map();
      return _dropUndefinedKeys(inputValue, memoizationMap);
    }
    function _dropUndefinedKeys(inputValue, memoizationMap) {
      if (is.isPlainObject(inputValue)) {
        const memoVal = memoizationMap.get(inputValue);
        if (memoVal !== void 0) {
          return memoVal;
        }
        const returnValue = {};
        memoizationMap.set(inputValue, returnValue);
        for (const key of Object.keys(inputValue)) {
          if (typeof inputValue[key] !== "undefined") {
            returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
          }
        }
        return returnValue;
      }
      if (Array.isArray(inputValue)) {
        const memoVal = memoizationMap.get(inputValue);
        if (memoVal !== void 0) {
          return memoVal;
        }
        const returnValue = [];
        memoizationMap.set(inputValue, returnValue);
        inputValue.forEach((item) => {
          returnValue.push(_dropUndefinedKeys(item, memoizationMap));
        });
        return returnValue;
      }
      return inputValue;
    }
    function objectify(wat) {
      let objectified;
      switch (true) {
        case (wat === void 0 || wat === null):
          objectified = new String(wat);
          break;
        case (typeof wat === "symbol" || typeof wat === "bigint"):
          objectified = Object(wat);
          break;
        case is.isPrimitive(wat):
          objectified = new wat.constructor(wat);
          break;
        default:
          objectified = wat;
          break;
      }
      return objectified;
    }
    exports.addNonEnumerableProperty = addNonEnumerableProperty;
    exports.convertToPlainObject = convertToPlainObject;
    exports.dropUndefinedKeys = dropUndefinedKeys2;
    exports.extractExceptionKeysForMessage = extractExceptionKeysForMessage;
    exports.fill = fill;
    exports.getOriginalFunction = getOriginalFunction;
    exports.markFunctionWrapped = markFunctionWrapped;
    exports.objectify = objectify;
    exports.urlEncode = urlEncode;
  }
});

// node_modules/@sentry/utils/cjs/node-stack-trace.js
var require_node_stack_trace = __commonJS({
  "node_modules/@sentry/utils/cjs/node-stack-trace.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function filenameIsInApp(filename, isNative = false) {
      const isInternal = isNative || filename && // It's not internal if it's an absolute linux path
      !filename.startsWith("/") && // It's not internal if it's an absolute windows path
      !filename.includes(":\\") && // It's not internal if the path is starting with a dot
      !filename.startsWith(".") && // It's not internal if the frame has a protocol. In node, this is usually the case if the file got pre-processed with a bundler like webpack
      !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//);
      return !isInternal && filename !== void 0 && !filename.includes("node_modules/");
    }
    function node(getModule) {
      const FILENAME_MATCH = /^\s*[-]{4,}$/;
      const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;
      return (line) => {
        const lineMatch = line.match(FULL_MATCH);
        if (lineMatch) {
          let object;
          let method;
          let functionName;
          let typeName;
          let methodName;
          if (lineMatch[1]) {
            functionName = lineMatch[1];
            let methodStart = functionName.lastIndexOf(".");
            if (functionName[methodStart - 1] === ".") {
              methodStart--;
            }
            if (methodStart > 0) {
              object = functionName.slice(0, methodStart);
              method = functionName.slice(methodStart + 1);
              const objectEnd = object.indexOf(".Module");
              if (objectEnd > 0) {
                functionName = functionName.slice(objectEnd + 1);
                object = object.slice(0, objectEnd);
              }
            }
            typeName = void 0;
          }
          if (method) {
            typeName = object;
            methodName = method;
          }
          if (method === "<anonymous>") {
            methodName = void 0;
            functionName = void 0;
          }
          if (functionName === void 0) {
            methodName = methodName || "<anonymous>";
            functionName = typeName ? `${typeName}.${methodName}` : methodName;
          }
          let filename = lineMatch[2] && lineMatch[2].startsWith("file://") ? lineMatch[2].slice(7) : lineMatch[2];
          const isNative = lineMatch[5] === "native";
          if (!filename && lineMatch[5] && !isNative) {
            filename = lineMatch[5];
          }
          return {
            filename,
            module: getModule ? getModule(filename) : void 0,
            function: functionName,
            lineno: parseInt(lineMatch[3], 10) || void 0,
            colno: parseInt(lineMatch[4], 10) || void 0,
            in_app: filenameIsInApp(filename, isNative)
          };
        }
        if (line.match(FILENAME_MATCH)) {
          return {
            filename: line
          };
        }
        return void 0;
      };
    }
    exports.filenameIsInApp = filenameIsInApp;
    exports.node = node;
  }
});

// node_modules/@sentry/utils/cjs/stacktrace.js
var require_stacktrace = __commonJS({
  "node_modules/@sentry/utils/cjs/stacktrace.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodeStackTrace = require_node_stack_trace();
    var STACKTRACE_FRAME_LIMIT = 50;
    var WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
    var STRIP_FRAME_REGEXP = /captureMessage|captureException/;
    function createStackParser(...parsers) {
      const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
      return (stack, skipFirst = 0) => {
        const frames = [];
        const lines = stack.split("\n");
        for (let i = skipFirst; i < lines.length; i++) {
          const line = lines[i];
          if (line.length > 1024) {
            continue;
          }
          const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
          if (cleanedLine.match(/\S*Error: /)) {
            continue;
          }
          for (const parser of sortedParsers) {
            const frame = parser(cleanedLine);
            if (frame) {
              frames.push(frame);
              break;
            }
          }
          if (frames.length >= STACKTRACE_FRAME_LIMIT) {
            break;
          }
        }
        return stripSentryFramesAndReverse(frames);
      };
    }
    function stackParserFromStackParserOptions(stackParser) {
      if (Array.isArray(stackParser)) {
        return createStackParser(...stackParser);
      }
      return stackParser;
    }
    function stripSentryFramesAndReverse(stack) {
      if (!stack.length) {
        return [];
      }
      const localStack = Array.from(stack);
      if (/sentryWrapped/.test(localStack[localStack.length - 1].function || "")) {
        localStack.pop();
      }
      localStack.reverse();
      if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || "")) {
        localStack.pop();
        if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || "")) {
          localStack.pop();
        }
      }
      return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
        ...frame,
        filename: frame.filename || localStack[localStack.length - 1].filename,
        function: frame.function || "?"
      }));
    }
    var defaultFunctionName = "<anonymous>";
    function getFunctionName(fn) {
      try {
        if (!fn || typeof fn !== "function") {
          return defaultFunctionName;
        }
        return fn.name || defaultFunctionName;
      } catch (e) {
        return defaultFunctionName;
      }
    }
    function nodeStackLineParser(getModule) {
      return [90, nodeStackTrace.node(getModule)];
    }
    exports.filenameIsInApp = nodeStackTrace.filenameIsInApp;
    exports.createStackParser = createStackParser;
    exports.getFunctionName = getFunctionName;
    exports.nodeStackLineParser = nodeStackLineParser;
    exports.stackParserFromStackParserOptions = stackParserFromStackParserOptions;
    exports.stripSentryFramesAndReverse = stripSentryFramesAndReverse;
  }
});

// node_modules/@sentry/utils/cjs/instrument/_handlers.js
var require_handlers = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/_handlers.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var debugBuild = require_debug_build();
    var logger5 = require_logger();
    var stacktrace = require_stacktrace();
    var handlers = {};
    var instrumented = {};
    function addHandler(type2, handler) {
      handlers[type2] = handlers[type2] || [];
      handlers[type2].push(handler);
    }
    function resetInstrumentationHandlers() {
      Object.keys(handlers).forEach((key) => {
        handlers[key] = void 0;
      });
    }
    function maybeInstrument(type2, instrumentFn) {
      if (!instrumented[type2]) {
        instrumentFn();
        instrumented[type2] = true;
      }
    }
    function triggerHandlers(type2, data) {
      const typeHandlers = type2 && handlers[type2];
      if (!typeHandlers) {
        return;
      }
      for (const handler of typeHandlers) {
        try {
          handler(data);
        } catch (e) {
          debugBuild.DEBUG_BUILD && logger5.logger.error(
            `Error while triggering instrumentation handler.
Type: ${type2}
Name: ${stacktrace.getFunctionName(handler)}
Error:`,
            e
          );
        }
      }
    }
    exports.addHandler = addHandler;
    exports.maybeInstrument = maybeInstrument;
    exports.resetInstrumentationHandlers = resetInstrumentationHandlers;
    exports.triggerHandlers = triggerHandlers;
  }
});

// node_modules/@sentry/utils/cjs/instrument/console.js
var require_console = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/console.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var logger5 = require_logger();
    var object = require_object();
    var worldwide = require_worldwide();
    var _handlers = require_handlers();
    function addConsoleInstrumentationHandler(handler) {
      const type2 = "console";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentConsole);
    }
    function instrumentConsole() {
      if (!("console" in worldwide.GLOBAL_OBJ)) {
        return;
      }
      logger5.CONSOLE_LEVELS.forEach(function(level) {
        if (!(level in worldwide.GLOBAL_OBJ.console)) {
          return;
        }
        object.fill(worldwide.GLOBAL_OBJ.console, level, function(originalConsoleMethod) {
          logger5.originalConsoleMethods[level] = originalConsoleMethod;
          return function(...args) {
            const handlerData = { args, level };
            _handlers.triggerHandlers("console", handlerData);
            const log = logger5.originalConsoleMethods[level];
            log && log.apply(worldwide.GLOBAL_OBJ.console, args);
          };
        });
      });
    }
    exports.addConsoleInstrumentationHandler = addConsoleInstrumentationHandler;
  }
});

// node_modules/@sentry/utils/cjs/misc.js
var require_misc = __commonJS({
  "node_modules/@sentry/utils/cjs/misc.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var object = require_object();
    var string = require_string();
    var worldwide = require_worldwide();
    function uuid42() {
      const gbl = worldwide.GLOBAL_OBJ;
      const crypto = gbl.crypto || gbl.msCrypto;
      let getRandomByte = () => Math.random() * 16;
      try {
        if (crypto && crypto.randomUUID) {
          return crypto.randomUUID().replace(/-/g, "");
        }
        if (crypto && crypto.getRandomValues) {
          getRandomByte = () => crypto.getRandomValues(new Uint8Array(1))[0];
        }
      } catch (_) {
      }
      return ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(
        /[018]/g,
        (c) => (
          // eslint-disable-next-line no-bitwise
          (c ^ (getRandomByte() & 15) >> c / 4).toString(16)
        )
      );
    }
    function getFirstException(event) {
      return event.exception && event.exception.values ? event.exception.values[0] : void 0;
    }
    function getEventDescription(event) {
      const { message, event_id: eventId } = event;
      if (message) {
        return message;
      }
      const firstException = getFirstException(event);
      if (firstException) {
        if (firstException.type && firstException.value) {
          return `${firstException.type}: ${firstException.value}`;
        }
        return firstException.type || firstException.value || eventId || "<unknown>";
      }
      return eventId || "<unknown>";
    }
    function addExceptionTypeValue(event, value, type2) {
      const exception = event.exception = event.exception || {};
      const values = exception.values = exception.values || [];
      const firstException = values[0] = values[0] || {};
      if (!firstException.value) {
        firstException.value = value || "";
      }
      if (!firstException.type) {
        firstException.type = type2 || "Error";
      }
    }
    function addExceptionMechanism(event, newMechanism) {
      const firstException = getFirstException(event);
      if (!firstException) {
        return;
      }
      const defaultMechanism = { type: "generic", handled: true };
      const currentMechanism = firstException.mechanism;
      firstException.mechanism = { ...defaultMechanism, ...currentMechanism, ...newMechanism };
      if (newMechanism && "data" in newMechanism) {
        const mergedData = { ...currentMechanism && currentMechanism.data, ...newMechanism.data };
        firstException.mechanism.data = mergedData;
      }
    }
    var SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    function parseSemver(input) {
      const match = input.match(SEMVER_REGEXP) || [];
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      const patch = parseInt(match[3], 10);
      return {
        buildmetadata: match[5],
        major: isNaN(major) ? void 0 : major,
        minor: isNaN(minor) ? void 0 : minor,
        patch: isNaN(patch) ? void 0 : patch,
        prerelease: match[4]
      };
    }
    function addContextToFrame(lines, frame, linesOfContext = 5) {
      if (frame.lineno === void 0) {
        return;
      }
      const maxLines = lines.length;
      const sourceLine = Math.max(Math.min(maxLines - 1, frame.lineno - 1), 0);
      frame.pre_context = lines.slice(Math.max(0, sourceLine - linesOfContext), sourceLine).map((line) => string.snipLine(line, 0));
      frame.context_line = string.snipLine(lines[Math.min(maxLines - 1, sourceLine)], frame.colno || 0);
      frame.post_context = lines.slice(Math.min(sourceLine + 1, maxLines), sourceLine + 1 + linesOfContext).map((line) => string.snipLine(line, 0));
    }
    function checkOrSetAlreadyCaught(exception) {
      if (exception && exception.__sentry_captured__) {
        return true;
      }
      try {
        object.addNonEnumerableProperty(exception, "__sentry_captured__", true);
      } catch (err) {
      }
      return false;
    }
    function arrayify(maybeArray) {
      return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
    }
    exports.addContextToFrame = addContextToFrame;
    exports.addExceptionMechanism = addExceptionMechanism;
    exports.addExceptionTypeValue = addExceptionTypeValue;
    exports.arrayify = arrayify;
    exports.checkOrSetAlreadyCaught = checkOrSetAlreadyCaught;
    exports.getEventDescription = getEventDescription;
    exports.parseSemver = parseSemver;
    exports.uuid4 = uuid42;
  }
});

// node_modules/@sentry/utils/cjs/instrument/dom.js
var require_dom = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/dom.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var misc = require_misc();
    var object = require_object();
    var worldwide = require_worldwide();
    var _handlers = require_handlers();
    var WINDOW = worldwide.GLOBAL_OBJ;
    var DEBOUNCE_DURATION = 1e3;
    var debounceTimerID;
    var lastCapturedEventType;
    var lastCapturedEventTargetId;
    function addClickKeypressInstrumentationHandler(handler) {
      const type2 = "dom";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentDOM);
    }
    function instrumentDOM() {
      if (!WINDOW.document) {
        return;
      }
      const triggerDOMHandler = _handlers.triggerHandlers.bind(null, "dom");
      const globalDOMEventHandler = makeDOMEventHandler(triggerDOMHandler, true);
      WINDOW.document.addEventListener("click", globalDOMEventHandler, false);
      WINDOW.document.addEventListener("keypress", globalDOMEventHandler, false);
      ["EventTarget", "Node"].forEach((target) => {
        const proto = WINDOW[target] && WINDOW[target].prototype;
        if (!proto || !proto.hasOwnProperty || !proto.hasOwnProperty("addEventListener")) {
          return;
        }
        object.fill(proto, "addEventListener", function(originalAddEventListener) {
          return function(type2, listener, options) {
            if (type2 === "click" || type2 == "keypress") {
              try {
                const el = this;
                const handlers = el.__sentry_instrumentation_handlers__ = el.__sentry_instrumentation_handlers__ || {};
                const handlerForType = handlers[type2] = handlers[type2] || { refCount: 0 };
                if (!handlerForType.handler) {
                  const handler = makeDOMEventHandler(triggerDOMHandler);
                  handlerForType.handler = handler;
                  originalAddEventListener.call(this, type2, handler, options);
                }
                handlerForType.refCount++;
              } catch (e) {
              }
            }
            return originalAddEventListener.call(this, type2, listener, options);
          };
        });
        object.fill(
          proto,
          "removeEventListener",
          function(originalRemoveEventListener) {
            return function(type2, listener, options) {
              if (type2 === "click" || type2 == "keypress") {
                try {
                  const el = this;
                  const handlers = el.__sentry_instrumentation_handlers__ || {};
                  const handlerForType = handlers[type2];
                  if (handlerForType) {
                    handlerForType.refCount--;
                    if (handlerForType.refCount <= 0) {
                      originalRemoveEventListener.call(this, type2, handlerForType.handler, options);
                      handlerForType.handler = void 0;
                      delete handlers[type2];
                    }
                    if (Object.keys(handlers).length === 0) {
                      delete el.__sentry_instrumentation_handlers__;
                    }
                  }
                } catch (e) {
                }
              }
              return originalRemoveEventListener.call(this, type2, listener, options);
            };
          }
        );
      });
    }
    function isSimilarToLastCapturedEvent(event) {
      if (event.type !== lastCapturedEventType) {
        return false;
      }
      try {
        if (!event.target || event.target._sentryId !== lastCapturedEventTargetId) {
          return false;
        }
      } catch (e) {
      }
      return true;
    }
    function shouldSkipDOMEvent(eventType, target) {
      if (eventType !== "keypress") {
        return false;
      }
      if (!target || !target.tagName) {
        return true;
      }
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return false;
      }
      return true;
    }
    function makeDOMEventHandler(handler, globalListener = false) {
      return (event) => {
        if (!event || event["_sentryCaptured"]) {
          return;
        }
        const target = getEventTarget(event);
        if (shouldSkipDOMEvent(event.type, target)) {
          return;
        }
        object.addNonEnumerableProperty(event, "_sentryCaptured", true);
        if (target && !target._sentryId) {
          object.addNonEnumerableProperty(target, "_sentryId", misc.uuid4());
        }
        const name = event.type === "keypress" ? "input" : event.type;
        if (!isSimilarToLastCapturedEvent(event)) {
          const handlerData = { event, name, global: globalListener };
          handler(handlerData);
          lastCapturedEventType = event.type;
          lastCapturedEventTargetId = target ? target._sentryId : void 0;
        }
        clearTimeout(debounceTimerID);
        debounceTimerID = WINDOW.setTimeout(() => {
          lastCapturedEventTargetId = void 0;
          lastCapturedEventType = void 0;
        }, DEBOUNCE_DURATION);
      };
    }
    function getEventTarget(event) {
      try {
        return event.target;
      } catch (e) {
        return null;
      }
    }
    exports.addClickKeypressInstrumentationHandler = addClickKeypressInstrumentationHandler;
    exports.instrumentDOM = instrumentDOM;
  }
});

// node_modules/@sentry/utils/cjs/supports.js
var require_supports = __commonJS({
  "node_modules/@sentry/utils/cjs/supports.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var debugBuild = require_debug_build();
    var logger5 = require_logger();
    var worldwide = require_worldwide();
    var WINDOW = worldwide.getGlobalObject();
    function supportsErrorEvent() {
      try {
        new ErrorEvent("");
        return true;
      } catch (e) {
        return false;
      }
    }
    function supportsDOMError() {
      try {
        new DOMError("");
        return true;
      } catch (e) {
        return false;
      }
    }
    function supportsDOMException() {
      try {
        new DOMException("");
        return true;
      } catch (e) {
        return false;
      }
    }
    function supportsFetch() {
      if (!("fetch" in WINDOW)) {
        return false;
      }
      try {
        new Headers();
        new Request("http://www.example.com");
        new Response();
        return true;
      } catch (e) {
        return false;
      }
    }
    function isNativeFetch(func) {
      return func && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(func.toString());
    }
    function supportsNativeFetch() {
      if (typeof EdgeRuntime === "string") {
        return true;
      }
      if (!supportsFetch()) {
        return false;
      }
      if (isNativeFetch(WINDOW.fetch)) {
        return true;
      }
      let result = false;
      const doc = WINDOW.document;
      if (doc && typeof doc.createElement === "function") {
        try {
          const sandbox = doc.createElement("iframe");
          sandbox.hidden = true;
          doc.head.appendChild(sandbox);
          if (sandbox.contentWindow && sandbox.contentWindow.fetch) {
            result = isNativeFetch(sandbox.contentWindow.fetch);
          }
          doc.head.removeChild(sandbox);
        } catch (err) {
          debugBuild.DEBUG_BUILD && logger5.logger.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", err);
        }
      }
      return result;
    }
    function supportsReportingObserver() {
      return "ReportingObserver" in WINDOW;
    }
    function supportsReferrerPolicy() {
      if (!supportsFetch()) {
        return false;
      }
      try {
        new Request("_", {
          referrerPolicy: "origin"
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    exports.isNativeFetch = isNativeFetch;
    exports.supportsDOMError = supportsDOMError;
    exports.supportsDOMException = supportsDOMException;
    exports.supportsErrorEvent = supportsErrorEvent;
    exports.supportsFetch = supportsFetch;
    exports.supportsNativeFetch = supportsNativeFetch;
    exports.supportsReferrerPolicy = supportsReferrerPolicy;
    exports.supportsReportingObserver = supportsReportingObserver;
  }
});

// node_modules/@sentry/utils/cjs/instrument/fetch.js
var require_fetch = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/fetch.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var object = require_object();
    var supports = require_supports();
    var worldwide = require_worldwide();
    var _handlers = require_handlers();
    function addFetchInstrumentationHandler(handler) {
      const type2 = "fetch";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentFetch);
    }
    function instrumentFetch() {
      if (!supports.supportsNativeFetch()) {
        return;
      }
      object.fill(worldwide.GLOBAL_OBJ, "fetch", function(originalFetch) {
        return function(...args) {
          const { method, url } = parseFetchArgs(args);
          const handlerData = {
            args,
            fetchData: {
              method,
              url
            },
            startTimestamp: Date.now()
          };
          _handlers.triggerHandlers("fetch", {
            ...handlerData
          });
          return originalFetch.apply(worldwide.GLOBAL_OBJ, args).then(
            (response) => {
              const finishedHandlerData = {
                ...handlerData,
                endTimestamp: Date.now(),
                response
              };
              _handlers.triggerHandlers("fetch", finishedHandlerData);
              return response;
            },
            (error) => {
              const erroredHandlerData = {
                ...handlerData,
                endTimestamp: Date.now(),
                error
              };
              _handlers.triggerHandlers("fetch", erroredHandlerData);
              throw error;
            }
          );
        };
      });
    }
    function hasProp(obj, prop) {
      return !!obj && typeof obj === "object" && !!obj[prop];
    }
    function getUrlFromResource(resource) {
      if (typeof resource === "string") {
        return resource;
      }
      if (!resource) {
        return "";
      }
      if (hasProp(resource, "url")) {
        return resource.url;
      }
      if (resource.toString) {
        return resource.toString();
      }
      return "";
    }
    function parseFetchArgs(fetchArgs) {
      if (fetchArgs.length === 0) {
        return { method: "GET", url: "" };
      }
      if (fetchArgs.length === 2) {
        const [url, options] = fetchArgs;
        return {
          url: getUrlFromResource(url),
          method: hasProp(options, "method") ? String(options.method).toUpperCase() : "GET"
        };
      }
      const arg = fetchArgs[0];
      return {
        url: getUrlFromResource(arg),
        method: hasProp(arg, "method") ? String(arg.method).toUpperCase() : "GET"
      };
    }
    exports.addFetchInstrumentationHandler = addFetchInstrumentationHandler;
    exports.parseFetchArgs = parseFetchArgs;
  }
});

// node_modules/@sentry/utils/cjs/instrument/globalError.js
var require_globalError = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/globalError.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var worldwide = require_worldwide();
    var _handlers = require_handlers();
    var _oldOnErrorHandler = null;
    function addGlobalErrorInstrumentationHandler(handler) {
      const type2 = "error";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentError);
    }
    function instrumentError() {
      _oldOnErrorHandler = worldwide.GLOBAL_OBJ.onerror;
      worldwide.GLOBAL_OBJ.onerror = function(msg, url, line, column, error) {
        const handlerData = {
          column,
          error,
          line,
          msg,
          url
        };
        _handlers.triggerHandlers("error", handlerData);
        if (_oldOnErrorHandler && !_oldOnErrorHandler.__SENTRY_LOADER__) {
          return _oldOnErrorHandler.apply(this, arguments);
        }
        return false;
      };
      worldwide.GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
    }
    exports.addGlobalErrorInstrumentationHandler = addGlobalErrorInstrumentationHandler;
  }
});

// node_modules/@sentry/utils/cjs/instrument/globalUnhandledRejection.js
var require_globalUnhandledRejection = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/globalUnhandledRejection.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var worldwide = require_worldwide();
    var _handlers = require_handlers();
    var _oldOnUnhandledRejectionHandler = null;
    function addGlobalUnhandledRejectionInstrumentationHandler(handler) {
      const type2 = "unhandledrejection";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentUnhandledRejection);
    }
    function instrumentUnhandledRejection() {
      _oldOnUnhandledRejectionHandler = worldwide.GLOBAL_OBJ.onunhandledrejection;
      worldwide.GLOBAL_OBJ.onunhandledrejection = function(e) {
        const handlerData = e;
        _handlers.triggerHandlers("unhandledrejection", handlerData);
        if (_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) {
          return _oldOnUnhandledRejectionHandler.apply(this, arguments);
        }
        return true;
      };
      worldwide.GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
    }
    exports.addGlobalUnhandledRejectionInstrumentationHandler = addGlobalUnhandledRejectionInstrumentationHandler;
  }
});

// node_modules/@sentry/utils/cjs/vendor/supportsHistory.js
var require_supportsHistory = __commonJS({
  "node_modules/@sentry/utils/cjs/vendor/supportsHistory.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var worldwide = require_worldwide();
    var WINDOW = worldwide.getGlobalObject();
    function supportsHistory() {
      const chrome = WINDOW.chrome;
      const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
      const hasHistoryApi = "history" in WINDOW && !!WINDOW.history.pushState && !!WINDOW.history.replaceState;
      return !isChromePackagedApp && hasHistoryApi;
    }
    exports.supportsHistory = supportsHistory;
  }
});

// node_modules/@sentry/utils/cjs/instrument/history.js
var require_history = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/history.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var object = require_object();
    require_debug_build();
    require_logger();
    var worldwide = require_worldwide();
    var supportsHistory = require_supportsHistory();
    var _handlers = require_handlers();
    var WINDOW = worldwide.GLOBAL_OBJ;
    var lastHref;
    function addHistoryInstrumentationHandler(handler) {
      const type2 = "history";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentHistory);
    }
    function instrumentHistory() {
      if (!supportsHistory.supportsHistory()) {
        return;
      }
      const oldOnPopState = WINDOW.onpopstate;
      WINDOW.onpopstate = function(...args) {
        const to = WINDOW.location.href;
        const from = lastHref;
        lastHref = to;
        const handlerData = { from, to };
        _handlers.triggerHandlers("history", handlerData);
        if (oldOnPopState) {
          try {
            return oldOnPopState.apply(this, args);
          } catch (_oO) {
          }
        }
      };
      function historyReplacementFunction(originalHistoryFunction) {
        return function(...args) {
          const url = args.length > 2 ? args[2] : void 0;
          if (url) {
            const from = lastHref;
            const to = String(url);
            lastHref = to;
            const handlerData = { from, to };
            _handlers.triggerHandlers("history", handlerData);
          }
          return originalHistoryFunction.apply(this, args);
        };
      }
      object.fill(WINDOW.history, "pushState", historyReplacementFunction);
      object.fill(WINDOW.history, "replaceState", historyReplacementFunction);
    }
    exports.addHistoryInstrumentationHandler = addHistoryInstrumentationHandler;
  }
});

// node_modules/@sentry/utils/cjs/instrument/xhr.js
var require_xhr = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/xhr.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    var object = require_object();
    var worldwide = require_worldwide();
    var _handlers = require_handlers();
    var WINDOW = worldwide.GLOBAL_OBJ;
    var SENTRY_XHR_DATA_KEY = "__sentry_xhr_v3__";
    function addXhrInstrumentationHandler(handler) {
      const type2 = "xhr";
      _handlers.addHandler(type2, handler);
      _handlers.maybeInstrument(type2, instrumentXHR);
    }
    function instrumentXHR() {
      if (!WINDOW.XMLHttpRequest) {
        return;
      }
      const xhrproto = XMLHttpRequest.prototype;
      object.fill(xhrproto, "open", function(originalOpen) {
        return function(...args) {
          const startTimestamp = Date.now();
          const method = is.isString(args[0]) ? args[0].toUpperCase() : void 0;
          const url = parseUrl(args[1]);
          if (!method || !url) {
            return originalOpen.apply(this, args);
          }
          this[SENTRY_XHR_DATA_KEY] = {
            method,
            url,
            request_headers: {}
          };
          if (method === "POST" && url.match(/sentry_key/)) {
            this.__sentry_own_request__ = true;
          }
          const onreadystatechangeHandler = () => {
            const xhrInfo = this[SENTRY_XHR_DATA_KEY];
            if (!xhrInfo) {
              return;
            }
            if (this.readyState === 4) {
              try {
                xhrInfo.status_code = this.status;
              } catch (e) {
              }
              const handlerData = {
                args: [method, url],
                endTimestamp: Date.now(),
                startTimestamp,
                xhr: this
              };
              _handlers.triggerHandlers("xhr", handlerData);
            }
          };
          if ("onreadystatechange" in this && typeof this.onreadystatechange === "function") {
            object.fill(this, "onreadystatechange", function(original) {
              return function(...readyStateArgs) {
                onreadystatechangeHandler();
                return original.apply(this, readyStateArgs);
              };
            });
          } else {
            this.addEventListener("readystatechange", onreadystatechangeHandler);
          }
          object.fill(this, "setRequestHeader", function(original) {
            return function(...setRequestHeaderArgs) {
              const [header, value] = setRequestHeaderArgs;
              const xhrInfo = this[SENTRY_XHR_DATA_KEY];
              if (xhrInfo && is.isString(header) && is.isString(value)) {
                xhrInfo.request_headers[header.toLowerCase()] = value;
              }
              return original.apply(this, setRequestHeaderArgs);
            };
          });
          return originalOpen.apply(this, args);
        };
      });
      object.fill(xhrproto, "send", function(originalSend) {
        return function(...args) {
          const sentryXhrData = this[SENTRY_XHR_DATA_KEY];
          if (!sentryXhrData) {
            return originalSend.apply(this, args);
          }
          if (args[0] !== void 0) {
            sentryXhrData.body = args[0];
          }
          const handlerData = {
            args: [sentryXhrData.method, sentryXhrData.url],
            startTimestamp: Date.now(),
            xhr: this
          };
          _handlers.triggerHandlers("xhr", handlerData);
          return originalSend.apply(this, args);
        };
      });
    }
    function parseUrl(url) {
      if (is.isString(url)) {
        return url;
      }
      try {
        return url.toString();
      } catch (e2) {
      }
      return void 0;
    }
    exports.SENTRY_XHR_DATA_KEY = SENTRY_XHR_DATA_KEY;
    exports.addXhrInstrumentationHandler = addXhrInstrumentationHandler;
    exports.instrumentXHR = instrumentXHR;
  }
});

// node_modules/@sentry/utils/cjs/instrument/index.js
var require_instrument = __commonJS({
  "node_modules/@sentry/utils/cjs/instrument/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var debugBuild = require_debug_build();
    var logger5 = require_logger();
    var console2 = require_console();
    var dom = require_dom();
    var fetch = require_fetch();
    var globalError = require_globalError();
    var globalUnhandledRejection = require_globalUnhandledRejection();
    var history = require_history();
    var xhr = require_xhr();
    function addInstrumentationHandler(type2, callback) {
      switch (type2) {
        case "console":
          return console2.addConsoleInstrumentationHandler(callback);
        case "dom":
          return dom.addClickKeypressInstrumentationHandler(callback);
        case "xhr":
          return xhr.addXhrInstrumentationHandler(callback);
        case "fetch":
          return fetch.addFetchInstrumentationHandler(callback);
        case "history":
          return history.addHistoryInstrumentationHandler(callback);
        case "error":
          return globalError.addGlobalErrorInstrumentationHandler(callback);
        case "unhandledrejection":
          return globalUnhandledRejection.addGlobalUnhandledRejectionInstrumentationHandler(callback);
        default:
          debugBuild.DEBUG_BUILD && logger5.logger.warn("unknown instrumentation type:", type2);
      }
    }
    exports.addConsoleInstrumentationHandler = console2.addConsoleInstrumentationHandler;
    exports.addClickKeypressInstrumentationHandler = dom.addClickKeypressInstrumentationHandler;
    exports.addFetchInstrumentationHandler = fetch.addFetchInstrumentationHandler;
    exports.addGlobalErrorInstrumentationHandler = globalError.addGlobalErrorInstrumentationHandler;
    exports.addGlobalUnhandledRejectionInstrumentationHandler = globalUnhandledRejection.addGlobalUnhandledRejectionInstrumentationHandler;
    exports.addHistoryInstrumentationHandler = history.addHistoryInstrumentationHandler;
    exports.SENTRY_XHR_DATA_KEY = xhr.SENTRY_XHR_DATA_KEY;
    exports.addXhrInstrumentationHandler = xhr.addXhrInstrumentationHandler;
    exports.addInstrumentationHandler = addInstrumentationHandler;
  }
});

// node_modules/@sentry/utils/cjs/env.js
var require_env = __commonJS({
  "node_modules/@sentry/utils/cjs/env.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isBrowserBundle() {
      return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
    }
    function getSDKSource() {
      return "npm";
    }
    exports.getSDKSource = getSDKSource;
    exports.isBrowserBundle = isBrowserBundle;
  }
});

// node_modules/@sentry/utils/cjs/node.js
var require_node = __commonJS({
  "node_modules/@sentry/utils/cjs/node.js"(exports, module2) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var env3 = require_env();
    function isNodeEnv() {
      return !env3.isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
    }
    function dynamicRequire(mod, request) {
      return mod.require(request);
    }
    function loadModule(moduleName) {
      let mod;
      try {
        mod = dynamicRequire(module2, moduleName);
      } catch (e) {
      }
      try {
        const { cwd } = dynamicRequire(module2, "process");
        mod = dynamicRequire(module2, `${cwd()}/node_modules/${moduleName}`);
      } catch (e) {
      }
      return mod;
    }
    exports.dynamicRequire = dynamicRequire;
    exports.isNodeEnv = isNodeEnv;
    exports.loadModule = loadModule;
  }
});

// node_modules/@sentry/utils/cjs/isBrowser.js
var require_isBrowser = __commonJS({
  "node_modules/@sentry/utils/cjs/isBrowser.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var node = require_node();
    var worldwide = require_worldwide();
    function isBrowser() {
      return typeof window !== "undefined" && (!node.isNodeEnv() || isElectronNodeRenderer());
    }
    function isElectronNodeRenderer() {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        worldwide.GLOBAL_OBJ.process !== void 0 && worldwide.GLOBAL_OBJ.process.type === "renderer"
      );
    }
    exports.isBrowser = isBrowser;
  }
});

// node_modules/@sentry/utils/cjs/memo.js
var require_memo = __commonJS({
  "node_modules/@sentry/utils/cjs/memo.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function memoBuilder() {
      const hasWeakSet = typeof WeakSet === "function";
      const inner = hasWeakSet ? /* @__PURE__ */ new WeakSet() : [];
      function memoize(obj) {
        if (hasWeakSet) {
          if (inner.has(obj)) {
            return true;
          }
          inner.add(obj);
          return false;
        }
        for (let i = 0; i < inner.length; i++) {
          const value = inner[i];
          if (value === obj) {
            return true;
          }
        }
        inner.push(obj);
        return false;
      }
      function unmemoize(obj) {
        if (hasWeakSet) {
          inner.delete(obj);
        } else {
          for (let i = 0; i < inner.length; i++) {
            if (inner[i] === obj) {
              inner.splice(i, 1);
              break;
            }
          }
        }
      }
      return [memoize, unmemoize];
    }
    exports.memoBuilder = memoBuilder;
  }
});

// node_modules/@sentry/utils/cjs/normalize.js
var require_normalize = __commonJS({
  "node_modules/@sentry/utils/cjs/normalize.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    var memo = require_memo();
    var object = require_object();
    var stacktrace = require_stacktrace();
    function normalize(input, depth = 100, maxProperties = Infinity) {
      try {
        return visit("", input, depth, maxProperties);
      } catch (err) {
        return { ERROR: `**non-serializable** (${err})` };
      }
    }
    function normalizeToSize(object2, depth = 3, maxSize = 100 * 1024) {
      const normalized = normalize(object2, depth);
      if (jsonSize(normalized) > maxSize) {
        return normalizeToSize(object2, depth - 1, maxSize);
      }
      return normalized;
    }
    function visit(key, value, depth = Infinity, maxProperties = Infinity, memo$1 = memo.memoBuilder()) {
      const [memoize, unmemoize] = memo$1;
      if (value == null || // this matches null and undefined -> eqeq not eqeqeq
      ["number", "boolean", "string"].includes(typeof value) && !is.isNaN(value)) {
        return value;
      }
      const stringified = stringifyValue(key, value);
      if (!stringified.startsWith("[object ")) {
        return stringified;
      }
      if (value["__sentry_skip_normalization__"]) {
        return value;
      }
      const remainingDepth = typeof value["__sentry_override_normalization_depth__"] === "number" ? value["__sentry_override_normalization_depth__"] : depth;
      if (remainingDepth === 0) {
        return stringified.replace("object ", "");
      }
      if (memoize(value)) {
        return "[Circular ~]";
      }
      const valueWithToJSON = value;
      if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") {
        try {
          const jsonValue = valueWithToJSON.toJSON();
          return visit("", jsonValue, remainingDepth - 1, maxProperties, memo$1);
        } catch (err) {
        }
      }
      const normalized = Array.isArray(value) ? [] : {};
      let numAdded = 0;
      const visitable = object.convertToPlainObject(value);
      for (const visitKey in visitable) {
        if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
          continue;
        }
        if (numAdded >= maxProperties) {
          normalized[visitKey] = "[MaxProperties ~]";
          break;
        }
        const visitValue = visitable[visitKey];
        normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo$1);
        numAdded++;
      }
      unmemoize(value);
      return normalized;
    }
    function stringifyValue(key, value) {
      try {
        if (key === "domain" && value && typeof value === "object" && value._events) {
          return "[Domain]";
        }
        if (key === "domainEmitter") {
          return "[DomainEmitter]";
        }
        if (typeof global !== "undefined" && value === global) {
          return "[Global]";
        }
        if (typeof window !== "undefined" && value === window) {
          return "[Window]";
        }
        if (typeof document !== "undefined" && value === document) {
          return "[Document]";
        }
        if (is.isVueViewModel(value)) {
          return "[VueViewModel]";
        }
        if (is.isSyntheticEvent(value)) {
          return "[SyntheticEvent]";
        }
        if (typeof value === "number" && value !== value) {
          return "[NaN]";
        }
        if (typeof value === "function") {
          return `[Function: ${stacktrace.getFunctionName(value)}]`;
        }
        if (typeof value === "symbol") {
          return `[${String(value)}]`;
        }
        if (typeof value === "bigint") {
          return `[BigInt: ${String(value)}]`;
        }
        const objName = getConstructorName(value);
        if (/^HTML(\w*)Element$/.test(objName)) {
          return `[HTMLElement: ${objName}]`;
        }
        return `[object ${objName}]`;
      } catch (err) {
        return `**non-serializable** (${err})`;
      }
    }
    function getConstructorName(value) {
      const prototype = Object.getPrototypeOf(value);
      return prototype ? prototype.constructor.name : "null prototype";
    }
    function utf8Length(value) {
      return ~-encodeURI(value).split(/%..|./).length;
    }
    function jsonSize(value) {
      return utf8Length(JSON.stringify(value));
    }
    exports.normalize = normalize;
    exports.normalizeToSize = normalizeToSize;
    exports.walk = visit;
  }
});

// node_modules/@sentry/utils/cjs/path.js
var require_path = __commonJS({
  "node_modules/@sentry/utils/cjs/path.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function normalizeArray(parts, allowAboveRoot) {
      let up = 0;
      for (let i = parts.length - 1; i >= 0; i--) {
        const last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up--; up) {
          parts.unshift("..");
        }
      }
      return parts;
    }
    var splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
    function splitPath(filename) {
      const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
      const parts = splitPathRe.exec(truncated);
      return parts ? parts.slice(1) : [];
    }
    function resolve2(...args) {
      let resolvedPath = "";
      let resolvedAbsolute = false;
      for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        const path = i >= 0 ? args[i] : "/";
        if (!path) {
          continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charAt(0) === "/";
      }
      resolvedPath = normalizeArray(
        resolvedPath.split("/").filter((p) => !!p),
        !resolvedAbsolute
      ).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }
    function trim(arr) {
      let start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") {
          break;
        }
      }
      let end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") {
          break;
        }
      }
      if (start > end) {
        return [];
      }
      return arr.slice(start, end - start + 1);
    }
    function relative(from, to) {
      from = resolve2(from).slice(1);
      to = resolve2(to).slice(1);
      const fromParts = trim(from.split("/"));
      const toParts = trim(to.split("/"));
      const length = Math.min(fromParts.length, toParts.length);
      let samePartsLength = length;
      for (let i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      let outputParts = [];
      for (let i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    }
    function normalizePath(path) {
      const isPathAbsolute = isAbsolute(path);
      const trailingSlash = path.slice(-1) === "/";
      let normalizedPath = normalizeArray(
        path.split("/").filter((p) => !!p),
        !isPathAbsolute
      ).join("/");
      if (!normalizedPath && !isPathAbsolute) {
        normalizedPath = ".";
      }
      if (normalizedPath && trailingSlash) {
        normalizedPath += "/";
      }
      return (isPathAbsolute ? "/" : "") + normalizedPath;
    }
    function isAbsolute(path) {
      return path.charAt(0) === "/";
    }
    function join2(...args) {
      return normalizePath(args.join("/"));
    }
    function dirname(path) {
      const result = splitPath(path);
      const root = result[0];
      let dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.slice(0, dir.length - 1);
      }
      return root + dir;
    }
    function basename(path, ext) {
      let f = splitPath(path)[2];
      if (ext && f.slice(ext.length * -1) === ext) {
        f = f.slice(0, f.length - ext.length);
      }
      return f;
    }
    exports.basename = basename;
    exports.dirname = dirname;
    exports.isAbsolute = isAbsolute;
    exports.join = join2;
    exports.normalizePath = normalizePath;
    exports.relative = relative;
    exports.resolve = resolve2;
  }
});

// node_modules/@sentry/utils/cjs/syncpromise.js
var require_syncpromise = __commonJS({
  "node_modules/@sentry/utils/cjs/syncpromise.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    var States;
    (function(States2) {
      const PENDING = 0;
      States2[States2["PENDING"] = PENDING] = "PENDING";
      const RESOLVED = 1;
      States2[States2["RESOLVED"] = RESOLVED] = "RESOLVED";
      const REJECTED = 2;
      States2[States2["REJECTED"] = REJECTED] = "REJECTED";
    })(States || (States = {}));
    function resolvedSyncPromise(value) {
      return new SyncPromise((resolve2) => {
        resolve2(value);
      });
    }
    function rejectedSyncPromise(reason) {
      return new SyncPromise((_, reject) => {
        reject(reason);
      });
    }
    var SyncPromise = class {
      constructor(executor) {
        SyncPromise.prototype.__init.call(this);
        SyncPromise.prototype.__init2.call(this);
        SyncPromise.prototype.__init3.call(this);
        SyncPromise.prototype.__init4.call(this);
        this._state = States.PENDING;
        this._handlers = [];
        try {
          executor(this._resolve, this._reject);
        } catch (e) {
          this._reject(e);
        }
      }
      /** JSDoc */
      then(onfulfilled, onrejected) {
        return new SyncPromise((resolve2, reject) => {
          this._handlers.push([
            false,
            (result) => {
              if (!onfulfilled) {
                resolve2(result);
              } else {
                try {
                  resolve2(onfulfilled(result));
                } catch (e) {
                  reject(e);
                }
              }
            },
            (reason) => {
              if (!onrejected) {
                reject(reason);
              } else {
                try {
                  resolve2(onrejected(reason));
                } catch (e) {
                  reject(e);
                }
              }
            }
          ]);
          this._executeHandlers();
        });
      }
      /** JSDoc */
      catch(onrejected) {
        return this.then((val) => val, onrejected);
      }
      /** JSDoc */
      finally(onfinally) {
        return new SyncPromise((resolve2, reject) => {
          let val;
          let isRejected;
          return this.then(
            (value) => {
              isRejected = false;
              val = value;
              if (onfinally) {
                onfinally();
              }
            },
            (reason) => {
              isRejected = true;
              val = reason;
              if (onfinally) {
                onfinally();
              }
            }
          ).then(() => {
            if (isRejected) {
              reject(val);
              return;
            }
            resolve2(val);
          });
        });
      }
      /** JSDoc */
      __init() {
        this._resolve = (value) => {
          this._setResult(States.RESOLVED, value);
        };
      }
      /** JSDoc */
      __init2() {
        this._reject = (reason) => {
          this._setResult(States.REJECTED, reason);
        };
      }
      /** JSDoc */
      __init3() {
        this._setResult = (state, value) => {
          if (this._state !== States.PENDING) {
            return;
          }
          if (is.isThenable(value)) {
            void value.then(this._resolve, this._reject);
            return;
          }
          this._state = state;
          this._value = value;
          this._executeHandlers();
        };
      }
      /** JSDoc */
      __init4() {
        this._executeHandlers = () => {
          if (this._state === States.PENDING) {
            return;
          }
          const cachedHandlers = this._handlers.slice();
          this._handlers = [];
          cachedHandlers.forEach((handler) => {
            if (handler[0]) {
              return;
            }
            if (this._state === States.RESOLVED) {
              handler[1](this._value);
            }
            if (this._state === States.REJECTED) {
              handler[2](this._value);
            }
            handler[0] = true;
          });
        };
      }
    };
    exports.SyncPromise = SyncPromise;
    exports.rejectedSyncPromise = rejectedSyncPromise;
    exports.resolvedSyncPromise = resolvedSyncPromise;
  }
});

// node_modules/@sentry/utils/cjs/promisebuffer.js
var require_promisebuffer = __commonJS({
  "node_modules/@sentry/utils/cjs/promisebuffer.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var error = require_error();
    var syncpromise = require_syncpromise();
    function makePromiseBuffer(limit) {
      const buffer = [];
      function isReady() {
        return limit === void 0 || buffer.length < limit;
      }
      function remove(task) {
        return buffer.splice(buffer.indexOf(task), 1)[0];
      }
      function add(taskProducer) {
        if (!isReady()) {
          return syncpromise.rejectedSyncPromise(new error.SentryError("Not adding Promise because buffer limit was reached."));
        }
        const task = taskProducer();
        if (buffer.indexOf(task) === -1) {
          buffer.push(task);
        }
        void task.then(() => remove(task)).then(
          null,
          () => remove(task).then(null, () => {
          })
        );
        return task;
      }
      function drain(timeout) {
        return new syncpromise.SyncPromise((resolve2, reject) => {
          let counter = buffer.length;
          if (!counter) {
            return resolve2(true);
          }
          const capturedSetTimeout = setTimeout(() => {
            if (timeout && timeout > 0) {
              resolve2(false);
            }
          }, timeout);
          buffer.forEach((item) => {
            void syncpromise.resolvedSyncPromise(item).then(() => {
              if (!--counter) {
                clearTimeout(capturedSetTimeout);
                resolve2(true);
              }
            }, reject);
          });
        });
      }
      return {
        $: buffer,
        add,
        drain
      };
    }
    exports.makePromiseBuffer = makePromiseBuffer;
  }
});

// node_modules/@sentry/utils/cjs/cookie.js
var require_cookie = __commonJS({
  "node_modules/@sentry/utils/cjs/cookie.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function parseCookie(str) {
      const obj = {};
      let index = 0;
      while (index < str.length) {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) {
          break;
        }
        let endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = str.length;
        } else if (endIdx < eqIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = str.slice(index, eqIdx).trim();
        if (void 0 === obj[key]) {
          let val = str.slice(eqIdx + 1, endIdx).trim();
          if (val.charCodeAt(0) === 34) {
            val = val.slice(1, -1);
          }
          try {
            obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
          } catch (e) {
            obj[key] = val;
          }
        }
        index = endIdx + 1;
      }
      return obj;
    }
    exports.parseCookie = parseCookie;
  }
});

// node_modules/@sentry/utils/cjs/url.js
var require_url = __commonJS({
  "node_modules/@sentry/utils/cjs/url.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function parseUrl(url) {
      if (!url) {
        return {};
      }
      const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
      if (!match) {
        return {};
      }
      const query = match[6] || "";
      const fragment = match[8] || "";
      return {
        host: match[4],
        path: match[5],
        protocol: match[2],
        search: query,
        hash: fragment,
        relative: match[5] + query + fragment
        // everything minus origin
      };
    }
    function stripUrlQueryAndFragment(urlPath) {
      return urlPath.split(/[\?#]/, 1)[0];
    }
    function getNumberOfUrlSegments(url) {
      return url.split(/\\?\//).filter((s) => s.length > 0 && s !== ",").length;
    }
    function getSanitizedUrlString(url) {
      const { protocol, host, path } = url;
      const filteredHost = host && host.replace(/^.*@/, "[filtered]:[filtered]@").replace(/(:80)$/, "").replace(/(:443)$/, "") || "";
      return `${protocol ? `${protocol}://` : ""}${filteredHost}${path}`;
    }
    exports.getNumberOfUrlSegments = getNumberOfUrlSegments;
    exports.getSanitizedUrlString = getSanitizedUrlString;
    exports.parseUrl = parseUrl;
    exports.stripUrlQueryAndFragment = stripUrlQueryAndFragment;
  }
});

// node_modules/@sentry/utils/cjs/requestdata.js
var require_requestdata = __commonJS({
  "node_modules/@sentry/utils/cjs/requestdata.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var cookie = require_cookie();
    var debugBuild = require_debug_build();
    var is = require_is();
    var logger5 = require_logger();
    var normalize = require_normalize();
    var url = require_url();
    var DEFAULT_INCLUDES = {
      ip: false,
      request: true,
      transaction: true,
      user: true
    };
    var DEFAULT_REQUEST_INCLUDES = ["cookies", "data", "headers", "method", "query_string", "url"];
    var DEFAULT_USER_INCLUDES = ["id", "username", "email"];
    function addRequestDataToTransaction(transaction, req, deps) {
      if (!transaction)
        return;
      if (!transaction.metadata.source || transaction.metadata.source === "url") {
        transaction.setName(...extractPathForTransaction(req, { path: true, method: true }));
      }
      transaction.setData("url", req.originalUrl || req.url);
      if (req.baseUrl) {
        transaction.setData("baseUrl", req.baseUrl);
      }
      transaction.setData("query", extractQueryParams(req, deps));
    }
    function extractPathForTransaction(req, options = {}) {
      const method = req.method && req.method.toUpperCase();
      let path = "";
      let source = "url";
      if (options.customRoute || req.route) {
        path = options.customRoute || `${req.baseUrl || ""}${req.route && req.route.path}`;
        source = "route";
      } else if (req.originalUrl || req.url) {
        path = url.stripUrlQueryAndFragment(req.originalUrl || req.url || "");
      }
      let name = "";
      if (options.method && method) {
        name += method;
      }
      if (options.method && options.path) {
        name += " ";
      }
      if (options.path && path) {
        name += path;
      }
      return [name, source];
    }
    function extractTransaction(req, type2) {
      switch (type2) {
        case "path": {
          return extractPathForTransaction(req, { path: true })[0];
        }
        case "handler": {
          return req.route && req.route.stack && req.route.stack[0] && req.route.stack[0].name || "<anonymous>";
        }
        case "methodPath":
        default: {
          const customRoute = req._reconstructedRoute ? req._reconstructedRoute : void 0;
          return extractPathForTransaction(req, { path: true, method: true, customRoute })[0];
        }
      }
    }
    function extractUserData(user, keys) {
      const extractedUser = {};
      const attributes = Array.isArray(keys) ? keys : DEFAULT_USER_INCLUDES;
      attributes.forEach((key) => {
        if (user && key in user) {
          extractedUser[key] = user[key];
        }
      });
      return extractedUser;
    }
    function extractRequestData(req, options) {
      const { include = DEFAULT_REQUEST_INCLUDES, deps } = options || {};
      const requestData = {};
      const headers = req.headers || {};
      const method = req.method;
      const host = req.hostname || req.host || headers.host || "<no host>";
      const protocol = req.protocol === "https" || req.socket && req.socket.encrypted ? "https" : "http";
      const originalUrl = req.originalUrl || req.url || "";
      const absoluteUrl = originalUrl.startsWith(protocol) ? originalUrl : `${protocol}://${host}${originalUrl}`;
      include.forEach((key) => {
        switch (key) {
          case "headers": {
            requestData.headers = headers;
            if (!include.includes("cookies")) {
              delete requestData.headers.cookie;
            }
            break;
          }
          case "method": {
            requestData.method = method;
            break;
          }
          case "url": {
            requestData.url = absoluteUrl;
            break;
          }
          case "cookies": {
            requestData.cookies = // TODO (v8 / #5257): We're only sending the empty object for backwards compatibility, so the last bit can
            // come off in v8
            req.cookies || headers.cookie && cookie.parseCookie(headers.cookie) || {};
            break;
          }
          case "query_string": {
            requestData.query_string = extractQueryParams(req, deps);
            break;
          }
          case "data": {
            if (method === "GET" || method === "HEAD") {
              break;
            }
            if (req.body !== void 0) {
              requestData.data = is.isString(req.body) ? req.body : JSON.stringify(normalize.normalize(req.body));
            }
            break;
          }
          default: {
            if ({}.hasOwnProperty.call(req, key)) {
              requestData[key] = req[key];
            }
          }
        }
      });
      return requestData;
    }
    function addRequestDataToEvent(event, req, options) {
      const include = {
        ...DEFAULT_INCLUDES,
        ...options && options.include
      };
      if (include.request) {
        const extractedRequestData = Array.isArray(include.request) ? extractRequestData(req, { include: include.request, deps: options && options.deps }) : extractRequestData(req, { deps: options && options.deps });
        event.request = {
          ...event.request,
          ...extractedRequestData
        };
      }
      if (include.user) {
        const extractedUser = req.user && is.isPlainObject(req.user) ? extractUserData(req.user, include.user) : {};
        if (Object.keys(extractedUser).length) {
          event.user = {
            ...event.user,
            ...extractedUser
          };
        }
      }
      if (include.ip) {
        const ip = req.ip || req.socket && req.socket.remoteAddress;
        if (ip) {
          event.user = {
            ...event.user,
            ip_address: ip
          };
        }
      }
      if (include.transaction && !event.transaction) {
        event.transaction = extractTransaction(req, include.transaction);
      }
      return event;
    }
    function extractQueryParams(req, deps) {
      let originalUrl = req.originalUrl || req.url || "";
      if (!originalUrl) {
        return;
      }
      if (originalUrl.startsWith("/")) {
        originalUrl = `http://dogs.are.great${originalUrl}`;
      }
      try {
        return req.query || typeof URL !== void 0 && new URL(originalUrl).search.slice(1) || // In Node 8, `URL` isn't in the global scope, so we have to use the built-in module from Node
        deps && deps.url && deps.url.parse(originalUrl).query || void 0;
      } catch (e2) {
        return void 0;
      }
    }
    function winterCGHeadersToDict(winterCGHeaders) {
      const headers = {};
      try {
        winterCGHeaders.forEach((value, key) => {
          if (typeof value === "string") {
            headers[key] = value;
          }
        });
      } catch (e) {
        debugBuild.DEBUG_BUILD && logger5.logger.warn("Sentry failed extracting headers from a request object. If you see this, please file an issue.");
      }
      return headers;
    }
    function winterCGRequestToRequestData(req) {
      const headers = winterCGHeadersToDict(req.headers);
      return {
        method: req.method,
        url: req.url,
        headers
      };
    }
    exports.DEFAULT_USER_INCLUDES = DEFAULT_USER_INCLUDES;
    exports.addRequestDataToEvent = addRequestDataToEvent;
    exports.addRequestDataToTransaction = addRequestDataToTransaction;
    exports.extractPathForTransaction = extractPathForTransaction;
    exports.extractRequestData = extractRequestData;
    exports.winterCGHeadersToDict = winterCGHeadersToDict;
    exports.winterCGRequestToRequestData = winterCGRequestToRequestData;
  }
});

// node_modules/@sentry/utils/cjs/severity.js
var require_severity = __commonJS({
  "node_modules/@sentry/utils/cjs/severity.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var validSeverityLevels = ["fatal", "error", "warning", "log", "info", "debug"];
    function severityFromString(level) {
      return severityLevelFromString(level);
    }
    function severityLevelFromString(level) {
      return level === "warn" ? "warning" : validSeverityLevels.includes(level) ? level : "log";
    }
    exports.severityFromString = severityFromString;
    exports.severityLevelFromString = severityLevelFromString;
    exports.validSeverityLevels = validSeverityLevels;
  }
});

// node_modules/@sentry/utils/cjs/time.js
var require_time = __commonJS({
  "node_modules/@sentry/utils/cjs/time.js"(exports, module2) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var node = require_node();
    var worldwide = require_worldwide();
    var WINDOW = worldwide.getGlobalObject();
    var dateTimestampSource = {
      nowSeconds: () => Date.now() / 1e3
    };
    function getBrowserPerformance() {
      const { performance: performance2 } = WINDOW;
      if (!performance2 || !performance2.now) {
        return void 0;
      }
      const timeOrigin = Date.now() - performance2.now();
      return {
        now: () => performance2.now(),
        timeOrigin
      };
    }
    function getNodePerformance() {
      try {
        const perfHooks = node.dynamicRequire(module2, "perf_hooks");
        return perfHooks.performance;
      } catch (_) {
        return void 0;
      }
    }
    var platformPerformance = node.isNodeEnv() ? getNodePerformance() : getBrowserPerformance();
    var timestampSource = platformPerformance === void 0 ? dateTimestampSource : {
      nowSeconds: () => (platformPerformance.timeOrigin + platformPerformance.now()) / 1e3
    };
    var dateTimestampInSeconds = dateTimestampSource.nowSeconds.bind(dateTimestampSource);
    var timestampInSeconds = timestampSource.nowSeconds.bind(timestampSource);
    var timestampWithMs = timestampInSeconds;
    var usingPerformanceAPI = platformPerformance !== void 0;
    exports._browserPerformanceTimeOriginMode = void 0;
    var browserPerformanceTimeOrigin = (() => {
      const { performance: performance2 } = WINDOW;
      if (!performance2 || !performance2.now) {
        exports._browserPerformanceTimeOriginMode = "none";
        return void 0;
      }
      const threshold = 3600 * 1e3;
      const performanceNow = performance2.now();
      const dateNow = Date.now();
      const timeOriginDelta = performance2.timeOrigin ? Math.abs(performance2.timeOrigin + performanceNow - dateNow) : threshold;
      const timeOriginIsReliable = timeOriginDelta < threshold;
      const navigationStart = performance2.timing && performance2.timing.navigationStart;
      const hasNavigationStart = typeof navigationStart === "number";
      const navigationStartDelta = hasNavigationStart ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
      const navigationStartIsReliable = navigationStartDelta < threshold;
      if (timeOriginIsReliable || navigationStartIsReliable) {
        if (timeOriginDelta <= navigationStartDelta) {
          exports._browserPerformanceTimeOriginMode = "timeOrigin";
          return performance2.timeOrigin;
        } else {
          exports._browserPerformanceTimeOriginMode = "navigationStart";
          return navigationStart;
        }
      }
      exports._browserPerformanceTimeOriginMode = "dateNow";
      return dateNow;
    })();
    exports.browserPerformanceTimeOrigin = browserPerformanceTimeOrigin;
    exports.dateTimestampInSeconds = dateTimestampInSeconds;
    exports.timestampInSeconds = timestampInSeconds;
    exports.timestampWithMs = timestampWithMs;
    exports.usingPerformanceAPI = usingPerformanceAPI;
  }
});

// node_modules/@sentry/utils/cjs/baggage.js
var require_baggage = __commonJS({
  "node_modules/@sentry/utils/cjs/baggage.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var debugBuild = require_debug_build();
    var is = require_is();
    var logger5 = require_logger();
    var BAGGAGE_HEADER_NAME = "baggage";
    var SENTRY_BAGGAGE_KEY_PREFIX = "sentry-";
    var SENTRY_BAGGAGE_KEY_PREFIX_REGEX = /^sentry-/;
    var MAX_BAGGAGE_STRING_LENGTH = 8192;
    function baggageHeaderToDynamicSamplingContext(baggageHeader) {
      if (!is.isString(baggageHeader) && !Array.isArray(baggageHeader)) {
        return void 0;
      }
      let baggageObject = {};
      if (Array.isArray(baggageHeader)) {
        baggageObject = baggageHeader.reduce((acc, curr) => {
          const currBaggageObject = baggageHeaderToObject(curr);
          return {
            ...acc,
            ...currBaggageObject
          };
        }, {});
      } else {
        if (!baggageHeader) {
          return void 0;
        }
        baggageObject = baggageHeaderToObject(baggageHeader);
      }
      const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
        if (key.match(SENTRY_BAGGAGE_KEY_PREFIX_REGEX)) {
          const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
          acc[nonPrefixedKey] = value;
        }
        return acc;
      }, {});
      if (Object.keys(dynamicSamplingContext).length > 0) {
        return dynamicSamplingContext;
      } else {
        return void 0;
      }
    }
    function dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext) {
      if (!dynamicSamplingContext) {
        return void 0;
      }
      const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce(
        (acc, [dscKey, dscValue]) => {
          if (dscValue) {
            acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
          }
          return acc;
        },
        {}
      );
      return objectToBaggageHeader(sentryPrefixedDSC);
    }
    function baggageHeaderToObject(baggageHeader) {
      return baggageHeader.split(",").map((baggageEntry) => baggageEntry.split("=").map((keyOrValue) => decodeURIComponent(keyOrValue.trim()))).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    }
    function objectToBaggageHeader(object) {
      if (Object.keys(object).length === 0) {
        return void 0;
      }
      return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
        const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
        const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
        if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
          debugBuild.DEBUG_BUILD && logger5.logger.warn(
            `Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`
          );
          return baggageHeader;
        } else {
          return newBaggageHeader;
        }
      }, "");
    }
    exports.BAGGAGE_HEADER_NAME = BAGGAGE_HEADER_NAME;
    exports.MAX_BAGGAGE_STRING_LENGTH = MAX_BAGGAGE_STRING_LENGTH;
    exports.SENTRY_BAGGAGE_KEY_PREFIX = SENTRY_BAGGAGE_KEY_PREFIX;
    exports.SENTRY_BAGGAGE_KEY_PREFIX_REGEX = SENTRY_BAGGAGE_KEY_PREFIX_REGEX;
    exports.baggageHeaderToDynamicSamplingContext = baggageHeaderToDynamicSamplingContext;
    exports.dynamicSamplingContextToSentryBaggageHeader = dynamicSamplingContextToSentryBaggageHeader;
  }
});

// node_modules/@sentry/utils/cjs/tracing.js
var require_tracing = __commonJS({
  "node_modules/@sentry/utils/cjs/tracing.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var baggage = require_baggage();
    var misc = require_misc();
    var TRACEPARENT_REGEXP = new RegExp(
      "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$"
      // whitespace
    );
    function extractTraceparentData(traceparent) {
      if (!traceparent) {
        return void 0;
      }
      const matches = traceparent.match(TRACEPARENT_REGEXP);
      if (!matches) {
        return void 0;
      }
      let parentSampled;
      if (matches[3] === "1") {
        parentSampled = true;
      } else if (matches[3] === "0") {
        parentSampled = false;
      }
      return {
        traceId: matches[1],
        parentSampled,
        parentSpanId: matches[2]
      };
    }
    function tracingContextFromHeaders(sentryTrace, baggage$1) {
      const traceparentData = extractTraceparentData(sentryTrace);
      const dynamicSamplingContext = baggage.baggageHeaderToDynamicSamplingContext(baggage$1);
      const { traceId, parentSpanId, parentSampled } = traceparentData || {};
      const propagationContext = {
        traceId: traceId || misc.uuid4(),
        spanId: misc.uuid4().substring(16),
        sampled: parentSampled
      };
      if (parentSpanId) {
        propagationContext.parentSpanId = parentSpanId;
      }
      if (dynamicSamplingContext) {
        propagationContext.dsc = dynamicSamplingContext;
      }
      return {
        traceparentData,
        dynamicSamplingContext,
        propagationContext
      };
    }
    function generateSentryTraceHeader(traceId = misc.uuid4(), spanId = misc.uuid4().substring(16), sampled) {
      let sampledString = "";
      if (sampled !== void 0) {
        sampledString = sampled ? "-1" : "-0";
      }
      return `${traceId}-${spanId}${sampledString}`;
    }
    exports.TRACEPARENT_REGEXP = TRACEPARENT_REGEXP;
    exports.extractTraceparentData = extractTraceparentData;
    exports.generateSentryTraceHeader = generateSentryTraceHeader;
    exports.tracingContextFromHeaders = tracingContextFromHeaders;
  }
});

// node_modules/@sentry/utils/cjs/envelope.js
var require_envelope = __commonJS({
  "node_modules/@sentry/utils/cjs/envelope.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var dsn = require_dsn();
    var normalize = require_normalize();
    var object = require_object();
    function createEnvelope2(headers, items = []) {
      return [headers, items];
    }
    function addItemToEnvelope(envelope, newItem) {
      const [headers, items] = envelope;
      return [headers, [...items, newItem]];
    }
    function forEachEnvelopeItem2(envelope, callback) {
      const envelopeItems = envelope[1];
      for (const envelopeItem of envelopeItems) {
        const envelopeItemType = envelopeItem[0].type;
        const result = callback(envelopeItem, envelopeItemType);
        if (result) {
          return true;
        }
      }
      return false;
    }
    function envelopeContainsItemType(envelope, types) {
      return forEachEnvelopeItem2(envelope, (_, type2) => types.includes(type2));
    }
    function encodeUTF8(input, textEncoder) {
      const utf8 = textEncoder || new TextEncoder();
      return utf8.encode(input);
    }
    function serializeEnvelope(envelope, textEncoder) {
      const [envHeaders, items] = envelope;
      let parts = JSON.stringify(envHeaders);
      function append(next) {
        if (typeof parts === "string") {
          parts = typeof next === "string" ? parts + next : [encodeUTF8(parts, textEncoder), next];
        } else {
          parts.push(typeof next === "string" ? encodeUTF8(next, textEncoder) : next);
        }
      }
      for (const item of items) {
        const [itemHeaders, payload] = item;
        append(`
${JSON.stringify(itemHeaders)}
`);
        if (typeof payload === "string" || payload instanceof Uint8Array) {
          append(payload);
        } else {
          let stringifiedPayload;
          try {
            stringifiedPayload = JSON.stringify(payload);
          } catch (e) {
            stringifiedPayload = JSON.stringify(normalize.normalize(payload));
          }
          append(stringifiedPayload);
        }
      }
      return typeof parts === "string" ? parts : concatBuffers(parts);
    }
    function concatBuffers(buffers) {
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const merged = new Uint8Array(totalLength);
      let offset = 0;
      for (const buffer of buffers) {
        merged.set(buffer, offset);
        offset += buffer.length;
      }
      return merged;
    }
    function parseEnvelope(env3, textEncoder, textDecoder) {
      let buffer = typeof env3 === "string" ? textEncoder.encode(env3) : env3;
      function readBinary(length) {
        const bin = buffer.subarray(0, length);
        buffer = buffer.subarray(length + 1);
        return bin;
      }
      function readJson() {
        let i = buffer.indexOf(10);
        if (i < 0) {
          i = buffer.length;
        }
        return JSON.parse(textDecoder.decode(readBinary(i)));
      }
      const envelopeHeader = readJson();
      const items = [];
      while (buffer.length) {
        const itemHeader = readJson();
        const binaryLength = typeof itemHeader.length === "number" ? itemHeader.length : void 0;
        items.push([itemHeader, binaryLength ? readBinary(binaryLength) : readJson()]);
      }
      return [envelopeHeader, items];
    }
    function createAttachmentEnvelopeItem(attachment, textEncoder) {
      const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data, textEncoder) : attachment.data;
      return [
        object.dropUndefinedKeys({
          type: "attachment",
          length: buffer.length,
          filename: attachment.filename,
          content_type: attachment.contentType,
          attachment_type: attachment.attachmentType
        }),
        buffer
      ];
    }
    var ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
      session: "session",
      sessions: "session",
      attachment: "attachment",
      transaction: "transaction",
      event: "error",
      client_report: "internal",
      user_report: "default",
      profile: "profile",
      replay_event: "replay",
      replay_recording: "replay",
      check_in: "monitor",
      feedback: "feedback",
      // TODO: This is a temporary workaround until we have a proper data category for metrics
      statsd: "unknown"
    };
    function envelopeItemTypeToDataCategory(type2) {
      return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type2];
    }
    function getSdkMetadataForEnvelopeHeader2(metadataOrEvent) {
      if (!metadataOrEvent || !metadataOrEvent.sdk) {
        return;
      }
      const { name, version: version2 } = metadataOrEvent.sdk;
      return { name, version: version2 };
    }
    function createEventEnvelopeHeaders2(event, sdkInfo, tunnel, dsn$1) {
      const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
      return {
        event_id: event.event_id,
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        ...sdkInfo && { sdk: sdkInfo },
        ...!!tunnel && dsn$1 && { dsn: dsn.dsnToString(dsn$1) },
        ...dynamicSamplingContext && {
          trace: object.dropUndefinedKeys({ ...dynamicSamplingContext })
        }
      };
    }
    exports.addItemToEnvelope = addItemToEnvelope;
    exports.createAttachmentEnvelopeItem = createAttachmentEnvelopeItem;
    exports.createEnvelope = createEnvelope2;
    exports.createEventEnvelopeHeaders = createEventEnvelopeHeaders2;
    exports.envelopeContainsItemType = envelopeContainsItemType;
    exports.envelopeItemTypeToDataCategory = envelopeItemTypeToDataCategory;
    exports.forEachEnvelopeItem = forEachEnvelopeItem2;
    exports.getSdkMetadataForEnvelopeHeader = getSdkMetadataForEnvelopeHeader2;
    exports.parseEnvelope = parseEnvelope;
    exports.serializeEnvelope = serializeEnvelope;
  }
});

// node_modules/@sentry/utils/cjs/clientreport.js
var require_clientreport = __commonJS({
  "node_modules/@sentry/utils/cjs/clientreport.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var envelope = require_envelope();
    var time = require_time();
    function createClientReportEnvelope(discarded_events, dsn, timestamp) {
      const clientReportItem = [
        { type: "client_report" },
        {
          timestamp: timestamp || time.dateTimestampInSeconds(),
          discarded_events
        }
      ];
      return envelope.createEnvelope(dsn ? { dsn } : {}, [clientReportItem]);
    }
    exports.createClientReportEnvelope = createClientReportEnvelope;
  }
});

// node_modules/@sentry/utils/cjs/ratelimit.js
var require_ratelimit = __commonJS({
  "node_modules/@sentry/utils/cjs/ratelimit.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_RETRY_AFTER = 60 * 1e3;
    function parseRetryAfterHeader(header, now = Date.now()) {
      const headerDelay = parseInt(`${header}`, 10);
      if (!isNaN(headerDelay)) {
        return headerDelay * 1e3;
      }
      const headerDate = Date.parse(`${header}`);
      if (!isNaN(headerDate)) {
        return headerDate - now;
      }
      return DEFAULT_RETRY_AFTER;
    }
    function disabledUntil(limits, category) {
      return limits[category] || limits.all || 0;
    }
    function isRateLimited(limits, category, now = Date.now()) {
      return disabledUntil(limits, category) > now;
    }
    function updateRateLimits(limits, { statusCode, headers }, now = Date.now()) {
      const updatedRateLimits = {
        ...limits
      };
      const rateLimitHeader = headers && headers["x-sentry-rate-limits"];
      const retryAfterHeader = headers && headers["retry-after"];
      if (rateLimitHeader) {
        for (const limit of rateLimitHeader.trim().split(",")) {
          const [retryAfter, categories] = limit.split(":", 2);
          const headerDelay = parseInt(retryAfter, 10);
          const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
          if (!categories) {
            updatedRateLimits.all = now + delay;
          } else {
            for (const category of categories.split(";")) {
              updatedRateLimits[category] = now + delay;
            }
          }
        }
      } else if (retryAfterHeader) {
        updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
      } else if (statusCode === 429) {
        updatedRateLimits.all = now + 60 * 1e3;
      }
      return updatedRateLimits;
    }
    exports.DEFAULT_RETRY_AFTER = DEFAULT_RETRY_AFTER;
    exports.disabledUntil = disabledUntil;
    exports.isRateLimited = isRateLimited;
    exports.parseRetryAfterHeader = parseRetryAfterHeader;
    exports.updateRateLimits = updateRateLimits;
  }
});

// node_modules/@sentry/utils/cjs/userIntegrations.js
var require_userIntegrations = __commonJS({
  "node_modules/@sentry/utils/cjs/userIntegrations.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function setNestedKey(obj, keyPath, value) {
      const match = keyPath.match(/([a-z_]+)\.(.*)/i);
      if (match === null) {
        obj[keyPath] = value;
      } else {
        const innerObj = obj[match[1]];
        setNestedKey(innerObj, match[2], value);
      }
    }
    function addOrUpdateIntegration(defaultIntegrationInstance, userIntegrations, forcedOptions = {}) {
      return Array.isArray(userIntegrations) ? addOrUpdateIntegrationInArray(defaultIntegrationInstance, userIntegrations, forcedOptions) : addOrUpdateIntegrationInFunction(
        defaultIntegrationInstance,
        // Somehow TS can't figure out that not being an array makes this necessarily a function
        userIntegrations,
        forcedOptions
      );
    }
    function addOrUpdateIntegrationInArray(defaultIntegrationInstance, userIntegrations, forcedOptions) {
      const userInstance = userIntegrations.find((integration) => integration.name === defaultIntegrationInstance.name);
      if (userInstance) {
        for (const [keyPath, value] of Object.entries(forcedOptions)) {
          setNestedKey(userInstance, keyPath, value);
        }
        return userIntegrations;
      }
      return [...userIntegrations, defaultIntegrationInstance];
    }
    function addOrUpdateIntegrationInFunction(defaultIntegrationInstance, userIntegrationsFunc, forcedOptions) {
      const wrapper = (defaultIntegrations) => {
        const userFinalIntegrations = userIntegrationsFunc(defaultIntegrations);
        if (defaultIntegrationInstance.allowExclusionByUser) {
          const userFinalInstance = userFinalIntegrations.find(
            (integration) => integration.name === defaultIntegrationInstance.name
          );
          if (!userFinalInstance) {
            return userFinalIntegrations;
          }
        }
        return addOrUpdateIntegrationInArray(defaultIntegrationInstance, userFinalIntegrations, forcedOptions);
      };
      return wrapper;
    }
    exports.addOrUpdateIntegration = addOrUpdateIntegration;
  }
});

// node_modules/@sentry/utils/cjs/cache.js
var require_cache = __commonJS({
  "node_modules/@sentry/utils/cjs/cache.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeFifoCache(size) {
      let evictionOrder = [];
      let cache = {};
      return {
        add(key, value) {
          while (evictionOrder.length >= size) {
            const evictCandidate = evictionOrder.shift();
            if (evictCandidate !== void 0) {
              delete cache[evictCandidate];
            }
          }
          if (cache[key]) {
            this.delete(key);
          }
          evictionOrder.push(key);
          cache[key] = value;
        },
        clear() {
          cache = {};
          evictionOrder = [];
        },
        get(key) {
          return cache[key];
        },
        size() {
          return evictionOrder.length;
        },
        // Delete cache key and return true if it existed, false otherwise.
        delete(key) {
          if (!cache[key]) {
            return false;
          }
          delete cache[key];
          for (let i = 0; i < evictionOrder.length; i++) {
            if (evictionOrder[i] === key) {
              evictionOrder.splice(i, 1);
              break;
            }
          }
          return true;
        }
      };
    }
    exports.makeFifoCache = makeFifoCache;
  }
});

// node_modules/@sentry/utils/cjs/eventbuilder.js
var require_eventbuilder = __commonJS({
  "node_modules/@sentry/utils/cjs/eventbuilder.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var is = require_is();
    var misc = require_misc();
    var normalize = require_normalize();
    var object = require_object();
    function parseStackFrames(stackParser, error) {
      return stackParser(error.stack || "", 1);
    }
    function exceptionFromError(stackParser, error) {
      const exception = {
        type: error.name || error.constructor.name,
        value: error.message
      };
      const frames = parseStackFrames(stackParser, error);
      if (frames.length) {
        exception.stacktrace = { frames };
      }
      return exception;
    }
    function getMessageForObject(exception) {
      if ("name" in exception && typeof exception.name === "string") {
        let message = `'${exception.name}' captured as exception`;
        if ("message" in exception && typeof exception.message === "string") {
          message += ` with message '${exception.message}'`;
        }
        return message;
      } else if ("message" in exception && typeof exception.message === "string") {
        return exception.message;
      } else {
        return `Object captured as exception with keys: ${object.extractExceptionKeysForMessage(
          exception
        )}`;
      }
    }
    function eventFromUnknownInput(getCurrentHub2, stackParser, exception, hint) {
      let ex = exception;
      const providedMechanism = hint && hint.data && hint.data.mechanism;
      const mechanism = providedMechanism || {
        handled: true,
        type: "generic"
      };
      if (!is.isError(exception)) {
        if (is.isPlainObject(exception)) {
          const hub = getCurrentHub2();
          const client = hub.getClient();
          const normalizeDepth = client && client.getOptions().normalizeDepth;
          hub.configureScope((scope) => {
            scope.setExtra("__serialized__", normalize.normalizeToSize(exception, normalizeDepth));
          });
          const message = getMessageForObject(exception);
          ex = hint && hint.syntheticException || new Error(message);
          ex.message = message;
        } else {
          ex = hint && hint.syntheticException || new Error(exception);
          ex.message = exception;
        }
        mechanism.synthetic = true;
      }
      const event = {
        exception: {
          values: [exceptionFromError(stackParser, ex)]
        }
      };
      misc.addExceptionTypeValue(event, void 0, void 0);
      misc.addExceptionMechanism(event, mechanism);
      return {
        ...event,
        event_id: hint && hint.event_id
      };
    }
    function eventFromMessage(stackParser, message, level = "info", hint, attachStacktrace) {
      const event = {
        event_id: hint && hint.event_id,
        level,
        message
      };
      if (attachStacktrace && hint && hint.syntheticException) {
        const frames = parseStackFrames(stackParser, hint.syntheticException);
        if (frames.length) {
          event.exception = {
            values: [
              {
                value: message,
                stacktrace: { frames }
              }
            ]
          };
        }
      }
      return event;
    }
    exports.eventFromMessage = eventFromMessage;
    exports.eventFromUnknownInput = eventFromUnknownInput;
    exports.exceptionFromError = exceptionFromError;
    exports.parseStackFrames = parseStackFrames;
  }
});

// node_modules/@sentry/utils/cjs/anr.js
var require_anr = __commonJS({
  "node_modules/@sentry/utils/cjs/anr.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var object = require_object();
    var stacktrace = require_stacktrace();
    var nodeStackTrace = require_node_stack_trace();
    function watchdogTimer(createTimer, pollInterval, anrThreshold, callback) {
      const timer = createTimer();
      let triggered = false;
      let enabled = true;
      setInterval(() => {
        const diffMs = timer.getTimeMs();
        if (triggered === false && diffMs > pollInterval + anrThreshold) {
          triggered = true;
          if (enabled) {
            callback();
          }
        }
        if (diffMs < pollInterval + anrThreshold) {
          triggered = false;
        }
      }, 20);
      return {
        poll: () => {
          timer.reset();
        },
        enabled: (state) => {
          enabled = state;
        }
      };
    }
    function callFrameToStackFrame(frame, url, getModuleFromFilename) {
      const filename = url ? url.replace(/^file:\/\//, "") : void 0;
      const colno = frame.location.columnNumber ? frame.location.columnNumber + 1 : void 0;
      const lineno = frame.location.lineNumber ? frame.location.lineNumber + 1 : void 0;
      return object.dropUndefinedKeys({
        filename,
        module: getModuleFromFilename(filename),
        function: frame.functionName || "?",
        colno,
        lineno,
        in_app: filename ? nodeStackTrace.filenameIsInApp(filename) : void 0
      });
    }
    function createDebugPauseMessageHandler(sendCommand, getModuleFromFilename, pausedStackFrames) {
      const scripts = /* @__PURE__ */ new Map();
      return (message) => {
        if (message.method === "Debugger.scriptParsed") {
          scripts.set(message.params.scriptId, message.params.url);
        } else if (message.method === "Debugger.paused") {
          const callFrames = [...message.params.callFrames];
          sendCommand("Debugger.resume");
          sendCommand("Debugger.disable");
          const stackFrames = stacktrace.stripSentryFramesAndReverse(
            callFrames.map(
              (frame) => callFrameToStackFrame(frame, scripts.get(frame.location.scriptId), getModuleFromFilename)
            )
          );
          pausedStackFrames(stackFrames);
        }
      };
    }
    exports.createDebugPauseMessageHandler = createDebugPauseMessageHandler;
    exports.watchdogTimer = watchdogTimer;
  }
});

// node_modules/@sentry/utils/cjs/lru.js
var require_lru = __commonJS({
  "node_modules/@sentry/utils/cjs/lru.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var LRUMap = class {
      constructor(_maxSize) {
        this._maxSize = _maxSize;
        this._cache = /* @__PURE__ */ new Map();
      }
      /** Get the current size of the cache */
      get size() {
        return this._cache.size;
      }
      /** Get an entry or undefined if it was not in the cache. Re-inserts to update the recently used order */
      get(key) {
        const value = this._cache.get(key);
        if (value === void 0) {
          return void 0;
        }
        this._cache.delete(key);
        this._cache.set(key, value);
        return value;
      }
      /** Insert an entry and evict an older entry if we've reached maxSize */
      set(key, value) {
        if (this._cache.size >= this._maxSize) {
          this._cache.delete(this._cache.keys().next().value);
        }
        this._cache.set(key, value);
      }
      /** Remove an entry and return the entry if it was in the cache */
      remove(key) {
        const value = this._cache.get(key);
        if (value) {
          this._cache.delete(key);
        }
        return value;
      }
      /** Clear all entries */
      clear() {
        this._cache.clear();
      }
      /** Get all the keys */
      keys() {
        return Array.from(this._cache.keys());
      }
      /** Get all the values */
      values() {
        const values = [];
        this._cache.forEach((value) => values.push(value));
        return values;
      }
    };
    exports.LRUMap = LRUMap;
  }
});

// node_modules/@sentry/utils/cjs/buildPolyfills/_nullishCoalesce.js
var require_nullishCoalesce = __commonJS({
  "node_modules/@sentry/utils/cjs/buildPolyfills/_nullishCoalesce.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function _nullishCoalesce(lhs, rhsFn) {
      return lhs != null ? lhs : rhsFn();
    }
    exports._nullishCoalesce = _nullishCoalesce;
  }
});

// node_modules/@sentry/utils/cjs/buildPolyfills/_asyncNullishCoalesce.js
var require_asyncNullishCoalesce = __commonJS({
  "node_modules/@sentry/utils/cjs/buildPolyfills/_asyncNullishCoalesce.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _nullishCoalesce = require_nullishCoalesce();
    async function _asyncNullishCoalesce(lhs, rhsFn) {
      return _nullishCoalesce._nullishCoalesce(lhs, rhsFn);
    }
    exports._asyncNullishCoalesce = _asyncNullishCoalesce;
  }
});

// node_modules/@sentry/utils/cjs/buildPolyfills/_asyncOptionalChain.js
var require_asyncOptionalChain = __commonJS({
  "node_modules/@sentry/utils/cjs/buildPolyfills/_asyncOptionalChain.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    async function _asyncOptionalChain(ops) {
      let lastAccessLHS = void 0;
      let value = ops[0];
      let i = 1;
      while (i < ops.length) {
        const op = ops[i];
        const fn = ops[i + 1];
        i += 2;
        if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
          return;
        }
        if (op === "access" || op === "optionalAccess") {
          lastAccessLHS = value;
          value = await fn(value);
        } else if (op === "call" || op === "optionalCall") {
          value = await fn((...args) => value.call(lastAccessLHS, ...args));
          lastAccessLHS = void 0;
        }
      }
      return value;
    }
    exports._asyncOptionalChain = _asyncOptionalChain;
  }
});

// node_modules/@sentry/utils/cjs/buildPolyfills/_asyncOptionalChainDelete.js
var require_asyncOptionalChainDelete = __commonJS({
  "node_modules/@sentry/utils/cjs/buildPolyfills/_asyncOptionalChainDelete.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _asyncOptionalChain = require_asyncOptionalChain();
    async function _asyncOptionalChainDelete(ops) {
      const result = await _asyncOptionalChain._asyncOptionalChain(ops);
      return result == null ? true : result;
    }
    exports._asyncOptionalChainDelete = _asyncOptionalChainDelete;
  }
});

// node_modules/@sentry/utils/cjs/buildPolyfills/_optionalChain.js
var require_optionalChain = __commonJS({
  "node_modules/@sentry/utils/cjs/buildPolyfills/_optionalChain.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function _optionalChain(ops) {
      let lastAccessLHS = void 0;
      let value = ops[0];
      let i = 1;
      while (i < ops.length) {
        const op = ops[i];
        const fn = ops[i + 1];
        i += 2;
        if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
          return;
        }
        if (op === "access" || op === "optionalAccess") {
          lastAccessLHS = value;
          value = fn(value);
        } else if (op === "call" || op === "optionalCall") {
          value = fn((...args) => value.call(lastAccessLHS, ...args));
          lastAccessLHS = void 0;
        }
      }
      return value;
    }
    exports._optionalChain = _optionalChain;
  }
});

// node_modules/@sentry/utils/cjs/buildPolyfills/_optionalChainDelete.js
var require_optionalChainDelete = __commonJS({
  "node_modules/@sentry/utils/cjs/buildPolyfills/_optionalChainDelete.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var _optionalChain = require_optionalChain();
    function _optionalChainDelete(ops) {
      const result = _optionalChain._optionalChain(ops);
      return result == null ? true : result;
    }
    exports._optionalChainDelete = _optionalChainDelete;
  }
});

// node_modules/@sentry/utils/cjs/vendor/escapeStringForRegex.js
var require_escapeStringForRegex = __commonJS({
  "node_modules/@sentry/utils/cjs/vendor/escapeStringForRegex.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function escapeStringForRegex(regexString) {
      return regexString.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
    }
    exports.escapeStringForRegex = escapeStringForRegex;
  }
});

// node_modules/@sentry/utils/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/@sentry/utils/cjs/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var aggregateErrors = require_aggregate_errors();
    var browser = require_browser();
    var dsn = require_dsn();
    var error = require_error();
    var worldwide = require_worldwide();
    var index = require_instrument();
    var is = require_is();
    var isBrowser = require_isBrowser();
    var logger5 = require_logger();
    var memo = require_memo();
    var misc = require_misc();
    var node = require_node();
    var normalize = require_normalize();
    var object = require_object();
    var path = require_path();
    var promisebuffer = require_promisebuffer();
    var requestdata = require_requestdata();
    var severity = require_severity();
    var stacktrace = require_stacktrace();
    var string = require_string();
    var supports = require_supports();
    var syncpromise = require_syncpromise();
    var time = require_time();
    var tracing = require_tracing();
    var env3 = require_env();
    var envelope = require_envelope();
    var clientreport = require_clientreport();
    var ratelimit = require_ratelimit();
    var baggage = require_baggage();
    var url = require_url();
    var userIntegrations = require_userIntegrations();
    var cache = require_cache();
    var eventbuilder = require_eventbuilder();
    var anr = require_anr();
    var lru = require_lru();
    var _asyncNullishCoalesce = require_asyncNullishCoalesce();
    var _asyncOptionalChain = require_asyncOptionalChain();
    var _asyncOptionalChainDelete = require_asyncOptionalChainDelete();
    var _nullishCoalesce = require_nullishCoalesce();
    var _optionalChain = require_optionalChain();
    var _optionalChainDelete = require_optionalChainDelete();
    var console2 = require_console();
    var dom = require_dom();
    var xhr = require_xhr();
    var fetch = require_fetch();
    var history = require_history();
    var globalError = require_globalError();
    var globalUnhandledRejection = require_globalUnhandledRejection();
    var _handlers = require_handlers();
    var nodeStackTrace = require_node_stack_trace();
    var escapeStringForRegex = require_escapeStringForRegex();
    var supportsHistory = require_supportsHistory();
    exports.applyAggregateErrorsToEvent = aggregateErrors.applyAggregateErrorsToEvent;
    exports.getDomElement = browser.getDomElement;
    exports.getLocationHref = browser.getLocationHref;
    exports.htmlTreeAsString = browser.htmlTreeAsString;
    exports.dsnFromString = dsn.dsnFromString;
    exports.dsnToString = dsn.dsnToString;
    exports.makeDsn = dsn.makeDsn;
    exports.SentryError = error.SentryError;
    exports.GLOBAL_OBJ = worldwide.GLOBAL_OBJ;
    exports.getGlobalObject = worldwide.getGlobalObject;
    exports.getGlobalSingleton = worldwide.getGlobalSingleton;
    exports.addInstrumentationHandler = index.addInstrumentationHandler;
    exports.isDOMError = is.isDOMError;
    exports.isDOMException = is.isDOMException;
    exports.isElement = is.isElement;
    exports.isError = is.isError;
    exports.isErrorEvent = is.isErrorEvent;
    exports.isEvent = is.isEvent;
    exports.isInstanceOf = is.isInstanceOf;
    exports.isNaN = is.isNaN;
    exports.isPlainObject = is.isPlainObject;
    exports.isPrimitive = is.isPrimitive;
    exports.isRegExp = is.isRegExp;
    exports.isString = is.isString;
    exports.isSyntheticEvent = is.isSyntheticEvent;
    exports.isThenable = is.isThenable;
    exports.isVueViewModel = is.isVueViewModel;
    exports.isBrowser = isBrowser.isBrowser;
    exports.CONSOLE_LEVELS = logger5.CONSOLE_LEVELS;
    exports.consoleSandbox = logger5.consoleSandbox;
    exports.logger = logger5.logger;
    exports.originalConsoleMethods = logger5.originalConsoleMethods;
    exports.memoBuilder = memo.memoBuilder;
    exports.addContextToFrame = misc.addContextToFrame;
    exports.addExceptionMechanism = misc.addExceptionMechanism;
    exports.addExceptionTypeValue = misc.addExceptionTypeValue;
    exports.arrayify = misc.arrayify;
    exports.checkOrSetAlreadyCaught = misc.checkOrSetAlreadyCaught;
    exports.getEventDescription = misc.getEventDescription;
    exports.parseSemver = misc.parseSemver;
    exports.uuid4 = misc.uuid4;
    exports.dynamicRequire = node.dynamicRequire;
    exports.isNodeEnv = node.isNodeEnv;
    exports.loadModule = node.loadModule;
    exports.normalize = normalize.normalize;
    exports.normalizeToSize = normalize.normalizeToSize;
    exports.walk = normalize.walk;
    exports.addNonEnumerableProperty = object.addNonEnumerableProperty;
    exports.convertToPlainObject = object.convertToPlainObject;
    exports.dropUndefinedKeys = object.dropUndefinedKeys;
    exports.extractExceptionKeysForMessage = object.extractExceptionKeysForMessage;
    exports.fill = object.fill;
    exports.getOriginalFunction = object.getOriginalFunction;
    exports.markFunctionWrapped = object.markFunctionWrapped;
    exports.objectify = object.objectify;
    exports.urlEncode = object.urlEncode;
    exports.basename = path.basename;
    exports.dirname = path.dirname;
    exports.isAbsolute = path.isAbsolute;
    exports.join = path.join;
    exports.normalizePath = path.normalizePath;
    exports.relative = path.relative;
    exports.resolve = path.resolve;
    exports.makePromiseBuffer = promisebuffer.makePromiseBuffer;
    exports.DEFAULT_USER_INCLUDES = requestdata.DEFAULT_USER_INCLUDES;
    exports.addRequestDataToEvent = requestdata.addRequestDataToEvent;
    exports.addRequestDataToTransaction = requestdata.addRequestDataToTransaction;
    exports.extractPathForTransaction = requestdata.extractPathForTransaction;
    exports.extractRequestData = requestdata.extractRequestData;
    exports.winterCGHeadersToDict = requestdata.winterCGHeadersToDict;
    exports.winterCGRequestToRequestData = requestdata.winterCGRequestToRequestData;
    exports.severityFromString = severity.severityFromString;
    exports.severityLevelFromString = severity.severityLevelFromString;
    exports.validSeverityLevels = severity.validSeverityLevels;
    exports.createStackParser = stacktrace.createStackParser;
    exports.getFunctionName = stacktrace.getFunctionName;
    exports.nodeStackLineParser = stacktrace.nodeStackLineParser;
    exports.stackParserFromStackParserOptions = stacktrace.stackParserFromStackParserOptions;
    exports.stripSentryFramesAndReverse = stacktrace.stripSentryFramesAndReverse;
    exports.isMatchingPattern = string.isMatchingPattern;
    exports.safeJoin = string.safeJoin;
    exports.snipLine = string.snipLine;
    exports.stringMatchesSomePattern = string.stringMatchesSomePattern;
    exports.truncate = string.truncate;
    exports.isNativeFetch = supports.isNativeFetch;
    exports.supportsDOMError = supports.supportsDOMError;
    exports.supportsDOMException = supports.supportsDOMException;
    exports.supportsErrorEvent = supports.supportsErrorEvent;
    exports.supportsFetch = supports.supportsFetch;
    exports.supportsNativeFetch = supports.supportsNativeFetch;
    exports.supportsReferrerPolicy = supports.supportsReferrerPolicy;
    exports.supportsReportingObserver = supports.supportsReportingObserver;
    exports.SyncPromise = syncpromise.SyncPromise;
    exports.rejectedSyncPromise = syncpromise.rejectedSyncPromise;
    exports.resolvedSyncPromise = syncpromise.resolvedSyncPromise;
    Object.defineProperty(exports, "_browserPerformanceTimeOriginMode", {
      enumerable: true,
      get: () => time._browserPerformanceTimeOriginMode
    });
    exports.browserPerformanceTimeOrigin = time.browserPerformanceTimeOrigin;
    exports.dateTimestampInSeconds = time.dateTimestampInSeconds;
    exports.timestampInSeconds = time.timestampInSeconds;
    exports.timestampWithMs = time.timestampWithMs;
    exports.usingPerformanceAPI = time.usingPerformanceAPI;
    exports.TRACEPARENT_REGEXP = tracing.TRACEPARENT_REGEXP;
    exports.extractTraceparentData = tracing.extractTraceparentData;
    exports.generateSentryTraceHeader = tracing.generateSentryTraceHeader;
    exports.tracingContextFromHeaders = tracing.tracingContextFromHeaders;
    exports.getSDKSource = env3.getSDKSource;
    exports.isBrowserBundle = env3.isBrowserBundle;
    exports.addItemToEnvelope = envelope.addItemToEnvelope;
    exports.createAttachmentEnvelopeItem = envelope.createAttachmentEnvelopeItem;
    exports.createEnvelope = envelope.createEnvelope;
    exports.createEventEnvelopeHeaders = envelope.createEventEnvelopeHeaders;
    exports.envelopeContainsItemType = envelope.envelopeContainsItemType;
    exports.envelopeItemTypeToDataCategory = envelope.envelopeItemTypeToDataCategory;
    exports.forEachEnvelopeItem = envelope.forEachEnvelopeItem;
    exports.getSdkMetadataForEnvelopeHeader = envelope.getSdkMetadataForEnvelopeHeader;
    exports.parseEnvelope = envelope.parseEnvelope;
    exports.serializeEnvelope = envelope.serializeEnvelope;
    exports.createClientReportEnvelope = clientreport.createClientReportEnvelope;
    exports.DEFAULT_RETRY_AFTER = ratelimit.DEFAULT_RETRY_AFTER;
    exports.disabledUntil = ratelimit.disabledUntil;
    exports.isRateLimited = ratelimit.isRateLimited;
    exports.parseRetryAfterHeader = ratelimit.parseRetryAfterHeader;
    exports.updateRateLimits = ratelimit.updateRateLimits;
    exports.BAGGAGE_HEADER_NAME = baggage.BAGGAGE_HEADER_NAME;
    exports.MAX_BAGGAGE_STRING_LENGTH = baggage.MAX_BAGGAGE_STRING_LENGTH;
    exports.SENTRY_BAGGAGE_KEY_PREFIX = baggage.SENTRY_BAGGAGE_KEY_PREFIX;
    exports.SENTRY_BAGGAGE_KEY_PREFIX_REGEX = baggage.SENTRY_BAGGAGE_KEY_PREFIX_REGEX;
    exports.baggageHeaderToDynamicSamplingContext = baggage.baggageHeaderToDynamicSamplingContext;
    exports.dynamicSamplingContextToSentryBaggageHeader = baggage.dynamicSamplingContextToSentryBaggageHeader;
    exports.getNumberOfUrlSegments = url.getNumberOfUrlSegments;
    exports.getSanitizedUrlString = url.getSanitizedUrlString;
    exports.parseUrl = url.parseUrl;
    exports.stripUrlQueryAndFragment = url.stripUrlQueryAndFragment;
    exports.addOrUpdateIntegration = userIntegrations.addOrUpdateIntegration;
    exports.makeFifoCache = cache.makeFifoCache;
    exports.eventFromMessage = eventbuilder.eventFromMessage;
    exports.eventFromUnknownInput = eventbuilder.eventFromUnknownInput;
    exports.exceptionFromError = eventbuilder.exceptionFromError;
    exports.parseStackFrames = eventbuilder.parseStackFrames;
    exports.createDebugPauseMessageHandler = anr.createDebugPauseMessageHandler;
    exports.watchdogTimer = anr.watchdogTimer;
    exports.LRUMap = lru.LRUMap;
    exports._asyncNullishCoalesce = _asyncNullishCoalesce._asyncNullishCoalesce;
    exports._asyncOptionalChain = _asyncOptionalChain._asyncOptionalChain;
    exports._asyncOptionalChainDelete = _asyncOptionalChainDelete._asyncOptionalChainDelete;
    exports._nullishCoalesce = _nullishCoalesce._nullishCoalesce;
    exports._optionalChain = _optionalChain._optionalChain;
    exports._optionalChainDelete = _optionalChainDelete._optionalChainDelete;
    exports.addConsoleInstrumentationHandler = console2.addConsoleInstrumentationHandler;
    exports.addClickKeypressInstrumentationHandler = dom.addClickKeypressInstrumentationHandler;
    exports.SENTRY_XHR_DATA_KEY = xhr.SENTRY_XHR_DATA_KEY;
    exports.addXhrInstrumentationHandler = xhr.addXhrInstrumentationHandler;
    exports.addFetchInstrumentationHandler = fetch.addFetchInstrumentationHandler;
    exports.addHistoryInstrumentationHandler = history.addHistoryInstrumentationHandler;
    exports.addGlobalErrorInstrumentationHandler = globalError.addGlobalErrorInstrumentationHandler;
    exports.addGlobalUnhandledRejectionInstrumentationHandler = globalUnhandledRejection.addGlobalUnhandledRejectionInstrumentationHandler;
    exports.resetInstrumentationHandlers = _handlers.resetInstrumentationHandlers;
    exports.filenameIsInApp = nodeStackTrace.filenameIsInApp;
    exports.escapeStringForRegex = escapeStringForRegex.escapeStringForRegex;
    exports.supportsHistory = supportsHistory.supportsHistory;
  }
});

// node_modules/@sentry/core/cjs/debug-build.js
var require_debug_build2 = __commonJS({
  "node_modules/@sentry/core/cjs/debug-build.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
    exports.DEBUG_BUILD = DEBUG_BUILD;
  }
});

// node_modules/@sentry/core/cjs/constants.js
var require_constants = __commonJS({
  "node_modules/@sentry/core/cjs/constants.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_ENVIRONMENT = "production";
    exports.DEFAULT_ENVIRONMENT = DEFAULT_ENVIRONMENT;
  }
});

// node_modules/@sentry/core/cjs/eventProcessors.js
var require_eventProcessors = __commonJS({
  "node_modules/@sentry/core/cjs/eventProcessors.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    function getGlobalEventProcessors() {
      return utils.getGlobalSingleton("globalEventProcessors", () => []);
    }
    function addGlobalEventProcessor(callback) {
      getGlobalEventProcessors().push(callback);
    }
    function notifyEventProcessors(processors, event, hint, index = 0) {
      return new utils.SyncPromise((resolve2, reject) => {
        const processor = processors[index];
        if (event === null || typeof processor !== "function") {
          resolve2(event);
        } else {
          const result = processor({ ...event }, hint);
          debugBuild.DEBUG_BUILD && processor.id && result === null && utils.logger.log(`Event processor "${processor.id}" dropped event`);
          if (utils.isThenable(result)) {
            void result.then((final) => notifyEventProcessors(processors, final, hint, index + 1).then(resolve2)).then(null, reject);
          } else {
            void notifyEventProcessors(processors, result, hint, index + 1).then(resolve2).then(null, reject);
          }
        }
      });
    }
    exports.addGlobalEventProcessor = addGlobalEventProcessor;
    exports.getGlobalEventProcessors = getGlobalEventProcessors;
    exports.notifyEventProcessors = notifyEventProcessors;
  }
});

// node_modules/@sentry/core/cjs/session.js
var require_session = __commonJS({
  "node_modules/@sentry/core/cjs/session.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    function makeSession(context) {
      const startingTime = utils.timestampInSeconds();
      const session = {
        sid: utils.uuid4(),
        init: true,
        timestamp: startingTime,
        started: startingTime,
        duration: 0,
        status: "ok",
        errors: 0,
        ignoreDuration: false,
        toJSON: () => sessionToJSON(session)
      };
      if (context) {
        updateSession(session, context);
      }
      return session;
    }
    function updateSession(session, context = {}) {
      if (context.user) {
        if (!session.ipAddress && context.user.ip_address) {
          session.ipAddress = context.user.ip_address;
        }
        if (!session.did && !context.did) {
          session.did = context.user.id || context.user.email || context.user.username;
        }
      }
      session.timestamp = context.timestamp || utils.timestampInSeconds();
      if (context.abnormal_mechanism) {
        session.abnormal_mechanism = context.abnormal_mechanism;
      }
      if (context.ignoreDuration) {
        session.ignoreDuration = context.ignoreDuration;
      }
      if (context.sid) {
        session.sid = context.sid.length === 32 ? context.sid : utils.uuid4();
      }
      if (context.init !== void 0) {
        session.init = context.init;
      }
      if (!session.did && context.did) {
        session.did = `${context.did}`;
      }
      if (typeof context.started === "number") {
        session.started = context.started;
      }
      if (session.ignoreDuration) {
        session.duration = void 0;
      } else if (typeof context.duration === "number") {
        session.duration = context.duration;
      } else {
        const duration = session.timestamp - session.started;
        session.duration = duration >= 0 ? duration : 0;
      }
      if (context.release) {
        session.release = context.release;
      }
      if (context.environment) {
        session.environment = context.environment;
      }
      if (!session.ipAddress && context.ipAddress) {
        session.ipAddress = context.ipAddress;
      }
      if (!session.userAgent && context.userAgent) {
        session.userAgent = context.userAgent;
      }
      if (typeof context.errors === "number") {
        session.errors = context.errors;
      }
      if (context.status) {
        session.status = context.status;
      }
    }
    function closeSession(session, status) {
      let context = {};
      if (status) {
        context = { status };
      } else if (session.status === "ok") {
        context = { status: "exited" };
      }
      updateSession(session, context);
    }
    function sessionToJSON(session) {
      return utils.dropUndefinedKeys({
        sid: `${session.sid}`,
        init: session.init,
        // Make sure that sec is converted to ms for date constructor
        started: new Date(session.started * 1e3).toISOString(),
        timestamp: new Date(session.timestamp * 1e3).toISOString(),
        status: session.status,
        errors: session.errors,
        did: typeof session.did === "number" || typeof session.did === "string" ? `${session.did}` : void 0,
        duration: session.duration,
        abnormal_mechanism: session.abnormal_mechanism,
        attrs: {
          release: session.release,
          environment: session.environment,
          ip_address: session.ipAddress,
          user_agent: session.userAgent
        }
      });
    }
    exports.closeSession = closeSession;
    exports.makeSession = makeSession;
    exports.updateSession = updateSession;
  }
});

// node_modules/@sentry/core/cjs/scope.js
var require_scope = __commonJS({
  "node_modules/@sentry/core/cjs/scope.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var eventProcessors = require_eventProcessors();
    var session = require_session();
    var DEFAULT_MAX_BREADCRUMBS = 100;
    var Scope = class {
      /** Flag if notifying is happening. */
      /** Callback for client to receive scope changes. */
      /** Callback list that will be called after {@link applyToEvent}. */
      /** Array of breadcrumbs. */
      /** User */
      /** Tags */
      /** Extra */
      /** Contexts */
      /** Attachments */
      /** Propagation Context for distributed tracing */
      /**
       * A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
       * sent to Sentry
       */
      /** Fingerprint */
      /** Severity */
      // eslint-disable-next-line deprecation/deprecation
      /** Transaction Name */
      /** Span */
      /** Session */
      /** Request Mode Session Status */
      // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
      constructor() {
        this._notifyingListeners = false;
        this._scopeListeners = [];
        this._eventProcessors = [];
        this._breadcrumbs = [];
        this._attachments = [];
        this._user = {};
        this._tags = {};
        this._extra = {};
        this._contexts = {};
        this._sdkProcessingMetadata = {};
        this._propagationContext = generatePropagationContext();
      }
      /**
       * Inherit values from the parent scope.
       * @param scope to clone.
       */
      static clone(scope) {
        const newScope = new Scope();
        if (scope) {
          newScope._breadcrumbs = [...scope._breadcrumbs];
          newScope._tags = { ...scope._tags };
          newScope._extra = { ...scope._extra };
          newScope._contexts = { ...scope._contexts };
          newScope._user = scope._user;
          newScope._level = scope._level;
          newScope._span = scope._span;
          newScope._session = scope._session;
          newScope._transactionName = scope._transactionName;
          newScope._fingerprint = scope._fingerprint;
          newScope._eventProcessors = [...scope._eventProcessors];
          newScope._requestSession = scope._requestSession;
          newScope._attachments = [...scope._attachments];
          newScope._sdkProcessingMetadata = { ...scope._sdkProcessingMetadata };
          newScope._propagationContext = { ...scope._propagationContext };
        }
        return newScope;
      }
      /**
       * Add internal on change listener. Used for sub SDKs that need to store the scope.
       * @hidden
       */
      addScopeListener(callback) {
        this._scopeListeners.push(callback);
      }
      /**
       * @inheritDoc
       */
      addEventProcessor(callback) {
        this._eventProcessors.push(callback);
        return this;
      }
      /**
       * @inheritDoc
       */
      setUser(user) {
        this._user = user || {};
        if (this._session) {
          session.updateSession(this._session, { user });
        }
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      getUser() {
        return this._user;
      }
      /**
       * @inheritDoc
       */
      getRequestSession() {
        return this._requestSession;
      }
      /**
       * @inheritDoc
       */
      setRequestSession(requestSession) {
        this._requestSession = requestSession;
        return this;
      }
      /**
       * @inheritDoc
       */
      setTags(tags) {
        this._tags = {
          ...this._tags,
          ...tags
        };
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setTag(key, value) {
        this._tags = { ...this._tags, [key]: value };
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setExtras(extras) {
        this._extra = {
          ...this._extra,
          ...extras
        };
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setExtra(key, extra) {
        this._extra = { ...this._extra, [key]: extra };
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setFingerprint(fingerprint) {
        this._fingerprint = fingerprint;
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setLevel(level) {
        this._level = level;
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setTransactionName(name) {
        this._transactionName = name;
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setContext(key, context) {
        if (context === null) {
          delete this._contexts[key];
        } else {
          this._contexts[key] = context;
        }
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      setSpan(span) {
        this._span = span;
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      getSpan() {
        return this._span;
      }
      /**
       * @inheritDoc
       */
      getTransaction() {
        const span = this.getSpan();
        return span && span.transaction;
      }
      /**
       * @inheritDoc
       */
      setSession(session2) {
        if (!session2) {
          delete this._session;
        } else {
          this._session = session2;
        }
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      getSession() {
        return this._session;
      }
      /**
       * @inheritDoc
       */
      update(captureContext) {
        if (!captureContext) {
          return this;
        }
        if (typeof captureContext === "function") {
          const updatedScope = captureContext(this);
          return updatedScope instanceof Scope ? updatedScope : this;
        }
        if (captureContext instanceof Scope) {
          this._tags = { ...this._tags, ...captureContext._tags };
          this._extra = { ...this._extra, ...captureContext._extra };
          this._contexts = { ...this._contexts, ...captureContext._contexts };
          if (captureContext._user && Object.keys(captureContext._user).length) {
            this._user = captureContext._user;
          }
          if (captureContext._level) {
            this._level = captureContext._level;
          }
          if (captureContext._fingerprint) {
            this._fingerprint = captureContext._fingerprint;
          }
          if (captureContext._requestSession) {
            this._requestSession = captureContext._requestSession;
          }
          if (captureContext._propagationContext) {
            this._propagationContext = captureContext._propagationContext;
          }
        } else if (utils.isPlainObject(captureContext)) {
          captureContext = captureContext;
          this._tags = { ...this._tags, ...captureContext.tags };
          this._extra = { ...this._extra, ...captureContext.extra };
          this._contexts = { ...this._contexts, ...captureContext.contexts };
          if (captureContext.user) {
            this._user = captureContext.user;
          }
          if (captureContext.level) {
            this._level = captureContext.level;
          }
          if (captureContext.fingerprint) {
            this._fingerprint = captureContext.fingerprint;
          }
          if (captureContext.requestSession) {
            this._requestSession = captureContext.requestSession;
          }
          if (captureContext.propagationContext) {
            this._propagationContext = captureContext.propagationContext;
          }
        }
        return this;
      }
      /**
       * @inheritDoc
       */
      clear() {
        this._breadcrumbs = [];
        this._tags = {};
        this._extra = {};
        this._user = {};
        this._contexts = {};
        this._level = void 0;
        this._transactionName = void 0;
        this._fingerprint = void 0;
        this._requestSession = void 0;
        this._span = void 0;
        this._session = void 0;
        this._notifyScopeListeners();
        this._attachments = [];
        this._propagationContext = generatePropagationContext();
        return this;
      }
      /**
       * @inheritDoc
       */
      addBreadcrumb(breadcrumb, maxBreadcrumbs) {
        const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
        if (maxCrumbs <= 0) {
          return this;
        }
        const mergedBreadcrumb = {
          timestamp: utils.dateTimestampInSeconds(),
          ...breadcrumb
        };
        const breadcrumbs = this._breadcrumbs;
        breadcrumbs.push(mergedBreadcrumb);
        this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      getLastBreadcrumb() {
        return this._breadcrumbs[this._breadcrumbs.length - 1];
      }
      /**
       * @inheritDoc
       */
      clearBreadcrumbs() {
        this._breadcrumbs = [];
        this._notifyScopeListeners();
        return this;
      }
      /**
       * @inheritDoc
       */
      addAttachment(attachment) {
        this._attachments.push(attachment);
        return this;
      }
      /**
       * @inheritDoc
       */
      getAttachments() {
        return this._attachments;
      }
      /**
       * @inheritDoc
       */
      clearAttachments() {
        this._attachments = [];
        return this;
      }
      /**
       * Applies data from the scope to the event and runs all event processors on it.
       *
       * @param event Event
       * @param hint Object containing additional information about the original exception, for use by the event processors.
       * @hidden
       */
      applyToEvent(event, hint = {}, additionalEventProcessors) {
        if (this._extra && Object.keys(this._extra).length) {
          event.extra = { ...this._extra, ...event.extra };
        }
        if (this._tags && Object.keys(this._tags).length) {
          event.tags = { ...this._tags, ...event.tags };
        }
        if (this._user && Object.keys(this._user).length) {
          event.user = { ...this._user, ...event.user };
        }
        if (this._contexts && Object.keys(this._contexts).length) {
          event.contexts = { ...this._contexts, ...event.contexts };
        }
        if (this._level) {
          event.level = this._level;
        }
        if (this._transactionName) {
          event.transaction = this._transactionName;
        }
        if (this._span) {
          event.contexts = { trace: this._span.getTraceContext(), ...event.contexts };
          const transaction = this._span.transaction;
          if (transaction) {
            event.sdkProcessingMetadata = {
              dynamicSamplingContext: transaction.getDynamicSamplingContext(),
              ...event.sdkProcessingMetadata
            };
            const transactionName = transaction.name;
            if (transactionName) {
              event.tags = { transaction: transactionName, ...event.tags };
            }
          }
        }
        this._applyFingerprint(event);
        const scopeBreadcrumbs = this._getBreadcrumbs();
        const breadcrumbs = [...event.breadcrumbs || [], ...scopeBreadcrumbs];
        event.breadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : void 0;
        event.sdkProcessingMetadata = {
          ...event.sdkProcessingMetadata,
          ...this._sdkProcessingMetadata,
          propagationContext: this._propagationContext
        };
        return eventProcessors.notifyEventProcessors(
          [
            ...additionalEventProcessors || [],
            // eslint-disable-next-line deprecation/deprecation
            ...eventProcessors.getGlobalEventProcessors(),
            ...this._eventProcessors
          ],
          event,
          hint
        );
      }
      /**
       * Add data which will be accessible during event processing but won't get sent to Sentry
       */
      setSDKProcessingMetadata(newData) {
        this._sdkProcessingMetadata = { ...this._sdkProcessingMetadata, ...newData };
        return this;
      }
      /**
       * @inheritDoc
       */
      setPropagationContext(context) {
        this._propagationContext = context;
        return this;
      }
      /**
       * @inheritDoc
       */
      getPropagationContext() {
        return this._propagationContext;
      }
      /**
       * Get the breadcrumbs for this scope.
       */
      _getBreadcrumbs() {
        return this._breadcrumbs;
      }
      /**
       * This will be called on every set call.
       */
      _notifyScopeListeners() {
        if (!this._notifyingListeners) {
          this._notifyingListeners = true;
          this._scopeListeners.forEach((callback) => {
            callback(this);
          });
          this._notifyingListeners = false;
        }
      }
      /**
       * Applies fingerprint from the scope to the event if there's one,
       * uses message if there's one instead or get rid of empty fingerprint
       */
      _applyFingerprint(event) {
        event.fingerprint = event.fingerprint ? utils.arrayify(event.fingerprint) : [];
        if (this._fingerprint) {
          event.fingerprint = event.fingerprint.concat(this._fingerprint);
        }
        if (event.fingerprint && !event.fingerprint.length) {
          delete event.fingerprint;
        }
      }
    };
    function generatePropagationContext() {
      return {
        traceId: utils.uuid4(),
        spanId: utils.uuid4().substring(16)
      };
    }
    exports.Scope = Scope;
  }
});

// node_modules/@sentry/core/cjs/version.js
var require_version = __commonJS({
  "node_modules/@sentry/core/cjs/version.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SDK_VERSION = "7.86.0";
    exports.SDK_VERSION = SDK_VERSION;
  }
});

// node_modules/@sentry/core/cjs/hub.js
var require_hub = __commonJS({
  "node_modules/@sentry/core/cjs/hub.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var constants = require_constants();
    var debugBuild = require_debug_build2();
    var scope = require_scope();
    var session = require_session();
    var version2 = require_version();
    var API_VERSION = parseFloat(version2.SDK_VERSION);
    var DEFAULT_BREADCRUMBS = 100;
    var Hub = class {
      /** Is a {@link Layer}[] containing the client and scope */
      /** Contains the last event id of a captured event.  */
      /**
       * Creates a new instance of the hub, will push one {@link Layer} into the
       * internal stack on creation.
       *
       * @param client bound to the hub.
       * @param scope bound to the hub.
       * @param version number, higher number means higher priority.
       */
      constructor(client, scope$1 = new scope.Scope(), _version = API_VERSION) {
        this._version = _version;
        this._stack = [{ scope: scope$1 }];
        if (client) {
          this.bindClient(client);
        }
      }
      /**
       * @inheritDoc
       */
      isOlderThan(version3) {
        return this._version < version3;
      }
      /**
       * @inheritDoc
       */
      bindClient(client) {
        const top = this.getStackTop();
        top.client = client;
        if (client && client.setupIntegrations) {
          client.setupIntegrations();
        }
      }
      /**
       * @inheritDoc
       */
      pushScope() {
        const scope$1 = scope.Scope.clone(this.getScope());
        this.getStack().push({
          client: this.getClient(),
          scope: scope$1
        });
        return scope$1;
      }
      /**
       * @inheritDoc
       */
      popScope() {
        if (this.getStack().length <= 1)
          return false;
        return !!this.getStack().pop();
      }
      /**
       * @inheritDoc
       */
      withScope(callback) {
        const scope2 = this.pushScope();
        try {
          callback(scope2);
        } finally {
          this.popScope();
        }
      }
      /**
       * @inheritDoc
       */
      getClient() {
        return this.getStackTop().client;
      }
      /** Returns the scope of the top stack. */
      getScope() {
        return this.getStackTop().scope;
      }
      /** Returns the scope stack for domains or the process. */
      getStack() {
        return this._stack;
      }
      /** Returns the topmost scope layer in the order domain > local > process. */
      getStackTop() {
        return this._stack[this._stack.length - 1];
      }
      /**
       * @inheritDoc
       */
      captureException(exception, hint) {
        const eventId = this._lastEventId = hint && hint.event_id ? hint.event_id : utils.uuid4();
        const syntheticException = new Error("Sentry syntheticException");
        this._withClient((client, scope2) => {
          client.captureException(
            exception,
            {
              originalException: exception,
              syntheticException,
              ...hint,
              event_id: eventId
            },
            scope2
          );
        });
        return eventId;
      }
      /**
       * @inheritDoc
       */
      captureMessage(message, level, hint) {
        const eventId = this._lastEventId = hint && hint.event_id ? hint.event_id : utils.uuid4();
        const syntheticException = new Error(message);
        this._withClient((client, scope2) => {
          client.captureMessage(
            message,
            level,
            {
              originalException: message,
              syntheticException,
              ...hint,
              event_id: eventId
            },
            scope2
          );
        });
        return eventId;
      }
      /**
       * @inheritDoc
       */
      captureEvent(event, hint) {
        const eventId = hint && hint.event_id ? hint.event_id : utils.uuid4();
        if (!event.type) {
          this._lastEventId = eventId;
        }
        this._withClient((client, scope2) => {
          client.captureEvent(event, { ...hint, event_id: eventId }, scope2);
        });
        return eventId;
      }
      /**
       * @inheritDoc
       */
      lastEventId() {
        return this._lastEventId;
      }
      /**
       * @inheritDoc
       */
      addBreadcrumb(breadcrumb, hint) {
        const { scope: scope2, client } = this.getStackTop();
        if (!client)
          return;
        const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = client.getOptions && client.getOptions() || {};
        if (maxBreadcrumbs <= 0)
          return;
        const timestamp = utils.dateTimestampInSeconds();
        const mergedBreadcrumb = { timestamp, ...breadcrumb };
        const finalBreadcrumb = beforeBreadcrumb ? utils.consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
        if (finalBreadcrumb === null)
          return;
        if (client.emit) {
          client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint);
        }
        scope2.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
      }
      /**
       * @inheritDoc
       */
      setUser(user) {
        this.getScope().setUser(user);
      }
      /**
       * @inheritDoc
       */
      setTags(tags) {
        this.getScope().setTags(tags);
      }
      /**
       * @inheritDoc
       */
      setExtras(extras) {
        this.getScope().setExtras(extras);
      }
      /**
       * @inheritDoc
       */
      setTag(key, value) {
        this.getScope().setTag(key, value);
      }
      /**
       * @inheritDoc
       */
      setExtra(key, extra) {
        this.getScope().setExtra(key, extra);
      }
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setContext(name, context) {
        this.getScope().setContext(name, context);
      }
      /**
       * @inheritDoc
       */
      configureScope(callback) {
        const { scope: scope2, client } = this.getStackTop();
        if (client) {
          callback(scope2);
        }
      }
      /**
       * @inheritDoc
       */
      run(callback) {
        const oldHub = makeMain(this);
        try {
          callback(this);
        } finally {
          makeMain(oldHub);
        }
      }
      /**
       * @inheritDoc
       */
      getIntegration(integration) {
        const client = this.getClient();
        if (!client)
          return null;
        try {
          return client.getIntegration(integration);
        } catch (_oO) {
          debugBuild.DEBUG_BUILD && utils.logger.warn(`Cannot retrieve integration ${integration.id} from the current Hub`);
          return null;
        }
      }
      /**
       * @inheritDoc
       */
      startTransaction(context, customSamplingContext) {
        const result = this._callExtensionMethod("startTransaction", context, customSamplingContext);
        if (debugBuild.DEBUG_BUILD && !result) {
          const client = this.getClient();
          if (!client) {
            utils.logger.warn(
              "Tracing extension 'startTransaction' is missing. You should 'init' the SDK before calling 'startTransaction'"
            );
          } else {
            utils.logger.warn(`Tracing extension 'startTransaction' has not been added. Call 'addTracingExtensions' before calling 'init':
Sentry.addTracingExtensions();
Sentry.init({...});
`);
          }
        }
        return result;
      }
      /**
       * @inheritDoc
       */
      traceHeaders() {
        return this._callExtensionMethod("traceHeaders");
      }
      /**
       * @inheritDoc
       */
      captureSession(endSession = false) {
        if (endSession) {
          return this.endSession();
        }
        this._sendSessionUpdate();
      }
      /**
       * @inheritDoc
       */
      endSession() {
        const layer = this.getStackTop();
        const scope2 = layer.scope;
        const session$1 = scope2.getSession();
        if (session$1) {
          session.closeSession(session$1);
        }
        this._sendSessionUpdate();
        scope2.setSession();
      }
      /**
       * @inheritDoc
       */
      startSession(context) {
        const { scope: scope2, client } = this.getStackTop();
        const { release: release2, environment = constants.DEFAULT_ENVIRONMENT } = client && client.getOptions() || {};
        const { userAgent } = utils.GLOBAL_OBJ.navigator || {};
        const session$1 = session.makeSession({
          release: release2,
          environment,
          user: scope2.getUser(),
          ...userAgent && { userAgent },
          ...context
        });
        const currentSession = scope2.getSession && scope2.getSession();
        if (currentSession && currentSession.status === "ok") {
          session.updateSession(currentSession, { status: "exited" });
        }
        this.endSession();
        scope2.setSession(session$1);
        return session$1;
      }
      /**
       * Returns if default PII should be sent to Sentry and propagated in ourgoing requests
       * when Tracing is used.
       */
      shouldSendDefaultPii() {
        const client = this.getClient();
        const options = client && client.getOptions();
        return Boolean(options && options.sendDefaultPii);
      }
      /**
       * Sends the current Session on the scope
       */
      _sendSessionUpdate() {
        const { scope: scope2, client } = this.getStackTop();
        const session2 = scope2.getSession();
        if (session2 && client && client.captureSession) {
          client.captureSession(session2);
        }
      }
      /**
       * Internal helper function to call a method on the top client if it exists.
       *
       * @param method The method to call on the client.
       * @param args Arguments to pass to the client function.
       */
      _withClient(callback) {
        const { scope: scope2, client } = this.getStackTop();
        if (client) {
          callback(client, scope2);
        }
      }
      /**
       * Calls global extension method and binding current instance to the function call
       */
      // @ts-expect-error Function lacks ending return statement and return type does not include 'undefined'. ts(2366)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _callExtensionMethod(method, ...args) {
        const carrier = getMainCarrier2();
        const sentry = carrier.__SENTRY__;
        if (sentry && sentry.extensions && typeof sentry.extensions[method] === "function") {
          return sentry.extensions[method].apply(this, args);
        }
        debugBuild.DEBUG_BUILD && utils.logger.warn(`Extension method ${method} couldn't be found, doing nothing.`);
      }
    };
    function getMainCarrier2() {
      utils.GLOBAL_OBJ.__SENTRY__ = utils.GLOBAL_OBJ.__SENTRY__ || {
        extensions: {},
        hub: void 0
      };
      return utils.GLOBAL_OBJ;
    }
    function makeMain(hub) {
      const registry = getMainCarrier2();
      const oldHub = getHubFromCarrier(registry);
      setHubOnCarrier(registry, hub);
      return oldHub;
    }
    function getCurrentHub2() {
      const registry = getMainCarrier2();
      if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
        const hub = registry.__SENTRY__.acs.getCurrentHub();
        if (hub) {
          return hub;
        }
      }
      return getGlobalHub(registry);
    }
    function getGlobalHub(registry = getMainCarrier2()) {
      if (!hasHubOnCarrier(registry) || getHubFromCarrier(registry).isOlderThan(API_VERSION)) {
        setHubOnCarrier(registry, new Hub());
      }
      return getHubFromCarrier(registry);
    }
    function ensureHubOnCarrier(carrier, parent = getGlobalHub()) {
      if (!hasHubOnCarrier(carrier) || getHubFromCarrier(carrier).isOlderThan(API_VERSION)) {
        const globalHubTopStack = parent.getStackTop();
        setHubOnCarrier(carrier, new Hub(globalHubTopStack.client, scope.Scope.clone(globalHubTopStack.scope)));
      }
    }
    function setAsyncContextStrategy(strategy) {
      const registry = getMainCarrier2();
      registry.__SENTRY__ = registry.__SENTRY__ || {};
      registry.__SENTRY__.acs = strategy;
    }
    function runWithAsyncContext(callback, options = {}) {
      const registry = getMainCarrier2();
      if (registry.__SENTRY__ && registry.__SENTRY__.acs) {
        return registry.__SENTRY__.acs.runWithAsyncContext(callback, options);
      }
      return callback();
    }
    function hasHubOnCarrier(carrier) {
      return !!(carrier && carrier.__SENTRY__ && carrier.__SENTRY__.hub);
    }
    function getHubFromCarrier(carrier) {
      return utils.getGlobalSingleton("hub", () => new Hub(), carrier);
    }
    function setHubOnCarrier(carrier, hub) {
      if (!carrier)
        return false;
      const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
      __SENTRY__.hub = hub;
      return true;
    }
    exports.API_VERSION = API_VERSION;
    exports.Hub = Hub;
    exports.ensureHubOnCarrier = ensureHubOnCarrier;
    exports.getCurrentHub = getCurrentHub2;
    exports.getHubFromCarrier = getHubFromCarrier;
    exports.getMainCarrier = getMainCarrier2;
    exports.makeMain = makeMain;
    exports.runWithAsyncContext = runWithAsyncContext;
    exports.setAsyncContextStrategy = setAsyncContextStrategy;
    exports.setHubOnCarrier = setHubOnCarrier;
  }
});

// node_modules/@sentry/core/cjs/tracing/utils.js
var require_utils = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/utils.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var hub = require_hub();
    function getActiveTransaction(maybeHub) {
      const hub$1 = maybeHub || hub.getCurrentHub();
      const scope = hub$1.getScope();
      return scope.getTransaction();
    }
    var extractTraceparentData = utils.extractTraceparentData;
    exports.stripUrlQueryAndFragment = utils.stripUrlQueryAndFragment;
    exports.extractTraceparentData = extractTraceparentData;
    exports.getActiveTransaction = getActiveTransaction;
  }
});

// node_modules/@sentry/core/cjs/tracing/errors.js
var require_errors = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/errors.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var utils$1 = require_utils();
    var errorsInstrumented = false;
    function registerErrorInstrumentation() {
      if (errorsInstrumented) {
        return;
      }
      errorsInstrumented = true;
      utils.addGlobalErrorInstrumentationHandler(errorCallback);
      utils.addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
    }
    function errorCallback() {
      const activeTransaction = utils$1.getActiveTransaction();
      if (activeTransaction) {
        const status = "internal_error";
        debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] Transaction: ${status} -> Global error occured`);
        activeTransaction.setStatus(status);
      }
    }
    errorCallback.tag = "sentry_tracingErrorCallback";
    exports.registerErrorInstrumentation = registerErrorInstrumentation;
  }
});

// node_modules/@sentry/core/cjs/tracing/span.js
var require_span = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/span.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var SpanRecorder = class {
      constructor(maxlen = 1e3) {
        this._maxlen = maxlen;
        this.spans = [];
      }
      /**
       * This is just so that we don't run out of memory while recording a lot
       * of spans. At some point we just stop and flush out the start of the
       * trace tree (i.e.the first n spans with the smallest
       * start_timestamp).
       */
      add(span) {
        if (this.spans.length > this._maxlen) {
          span.spanRecorder = void 0;
        } else {
          this.spans.push(span);
        }
      }
    };
    var Span = class {
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      /**
       * Internal keeper of the status
       */
      /**
       * @inheritDoc
       */
      /**
       * Timestamp in seconds when the span was created.
       */
      /**
       * Timestamp in seconds when the span ended.
       */
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /**
       * List of spans that were finalized
       */
      /**
       * @inheritDoc
       */
      /**
       * The instrumenter that created this span.
       */
      /**
       * The origin of the span, giving context about what created the span.
       */
      /**
       * You should never call the constructor manually, always use `Sentry.startTransaction()`
       * or call `startChild()` on an existing span.
       * @internal
       * @hideconstructor
       * @hidden
       */
      constructor(spanContext = {}) {
        this.traceId = spanContext.traceId || utils.uuid4();
        this.spanId = spanContext.spanId || utils.uuid4().substring(16);
        this.startTimestamp = spanContext.startTimestamp || utils.timestampInSeconds();
        this.tags = spanContext.tags || {};
        this.data = spanContext.data || {};
        this.instrumenter = spanContext.instrumenter || "sentry";
        this.origin = spanContext.origin || "manual";
        if (spanContext.parentSpanId) {
          this.parentSpanId = spanContext.parentSpanId;
        }
        if ("sampled" in spanContext) {
          this.sampled = spanContext.sampled;
        }
        if (spanContext.op) {
          this.op = spanContext.op;
        }
        if (spanContext.description) {
          this.description = spanContext.description;
        }
        if (spanContext.name) {
          this.description = spanContext.name;
        }
        if (spanContext.status) {
          this.status = spanContext.status;
        }
        if (spanContext.endTimestamp) {
          this.endTimestamp = spanContext.endTimestamp;
        }
      }
      /** An alias for `description` of the Span. */
      get name() {
        return this.description || "";
      }
      /** Update the name of the span. */
      set name(name) {
        this.setName(name);
      }
      /**
       * @inheritDoc
       */
      startChild(spanContext) {
        const childSpan = new Span({
          ...spanContext,
          parentSpanId: this.spanId,
          sampled: this.sampled,
          traceId: this.traceId
        });
        childSpan.spanRecorder = this.spanRecorder;
        if (childSpan.spanRecorder) {
          childSpan.spanRecorder.add(childSpan);
        }
        childSpan.transaction = this.transaction;
        if (debugBuild.DEBUG_BUILD && childSpan.transaction) {
          const opStr = spanContext && spanContext.op || "< unknown op >";
          const nameStr = childSpan.transaction.name || "< unknown name >";
          const idStr = childSpan.transaction.spanId;
          const logMessage = `[Tracing] Starting '${opStr}' span on transaction '${nameStr}' (${idStr}).`;
          childSpan.transaction.metadata.spanMetadata[childSpan.spanId] = { logMessage };
          utils.logger.log(logMessage);
        }
        return childSpan;
      }
      /**
       * @inheritDoc
       */
      setTag(key, value) {
        this.tags = { ...this.tags, [key]: value };
        return this;
      }
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
      setData(key, value) {
        this.data = { ...this.data, [key]: value };
        return this;
      }
      /**
       * @inheritDoc
       */
      setStatus(value) {
        this.status = value;
        return this;
      }
      /**
       * @inheritDoc
       */
      setHttpStatus(httpStatus) {
        this.setTag("http.status_code", String(httpStatus));
        this.setData("http.response.status_code", httpStatus);
        const spanStatus = spanStatusfromHttpCode(httpStatus);
        if (spanStatus !== "unknown_error") {
          this.setStatus(spanStatus);
        }
        return this;
      }
      /**
       * @inheritDoc
       */
      setName(name) {
        this.description = name;
      }
      /**
       * @inheritDoc
       */
      isSuccess() {
        return this.status === "ok";
      }
      /**
       * @inheritDoc
       */
      finish(endTimestamp) {
        if (debugBuild.DEBUG_BUILD && // Don't call this for transactions
        this.transaction && this.transaction.spanId !== this.spanId) {
          const { logMessage } = this.transaction.metadata.spanMetadata[this.spanId];
          if (logMessage) {
            utils.logger.log(logMessage.replace("Starting", "Finishing"));
          }
        }
        this.endTimestamp = typeof endTimestamp === "number" ? endTimestamp : utils.timestampInSeconds();
      }
      /**
       * @inheritDoc
       */
      toTraceparent() {
        return utils.generateSentryTraceHeader(this.traceId, this.spanId, this.sampled);
      }
      /**
       * @inheritDoc
       */
      toContext() {
        return utils.dropUndefinedKeys({
          data: this.data,
          description: this.description,
          endTimestamp: this.endTimestamp,
          op: this.op,
          parentSpanId: this.parentSpanId,
          sampled: this.sampled,
          spanId: this.spanId,
          startTimestamp: this.startTimestamp,
          status: this.status,
          tags: this.tags,
          traceId: this.traceId
        });
      }
      /**
       * @inheritDoc
       */
      updateWithContext(spanContext) {
        this.data = spanContext.data || {};
        this.description = spanContext.description;
        this.endTimestamp = spanContext.endTimestamp;
        this.op = spanContext.op;
        this.parentSpanId = spanContext.parentSpanId;
        this.sampled = spanContext.sampled;
        this.spanId = spanContext.spanId || this.spanId;
        this.startTimestamp = spanContext.startTimestamp || this.startTimestamp;
        this.status = spanContext.status;
        this.tags = spanContext.tags || {};
        this.traceId = spanContext.traceId || this.traceId;
        return this;
      }
      /**
       * @inheritDoc
       */
      getTraceContext() {
        return utils.dropUndefinedKeys({
          data: Object.keys(this.data).length > 0 ? this.data : void 0,
          description: this.description,
          op: this.op,
          parent_span_id: this.parentSpanId,
          span_id: this.spanId,
          status: this.status,
          tags: Object.keys(this.tags).length > 0 ? this.tags : void 0,
          trace_id: this.traceId,
          origin: this.origin
        });
      }
      /**
       * @inheritDoc
       */
      toJSON() {
        return utils.dropUndefinedKeys({
          data: Object.keys(this.data).length > 0 ? this.data : void 0,
          description: this.description,
          op: this.op,
          parent_span_id: this.parentSpanId,
          span_id: this.spanId,
          start_timestamp: this.startTimestamp,
          status: this.status,
          tags: Object.keys(this.tags).length > 0 ? this.tags : void 0,
          timestamp: this.endTimestamp,
          trace_id: this.traceId,
          origin: this.origin
        });
      }
    };
    function spanStatusfromHttpCode(httpStatus) {
      if (httpStatus < 400 && httpStatus >= 100) {
        return "ok";
      }
      if (httpStatus >= 400 && httpStatus < 500) {
        switch (httpStatus) {
          case 401:
            return "unauthenticated";
          case 403:
            return "permission_denied";
          case 404:
            return "not_found";
          case 409:
            return "already_exists";
          case 413:
            return "failed_precondition";
          case 429:
            return "resource_exhausted";
          default:
            return "invalid_argument";
        }
      }
      if (httpStatus >= 500 && httpStatus < 600) {
        switch (httpStatus) {
          case 501:
            return "unimplemented";
          case 503:
            return "unavailable";
          case 504:
            return "deadline_exceeded";
          default:
            return "internal_error";
        }
      }
      return "unknown_error";
    }
    exports.Span = Span;
    exports.SpanRecorder = SpanRecorder;
    exports.spanStatusfromHttpCode = spanStatusfromHttpCode;
  }
});

// node_modules/@sentry/core/cjs/tracing/dynamicSamplingContext.js
var require_dynamicSamplingContext = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/dynamicSamplingContext.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var constants = require_constants();
    function getDynamicSamplingContextFromClient(trace_id, client, scope) {
      const options = client.getOptions();
      const { publicKey: public_key } = client.getDsn() || {};
      const { segment: user_segment } = scope && scope.getUser() || {};
      const dsc = utils.dropUndefinedKeys({
        environment: options.environment || constants.DEFAULT_ENVIRONMENT,
        release: options.release,
        user_segment,
        public_key,
        trace_id
      });
      client.emit && client.emit("createDsc", dsc);
      return dsc;
    }
    exports.getDynamicSamplingContextFromClient = getDynamicSamplingContextFromClient;
  }
});

// node_modules/@sentry/core/cjs/tracing/transaction.js
var require_transaction = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/transaction.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var hub = require_hub();
    var dynamicSamplingContext = require_dynamicSamplingContext();
    var span = require_span();
    var Transaction = class extends span.Span {
      /**
       * The reference to the current hub.
       */
      /**
       * This constructor should never be called manually. Those instrumenting tracing should use
       * `Sentry.startTransaction()`, and internal methods should use `hub.startTransaction()`.
       * @internal
       * @hideconstructor
       * @hidden
       */
      constructor(transactionContext, hub$1) {
        super(transactionContext);
        delete this.description;
        this._measurements = {};
        this._contexts = {};
        this._hub = hub$1 || hub.getCurrentHub();
        this._name = transactionContext.name || "";
        this.metadata = {
          source: "custom",
          ...transactionContext.metadata,
          spanMetadata: {}
        };
        this._trimEnd = transactionContext.trimEnd;
        this.transaction = this;
        const incomingDynamicSamplingContext = this.metadata.dynamicSamplingContext;
        if (incomingDynamicSamplingContext) {
          this._frozenDynamicSamplingContext = { ...incomingDynamicSamplingContext };
        }
      }
      /** Getter for `name` property */
      get name() {
        return this._name;
      }
      /** Setter for `name` property, which also sets `source` as custom */
      set name(newName) {
        this.setName(newName);
      }
      /**
       * JSDoc
       */
      setName(name, source = "custom") {
        this._name = name;
        this.metadata.source = source;
      }
      /**
       * Attaches SpanRecorder to the span itself
       * @param maxlen maximum number of spans that can be recorded
       */
      initSpanRecorder(maxlen = 1e3) {
        if (!this.spanRecorder) {
          this.spanRecorder = new span.SpanRecorder(maxlen);
        }
        this.spanRecorder.add(this);
      }
      /**
       * @inheritDoc
       */
      setContext(key, context) {
        if (context === null) {
          delete this._contexts[key];
        } else {
          this._contexts[key] = context;
        }
      }
      /**
       * @inheritDoc
       */
      setMeasurement(name, value, unit = "") {
        this._measurements[name] = { value, unit };
      }
      /**
       * @inheritDoc
       */
      setMetadata(newMetadata) {
        this.metadata = { ...this.metadata, ...newMetadata };
      }
      /**
       * @inheritDoc
       */
      finish(endTimestamp) {
        const transaction = this._finishTransaction(endTimestamp);
        if (!transaction) {
          return void 0;
        }
        return this._hub.captureEvent(transaction);
      }
      /**
       * @inheritDoc
       */
      toContext() {
        const spanContext = super.toContext();
        return utils.dropUndefinedKeys({
          ...spanContext,
          name: this.name,
          trimEnd: this._trimEnd
        });
      }
      /**
       * @inheritDoc
       */
      updateWithContext(transactionContext) {
        super.updateWithContext(transactionContext);
        this.name = transactionContext.name || "";
        this._trimEnd = transactionContext.trimEnd;
        return this;
      }
      /**
       * @inheritdoc
       *
       * @experimental
       */
      getDynamicSamplingContext() {
        if (this._frozenDynamicSamplingContext) {
          return this._frozenDynamicSamplingContext;
        }
        const hub$1 = this._hub || hub.getCurrentHub();
        const client = hub$1.getClient();
        if (!client)
          return {};
        const scope = hub$1.getScope();
        const dsc = dynamicSamplingContext.getDynamicSamplingContextFromClient(this.traceId, client, scope);
        const maybeSampleRate = this.metadata.sampleRate;
        if (maybeSampleRate !== void 0) {
          dsc.sample_rate = `${maybeSampleRate}`;
        }
        const source = this.metadata.source;
        if (source && source !== "url") {
          dsc.transaction = this.name;
        }
        if (this.sampled !== void 0) {
          dsc.sampled = String(this.sampled);
        }
        return dsc;
      }
      /**
       * Override the current hub with a new one.
       * Used if you want another hub to finish the transaction.
       *
       * @internal
       */
      setHub(hub2) {
        this._hub = hub2;
      }
      /**
       * Finish the transaction & prepare the event to send to Sentry.
       */
      _finishTransaction(endTimestamp) {
        if (this.endTimestamp !== void 0) {
          return void 0;
        }
        if (!this.name) {
          debugBuild.DEBUG_BUILD && utils.logger.warn("Transaction has no name, falling back to `<unlabeled transaction>`.");
          this.name = "<unlabeled transaction>";
        }
        super.finish(endTimestamp);
        const client = this._hub.getClient();
        if (client && client.emit) {
          client.emit("finishTransaction", this);
        }
        if (this.sampled !== true) {
          debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] Discarding transaction because its trace was not chosen to be sampled.");
          if (client) {
            client.recordDroppedEvent("sample_rate", "transaction");
          }
          return void 0;
        }
        const finishedSpans = this.spanRecorder ? this.spanRecorder.spans.filter((s) => s !== this && s.endTimestamp) : [];
        if (this._trimEnd && finishedSpans.length > 0) {
          this.endTimestamp = finishedSpans.reduce((prev, current) => {
            if (prev.endTimestamp && current.endTimestamp) {
              return prev.endTimestamp > current.endTimestamp ? prev : current;
            }
            return prev;
          }).endTimestamp;
        }
        const metadata = this.metadata;
        const transaction = {
          contexts: {
            ...this._contexts,
            // We don't want to override trace context
            trace: this.getTraceContext()
          },
          spans: finishedSpans,
          start_timestamp: this.startTimestamp,
          tags: this.tags,
          timestamp: this.endTimestamp,
          transaction: this.name,
          type: "transaction",
          sdkProcessingMetadata: {
            ...metadata,
            dynamicSamplingContext: this.getDynamicSamplingContext()
          },
          ...metadata.source && {
            transaction_info: {
              source: metadata.source
            }
          }
        };
        const hasMeasurements = Object.keys(this._measurements).length > 0;
        if (hasMeasurements) {
          debugBuild.DEBUG_BUILD && utils.logger.log(
            "[Measurements] Adding measurements to transaction",
            JSON.stringify(this._measurements, void 0, 2)
          );
          transaction.measurements = this._measurements;
        }
        debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] Finishing ${this.op} transaction: ${this.name}.`);
        return transaction;
      }
    };
    exports.Transaction = Transaction;
  }
});

// node_modules/@sentry/core/cjs/tracing/idletransaction.js
var require_idletransaction = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/idletransaction.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var span = require_span();
    var transaction = require_transaction();
    var TRACING_DEFAULTS = {
      idleTimeout: 1e3,
      finalTimeout: 3e4,
      heartbeatInterval: 5e3
    };
    var FINISH_REASON_TAG = "finishReason";
    var IDLE_TRANSACTION_FINISH_REASONS = [
      "heartbeatFailed",
      "idleTimeout",
      "documentHidden",
      "finalTimeout",
      "externalFinish",
      "cancelled"
    ];
    var IdleTransactionSpanRecorder = class extends span.SpanRecorder {
      constructor(_pushActivity, _popActivity, transactionSpanId, maxlen) {
        super(maxlen);
        this._pushActivity = _pushActivity;
        this._popActivity = _popActivity;
        this.transactionSpanId = transactionSpanId;
      }
      /**
       * @inheritDoc
       */
      add(span2) {
        if (span2.spanId !== this.transactionSpanId) {
          span2.finish = (endTimestamp) => {
            span2.endTimestamp = typeof endTimestamp === "number" ? endTimestamp : utils.timestampInSeconds();
            this._popActivity(span2.spanId);
          };
          if (span2.endTimestamp === void 0) {
            this._pushActivity(span2.spanId);
          }
        }
        super.add(span2);
      }
    };
    var IdleTransaction = class extends transaction.Transaction {
      // Activities store a list of active spans
      // Track state of activities in previous heartbeat
      // Amount of times heartbeat has counted. Will cause transaction to finish after 3 beats.
      // We should not use heartbeat if we finished a transaction
      // Idle timeout was canceled and we should finish the transaction with the last span end.
      /**
       * Timer that tracks Transaction idleTimeout
       */
      constructor(transactionContext, _idleHub, _idleTimeout = TRACING_DEFAULTS.idleTimeout, _finalTimeout = TRACING_DEFAULTS.finalTimeout, _heartbeatInterval = TRACING_DEFAULTS.heartbeatInterval, _onScope = false) {
        super(transactionContext, _idleHub);
        this._idleHub = _idleHub;
        this._idleTimeout = _idleTimeout;
        this._finalTimeout = _finalTimeout;
        this._heartbeatInterval = _heartbeatInterval;
        this._onScope = _onScope;
        this.activities = {};
        this._heartbeatCounter = 0;
        this._finished = false;
        this._idleTimeoutCanceledPermanently = false;
        this._beforeFinishCallbacks = [];
        this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[4];
        if (_onScope) {
          debugBuild.DEBUG_BUILD && utils.logger.log(`Setting idle transaction on scope. Span ID: ${this.spanId}`);
          _idleHub.configureScope((scope) => scope.setSpan(this));
        }
        this._restartIdleTimeout();
        setTimeout(() => {
          if (!this._finished) {
            this.setStatus("deadline_exceeded");
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[3];
            this.finish();
          }
        }, this._finalTimeout);
      }
      /** {@inheritDoc} */
      finish(endTimestamp = utils.timestampInSeconds()) {
        this._finished = true;
        this.activities = {};
        if (this.op === "ui.action.click") {
          this.setTag(FINISH_REASON_TAG, this._finishReason);
        }
        if (this.spanRecorder) {
          debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] finishing IdleTransaction", new Date(endTimestamp * 1e3).toISOString(), this.op);
          for (const callback of this._beforeFinishCallbacks) {
            callback(this, endTimestamp);
          }
          this.spanRecorder.spans = this.spanRecorder.spans.filter((span2) => {
            if (span2.spanId === this.spanId) {
              return true;
            }
            if (!span2.endTimestamp) {
              span2.endTimestamp = endTimestamp;
              span2.setStatus("cancelled");
              debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] cancelling span since transaction ended early", JSON.stringify(span2, void 0, 2));
            }
            const spanStartedBeforeTransactionFinish = span2.startTimestamp < endTimestamp;
            const timeoutWithMarginOfError = (this._finalTimeout + this._idleTimeout) / 1e3;
            const spanEndedBeforeFinalTimeout = span2.endTimestamp - this.startTimestamp < timeoutWithMarginOfError;
            if (debugBuild.DEBUG_BUILD) {
              const stringifiedSpan = JSON.stringify(span2, void 0, 2);
              if (!spanStartedBeforeTransactionFinish) {
                utils.logger.log("[Tracing] discarding Span since it happened after Transaction was finished", stringifiedSpan);
              } else if (!spanEndedBeforeFinalTimeout) {
                utils.logger.log("[Tracing] discarding Span since it finished after Transaction final timeout", stringifiedSpan);
              }
            }
            return spanStartedBeforeTransactionFinish && spanEndedBeforeFinalTimeout;
          });
          debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] flushing IdleTransaction");
        } else {
          debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] No active IdleTransaction");
        }
        if (this._onScope) {
          const scope = this._idleHub.getScope();
          if (scope.getTransaction() === this) {
            scope.setSpan(void 0);
          }
        }
        return super.finish(endTimestamp);
      }
      /**
       * Register a callback function that gets excecuted before the transaction finishes.
       * Useful for cleanup or if you want to add any additional spans based on current context.
       *
       * This is exposed because users have no other way of running something before an idle transaction
       * finishes.
       */
      registerBeforeFinishCallback(callback) {
        this._beforeFinishCallbacks.push(callback);
      }
      /**
       * @inheritDoc
       */
      initSpanRecorder(maxlen) {
        if (!this.spanRecorder) {
          const pushActivity = (id) => {
            if (this._finished) {
              return;
            }
            this._pushActivity(id);
          };
          const popActivity = (id) => {
            if (this._finished) {
              return;
            }
            this._popActivity(id);
          };
          this.spanRecorder = new IdleTransactionSpanRecorder(pushActivity, popActivity, this.spanId, maxlen);
          debugBuild.DEBUG_BUILD && utils.logger.log("Starting heartbeat");
          this._pingHeartbeat();
        }
        this.spanRecorder.add(this);
      }
      /**
       * Cancels the existing idle timeout, if there is one.
       * @param restartOnChildSpanChange Default is `true`.
       *                                 If set to false the transaction will end
       *                                 with the last child span.
       */
      cancelIdleTimeout(endTimestamp, {
        restartOnChildSpanChange
      } = {
        restartOnChildSpanChange: true
      }) {
        this._idleTimeoutCanceledPermanently = restartOnChildSpanChange === false;
        if (this._idleTimeoutID) {
          clearTimeout(this._idleTimeoutID);
          this._idleTimeoutID = void 0;
          if (Object.keys(this.activities).length === 0 && this._idleTimeoutCanceledPermanently) {
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[5];
            this.finish(endTimestamp);
          }
        }
      }
      /**
       * Temporary method used to externally set the transaction's `finishReason`
       *
       * ** WARNING**
       * This is for the purpose of experimentation only and will be removed in the near future, do not use!
       *
       * @internal
       *
       */
      setFinishReason(reason) {
        this._finishReason = reason;
      }
      /**
       * Restarts idle timeout, if there is no running idle timeout it will start one.
       */
      _restartIdleTimeout(endTimestamp) {
        this.cancelIdleTimeout();
        this._idleTimeoutID = setTimeout(() => {
          if (!this._finished && Object.keys(this.activities).length === 0) {
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[1];
            this.finish(endTimestamp);
          }
        }, this._idleTimeout);
      }
      /**
       * Start tracking a specific activity.
       * @param spanId The span id that represents the activity
       */
      _pushActivity(spanId) {
        this.cancelIdleTimeout(void 0, { restartOnChildSpanChange: !this._idleTimeoutCanceledPermanently });
        debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] pushActivity: ${spanId}`);
        this.activities[spanId] = true;
        debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] new activities count", Object.keys(this.activities).length);
      }
      /**
       * Remove an activity from usage
       * @param spanId The span id that represents the activity
       */
      _popActivity(spanId) {
        if (this.activities[spanId]) {
          debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] popActivity ${spanId}`);
          delete this.activities[spanId];
          debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] new activities count", Object.keys(this.activities).length);
        }
        if (Object.keys(this.activities).length === 0) {
          const endTimestamp = utils.timestampInSeconds();
          if (this._idleTimeoutCanceledPermanently) {
            this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[5];
            this.finish(endTimestamp);
          } else {
            this._restartIdleTimeout(endTimestamp + this._idleTimeout / 1e3);
          }
        }
      }
      /**
       * Checks when entries of this.activities are not changing for 3 beats.
       * If this occurs we finish the transaction.
       */
      _beat() {
        if (this._finished) {
          return;
        }
        const heartbeatString = Object.keys(this.activities).join("");
        if (heartbeatString === this._prevHeartbeatString) {
          this._heartbeatCounter++;
        } else {
          this._heartbeatCounter = 1;
        }
        this._prevHeartbeatString = heartbeatString;
        if (this._heartbeatCounter >= 3) {
          debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] Transaction finished because of no change for 3 heart beats");
          this.setStatus("deadline_exceeded");
          this._finishReason = IDLE_TRANSACTION_FINISH_REASONS[0];
          this.finish();
        } else {
          this._pingHeartbeat();
        }
      }
      /**
       * Pings the heartbeat
       */
      _pingHeartbeat() {
        debugBuild.DEBUG_BUILD && utils.logger.log(`pinging Heartbeat -> current counter: ${this._heartbeatCounter}`);
        setTimeout(() => {
          this._beat();
        }, this._heartbeatInterval);
      }
    };
    exports.IdleTransaction = IdleTransaction;
    exports.IdleTransactionSpanRecorder = IdleTransactionSpanRecorder;
    exports.TRACING_DEFAULTS = TRACING_DEFAULTS;
  }
});

// node_modules/@sentry/core/cjs/utils/prepareEvent.js
var require_prepareEvent = __commonJS({
  "node_modules/@sentry/core/cjs/utils/prepareEvent.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var constants = require_constants();
    var eventProcessors = require_eventProcessors();
    var scope = require_scope();
    function prepareEvent(options, event, hint, scope$1, client) {
      const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = options;
      const prepared = {
        ...event,
        event_id: event.event_id || hint.event_id || utils.uuid4(),
        timestamp: event.timestamp || utils.dateTimestampInSeconds()
      };
      const integrations = hint.integrations || options.integrations.map((i) => i.name);
      applyClientOptions(prepared, options);
      applyIntegrationsMetadata(prepared, integrations);
      if (event.type === void 0) {
        applyDebugIds(prepared, options.stackParser);
      }
      let finalScope = scope$1;
      if (hint.captureContext) {
        finalScope = scope.Scope.clone(finalScope).update(hint.captureContext);
      }
      if (hint.mechanism) {
        utils.addExceptionMechanism(prepared, hint.mechanism);
      }
      let result = utils.resolvedSyncPromise(prepared);
      const clientEventProcessors = client && client.getEventProcessors ? client.getEventProcessors() : [];
      if (finalScope) {
        if (finalScope.getAttachments) {
          const attachments = [...hint.attachments || [], ...finalScope.getAttachments()];
          if (attachments.length) {
            hint.attachments = attachments;
          }
        }
        result = finalScope.applyToEvent(prepared, hint, clientEventProcessors);
      } else {
        result = eventProcessors.notifyEventProcessors(
          [
            ...clientEventProcessors,
            // eslint-disable-next-line deprecation/deprecation
            ...eventProcessors.getGlobalEventProcessors()
          ],
          prepared,
          hint
        );
      }
      return result.then((evt) => {
        if (evt) {
          applyDebugMeta(evt);
        }
        if (typeof normalizeDepth === "number" && normalizeDepth > 0) {
          return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
        }
        return evt;
      });
    }
    function applyClientOptions(event, options) {
      const { environment, release: release2, dist, maxValueLength = 250 } = options;
      if (!("environment" in event)) {
        event.environment = "environment" in options ? environment : constants.DEFAULT_ENVIRONMENT;
      }
      if (event.release === void 0 && release2 !== void 0) {
        event.release = release2;
      }
      if (event.dist === void 0 && dist !== void 0) {
        event.dist = dist;
      }
      if (event.message) {
        event.message = utils.truncate(event.message, maxValueLength);
      }
      const exception = event.exception && event.exception.values && event.exception.values[0];
      if (exception && exception.value) {
        exception.value = utils.truncate(exception.value, maxValueLength);
      }
      const request = event.request;
      if (request && request.url) {
        request.url = utils.truncate(request.url, maxValueLength);
      }
    }
    var debugIdStackParserCache2 = /* @__PURE__ */ new WeakMap();
    function applyDebugIds(event, stackParser) {
      const debugIdMap = utils.GLOBAL_OBJ._sentryDebugIds;
      if (!debugIdMap) {
        return;
      }
      let debugIdStackFramesCache;
      const cachedDebugIdStackFrameCache = debugIdStackParserCache2.get(stackParser);
      if (cachedDebugIdStackFrameCache) {
        debugIdStackFramesCache = cachedDebugIdStackFrameCache;
      } else {
        debugIdStackFramesCache = /* @__PURE__ */ new Map();
        debugIdStackParserCache2.set(stackParser, debugIdStackFramesCache);
      }
      const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
        let parsedStack;
        const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
        if (cachedParsedStack) {
          parsedStack = cachedParsedStack;
        } else {
          parsedStack = stackParser(debugIdStackTrace);
          debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
        }
        for (let i = parsedStack.length - 1; i >= 0; i--) {
          const stackFrame = parsedStack[i];
          if (stackFrame.filename) {
            acc[stackFrame.filename] = debugIdMap[debugIdStackTrace];
            break;
          }
        }
        return acc;
      }, {});
      try {
        event.exception.values.forEach((exception) => {
          exception.stacktrace.frames.forEach((frame) => {
            if (frame.filename) {
              frame.debug_id = filenameDebugIdMap[frame.filename];
            }
          });
        });
      } catch (e) {
      }
    }
    function applyDebugMeta(event) {
      const filenameDebugIdMap = {};
      try {
        event.exception.values.forEach((exception) => {
          exception.stacktrace.frames.forEach((frame) => {
            if (frame.debug_id) {
              if (frame.abs_path) {
                filenameDebugIdMap[frame.abs_path] = frame.debug_id;
              } else if (frame.filename) {
                filenameDebugIdMap[frame.filename] = frame.debug_id;
              }
              delete frame.debug_id;
            }
          });
        });
      } catch (e) {
      }
      if (Object.keys(filenameDebugIdMap).length === 0) {
        return;
      }
      event.debug_meta = event.debug_meta || {};
      event.debug_meta.images = event.debug_meta.images || [];
      const images = event.debug_meta.images;
      Object.keys(filenameDebugIdMap).forEach((filename) => {
        images.push({
          type: "sourcemap",
          code_file: filename,
          debug_id: filenameDebugIdMap[filename]
        });
      });
    }
    function applyIntegrationsMetadata(event, integrationNames) {
      if (integrationNames.length > 0) {
        event.sdk = event.sdk || {};
        event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
      }
    }
    function normalizeEvent(event, depth, maxBreadth) {
      if (!event) {
        return null;
      }
      const normalized = {
        ...event,
        ...event.breadcrumbs && {
          breadcrumbs: event.breadcrumbs.map((b) => ({
            ...b,
            ...b.data && {
              data: utils.normalize(b.data, depth, maxBreadth)
            }
          }))
        },
        ...event.user && {
          user: utils.normalize(event.user, depth, maxBreadth)
        },
        ...event.contexts && {
          contexts: utils.normalize(event.contexts, depth, maxBreadth)
        },
        ...event.extra && {
          extra: utils.normalize(event.extra, depth, maxBreadth)
        }
      };
      if (event.contexts && event.contexts.trace && normalized.contexts) {
        normalized.contexts.trace = event.contexts.trace;
        if (event.contexts.trace.data) {
          normalized.contexts.trace.data = utils.normalize(event.contexts.trace.data, depth, maxBreadth);
        }
      }
      if (event.spans) {
        normalized.spans = event.spans.map((span) => {
          if (span.data) {
            span.data = utils.normalize(span.data, depth, maxBreadth);
          }
          return span;
        });
      }
      return normalized;
    }
    function parseEventHintOrCaptureContext(hint) {
      if (!hint) {
        return void 0;
      }
      if (hintIsScopeOrFunction(hint)) {
        return { captureContext: hint };
      }
      if (hintIsScopeContext(hint)) {
        return {
          captureContext: hint
        };
      }
      return hint;
    }
    function hintIsScopeOrFunction(hint) {
      return hint instanceof scope.Scope || typeof hint === "function";
    }
    var captureContextKeys = [
      "user",
      "level",
      "extra",
      "contexts",
      "tags",
      "fingerprint",
      "requestSession",
      "propagationContext"
    ];
    function hintIsScopeContext(hint) {
      return Object.keys(hint).some((key) => captureContextKeys.includes(key));
    }
    exports.applyDebugIds = applyDebugIds;
    exports.applyDebugMeta = applyDebugMeta;
    exports.parseEventHintOrCaptureContext = parseEventHintOrCaptureContext;
    exports.prepareEvent = prepareEvent;
  }
});

// node_modules/@sentry/core/cjs/exports.js
var require_exports = __commonJS({
  "node_modules/@sentry/core/cjs/exports.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var hub = require_hub();
    var prepareEvent = require_prepareEvent();
    function captureException(exception, hint) {
      return hub.getCurrentHub().captureException(exception, prepareEvent.parseEventHintOrCaptureContext(hint));
    }
    function captureMessage(message, captureContext) {
      const level = typeof captureContext === "string" ? captureContext : void 0;
      const context = typeof captureContext !== "string" ? { captureContext } : void 0;
      return hub.getCurrentHub().captureMessage(message, level, context);
    }
    function captureEvent(event, hint) {
      return hub.getCurrentHub().captureEvent(event, hint);
    }
    function configureScope(callback) {
      hub.getCurrentHub().configureScope(callback);
    }
    function addBreadcrumb(breadcrumb) {
      hub.getCurrentHub().addBreadcrumb(breadcrumb);
    }
    function setContext(name, context) {
      hub.getCurrentHub().setContext(name, context);
    }
    function setExtras(extras) {
      hub.getCurrentHub().setExtras(extras);
    }
    function setExtra(key, extra) {
      hub.getCurrentHub().setExtra(key, extra);
    }
    function setTags(tags) {
      hub.getCurrentHub().setTags(tags);
    }
    function setTag(key, value) {
      hub.getCurrentHub().setTag(key, value);
    }
    function setUser(user) {
      hub.getCurrentHub().setUser(user);
    }
    function withScope(callback) {
      hub.getCurrentHub().withScope(callback);
    }
    function startTransaction(context, customSamplingContext) {
      return hub.getCurrentHub().startTransaction({ ...context }, customSamplingContext);
    }
    function captureCheckIn(checkIn, upsertMonitorConfig) {
      const hub$1 = hub.getCurrentHub();
      const scope = hub$1.getScope();
      const client = hub$1.getClient();
      if (!client) {
        debugBuild.DEBUG_BUILD && utils.logger.warn("Cannot capture check-in. No client defined.");
      } else if (!client.captureCheckIn) {
        debugBuild.DEBUG_BUILD && utils.logger.warn("Cannot capture check-in. Client does not support sending check-ins.");
      } else {
        return client.captureCheckIn(checkIn, upsertMonitorConfig, scope);
      }
      return utils.uuid4();
    }
    function withMonitor(monitorSlug, callback, upsertMonitorConfig) {
      const checkInId = captureCheckIn({ monitorSlug, status: "in_progress" }, upsertMonitorConfig);
      const now = utils.timestampInSeconds();
      function finishCheckIn(status) {
        captureCheckIn({ monitorSlug, status, checkInId, duration: utils.timestampInSeconds() - now });
      }
      let maybePromiseResult;
      try {
        maybePromiseResult = callback();
      } catch (e) {
        finishCheckIn("error");
        throw e;
      }
      if (utils.isThenable(maybePromiseResult)) {
        Promise.resolve(maybePromiseResult).then(
          () => {
            finishCheckIn("ok");
          },
          () => {
            finishCheckIn("error");
          }
        );
      } else {
        finishCheckIn("ok");
      }
      return maybePromiseResult;
    }
    async function flush(timeout) {
      const client = getClient();
      if (client) {
        return client.flush(timeout);
      }
      debugBuild.DEBUG_BUILD && utils.logger.warn("Cannot flush events. No client defined.");
      return Promise.resolve(false);
    }
    async function close(timeout) {
      const client = getClient();
      if (client) {
        return client.close(timeout);
      }
      debugBuild.DEBUG_BUILD && utils.logger.warn("Cannot flush events and disable SDK. No client defined.");
      return Promise.resolve(false);
    }
    function lastEventId() {
      return hub.getCurrentHub().lastEventId();
    }
    function getClient() {
      return hub.getCurrentHub().getClient();
    }
    exports.addBreadcrumb = addBreadcrumb;
    exports.captureCheckIn = captureCheckIn;
    exports.captureEvent = captureEvent;
    exports.captureException = captureException;
    exports.captureMessage = captureMessage;
    exports.close = close;
    exports.configureScope = configureScope;
    exports.flush = flush;
    exports.getClient = getClient;
    exports.lastEventId = lastEventId;
    exports.setContext = setContext;
    exports.setExtra = setExtra;
    exports.setExtras = setExtras;
    exports.setTag = setTag;
    exports.setTags = setTags;
    exports.setUser = setUser;
    exports.startTransaction = startTransaction;
    exports.withMonitor = withMonitor;
    exports.withScope = withScope;
  }
});

// node_modules/@sentry/core/cjs/utils/hasTracingEnabled.js
var require_hasTracingEnabled = __commonJS({
  "node_modules/@sentry/core/cjs/utils/hasTracingEnabled.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var exports$1 = require_exports();
    function hasTracingEnabled(maybeOptions) {
      if (typeof __SENTRY_TRACING__ === "boolean" && !__SENTRY_TRACING__) {
        return false;
      }
      const client = exports$1.getClient();
      const options = maybeOptions || client && client.getOptions();
      return !!options && (options.enableTracing || "tracesSampleRate" in options || "tracesSampler" in options);
    }
    exports.hasTracingEnabled = hasTracingEnabled;
  }
});

// node_modules/@sentry/core/cjs/tracing/sampling.js
var require_sampling = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/sampling.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var hasTracingEnabled = require_hasTracingEnabled();
    function sampleTransaction(transaction, options, samplingContext) {
      if (!hasTracingEnabled.hasTracingEnabled(options)) {
        transaction.sampled = false;
        return transaction;
      }
      if (transaction.sampled !== void 0) {
        transaction.setMetadata({
          sampleRate: Number(transaction.sampled)
        });
        return transaction;
      }
      let sampleRate;
      if (typeof options.tracesSampler === "function") {
        sampleRate = options.tracesSampler(samplingContext);
        transaction.setMetadata({
          sampleRate: Number(sampleRate)
        });
      } else if (samplingContext.parentSampled !== void 0) {
        sampleRate = samplingContext.parentSampled;
      } else if (typeof options.tracesSampleRate !== "undefined") {
        sampleRate = options.tracesSampleRate;
        transaction.setMetadata({
          sampleRate: Number(sampleRate)
        });
      } else {
        sampleRate = 1;
        transaction.setMetadata({
          sampleRate
        });
      }
      if (!isValidSampleRate2(sampleRate)) {
        debugBuild.DEBUG_BUILD && utils.logger.warn("[Tracing] Discarding transaction because of invalid sample rate.");
        transaction.sampled = false;
        return transaction;
      }
      if (!sampleRate) {
        debugBuild.DEBUG_BUILD && utils.logger.log(
          `[Tracing] Discarding transaction because ${typeof options.tracesSampler === "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`
        );
        transaction.sampled = false;
        return transaction;
      }
      transaction.sampled = Math.random() < sampleRate;
      if (!transaction.sampled) {
        debugBuild.DEBUG_BUILD && utils.logger.log(
          `[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(
            sampleRate
          )})`
        );
        return transaction;
      }
      debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] starting ${transaction.op} transaction - ${transaction.name}`);
      return transaction;
    }
    function isValidSampleRate2(rate) {
      if (utils.isNaN(rate) || !(typeof rate === "number" || typeof rate === "boolean")) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(
          `[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
            rate
          )} of type ${JSON.stringify(typeof rate)}.`
        );
        return false;
      }
      if (rate < 0 || rate > 1) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(`[Tracing] Given sample rate is invalid. Sample rate must be between 0 and 1. Got ${rate}.`);
        return false;
      }
      return true;
    }
    exports.sampleTransaction = sampleTransaction;
  }
});

// node_modules/@sentry/core/cjs/tracing/hubextensions.js
var require_hubextensions = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/hubextensions.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var hub = require_hub();
    var errors = require_errors();
    var idletransaction = require_idletransaction();
    var sampling = require_sampling();
    var transaction = require_transaction();
    function traceHeaders() {
      const scope = this.getScope();
      const span = scope.getSpan();
      return span ? {
        "sentry-trace": span.toTraceparent()
      } : {};
    }
    function _startTransaction(transactionContext, customSamplingContext) {
      const client = this.getClient();
      const options = client && client.getOptions() || {};
      const configInstrumenter = options.instrumenter || "sentry";
      const transactionInstrumenter = transactionContext.instrumenter || "sentry";
      if (configInstrumenter !== transactionInstrumenter) {
        debugBuild.DEBUG_BUILD && utils.logger.error(
          `A transaction was started with instrumenter=\`${transactionInstrumenter}\`, but the SDK is configured with the \`${configInstrumenter}\` instrumenter.
The transaction will not be sampled. Please use the ${configInstrumenter} instrumentation to start transactions.`
        );
        transactionContext.sampled = false;
      }
      let transaction$1 = new transaction.Transaction(transactionContext, this);
      transaction$1 = sampling.sampleTransaction(transaction$1, options, {
        parentSampled: transactionContext.parentSampled,
        transactionContext,
        ...customSamplingContext
      });
      if (transaction$1.sampled) {
        transaction$1.initSpanRecorder(options._experiments && options._experiments.maxSpans);
      }
      if (client && client.emit) {
        client.emit("startTransaction", transaction$1);
      }
      return transaction$1;
    }
    function startIdleTransaction(hub2, transactionContext, idleTimeout, finalTimeout, onScope, customSamplingContext, heartbeatInterval) {
      const client = hub2.getClient();
      const options = client && client.getOptions() || {};
      let transaction2 = new idletransaction.IdleTransaction(transactionContext, hub2, idleTimeout, finalTimeout, heartbeatInterval, onScope);
      transaction2 = sampling.sampleTransaction(transaction2, options, {
        parentSampled: transactionContext.parentSampled,
        transactionContext,
        ...customSamplingContext
      });
      if (transaction2.sampled) {
        transaction2.initSpanRecorder(options._experiments && options._experiments.maxSpans);
      }
      if (client && client.emit) {
        client.emit("startTransaction", transaction2);
      }
      return transaction2;
    }
    function addTracingExtensions() {
      const carrier = hub.getMainCarrier();
      if (!carrier.__SENTRY__) {
        return;
      }
      carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};
      if (!carrier.__SENTRY__.extensions.startTransaction) {
        carrier.__SENTRY__.extensions.startTransaction = _startTransaction;
      }
      if (!carrier.__SENTRY__.extensions.traceHeaders) {
        carrier.__SENTRY__.extensions.traceHeaders = traceHeaders;
      }
      errors.registerErrorInstrumentation();
    }
    exports.addTracingExtensions = addTracingExtensions;
    exports.startIdleTransaction = startIdleTransaction;
  }
});

// node_modules/@sentry/core/cjs/tracing/spanstatus.js
var require_spanstatus = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/spanstatus.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpanStatus = void 0;
    (function(SpanStatus) {
      const Ok = "ok";
      SpanStatus["Ok"] = Ok;
      const DeadlineExceeded = "deadline_exceeded";
      SpanStatus["DeadlineExceeded"] = DeadlineExceeded;
      const Unauthenticated = "unauthenticated";
      SpanStatus["Unauthenticated"] = Unauthenticated;
      const PermissionDenied = "permission_denied";
      SpanStatus["PermissionDenied"] = PermissionDenied;
      const NotFound = "not_found";
      SpanStatus["NotFound"] = NotFound;
      const ResourceExhausted = "resource_exhausted";
      SpanStatus["ResourceExhausted"] = ResourceExhausted;
      const InvalidArgument = "invalid_argument";
      SpanStatus["InvalidArgument"] = InvalidArgument;
      const Unimplemented = "unimplemented";
      SpanStatus["Unimplemented"] = Unimplemented;
      const Unavailable = "unavailable";
      SpanStatus["Unavailable"] = Unavailable;
      const InternalError = "internal_error";
      SpanStatus["InternalError"] = InternalError;
      const UnknownError = "unknown_error";
      SpanStatus["UnknownError"] = UnknownError;
      const Cancelled = "cancelled";
      SpanStatus["Cancelled"] = Cancelled;
      const AlreadyExists = "already_exists";
      SpanStatus["AlreadyExists"] = AlreadyExists;
      const FailedPrecondition = "failed_precondition";
      SpanStatus["FailedPrecondition"] = FailedPrecondition;
      const Aborted = "aborted";
      SpanStatus["Aborted"] = Aborted;
      const OutOfRange = "out_of_range";
      SpanStatus["OutOfRange"] = OutOfRange;
      const DataLoss = "data_loss";
      SpanStatus["DataLoss"] = DataLoss;
    })(exports.SpanStatus || (exports.SpanStatus = {}));
  }
});

// node_modules/@sentry/core/cjs/tracing/trace.js
var require_trace = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/trace.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var hub = require_hub();
    var hasTracingEnabled = require_hasTracingEnabled();
    function trace(context, callback, onError = () => {
    }) {
      const ctx = normalizeContext(context);
      const hub$1 = hub.getCurrentHub();
      const scope = hub$1.getScope();
      const parentSpan = scope.getSpan();
      const activeSpan = createChildSpanOrTransaction(hub$1, parentSpan, ctx);
      scope.setSpan(activeSpan);
      function finishAndSetSpan() {
        activeSpan && activeSpan.finish();
        hub$1.getScope().setSpan(parentSpan);
      }
      let maybePromiseResult;
      try {
        maybePromiseResult = callback(activeSpan);
      } catch (e) {
        activeSpan && activeSpan.setStatus("internal_error");
        onError(e);
        finishAndSetSpan();
        throw e;
      }
      if (utils.isThenable(maybePromiseResult)) {
        Promise.resolve(maybePromiseResult).then(
          () => {
            finishAndSetSpan();
          },
          (e) => {
            activeSpan && activeSpan.setStatus("internal_error");
            onError(e);
            finishAndSetSpan();
          }
        );
      } else {
        finishAndSetSpan();
      }
      return maybePromiseResult;
    }
    function startSpan(context, callback) {
      const ctx = normalizeContext(context);
      const hub$1 = hub.getCurrentHub();
      const scope = hub$1.getScope();
      const parentSpan = scope.getSpan();
      const activeSpan = createChildSpanOrTransaction(hub$1, parentSpan, ctx);
      scope.setSpan(activeSpan);
      function finishAndSetSpan() {
        activeSpan && activeSpan.finish();
        hub$1.getScope().setSpan(parentSpan);
      }
      let maybePromiseResult;
      try {
        maybePromiseResult = callback(activeSpan);
      } catch (e) {
        activeSpan && activeSpan.setStatus("internal_error");
        finishAndSetSpan();
        throw e;
      }
      if (utils.isThenable(maybePromiseResult)) {
        Promise.resolve(maybePromiseResult).then(
          () => {
            finishAndSetSpan();
          },
          () => {
            activeSpan && activeSpan.setStatus("internal_error");
            finishAndSetSpan();
          }
        );
      } else {
        finishAndSetSpan();
      }
      return maybePromiseResult;
    }
    var startActiveSpan = startSpan;
    function startSpanManual(context, callback) {
      const ctx = normalizeContext(context);
      const hub$1 = hub.getCurrentHub();
      const scope = hub$1.getScope();
      const parentSpan = scope.getSpan();
      const activeSpan = createChildSpanOrTransaction(hub$1, parentSpan, ctx);
      scope.setSpan(activeSpan);
      function finishAndSetSpan() {
        activeSpan && activeSpan.finish();
        hub$1.getScope().setSpan(parentSpan);
      }
      let maybePromiseResult;
      try {
        maybePromiseResult = callback(activeSpan, finishAndSetSpan);
      } catch (e) {
        activeSpan && activeSpan.setStatus("internal_error");
        throw e;
      }
      if (utils.isThenable(maybePromiseResult)) {
        Promise.resolve(maybePromiseResult).then(void 0, () => {
          activeSpan && activeSpan.setStatus("internal_error");
        });
      }
      return maybePromiseResult;
    }
    function startInactiveSpan(context) {
      if (!hasTracingEnabled.hasTracingEnabled()) {
        return void 0;
      }
      const ctx = { ...context };
      if (ctx.name !== void 0 && ctx.description === void 0) {
        ctx.description = ctx.name;
      }
      const hub$1 = hub.getCurrentHub();
      const parentSpan = getActiveSpan();
      return parentSpan ? parentSpan.startChild(ctx) : hub$1.startTransaction(ctx);
    }
    function getActiveSpan() {
      return hub.getCurrentHub().getScope().getSpan();
    }
    function continueTrace({
      sentryTrace,
      baggage
    }, callback) {
      const hub$1 = hub.getCurrentHub();
      const currentScope = hub$1.getScope();
      const { traceparentData, dynamicSamplingContext, propagationContext } = utils.tracingContextFromHeaders(
        sentryTrace,
        baggage
      );
      currentScope.setPropagationContext(propagationContext);
      if (debugBuild.DEBUG_BUILD && traceparentData) {
        utils.logger.log(`[Tracing] Continuing trace ${traceparentData.traceId}.`);
      }
      const transactionContext = {
        ...traceparentData,
        metadata: utils.dropUndefinedKeys({
          dynamicSamplingContext: traceparentData && !dynamicSamplingContext ? {} : dynamicSamplingContext
        })
      };
      if (!callback) {
        return transactionContext;
      }
      return callback(transactionContext);
    }
    function createChildSpanOrTransaction(hub2, parentSpan, ctx) {
      if (!hasTracingEnabled.hasTracingEnabled()) {
        return void 0;
      }
      return parentSpan ? parentSpan.startChild(ctx) : hub2.startTransaction(ctx);
    }
    function normalizeContext(context) {
      const ctx = { ...context };
      if (ctx.name !== void 0 && ctx.description === void 0) {
        ctx.description = ctx.name;
      }
      return ctx;
    }
    exports.continueTrace = continueTrace;
    exports.getActiveSpan = getActiveSpan;
    exports.startActiveSpan = startActiveSpan;
    exports.startInactiveSpan = startInactiveSpan;
    exports.startSpan = startSpan;
    exports.startSpanManual = startSpanManual;
    exports.trace = trace;
  }
});

// node_modules/@sentry/core/cjs/tracing/measurement.js
var require_measurement = __commonJS({
  "node_modules/@sentry/core/cjs/tracing/measurement.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_utils();
    function setMeasurement(name, value, unit) {
      const transaction = utils.getActiveTransaction();
      if (transaction) {
        transaction.setMeasurement(name, value, unit);
      }
    }
    exports.setMeasurement = setMeasurement;
  }
});

// node_modules/@sentry/core/cjs/envelope.js
var require_envelope2 = __commonJS({
  "node_modules/@sentry/core/cjs/envelope.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    function enhanceEventWithSdkInfo2(event, sdkInfo) {
      if (!sdkInfo) {
        return event;
      }
      event.sdk = event.sdk || {};
      event.sdk.name = event.sdk.name || sdkInfo.name;
      event.sdk.version = event.sdk.version || sdkInfo.version;
      event.sdk.integrations = [...event.sdk.integrations || [], ...sdkInfo.integrations || []];
      event.sdk.packages = [...event.sdk.packages || [], ...sdkInfo.packages || []];
      return event;
    }
    function createSessionEnvelope(session, dsn, metadata, tunnel) {
      const sdkInfo = utils.getSdkMetadataForEnvelopeHeader(metadata);
      const envelopeHeaders = {
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        ...sdkInfo && { sdk: sdkInfo },
        ...!!tunnel && dsn && { dsn: utils.dsnToString(dsn) }
      };
      const envelopeItem = "aggregates" in session ? [{ type: "sessions" }, session] : [{ type: "session" }, session.toJSON()];
      return utils.createEnvelope(envelopeHeaders, [envelopeItem]);
    }
    function createEventEnvelope(event, dsn, metadata, tunnel) {
      const sdkInfo = utils.getSdkMetadataForEnvelopeHeader(metadata);
      const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
      enhanceEventWithSdkInfo2(event, metadata && metadata.sdk);
      const envelopeHeaders = utils.createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
      delete event.sdkProcessingMetadata;
      const eventItem = [{ type: eventType }, event];
      return utils.createEnvelope(envelopeHeaders, [eventItem]);
    }
    exports.createEventEnvelope = createEventEnvelope;
    exports.createSessionEnvelope = createSessionEnvelope;
  }
});

// node_modules/@sentry/core/cjs/sessionflusher.js
var require_sessionflusher = __commonJS({
  "node_modules/@sentry/core/cjs/sessionflusher.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var hub = require_hub();
    var SessionFlusher = class {
      constructor(client, attrs) {
        this._client = client;
        this.flushTimeout = 60;
        this._pendingAggregates = {};
        this._isEnabled = true;
        this._intervalId = setInterval(() => this.flush(), this.flushTimeout * 1e3);
        this._sessionAttrs = attrs;
      }
      /** Checks if `pendingAggregates` has entries, and if it does flushes them by calling `sendSession` */
      flush() {
        const sessionAggregates = this.getSessionAggregates();
        if (sessionAggregates.aggregates.length === 0) {
          return;
        }
        this._pendingAggregates = {};
        this._client.sendSession(sessionAggregates);
      }
      /** Massages the entries in `pendingAggregates` and returns aggregated sessions */
      getSessionAggregates() {
        const aggregates = Object.keys(this._pendingAggregates).map((key) => {
          return this._pendingAggregates[parseInt(key)];
        });
        const sessionAggregates = {
          attrs: this._sessionAttrs,
          aggregates
        };
        return utils.dropUndefinedKeys(sessionAggregates);
      }
      /** JSDoc */
      close() {
        clearInterval(this._intervalId);
        this._isEnabled = false;
        this.flush();
      }
      /**
       * Wrapper function for _incrementSessionStatusCount that checks if the instance of SessionFlusher is enabled then
       * fetches the session status of the request from `Scope.getRequestSession().status` on the scope and passes them to
       * `_incrementSessionStatusCount` along with the start date
       */
      incrementSessionStatusCount() {
        if (!this._isEnabled) {
          return;
        }
        const scope = hub.getCurrentHub().getScope();
        const requestSession = scope.getRequestSession();
        if (requestSession && requestSession.status) {
          this._incrementSessionStatusCount(requestSession.status, /* @__PURE__ */ new Date());
          scope.setRequestSession(void 0);
        }
      }
      /**
       * Increments status bucket in pendingAggregates buffer (internal state) corresponding to status of
       * the session received
       */
      _incrementSessionStatusCount(status, date) {
        const sessionStartedTrunc = new Date(date).setSeconds(0, 0);
        this._pendingAggregates[sessionStartedTrunc] = this._pendingAggregates[sessionStartedTrunc] || {};
        const aggregationCounts = this._pendingAggregates[sessionStartedTrunc];
        if (!aggregationCounts.started) {
          aggregationCounts.started = new Date(sessionStartedTrunc).toISOString();
        }
        switch (status) {
          case "errored":
            aggregationCounts.errored = (aggregationCounts.errored || 0) + 1;
            return aggregationCounts.errored;
          case "ok":
            aggregationCounts.exited = (aggregationCounts.exited || 0) + 1;
            return aggregationCounts.exited;
          default:
            aggregationCounts.crashed = (aggregationCounts.crashed || 0) + 1;
            return aggregationCounts.crashed;
        }
      }
    };
    exports.SessionFlusher = SessionFlusher;
  }
});

// node_modules/@sentry/core/cjs/api.js
var require_api = __commonJS({
  "node_modules/@sentry/core/cjs/api.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var SENTRY_API_VERSION = "7";
    function getBaseApiEndpoint(dsn) {
      const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
      const port = dsn.port ? `:${dsn.port}` : "";
      return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
    }
    function _getIngestEndpoint(dsn) {
      return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
    }
    function _encodedAuth(dsn, sdkInfo) {
      return utils.urlEncode({
        // We send only the minimum set of required information. See
        // https://github.com/getsentry/sentry-javascript/issues/2572.
        sentry_key: dsn.publicKey,
        sentry_version: SENTRY_API_VERSION,
        ...sdkInfo && { sentry_client: `${sdkInfo.name}/${sdkInfo.version}` }
      });
    }
    function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnelOrOptions = {}) {
      const tunnel = typeof tunnelOrOptions === "string" ? tunnelOrOptions : tunnelOrOptions.tunnel;
      const sdkInfo = typeof tunnelOrOptions === "string" || !tunnelOrOptions._metadata ? void 0 : tunnelOrOptions._metadata.sdk;
      return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
    }
    function getReportDialogEndpoint(dsnLike, dialogOptions) {
      const dsn = utils.makeDsn(dsnLike);
      if (!dsn) {
        return "";
      }
      const endpoint = `${getBaseApiEndpoint(dsn)}embed/error-page/`;
      let encodedOptions = `dsn=${utils.dsnToString(dsn)}`;
      for (const key in dialogOptions) {
        if (key === "dsn") {
          continue;
        }
        if (key === "onClose") {
          continue;
        }
        if (key === "user") {
          const user = dialogOptions.user;
          if (!user) {
            continue;
          }
          if (user.name) {
            encodedOptions += `&name=${encodeURIComponent(user.name)}`;
          }
          if (user.email) {
            encodedOptions += `&email=${encodeURIComponent(user.email)}`;
          }
        } else {
          encodedOptions += `&${encodeURIComponent(key)}=${encodeURIComponent(dialogOptions[key])}`;
        }
      }
      return `${endpoint}?${encodedOptions}`;
    }
    exports.getEnvelopeEndpointWithUrlEncodedAuth = getEnvelopeEndpointWithUrlEncodedAuth;
    exports.getReportDialogEndpoint = getReportDialogEndpoint;
  }
});

// node_modules/@sentry/core/cjs/integration.js
var require_integration = __commonJS({
  "node_modules/@sentry/core/cjs/integration.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var eventProcessors = require_eventProcessors();
    var exports$1 = require_exports();
    var hub = require_hub();
    var installedIntegrations = [];
    function filterDuplicates(integrations) {
      const integrationsByName = {};
      integrations.forEach((currentInstance) => {
        const { name } = currentInstance;
        const existingInstance = integrationsByName[name];
        if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
          return;
        }
        integrationsByName[name] = currentInstance;
      });
      return Object.keys(integrationsByName).map((k) => integrationsByName[k]);
    }
    function getIntegrationsToSetup(options) {
      const defaultIntegrations = options.defaultIntegrations || [];
      const userIntegrations = options.integrations;
      defaultIntegrations.forEach((integration) => {
        integration.isDefaultInstance = true;
      });
      let integrations;
      if (Array.isArray(userIntegrations)) {
        integrations = [...defaultIntegrations, ...userIntegrations];
      } else if (typeof userIntegrations === "function") {
        integrations = utils.arrayify(userIntegrations(defaultIntegrations));
      } else {
        integrations = defaultIntegrations;
      }
      const finalIntegrations = filterDuplicates(integrations);
      const debugIndex = findIndex(finalIntegrations, (integration) => integration.name === "Debug");
      if (debugIndex !== -1) {
        const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
        finalIntegrations.push(debugInstance);
      }
      return finalIntegrations;
    }
    function setupIntegrations(client, integrations) {
      const integrationIndex = {};
      integrations.forEach((integration) => {
        if (integration) {
          setupIntegration(client, integration, integrationIndex);
        }
      });
      return integrationIndex;
    }
    function setupIntegration(client, integration, integrationIndex) {
      integrationIndex[integration.name] = integration;
      if (installedIntegrations.indexOf(integration.name) === -1) {
        integration.setupOnce(eventProcessors.addGlobalEventProcessor, hub.getCurrentHub);
        installedIntegrations.push(integration.name);
      }
      if (integration.setup && typeof integration.setup === "function") {
        integration.setup(client);
      }
      if (client.on && typeof integration.preprocessEvent === "function") {
        const callback = integration.preprocessEvent.bind(integration);
        client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
      }
      if (client.addEventProcessor && typeof integration.processEvent === "function") {
        const callback = integration.processEvent.bind(integration);
        const processor = Object.assign((event, hint) => callback(event, hint, client), {
          id: integration.name
        });
        client.addEventProcessor(processor);
      }
      debugBuild.DEBUG_BUILD && utils.logger.log(`Integration installed: ${integration.name}`);
    }
    function addIntegration(integration) {
      const client = exports$1.getClient();
      if (!client || !client.addIntegration) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(`Cannot add integration "${integration.name}" because no SDK Client is available.`);
        return;
      }
      client.addIntegration(integration);
    }
    function findIndex(arr, callback) {
      for (let i = 0; i < arr.length; i++) {
        if (callback(arr[i]) === true) {
          return i;
        }
      }
      return -1;
    }
    exports.addIntegration = addIntegration;
    exports.getIntegrationsToSetup = getIntegrationsToSetup;
    exports.installedIntegrations = installedIntegrations;
    exports.setupIntegration = setupIntegration;
    exports.setupIntegrations = setupIntegrations;
  }
});

// node_modules/@sentry/core/cjs/baseclient.js
var require_baseclient = __commonJS({
  "node_modules/@sentry/core/cjs/baseclient.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var api = require_api();
    var debugBuild = require_debug_build2();
    var envelope = require_envelope2();
    var hub = require_hub();
    var integration = require_integration();
    var session = require_session();
    var dynamicSamplingContext = require_dynamicSamplingContext();
    var prepareEvent = require_prepareEvent();
    var ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
    var BaseClient = class {
      /** Options passed to the SDK. */
      /** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
      /** Array of set up integrations. */
      /** Indicates whether this client's integrations have been set up. */
      /** Number of calls being processed */
      /** Holds flushable  */
      // eslint-disable-next-line @typescript-eslint/ban-types
      /**
       * Initializes this client instance.
       *
       * @param options Options for the client.
       */
      constructor(options) {
        this._options = options;
        this._integrations = {};
        this._integrationsInitialized = false;
        this._numProcessing = 0;
        this._outcomes = {};
        this._hooks = {};
        this._eventProcessors = [];
        if (options.dsn) {
          this._dsn = utils.makeDsn(options.dsn);
        } else {
          debugBuild.DEBUG_BUILD && utils.logger.warn("No DSN provided, client will not send events.");
        }
        if (this._dsn) {
          const url = api.getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options);
          this._transport = options.transport({
            recordDroppedEvent: this.recordDroppedEvent.bind(this),
            ...options.transportOptions,
            url
          });
        }
      }
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
      captureException(exception, hint, scope) {
        if (utils.checkOrSetAlreadyCaught(exception)) {
          debugBuild.DEBUG_BUILD && utils.logger.log(ALREADY_SEEN_ERROR);
          return;
        }
        let eventId = hint && hint.event_id;
        this._process(
          this.eventFromException(exception, hint).then((event) => this._captureEvent(event, hint, scope)).then((result) => {
            eventId = result;
          })
        );
        return eventId;
      }
      /**
       * @inheritDoc
       */
      captureMessage(message, level, hint, scope) {
        let eventId = hint && hint.event_id;
        const promisedEvent = utils.isPrimitive(message) ? this.eventFromMessage(String(message), level, hint) : this.eventFromException(message, hint);
        this._process(
          promisedEvent.then((event) => this._captureEvent(event, hint, scope)).then((result) => {
            eventId = result;
          })
        );
        return eventId;
      }
      /**
       * @inheritDoc
       */
      captureEvent(event, hint, scope) {
        if (hint && hint.originalException && utils.checkOrSetAlreadyCaught(hint.originalException)) {
          debugBuild.DEBUG_BUILD && utils.logger.log(ALREADY_SEEN_ERROR);
          return;
        }
        let eventId = hint && hint.event_id;
        this._process(
          this._captureEvent(event, hint, scope).then((result) => {
            eventId = result;
          })
        );
        return eventId;
      }
      /**
       * @inheritDoc
       */
      captureSession(session$1) {
        if (!(typeof session$1.release === "string")) {
          debugBuild.DEBUG_BUILD && utils.logger.warn("Discarded session because of missing or non-string release");
        } else {
          this.sendSession(session$1);
          session.updateSession(session$1, { init: false });
        }
      }
      /**
       * @inheritDoc
       */
      getDsn() {
        return this._dsn;
      }
      /**
       * @inheritDoc
       */
      getOptions() {
        return this._options;
      }
      /**
       * @see SdkMetadata in @sentry/types
       *
       * @return The metadata of the SDK
       */
      getSdkMetadata() {
        return this._options._metadata;
      }
      /**
       * @inheritDoc
       */
      getTransport() {
        return this._transport;
      }
      /**
       * @inheritDoc
       */
      flush(timeout) {
        const transport = this._transport;
        if (transport) {
          return this._isClientDoneProcessing(timeout).then((clientFinished) => {
            return transport.flush(timeout).then((transportFlushed) => clientFinished && transportFlushed);
          });
        } else {
          return utils.resolvedSyncPromise(true);
        }
      }
      /**
       * @inheritDoc
       */
      close(timeout) {
        return this.flush(timeout).then((result) => {
          this.getOptions().enabled = false;
          return result;
        });
      }
      /** Get all installed event processors. */
      getEventProcessors() {
        return this._eventProcessors;
      }
      /** @inheritDoc */
      addEventProcessor(eventProcessor) {
        this._eventProcessors.push(eventProcessor);
      }
      /**
       * Sets up the integrations
       */
      setupIntegrations(forceInitialize) {
        if (forceInitialize && !this._integrationsInitialized || this._isEnabled() && !this._integrationsInitialized) {
          this._integrations = integration.setupIntegrations(this, this._options.integrations);
          this._integrationsInitialized = true;
        }
      }
      /**
       * Gets an installed integration by its `id`.
       *
       * @returns The installed integration or `undefined` if no integration with that `id` was installed.
       */
      getIntegrationById(integrationId) {
        return this._integrations[integrationId];
      }
      /**
       * @inheritDoc
       */
      getIntegration(integration2) {
        try {
          return this._integrations[integration2.id] || null;
        } catch (_oO) {
          debugBuild.DEBUG_BUILD && utils.logger.warn(`Cannot retrieve integration ${integration2.id} from the current Client`);
          return null;
        }
      }
      /**
       * @inheritDoc
       */
      addIntegration(integration$1) {
        integration.setupIntegration(this, integration$1, this._integrations);
      }
      /**
       * @inheritDoc
       */
      sendEvent(event, hint = {}) {
        this.emit("beforeSendEvent", event, hint);
        let env3 = envelope.createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
        for (const attachment of hint.attachments || []) {
          env3 = utils.addItemToEnvelope(
            env3,
            utils.createAttachmentEnvelopeItem(
              attachment,
              this._options.transportOptions && this._options.transportOptions.textEncoder
            )
          );
        }
        const promise = this._sendEnvelope(env3);
        if (promise) {
          promise.then((sendResponse) => this.emit("afterSendEvent", event, sendResponse), null);
        }
      }
      /**
       * @inheritDoc
       */
      sendSession(session2) {
        const env3 = envelope.createSessionEnvelope(session2, this._dsn, this._options._metadata, this._options.tunnel);
        void this._sendEnvelope(env3);
      }
      /**
       * @inheritDoc
       */
      recordDroppedEvent(reason, category, _event) {
        if (this._options.sendClientReports) {
          const key = `${reason}:${category}`;
          debugBuild.DEBUG_BUILD && utils.logger.log(`Adding outcome: "${key}"`);
          this._outcomes[key] = this._outcomes[key] + 1 || 1;
        }
      }
      // Keep on() & emit() signatures in sync with types' client.ts interface
      /* eslint-disable @typescript-eslint/unified-signatures */
      /** @inheritdoc */
      /** @inheritdoc */
      on(hook, callback) {
        if (!this._hooks[hook]) {
          this._hooks[hook] = [];
        }
        this._hooks[hook].push(callback);
      }
      /** @inheritdoc */
      /** @inheritdoc */
      emit(hook, ...rest) {
        if (this._hooks[hook]) {
          this._hooks[hook].forEach((callback) => callback(...rest));
        }
      }
      /* eslint-enable @typescript-eslint/unified-signatures */
      /** Updates existing session based on the provided event */
      _updateSessionFromEvent(session$1, event) {
        let crashed = false;
        let errored = false;
        const exceptions = event.exception && event.exception.values;
        if (exceptions) {
          errored = true;
          for (const ex of exceptions) {
            const mechanism = ex.mechanism;
            if (mechanism && mechanism.handled === false) {
              crashed = true;
              break;
            }
          }
        }
        const sessionNonTerminal = session$1.status === "ok";
        const shouldUpdateAndSend = sessionNonTerminal && session$1.errors === 0 || sessionNonTerminal && crashed;
        if (shouldUpdateAndSend) {
          session.updateSession(session$1, {
            ...crashed && { status: "crashed" },
            errors: session$1.errors || Number(errored || crashed)
          });
          this.captureSession(session$1);
        }
      }
      /**
       * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
       * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
       *
       * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
       * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
       * `true`.
       * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
       * `false` otherwise
       */
      _isClientDoneProcessing(timeout) {
        return new utils.SyncPromise((resolve2) => {
          let ticked = 0;
          const tick = 1;
          const interval = setInterval(() => {
            if (this._numProcessing == 0) {
              clearInterval(interval);
              resolve2(true);
            } else {
              ticked += tick;
              if (timeout && ticked >= timeout) {
                clearInterval(interval);
                resolve2(false);
              }
            }
          }, tick);
        });
      }
      /** Determines whether this SDK is enabled and a transport is present. */
      _isEnabled() {
        return this.getOptions().enabled !== false && this._transport !== void 0;
      }
      /**
       * Adds common information to events.
       *
       * The information includes release and environment from `options`,
       * breadcrumbs and context (extra, tags and user) from the scope.
       *
       * Information that is already present in the event is never overwritten. For
       * nested objects, such as the context, keys are merged.
       *
       * @param event The original event.
       * @param hint May contain additional information about the original exception.
       * @param scope A scope containing event metadata.
       * @returns A new event with more information.
       */
      _prepareEvent(event, hint, scope) {
        const options = this.getOptions();
        const integrations = Object.keys(this._integrations);
        if (!hint.integrations && integrations.length > 0) {
          hint.integrations = integrations;
        }
        this.emit("preprocessEvent", event, hint);
        return prepareEvent.prepareEvent(options, event, hint, scope, this).then((evt) => {
          if (evt === null) {
            return evt;
          }
          const { propagationContext } = evt.sdkProcessingMetadata || {};
          const trace = evt.contexts && evt.contexts.trace;
          if (!trace && propagationContext) {
            const { traceId: trace_id, spanId, parentSpanId, dsc } = propagationContext;
            evt.contexts = {
              trace: {
                trace_id,
                span_id: spanId,
                parent_span_id: parentSpanId
              },
              ...evt.contexts
            };
            const dynamicSamplingContext$1 = dsc ? dsc : dynamicSamplingContext.getDynamicSamplingContextFromClient(trace_id, this, scope);
            evt.sdkProcessingMetadata = {
              dynamicSamplingContext: dynamicSamplingContext$1,
              ...evt.sdkProcessingMetadata
            };
          }
          return evt;
        });
      }
      /**
       * Processes the event and logs an error in case of rejection
       * @param event
       * @param hint
       * @param scope
       */
      _captureEvent(event, hint = {}, scope) {
        return this._processEvent(event, hint, scope).then(
          (finalEvent) => {
            return finalEvent.event_id;
          },
          (reason) => {
            if (debugBuild.DEBUG_BUILD) {
              const sentryError = reason;
              if (sentryError.logLevel === "log") {
                utils.logger.log(sentryError.message);
              } else {
                utils.logger.warn(sentryError);
              }
            }
            return void 0;
          }
        );
      }
      /**
       * Processes an event (either error or message) and sends it to Sentry.
       *
       * This also adds breadcrumbs and context information to the event. However,
       * platform specific meta data (such as the User's IP address) must be added
       * by the SDK implementor.
       *
       *
       * @param event The event to send to Sentry.
       * @param hint May contain additional information about the original exception.
       * @param scope A scope containing event metadata.
       * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
       */
      _processEvent(event, hint, scope) {
        const options = this.getOptions();
        const { sampleRate } = options;
        const isTransaction = isTransactionEvent(event);
        const isError = isErrorEvent(event);
        const eventType = event.type || "error";
        const beforeSendLabel = `before send for type \`${eventType}\``;
        if (isError && typeof sampleRate === "number" && Math.random() > sampleRate) {
          this.recordDroppedEvent("sample_rate", "error", event);
          return utils.rejectedSyncPromise(
            new utils.SentryError(
              `Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`,
              "log"
            )
          );
        }
        const dataCategory = eventType === "replay_event" ? "replay" : eventType;
        return this._prepareEvent(event, hint, scope).then((prepared) => {
          if (prepared === null) {
            this.recordDroppedEvent("event_processor", dataCategory, event);
            throw new utils.SentryError("An event processor returned `null`, will not send event.", "log");
          }
          const isInternalException = hint.data && hint.data.__sentry__ === true;
          if (isInternalException) {
            return prepared;
          }
          const result = processBeforeSend(options, prepared, hint);
          return _validateBeforeSendResult(result, beforeSendLabel);
        }).then((processedEvent) => {
          if (processedEvent === null) {
            this.recordDroppedEvent("before_send", dataCategory, event);
            throw new utils.SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, "log");
          }
          const session2 = scope && scope.getSession();
          if (!isTransaction && session2) {
            this._updateSessionFromEvent(session2, processedEvent);
          }
          const transactionInfo = processedEvent.transaction_info;
          if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
            const source = "custom";
            processedEvent.transaction_info = {
              ...transactionInfo,
              source
            };
          }
          this.sendEvent(processedEvent, hint);
          return processedEvent;
        }).then(null, (reason) => {
          if (reason instanceof utils.SentryError) {
            throw reason;
          }
          this.captureException(reason, {
            data: {
              __sentry__: true
            },
            originalException: reason
          });
          throw new utils.SentryError(
            `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${reason}`
          );
        });
      }
      /**
       * Occupies the client with processing and event
       */
      _process(promise) {
        this._numProcessing++;
        void promise.then(
          (value) => {
            this._numProcessing--;
            return value;
          },
          (reason) => {
            this._numProcessing--;
            return reason;
          }
        );
      }
      /**
       * @inheritdoc
       */
      _sendEnvelope(envelope2) {
        this.emit("beforeEnvelope", envelope2);
        if (this._isEnabled() && this._transport) {
          return this._transport.send(envelope2).then(null, (reason) => {
            debugBuild.DEBUG_BUILD && utils.logger.error("Error while sending event:", reason);
          });
        } else {
          debugBuild.DEBUG_BUILD && utils.logger.error("Transport disabled");
        }
      }
      /**
       * Clears outcomes on this client and returns them.
       */
      _clearOutcomes() {
        const outcomes = this._outcomes;
        this._outcomes = {};
        return Object.keys(outcomes).map((key) => {
          const [reason, category] = key.split(":");
          return {
            reason,
            category,
            quantity: outcomes[key]
          };
        });
      }
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    };
    function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
      const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
      if (utils.isThenable(beforeSendResult)) {
        return beforeSendResult.then(
          (event) => {
            if (!utils.isPlainObject(event) && event !== null) {
              throw new utils.SentryError(invalidValueError);
            }
            return event;
          },
          (e) => {
            throw new utils.SentryError(`${beforeSendLabel} rejected with ${e}`);
          }
        );
      } else if (!utils.isPlainObject(beforeSendResult) && beforeSendResult !== null) {
        throw new utils.SentryError(invalidValueError);
      }
      return beforeSendResult;
    }
    function processBeforeSend(options, event, hint) {
      const { beforeSend, beforeSendTransaction } = options;
      if (isErrorEvent(event) && beforeSend) {
        return beforeSend(event, hint);
      }
      if (isTransactionEvent(event) && beforeSendTransaction) {
        return beforeSendTransaction(event, hint);
      }
      return event;
    }
    function isErrorEvent(event) {
      return event.type === void 0;
    }
    function isTransactionEvent(event) {
      return event.type === "transaction";
    }
    function addEventProcessor(callback) {
      const client = hub.getCurrentHub().getClient();
      if (!client || !client.addEventProcessor) {
        return;
      }
      client.addEventProcessor(callback);
    }
    exports.BaseClient = BaseClient;
    exports.addEventProcessor = addEventProcessor;
  }
});

// node_modules/@sentry/core/cjs/checkin.js
var require_checkin = __commonJS({
  "node_modules/@sentry/core/cjs/checkin.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    function createCheckInEnvelope(checkIn, dynamicSamplingContext, metadata, tunnel, dsn) {
      const headers = {
        sent_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (metadata && metadata.sdk) {
        headers.sdk = {
          name: metadata.sdk.name,
          version: metadata.sdk.version
        };
      }
      if (!!tunnel && !!dsn) {
        headers.dsn = utils.dsnToString(dsn);
      }
      if (dynamicSamplingContext) {
        headers.trace = utils.dropUndefinedKeys(dynamicSamplingContext);
      }
      const item = createCheckInEnvelopeItem(checkIn);
      return utils.createEnvelope(headers, [item]);
    }
    function createCheckInEnvelopeItem(checkIn) {
      const checkInHeaders = {
        type: "check_in"
      };
      return [checkInHeaders, checkIn];
    }
    exports.createCheckInEnvelope = createCheckInEnvelope;
  }
});

// node_modules/@sentry/core/cjs/server-runtime-client.js
var require_server_runtime_client = __commonJS({
  "node_modules/@sentry/core/cjs/server-runtime-client.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var baseclient = require_baseclient();
    var checkin = require_checkin();
    var debugBuild = require_debug_build2();
    var hub = require_hub();
    var sessionflusher = require_sessionflusher();
    var hubextensions = require_hubextensions();
    var dynamicSamplingContext = require_dynamicSamplingContext();
    require_spanstatus();
    var ServerRuntimeClient = class extends baseclient.BaseClient {
      /**
       * Creates a new Edge SDK instance.
       * @param options Configuration options for this SDK.
       */
      constructor(options) {
        hubextensions.addTracingExtensions();
        super(options);
      }
      /**
       * @inheritDoc
       */
      eventFromException(exception, hint) {
        return utils.resolvedSyncPromise(utils.eventFromUnknownInput(hub.getCurrentHub, this._options.stackParser, exception, hint));
      }
      /**
       * @inheritDoc
       */
      eventFromMessage(message, level = "info", hint) {
        return utils.resolvedSyncPromise(
          utils.eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace)
        );
      }
      /**
       * @inheritDoc
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
      captureException(exception, hint, scope) {
        if (this._options.autoSessionTracking && this._sessionFlusher && scope) {
          const requestSession = scope.getRequestSession();
          if (requestSession && requestSession.status === "ok") {
            requestSession.status = "errored";
          }
        }
        return super.captureException(exception, hint, scope);
      }
      /**
       * @inheritDoc
       */
      captureEvent(event, hint, scope) {
        if (this._options.autoSessionTracking && this._sessionFlusher && scope) {
          const eventType = event.type || "exception";
          const isException = eventType === "exception" && event.exception && event.exception.values && event.exception.values.length > 0;
          if (isException) {
            const requestSession = scope.getRequestSession();
            if (requestSession && requestSession.status === "ok") {
              requestSession.status = "errored";
            }
          }
        }
        return super.captureEvent(event, hint, scope);
      }
      /**
       *
       * @inheritdoc
       */
      close(timeout) {
        if (this._sessionFlusher) {
          this._sessionFlusher.close();
        }
        return super.close(timeout);
      }
      /** Method that initialises an instance of SessionFlusher on Client */
      initSessionFlusher() {
        const { release: release2, environment } = this._options;
        if (!release2) {
          debugBuild.DEBUG_BUILD && utils.logger.warn("Cannot initialise an instance of SessionFlusher if no release is provided!");
        } else {
          this._sessionFlusher = new sessionflusher.SessionFlusher(this, {
            release: release2,
            environment
          });
        }
      }
      /**
       * Create a cron monitor check in and send it to Sentry.
       *
       * @param checkIn An object that describes a check in.
       * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
       * to create a monitor automatically when sending a check in.
       */
      captureCheckIn(checkIn, monitorConfig, scope) {
        const id = "checkInId" in checkIn && checkIn.checkInId ? checkIn.checkInId : utils.uuid4();
        if (!this._isEnabled()) {
          debugBuild.DEBUG_BUILD && utils.logger.warn("SDK not enabled, will not capture checkin.");
          return id;
        }
        const options = this.getOptions();
        const { release: release2, environment, tunnel } = options;
        const serializedCheckIn = {
          check_in_id: id,
          monitor_slug: checkIn.monitorSlug,
          status: checkIn.status,
          release: release2,
          environment
        };
        if ("duration" in checkIn) {
          serializedCheckIn.duration = checkIn.duration;
        }
        if (monitorConfig) {
          serializedCheckIn.monitor_config = {
            schedule: monitorConfig.schedule,
            checkin_margin: monitorConfig.checkinMargin,
            max_runtime: monitorConfig.maxRuntime,
            timezone: monitorConfig.timezone
          };
        }
        const [dynamicSamplingContext2, traceContext] = this._getTraceInfoFromScope(scope);
        if (traceContext) {
          serializedCheckIn.contexts = {
            trace: traceContext
          };
        }
        const envelope = checkin.createCheckInEnvelope(
          serializedCheckIn,
          dynamicSamplingContext2,
          this.getSdkMetadata(),
          tunnel,
          this.getDsn()
        );
        debugBuild.DEBUG_BUILD && utils.logger.info("Sending checkin:", checkIn.monitorSlug, checkIn.status);
        void this._sendEnvelope(envelope);
        return id;
      }
      /**
       * Method responsible for capturing/ending a request session by calling `incrementSessionStatusCount` to increment
       * appropriate session aggregates bucket
       */
      _captureRequestSession() {
        if (!this._sessionFlusher) {
          debugBuild.DEBUG_BUILD && utils.logger.warn("Discarded request mode session because autoSessionTracking option was disabled");
        } else {
          this._sessionFlusher.incrementSessionStatusCount();
        }
      }
      /**
       * @inheritDoc
       */
      _prepareEvent(event, hint, scope) {
        if (this._options.platform) {
          event.platform = event.platform || this._options.platform;
        }
        if (this._options.runtime) {
          event.contexts = {
            ...event.contexts,
            runtime: (event.contexts || {}).runtime || this._options.runtime
          };
        }
        if (this._options.serverName) {
          event.server_name = event.server_name || this._options.serverName;
        }
        return super._prepareEvent(event, hint, scope);
      }
      /** Extract trace information from scope */
      _getTraceInfoFromScope(scope) {
        if (!scope) {
          return [void 0, void 0];
        }
        const span = scope.getSpan();
        if (span) {
          const samplingContext = span.transaction ? span.transaction.getDynamicSamplingContext() : void 0;
          return [samplingContext, span.getTraceContext()];
        }
        const { traceId, spanId, parentSpanId, dsc } = scope.getPropagationContext();
        const traceContext = {
          trace_id: traceId,
          span_id: spanId,
          parent_span_id: parentSpanId
        };
        if (dsc) {
          return [dsc, traceContext];
        }
        return [dynamicSamplingContext.getDynamicSamplingContextFromClient(traceId, this, scope), traceContext];
      }
    };
    exports.ServerRuntimeClient = ServerRuntimeClient;
  }
});

// node_modules/@sentry/core/cjs/sdk.js
var require_sdk = __commonJS({
  "node_modules/@sentry/core/cjs/sdk.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var hub = require_hub();
    function initAndBind(clientClass, options) {
      if (options.debug === true) {
        if (debugBuild.DEBUG_BUILD) {
          utils.logger.enable();
        } else {
          utils.consoleSandbox(() => {
            console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
          });
        }
      }
      const hub$1 = hub.getCurrentHub();
      const scope = hub$1.getScope();
      scope.update(options.initialScope);
      const client = new clientClass(options);
      hub$1.bindClient(client);
    }
    exports.initAndBind = initAndBind;
  }
});

// node_modules/@sentry/core/cjs/transports/base.js
var require_base = __commonJS({
  "node_modules/@sentry/core/cjs/transports/base.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var DEFAULT_TRANSPORT_BUFFER_SIZE = 30;
    function createTransport(options, makeRequest, buffer = utils.makePromiseBuffer(
      options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE
    )) {
      let rateLimits = {};
      const flush = (timeout) => buffer.drain(timeout);
      function send(envelope) {
        const filteredEnvelopeItems = [];
        utils.forEachEnvelopeItem(envelope, (item, type2) => {
          const envelopeItemDataCategory = utils.envelopeItemTypeToDataCategory(type2);
          if (utils.isRateLimited(rateLimits, envelopeItemDataCategory)) {
            const event = getEventForEnvelopeItem(item, type2);
            options.recordDroppedEvent("ratelimit_backoff", envelopeItemDataCategory, event);
          } else {
            filteredEnvelopeItems.push(item);
          }
        });
        if (filteredEnvelopeItems.length === 0) {
          return utils.resolvedSyncPromise();
        }
        const filteredEnvelope = utils.createEnvelope(envelope[0], filteredEnvelopeItems);
        const recordEnvelopeLoss = (reason) => {
          utils.forEachEnvelopeItem(filteredEnvelope, (item, type2) => {
            const event = getEventForEnvelopeItem(item, type2);
            options.recordDroppedEvent(reason, utils.envelopeItemTypeToDataCategory(type2), event);
          });
        };
        const requestTask = () => makeRequest({ body: utils.serializeEnvelope(filteredEnvelope, options.textEncoder) }).then(
          (response) => {
            if (response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) {
              debugBuild.DEBUG_BUILD && utils.logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
            }
            rateLimits = utils.updateRateLimits(rateLimits, response);
            return response;
          },
          (error) => {
            recordEnvelopeLoss("network_error");
            throw error;
          }
        );
        return buffer.add(requestTask).then(
          (result) => result,
          (error) => {
            if (error instanceof utils.SentryError) {
              debugBuild.DEBUG_BUILD && utils.logger.error("Skipped sending event because buffer is full.");
              recordEnvelopeLoss("queue_overflow");
              return utils.resolvedSyncPromise();
            } else {
              throw error;
            }
          }
        );
      }
      send.__sentry__baseTransport__ = true;
      return {
        send,
        flush
      };
    }
    function getEventForEnvelopeItem(item, type2) {
      if (type2 !== "event" && type2 !== "transaction") {
        return void 0;
      }
      return Array.isArray(item) ? item[1] : void 0;
    }
    exports.DEFAULT_TRANSPORT_BUFFER_SIZE = DEFAULT_TRANSPORT_BUFFER_SIZE;
    exports.createTransport = createTransport;
  }
});

// node_modules/@sentry/core/cjs/transports/offline.js
var require_offline = __commonJS({
  "node_modules/@sentry/core/cjs/transports/offline.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var MIN_DELAY = 100;
    var START_DELAY = 5e3;
    var MAX_DELAY = 36e5;
    function log(msg, error) {
      debugBuild.DEBUG_BUILD && utils.logger.info(`[Offline]: ${msg}`, error);
    }
    function makeOfflineTransport(createTransport) {
      return (options) => {
        const transport = createTransport(options);
        const store = options.createStore ? options.createStore(options) : void 0;
        let retryDelay = START_DELAY;
        let flushTimer;
        function shouldQueue(env3, error, retryDelay2) {
          if (utils.envelopeContainsItemType(env3, ["replay_event", "replay_recording", "client_report"])) {
            return false;
          }
          if (options.shouldStore) {
            return options.shouldStore(env3, error, retryDelay2);
          }
          return true;
        }
        function flushIn(delay) {
          if (!store) {
            return;
          }
          if (flushTimer) {
            clearTimeout(flushTimer);
          }
          flushTimer = setTimeout(async () => {
            flushTimer = void 0;
            const found = await store.pop();
            if (found) {
              log("Attempting to send previously queued event");
              void send(found).catch((e) => {
                log("Failed to retry sending", e);
              });
            }
          }, delay);
          if (typeof flushTimer !== "number" && flushTimer.unref) {
            flushTimer.unref();
          }
        }
        function flushWithBackOff() {
          if (flushTimer) {
            return;
          }
          flushIn(retryDelay);
          retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
        }
        async function send(envelope) {
          try {
            const result = await transport.send(envelope);
            let delay = MIN_DELAY;
            if (result) {
              if (result.headers && result.headers["retry-after"]) {
                delay = utils.parseRetryAfterHeader(result.headers["retry-after"]);
              } else if ((result.statusCode || 0) >= 400) {
                return result;
              }
            }
            flushIn(delay);
            retryDelay = START_DELAY;
            return result;
          } catch (e) {
            if (store && await shouldQueue(envelope, e, retryDelay)) {
              await store.insert(envelope);
              flushWithBackOff();
              log("Error sending. Event queued", e);
              return {};
            } else {
              throw e;
            }
          }
        }
        if (options.flushAtStartup) {
          flushWithBackOff();
        }
        return {
          send,
          flush: (t) => transport.flush(t)
        };
      };
    }
    exports.MIN_DELAY = MIN_DELAY;
    exports.START_DELAY = START_DELAY;
    exports.makeOfflineTransport = makeOfflineTransport;
  }
});

// node_modules/@sentry/core/cjs/transports/multiplexed.js
var require_multiplexed = __commonJS({
  "node_modules/@sentry/core/cjs/transports/multiplexed.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var api = require_api();
    function eventFromEnvelope(env3, types) {
      let event;
      utils.forEachEnvelopeItem(env3, (item, type2) => {
        if (types.includes(type2)) {
          event = Array.isArray(item) ? item[1] : void 0;
        }
        return !!event;
      });
      return event;
    }
    function makeOverrideReleaseTransport(createTransport, release2) {
      return (options) => {
        const transport = createTransport(options);
        return {
          send: async (envelope) => {
            const event = eventFromEnvelope(envelope, ["event", "transaction", "profile", "replay_event"]);
            if (event) {
              event.release = release2;
            }
            return transport.send(envelope);
          },
          flush: (timeout) => transport.flush(timeout)
        };
      };
    }
    function makeMultiplexedTransport(createTransport, matcher) {
      return (options) => {
        const fallbackTransport = createTransport(options);
        const otherTransports = {};
        function getTransport(dsn, release2) {
          const key = release2 ? `${dsn}:${release2}` : dsn;
          if (!otherTransports[key]) {
            const validatedDsn = utils.dsnFromString(dsn);
            if (!validatedDsn) {
              return void 0;
            }
            const url = api.getEnvelopeEndpointWithUrlEncodedAuth(validatedDsn);
            otherTransports[key] = release2 ? makeOverrideReleaseTransport(createTransport, release2)({ ...options, url }) : createTransport({ ...options, url });
          }
          return otherTransports[key];
        }
        async function send(envelope) {
          function getEvent(types) {
            const eventTypes = types && types.length ? types : ["event"];
            return eventFromEnvelope(envelope, eventTypes);
          }
          const transports = matcher({ envelope, getEvent }).map((result) => {
            if (typeof result === "string") {
              return getTransport(result, void 0);
            } else {
              return getTransport(result.dsn, result.release);
            }
          }).filter((t) => !!t);
          if (transports.length === 0) {
            transports.push(fallbackTransport);
          }
          const results = await Promise.all(transports.map((transport) => transport.send(envelope)));
          return results[0];
        }
        async function flush(timeout) {
          const allTransports = [...Object.keys(otherTransports).map((dsn) => otherTransports[dsn]), fallbackTransport];
          const results = await Promise.all(allTransports.map((transport) => transport.flush(timeout)));
          return results.every((r) => r);
        }
        return {
          send,
          flush
        };
      };
    }
    exports.eventFromEnvelope = eventFromEnvelope;
    exports.makeMultiplexedTransport = makeMultiplexedTransport;
  }
});

// node_modules/@sentry/core/cjs/integrations/functiontostring.js
var require_functiontostring = __commonJS({
  "node_modules/@sentry/core/cjs/integrations/functiontostring.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var originalFunctionToString;
    var FunctionToString = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "FunctionToString";
      }
      /**
       * @inheritDoc
       */
      constructor() {
        this.name = FunctionToString.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
        originalFunctionToString = Function.prototype.toString;
        try {
          Function.prototype.toString = function(...args) {
            const context = utils.getOriginalFunction(this) || this;
            return originalFunctionToString.apply(context, args);
          };
        } catch (e) {
        }
      }
    };
    FunctionToString.__initStatic();
    exports.FunctionToString = FunctionToString;
  }
});

// node_modules/@sentry/core/cjs/integrations/inboundfilters.js
var require_inboundfilters = __commonJS({
  "node_modules/@sentry/core/cjs/integrations/inboundfilters.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build2();
    var DEFAULT_IGNORE_ERRORS = [/^Script error\.?$/, /^Javascript error: Script error\.? on line 0$/];
    var DEFAULT_IGNORE_TRANSACTIONS = [
      /^.*\/healthcheck$/,
      /^.*\/healthy$/,
      /^.*\/live$/,
      /^.*\/ready$/,
      /^.*\/heartbeat$/,
      /^.*\/health$/,
      /^.*\/healthz$/
    ];
    var InboundFilters = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "InboundFilters";
      }
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this.name = InboundFilters.id;
        this._options = options;
      }
      /**
       * @inheritDoc
       */
      setupOnce(_addGlobalEventProcessor, _getCurrentHub) {
      }
      /** @inheritDoc */
      processEvent(event, _eventHint, client) {
        const clientOptions = client.getOptions();
        const options = _mergeOptions(this._options, clientOptions);
        return _shouldDropEvent(event, options) ? null : event;
      }
    };
    InboundFilters.__initStatic();
    function _mergeOptions(internalOptions = {}, clientOptions = {}) {
      return {
        allowUrls: [...internalOptions.allowUrls || [], ...clientOptions.allowUrls || []],
        denyUrls: [...internalOptions.denyUrls || [], ...clientOptions.denyUrls || []],
        ignoreErrors: [
          ...internalOptions.ignoreErrors || [],
          ...clientOptions.ignoreErrors || [],
          ...internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS
        ],
        ignoreTransactions: [
          ...internalOptions.ignoreTransactions || [],
          ...clientOptions.ignoreTransactions || [],
          ...internalOptions.disableTransactionDefaults ? [] : DEFAULT_IGNORE_TRANSACTIONS
        ],
        ignoreInternal: internalOptions.ignoreInternal !== void 0 ? internalOptions.ignoreInternal : true
      };
    }
    function _shouldDropEvent(event, options) {
      if (options.ignoreInternal && _isSentryError(event)) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(`Event dropped due to being internal Sentry Error.
Event: ${utils.getEventDescription(event)}`);
        return true;
      }
      if (_isIgnoredError(event, options.ignoreErrors)) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(
          `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${utils.getEventDescription(event)}`
        );
        return true;
      }
      if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(
          `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${utils.getEventDescription(event)}`
        );
        return true;
      }
      if (_isDeniedUrl(event, options.denyUrls)) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(
          `Event dropped due to being matched by \`denyUrls\` option.
Event: ${utils.getEventDescription(
            event
          )}.
Url: ${_getEventFilterUrl(event)}`
        );
        return true;
      }
      if (!_isAllowedUrl(event, options.allowUrls)) {
        debugBuild.DEBUG_BUILD && utils.logger.warn(
          `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${utils.getEventDescription(
            event
          )}.
Url: ${_getEventFilterUrl(event)}`
        );
        return true;
      }
      return false;
    }
    function _isIgnoredError(event, ignoreErrors) {
      if (event.type || !ignoreErrors || !ignoreErrors.length) {
        return false;
      }
      return _getPossibleEventMessages(event).some((message) => utils.stringMatchesSomePattern(message, ignoreErrors));
    }
    function _isIgnoredTransaction(event, ignoreTransactions) {
      if (event.type !== "transaction" || !ignoreTransactions || !ignoreTransactions.length) {
        return false;
      }
      const name = event.transaction;
      return name ? utils.stringMatchesSomePattern(name, ignoreTransactions) : false;
    }
    function _isDeniedUrl(event, denyUrls) {
      if (!denyUrls || !denyUrls.length) {
        return false;
      }
      const url = _getEventFilterUrl(event);
      return !url ? false : utils.stringMatchesSomePattern(url, denyUrls);
    }
    function _isAllowedUrl(event, allowUrls) {
      if (!allowUrls || !allowUrls.length) {
        return true;
      }
      const url = _getEventFilterUrl(event);
      return !url ? true : utils.stringMatchesSomePattern(url, allowUrls);
    }
    function _getPossibleEventMessages(event) {
      const possibleMessages = [];
      if (event.message) {
        possibleMessages.push(event.message);
      }
      let lastException;
      try {
        lastException = event.exception.values[event.exception.values.length - 1];
      } catch (e) {
      }
      if (lastException) {
        if (lastException.value) {
          possibleMessages.push(lastException.value);
          if (lastException.type) {
            possibleMessages.push(`${lastException.type}: ${lastException.value}`);
          }
        }
      }
      if (debugBuild.DEBUG_BUILD && possibleMessages.length === 0) {
        utils.logger.error(`Could not extract message for event ${utils.getEventDescription(event)}`);
      }
      return possibleMessages;
    }
    function _isSentryError(event) {
      try {
        return event.exception.values[0].type === "SentryError";
      } catch (e) {
      }
      return false;
    }
    function _getLastValidUrl(frames = []) {
      for (let i = frames.length - 1; i >= 0; i--) {
        const frame = frames[i];
        if (frame && frame.filename !== "<anonymous>" && frame.filename !== "[native code]") {
          return frame.filename || null;
        }
      }
      return null;
    }
    function _getEventFilterUrl(event) {
      try {
        let frames;
        try {
          frames = event.exception.values[0].stacktrace.frames;
        } catch (e) {
        }
        return frames ? _getLastValidUrl(frames) : null;
      } catch (oO) {
        debugBuild.DEBUG_BUILD && utils.logger.error(`Cannot extract url for event ${utils.getEventDescription(event)}`);
        return null;
      }
    }
    exports.InboundFilters = InboundFilters;
    exports._mergeOptions = _mergeOptions;
    exports._shouldDropEvent = _shouldDropEvent;
  }
});

// node_modules/@sentry/core/cjs/integrations/linkederrors.js
var require_linkederrors = __commonJS({
  "node_modules/@sentry/core/cjs/integrations/linkederrors.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var DEFAULT_KEY = "cause";
    var DEFAULT_LIMIT = 5;
    var LinkedErrors = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "LinkedErrors";
      }
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this._key = options.key || DEFAULT_KEY;
        this._limit = options.limit || DEFAULT_LIMIT;
        this.name = LinkedErrors.id;
      }
      /** @inheritdoc */
      setupOnce() {
      }
      /**
       * @inheritDoc
       */
      preprocessEvent(event, hint, client) {
        const options = client.getOptions();
        utils.applyAggregateErrorsToEvent(
          utils.exceptionFromError,
          options.stackParser,
          options.maxValueLength,
          this._key,
          this._limit,
          event,
          hint
        );
      }
    };
    LinkedErrors.__initStatic();
    exports.LinkedErrors = LinkedErrors;
  }
});

// node_modules/@sentry/core/cjs/integrations/index.js
var require_integrations = __commonJS({
  "node_modules/@sentry/core/cjs/integrations/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var functiontostring = require_functiontostring();
    var inboundfilters = require_inboundfilters();
    var linkederrors = require_linkederrors();
    exports.FunctionToString = functiontostring.FunctionToString;
    exports.InboundFilters = inboundfilters.InboundFilters;
    exports.LinkedErrors = linkederrors.LinkedErrors;
  }
});

// node_modules/@sentry/core/cjs/utils/isSentryRequestUrl.js
var require_isSentryRequestUrl = __commonJS({
  "node_modules/@sentry/core/cjs/utils/isSentryRequestUrl.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isSentryRequestUrl(url, hub) {
      const client = hub.getClient();
      const dsn = client && client.getDsn();
      const tunnel = client && client.getOptions().tunnel;
      return checkDsn(url, dsn) || checkTunnel(url, tunnel);
    }
    function checkTunnel(url, tunnel) {
      if (!tunnel) {
        return false;
      }
      return removeTrailingSlash(url) === removeTrailingSlash(tunnel);
    }
    function checkDsn(url, dsn) {
      return dsn ? url.includes(dsn.host) : false;
    }
    function removeTrailingSlash(str) {
      return str[str.length - 1] === "/" ? str.slice(0, -1) : str;
    }
    exports.isSentryRequestUrl = isSentryRequestUrl;
  }
});

// node_modules/@sentry/core/cjs/metadata.js
var require_metadata = __commonJS({
  "node_modules/@sentry/core/cjs/metadata.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var filenameMetadataMap = /* @__PURE__ */ new Map();
    var parsedStacks = /* @__PURE__ */ new Set();
    function ensureMetadataStacksAreParsed(parser) {
      if (!utils.GLOBAL_OBJ._sentryModuleMetadata) {
        return;
      }
      for (const stack of Object.keys(utils.GLOBAL_OBJ._sentryModuleMetadata)) {
        const metadata = utils.GLOBAL_OBJ._sentryModuleMetadata[stack];
        if (parsedStacks.has(stack)) {
          continue;
        }
        parsedStacks.add(stack);
        const frames = parser(stack);
        for (const frame of frames.reverse()) {
          if (frame.filename) {
            filenameMetadataMap.set(frame.filename, metadata);
            break;
          }
        }
      }
    }
    function getMetadataForUrl(parser, filename) {
      ensureMetadataStacksAreParsed(parser);
      return filenameMetadataMap.get(filename);
    }
    function addMetadataToStackFrames(parser, event) {
      try {
        event.exception.values.forEach((exception) => {
          if (!exception.stacktrace) {
            return;
          }
          for (const frame of exception.stacktrace.frames || []) {
            if (!frame.filename) {
              continue;
            }
            const metadata = getMetadataForUrl(parser, frame.filename);
            if (metadata) {
              frame.module_metadata = metadata;
            }
          }
        });
      } catch (_) {
      }
    }
    function stripMetadataFromStackFrames(event) {
      try {
        event.exception.values.forEach((exception) => {
          if (!exception.stacktrace) {
            return;
          }
          for (const frame of exception.stacktrace.frames || []) {
            delete frame.module_metadata;
          }
        });
      } catch (_) {
      }
    }
    exports.addMetadataToStackFrames = addMetadataToStackFrames;
    exports.getMetadataForUrl = getMetadataForUrl;
    exports.stripMetadataFromStackFrames = stripMetadataFromStackFrames;
  }
});

// node_modules/@sentry/core/cjs/integrations/metadata.js
var require_metadata2 = __commonJS({
  "node_modules/@sentry/core/cjs/integrations/metadata.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var metadata = require_metadata();
    var ModuleMetadata = class {
      /*
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "ModuleMetadata";
      }
      /**
       * @inheritDoc
       */
      constructor() {
        this.name = ModuleMetadata.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce(addGlobalEventProcessor, getCurrentHub2) {
        const client = getCurrentHub2().getClient();
        if (!client || typeof client.on !== "function") {
          return;
        }
        client.on("beforeEnvelope", (envelope) => {
          utils.forEachEnvelopeItem(envelope, (item, type2) => {
            if (type2 === "event") {
              const event = Array.isArray(item) ? item[1] : void 0;
              if (event) {
                metadata.stripMetadataFromStackFrames(event);
                item[1] = event;
              }
            }
          });
        });
        const stackParser = client.getOptions().stackParser;
        addGlobalEventProcessor((event) => {
          metadata.addMetadataToStackFrames(stackParser, event);
          return event;
        });
      }
    };
    ModuleMetadata.__initStatic();
    exports.ModuleMetadata = ModuleMetadata;
  }
});

// node_modules/@sentry/core/cjs/integrations/requestdata.js
var require_requestdata2 = __commonJS({
  "node_modules/@sentry/core/cjs/integrations/requestdata.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var DEFAULT_OPTIONS = {
      include: {
        cookies: true,
        data: true,
        headers: true,
        ip: false,
        query_string: true,
        url: true,
        user: {
          id: true,
          username: true,
          email: true
        }
      },
      transactionNamingScheme: "methodPath"
    };
    var RequestData = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "RequestData";
      }
      /**
       * @inheritDoc
       */
      /**
       * Function for adding request data to event. Defaults to `addRequestDataToEvent` from `@sentry/node` for now, but
       * left as a property so this integration can be moved to `@sentry/core` as a base class in case we decide to use
       * something similar in browser-based SDKs in the future.
       */
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this.name = RequestData.id;
        this._addRequestData = utils.addRequestDataToEvent;
        this._options = {
          ...DEFAULT_OPTIONS,
          ...options,
          include: {
            // @ts-expect-error It's mad because `method` isn't a known `include` key. (It's only here and not set by default in
            // `addRequestDataToEvent` for legacy reasons. TODO (v8): Change that.)
            method: true,
            ...DEFAULT_OPTIONS.include,
            ...options.include,
            user: options.include && typeof options.include.user === "boolean" ? options.include.user : {
              ...DEFAULT_OPTIONS.include.user,
              // Unclear why TS still thinks `options.include.user` could be a boolean at this point
              ...(options.include || {}).user
            }
          }
        };
      }
      /**
       * @inheritDoc
       */
      setupOnce(addGlobalEventProcessor, getCurrentHub2) {
        const { transactionNamingScheme } = this._options;
        addGlobalEventProcessor((event) => {
          const hub = getCurrentHub2();
          const self2 = hub.getIntegration(RequestData);
          const { sdkProcessingMetadata = {} } = event;
          const req = sdkProcessingMetadata.request;
          if (!self2 || !req) {
            return event;
          }
          const addRequestDataOptions = sdkProcessingMetadata.requestDataOptionsFromExpressHandler || sdkProcessingMetadata.requestDataOptionsFromGCPWrapper || convertReqDataIntegrationOptsToAddReqDataOpts(this._options);
          const processedEvent = this._addRequestData(event, req, addRequestDataOptions);
          if (event.type === "transaction" || transactionNamingScheme === "handler") {
            return processedEvent;
          }
          const reqWithTransaction = req;
          const transaction = reqWithTransaction._sentryTransaction;
          if (transaction) {
            const shouldIncludeMethodInTransactionName = getSDKName(hub) === "sentry.javascript.nextjs" ? transaction.name.startsWith("/api") : transactionNamingScheme !== "path";
            const [transactionValue] = utils.extractPathForTransaction(req, {
              path: true,
              method: shouldIncludeMethodInTransactionName,
              customRoute: transaction.name
            });
            processedEvent.transaction = transactionValue;
          }
          return processedEvent;
        });
      }
    };
    RequestData.__initStatic();
    function convertReqDataIntegrationOptsToAddReqDataOpts(integrationOptions) {
      const {
        transactionNamingScheme,
        include: { ip, user, ...requestOptions }
      } = integrationOptions;
      const requestIncludeKeys = [];
      for (const [key, value] of Object.entries(requestOptions)) {
        if (value) {
          requestIncludeKeys.push(key);
        }
      }
      let addReqDataUserOpt;
      if (user === void 0) {
        addReqDataUserOpt = true;
      } else if (typeof user === "boolean") {
        addReqDataUserOpt = user;
      } else {
        const userIncludeKeys = [];
        for (const [key, value] of Object.entries(user)) {
          if (value) {
            userIncludeKeys.push(key);
          }
        }
        addReqDataUserOpt = userIncludeKeys;
      }
      return {
        include: {
          ip,
          user: addReqDataUserOpt,
          request: requestIncludeKeys.length !== 0 ? requestIncludeKeys : void 0,
          transaction: transactionNamingScheme
        }
      };
    }
    function getSDKName(hub) {
      try {
        return hub.getClient().getOptions()._metadata.sdk.name;
      } catch (err) {
        return void 0;
      }
    }
    exports.RequestData = RequestData;
  }
});

// node_modules/@sentry/core/cjs/index.js
var require_cjs2 = __commonJS({
  "node_modules/@sentry/core/cjs/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var hubextensions = require_hubextensions();
    var idletransaction = require_idletransaction();
    var span = require_span();
    var transaction = require_transaction();
    var utils = require_utils();
    var spanstatus = require_spanstatus();
    var trace = require_trace();
    var dynamicSamplingContext = require_dynamicSamplingContext();
    var measurement = require_measurement();
    var envelope = require_envelope2();
    var exports$1 = require_exports();
    var hub = require_hub();
    var session = require_session();
    var sessionflusher = require_sessionflusher();
    var scope = require_scope();
    var eventProcessors = require_eventProcessors();
    var api = require_api();
    var baseclient = require_baseclient();
    var serverRuntimeClient = require_server_runtime_client();
    var sdk = require_sdk();
    var base = require_base();
    var offline = require_offline();
    var multiplexed = require_multiplexed();
    var version2 = require_version();
    var integration = require_integration();
    var index = require_integrations();
    var prepareEvent = require_prepareEvent();
    var checkin = require_checkin();
    var hasTracingEnabled = require_hasTracingEnabled();
    var isSentryRequestUrl = require_isSentryRequestUrl();
    var constants = require_constants();
    var metadata = require_metadata2();
    var requestdata = require_requestdata2();
    var functiontostring = require_functiontostring();
    var inboundfilters = require_inboundfilters();
    var linkederrors = require_linkederrors();
    exports.addTracingExtensions = hubextensions.addTracingExtensions;
    exports.startIdleTransaction = hubextensions.startIdleTransaction;
    exports.IdleTransaction = idletransaction.IdleTransaction;
    exports.TRACING_DEFAULTS = idletransaction.TRACING_DEFAULTS;
    exports.Span = span.Span;
    exports.spanStatusfromHttpCode = span.spanStatusfromHttpCode;
    exports.Transaction = transaction.Transaction;
    exports.extractTraceparentData = utils.extractTraceparentData;
    exports.getActiveTransaction = utils.getActiveTransaction;
    Object.defineProperty(exports, "SpanStatus", {
      enumerable: true,
      get: () => spanstatus.SpanStatus
    });
    exports.continueTrace = trace.continueTrace;
    exports.getActiveSpan = trace.getActiveSpan;
    exports.startActiveSpan = trace.startActiveSpan;
    exports.startInactiveSpan = trace.startInactiveSpan;
    exports.startSpan = trace.startSpan;
    exports.startSpanManual = trace.startSpanManual;
    exports.trace = trace.trace;
    exports.getDynamicSamplingContextFromClient = dynamicSamplingContext.getDynamicSamplingContextFromClient;
    exports.setMeasurement = measurement.setMeasurement;
    exports.createEventEnvelope = envelope.createEventEnvelope;
    exports.addBreadcrumb = exports$1.addBreadcrumb;
    exports.captureCheckIn = exports$1.captureCheckIn;
    exports.captureEvent = exports$1.captureEvent;
    exports.captureException = exports$1.captureException;
    exports.captureMessage = exports$1.captureMessage;
    exports.close = exports$1.close;
    exports.configureScope = exports$1.configureScope;
    exports.flush = exports$1.flush;
    exports.getClient = exports$1.getClient;
    exports.lastEventId = exports$1.lastEventId;
    exports.setContext = exports$1.setContext;
    exports.setExtra = exports$1.setExtra;
    exports.setExtras = exports$1.setExtras;
    exports.setTag = exports$1.setTag;
    exports.setTags = exports$1.setTags;
    exports.setUser = exports$1.setUser;
    exports.startTransaction = exports$1.startTransaction;
    exports.withMonitor = exports$1.withMonitor;
    exports.withScope = exports$1.withScope;
    exports.Hub = hub.Hub;
    exports.ensureHubOnCarrier = hub.ensureHubOnCarrier;
    exports.getCurrentHub = hub.getCurrentHub;
    exports.getHubFromCarrier = hub.getHubFromCarrier;
    exports.getMainCarrier = hub.getMainCarrier;
    exports.makeMain = hub.makeMain;
    exports.runWithAsyncContext = hub.runWithAsyncContext;
    exports.setAsyncContextStrategy = hub.setAsyncContextStrategy;
    exports.setHubOnCarrier = hub.setHubOnCarrier;
    exports.closeSession = session.closeSession;
    exports.makeSession = session.makeSession;
    exports.updateSession = session.updateSession;
    exports.SessionFlusher = sessionflusher.SessionFlusher;
    exports.Scope = scope.Scope;
    exports.addGlobalEventProcessor = eventProcessors.addGlobalEventProcessor;
    exports.getEnvelopeEndpointWithUrlEncodedAuth = api.getEnvelopeEndpointWithUrlEncodedAuth;
    exports.getReportDialogEndpoint = api.getReportDialogEndpoint;
    exports.BaseClient = baseclient.BaseClient;
    exports.addEventProcessor = baseclient.addEventProcessor;
    exports.ServerRuntimeClient = serverRuntimeClient.ServerRuntimeClient;
    exports.initAndBind = sdk.initAndBind;
    exports.createTransport = base.createTransport;
    exports.makeOfflineTransport = offline.makeOfflineTransport;
    exports.makeMultiplexedTransport = multiplexed.makeMultiplexedTransport;
    exports.SDK_VERSION = version2.SDK_VERSION;
    exports.addIntegration = integration.addIntegration;
    exports.getIntegrationsToSetup = integration.getIntegrationsToSetup;
    exports.Integrations = index;
    exports.prepareEvent = prepareEvent.prepareEvent;
    exports.createCheckInEnvelope = checkin.createCheckInEnvelope;
    exports.hasTracingEnabled = hasTracingEnabled.hasTracingEnabled;
    exports.isSentryRequestUrl = isSentryRequestUrl.isSentryRequestUrl;
    exports.DEFAULT_ENVIRONMENT = constants.DEFAULT_ENVIRONMENT;
    exports.ModuleMetadata = metadata.ModuleMetadata;
    exports.RequestData = requestdata.RequestData;
    exports.FunctionToString = functiontostring.FunctionToString;
    exports.InboundFilters = inboundfilters.InboundFilters;
    exports.LinkedErrors = linkederrors.LinkedErrors;
  }
});

// node_modules/semver/internal/constants.js
var require_constants2 = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module2) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module2) {
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module2) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants2();
    var debug = require_debug();
    exports = module2.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module2) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module2) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module2) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants2();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class {
      constructor(version2, options) {
        options = parseOptions(options);
        if (version2 instanceof SemVer) {
          if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
            return version2;
          } else {
            version2 = version2.version;
          }
        } else if (typeof version2 !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
        }
        if (version2.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version2, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version2}`);
        }
        this.raw = version2;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release2, identifier2, identifierBase) {
        switch (release2) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier2, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier2, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier2, identifierBase);
            this.inc("pre", identifier2, identifierBase);
            break;
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier2, identifierBase);
            }
            this.inc("pre", identifier2, identifierBase);
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (!identifier2 && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier2 === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier2) {
              let prerelease = [identifier2, base];
              if (identifierBase === false) {
                prerelease = [identifier2];
              }
              if (compareIdentifiers(this.prerelease[0], identifier2) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release2}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module2) {
    var SemVer = require_semver();
    var parse = (version2, options, throwErrors = false) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      try {
        return new SemVer(version2, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module2) {
    var parse = require_parse();
    var valid = (version2, options) => {
      const v = parse(version2, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module2) {
    var parse = require_parse();
    var clean = (version2, options) => {
      const s = parse(version2.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module2) {
    var SemVer = require_semver();
    var inc = (version2, release2, options, identifier2, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier2;
        identifier2 = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version2 instanceof SemVer ? version2.version : version2,
          options
        ).inc(release2, identifier2, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module2) {
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (highVersion.patch) {
          return "patch";
        }
        if (highVersion.minor) {
          return "minor";
        }
        return "major";
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module2) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module2) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module2) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module2) {
    var parse = require_parse();
    var prerelease = (version2, options) => {
      const parsed = parse(version2, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module2) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module2) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module2) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module2) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module2) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module2) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module2) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module2) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module2) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module2) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module2) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module2) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module2) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module2) {
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version2, options) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      if (typeof version2 === "number") {
        version2 = String(version2);
      }
      if (typeof version2 !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version2.match(re[t.COERCE]);
      } else {
        let next;
        while ((next = re[t.COERCERTL].exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
        }
        re[t.COERCERTL].lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      return parse(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
    };
    module2.exports = coerce;
  }
});

// node_modules/semver/node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  "node_modules/semver/node_modules/yallist/iterator.js"(exports, module2) {
    "use strict";
    module2.exports = function(Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };
  }
});

// node_modules/semver/node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  "node_modules/semver/node_modules/yallist/yallist.js"(exports, module2) {
    "use strict";
    module2.exports = Yallist;
    Yallist.Node = Node;
    Yallist.create = Yallist;
    function Yallist(list) {
      var self2 = this;
      if (!(self2 instanceof Yallist)) {
        self2 = new Yallist();
      }
      self2.tail = null;
      self2.head = null;
      self2.length = 0;
      if (list && typeof list.forEach === "function") {
        list.forEach(function(item) {
          self2.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self2.push(arguments[i]);
        }
      }
      return self2;
    }
    Yallist.prototype.removeNode = function(node) {
      if (node.list !== this) {
        throw new Error("removing node which does not belong to this list");
      }
      var next = node.next;
      var prev = node.prev;
      if (next) {
        next.prev = prev;
      }
      if (prev) {
        prev.next = next;
      }
      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }
      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;
      return next;
    };
    Yallist.prototype.unshiftNode = function(node) {
      if (node === this.head) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }
      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };
    Yallist.prototype.pushNode = function(node) {
      if (node === this.tail) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }
      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };
    Yallist.prototype.push = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.unshift = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.pop = function() {
      if (!this.tail) {
        return void 0;
      }
      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.shift = function() {
      if (!this.head) {
        return void 0;
      }
      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.forEach = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };
    Yallist.prototype.forEachReverse = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };
    Yallist.prototype.get = function(n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.getReverse = function(n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.map = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res;
    };
    Yallist.prototype.mapReverse = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res;
    };
    Yallist.prototype.reduce = function(fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }
      return acc;
    };
    Yallist.prototype.reduceReverse = function(fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }
      return acc;
    };
    Yallist.prototype.toArray = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr;
    };
    Yallist.prototype.toArrayReverse = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr;
    };
    Yallist.prototype.slice = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.sliceReverse = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1;
      }
      if (start < 0) {
        start = this.length + start;
      }
      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next;
      }
      var ret = [];
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value);
        walker = this.removeNode(walker);
      }
      if (walker === null) {
        walker = this.tail;
      }
      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
      }
      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i]);
      }
      return ret;
    };
    Yallist.prototype.reverse = function() {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this;
    };
    function insert(self2, node, value) {
      var inserted = node === self2.head ? new Node(value, null, node, self2) : new Node(value, node, node.next, self2);
      if (inserted.next === null) {
        self2.tail = inserted;
      }
      if (inserted.prev === null) {
        self2.head = inserted;
      }
      self2.length++;
      return inserted;
    }
    function push(self2, item) {
      self2.tail = new Node(item, self2.tail, null, self2);
      if (!self2.head) {
        self2.head = self2.tail;
      }
      self2.length++;
    }
    function unshift(self2, item) {
      self2.head = new Node(item, null, self2.head, self2);
      if (!self2.tail) {
        self2.tail = self2.head;
      }
      self2.length++;
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
      }
      this.list = list;
      this.value = value;
      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }
      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }
    try {
      require_iterator()(Yallist);
    } catch (er) {
    }
  }
});

// node_modules/semver/node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  "node_modules/semver/node_modules/lru-cache/index.js"(exports, module2) {
    "use strict";
    var Yallist = require_yallist();
    var MAX = Symbol("max");
    var LENGTH = Symbol("length");
    var LENGTH_CALCULATOR = Symbol("lengthCalculator");
    var ALLOW_STALE = Symbol("allowStale");
    var MAX_AGE = Symbol("maxAge");
    var DISPOSE = Symbol("dispose");
    var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
    var LRU_LIST = Symbol("lruList");
    var CACHE = Symbol("cache");
    var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
    var naiveLength = () => 1;
    var LRUCache = class {
      constructor(options) {
        if (typeof options === "number")
          options = { max: options };
        if (!options)
          options = {};
        if (options.max && (typeof options.max !== "number" || options.max < 0))
          throw new TypeError("max must be a non-negative number");
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }
      // resize the cache when the max changes.
      set max(mL) {
        if (typeof mL !== "number" || mL < 0)
          throw new TypeError("max must be a non-negative number");
        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max() {
        return this[MAX];
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale() {
        return this[ALLOW_STALE];
      }
      set maxAge(mA) {
        if (typeof mA !== "number")
          throw new TypeError("maxAge must be a non-negative number");
        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge() {
        return this[MAX_AGE];
      }
      // resize the cache when the lengthCalculator changes.
      set lengthCalculator(lC) {
        if (typeof lC !== "function")
          lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
      }
      get length() {
        return this[LENGTH];
      }
      get itemCount() {
        return this[LRU_LIST].length;
      }
      rforEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key);
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value);
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = /* @__PURE__ */ new Map();
        this[LRU_LIST] = new Yallist();
        this[LENGTH] = 0;
      }
      dump() {
        return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter((h) => h);
      }
      dumpLru() {
        return this[LRU_LIST];
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false;
          }
          const node = this[CACHE].get(key);
          const item = node.value;
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }
          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);
          return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
      }
      has(key) {
        if (!this[CACHE].has(key))
          return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
      }
      get(key) {
        return get(this, key, true);
      }
      peek(key) {
        return get(this, key, false);
      }
      pop() {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null;
        del(this, node);
        return node.value;
      }
      del(key) {
        del(this, this[CACHE].get(key));
      }
      load(arr) {
        this.reset();
        const now = Date.now();
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false));
      }
    };
    var get = (self2, key, doUse) => {
      const node = self2[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self2, hit)) {
          del(self2, node);
          if (!self2[ALLOW_STALE])
            return void 0;
        } else {
          if (doUse) {
            if (self2[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self2[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value;
      }
    };
    var isStale = (self2, hit) => {
      if (!hit || !hit.maxAge && !self2[MAX_AGE])
        return false;
      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE];
    };
    var trim = (self2) => {
      if (self2[LENGTH] > self2[MAX]) {
        for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
          const prev = walker.prev;
          del(self2, walker);
          walker = prev;
        }
      }
    };
    var del = (self2, node) => {
      if (node) {
        const hit = node.value;
        if (self2[DISPOSE])
          self2[DISPOSE](hit.key, hit.value);
        self2[LENGTH] -= hit.length;
        self2[CACHE].delete(hit.key);
        self2[LRU_LIST].removeNode(node);
      }
    };
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    };
    var forEachStep = (self2, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self2, hit)) {
        del(self2, node);
        if (!self2[ALLOW_STALE])
          hit = void 0;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self2);
    };
    module2.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module2) {
    var Range = class {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.format();
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().split(/\s+/).join(" ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.format();
      }
      format() {
        this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version2) {
        if (!version2) {
          return false;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version2, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lru_cache();
    var cache = new LRU({ max: 1e3 });
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants2();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version2, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version2)) {
          return false;
        }
      }
      if (version2.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module2) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version2) {
        debug("Comparator.test", version2, this.options.loose);
        if (this.semver === ANY || version2 === ANY) {
          return true;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version2, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module2) {
    var Range = require_range();
    var satisfies = (version2, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version2);
    };
    module2.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module2) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions3, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions3.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions3, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions3.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module2) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module2) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version2, range, hilo, options) => {
      version2 = new SemVer(version2, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version2, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module2) {
    var outside = require_outside();
    var gtr = (version2, range, options) => outside(version2, range, ">", options);
    module2.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module2) {
    var outside = require_outside();
    var ltr = (version2, range, options) => outside(version2, range, "<", options);
    module2.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module2) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module2) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions3, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions3.sort((a, b) => compare(a, b, options));
      for (const version2 of v) {
        const included = satisfies(version2, range, options);
        if (included) {
          prev = version2;
          if (!first) {
            first = version2;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module2) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER:
        for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module2) {
    var internalRe = require_re();
    var constants = require_constants2();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// node_modules/node-abi/abi_registry.json
var require_abi_registry = __commonJS({
  "node_modules/node-abi/abi_registry.json"(exports, module2) {
    module2.exports = [
      {
        runtime: "node",
        target: "11.0.0",
        lts: false,
        future: false,
        abi: "67"
      },
      {
        runtime: "node",
        target: "12.0.0",
        lts: [
          "2019-10-21",
          "2020-11-30"
        ],
        future: false,
        abi: "72"
      },
      {
        runtime: "node",
        target: "13.0.0",
        lts: false,
        future: false,
        abi: "79"
      },
      {
        runtime: "node",
        target: "14.0.0",
        lts: [
          "2020-10-27",
          "2021-10-19"
        ],
        future: false,
        abi: "83"
      },
      {
        runtime: "node",
        target: "15.0.0",
        lts: false,
        future: false,
        abi: "88"
      },
      {
        runtime: "node",
        target: "16.0.0",
        lts: [
          "2021-10-26",
          "2022-10-18"
        ],
        future: false,
        abi: "93"
      },
      {
        runtime: "node",
        target: "17.0.0",
        lts: false,
        future: false,
        abi: "102"
      },
      {
        runtime: "node",
        target: "18.0.0",
        lts: [
          "2022-10-25",
          "2023-10-18"
        ],
        future: false,
        abi: "108"
      },
      {
        runtime: "node",
        target: "19.0.0",
        lts: false,
        future: false,
        abi: "111"
      },
      {
        runtime: "node",
        target: "20.0.0",
        lts: [
          "2023-10-24",
          "2024-10-22"
        ],
        future: false,
        abi: "115"
      },
      {
        runtime: "node",
        target: "21.0.0",
        lts: false,
        future: false,
        abi: "120"
      },
      {
        abi: "70",
        future: false,
        lts: false,
        runtime: "electron",
        target: "5.0.0-beta.9"
      },
      {
        abi: "73",
        future: false,
        lts: false,
        runtime: "electron",
        target: "6.0.0-beta.1"
      },
      {
        abi: "75",
        future: false,
        lts: false,
        runtime: "electron",
        target: "7.0.0-beta.1"
      },
      {
        abi: "76",
        future: false,
        lts: false,
        runtime: "electron",
        target: "9.0.0-beta.1"
      },
      {
        abi: "76",
        future: false,
        lts: false,
        runtime: "electron",
        target: "8.0.0-beta.1"
      },
      {
        abi: "80",
        future: false,
        lts: false,
        runtime: "electron",
        target: "9.0.0-beta.2"
      },
      {
        abi: "82",
        future: false,
        lts: false,
        runtime: "electron",
        target: "11.0.0-beta.1"
      },
      {
        abi: "82",
        future: false,
        lts: false,
        runtime: "electron",
        target: "10.0.0-beta.1"
      },
      {
        abi: "85",
        future: false,
        lts: false,
        runtime: "electron",
        target: "11.0.0-beta.11"
      },
      {
        abi: "87",
        future: false,
        lts: false,
        runtime: "electron",
        target: "12.0.0-beta.1"
      },
      {
        abi: "89",
        future: false,
        lts: false,
        runtime: "electron",
        target: "15.0.0-alpha.1"
      },
      {
        abi: "89",
        future: false,
        lts: false,
        runtime: "electron",
        target: "14.0.0-beta.1"
      },
      {
        abi: "89",
        future: false,
        lts: false,
        runtime: "electron",
        target: "13.0.0-beta.2"
      },
      {
        abi: "97",
        future: false,
        lts: false,
        runtime: "electron",
        target: "14.0.2"
      },
      {
        abi: "98",
        future: false,
        lts: false,
        runtime: "electron",
        target: "15.0.0-beta.7"
      },
      {
        abi: "99",
        future: false,
        lts: false,
        runtime: "electron",
        target: "16.0.0-alpha.1"
      },
      {
        abi: "101",
        future: false,
        lts: false,
        runtime: "electron",
        target: "17.0.0-alpha.1"
      },
      {
        abi: "103",
        future: false,
        lts: false,
        runtime: "electron",
        target: "18.0.0-alpha.1"
      },
      {
        abi: "106",
        future: false,
        lts: false,
        runtime: "electron",
        target: "19.0.0-alpha.1"
      },
      {
        abi: "107",
        future: false,
        lts: false,
        runtime: "electron",
        target: "20.0.0-alpha.1"
      },
      {
        abi: "109",
        future: false,
        lts: false,
        runtime: "electron",
        target: "21.0.0-alpha.1"
      },
      {
        abi: "110",
        future: false,
        lts: false,
        runtime: "electron",
        target: "22.0.0-alpha.1"
      },
      {
        abi: "113",
        future: false,
        lts: false,
        runtime: "electron",
        target: "23.0.0-alpha.1"
      },
      {
        abi: "114",
        future: false,
        lts: false,
        runtime: "electron",
        target: "24.0.0-alpha.1"
      },
      {
        abi: "116",
        future: false,
        lts: false,
        runtime: "electron",
        target: "26.0.0-alpha.1"
      },
      {
        abi: "116",
        future: false,
        lts: false,
        runtime: "electron",
        target: "25.0.0-alpha.1"
      },
      {
        abi: "118",
        future: false,
        lts: false,
        runtime: "electron",
        target: "27.0.0-alpha.1"
      },
      {
        abi: "119",
        future: false,
        lts: false,
        runtime: "electron",
        target: "28.0.0-alpha.1"
      }
    ];
  }
});

// node_modules/node-abi/index.js
var require_node_abi = __commonJS({
  "node_modules/node-abi/index.js"(exports) {
    var semver = require_semver2();
    function getNextTarget(runtime, targets) {
      if (targets == null)
        targets = allTargets;
      var latest = targets.filter(function(t) {
        return t.runtime === runtime;
      }).slice(-1)[0];
      var increment = runtime === "electron" ? "minor" : "major";
      var next = semver.inc(latest.target, increment);
      if (runtime === "electron" && semver.parse(latest.target).prerelease.length) {
        next = semver.inc(next, "major");
      }
      return next;
    }
    function getAbi2(target, runtime) {
      if (target === String(Number(target)))
        return target;
      if (target)
        target = target.replace(/^v/, "");
      if (!runtime)
        runtime = "node";
      if (runtime === "node") {
        if (!target)
          return process.versions.modules;
        if (target === process.versions.node)
          return process.versions.modules;
      }
      var abi2;
      var lastTarget;
      for (var i = 0; i < allTargets.length; i++) {
        var t = allTargets[i];
        if (t.runtime !== runtime)
          continue;
        if (semver.lte(t.target, target) && (!lastTarget || semver.gte(t.target, lastTarget))) {
          abi2 = t.abi;
          lastTarget = t.target;
        }
      }
      if (abi2 && semver.lt(target, getNextTarget(runtime)))
        return abi2;
      throw new Error("Could not detect abi for version " + target + " and runtime " + runtime + '.  Updating "node-abi" might help solve this issue if it is a new release of ' + runtime);
    }
    function getTarget(abi2, runtime) {
      if (abi2 && abi2 !== String(Number(abi2)))
        return abi2;
      if (!runtime)
        runtime = "node";
      if (runtime === "node" && !abi2)
        return process.versions.node;
      var match = allTargets.filter(function(t) {
        return t.abi === abi2 && t.runtime === runtime;
      }).map(function(t) {
        return t.target;
      });
      if (match.length) {
        var betaSeparatorIndex = match[0].indexOf("-");
        return betaSeparatorIndex > -1 ? match[0].substring(0, betaSeparatorIndex) : match[0];
      }
      throw new Error("Could not detect target for abi " + abi2 + " and runtime " + runtime);
    }
    function sortByTargetFn(a, b) {
      var abiComp = Number(a.abi) - Number(b.abi);
      if (abiComp !== 0)
        return abiComp;
      if (a.target < b.target)
        return -1;
      if (a.target > b.target)
        return 1;
      return 0;
    }
    function loadGeneratedTargets() {
      var registry = require_abi_registry();
      var targets = {
        supported: [],
        additional: [],
        future: []
      };
      registry.forEach(function(item) {
        var target = {
          runtime: item.runtime,
          target: item.target,
          abi: item.abi
        };
        if (item.lts) {
          var startDate = new Date(Date.parse(item.lts[0]));
          var endDate = new Date(Date.parse(item.lts[1]));
          var currentDate = /* @__PURE__ */ new Date();
          target.lts = startDate < currentDate && currentDate < endDate;
        } else {
          target.lts = false;
        }
        if (target.runtime === "node-webkit") {
          targets.additional.push(target);
        } else if (item.future) {
          targets.future.push(target);
        } else {
          targets.supported.push(target);
        }
      });
      targets.supported.sort(sortByTargetFn);
      targets.additional.sort(sortByTargetFn);
      targets.future.sort(sortByTargetFn);
      return targets;
    }
    var generatedTargets = loadGeneratedTargets();
    var supportedTargets = [
      { runtime: "node", target: "5.0.0", abi: "47", lts: false },
      { runtime: "node", target: "6.0.0", abi: "48", lts: false },
      { runtime: "node", target: "7.0.0", abi: "51", lts: false },
      { runtime: "node", target: "8.0.0", abi: "57", lts: false },
      { runtime: "node", target: "9.0.0", abi: "59", lts: false },
      { runtime: "node", target: "10.0.0", abi: "64", lts: new Date(2018, 10, 1) < /* @__PURE__ */ new Date() && /* @__PURE__ */ new Date() < new Date(2020, 4, 31) },
      { runtime: "electron", target: "0.36.0", abi: "47", lts: false },
      { runtime: "electron", target: "1.1.0", abi: "48", lts: false },
      { runtime: "electron", target: "1.3.0", abi: "49", lts: false },
      { runtime: "electron", target: "1.4.0", abi: "50", lts: false },
      { runtime: "electron", target: "1.5.0", abi: "51", lts: false },
      { runtime: "electron", target: "1.6.0", abi: "53", lts: false },
      { runtime: "electron", target: "1.7.0", abi: "54", lts: false },
      { runtime: "electron", target: "1.8.0", abi: "57", lts: false },
      { runtime: "electron", target: "2.0.0", abi: "57", lts: false },
      { runtime: "electron", target: "3.0.0", abi: "64", lts: false },
      { runtime: "electron", target: "4.0.0", abi: "64", lts: false },
      { runtime: "electron", target: "4.0.4", abi: "69", lts: false }
    ];
    supportedTargets.push.apply(supportedTargets, generatedTargets.supported);
    var additionalTargets = [
      { runtime: "node-webkit", target: "0.13.0", abi: "47", lts: false },
      { runtime: "node-webkit", target: "0.15.0", abi: "48", lts: false },
      { runtime: "node-webkit", target: "0.18.3", abi: "51", lts: false },
      { runtime: "node-webkit", target: "0.23.0", abi: "57", lts: false },
      { runtime: "node-webkit", target: "0.26.5", abi: "59", lts: false }
    ];
    additionalTargets.push.apply(additionalTargets, generatedTargets.additional);
    var deprecatedTargets = [
      { runtime: "node", target: "0.2.0", abi: "1", lts: false },
      { runtime: "node", target: "0.9.1", abi: "0x000A", lts: false },
      { runtime: "node", target: "0.9.9", abi: "0x000B", lts: false },
      { runtime: "node", target: "0.10.4", abi: "11", lts: false },
      { runtime: "node", target: "0.11.0", abi: "0x000C", lts: false },
      { runtime: "node", target: "0.11.8", abi: "13", lts: false },
      { runtime: "node", target: "0.11.11", abi: "14", lts: false },
      { runtime: "node", target: "1.0.0", abi: "42", lts: false },
      { runtime: "node", target: "1.1.0", abi: "43", lts: false },
      { runtime: "node", target: "2.0.0", abi: "44", lts: false },
      { runtime: "node", target: "3.0.0", abi: "45", lts: false },
      { runtime: "node", target: "4.0.0", abi: "46", lts: false },
      { runtime: "electron", target: "0.30.0", abi: "44", lts: false },
      { runtime: "electron", target: "0.31.0", abi: "45", lts: false },
      { runtime: "electron", target: "0.33.0", abi: "46", lts: false }
    ];
    var futureTargets = generatedTargets.future;
    var allTargets = deprecatedTargets.concat(supportedTargets).concat(additionalTargets).concat(futureTargets);
    exports.getAbi = getAbi2;
    exports.getTarget = getTarget;
    exports.deprecatedTargets = deprecatedTargets;
    exports.supportedTargets = supportedTargets;
    exports.additionalTargets = additionalTargets;
    exports.futureTargets = futureTargets;
    exports.allTargets = allTargets;
    exports._getNextTarget = getNextTarget;
  }
});

// node_modules/detect-libc/lib/process.js
var require_process = __commonJS({
  "node_modules/detect-libc/lib/process.js"(exports, module2) {
    "use strict";
    var isLinux = () => process.platform === "linux";
    var report = null;
    var getReport = () => {
      if (!report) {
        report = isLinux() && process.report ? process.report.getReport() : {};
      }
      return report;
    };
    module2.exports = { isLinux, getReport };
  }
});

// node_modules/detect-libc/lib/filesystem.js
var require_filesystem = __commonJS({
  "node_modules/detect-libc/lib/filesystem.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var LDD_PATH = "/usr/bin/ldd";
    var readFileSync = (path) => fs.readFileSync(path, "utf-8");
    var readFile = (path) => new Promise((resolve2, reject) => {
      fs.readFile(path, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve2(data);
        }
      });
    });
    module2.exports = {
      LDD_PATH,
      readFileSync,
      readFile
    };
  }
});

// node_modules/detect-libc/lib/detect-libc.js
var require_detect_libc = __commonJS({
  "node_modules/detect-libc/lib/detect-libc.js"(exports, module2) {
    "use strict";
    var childProcess = require("child_process");
    var { isLinux, getReport } = require_process();
    var { LDD_PATH, readFile, readFileSync } = require_filesystem();
    var cachedFamilyFilesystem;
    var cachedVersionFilesystem;
    var command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
    var commandOut = "";
    var safeCommand = () => {
      if (!commandOut) {
        return new Promise((resolve2) => {
          childProcess.exec(command, (err, out) => {
            commandOut = err ? " " : out;
            resolve2(commandOut);
          });
        });
      }
      return commandOut;
    };
    var safeCommandSync = () => {
      if (!commandOut) {
        try {
          commandOut = childProcess.execSync(command, { encoding: "utf8" });
        } catch (_err) {
          commandOut = " ";
        }
      }
      return commandOut;
    };
    var GLIBC = "glibc";
    var RE_GLIBC_VERSION = /GLIBC\s(\d+\.\d+)/;
    var MUSL = "musl";
    var GLIBC_ON_LDD = GLIBC.toUpperCase();
    var MUSL_ON_LDD = MUSL.toLowerCase();
    var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
    var familyFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return GLIBC;
      }
      if (Array.isArray(report.sharedObjects)) {
        if (report.sharedObjects.some(isFileMusl)) {
          return MUSL;
        }
      }
      return null;
    };
    var familyFromCommand = (out) => {
      const [getconf, ldd1] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return GLIBC;
      }
      if (ldd1 && ldd1.includes(MUSL)) {
        return MUSL;
      }
      return null;
    };
    var getFamilyFromLddContent = (content) => {
      if (content.includes(MUSL_ON_LDD)) {
        return MUSL;
      }
      if (content.includes(GLIBC_ON_LDD)) {
        return GLIBC;
      }
      return null;
    };
    var familyFromFilesystem = async () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var familyFromFilesystemSync = () => {
      if (cachedFamilyFilesystem !== void 0) {
        return cachedFamilyFilesystem;
      }
      cachedFamilyFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
      } catch (e) {
      }
      return cachedFamilyFilesystem;
    };
    var family = async () => {
      let family2 = null;
      if (isLinux()) {
        family2 = await familyFromFilesystem();
        if (!family2) {
          family2 = familyFromReport();
        }
        if (!family2) {
          const out = await safeCommand();
          family2 = familyFromCommand(out);
        }
      }
      return family2;
    };
    var familySync2 = () => {
      let family2 = null;
      if (isLinux()) {
        family2 = familyFromFilesystemSync();
        if (!family2) {
          family2 = familyFromReport();
        }
        if (!family2) {
          const out = safeCommandSync();
          family2 = familyFromCommand(out);
        }
      }
      return family2;
    };
    var isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
    var isNonGlibcLinuxSync = () => isLinux() && familySync2() !== GLIBC;
    var versionFromFilesystem = async () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = await readFile(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromFilesystemSync = () => {
      if (cachedVersionFilesystem !== void 0) {
        return cachedVersionFilesystem;
      }
      cachedVersionFilesystem = null;
      try {
        const lddContent = readFileSync(LDD_PATH);
        const versionMatch = lddContent.match(RE_GLIBC_VERSION);
        if (versionMatch) {
          cachedVersionFilesystem = versionMatch[1];
        }
      } catch (e) {
      }
      return cachedVersionFilesystem;
    };
    var versionFromReport = () => {
      const report = getReport();
      if (report.header && report.header.glibcVersionRuntime) {
        return report.header.glibcVersionRuntime;
      }
      return null;
    };
    var versionSuffix = (s) => s.trim().split(/\s+/)[1];
    var versionFromCommand = (out) => {
      const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
      if (getconf && getconf.includes(GLIBC)) {
        return versionSuffix(getconf);
      }
      if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
        return versionSuffix(ldd2);
      }
      return null;
    };
    var version2 = async () => {
      let version3 = null;
      if (isLinux()) {
        version3 = await versionFromFilesystem();
        if (!version3) {
          version3 = versionFromReport();
        }
        if (!version3) {
          const out = await safeCommand();
          version3 = versionFromCommand(out);
        }
      }
      return version3;
    };
    var versionSync = () => {
      let version3 = null;
      if (isLinux()) {
        version3 = versionFromFilesystemSync();
        if (!version3) {
          version3 = versionFromReport();
        }
        if (!version3) {
          const out = safeCommandSync();
          version3 = versionFromCommand(out);
        }
      }
      return version3;
    };
    module2.exports = {
      GLIBC,
      MUSL,
      family,
      familySync: familySync2,
      isNonGlibcLinux,
      isNonGlibcLinuxSync,
      version: version2,
      versionSync
    };
  }
});

// node_modules/@sentry-internal/tracing/cjs/common/debug-build.js
var require_debug_build3 = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/common/debug-build.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
    exports.DEBUG_BUILD = DEBUG_BUILD;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/utils/node-utils.js
var require_node_utils = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/utils/node-utils.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    function shouldDisableAutoInstrumentation(getCurrentHub2) {
      const clientOptions = _optionalChain([getCurrentHub2, "call", (_) => _(), "access", (_2) => _2.getClient, "call", (_3) => _3(), "optionalAccess", (_4) => _4.getOptions, "call", (_5) => _5()]);
      const instrumenter = _optionalChain([clientOptions, "optionalAccess", (_6) => _6.instrumenter]) || "sentry";
      return instrumenter !== "sentry";
    }
    exports.shouldDisableAutoInstrumentation = shouldDisableAutoInstrumentation;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/express.js
var require_express = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/express.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    var Express = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Express";
      }
      /**
       * @inheritDoc
       */
      /**
       * Express App instance
       */
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this.name = Express.id;
        this._router = options.router || options.app;
        this._methods = (Array.isArray(options.methods) ? options.methods : []).concat("use");
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        if (!this._router) {
          debugBuild.DEBUG_BUILD && utils.logger.error("ExpressIntegration is missing an Express instance");
          return;
        }
        if (nodeUtils.shouldDisableAutoInstrumentation(getCurrentHub2)) {
          debugBuild.DEBUG_BUILD && utils.logger.log("Express Integration is skipped because of instrumenter configuration.");
          return;
        }
        instrumentMiddlewares(this._router, this._methods);
        instrumentRouter(this._router);
      }
    };
    Express.__initStatic();
    function wrap(fn, method) {
      const arity = fn.length;
      switch (arity) {
        case 2: {
          return function(req, res) {
            const transaction = res.__sentry_transaction;
            if (transaction) {
              const span = transaction.startChild({
                description: fn.name,
                op: `middleware.express.${method}`,
                origin: "auto.middleware.express"
              });
              res.once("finish", () => {
                span.finish();
              });
            }
            return fn.call(this, req, res);
          };
        }
        case 3: {
          return function(req, res, next) {
            const transaction = res.__sentry_transaction;
            const span = _optionalChain([transaction, "optionalAccess", (_2) => _2.startChild, "call", (_3) => _3({
              description: fn.name,
              op: `middleware.express.${method}`,
              origin: "auto.middleware.express"
            })]);
            fn.call(this, req, res, function(...args) {
              _optionalChain([span, "optionalAccess", (_4) => _4.finish, "call", (_5) => _5()]);
              next.call(this, ...args);
            });
          };
        }
        case 4: {
          return function(err, req, res, next) {
            const transaction = res.__sentry_transaction;
            const span = _optionalChain([transaction, "optionalAccess", (_6) => _6.startChild, "call", (_7) => _7({
              description: fn.name,
              op: `middleware.express.${method}`,
              origin: "auto.middleware.express"
            })]);
            fn.call(this, err, req, res, function(...args) {
              _optionalChain([span, "optionalAccess", (_8) => _8.finish, "call", (_9) => _9()]);
              next.call(this, ...args);
            });
          };
        }
        default: {
          throw new Error(`Express middleware takes 2-4 arguments. Got: ${arity}`);
        }
      }
    }
    function wrapMiddlewareArgs(args, method) {
      return args.map((arg) => {
        if (typeof arg === "function") {
          return wrap(arg, method);
        }
        if (Array.isArray(arg)) {
          return arg.map((a) => {
            if (typeof a === "function") {
              return wrap(a, method);
            }
            return a;
          });
        }
        return arg;
      });
    }
    function patchMiddleware(router, method) {
      const originalCallback = router[method];
      router[method] = function(...args) {
        return originalCallback.call(this, ...wrapMiddlewareArgs(args, method));
      };
      return router;
    }
    function instrumentMiddlewares(router, methods = []) {
      methods.forEach((method) => patchMiddleware(router, method));
    }
    function instrumentRouter(appOrRouter) {
      const isApp = "settings" in appOrRouter;
      if (isApp && appOrRouter._router === void 0 && appOrRouter.lazyrouter) {
        appOrRouter.lazyrouter();
      }
      const router = isApp ? appOrRouter._router : appOrRouter;
      if (!router) {
        debugBuild.DEBUG_BUILD && utils.logger.debug("Cannot instrument router for URL Parameterization (did not find a valid router).");
        debugBuild.DEBUG_BUILD && utils.logger.debug("Routing instrumentation is currently only supported in Express 4.");
        return;
      }
      const routerProto = Object.getPrototypeOf(router);
      const originalProcessParams = routerProto.process_params;
      routerProto.process_params = function process_params(layer, called, req, res, done) {
        if (!req._reconstructedRoute) {
          req._reconstructedRoute = "";
        }
        const { layerRoutePath, isRegex, isArray, numExtraSegments } = getLayerRoutePathInfo(layer);
        if (layerRoutePath || isRegex || isArray) {
          req._hasParameters = true;
        }
        let partialRoute;
        if (layerRoutePath) {
          partialRoute = layerRoutePath;
        } else {
          partialRoute = preventDuplicateSegments(req.originalUrl, req._reconstructedRoute, layer.path) || "";
        }
        const finalPartialRoute = partialRoute.split("/").filter((segment) => segment.length > 0 && (isRegex || isArray || !segment.includes("*"))).join("/");
        if (finalPartialRoute && finalPartialRoute.length > 0) {
          req._reconstructedRoute += `/${finalPartialRoute}${isRegex ? "/" : ""}`;
        }
        const urlLength = utils.getNumberOfUrlSegments(utils.stripUrlQueryAndFragment(req.originalUrl || "")) + numExtraSegments;
        const routeLength = utils.getNumberOfUrlSegments(req._reconstructedRoute);
        if (urlLength === routeLength) {
          if (!req._hasParameters) {
            if (req._reconstructedRoute !== req.originalUrl) {
              req._reconstructedRoute = req.originalUrl ? utils.stripUrlQueryAndFragment(req.originalUrl) : req.originalUrl;
            }
          }
          const transaction = res.__sentry_transaction;
          if (transaction && transaction.metadata.source !== "custom") {
            const finalRoute = req._reconstructedRoute || "/";
            transaction.setName(...utils.extractPathForTransaction(req, { path: true, method: true, customRoute: finalRoute }));
          }
        }
        return originalProcessParams.call(this, layer, called, req, res, done);
      };
    }
    var extractOriginalRoute = (path, regexp, keys) => {
      if (!path || !regexp || !keys || Object.keys(keys).length === 0 || !_optionalChain([keys, "access", (_10) => _10[0], "optionalAccess", (_11) => _11.offset])) {
        return void 0;
      }
      const orderedKeys = keys.sort((a, b) => a.offset - b.offset);
      const pathRegex = new RegExp(regexp, `${regexp.flags}d`);
      const execResult = pathRegex.exec(path);
      if (!execResult || !execResult.indices) {
        return void 0;
      }
      const [, ...paramIndices] = execResult.indices;
      if (paramIndices.length !== orderedKeys.length) {
        return void 0;
      }
      let resultPath = path;
      let indexShift = 0;
      paramIndices.forEach((item, index) => {
        if (item) {
          const [startOffset, endOffset] = item;
          const substr1 = resultPath.substring(0, startOffset - indexShift);
          const replacement = `:${orderedKeys[index].name}`;
          const substr2 = resultPath.substring(endOffset - indexShift);
          resultPath = substr1 + replacement + substr2;
          indexShift = indexShift + (endOffset - startOffset - replacement.length);
        }
      });
      return resultPath;
    };
    function getLayerRoutePathInfo(layer) {
      let lrp = _optionalChain([layer, "access", (_12) => _12.route, "optionalAccess", (_13) => _13.path]);
      const isRegex = utils.isRegExp(lrp);
      const isArray = Array.isArray(lrp);
      if (!lrp) {
        const [major] = utils.GLOBAL_OBJ.process.versions.node.split(".").map(Number);
        if (major >= 16) {
          lrp = extractOriginalRoute(layer.path, layer.regexp, layer.keys);
        }
      }
      if (!lrp) {
        return { isRegex, isArray, numExtraSegments: 0 };
      }
      const numExtraSegments = isArray ? Math.max(getNumberOfArrayUrlSegments(lrp) - utils.getNumberOfUrlSegments(layer.path || ""), 0) : 0;
      const layerRoutePath = getLayerRoutePathString(isArray, lrp);
      return { layerRoutePath, isRegex, isArray, numExtraSegments };
    }
    function getNumberOfArrayUrlSegments(routesArray) {
      return routesArray.reduce((accNumSegments, currentRoute) => {
        return accNumSegments + utils.getNumberOfUrlSegments(currentRoute.toString());
      }, 0);
    }
    function getLayerRoutePathString(isArray, lrp) {
      if (isArray) {
        return lrp.map((r) => r.toString()).join(",");
      }
      return lrp && lrp.toString();
    }
    function preventDuplicateSegments(originalUrl, reconstructedRoute, layerPath) {
      const normalizeURL = utils.stripUrlQueryAndFragment(originalUrl || "");
      const originalUrlSplit = _optionalChain([normalizeURL, "optionalAccess", (_14) => _14.split, "call", (_15) => _15("/"), "access", (_16) => _16.filter, "call", (_17) => _17((v) => !!v)]);
      let tempCounter = 0;
      const currentOffset = _optionalChain([reconstructedRoute, "optionalAccess", (_18) => _18.split, "call", (_19) => _19("/"), "access", (_20) => _20.filter, "call", (_21) => _21((v) => !!v), "access", (_22) => _22.length]) || 0;
      const result = _optionalChain([
        layerPath,
        "optionalAccess",
        (_23) => _23.split,
        "call",
        (_24) => _24("/"),
        "access",
        (_25) => _25.filter,
        "call",
        (_26) => _26((segment) => {
          if (_optionalChain([originalUrlSplit, "optionalAccess", (_27) => _27[currentOffset + tempCounter]]) === segment) {
            tempCounter += 1;
            return true;
          }
          return false;
        }),
        "access",
        (_28) => _28.join,
        "call",
        (_29) => _29("/")
      ]);
      return result;
    }
    exports.Express = Express;
    exports.extractOriginalRoute = extractOriginalRoute;
    exports.preventDuplicateSegments = preventDuplicateSegments;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/postgres.js
var require_postgres = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/postgres.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    var Postgres = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Postgres";
      }
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this.name = Postgres.id;
        this._usePgNative = !!options.usePgNative;
        this._module = options.module;
      }
      /** @inheritdoc */
      loadDependency() {
        return this._module = this._module || utils.loadModule("pg");
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        if (nodeUtils.shouldDisableAutoInstrumentation(getCurrentHub2)) {
          debugBuild.DEBUG_BUILD && utils.logger.log("Postgres Integration is skipped because of instrumenter configuration.");
          return;
        }
        const pkg = this.loadDependency();
        if (!pkg) {
          debugBuild.DEBUG_BUILD && utils.logger.error("Postgres Integration was unable to require `pg` package.");
          return;
        }
        const Client = this._usePgNative ? _optionalChain([pkg, "access", (_2) => _2.native, "optionalAccess", (_3) => _3.Client]) : pkg.Client;
        if (!Client) {
          debugBuild.DEBUG_BUILD && utils.logger.error("Postgres Integration was unable to access 'pg-native' bindings.");
          return;
        }
        utils.fill(Client.prototype, "query", function(orig) {
          return function(config, values, callback) {
            const scope = getCurrentHub2().getScope();
            const parentSpan = scope.getSpan();
            const data = {
              "db.system": "postgresql"
            };
            try {
              if (this.database) {
                data["db.name"] = this.database;
              }
              if (this.host) {
                data["server.address"] = this.host;
              }
              if (this.port) {
                data["server.port"] = this.port;
              }
              if (this.user) {
                data["db.user"] = this.user;
              }
            } catch (e) {
            }
            const span = _optionalChain([parentSpan, "optionalAccess", (_4) => _4.startChild, "call", (_5) => _5({
              description: typeof config === "string" ? config : config.text,
              op: "db",
              origin: "auto.db.postgres",
              data
            })]);
            if (typeof callback === "function") {
              return orig.call(this, config, values, function(err, result) {
                _optionalChain([span, "optionalAccess", (_6) => _6.finish, "call", (_7) => _7()]);
                callback(err, result);
              });
            }
            if (typeof values === "function") {
              return orig.call(this, config, function(err, result) {
                _optionalChain([span, "optionalAccess", (_8) => _8.finish, "call", (_9) => _9()]);
                values(err, result);
              });
            }
            const rv = typeof values !== "undefined" ? orig.call(this, config, values) : orig.call(this, config);
            if (utils.isThenable(rv)) {
              return rv.then((res) => {
                _optionalChain([span, "optionalAccess", (_10) => _10.finish, "call", (_11) => _11()]);
                return res;
              });
            }
            _optionalChain([span, "optionalAccess", (_12) => _12.finish, "call", (_13) => _13()]);
            return rv;
          };
        });
      }
    };
    Postgres.__initStatic();
    exports.Postgres = Postgres;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/mysql.js
var require_mysql = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/mysql.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    var Mysql = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Mysql";
      }
      /**
       * @inheritDoc
       */
      constructor() {
        this.name = Mysql.id;
      }
      /** @inheritdoc */
      loadDependency() {
        return this._module = this._module || utils.loadModule("mysql/lib/Connection.js");
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        if (nodeUtils.shouldDisableAutoInstrumentation(getCurrentHub2)) {
          debugBuild.DEBUG_BUILD && utils.logger.log("Mysql Integration is skipped because of instrumenter configuration.");
          return;
        }
        const pkg = this.loadDependency();
        if (!pkg) {
          debugBuild.DEBUG_BUILD && utils.logger.error("Mysql Integration was unable to require `mysql` package.");
          return;
        }
        let mySqlConfig = void 0;
        try {
          pkg.prototype.connect = new Proxy(pkg.prototype.connect, {
            apply(wrappingTarget, thisArg, args) {
              if (!mySqlConfig) {
                mySqlConfig = thisArg.config;
              }
              return wrappingTarget.apply(thisArg, args);
            }
          });
        } catch (e) {
          debugBuild.DEBUG_BUILD && utils.logger.error("Mysql Integration was unable to instrument `mysql` config.");
        }
        function spanDataFromConfig() {
          if (!mySqlConfig) {
            return {};
          }
          return {
            "server.address": mySqlConfig.host,
            "server.port": mySqlConfig.port,
            "db.user": mySqlConfig.user
          };
        }
        function finishSpan(span) {
          if (!span || span.endTimestamp) {
            return;
          }
          const data = spanDataFromConfig();
          Object.keys(data).forEach((key) => {
            span.setData(key, data[key]);
          });
          span.finish();
        }
        utils.fill(pkg, "createQuery", function(orig) {
          return function(options, values, callback) {
            const scope = getCurrentHub2().getScope();
            const parentSpan = scope.getSpan();
            const span = _optionalChain([parentSpan, "optionalAccess", (_2) => _2.startChild, "call", (_3) => _3({
              description: typeof options === "string" ? options : options.sql,
              op: "db",
              origin: "auto.db.mysql",
              data: {
                "db.system": "mysql"
              }
            })]);
            if (typeof callback === "function") {
              return orig.call(this, options, values, function(err, result, fields) {
                finishSpan(span);
                callback(err, result, fields);
              });
            }
            if (typeof values === "function") {
              return orig.call(this, options, function(err, result, fields) {
                finishSpan(span);
                values(err, result, fields);
              });
            }
            const query = orig.call(this, options, values);
            query.on("end", () => {
              finishSpan(span);
            });
            return query;
          };
        });
      }
    };
    Mysql.__initStatic();
    exports.Mysql = Mysql;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/mongo.js
var require_mongo = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/mongo.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    var OPERATIONS = [
      "aggregate",
      // aggregate(pipeline, options, callback)
      "bulkWrite",
      // bulkWrite(operations, options, callback)
      "countDocuments",
      // countDocuments(query, options, callback)
      "createIndex",
      // createIndex(fieldOrSpec, options, callback)
      "createIndexes",
      // createIndexes(indexSpecs, options, callback)
      "deleteMany",
      // deleteMany(filter, options, callback)
      "deleteOne",
      // deleteOne(filter, options, callback)
      "distinct",
      // distinct(key, query, options, callback)
      "drop",
      // drop(options, callback)
      "dropIndex",
      // dropIndex(indexName, options, callback)
      "dropIndexes",
      // dropIndexes(options, callback)
      "estimatedDocumentCount",
      // estimatedDocumentCount(options, callback)
      "find",
      // find(query, options, callback)
      "findOne",
      // findOne(query, options, callback)
      "findOneAndDelete",
      // findOneAndDelete(filter, options, callback)
      "findOneAndReplace",
      // findOneAndReplace(filter, replacement, options, callback)
      "findOneAndUpdate",
      // findOneAndUpdate(filter, update, options, callback)
      "indexes",
      // indexes(options, callback)
      "indexExists",
      // indexExists(indexes, options, callback)
      "indexInformation",
      // indexInformation(options, callback)
      "initializeOrderedBulkOp",
      // initializeOrderedBulkOp(options, callback)
      "insertMany",
      // insertMany(docs, options, callback)
      "insertOne",
      // insertOne(doc, options, callback)
      "isCapped",
      // isCapped(options, callback)
      "mapReduce",
      // mapReduce(map, reduce, options, callback)
      "options",
      // options(options, callback)
      "parallelCollectionScan",
      // parallelCollectionScan(options, callback)
      "rename",
      // rename(newName, options, callback)
      "replaceOne",
      // replaceOne(filter, doc, options, callback)
      "stats",
      // stats(options, callback)
      "updateMany",
      // updateMany(filter, update, options, callback)
      "updateOne"
      // updateOne(filter, update, options, callback)
    ];
    var OPERATION_SIGNATURES = {
      // aggregate intentionally not included because `pipeline` arguments are too complex to serialize well
      // see https://github.com/getsentry/sentry-javascript/pull/3102
      bulkWrite: ["operations"],
      countDocuments: ["query"],
      createIndex: ["fieldOrSpec"],
      createIndexes: ["indexSpecs"],
      deleteMany: ["filter"],
      deleteOne: ["filter"],
      distinct: ["key", "query"],
      dropIndex: ["indexName"],
      find: ["query"],
      findOne: ["query"],
      findOneAndDelete: ["filter"],
      findOneAndReplace: ["filter", "replacement"],
      findOneAndUpdate: ["filter", "update"],
      indexExists: ["indexes"],
      insertMany: ["docs"],
      insertOne: ["doc"],
      mapReduce: ["map", "reduce"],
      rename: ["newName"],
      replaceOne: ["filter", "doc"],
      updateMany: ["filter", "update"],
      updateOne: ["filter", "update"]
    };
    function isCursor(maybeCursor) {
      return maybeCursor && typeof maybeCursor === "object" && maybeCursor.once && typeof maybeCursor.once === "function";
    }
    var Mongo = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Mongo";
      }
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this.name = Mongo.id;
        this._operations = Array.isArray(options.operations) ? options.operations : OPERATIONS;
        this._describeOperations = "describeOperations" in options ? options.describeOperations : true;
        this._useMongoose = !!options.useMongoose;
      }
      /** @inheritdoc */
      loadDependency() {
        const moduleName = this._useMongoose ? "mongoose" : "mongodb";
        return this._module = this._module || utils.loadModule(moduleName);
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        if (nodeUtils.shouldDisableAutoInstrumentation(getCurrentHub2)) {
          debugBuild.DEBUG_BUILD && utils.logger.log("Mongo Integration is skipped because of instrumenter configuration.");
          return;
        }
        const pkg = this.loadDependency();
        if (!pkg) {
          const moduleName = this._useMongoose ? "mongoose" : "mongodb";
          debugBuild.DEBUG_BUILD && utils.logger.error(`Mongo Integration was unable to require \`${moduleName}\` package.`);
          return;
        }
        this._instrumentOperations(pkg.Collection, this._operations, getCurrentHub2);
      }
      /**
       * Patches original collection methods
       */
      _instrumentOperations(collection, operations, getCurrentHub2) {
        operations.forEach((operation) => this._patchOperation(collection, operation, getCurrentHub2));
      }
      /**
       * Patches original collection to utilize our tracing functionality
       */
      _patchOperation(collection, operation, getCurrentHub2) {
        if (!(operation in collection.prototype))
          return;
        const getSpanContext = this._getSpanContextFromOperationArguments.bind(this);
        utils.fill(collection.prototype, operation, function(orig) {
          return function(...args) {
            const lastArg = args[args.length - 1];
            const scope = getCurrentHub2().getScope();
            const parentSpan = scope.getSpan();
            if (typeof lastArg !== "function" || operation === "mapReduce" && args.length === 2) {
              const span2 = _optionalChain([parentSpan, "optionalAccess", (_2) => _2.startChild, "call", (_3) => _3(getSpanContext(this, operation, args))]);
              const maybePromiseOrCursor = orig.call(this, ...args);
              if (utils.isThenable(maybePromiseOrCursor)) {
                return maybePromiseOrCursor.then((res) => {
                  _optionalChain([span2, "optionalAccess", (_4) => _4.finish, "call", (_5) => _5()]);
                  return res;
                });
              } else if (isCursor(maybePromiseOrCursor)) {
                const cursor = maybePromiseOrCursor;
                try {
                  cursor.once("close", () => {
                    _optionalChain([span2, "optionalAccess", (_6) => _6.finish, "call", (_7) => _7()]);
                  });
                } catch (e) {
                  _optionalChain([span2, "optionalAccess", (_8) => _8.finish, "call", (_9) => _9()]);
                }
                return cursor;
              } else {
                _optionalChain([span2, "optionalAccess", (_10) => _10.finish, "call", (_11) => _11()]);
                return maybePromiseOrCursor;
              }
            }
            const span = _optionalChain([parentSpan, "optionalAccess", (_12) => _12.startChild, "call", (_13) => _13(getSpanContext(this, operation, args.slice(0, -1)))]);
            return orig.call(this, ...args.slice(0, -1), function(err, result) {
              _optionalChain([span, "optionalAccess", (_14) => _14.finish, "call", (_15) => _15()]);
              lastArg(err, result);
            });
          };
        });
      }
      /**
       * Form a SpanContext based on the user input to a given operation.
       */
      _getSpanContextFromOperationArguments(collection, operation, args) {
        const data = {
          "db.system": "mongodb",
          "db.name": collection.dbName,
          "db.operation": operation,
          "db.mongodb.collection": collection.collectionName
        };
        const spanContext = {
          op: "db",
          // TODO v8: Use `${collection.collectionName}.${operation}`
          origin: "auto.db.mongo",
          description: operation,
          data
        };
        const signature = OPERATION_SIGNATURES[operation];
        const shouldDescribe = Array.isArray(this._describeOperations) ? this._describeOperations.includes(operation) : this._describeOperations;
        if (!signature || !shouldDescribe) {
          return spanContext;
        }
        try {
          if (operation === "mapReduce") {
            const [map, reduce] = args;
            data[signature[0]] = typeof map === "string" ? map : map.name || "<anonymous>";
            data[signature[1]] = typeof reduce === "string" ? reduce : reduce.name || "<anonymous>";
          } else {
            for (let i = 0; i < signature.length; i++) {
              data[`db.mongodb.${signature[i]}`] = JSON.stringify(args[i]);
            }
          }
        } catch (_oO) {
        }
        return spanContext;
      }
    };
    Mongo.__initStatic();
    exports.Mongo = Mongo;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/prisma.js
var require_prisma = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/prisma.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    function isValidPrismaClient(possibleClient) {
      return !!possibleClient && !!possibleClient["$use"];
    }
    var Prisma = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Prisma";
      }
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        this.name = Prisma.id;
        if (isValidPrismaClient(options.client) && !options.client._sentryInstrumented) {
          utils.addNonEnumerableProperty(options.client, "_sentryInstrumented", true);
          const clientData = {};
          try {
            const engineConfig = options.client._engineConfig;
            if (engineConfig) {
              const { activeProvider, clientVersion } = engineConfig;
              if (activeProvider) {
                clientData["db.system"] = activeProvider;
              }
              if (clientVersion) {
                clientData["db.prisma.version"] = clientVersion;
              }
            }
          } catch (e) {
          }
          options.client.$use((params, next) => {
            if (nodeUtils.shouldDisableAutoInstrumentation(core.getCurrentHub)) {
              return next(params);
            }
            const action = params.action;
            const model = params.model;
            return core.trace(
              {
                name: model ? `${model} ${action}` : action,
                op: "db.prisma",
                origin: "auto.db.prisma",
                data: { ...clientData, "db.operation": action }
              },
              () => next(params)
            );
          });
        } else {
          debugBuild.DEBUG_BUILD && utils.logger.warn("Unsupported Prisma client provided to PrismaIntegration. Provided client:", options.client);
        }
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
      }
    };
    Prisma.__initStatic();
    exports.Prisma = Prisma;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/graphql.js
var require_graphql = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/graphql.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    var GraphQL = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "GraphQL";
      }
      /**
       * @inheritDoc
       */
      constructor() {
        this.name = GraphQL.id;
      }
      /** @inheritdoc */
      loadDependency() {
        return this._module = this._module || utils.loadModule("graphql/execution/execute.js");
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        if (nodeUtils.shouldDisableAutoInstrumentation(getCurrentHub2)) {
          debugBuild.DEBUG_BUILD && utils.logger.log("GraphQL Integration is skipped because of instrumenter configuration.");
          return;
        }
        const pkg = this.loadDependency();
        if (!pkg) {
          debugBuild.DEBUG_BUILD && utils.logger.error("GraphQL Integration was unable to require graphql/execution package.");
          return;
        }
        utils.fill(pkg, "execute", function(orig) {
          return function(...args) {
            const scope = getCurrentHub2().getScope();
            const parentSpan = scope.getSpan();
            const span = _optionalChain([parentSpan, "optionalAccess", (_2) => _2.startChild, "call", (_3) => _3({
              description: "execute",
              op: "graphql.execute",
              origin: "auto.graphql.graphql"
            })]);
            _optionalChain([scope, "optionalAccess", (_4) => _4.setSpan, "call", (_5) => _5(span)]);
            const rv = orig.call(this, ...args);
            if (utils.isThenable(rv)) {
              return rv.then((res) => {
                _optionalChain([span, "optionalAccess", (_6) => _6.finish, "call", (_7) => _7()]);
                _optionalChain([scope, "optionalAccess", (_8) => _8.setSpan, "call", (_9) => _9(parentSpan)]);
                return res;
              });
            }
            _optionalChain([span, "optionalAccess", (_10) => _10.finish, "call", (_11) => _11()]);
            _optionalChain([scope, "optionalAccess", (_12) => _12.setSpan, "call", (_13) => _13(parentSpan)]);
            return rv;
          };
        });
      }
    };
    GraphQL.__initStatic();
    exports.GraphQL = GraphQL;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/apollo.js
var require_apollo = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/apollo.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var nodeUtils = require_node_utils();
    var Apollo = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Apollo";
      }
      /**
       * @inheritDoc
       */
      /**
       * @inheritDoc
       */
      constructor(options = {
        useNestjs: false
      }) {
        this.name = Apollo.id;
        this._useNest = !!options.useNestjs;
      }
      /** @inheritdoc */
      loadDependency() {
        if (this._useNest) {
          this._module = this._module || utils.loadModule("@nestjs/graphql");
        } else {
          this._module = this._module || utils.loadModule("apollo-server-core");
        }
        return this._module;
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        if (nodeUtils.shouldDisableAutoInstrumentation(getCurrentHub2)) {
          debugBuild.DEBUG_BUILD && utils.logger.log("Apollo Integration is skipped because of instrumenter configuration.");
          return;
        }
        if (this._useNest) {
          const pkg = this.loadDependency();
          if (!pkg) {
            debugBuild.DEBUG_BUILD && utils.logger.error("Apollo-NestJS Integration was unable to require @nestjs/graphql package.");
            return;
          }
          utils.fill(
            pkg.GraphQLFactory.prototype,
            "mergeWithSchema",
            function(orig) {
              return function(...args) {
                utils.fill(this.resolversExplorerService, "explore", function(orig2) {
                  return function() {
                    const resolvers = utils.arrayify(orig2.call(this));
                    const instrumentedResolvers = instrumentResolvers(resolvers, getCurrentHub2);
                    return instrumentedResolvers;
                  };
                });
                return orig.call(this, ...args);
              };
            }
          );
        } else {
          const pkg = this.loadDependency();
          if (!pkg) {
            debugBuild.DEBUG_BUILD && utils.logger.error("Apollo Integration was unable to require apollo-server-core package.");
            return;
          }
          utils.fill(pkg.ApolloServerBase.prototype, "constructSchema", function(orig) {
            return function() {
              if (!this.config.resolvers) {
                if (debugBuild.DEBUG_BUILD) {
                  if (this.config.schema) {
                    utils.logger.warn(
                      "Apollo integration is not able to trace `ApolloServer` instances constructed via `schema` property.If you are using NestJS with Apollo, please use `Sentry.Integrations.Apollo({ useNestjs: true })` instead."
                    );
                    utils.logger.warn();
                  } else if (this.config.modules) {
                    utils.logger.warn(
                      "Apollo integration is not able to trace `ApolloServer` instances constructed via `modules` property."
                    );
                  }
                  utils.logger.error("Skipping tracing as no resolvers found on the `ApolloServer` instance.");
                }
                return orig.call(this);
              }
              const resolvers = utils.arrayify(this.config.resolvers);
              this.config.resolvers = instrumentResolvers(resolvers, getCurrentHub2);
              return orig.call(this);
            };
          });
        }
      }
    };
    Apollo.__initStatic();
    function instrumentResolvers(resolvers, getCurrentHub2) {
      return resolvers.map((model) => {
        Object.keys(model).forEach((resolverGroupName) => {
          Object.keys(model[resolverGroupName]).forEach((resolverName) => {
            if (typeof model[resolverGroupName][resolverName] !== "function") {
              return;
            }
            wrapResolver(model, resolverGroupName, resolverName, getCurrentHub2);
          });
        });
        return model;
      });
    }
    function wrapResolver(model, resolverGroupName, resolverName, getCurrentHub2) {
      utils.fill(model[resolverGroupName], resolverName, function(orig) {
        return function(...args) {
          const scope = getCurrentHub2().getScope();
          const parentSpan = scope.getSpan();
          const span = _optionalChain([parentSpan, "optionalAccess", (_2) => _2.startChild, "call", (_3) => _3({
            description: `${resolverGroupName}.${resolverName}`,
            op: "graphql.resolve",
            origin: "auto.graphql.apollo"
          })]);
          const rv = orig.call(this, ...args);
          if (utils.isThenable(rv)) {
            return rv.then((res) => {
              _optionalChain([span, "optionalAccess", (_4) => _4.finish, "call", (_5) => _5()]);
              return res;
            });
          }
          _optionalChain([span, "optionalAccess", (_6) => _6.finish, "call", (_7) => _7()]);
          return rv;
        };
      });
    }
    exports.Apollo = Apollo;
  }
});

// node_modules/@sentry-internal/tracing/cjs/node/integrations/lazy.js
var require_lazy = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/node/integrations/lazy.js"(exports, module2) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var lazyLoadedNodePerformanceMonitoringIntegrations = [
      () => {
        const integration = utils.dynamicRequire(module2, "./apollo");
        return new integration.Apollo();
      },
      () => {
        const integration = utils.dynamicRequire(module2, "./apollo");
        return new integration.Apollo({ useNestjs: true });
      },
      () => {
        const integration = utils.dynamicRequire(module2, "./graphql");
        return new integration.GraphQL();
      },
      () => {
        const integration = utils.dynamicRequire(module2, "./mongo");
        return new integration.Mongo();
      },
      () => {
        const integration = utils.dynamicRequire(module2, "./mongo");
        return new integration.Mongo({ mongoose: true });
      },
      () => {
        const integration = utils.dynamicRequire(module2, "./mysql");
        return new integration.Mysql();
      },
      () => {
        const integration = utils.dynamicRequire(module2, "./postgres");
        return new integration.Postgres();
      }
    ];
    exports.lazyLoadedNodePerformanceMonitoringIntegrations = lazyLoadedNodePerformanceMonitoringIntegrations;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/types.js
var require_types = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/types.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var WINDOW = utils.GLOBAL_OBJ;
    exports.WINDOW = WINDOW;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/backgroundtab.js
var require_backgroundtab = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/backgroundtab.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var types = require_types();
    function registerBackgroundTabDetection() {
      if (types.WINDOW && types.WINDOW.document) {
        types.WINDOW.document.addEventListener("visibilitychange", () => {
          const activeTransaction = core.getActiveTransaction();
          if (types.WINDOW.document.hidden && activeTransaction) {
            const statusType = "cancelled";
            debugBuild.DEBUG_BUILD && utils.logger.log(
              `[Tracing] Transaction: ${statusType} -> since tab moved to the background, op: ${activeTransaction.op}`
            );
            if (!activeTransaction.status) {
              activeTransaction.setStatus(statusType);
            }
            activeTransaction.setTag("visibilitychange", "document.hidden");
            activeTransaction.finish();
          }
        });
      } else {
        debugBuild.DEBUG_BUILD && utils.logger.warn("[Tracing] Could not set up background tab detection due to lack of global document");
      }
    }
    exports.registerBackgroundTabDetection = registerBackgroundTabDetection;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/bindReporter.js
var require_bindReporter = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/bindReporter.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var bindReporter = (callback, metric, reportAllChanges) => {
      let prevValue;
      let delta;
      return (forceReport) => {
        if (metric.value >= 0) {
          if (forceReport || reportAllChanges) {
            delta = metric.value - (prevValue || 0);
            if (delta || prevValue === void 0) {
              prevValue = metric.value;
              metric.delta = delta;
              callback(metric);
            }
          }
        }
      };
    };
    exports.bindReporter = bindReporter;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/generateUniqueID.js
var require_generateUniqueID = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/generateUniqueID.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var generateUniqueID = () => {
      return `v3-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`;
    };
    exports.generateUniqueID = generateUniqueID;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/getNavigationEntry.js
var require_getNavigationEntry = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/getNavigationEntry.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var types = require_types();
    var getNavigationEntryFromPerformanceTiming = () => {
      const timing = types.WINDOW.performance.timing;
      const type2 = types.WINDOW.performance.navigation.type;
      const navigationEntry = {
        entryType: "navigation",
        startTime: 0,
        type: type2 == 2 ? "back_forward" : type2 === 1 ? "reload" : "navigate"
      };
      for (const key in timing) {
        if (key !== "navigationStart" && key !== "toJSON") {
          navigationEntry[key] = Math.max(timing[key] - timing.navigationStart, 0);
        }
      }
      return navigationEntry;
    };
    var getNavigationEntry = () => {
      if (types.WINDOW.__WEB_VITALS_POLYFILL__) {
        return types.WINDOW.performance && (performance.getEntriesByType && performance.getEntriesByType("navigation")[0] || getNavigationEntryFromPerformanceTiming());
      } else {
        return types.WINDOW.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      }
    };
    exports.getNavigationEntry = getNavigationEntry;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/getActivationStart.js
var require_getActivationStart = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/getActivationStart.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var getNavigationEntry = require_getNavigationEntry();
    var getActivationStart = () => {
      const navEntry = getNavigationEntry.getNavigationEntry();
      return navEntry && navEntry.activationStart || 0;
    };
    exports.getActivationStart = getActivationStart;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/initMetric.js
var require_initMetric = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/initMetric.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var types = require_types();
    var generateUniqueID = require_generateUniqueID();
    var getActivationStart = require_getActivationStart();
    var getNavigationEntry = require_getNavigationEntry();
    var initMetric = (name, value) => {
      const navEntry = getNavigationEntry.getNavigationEntry();
      let navigationType = "navigate";
      if (navEntry) {
        if (types.WINDOW.document.prerendering || getActivationStart.getActivationStart() > 0) {
          navigationType = "prerender";
        } else {
          navigationType = navEntry.type.replace(/_/g, "-");
        }
      }
      return {
        name,
        value: typeof value === "undefined" ? -1 : value,
        rating: "good",
        // Will be updated if the value changes.
        delta: 0,
        entries: [],
        id: generateUniqueID.generateUniqueID(),
        navigationType
      };
    };
    exports.initMetric = initMetric;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/observe.js
var require_observe = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/observe.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var observe = (type2, callback, opts) => {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(type2)) {
          const po = new PerformanceObserver((list) => {
            callback(list.getEntries());
          });
          po.observe(
            Object.assign(
              {
                type: type2,
                buffered: true
              },
              opts || {}
            )
          );
          return po;
        }
      } catch (e) {
      }
      return;
    };
    exports.observe = observe;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/onHidden.js
var require_onHidden = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/onHidden.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var types = require_types();
    var onHidden = (cb, once) => {
      const onHiddenOrPageHide = (event) => {
        if (event.type === "pagehide" || types.WINDOW.document.visibilityState === "hidden") {
          cb(event);
          if (once) {
            removeEventListener("visibilitychange", onHiddenOrPageHide, true);
            removeEventListener("pagehide", onHiddenOrPageHide, true);
          }
        }
      };
      addEventListener("visibilitychange", onHiddenOrPageHide, true);
      addEventListener("pagehide", onHiddenOrPageHide, true);
    };
    exports.onHidden = onHidden;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/getCLS.js
var require_getCLS = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/getCLS.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var bindReporter = require_bindReporter();
    var initMetric = require_initMetric();
    var observe = require_observe();
    var onHidden = require_onHidden();
    var onCLS = (onReport) => {
      const metric = initMetric.initMetric("CLS", 0);
      let report;
      let sessionValue = 0;
      let sessionEntries = [];
      const handleEntries = (entries) => {
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            if (sessionValue && sessionEntries.length !== 0 && entry.startTime - lastSessionEntry.startTime < 1e3 && entry.startTime - firstSessionEntry.startTime < 5e3) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }
            if (sessionValue > metric.value) {
              metric.value = sessionValue;
              metric.entries = sessionEntries;
              if (report) {
                report();
              }
            }
          }
        });
      };
      const po = observe.observe("layout-shift", handleEntries);
      if (po) {
        report = bindReporter.bindReporter(onReport, metric);
        const stopListening = () => {
          handleEntries(po.takeRecords());
          report(true);
        };
        onHidden.onHidden(stopListening);
        return stopListening;
      }
      return;
    };
    exports.onCLS = onCLS;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/getVisibilityWatcher.js
var require_getVisibilityWatcher = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/lib/getVisibilityWatcher.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var types = require_types();
    var onHidden = require_onHidden();
    var firstHiddenTime = -1;
    var initHiddenTime = () => {
      return types.WINDOW.document.visibilityState === "hidden" && !types.WINDOW.document.prerendering ? 0 : Infinity;
    };
    var trackChanges = () => {
      onHidden.onHidden(({ timeStamp }) => {
        firstHiddenTime = timeStamp;
      }, true);
    };
    var getVisibilityWatcher = () => {
      if (firstHiddenTime < 0) {
        firstHiddenTime = initHiddenTime();
        trackChanges();
      }
      return {
        get firstHiddenTime() {
          return firstHiddenTime;
        }
      };
    };
    exports.getVisibilityWatcher = getVisibilityWatcher;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/getFID.js
var require_getFID = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/getFID.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var bindReporter = require_bindReporter();
    var getVisibilityWatcher = require_getVisibilityWatcher();
    var initMetric = require_initMetric();
    var observe = require_observe();
    var onHidden = require_onHidden();
    var onFID = (onReport) => {
      const visibilityWatcher = getVisibilityWatcher.getVisibilityWatcher();
      const metric = initMetric.initMetric("FID");
      let report;
      const handleEntry = (entry) => {
        if (entry.startTime < visibilityWatcher.firstHiddenTime) {
          metric.value = entry.processingStart - entry.startTime;
          metric.entries.push(entry);
          report(true);
        }
      };
      const handleEntries = (entries) => {
        entries.forEach(handleEntry);
      };
      const po = observe.observe("first-input", handleEntries);
      report = bindReporter.bindReporter(onReport, metric);
      if (po) {
        onHidden.onHidden(() => {
          handleEntries(po.takeRecords());
          po.disconnect();
        }, true);
      }
    };
    exports.onFID = onFID;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/getLCP.js
var require_getLCP = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/web-vitals/getLCP.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var bindReporter = require_bindReporter();
    var getActivationStart = require_getActivationStart();
    var getVisibilityWatcher = require_getVisibilityWatcher();
    var initMetric = require_initMetric();
    var observe = require_observe();
    var onHidden = require_onHidden();
    var reportedMetricIDs = {};
    var onLCP = (onReport) => {
      const visibilityWatcher = getVisibilityWatcher.getVisibilityWatcher();
      const metric = initMetric.initMetric("LCP");
      let report;
      const handleEntries = (entries) => {
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          const value = Math.max(lastEntry.startTime - getActivationStart.getActivationStart(), 0);
          if (value < visibilityWatcher.firstHiddenTime) {
            metric.value = value;
            metric.entries = [lastEntry];
            report();
          }
        }
      };
      const po = observe.observe("largest-contentful-paint", handleEntries);
      if (po) {
        report = bindReporter.bindReporter(onReport, metric);
        const stopListening = () => {
          if (!reportedMetricIDs[metric.id]) {
            handleEntries(po.takeRecords());
            po.disconnect();
            reportedMetricIDs[metric.id] = true;
            report(true);
          }
        };
        ["keydown", "click"].forEach((type2) => {
          addEventListener(type2, stopListening, { once: true, capture: true });
        });
        onHidden.onHidden(stopListening, true);
        return stopListening;
      }
      return;
    };
    exports.onLCP = onLCP;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/instrument.js
var require_instrument2 = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/instrument.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var getCLS = require_getCLS();
    var getFID = require_getFID();
    var getLCP = require_getLCP();
    var observe = require_observe();
    var handlers = {};
    var instrumented = {};
    var _previousCls;
    var _previousFid;
    var _previousLcp;
    function addClsInstrumentationHandler(callback) {
      return addMetricObserver("cls", callback, instrumentCls, _previousCls);
    }
    function addLcpInstrumentationHandler(callback) {
      return addMetricObserver("lcp", callback, instrumentLcp, _previousLcp);
    }
    function addFidInstrumentationHandler(callback) {
      return addMetricObserver("fid", callback, instrumentFid, _previousFid);
    }
    function addPerformanceInstrumentationHandler(type2, callback) {
      addHandler(type2, callback);
      if (!instrumented[type2]) {
        instrumentPerformanceObserver(type2);
        instrumented[type2] = true;
      }
      return getCleanupCallback(type2, callback);
    }
    function triggerHandlers(type2, data) {
      const typeHandlers = handlers[type2];
      if (!typeHandlers || !typeHandlers.length) {
        return;
      }
      for (const handler of typeHandlers) {
        try {
          handler(data);
        } catch (e) {
          debugBuild.DEBUG_BUILD && utils.logger.error(
            `Error while triggering instrumentation handler.
Type: ${type2}
Name: ${utils.getFunctionName(handler)}
Error:`,
            e
          );
        }
      }
    }
    function instrumentCls() {
      getCLS.onCLS((metric) => {
        triggerHandlers("cls", {
          metric
        });
        _previousCls = metric;
      });
    }
    function instrumentFid() {
      getFID.onFID((metric) => {
        triggerHandlers("fid", {
          metric
        });
        _previousFid = metric;
      });
    }
    function instrumentLcp() {
      getLCP.onLCP((metric) => {
        triggerHandlers("lcp", {
          metric
        });
        _previousLcp = metric;
      });
    }
    function addMetricObserver(type2, callback, instrumentFn, previousValue) {
      addHandler(type2, callback);
      if (!instrumented[type2]) {
        instrumentFn();
        instrumented[type2] = true;
      }
      if (previousValue) {
        callback({ metric: previousValue });
      }
      return getCleanupCallback(type2, callback);
    }
    function instrumentPerformanceObserver(type2) {
      const options = {};
      if (type2 === "event") {
        options.durationThreshold = 0;
      }
      observe.observe(
        type2,
        (entries) => {
          triggerHandlers(type2, { entries });
        },
        options
      );
    }
    function addHandler(type2, handler) {
      handlers[type2] = handlers[type2] || [];
      handlers[type2].push(handler);
    }
    function getCleanupCallback(type2, callback) {
      return () => {
        const typeHandlers = handlers[type2];
        if (!typeHandlers) {
          return;
        }
        const index = typeHandlers.indexOf(callback);
        if (index !== -1) {
          typeHandlers.splice(index, 1);
        }
      };
    }
    exports.addClsInstrumentationHandler = addClsInstrumentationHandler;
    exports.addFidInstrumentationHandler = addFidInstrumentationHandler;
    exports.addLcpInstrumentationHandler = addLcpInstrumentationHandler;
    exports.addPerformanceInstrumentationHandler = addPerformanceInstrumentationHandler;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/metrics/utils.js
var require_utils2 = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/metrics/utils.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function isMeasurementValue(value) {
      return typeof value === "number" && isFinite(value);
    }
    function _startChild(transaction, { startTimestamp, ...ctx }) {
      if (startTimestamp && transaction.startTimestamp > startTimestamp) {
        transaction.startTimestamp = startTimestamp;
      }
      return transaction.startChild({
        startTimestamp,
        ...ctx
      });
    }
    exports._startChild = _startChild;
    exports.isMeasurementValue = isMeasurementValue;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/metrics/index.js
var require_metrics = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/metrics/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var instrument = require_instrument2();
    var types = require_types();
    var getVisibilityWatcher = require_getVisibilityWatcher();
    var utils$1 = require_utils2();
    var MAX_INT_AS_BYTES = 2147483647;
    function msToSec(time) {
      return time / 1e3;
    }
    function getBrowserPerformanceAPI() {
      return types.WINDOW && types.WINDOW.addEventListener && types.WINDOW.performance;
    }
    var _performanceCursor = 0;
    var _measurements = {};
    var _lcpEntry;
    var _clsEntry;
    function startTrackingWebVitals() {
      const performance2 = getBrowserPerformanceAPI();
      if (performance2 && utils.browserPerformanceTimeOrigin) {
        if (performance2.mark) {
          types.WINDOW.performance.mark("sentry-tracing-init");
        }
        const fidCallback = _trackFID();
        const clsCallback = _trackCLS();
        const lcpCallback = _trackLCP();
        return () => {
          fidCallback();
          clsCallback();
          lcpCallback();
        };
      }
      return () => void 0;
    }
    function startTrackingLongTasks() {
      instrument.addPerformanceInstrumentationHandler("longtask", ({ entries }) => {
        for (const entry of entries) {
          const transaction = core.getActiveTransaction();
          if (!transaction) {
            return;
          }
          const startTime = msToSec(utils.browserPerformanceTimeOrigin + entry.startTime);
          const duration = msToSec(entry.duration);
          transaction.startChild({
            description: "Main UI thread blocked",
            op: "ui.long-task",
            origin: "auto.ui.browser.metrics",
            startTimestamp: startTime,
            endTimestamp: startTime + duration
          });
        }
      });
    }
    function startTrackingInteractions() {
      instrument.addPerformanceInstrumentationHandler("event", ({ entries }) => {
        for (const entry of entries) {
          const transaction = core.getActiveTransaction();
          if (!transaction) {
            return;
          }
          if (entry.name === "click") {
            const startTime = msToSec(utils.browserPerformanceTimeOrigin + entry.startTime);
            const duration = msToSec(entry.duration);
            transaction.startChild({
              description: utils.htmlTreeAsString(entry.target),
              op: `ui.interaction.${entry.name}`,
              origin: "auto.ui.browser.metrics",
              startTimestamp: startTime,
              endTimestamp: startTime + duration
            });
          }
        }
      });
    }
    function _trackCLS() {
      return instrument.addClsInstrumentationHandler(({ metric }) => {
        const entry = metric.entries.pop();
        if (!entry) {
          return;
        }
        debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding CLS");
        _measurements["cls"] = { value: metric.value, unit: "" };
        _clsEntry = entry;
      });
    }
    function _trackLCP() {
      return instrument.addLcpInstrumentationHandler(({ metric }) => {
        const entry = metric.entries.pop();
        if (!entry) {
          return;
        }
        debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding LCP");
        _measurements["lcp"] = { value: metric.value, unit: "millisecond" };
        _lcpEntry = entry;
      });
    }
    function _trackFID() {
      return instrument.addFidInstrumentationHandler(({ metric }) => {
        const entry = metric.entries.pop();
        if (!entry) {
          return;
        }
        const timeOrigin = msToSec(utils.browserPerformanceTimeOrigin);
        const startTime = msToSec(entry.startTime);
        debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding FID");
        _measurements["fid"] = { value: metric.value, unit: "millisecond" };
        _measurements["mark.fid"] = { value: timeOrigin + startTime, unit: "second" };
      });
    }
    function addPerformanceEntries(transaction) {
      const performance2 = getBrowserPerformanceAPI();
      if (!performance2 || !types.WINDOW.performance.getEntries || !utils.browserPerformanceTimeOrigin) {
        return;
      }
      debugBuild.DEBUG_BUILD && utils.logger.log("[Tracing] Adding & adjusting spans using Performance API");
      const timeOrigin = msToSec(utils.browserPerformanceTimeOrigin);
      const performanceEntries = performance2.getEntries();
      let responseStartTimestamp;
      let requestStartTimestamp;
      performanceEntries.slice(_performanceCursor).forEach((entry) => {
        const startTime = msToSec(entry.startTime);
        const duration = msToSec(entry.duration);
        if (transaction.op === "navigation" && timeOrigin + startTime < transaction.startTimestamp) {
          return;
        }
        switch (entry.entryType) {
          case "navigation": {
            _addNavigationSpans(transaction, entry, timeOrigin);
            responseStartTimestamp = timeOrigin + msToSec(entry.responseStart);
            requestStartTimestamp = timeOrigin + msToSec(entry.requestStart);
            break;
          }
          case "mark":
          case "paint":
          case "measure": {
            _addMeasureSpans(transaction, entry, startTime, duration, timeOrigin);
            const firstHidden = getVisibilityWatcher.getVisibilityWatcher();
            const shouldRecord = entry.startTime < firstHidden.firstHiddenTime;
            if (entry.name === "first-paint" && shouldRecord) {
              debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding FP");
              _measurements["fp"] = { value: entry.startTime, unit: "millisecond" };
            }
            if (entry.name === "first-contentful-paint" && shouldRecord) {
              debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding FCP");
              _measurements["fcp"] = { value: entry.startTime, unit: "millisecond" };
            }
            break;
          }
          case "resource": {
            const resourceName = entry.name.replace(types.WINDOW.location.origin, "");
            _addResourceSpans(transaction, entry, resourceName, startTime, duration, timeOrigin);
            break;
          }
        }
      });
      _performanceCursor = Math.max(performanceEntries.length - 1, 0);
      _trackNavigator(transaction);
      if (transaction.op === "pageload") {
        if (typeof responseStartTimestamp === "number") {
          debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding TTFB");
          _measurements["ttfb"] = {
            value: (responseStartTimestamp - transaction.startTimestamp) * 1e3,
            unit: "millisecond"
          };
          if (typeof requestStartTimestamp === "number" && requestStartTimestamp <= responseStartTimestamp) {
            _measurements["ttfb.requestTime"] = {
              value: (responseStartTimestamp - requestStartTimestamp) * 1e3,
              unit: "millisecond"
            };
          }
        }
        ["fcp", "fp", "lcp"].forEach((name) => {
          if (!_measurements[name] || timeOrigin >= transaction.startTimestamp) {
            return;
          }
          const oldValue = _measurements[name].value;
          const measurementTimestamp = timeOrigin + msToSec(oldValue);
          const normalizedValue = Math.abs((measurementTimestamp - transaction.startTimestamp) * 1e3);
          const delta = normalizedValue - oldValue;
          debugBuild.DEBUG_BUILD && utils.logger.log(`[Measurements] Normalized ${name} from ${oldValue} to ${normalizedValue} (${delta})`);
          _measurements[name].value = normalizedValue;
        });
        const fidMark = _measurements["mark.fid"];
        if (fidMark && _measurements["fid"]) {
          utils$1._startChild(transaction, {
            description: "first input delay",
            endTimestamp: fidMark.value + msToSec(_measurements["fid"].value),
            op: "ui.action",
            origin: "auto.ui.browser.metrics",
            startTimestamp: fidMark.value
          });
          delete _measurements["mark.fid"];
        }
        if (!("fcp" in _measurements)) {
          delete _measurements.cls;
        }
        Object.keys(_measurements).forEach((measurementName) => {
          transaction.setMeasurement(
            measurementName,
            _measurements[measurementName].value,
            _measurements[measurementName].unit
          );
        });
        _tagMetricInfo(transaction);
      }
      _lcpEntry = void 0;
      _clsEntry = void 0;
      _measurements = {};
    }
    function _addMeasureSpans(transaction, entry, startTime, duration, timeOrigin) {
      const measureStartTimestamp = timeOrigin + startTime;
      const measureEndTimestamp = measureStartTimestamp + duration;
      utils$1._startChild(transaction, {
        description: entry.name,
        endTimestamp: measureEndTimestamp,
        op: entry.entryType,
        origin: "auto.resource.browser.metrics",
        startTimestamp: measureStartTimestamp
      });
      return measureStartTimestamp;
    }
    function _addNavigationSpans(transaction, entry, timeOrigin) {
      ["unloadEvent", "redirect", "domContentLoadedEvent", "loadEvent", "connect"].forEach((event) => {
        _addPerformanceNavigationTiming(transaction, entry, event, timeOrigin);
      });
      _addPerformanceNavigationTiming(transaction, entry, "secureConnection", timeOrigin, "TLS/SSL", "connectEnd");
      _addPerformanceNavigationTiming(transaction, entry, "fetch", timeOrigin, "cache", "domainLookupStart");
      _addPerformanceNavigationTiming(transaction, entry, "domainLookup", timeOrigin, "DNS");
      _addRequest(transaction, entry, timeOrigin);
    }
    function _addPerformanceNavigationTiming(transaction, entry, event, timeOrigin, description, eventEnd) {
      const end = eventEnd ? entry[eventEnd] : entry[`${event}End`];
      const start = entry[`${event}Start`];
      if (!start || !end) {
        return;
      }
      utils$1._startChild(transaction, {
        op: "browser",
        origin: "auto.browser.browser.metrics",
        description: description || event,
        startTimestamp: timeOrigin + msToSec(start),
        endTimestamp: timeOrigin + msToSec(end)
      });
    }
    function _addRequest(transaction, entry, timeOrigin) {
      utils$1._startChild(transaction, {
        op: "browser",
        origin: "auto.browser.browser.metrics",
        description: "request",
        startTimestamp: timeOrigin + msToSec(entry.requestStart),
        endTimestamp: timeOrigin + msToSec(entry.responseEnd)
      });
      utils$1._startChild(transaction, {
        op: "browser",
        origin: "auto.browser.browser.metrics",
        description: "response",
        startTimestamp: timeOrigin + msToSec(entry.responseStart),
        endTimestamp: timeOrigin + msToSec(entry.responseEnd)
      });
    }
    function _addResourceSpans(transaction, entry, resourceName, startTime, duration, timeOrigin) {
      if (entry.initiatorType === "xmlhttprequest" || entry.initiatorType === "fetch") {
        return;
      }
      const data = {};
      setResourceEntrySizeData(data, entry, "transferSize", "http.response_transfer_size");
      setResourceEntrySizeData(data, entry, "encodedBodySize", "http.response_content_length");
      setResourceEntrySizeData(data, entry, "decodedBodySize", "http.decoded_response_content_length");
      if ("renderBlockingStatus" in entry) {
        data["resource.render_blocking_status"] = entry.renderBlockingStatus;
      }
      const startTimestamp = timeOrigin + startTime;
      const endTimestamp = startTimestamp + duration;
      utils$1._startChild(transaction, {
        description: resourceName,
        endTimestamp,
        op: entry.initiatorType ? `resource.${entry.initiatorType}` : "resource.other",
        origin: "auto.resource.browser.metrics",
        startTimestamp,
        data
      });
    }
    function _trackNavigator(transaction) {
      const navigator2 = types.WINDOW.navigator;
      if (!navigator2) {
        return;
      }
      const connection = navigator2.connection;
      if (connection) {
        if (connection.effectiveType) {
          transaction.setTag("effectiveConnectionType", connection.effectiveType);
        }
        if (connection.type) {
          transaction.setTag("connectionType", connection.type);
        }
        if (utils$1.isMeasurementValue(connection.rtt)) {
          _measurements["connection.rtt"] = { value: connection.rtt, unit: "millisecond" };
        }
      }
      if (utils$1.isMeasurementValue(navigator2.deviceMemory)) {
        transaction.setTag("deviceMemory", `${navigator2.deviceMemory} GB`);
      }
      if (utils$1.isMeasurementValue(navigator2.hardwareConcurrency)) {
        transaction.setTag("hardwareConcurrency", String(navigator2.hardwareConcurrency));
      }
    }
    function _tagMetricInfo(transaction) {
      if (_lcpEntry) {
        debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding LCP Data");
        if (_lcpEntry.element) {
          transaction.setTag("lcp.element", utils.htmlTreeAsString(_lcpEntry.element));
        }
        if (_lcpEntry.id) {
          transaction.setTag("lcp.id", _lcpEntry.id);
        }
        if (_lcpEntry.url) {
          transaction.setTag("lcp.url", _lcpEntry.url.trim().slice(0, 200));
        }
        transaction.setTag("lcp.size", _lcpEntry.size);
      }
      if (_clsEntry && _clsEntry.sources) {
        debugBuild.DEBUG_BUILD && utils.logger.log("[Measurements] Adding CLS Data");
        _clsEntry.sources.forEach(
          (source, index) => transaction.setTag(`cls.source.${index + 1}`, utils.htmlTreeAsString(source.node))
        );
      }
    }
    function setResourceEntrySizeData(data, entry, key, dataKey) {
      const entryVal = entry[key];
      if (entryVal != null && entryVal < MAX_INT_AS_BYTES) {
        data[dataKey] = entryVal;
      }
    }
    exports._addMeasureSpans = _addMeasureSpans;
    exports._addResourceSpans = _addResourceSpans;
    exports.addPerformanceEntries = addPerformanceEntries;
    exports.startTrackingInteractions = startTrackingInteractions;
    exports.startTrackingLongTasks = startTrackingLongTasks;
    exports.startTrackingWebVitals = startTrackingWebVitals;
  }
});

// node_modules/@sentry-internal/tracing/cjs/common/fetch.js
var require_fetch2 = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/common/fetch.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    function instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeaders, spans, spanOrigin = "auto.http.browser") {
      if (!core.hasTracingEnabled() || !handlerData.fetchData) {
        return void 0;
      }
      const shouldCreateSpanResult = shouldCreateSpan(handlerData.fetchData.url);
      if (handlerData.endTimestamp && shouldCreateSpanResult) {
        const spanId = handlerData.fetchData.__span;
        if (!spanId)
          return;
        const span2 = spans[spanId];
        if (span2) {
          if (handlerData.response) {
            span2.setHttpStatus(handlerData.response.status);
            const contentLength = handlerData.response && handlerData.response.headers && handlerData.response.headers.get("content-length");
            if (contentLength) {
              const contentLengthNum = parseInt(contentLength);
              if (contentLengthNum > 0) {
                span2.setData("http.response_content_length", contentLengthNum);
              }
            }
          } else if (handlerData.error) {
            span2.setStatus("internal_error");
          }
          span2.finish();
          delete spans[spanId];
        }
        return void 0;
      }
      const hub = core.getCurrentHub();
      const scope = hub.getScope();
      const client = hub.getClient();
      const parentSpan = scope.getSpan();
      const { method, url } = handlerData.fetchData;
      const span = shouldCreateSpanResult && parentSpan ? parentSpan.startChild({
        data: {
          url,
          type: "fetch",
          "http.method": method
        },
        description: `${method} ${url}`,
        op: "http.client",
        origin: spanOrigin
      }) : void 0;
      if (span) {
        handlerData.fetchData.__span = span.spanId;
        spans[span.spanId] = span;
      }
      if (shouldAttachHeaders(handlerData.fetchData.url) && client) {
        const request = handlerData.args[0];
        handlerData.args[1] = handlerData.args[1] || {};
        const options = handlerData.args[1];
        options.headers = addTracingHeadersToFetchRequest(request, client, scope, options, span);
      }
      return span;
    }
    function addTracingHeadersToFetchRequest(request, client, scope, options, requestSpan) {
      const span = requestSpan || scope.getSpan();
      const transaction = span && span.transaction;
      const { traceId, sampled, dsc } = scope.getPropagationContext();
      const sentryTraceHeader = span ? span.toTraceparent() : utils.generateSentryTraceHeader(traceId, void 0, sampled);
      const dynamicSamplingContext = transaction ? transaction.getDynamicSamplingContext() : dsc ? dsc : core.getDynamicSamplingContextFromClient(traceId, client, scope);
      const sentryBaggageHeader = utils.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext);
      const headers = typeof Request !== "undefined" && utils.isInstanceOf(request, Request) ? request.headers : options.headers;
      if (!headers) {
        return { "sentry-trace": sentryTraceHeader, baggage: sentryBaggageHeader };
      } else if (typeof Headers !== "undefined" && utils.isInstanceOf(headers, Headers)) {
        const newHeaders = new Headers(headers);
        newHeaders.append("sentry-trace", sentryTraceHeader);
        if (sentryBaggageHeader) {
          newHeaders.append(utils.BAGGAGE_HEADER_NAME, sentryBaggageHeader);
        }
        return newHeaders;
      } else if (Array.isArray(headers)) {
        const newHeaders = [...headers, ["sentry-trace", sentryTraceHeader]];
        if (sentryBaggageHeader) {
          newHeaders.push([utils.BAGGAGE_HEADER_NAME, sentryBaggageHeader]);
        }
        return newHeaders;
      } else {
        const existingBaggageHeader = "baggage" in headers ? headers.baggage : void 0;
        const newBaggageHeaders = [];
        if (Array.isArray(existingBaggageHeader)) {
          newBaggageHeaders.push(...existingBaggageHeader);
        } else if (existingBaggageHeader) {
          newBaggageHeaders.push(existingBaggageHeader);
        }
        if (sentryBaggageHeader) {
          newBaggageHeaders.push(sentryBaggageHeader);
        }
        return {
          ...headers,
          "sentry-trace": sentryTraceHeader,
          baggage: newBaggageHeaders.length > 0 ? newBaggageHeaders.join(",") : void 0
        };
      }
    }
    exports.addTracingHeadersToFetchRequest = addTracingHeadersToFetchRequest;
    exports.instrumentFetchRequest = instrumentFetchRequest;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/request.js
var require_request = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/request.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var fetch = require_fetch2();
    var instrument = require_instrument2();
    var DEFAULT_TRACE_PROPAGATION_TARGETS = ["localhost", /^\/(?!\/)/];
    var defaultRequestInstrumentationOptions = {
      traceFetch: true,
      traceXHR: true,
      enableHTTPTimings: true,
      // TODO (v8): Remove this property
      tracingOrigins: DEFAULT_TRACE_PROPAGATION_TARGETS,
      tracePropagationTargets: DEFAULT_TRACE_PROPAGATION_TARGETS
    };
    function instrumentOutgoingRequests(_options) {
      const {
        traceFetch,
        traceXHR,
        // eslint-disable-next-line deprecation/deprecation
        tracePropagationTargets,
        // eslint-disable-next-line deprecation/deprecation
        tracingOrigins,
        shouldCreateSpanForRequest,
        enableHTTPTimings
      } = {
        traceFetch: defaultRequestInstrumentationOptions.traceFetch,
        traceXHR: defaultRequestInstrumentationOptions.traceXHR,
        ..._options
      };
      const shouldCreateSpan = typeof shouldCreateSpanForRequest === "function" ? shouldCreateSpanForRequest : (_) => true;
      const shouldAttachHeadersWithTargets = (url) => shouldAttachHeaders(url, tracePropagationTargets || tracingOrigins);
      const spans = {};
      if (traceFetch) {
        utils.addFetchInstrumentationHandler((handlerData) => {
          const createdSpan = fetch.instrumentFetchRequest(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
          if (enableHTTPTimings && createdSpan) {
            addHTTPTimings(createdSpan);
          }
        });
      }
      if (traceXHR) {
        utils.addXhrInstrumentationHandler((handlerData) => {
          const createdSpan = xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeadersWithTargets, spans);
          if (enableHTTPTimings && createdSpan) {
            addHTTPTimings(createdSpan);
          }
        });
      }
    }
    function isPerformanceResourceTiming(entry) {
      return entry.entryType === "resource" && "initiatorType" in entry && typeof entry.nextHopProtocol === "string" && (entry.initiatorType === "fetch" || entry.initiatorType === "xmlhttprequest");
    }
    function addHTTPTimings(span) {
      const url = span.data.url;
      if (!url) {
        return;
      }
      const cleanup = instrument.addPerformanceInstrumentationHandler("resource", ({ entries }) => {
        entries.forEach((entry) => {
          if (isPerformanceResourceTiming(entry) && entry.name.endsWith(url)) {
            const spanData = resourceTimingEntryToSpanData(entry);
            spanData.forEach((data) => span.setData(...data));
            setTimeout(cleanup);
          }
        });
      });
    }
    function extractNetworkProtocol(nextHopProtocol) {
      let name = "unknown";
      let version2 = "unknown";
      let _name = "";
      for (const char of nextHopProtocol) {
        if (char === "/") {
          [name, version2] = nextHopProtocol.split("/");
          break;
        }
        if (!isNaN(Number(char))) {
          name = _name === "h" ? "http" : _name;
          version2 = nextHopProtocol.split(_name)[1];
          break;
        }
        _name += char;
      }
      if (_name === nextHopProtocol) {
        name = _name;
      }
      return { name, version: version2 };
    }
    function getAbsoluteTime(time = 0) {
      return ((utils.browserPerformanceTimeOrigin || performance.timeOrigin) + time) / 1e3;
    }
    function resourceTimingEntryToSpanData(resourceTiming) {
      const { name, version: version2 } = extractNetworkProtocol(resourceTiming.nextHopProtocol);
      const timingSpanData = [];
      timingSpanData.push(["network.protocol.version", version2], ["network.protocol.name", name]);
      if (!utils.browserPerformanceTimeOrigin) {
        return timingSpanData;
      }
      return [
        ...timingSpanData,
        ["http.request.redirect_start", getAbsoluteTime(resourceTiming.redirectStart)],
        ["http.request.fetch_start", getAbsoluteTime(resourceTiming.fetchStart)],
        ["http.request.domain_lookup_start", getAbsoluteTime(resourceTiming.domainLookupStart)],
        ["http.request.domain_lookup_end", getAbsoluteTime(resourceTiming.domainLookupEnd)],
        ["http.request.connect_start", getAbsoluteTime(resourceTiming.connectStart)],
        ["http.request.secure_connection_start", getAbsoluteTime(resourceTiming.secureConnectionStart)],
        ["http.request.connection_end", getAbsoluteTime(resourceTiming.connectEnd)],
        ["http.request.request_start", getAbsoluteTime(resourceTiming.requestStart)],
        ["http.request.response_start", getAbsoluteTime(resourceTiming.responseStart)],
        ["http.request.response_end", getAbsoluteTime(resourceTiming.responseEnd)]
      ];
    }
    function shouldAttachHeaders(url, tracePropagationTargets) {
      return utils.stringMatchesSomePattern(url, tracePropagationTargets || DEFAULT_TRACE_PROPAGATION_TARGETS);
    }
    function xhrCallback(handlerData, shouldCreateSpan, shouldAttachHeaders2, spans) {
      const xhr = handlerData.xhr;
      const sentryXhrData = xhr && xhr[utils.SENTRY_XHR_DATA_KEY];
      if (!core.hasTracingEnabled() || !xhr || xhr.__sentry_own_request__ || !sentryXhrData) {
        return void 0;
      }
      const shouldCreateSpanResult = shouldCreateSpan(sentryXhrData.url);
      if (handlerData.endTimestamp && shouldCreateSpanResult) {
        const spanId = xhr.__sentry_xhr_span_id__;
        if (!spanId)
          return;
        const span2 = spans[spanId];
        if (span2 && sentryXhrData.status_code !== void 0) {
          span2.setHttpStatus(sentryXhrData.status_code);
          span2.finish();
          delete spans[spanId];
        }
        return void 0;
      }
      const hub = core.getCurrentHub();
      const scope = hub.getScope();
      const parentSpan = scope.getSpan();
      const span = shouldCreateSpanResult && parentSpan ? parentSpan.startChild({
        data: {
          type: "xhr",
          "http.method": sentryXhrData.method,
          url: sentryXhrData.url
        },
        description: `${sentryXhrData.method} ${sentryXhrData.url}`,
        op: "http.client",
        origin: "auto.http.browser"
      }) : void 0;
      if (span) {
        xhr.__sentry_xhr_span_id__ = span.spanId;
        spans[xhr.__sentry_xhr_span_id__] = span;
      }
      if (xhr.setRequestHeader && shouldAttachHeaders2(sentryXhrData.url)) {
        if (span) {
          const transaction = span && span.transaction;
          const dynamicSamplingContext = transaction && transaction.getDynamicSamplingContext();
          const sentryBaggageHeader = utils.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext);
          setHeaderOnXhr(xhr, span.toTraceparent(), sentryBaggageHeader);
        } else {
          const client = hub.getClient();
          const { traceId, sampled, dsc } = scope.getPropagationContext();
          const sentryTraceHeader = utils.generateSentryTraceHeader(traceId, void 0, sampled);
          const dynamicSamplingContext = dsc || (client ? core.getDynamicSamplingContextFromClient(traceId, client, scope) : void 0);
          const sentryBaggageHeader = utils.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext);
          setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader);
        }
      }
      return span;
    }
    function setHeaderOnXhr(xhr, sentryTraceHeader, sentryBaggageHeader) {
      try {
        xhr.setRequestHeader("sentry-trace", sentryTraceHeader);
        if (sentryBaggageHeader) {
          xhr.setRequestHeader(utils.BAGGAGE_HEADER_NAME, sentryBaggageHeader);
        }
      } catch (_) {
      }
    }
    exports.DEFAULT_TRACE_PROPAGATION_TARGETS = DEFAULT_TRACE_PROPAGATION_TARGETS;
    exports.defaultRequestInstrumentationOptions = defaultRequestInstrumentationOptions;
    exports.extractNetworkProtocol = extractNetworkProtocol;
    exports.instrumentOutgoingRequests = instrumentOutgoingRequests;
    exports.shouldAttachHeaders = shouldAttachHeaders;
    exports.xhrCallback = xhrCallback;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/router.js
var require_router = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/router.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var types = require_types();
    function instrumentRoutingWithDefaults(customStartTransaction, startTransactionOnPageLoad = true, startTransactionOnLocationChange = true) {
      if (!types.WINDOW || !types.WINDOW.location) {
        debugBuild.DEBUG_BUILD && utils.logger.warn("Could not initialize routing instrumentation due to invalid location");
        return;
      }
      let startingUrl = types.WINDOW.location.href;
      let activeTransaction;
      if (startTransactionOnPageLoad) {
        activeTransaction = customStartTransaction({
          name: types.WINDOW.location.pathname,
          // pageload should always start at timeOrigin (and needs to be in s, not ms)
          startTimestamp: utils.browserPerformanceTimeOrigin ? utils.browserPerformanceTimeOrigin / 1e3 : void 0,
          op: "pageload",
          origin: "auto.pageload.browser",
          metadata: { source: "url" }
        });
      }
      if (startTransactionOnLocationChange) {
        utils.addHistoryInstrumentationHandler(({ to, from }) => {
          if (from === void 0 && startingUrl && startingUrl.indexOf(to) !== -1) {
            startingUrl = void 0;
            return;
          }
          if (from !== to) {
            startingUrl = void 0;
            if (activeTransaction) {
              debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] Finishing current transaction with op: ${activeTransaction.op}`);
              activeTransaction.finish();
            }
            activeTransaction = customStartTransaction({
              name: types.WINDOW.location.pathname,
              op: "navigation",
              origin: "auto.navigation.browser",
              metadata: { source: "url" }
            });
          }
        });
      }
    }
    exports.instrumentRoutingWithDefaults = instrumentRoutingWithDefaults;
  }
});

// node_modules/@sentry-internal/tracing/cjs/browser/browsertracing.js
var require_browsertracing = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/browser/browsertracing.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build3();
    var backgroundtab = require_backgroundtab();
    var index = require_metrics();
    var request = require_request();
    var router = require_router();
    var types = require_types();
    var BROWSER_TRACING_INTEGRATION_ID = "BrowserTracing";
    var DEFAULT_BROWSER_TRACING_OPTIONS = {
      ...core.TRACING_DEFAULTS,
      markBackgroundTransactions: true,
      routingInstrumentation: router.instrumentRoutingWithDefaults,
      startTransactionOnLocationChange: true,
      startTransactionOnPageLoad: true,
      enableLongTask: true,
      _experiments: {},
      ...request.defaultRequestInstrumentationOptions
    };
    var BrowserTracing = class {
      // This class currently doesn't have a static `id` field like the other integration classes, because it prevented
      // @sentry/tracing from being treeshaken. Tree shakers do not like static fields, because they behave like side effects.
      // TODO: Come up with a better plan, than using static fields on integration classes, and use that plan on all
      // integrations.
      /** Browser Tracing integration options */
      /**
       * @inheritDoc
       */
      constructor(_options) {
        this.name = BROWSER_TRACING_INTEGRATION_ID;
        this._hasSetTracePropagationTargets = false;
        core.addTracingExtensions();
        if (debugBuild.DEBUG_BUILD) {
          this._hasSetTracePropagationTargets = !!(_options && // eslint-disable-next-line deprecation/deprecation
          (_options.tracePropagationTargets || _options.tracingOrigins));
        }
        this.options = {
          ...DEFAULT_BROWSER_TRACING_OPTIONS,
          ..._options
        };
        if (this.options._experiments.enableLongTask !== void 0) {
          this.options.enableLongTask = this.options._experiments.enableLongTask;
        }
        if (_options && !_options.tracePropagationTargets && _options.tracingOrigins) {
          this.options.tracePropagationTargets = _options.tracingOrigins;
        }
        this._collectWebVitals = index.startTrackingWebVitals();
        if (this.options.enableLongTask) {
          index.startTrackingLongTasks();
        }
        if (this.options._experiments.enableInteractions) {
          index.startTrackingInteractions();
        }
      }
      /**
       * @inheritDoc
       */
      setupOnce(_, getCurrentHub2) {
        this._getCurrentHub = getCurrentHub2;
        const hub = getCurrentHub2();
        const client = hub.getClient();
        const clientOptions = client && client.getOptions();
        const {
          routingInstrumentation: instrumentRouting,
          startTransactionOnLocationChange,
          startTransactionOnPageLoad,
          markBackgroundTransactions,
          traceFetch,
          traceXHR,
          shouldCreateSpanForRequest,
          enableHTTPTimings,
          _experiments
        } = this.options;
        const clientOptionsTracePropagationTargets = clientOptions && clientOptions.tracePropagationTargets;
        const tracePropagationTargets = clientOptionsTracePropagationTargets || this.options.tracePropagationTargets;
        if (debugBuild.DEBUG_BUILD && this._hasSetTracePropagationTargets && clientOptionsTracePropagationTargets) {
          utils.logger.warn(
            "[Tracing] The `tracePropagationTargets` option was set in the BrowserTracing integration and top level `Sentry.init`. The top level `Sentry.init` value is being used."
          );
        }
        instrumentRouting(
          (context) => {
            const transaction = this._createRouteTransaction(context);
            this.options._experiments.onStartRouteTransaction && this.options._experiments.onStartRouteTransaction(transaction, context, getCurrentHub2);
            return transaction;
          },
          startTransactionOnPageLoad,
          startTransactionOnLocationChange
        );
        if (markBackgroundTransactions) {
          backgroundtab.registerBackgroundTabDetection();
        }
        if (_experiments.enableInteractions) {
          this._registerInteractionListener();
        }
        request.instrumentOutgoingRequests({
          traceFetch,
          traceXHR,
          tracePropagationTargets,
          shouldCreateSpanForRequest,
          enableHTTPTimings
        });
      }
      /** Create routing idle transaction. */
      _createRouteTransaction(context) {
        if (!this._getCurrentHub) {
          debugBuild.DEBUG_BUILD && utils.logger.warn(`[Tracing] Did not create ${context.op} transaction because _getCurrentHub is invalid.`);
          return void 0;
        }
        const hub = this._getCurrentHub();
        const { beforeNavigate, idleTimeout, finalTimeout, heartbeatInterval } = this.options;
        const isPageloadTransaction = context.op === "pageload";
        const sentryTrace = isPageloadTransaction ? getMetaContent("sentry-trace") : "";
        const baggage = isPageloadTransaction ? getMetaContent("baggage") : "";
        const { traceparentData, dynamicSamplingContext, propagationContext } = utils.tracingContextFromHeaders(
          sentryTrace,
          baggage
        );
        const expandedContext = {
          ...context,
          ...traceparentData,
          metadata: {
            ...context.metadata,
            dynamicSamplingContext: traceparentData && !dynamicSamplingContext ? {} : dynamicSamplingContext
          },
          trimEnd: true
        };
        const modifiedContext = typeof beforeNavigate === "function" ? beforeNavigate(expandedContext) : expandedContext;
        const finalContext = modifiedContext === void 0 ? { ...expandedContext, sampled: false } : modifiedContext;
        finalContext.metadata = finalContext.name !== expandedContext.name ? { ...finalContext.metadata, source: "custom" } : finalContext.metadata;
        this._latestRouteName = finalContext.name;
        this._latestRouteSource = finalContext.metadata && finalContext.metadata.source;
        if (finalContext.sampled === false) {
          debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] Will not send ${finalContext.op} transaction because of beforeNavigate.`);
        }
        debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] Starting ${finalContext.op} transaction on scope`);
        const { location } = types.WINDOW;
        const idleTransaction = core.startIdleTransaction(
          hub,
          finalContext,
          idleTimeout,
          finalTimeout,
          true,
          { location },
          // for use in the tracesSampler
          heartbeatInterval
        );
        const scope = hub.getScope();
        if (isPageloadTransaction && traceparentData) {
          scope.setPropagationContext(propagationContext);
        } else {
          scope.setPropagationContext({
            traceId: idleTransaction.traceId,
            spanId: idleTransaction.spanId,
            parentSpanId: idleTransaction.parentSpanId,
            sampled: idleTransaction.sampled
          });
        }
        idleTransaction.registerBeforeFinishCallback((transaction) => {
          this._collectWebVitals();
          index.addPerformanceEntries(transaction);
        });
        return idleTransaction;
      }
      /** Start listener for interaction transactions */
      _registerInteractionListener() {
        let inflightInteractionTransaction;
        const registerInteractionTransaction = () => {
          const { idleTimeout, finalTimeout, heartbeatInterval } = this.options;
          const op = "ui.action.click";
          const currentTransaction = core.getActiveTransaction();
          if (currentTransaction && currentTransaction.op && ["navigation", "pageload"].includes(currentTransaction.op)) {
            debugBuild.DEBUG_BUILD && utils.logger.warn(
              `[Tracing] Did not create ${op} transaction because a pageload or navigation transaction is in progress.`
            );
            return void 0;
          }
          if (inflightInteractionTransaction) {
            inflightInteractionTransaction.setFinishReason("interactionInterrupted");
            inflightInteractionTransaction.finish();
            inflightInteractionTransaction = void 0;
          }
          if (!this._getCurrentHub) {
            debugBuild.DEBUG_BUILD && utils.logger.warn(`[Tracing] Did not create ${op} transaction because _getCurrentHub is invalid.`);
            return void 0;
          }
          if (!this._latestRouteName) {
            debugBuild.DEBUG_BUILD && utils.logger.warn(`[Tracing] Did not create ${op} transaction because _latestRouteName is missing.`);
            return void 0;
          }
          const hub = this._getCurrentHub();
          const { location } = types.WINDOW;
          const context = {
            name: this._latestRouteName,
            op,
            trimEnd: true,
            metadata: {
              source: this._latestRouteSource || "url"
            }
          };
          inflightInteractionTransaction = core.startIdleTransaction(
            hub,
            context,
            idleTimeout,
            finalTimeout,
            true,
            { location },
            // for use in the tracesSampler
            heartbeatInterval
          );
        };
        ["click"].forEach((type2) => {
          addEventListener(type2, registerInteractionTransaction, { once: false, capture: true });
        });
      }
    };
    function getMetaContent(metaName) {
      const metaTag = utils.getDomElement(`meta[name=${metaName}]`);
      return metaTag ? metaTag.getAttribute("content") : void 0;
    }
    exports.BROWSER_TRACING_INTEGRATION_ID = BROWSER_TRACING_INTEGRATION_ID;
    exports.BrowserTracing = BrowserTracing;
    exports.getMetaContent = getMetaContent;
  }
});

// node_modules/@sentry-internal/tracing/cjs/extensions.js
var require_extensions = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/extensions.js"(exports, module2) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    function _autoloadDatabaseIntegrations() {
      const carrier = core.getMainCarrier();
      if (!carrier.__SENTRY__) {
        return;
      }
      const packageToIntegrationMapping = {
        mongodb() {
          const integration = utils.dynamicRequire(module2, "./node/integrations/mongo");
          return new integration.Mongo();
        },
        mongoose() {
          const integration = utils.dynamicRequire(module2, "./node/integrations/mongo");
          return new integration.Mongo();
        },
        mysql() {
          const integration = utils.dynamicRequire(module2, "./node/integrations/mysql");
          return new integration.Mysql();
        },
        pg() {
          const integration = utils.dynamicRequire(module2, "./node/integrations/postgres");
          return new integration.Postgres();
        }
      };
      const mappedPackages = Object.keys(packageToIntegrationMapping).filter((moduleName) => !!utils.loadModule(moduleName)).map((pkg) => {
        try {
          return packageToIntegrationMapping[pkg]();
        } catch (e) {
          return void 0;
        }
      }).filter((p) => p);
      if (mappedPackages.length > 0) {
        carrier.__SENTRY__.integrations = [...carrier.__SENTRY__.integrations || [], ...mappedPackages];
      }
    }
    function addExtensionMethods() {
      core.addTracingExtensions();
      if (utils.isNodeEnv()) {
        _autoloadDatabaseIntegrations();
      }
    }
    exports.addExtensionMethods = addExtensionMethods;
  }
});

// node_modules/@sentry-internal/tracing/cjs/index.js
var require_cjs3 = __commonJS({
  "node_modules/@sentry-internal/tracing/cjs/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var express = require_express();
    var postgres = require_postgres();
    var mysql = require_mysql();
    var mongo = require_mongo();
    var prisma = require_prisma();
    var graphql = require_graphql();
    var apollo = require_apollo();
    var lazy = require_lazy();
    var browsertracing = require_browsertracing();
    var request = require_request();
    var instrument = require_instrument2();
    var fetch = require_fetch2();
    var extensions = require_extensions();
    exports.IdleTransaction = core.IdleTransaction;
    exports.Span = core.Span;
    exports.SpanStatus = core.SpanStatus;
    exports.Transaction = core.Transaction;
    exports.extractTraceparentData = core.extractTraceparentData;
    exports.getActiveTransaction = core.getActiveTransaction;
    exports.hasTracingEnabled = core.hasTracingEnabled;
    exports.spanStatusfromHttpCode = core.spanStatusfromHttpCode;
    exports.startIdleTransaction = core.startIdleTransaction;
    exports.TRACEPARENT_REGEXP = utils.TRACEPARENT_REGEXP;
    exports.stripUrlQueryAndFragment = utils.stripUrlQueryAndFragment;
    exports.Express = express.Express;
    exports.Postgres = postgres.Postgres;
    exports.Mysql = mysql.Mysql;
    exports.Mongo = mongo.Mongo;
    exports.Prisma = prisma.Prisma;
    exports.GraphQL = graphql.GraphQL;
    exports.Apollo = apollo.Apollo;
    exports.lazyLoadedNodePerformanceMonitoringIntegrations = lazy.lazyLoadedNodePerformanceMonitoringIntegrations;
    exports.BROWSER_TRACING_INTEGRATION_ID = browsertracing.BROWSER_TRACING_INTEGRATION_ID;
    exports.BrowserTracing = browsertracing.BrowserTracing;
    exports.defaultRequestInstrumentationOptions = request.defaultRequestInstrumentationOptions;
    exports.instrumentOutgoingRequests = request.instrumentOutgoingRequests;
    exports.addClsInstrumentationHandler = instrument.addClsInstrumentationHandler;
    exports.addFidInstrumentationHandler = instrument.addFidInstrumentationHandler;
    exports.addLcpInstrumentationHandler = instrument.addLcpInstrumentationHandler;
    exports.addPerformanceInstrumentationHandler = instrument.addPerformanceInstrumentationHandler;
    exports.addTracingHeadersToFetchRequest = fetch.addTracingHeadersToFetchRequest;
    exports.instrumentFetchRequest = fetch.instrumentFetchRequest;
    exports.addExtensionMethods = extensions.addExtensionMethods;
  }
});

// node_modules/@sentry/node/cjs/tracing/index.js
var require_tracing2 = __commonJS({
  "node_modules/@sentry/node/cjs/tracing/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var tracing = require_cjs3();
    var utils = require_cjs();
    function autoDiscoverNodePerformanceMonitoringIntegrations() {
      const loadedIntegrations = tracing.lazyLoadedNodePerformanceMonitoringIntegrations.map((tryLoad) => {
        try {
          return tryLoad();
        } catch (_) {
          return void 0;
        }
      }).filter((integration) => !!integration);
      if (loadedIntegrations.length === 0) {
        utils.logger.warn("Performance monitoring integrations could not be automatically loaded.");
      }
      return loadedIntegrations.filter((integration) => !!integration.loadDependency());
    }
    exports.autoDiscoverNodePerformanceMonitoringIntegrations = autoDiscoverNodePerformanceMonitoringIntegrations;
  }
});

// node_modules/@sentry/node/cjs/client.js
var require_client = __commonJS({
  "node_modules/@sentry/node/cjs/client.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var os2 = require("os");
    var util = require("util");
    var core = require_cjs2();
    var NodeClient = class extends core.ServerRuntimeClient {
      /**
       * Creates a new Node SDK instance.
       * @param options Configuration options for this SDK.
       */
      constructor(options) {
        options._metadata = options._metadata || {};
        options._metadata.sdk = options._metadata.sdk || {
          name: "sentry.javascript.node",
          packages: [
            {
              name: "npm:@sentry/node",
              version: core.SDK_VERSION
            }
          ],
          version: core.SDK_VERSION
        };
        options.transportOptions = {
          textEncoder: new util.TextEncoder(),
          ...options.transportOptions
        };
        const clientOptions = {
          ...options,
          platform: "node",
          runtime: { name: "node", version: global.process.version },
          serverName: options.serverName || global.process.env.SENTRY_NAME || os2.hostname()
        };
        super(clientOptions);
      }
    };
    exports.NodeClient = NodeClient;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type2 = typeof val;
      if (type2 === "string" && val.length > 0) {
        return parse(val);
      } else if (type2 === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type2 = (match[2] || "ms").toLowerCase();
      switch (type2) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module2) {
    function setup(env3) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env3).forEach((key) => {
        createDebug[key] = env3[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self2 = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser2 = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module2) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports, module2) {
    "use strict";
    module2.exports = (flag, argv = process.argv) => {
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const position = argv.indexOf(prefix + flag);
      const terminatorPosition = argv.indexOf("--");
      return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports, module2) {
    "use strict";
    var os2 = require("os");
    var tty = require("tty");
    var hasFlag = require_has_flag();
    var { env: env3 } = process;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      forceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = 1;
    }
    if ("FORCE_COLOR" in env3) {
      if (env3.FORCE_COLOR === "true") {
        forceColor = 1;
      } else if (env3.FORCE_COLOR === "false") {
        forceColor = 0;
      } else {
        forceColor = env3.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env3.FORCE_COLOR, 10), 3);
      }
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(haveStream, streamIsTTY) {
      if (forceColor === 0) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (haveStream && !streamIsTTY && forceColor === void 0) {
        return 0;
      }
      const min = forceColor || 0;
      if (env3.TERM === "dumb") {
        return min;
      }
      if (process.platform === "win32") {
        const osRelease = os2.release().split(".");
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env3) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env3) || env3.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env3) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env3.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env3.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env3) {
        const version2 = parseInt((env3.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env3.TERM_PROGRAM) {
          case "iTerm.app":
            return version2 >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env3.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env3.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env3) {
        return 1;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream, stream && stream.isTTY);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: translateLevel(supportsColor(true, tty.isatty(1))),
      stderr: translateLevel(supportsColor(true, tty.isatty(2)))
    };
  }
});

// node_modules/debug/src/node.js
var require_node2 = __commonJS({
  "node_modules/debug/src/node.js"(exports, module2) {
    var tty = require("tty");
    var util = require("util");
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require_supports_color();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.format(...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser2();
    } else {
      module2.exports = require_node2();
    }
  }
});

// node_modules/agent-base/dist/src/promisify.js
var require_promisify = __commonJS({
  "node_modules/agent-base/dist/src/promisify.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function promisify(fn) {
      return function(req, opts) {
        return new Promise((resolve2, reject) => {
          fn.call(this, req, opts, (err, rtn) => {
            if (err) {
              reject(err);
            } else {
              resolve2(rtn);
            }
          });
        });
      };
    }
    exports.default = promisify;
  }
});

// node_modules/agent-base/dist/src/index.js
var require_src2 = __commonJS({
  "node_modules/agent-base/dist/src/index.js"(exports, module2) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var events_1 = require("events");
    var debug_1 = __importDefault(require_src());
    var promisify_1 = __importDefault(require_promisify());
    var debug = debug_1.default("agent-base");
    function isAgent(v) {
      return Boolean(v) && typeof v.addRequest === "function";
    }
    function isSecureEndpoint() {
      const { stack } = new Error();
      if (typeof stack !== "string")
        return false;
      return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
    }
    function createAgent(callback, opts) {
      return new createAgent.Agent(callback, opts);
    }
    (function(createAgent2) {
      class Agent extends events_1.EventEmitter {
        constructor(callback, _opts) {
          super();
          let opts = _opts;
          if (typeof callback === "function") {
            this.callback = callback;
          } else if (callback) {
            opts = callback;
          }
          this.timeout = null;
          if (opts && typeof opts.timeout === "number") {
            this.timeout = opts.timeout;
          }
          this.maxFreeSockets = 1;
          this.maxSockets = 1;
          this.maxTotalSockets = Infinity;
          this.sockets = {};
          this.freeSockets = {};
          this.requests = {};
          this.options = {};
        }
        get defaultPort() {
          if (typeof this.explicitDefaultPort === "number") {
            return this.explicitDefaultPort;
          }
          return isSecureEndpoint() ? 443 : 80;
        }
        set defaultPort(v) {
          this.explicitDefaultPort = v;
        }
        get protocol() {
          if (typeof this.explicitProtocol === "string") {
            return this.explicitProtocol;
          }
          return isSecureEndpoint() ? "https:" : "http:";
        }
        set protocol(v) {
          this.explicitProtocol = v;
        }
        callback(req, opts, fn) {
          throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
        }
        /**
         * Called by node-core's "_http_client.js" module when creating
         * a new HTTP request with this Agent instance.
         *
         * @api public
         */
        addRequest(req, _opts) {
          const opts = Object.assign({}, _opts);
          if (typeof opts.secureEndpoint !== "boolean") {
            opts.secureEndpoint = isSecureEndpoint();
          }
          if (opts.host == null) {
            opts.host = "localhost";
          }
          if (opts.port == null) {
            opts.port = opts.secureEndpoint ? 443 : 80;
          }
          if (opts.protocol == null) {
            opts.protocol = opts.secureEndpoint ? "https:" : "http:";
          }
          if (opts.host && opts.path) {
            delete opts.path;
          }
          delete opts.agent;
          delete opts.hostname;
          delete opts._defaultAgent;
          delete opts.defaultPort;
          delete opts.createConnection;
          req._last = true;
          req.shouldKeepAlive = false;
          let timedOut = false;
          let timeoutId = null;
          const timeoutMs = opts.timeout || this.timeout;
          const onerror = (err) => {
            if (req._hadError)
              return;
            req.emit("error", err);
            req._hadError = true;
          };
          const ontimeout = () => {
            timeoutId = null;
            timedOut = true;
            const err = new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`);
            err.code = "ETIMEOUT";
            onerror(err);
          };
          const callbackError = (err) => {
            if (timedOut)
              return;
            if (timeoutId !== null) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            onerror(err);
          };
          const onsocket = (socket) => {
            if (timedOut)
              return;
            if (timeoutId != null) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            if (isAgent(socket)) {
              debug("Callback returned another Agent instance %o", socket.constructor.name);
              socket.addRequest(req, opts);
              return;
            }
            if (socket) {
              socket.once("free", () => {
                this.freeSocket(socket, opts);
              });
              req.onSocket(socket);
              return;
            }
            const err = new Error(`no Duplex stream was returned to agent-base for \`${req.method} ${req.path}\``);
            onerror(err);
          };
          if (typeof this.callback !== "function") {
            onerror(new Error("`callback` is not defined"));
            return;
          }
          if (!this.promisifiedCallback) {
            if (this.callback.length >= 3) {
              debug("Converting legacy callback function to promise");
              this.promisifiedCallback = promisify_1.default(this.callback);
            } else {
              this.promisifiedCallback = this.callback;
            }
          }
          if (typeof timeoutMs === "number" && timeoutMs > 0) {
            timeoutId = setTimeout(ontimeout, timeoutMs);
          }
          if ("port" in opts && typeof opts.port !== "number") {
            opts.port = Number(opts.port);
          }
          try {
            debug("Resolving socket for %o request: %o", opts.protocol, `${req.method} ${req.path}`);
            Promise.resolve(this.promisifiedCallback(req, opts)).then(onsocket, callbackError);
          } catch (err) {
            Promise.reject(err).catch(callbackError);
          }
        }
        freeSocket(socket, opts) {
          debug("Freeing socket %o %o", socket.constructor.name, opts);
          socket.destroy();
        }
        destroy() {
          debug("Destroying agent %o", this.constructor.name);
        }
      }
      createAgent2.Agent = Agent;
      createAgent2.prototype = createAgent2.Agent.prototype;
    })(createAgent || (createAgent = {}));
    module2.exports = createAgent;
  }
});

// node_modules/https-proxy-agent/dist/parse-proxy-response.js
var require_parse_proxy_response = __commonJS({
  "node_modules/https-proxy-agent/dist/parse-proxy-response.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var debug_1 = __importDefault(require_src());
    var debug = debug_1.default("https-proxy-agent:parse-proxy-response");
    function parseProxyResponse(socket) {
      return new Promise((resolve2, reject) => {
        let buffersLength = 0;
        const buffers = [];
        function read() {
          const b = socket.read();
          if (b)
            ondata(b);
          else
            socket.once("readable", read);
        }
        function cleanup() {
          socket.removeListener("end", onend);
          socket.removeListener("error", onerror);
          socket.removeListener("close", onclose);
          socket.removeListener("readable", read);
        }
        function onclose(err) {
          debug("onclose had error %o", err);
        }
        function onend() {
          debug("onend");
        }
        function onerror(err) {
          cleanup();
          debug("onerror %o", err);
          reject(err);
        }
        function ondata(b) {
          buffers.push(b);
          buffersLength += b.length;
          const buffered = Buffer.concat(buffers, buffersLength);
          const endOfHeaders = buffered.indexOf("\r\n\r\n");
          if (endOfHeaders === -1) {
            debug("have not received end of HTTP headers yet...");
            read();
            return;
          }
          const firstLine = buffered.toString("ascii", 0, buffered.indexOf("\r\n"));
          const statusCode = +firstLine.split(" ")[1];
          debug("got proxy server response: %o", firstLine);
          resolve2({
            statusCode,
            buffered
          });
        }
        socket.on("error", onerror);
        socket.on("close", onclose);
        socket.on("end", onend);
        read();
      });
    }
    exports.default = parseProxyResponse;
  }
});

// node_modules/https-proxy-agent/dist/agent.js
var require_agent = __commonJS({
  "node_modules/https-proxy-agent/dist/agent.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve2) {
          resolve2(value);
        });
      }
      return new (P || (P = Promise))(function(resolve2, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var net_1 = __importDefault(require("net"));
    var tls_1 = __importDefault(require("tls"));
    var url_1 = __importDefault(require("url"));
    var assert_1 = __importDefault(require("assert"));
    var debug_1 = __importDefault(require_src());
    var agent_base_1 = require_src2();
    var parse_proxy_response_1 = __importDefault(require_parse_proxy_response());
    var debug = debug_1.default("https-proxy-agent:agent");
    var HttpsProxyAgent = class extends agent_base_1.Agent {
      constructor(_opts) {
        let opts;
        if (typeof _opts === "string") {
          opts = url_1.default.parse(_opts);
        } else {
          opts = _opts;
        }
        if (!opts) {
          throw new Error("an HTTP(S) proxy server `host` and `port` must be specified!");
        }
        debug("creating new HttpsProxyAgent instance: %o", opts);
        super(opts);
        const proxy = Object.assign({}, opts);
        this.secureProxy = opts.secureProxy || isHTTPS(proxy.protocol);
        proxy.host = proxy.hostname || proxy.host;
        if (typeof proxy.port === "string") {
          proxy.port = parseInt(proxy.port, 10);
        }
        if (!proxy.port && proxy.host) {
          proxy.port = this.secureProxy ? 443 : 80;
        }
        if (this.secureProxy && !("ALPNProtocols" in proxy)) {
          proxy.ALPNProtocols = ["http 1.1"];
        }
        if (proxy.host && proxy.path) {
          delete proxy.path;
          delete proxy.pathname;
        }
        this.proxy = proxy;
      }
      /**
       * Called when the node-core HTTP client library is creating a
       * new HTTP request.
       *
       * @api protected
       */
      callback(req, opts) {
        return __awaiter(this, void 0, void 0, function* () {
          const { proxy, secureProxy } = this;
          let socket;
          if (secureProxy) {
            debug("Creating `tls.Socket`: %o", proxy);
            socket = tls_1.default.connect(proxy);
          } else {
            debug("Creating `net.Socket`: %o", proxy);
            socket = net_1.default.connect(proxy);
          }
          const headers = Object.assign({}, proxy.headers);
          const hostname = `${opts.host}:${opts.port}`;
          let payload = `CONNECT ${hostname} HTTP/1.1\r
`;
          if (proxy.auth) {
            headers["Proxy-Authorization"] = `Basic ${Buffer.from(proxy.auth).toString("base64")}`;
          }
          let { host, port, secureEndpoint } = opts;
          if (!isDefaultPort(port, secureEndpoint)) {
            host += `:${port}`;
          }
          headers.Host = host;
          headers.Connection = "close";
          for (const name of Object.keys(headers)) {
            payload += `${name}: ${headers[name]}\r
`;
          }
          const proxyResponsePromise = parse_proxy_response_1.default(socket);
          socket.write(`${payload}\r
`);
          const { statusCode, buffered } = yield proxyResponsePromise;
          if (statusCode === 200) {
            req.once("socket", resume);
            if (opts.secureEndpoint) {
              debug("Upgrading socket connection to TLS");
              const servername = opts.servername || opts.host;
              return tls_1.default.connect(Object.assign(Object.assign({}, omit(opts, "host", "hostname", "path", "port")), {
                socket,
                servername
              }));
            }
            return socket;
          }
          socket.destroy();
          const fakeSocket = new net_1.default.Socket({ writable: false });
          fakeSocket.readable = true;
          req.once("socket", (s) => {
            debug("replaying proxy buffer for failed request");
            assert_1.default(s.listenerCount("data") > 0);
            s.push(buffered);
            s.push(null);
          });
          return fakeSocket;
        });
      }
    };
    exports.default = HttpsProxyAgent;
    function resume(socket) {
      socket.resume();
    }
    function isDefaultPort(port, secure) {
      return Boolean(!secure && port === 80 || secure && port === 443);
    }
    function isHTTPS(protocol) {
      return typeof protocol === "string" ? /^https:?$/i.test(protocol) : false;
    }
    function omit(obj, ...keys) {
      const ret = {};
      let key;
      for (key in obj) {
        if (!keys.includes(key)) {
          ret[key] = obj[key];
        }
      }
      return ret;
    }
  }
});

// node_modules/https-proxy-agent/dist/index.js
var require_dist = __commonJS({
  "node_modules/https-proxy-agent/dist/index.js"(exports, module2) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var agent_1 = __importDefault(require_agent());
    function createHttpsProxyAgent(opts) {
      return new agent_1.default(opts);
    }
    (function(createHttpsProxyAgent2) {
      createHttpsProxyAgent2.HttpsProxyAgent = agent_1.default;
      createHttpsProxyAgent2.prototype = agent_1.default.prototype;
    })(createHttpsProxyAgent || (createHttpsProxyAgent = {}));
    module2.exports = createHttpsProxyAgent;
  }
});

// node_modules/@sentry/node/cjs/transports/http.js
var require_http = __commonJS({
  "node_modules/@sentry/node/cjs/transports/http.js"(exports) {
    var {
      _nullishCoalesce
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var http = require("http");
    var https = require("https");
    var stream = require("stream");
    var url = require("url");
    var zlib = require("zlib");
    var core = require_cjs2();
    var utils = require_cjs();
    var httpsProxyAgent = require_dist();
    var GZIP_THRESHOLD = 1024 * 32;
    function streamFromBody(body) {
      return new stream.Readable({
        read() {
          this.push(body);
          this.push(null);
        }
      });
    }
    function makeNodeTransport(options) {
      let urlSegments;
      try {
        urlSegments = new url.URL(options.url);
      } catch (e) {
        utils.consoleSandbox(() => {
          console.warn(
            "[@sentry/node]: Invalid dsn or tunnel option, will not send any events. The tunnel option must be a full URL when used."
          );
        });
        return core.createTransport(options, () => Promise.resolve({}));
      }
      const isHttps = urlSegments.protocol === "https:";
      const proxy = applyNoProxyOption(
        urlSegments,
        options.proxy || (isHttps ? process.env.https_proxy : void 0) || process.env.http_proxy
      );
      const nativeHttpModule = isHttps ? https : http;
      const keepAlive = options.keepAlive === void 0 ? false : options.keepAlive;
      const agent = proxy ? new httpsProxyAgent.HttpsProxyAgent(proxy) : new nativeHttpModule.Agent({ keepAlive, maxSockets: 30, timeout: 2e3 });
      const requestExecutor = createRequestExecutor(options, _nullishCoalesce(options.httpModule, () => nativeHttpModule), agent);
      return core.createTransport(options, requestExecutor);
    }
    function applyNoProxyOption(transportUrlSegments, proxy) {
      const { no_proxy } = process.env;
      const urlIsExemptFromProxy = no_proxy && no_proxy.split(",").some(
        (exemption) => transportUrlSegments.host.endsWith(exemption) || transportUrlSegments.hostname.endsWith(exemption)
      );
      if (urlIsExemptFromProxy) {
        return void 0;
      } else {
        return proxy;
      }
    }
    function createRequestExecutor(options, httpModule, agent) {
      const { hostname, pathname, port, protocol, search } = new url.URL(options.url);
      return function makeRequest(request) {
        return new Promise((resolve2, reject) => {
          let body = streamFromBody(request.body);
          const headers = { ...options.headers };
          if (request.body.length > GZIP_THRESHOLD) {
            headers["content-encoding"] = "gzip";
            body = body.pipe(zlib.createGzip());
          }
          const req = httpModule.request(
            {
              method: "POST",
              agent,
              headers,
              hostname,
              path: `${pathname}${search}`,
              port,
              protocol,
              ca: options.caCerts
            },
            (res) => {
              res.on("data", () => {
              });
              res.on("end", () => {
              });
              res.setEncoding("utf8");
              const retryAfterHeader = _nullishCoalesce(res.headers["retry-after"], () => null);
              const rateLimitsHeader = _nullishCoalesce(res.headers["x-sentry-rate-limits"], () => null);
              resolve2({
                statusCode: res.statusCode,
                headers: {
                  "retry-after": retryAfterHeader,
                  "x-sentry-rate-limits": Array.isArray(rateLimitsHeader) ? rateLimitsHeader[0] : rateLimitsHeader
                }
              });
            }
          );
          req.on("error", reject);
          body.pipe(req);
        });
      };
    }
    exports.makeNodeTransport = makeNodeTransport;
  }
});

// node_modules/@sentry/node/cjs/module.js
var require_module = __commonJS({
  "node_modules/@sentry/node/cjs/module.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var path = require("path");
    var isWindowsPlatform = path.sep === "\\";
    function normalizeWindowsPath(path2) {
      return path2.replace(/^[A-Z]:/, "").replace(/\\/g, "/");
    }
    function getModuleFromFilename(filename, normalizeWindowsPathSeparator = isWindowsPlatform) {
      if (!filename) {
        return;
      }
      const normalizedFilename = normalizeWindowsPathSeparator ? normalizeWindowsPath(filename) : filename;
      let { root, dir, base: basename, ext } = path.posix.parse(normalizedFilename);
      const base = require && require.main && require.main.filename && dir || global.process.cwd();
      const normalizedBase = `${base}/`;
      let file = basename;
      if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
        file = file.slice(0, ext.length * -1);
      }
      if (!root && !dir) {
        dir = ".";
      }
      let n = dir.lastIndexOf("/node_modules/");
      if (n > -1) {
        return `${dir.slice(n + 14).replace(/\//g, ".")}:${file}`;
      }
      n = `${dir}/`.lastIndexOf(normalizedBase, 0);
      if (n === 0) {
        let moduleName = dir.slice(normalizedBase.length).replace(/\//g, ".");
        if (moduleName) {
          moduleName += ":";
        }
        moduleName += file;
        return moduleName;
      }
      return file;
    }
    exports.getModuleFromFilename = getModuleFromFilename;
  }
});

// node_modules/@sentry/node/cjs/anr/websocket.js
var require_websocket = __commonJS({
  "node_modules/@sentry/node/cjs/anr/websocket.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var crypto = require("crypto");
    var events = require("events");
    var http = require("http");
    var url = require("url");
    var OPCODES = {
      CONTINUATION: 0,
      TEXT: 1,
      BINARY: 2,
      TERMINATE: 8,
      PING: 9,
      PONG: 10
    };
    var GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    function isCompleteFrame(frame) {
      return Buffer.byteLength(frame.payload) >= frame.payloadLength;
    }
    function unmaskPayload(payload, mask, offset) {
      if (mask === void 0) {
        return payload;
      }
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[offset + i & 3];
      }
      return payload;
    }
    function buildFrame(opts) {
      const { opcode, fin, data } = opts;
      let offset = 6;
      let dataLength = data.length;
      if (dataLength >= 65536) {
        offset += 8;
        dataLength = 127;
      } else if (dataLength > 125) {
        offset += 2;
        dataLength = 126;
      }
      const head = Buffer.allocUnsafe(offset);
      head[0] = fin ? opcode | 128 : opcode;
      head[1] = dataLength;
      if (dataLength === 126) {
        head.writeUInt16BE(data.length, 2);
      } else if (dataLength === 127) {
        head.writeUInt32BE(0, 2);
        head.writeUInt32BE(data.length, 6);
      }
      const mask = crypto.randomBytes(4);
      head[1] |= 128;
      head[offset - 4] = mask[0];
      head[offset - 3] = mask[1];
      head[offset - 2] = mask[2];
      head[offset - 1] = mask[3];
      const masked = Buffer.alloc(dataLength);
      for (let i = 0; i < dataLength; ++i) {
        masked[i] = data[i] ^ mask[i & 3];
      }
      return Buffer.concat([head, masked]);
    }
    function parseFrame(buffer) {
      const firstByte = buffer.readUInt8(0);
      const isFinalFrame = Boolean(firstByte >>> 7 & 1);
      const opcode = firstByte & 15;
      const secondByte = buffer.readUInt8(1);
      const isMasked = Boolean(secondByte >>> 7 & 1);
      let currentOffset = 2;
      let payloadLength = secondByte & 127;
      if (payloadLength > 125) {
        if (payloadLength === 126) {
          payloadLength = buffer.readUInt16BE(currentOffset);
          currentOffset += 2;
        } else if (payloadLength === 127) {
          const leftPart = buffer.readUInt32BE(currentOffset);
          currentOffset += 4;
          if (leftPart >= Number.MAX_SAFE_INTEGER) {
            throw new Error("Unsupported WebSocket frame: payload length > 2^53 - 1");
          }
          const rightPart = buffer.readUInt32BE(currentOffset);
          currentOffset += 4;
          payloadLength = leftPart * Math.pow(2, 32) + rightPart;
        } else {
          throw new Error("Unknown payload length");
        }
      }
      let mask;
      if (isMasked) {
        mask = buffer.slice(currentOffset, currentOffset + 4);
        currentOffset += 4;
      }
      const payload = unmaskPayload(buffer.slice(currentOffset), mask, 0);
      return {
        fin: isFinalFrame,
        opcode,
        mask,
        payload,
        payloadLength
      };
    }
    function createKey(key) {
      return crypto.createHash("sha1").update(`${key}${GUID}`).digest("base64");
    }
    var WebSocketInterface = class extends events.EventEmitter {
      constructor(socket) {
        super();
        this._unfinishedFrame = void 0;
        this._incompleteFrame = void 0;
        this._socket = socket;
        this._alive = true;
        socket.on("data", (buff) => {
          this._addBuffer(buff);
        });
        socket.on("error", (err) => {
          if (err.code === "ECONNRESET") {
            this.emit("close");
          } else {
            this.emit("error");
          }
        });
        socket.on("close", () => {
          this.end();
        });
      }
      end() {
        if (!this._alive) {
          return;
        }
        this._alive = false;
        this.emit("close");
        this._socket.end();
      }
      send(buff) {
        this._sendFrame({
          opcode: OPCODES.TEXT,
          fin: true,
          data: Buffer.from(buff)
        });
      }
      _sendFrame(frameOpts) {
        this._socket.write(buildFrame(frameOpts));
      }
      _completeFrame(frame) {
        const { _unfinishedFrame: unfinishedFrame } = this;
        if (unfinishedFrame !== void 0) {
          if (frame.opcode === OPCODES.CONTINUATION) {
            unfinishedFrame.payload = Buffer.concat([
              unfinishedFrame.payload,
              unmaskPayload(frame.payload, unfinishedFrame.mask, unfinishedFrame.payload.length)
            ]);
            if (frame.fin) {
              this._unfinishedFrame = void 0;
              this._completeFrame(unfinishedFrame);
            }
            return;
          } else {
            this._unfinishedFrame = void 0;
          }
        }
        if (frame.fin) {
          if (frame.opcode === OPCODES.PING) {
            this._sendFrame({
              opcode: OPCODES.PONG,
              fin: true,
              data: frame.payload
            });
          } else {
            let excess;
            if (frame.payload.length > frame.payloadLength) {
              excess = frame.payload.slice(frame.payloadLength);
              frame.payload = frame.payload.slice(0, frame.payloadLength);
            }
            this.emit("message", frame.payload);
            if (excess !== void 0) {
              this._addBuffer(excess);
            }
          }
        } else {
          this._unfinishedFrame = frame;
        }
      }
      _addBufferToIncompleteFrame(incompleteFrame, buff) {
        incompleteFrame.payload = Buffer.concat([
          incompleteFrame.payload,
          unmaskPayload(buff, incompleteFrame.mask, incompleteFrame.payload.length)
        ]);
        if (isCompleteFrame(incompleteFrame)) {
          this._incompleteFrame = void 0;
          this._completeFrame(incompleteFrame);
        }
      }
      _addBuffer(buff) {
        const { _incompleteFrame: incompleteFrame } = this;
        if (incompleteFrame !== void 0) {
          this._addBufferToIncompleteFrame(incompleteFrame, buff);
          return;
        }
        if (buff.length <= 1) {
          return;
        }
        const frame = parseFrame(buff);
        if (isCompleteFrame(frame)) {
          this._completeFrame(frame);
        } else {
          this._incompleteFrame = frame;
        }
      }
    };
    async function createWebSocketClient(rawUrl) {
      const parts = url.parse(rawUrl);
      return new Promise((resolve2, reject) => {
        const key = crypto.randomBytes(16).toString("base64");
        const digest = createKey(key);
        const req = http.request({
          hostname: parts.hostname,
          port: parts.port,
          path: parts.path,
          method: "GET",
          headers: {
            Connection: "Upgrade",
            Upgrade: "websocket",
            "Sec-WebSocket-Key": key,
            "Sec-WebSocket-Version": "13"
          }
        });
        req.on("response", (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            process.stderr.write(`Unexpected HTTP code: ${res.statusCode}
`);
            res.pipe(process.stderr);
          } else {
            res.pipe(process.stderr);
          }
        });
        req.on("upgrade", (res, socket) => {
          if (res.headers["sec-websocket-accept"] !== digest) {
            socket.end();
            reject(new Error(`Digest mismatch ${digest} !== ${res.headers["sec-websocket-accept"]}`));
            return;
          }
          const client = new WebSocketInterface(socket);
          resolve2(client);
        });
        req.on("error", (err) => {
          reject(err);
        });
        req.end();
      });
    }
    exports.createWebSocketClient = createWebSocketClient;
  }
});

// node_modules/@sentry/node/cjs/anr/debugger.js
var require_debugger = __commonJS({
  "node_modules/@sentry/node/cjs/anr/debugger.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var module$1 = require_module();
    var websocket = require_websocket();
    async function webSocketDebugger(url, onMessage) {
      let id = 0;
      const webSocket = await websocket.createWebSocketClient(url);
      webSocket.on("message", (data) => {
        const message = JSON.parse(data.toString());
        onMessage(message);
      });
      return (method) => {
        webSocket.send(JSON.stringify({ id: id++, method }));
      };
    }
    async function captureStackTrace(url, callback) {
      const sendCommand = await webSocketDebugger(
        url,
        utils.createDebugPauseMessageHandler((cmd) => sendCommand(cmd), module$1.getModuleFromFilename, callback)
      );
      return () => {
        sendCommand("Debugger.enable");
        sendCommand("Debugger.pause");
      };
    }
    exports.captureStackTrace = captureStackTrace;
  }
});

// node_modules/@sentry/node/cjs/anr/index.js
var require_anr2 = __commonJS({
  "node_modules/@sentry/node/cjs/anr/index.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var child_process = require("child_process");
    var core = require_cjs2();
    var utils = require_cjs();
    var _debugger = require_debugger();
    var DEFAULT_INTERVAL = 50;
    var DEFAULT_HANG_THRESHOLD = 5e3;
    function createAnrEvent(blockedMs, frames) {
      return {
        level: "error",
        exception: {
          values: [
            {
              type: "ApplicationNotResponding",
              value: `Application Not Responding for at least ${blockedMs} ms`,
              stacktrace: { frames },
              mechanism: {
                // This ensures the UI doesn't say 'Crashed in' for the stack trace
                type: "ANR"
              }
            }
          ]
        }
      };
    }
    function startInspector(startPort = 9229) {
      const inspector = require("inspector");
      let inspectorUrl = void 0;
      let port = startPort;
      while (inspectorUrl === void 0 && port < startPort + 100) {
        inspector.open(port);
        inspectorUrl = inspector.url();
        port++;
      }
      return inspectorUrl;
    }
    function startChildProcess(options) {
      function log(message, ...args) {
        utils.logger.log(`[ANR] ${message}`, ...args);
      }
      const hub = core.getCurrentHub();
      try {
        const env3 = { ...process.env };
        env3.SENTRY_ANR_CHILD_PROCESS = "true";
        if (options.captureStackTrace) {
          env3.SENTRY_INSPECT_URL = startInspector();
        }
        log(`Spawning child process with execPath:'${process.execPath}' and entryScript:'${options.entryScript}'`);
        const child = child_process.spawn(process.execPath, [options.entryScript], {
          env: env3,
          stdio: utils.logger.isEnabled() ? ["inherit", "inherit", "inherit", "ipc"] : ["ignore", "ignore", "ignore", "ipc"]
        });
        child.unref();
        const timer = setInterval(() => {
          try {
            const currentSession = _optionalChain([hub, "access", (_2) => _2.getScope, "call", (_3) => _3(), "optionalAccess", (_4) => _4.getSession, "call", (_5) => _5()]);
            const session = currentSession ? { ...currentSession, toJSON: void 0 } : void 0;
            child.send({ session });
          } catch (_) {
          }
        }, options.pollInterval);
        child.on("message", (msg) => {
          if (msg === "session-ended") {
            log("ANR event sent from child process. Clearing session in this process.");
            _optionalChain([hub, "access", (_6) => _6.getScope, "call", (_7) => _7(), "optionalAccess", (_8) => _8.setSession, "call", (_9) => _9(void 0)]);
          }
        });
        const end = (type2) => {
          return (...args) => {
            clearInterval(timer);
            log(`Child process ${type2}`, ...args);
          };
        };
        child.on("error", end("error"));
        child.on("disconnect", end("disconnect"));
        child.on("exit", end("exit"));
      } catch (e) {
        log("Failed to start child process", e);
      }
    }
    function createHrTimer() {
      let lastPoll = process.hrtime();
      return {
        getTimeMs: () => {
          const [seconds, nanoSeconds] = process.hrtime(lastPoll);
          return Math.floor(seconds * 1e3 + nanoSeconds / 1e6);
        },
        reset: () => {
          lastPoll = process.hrtime();
        }
      };
    }
    function handleChildProcess(options) {
      process.title = "sentry-anr";
      function log(message) {
        utils.logger.log(`[ANR child process] ${message}`);
      }
      log("Started");
      let session;
      function sendAnrEvent(frames) {
        if (session) {
          log("Sending abnormal session");
          core.updateSession(session, { status: "abnormal", abnormal_mechanism: "anr_foreground" });
          _optionalChain([core.getClient, "call", (_10) => _10(), "optionalAccess", (_11) => _11.sendSession, "call", (_12) => _12(session)]);
          try {
            _optionalChain([process, "access", (_13) => _13.send, "optionalCall", (_14) => _14("session-ended")]);
          } catch (_) {
          }
        }
        core.captureEvent(createAnrEvent(options.anrThreshold, frames));
        void core.flush(3e3).then(() => {
          process.exit();
        });
      }
      core.addEventProcessor((event) => {
        delete event.sdkProcessingMetadata;
        event.tags = {
          ...event.tags,
          "process.name": "ANR"
        };
        return event;
      });
      let debuggerPause;
      if (process.env.SENTRY_INSPECT_URL) {
        log("Connecting to debugger");
        debuggerPause = _debugger.captureStackTrace(process.env.SENTRY_INSPECT_URL, (frames) => {
          log("Capturing event with stack frames");
          sendAnrEvent(frames);
        });
      }
      async function watchdogTimeout() {
        log("Watchdog timeout");
        try {
          const pauseAndCapture = await debuggerPause;
          if (pauseAndCapture) {
            log("Pausing debugger to capture stack trace");
            pauseAndCapture();
            return;
          }
        } catch (_) {
        }
        log("Capturing event");
        sendAnrEvent();
      }
      const { poll } = utils.watchdogTimer(createHrTimer, options.pollInterval, options.anrThreshold, watchdogTimeout);
      process.on("message", (msg) => {
        if (msg.session) {
          session = core.makeSession(msg.session);
        }
        poll();
      });
      process.on("disconnect", () => {
        process.exit();
      });
    }
    function isAnrChildProcess() {
      return !!process.send && !!process.env.SENTRY_ANR_CHILD_PROCESS;
    }
    function enableAnrDetection(options) {
      const entryScript = options.entryScript || process.env.pm_exec_path || process.argv[1];
      const anrOptions = {
        entryScript,
        pollInterval: options.pollInterval || DEFAULT_INTERVAL,
        anrThreshold: options.anrThreshold || DEFAULT_HANG_THRESHOLD,
        captureStackTrace: !!options.captureStackTrace,
        // eslint-disable-next-line deprecation/deprecation
        debug: !!options.debug
      };
      if (isAnrChildProcess()) {
        handleChildProcess(anrOptions);
        return new Promise(() => {
        });
      } else {
        startChildProcess(anrOptions);
        return Promise.resolve();
      }
    }
    exports.enableAnrDetection = enableAnrDetection;
    exports.isAnrChildProcess = isAnrChildProcess;
  }
});

// node_modules/@sentry/node/cjs/nodeVersion.js
var require_nodeVersion = __commonJS({
  "node_modules/@sentry/node/cjs/nodeVersion.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var NODE_VERSION = utils.parseSemver(process.versions.node);
    exports.NODE_VERSION = NODE_VERSION;
  }
});

// node_modules/@sentry/node/cjs/async/domain.js
var require_domain = __commonJS({
  "node_modules/@sentry/node/cjs/async/domain.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var domain = require("domain");
    var core = require_cjs2();
    function getActiveDomain() {
      return domain.active;
    }
    function getCurrentHub2() {
      const activeDomain = getActiveDomain();
      if (!activeDomain) {
        return void 0;
      }
      core.ensureHubOnCarrier(activeDomain);
      return core.getHubFromCarrier(activeDomain);
    }
    function createNewHub(parent) {
      const carrier = {};
      core.ensureHubOnCarrier(carrier, parent);
      return core.getHubFromCarrier(carrier);
    }
    function runWithAsyncContext(callback, options) {
      const activeDomain = getActiveDomain();
      if (activeDomain && _optionalChain([options, "optionalAccess", (_) => _.reuseExisting])) {
        return callback();
      }
      const local = domain.create();
      const parentHub = activeDomain ? core.getHubFromCarrier(activeDomain) : void 0;
      const newHub = createNewHub(parentHub);
      core.setHubOnCarrier(local, newHub);
      return local.bind(() => {
        return callback();
      })();
    }
    function setDomainAsyncContextStrategy() {
      core.setAsyncContextStrategy({ getCurrentHub: getCurrentHub2, runWithAsyncContext });
    }
    exports.setDomainAsyncContextStrategy = setDomainAsyncContextStrategy;
  }
});

// node_modules/@sentry/node/cjs/async/hooks.js
var require_hooks = __commonJS({
  "node_modules/@sentry/node/cjs/async/hooks.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var async_hooks = require("async_hooks");
    var asyncStorage;
    function setHooksAsyncContextStrategy() {
      if (!asyncStorage) {
        asyncStorage = new async_hooks.AsyncLocalStorage();
      }
      function getCurrentHub2() {
        return asyncStorage.getStore();
      }
      function createNewHub(parent) {
        const carrier = {};
        core.ensureHubOnCarrier(carrier, parent);
        return core.getHubFromCarrier(carrier);
      }
      function runWithAsyncContext(callback, options) {
        const existingHub = getCurrentHub2();
        if (existingHub && _optionalChain([options, "optionalAccess", (_) => _.reuseExisting])) {
          return callback();
        }
        const newHub = createNewHub(existingHub);
        return asyncStorage.run(newHub, () => {
          return callback();
        });
      }
      core.setAsyncContextStrategy({ getCurrentHub: getCurrentHub2, runWithAsyncContext });
    }
    exports.setHooksAsyncContextStrategy = setHooksAsyncContextStrategy;
  }
});

// node_modules/@sentry/node/cjs/async/index.js
var require_async = __commonJS({
  "node_modules/@sentry/node/cjs/async/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var nodeVersion = require_nodeVersion();
    var domain = require_domain();
    var hooks = require_hooks();
    function setNodeAsyncContextStrategy() {
      if (nodeVersion.NODE_VERSION.major && nodeVersion.NODE_VERSION.major >= 14) {
        hooks.setHooksAsyncContextStrategy();
      } else {
        domain.setDomainAsyncContextStrategy();
      }
    }
    exports.setNodeAsyncContextStrategy = setNodeAsyncContextStrategy;
  }
});

// node_modules/@sentry/node/cjs/integrations/console.js
var require_console2 = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/console.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var util = require("util");
    var core = require_cjs2();
    var utils = require_cjs();
    var Console = class {
      constructor() {
        Console.prototype.__init.call(this);
      }
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Console";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = Console.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
        utils.addConsoleInstrumentationHandler(({ args, level }) => {
          const hub = core.getCurrentHub();
          if (!hub.getIntegration(Console)) {
            return;
          }
          hub.addBreadcrumb(
            {
              category: "console",
              level: utils.severityLevelFromString(level),
              message: util.format.apply(void 0, args)
            },
            {
              input: [...args],
              level
            }
          );
        });
      }
    };
    Console.__initStatic();
    exports.Console = Console;
  }
});

// node_modules/@sentry/node/cjs/debug-build.js
var require_debug_build4 = __commonJS({
  "node_modules/@sentry/node/cjs/debug-build.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
    exports.DEBUG_BUILD = DEBUG_BUILD;
  }
});

// node_modules/@sentry/node/cjs/integrations/utils/http.js
var require_http2 = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/utils/http.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var url = require("url");
    var nodeVersion = require_nodeVersion();
    function extractRawUrl(requestOptions) {
      const { protocol, hostname, port } = parseRequestOptions(requestOptions);
      const path = requestOptions.path ? requestOptions.path : "/";
      return `${protocol}//${hostname}${port}${path}`;
    }
    function extractUrl(requestOptions) {
      const { protocol, hostname, port } = parseRequestOptions(requestOptions);
      const path = requestOptions.pathname || "/";
      const authority = requestOptions.auth ? redactAuthority(requestOptions.auth) : "";
      return `${protocol}//${authority}${hostname}${port}${path}`;
    }
    function redactAuthority(auth) {
      const [user, password] = auth.split(":");
      return `${user ? "[Filtered]" : ""}:${password ? "[Filtered]" : ""}@`;
    }
    function cleanSpanDescription(description, requestOptions, request) {
      if (!description) {
        return description;
      }
      let [method, requestUrl] = description.split(" ");
      if (requestOptions.host && !requestOptions.protocol) {
        requestOptions.protocol = _optionalChain([request, "optionalAccess", (_) => _.agent, "optionalAccess", (_2) => _2.protocol]);
        requestUrl = extractUrl(requestOptions);
      }
      if (_optionalChain([requestUrl, "optionalAccess", (_3) => _3.startsWith, "call", (_4) => _4("///")])) {
        requestUrl = requestUrl.slice(2);
      }
      return `${method} ${requestUrl}`;
    }
    function urlToOptions(url2) {
      const options = {
        protocol: url2.protocol,
        hostname: typeof url2.hostname === "string" && url2.hostname.startsWith("[") ? url2.hostname.slice(1, -1) : url2.hostname,
        hash: url2.hash,
        search: url2.search,
        pathname: url2.pathname,
        path: `${url2.pathname || ""}${url2.search || ""}`,
        href: url2.href
      };
      if (url2.port !== "") {
        options.port = Number(url2.port);
      }
      if (url2.username || url2.password) {
        options.auth = `${url2.username}:${url2.password}`;
      }
      return options;
    }
    function normalizeRequestArgs(httpModule, requestArgs) {
      let callback, requestOptions;
      if (typeof requestArgs[requestArgs.length - 1] === "function") {
        callback = requestArgs.pop();
      }
      if (typeof requestArgs[0] === "string") {
        requestOptions = urlToOptions(new url.URL(requestArgs[0]));
      } else if (requestArgs[0] instanceof url.URL) {
        requestOptions = urlToOptions(requestArgs[0]);
      } else {
        requestOptions = requestArgs[0];
        try {
          const parsed = new url.URL(
            requestOptions.path || "",
            `${requestOptions.protocol || "http:"}//${requestOptions.hostname}`
          );
          requestOptions = {
            pathname: parsed.pathname,
            search: parsed.search,
            hash: parsed.hash,
            ...requestOptions
          };
        } catch (e) {
        }
      }
      if (requestArgs.length === 2) {
        requestOptions = { ...requestOptions, ...requestArgs[1] };
      }
      if (requestOptions.protocol === void 0) {
        if (nodeVersion.NODE_VERSION.major && nodeVersion.NODE_VERSION.major > 8) {
          requestOptions.protocol = _optionalChain([_optionalChain([httpModule, "optionalAccess", (_5) => _5.globalAgent]), "optionalAccess", (_6) => _6.protocol]) || _optionalChain([requestOptions.agent, "optionalAccess", (_7) => _7.protocol]) || _optionalChain([requestOptions._defaultAgent, "optionalAccess", (_8) => _8.protocol]);
        } else {
          requestOptions.protocol = _optionalChain([requestOptions.agent, "optionalAccess", (_9) => _9.protocol]) || _optionalChain([requestOptions._defaultAgent, "optionalAccess", (_10) => _10.protocol]) || _optionalChain([_optionalChain([httpModule, "optionalAccess", (_11) => _11.globalAgent]), "optionalAccess", (_12) => _12.protocol]);
        }
      }
      if (callback) {
        return [requestOptions, callback];
      } else {
        return [requestOptions];
      }
    }
    function parseRequestOptions(requestOptions) {
      const protocol = requestOptions.protocol || "";
      const hostname = requestOptions.hostname || requestOptions.host || "";
      const port = !requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`;
      return { protocol, hostname, port };
    }
    exports.cleanSpanDescription = cleanSpanDescription;
    exports.extractRawUrl = extractRawUrl;
    exports.extractUrl = extractUrl;
    exports.normalizeRequestArgs = normalizeRequestArgs;
    exports.urlToOptions = urlToOptions;
  }
});

// node_modules/@sentry/node/cjs/integrations/http.js
var require_http3 = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/http.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build4();
    var nodeVersion = require_nodeVersion();
    var http = require_http2();
    var Http = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Http";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = Http.id;
      }
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        Http.prototype.__init.call(this);
        this._breadcrumbs = typeof options.breadcrumbs === "undefined" ? true : options.breadcrumbs;
        this._tracing = !options.tracing ? void 0 : options.tracing === true ? {} : options.tracing;
      }
      /**
       * @inheritDoc
       */
      setupOnce(_addGlobalEventProcessor, setupOnceGetCurrentHub) {
        if (!this._breadcrumbs && !this._tracing) {
          return;
        }
        const clientOptions = _optionalChain([setupOnceGetCurrentHub, "call", (_) => _(), "access", (_2) => _2.getClient, "call", (_3) => _3(), "optionalAccess", (_4) => _4.getOptions, "call", (_5) => _5()]);
        if (clientOptions && clientOptions.instrumenter !== "sentry") {
          debugBuild.DEBUG_BUILD && utils.logger.log("HTTP Integration is skipped because of instrumenter configuration.");
          return;
        }
        const shouldCreateSpanForRequest = (
          // eslint-disable-next-line deprecation/deprecation
          _optionalChain([this, "access", (_6) => _6._tracing, "optionalAccess", (_7) => _7.shouldCreateSpanForRequest]) || _optionalChain([clientOptions, "optionalAccess", (_8) => _8.shouldCreateSpanForRequest])
        );
        const tracePropagationTargets = _optionalChain([clientOptions, "optionalAccess", (_9) => _9.tracePropagationTargets]) || _optionalChain([this, "access", (_10) => _10._tracing, "optionalAccess", (_11) => _11.tracePropagationTargets]);
        const httpModule = require("http");
        const wrappedHttpHandlerMaker = _createWrappedRequestMethodFactory(
          httpModule,
          this._breadcrumbs,
          shouldCreateSpanForRequest,
          tracePropagationTargets
        );
        utils.fill(httpModule, "get", wrappedHttpHandlerMaker);
        utils.fill(httpModule, "request", wrappedHttpHandlerMaker);
        if (nodeVersion.NODE_VERSION.major && nodeVersion.NODE_VERSION.major > 8) {
          const httpsModule = require("https");
          const wrappedHttpsHandlerMaker = _createWrappedRequestMethodFactory(
            httpsModule,
            this._breadcrumbs,
            shouldCreateSpanForRequest,
            tracePropagationTargets
          );
          utils.fill(httpsModule, "get", wrappedHttpsHandlerMaker);
          utils.fill(httpsModule, "request", wrappedHttpsHandlerMaker);
        }
      }
    };
    Http.__initStatic();
    function _createWrappedRequestMethodFactory(httpModule, breadcrumbsEnabled, shouldCreateSpanForRequest, tracePropagationTargets) {
      const createSpanUrlMap = new utils.LRUMap(100);
      const headersUrlMap = new utils.LRUMap(100);
      const shouldCreateSpan = (url) => {
        if (shouldCreateSpanForRequest === void 0) {
          return true;
        }
        const cachedDecision = createSpanUrlMap.get(url);
        if (cachedDecision !== void 0) {
          return cachedDecision;
        }
        const decision = shouldCreateSpanForRequest(url);
        createSpanUrlMap.set(url, decision);
        return decision;
      };
      const shouldAttachTraceData = (url) => {
        if (tracePropagationTargets === void 0) {
          return true;
        }
        const cachedDecision = headersUrlMap.get(url);
        if (cachedDecision !== void 0) {
          return cachedDecision;
        }
        const decision = utils.stringMatchesSomePattern(url, tracePropagationTargets);
        headersUrlMap.set(url, decision);
        return decision;
      };
      function addRequestBreadcrumb(event, requestSpanData, req, res) {
        if (!core.getCurrentHub().getIntegration(Http)) {
          return;
        }
        core.getCurrentHub().addBreadcrumb(
          {
            category: "http",
            data: {
              status_code: res && res.statusCode,
              ...requestSpanData
            },
            type: "http"
          },
          {
            event,
            request: req,
            response: res
          }
        );
      }
      return function wrappedRequestMethodFactory(originalRequestMethod) {
        return function wrappedMethod(...args) {
          const requestArgs = http.normalizeRequestArgs(httpModule, args);
          const requestOptions = requestArgs[0];
          const rawRequestUrl = http.extractRawUrl(requestOptions);
          const requestUrl = http.extractUrl(requestOptions);
          if (core.isSentryRequestUrl(requestUrl, core.getCurrentHub())) {
            return originalRequestMethod.apply(httpModule, requestArgs);
          }
          const hub = core.getCurrentHub();
          const scope = hub.getScope();
          const parentSpan = scope.getSpan();
          const data = getRequestSpanData(requestUrl, requestOptions);
          const requestSpan = shouldCreateSpan(rawRequestUrl) ? _optionalChain([parentSpan, "optionalAccess", (_12) => _12.startChild, "call", (_13) => _13({
            op: "http.client",
            origin: "auto.http.node.http",
            description: `${data["http.method"]} ${data.url}`,
            data
          })]) : void 0;
          if (shouldAttachTraceData(rawRequestUrl)) {
            if (requestSpan) {
              const sentryTraceHeader = requestSpan.toTraceparent();
              const dynamicSamplingContext = _optionalChain([requestSpan, "optionalAccess", (_14) => _14.transaction, "optionalAccess", (_15) => _15.getDynamicSamplingContext, "call", (_16) => _16()]);
              addHeadersToRequestOptions(requestOptions, requestUrl, sentryTraceHeader, dynamicSamplingContext);
            } else {
              const client = hub.getClient();
              const { traceId, sampled, dsc } = scope.getPropagationContext();
              const sentryTraceHeader = utils.generateSentryTraceHeader(traceId, void 0, sampled);
              const dynamicSamplingContext = dsc || (client ? core.getDynamicSamplingContextFromClient(traceId, client, scope) : void 0);
              addHeadersToRequestOptions(requestOptions, requestUrl, sentryTraceHeader, dynamicSamplingContext);
            }
          } else {
            debugBuild.DEBUG_BUILD && utils.logger.log(
              `[Tracing] Not adding sentry-trace header to outgoing request (${requestUrl}) due to mismatching tracePropagationTargets option.`
            );
          }
          return originalRequestMethod.apply(httpModule, requestArgs).once("response", function(res) {
            const req = this;
            if (breadcrumbsEnabled) {
              addRequestBreadcrumb("response", data, req, res);
            }
            if (requestSpan) {
              if (res.statusCode) {
                requestSpan.setHttpStatus(res.statusCode);
              }
              requestSpan.description = http.cleanSpanDescription(requestSpan.description, requestOptions, req);
              requestSpan.finish();
            }
          }).once("error", function() {
            const req = this;
            if (breadcrumbsEnabled) {
              addRequestBreadcrumb("error", data, req);
            }
            if (requestSpan) {
              requestSpan.setHttpStatus(500);
              requestSpan.description = http.cleanSpanDescription(requestSpan.description, requestOptions, req);
              requestSpan.finish();
            }
          });
        };
      };
    }
    function addHeadersToRequestOptions(requestOptions, requestUrl, sentryTraceHeader, dynamicSamplingContext) {
      const headers = requestOptions.headers || {};
      if (headers["sentry-trace"]) {
        return;
      }
      debugBuild.DEBUG_BUILD && utils.logger.log(`[Tracing] Adding sentry-trace header ${sentryTraceHeader} to outgoing request to "${requestUrl}": `);
      const sentryBaggage = utils.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext);
      const sentryBaggageHeader = sentryBaggage && sentryBaggage.length > 0 ? normalizeBaggageHeader(requestOptions, sentryBaggage) : void 0;
      requestOptions.headers = {
        ...requestOptions.headers,
        "sentry-trace": sentryTraceHeader,
        // Setting a header to `undefined` will crash in node so we only set the baggage header when it's defined
        ...sentryBaggageHeader && { baggage: sentryBaggageHeader }
      };
    }
    function getRequestSpanData(requestUrl, requestOptions) {
      const method = requestOptions.method || "GET";
      const data = {
        url: requestUrl,
        "http.method": method
      };
      if (requestOptions.hash) {
        data["http.fragment"] = requestOptions.hash.substring(1);
      }
      if (requestOptions.search) {
        data["http.query"] = requestOptions.search.substring(1);
      }
      return data;
    }
    function normalizeBaggageHeader(requestOptions, sentryBaggageHeader) {
      if (!requestOptions.headers || !requestOptions.headers.baggage) {
        return sentryBaggageHeader;
      } else if (!sentryBaggageHeader) {
        return requestOptions.headers.baggage;
      } else if (Array.isArray(requestOptions.headers.baggage)) {
        return [...requestOptions.headers.baggage, sentryBaggageHeader];
      }
      return [requestOptions.headers.baggage, sentryBaggageHeader];
    }
    exports.Http = Http;
  }
});

// node_modules/@sentry/node/cjs/integrations/utils/errorhandling.js
var require_errorhandling = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/utils/errorhandling.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build4();
    var DEFAULT_SHUTDOWN_TIMEOUT = 2e3;
    function logAndExitProcess(error) {
      utils.consoleSandbox(() => {
        console.error(error);
      });
      const client = core.getClient();
      if (client === void 0) {
        debugBuild.DEBUG_BUILD && utils.logger.warn("No NodeClient was defined, we are exiting the process now.");
        global.process.exit(1);
      }
      const options = client.getOptions();
      const timeout = options && options.shutdownTimeout && options.shutdownTimeout > 0 && options.shutdownTimeout || DEFAULT_SHUTDOWN_TIMEOUT;
      client.close(timeout).then(
        (result) => {
          if (!result) {
            debugBuild.DEBUG_BUILD && utils.logger.warn("We reached the timeout for emptying the request buffer, still exiting now!");
          }
          global.process.exit(1);
        },
        (error2) => {
          debugBuild.DEBUG_BUILD && utils.logger.error(error2);
        }
      );
    }
    exports.logAndExitProcess = logAndExitProcess;
  }
});

// node_modules/@sentry/node/cjs/integrations/onuncaughtexception.js
var require_onuncaughtexception = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/onuncaughtexception.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build4();
    var errorhandling = require_errorhandling();
    var OnUncaughtException = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "OnUncaughtException";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = OnUncaughtException.id;
      }
      /**
       * @inheritDoc
       */
      __init2() {
        this.handler = this._makeErrorHandler();
      }
      // CAREFUL: Please think twice before updating the way _options looks because the Next.js SDK depends on it in `index.server.ts`
      /**
       * @inheritDoc
       */
      constructor(options = {}) {
        OnUncaughtException.prototype.__init.call(this);
        OnUncaughtException.prototype.__init2.call(this);
        this._options = {
          exitEvenIfOtherHandlersAreRegistered: true,
          ...options
        };
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
        global.process.on("uncaughtException", this.handler);
      }
      /**
       * @hidden
       */
      _makeErrorHandler() {
        const timeout = 2e3;
        let caughtFirstError = false;
        let caughtSecondError = false;
        let calledFatalError = false;
        let firstError;
        return (error) => {
          let onFatalError = errorhandling.logAndExitProcess;
          const client = core.getClient();
          if (this._options.onFatalError) {
            onFatalError = this._options.onFatalError;
          } else if (client && client.getOptions().onFatalError) {
            onFatalError = client.getOptions().onFatalError;
          }
          const userProvidedListenersCount = global.process.listeners("uncaughtException").reduce((acc, listener) => {
            if (
              // There are 3 listeners we ignore:
              listener.name === "domainUncaughtExceptionClear" || // as soon as we're using domains this listener is attached by node itself
              listener.tag && listener.tag === "sentry_tracingErrorCallback" || // the handler we register for tracing
              listener === this.handler
            ) {
              return acc;
            } else {
              return acc + 1;
            }
          }, 0);
          const processWouldExit = userProvidedListenersCount === 0;
          const shouldApplyFatalHandlingLogic = this._options.exitEvenIfOtherHandlersAreRegistered || processWouldExit;
          if (!caughtFirstError) {
            const hub = core.getCurrentHub();
            firstError = error;
            caughtFirstError = true;
            if (hub.getIntegration(OnUncaughtException)) {
              hub.withScope((scope) => {
                scope.setLevel("fatal");
                hub.captureException(error, {
                  originalException: error,
                  data: { mechanism: { handled: false, type: "onuncaughtexception" } }
                });
                if (!calledFatalError && shouldApplyFatalHandlingLogic) {
                  calledFatalError = true;
                  onFatalError(error);
                }
              });
            } else {
              if (!calledFatalError && shouldApplyFatalHandlingLogic) {
                calledFatalError = true;
                onFatalError(error);
              }
            }
          } else {
            if (shouldApplyFatalHandlingLogic) {
              if (calledFatalError) {
                debugBuild.DEBUG_BUILD && utils.logger.warn(
                  "uncaught exception after calling fatal error shutdown callback - this is bad! forcing shutdown"
                );
                errorhandling.logAndExitProcess(error);
              } else if (!caughtSecondError) {
                caughtSecondError = true;
                setTimeout(() => {
                  if (!calledFatalError) {
                    calledFatalError = true;
                    onFatalError(firstError, error);
                  }
                }, timeout);
              }
            }
          }
        };
      }
    };
    OnUncaughtException.__initStatic();
    exports.OnUncaughtException = OnUncaughtException;
  }
});

// node_modules/@sentry/node/cjs/integrations/onunhandledrejection.js
var require_onunhandledrejection = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/onunhandledrejection.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var errorhandling = require_errorhandling();
    var OnUnhandledRejection = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "OnUnhandledRejection";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = OnUnhandledRejection.id;
      }
      /**
       * @inheritDoc
       */
      constructor(_options = { mode: "warn" }) {
        this._options = _options;
        OnUnhandledRejection.prototype.__init.call(this);
      }
      /**
       * @inheritDoc
       */
      setupOnce() {
        global.process.on("unhandledRejection", this.sendUnhandledPromise.bind(this));
      }
      /**
       * Send an exception with reason
       * @param reason string
       * @param promise promise
       */
      sendUnhandledPromise(reason, promise) {
        const hub = core.getCurrentHub();
        if (hub.getIntegration(OnUnhandledRejection)) {
          hub.withScope((scope) => {
            scope.setExtra("unhandledPromiseRejection", true);
            hub.captureException(reason, {
              originalException: promise,
              data: { mechanism: { handled: false, type: "onunhandledrejection" } }
            });
          });
        }
        this._handleRejection(reason);
      }
      /**
       * Handler for `mode` option
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _handleRejection(reason) {
        const rejectionWarning = "This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason:";
        if (this._options.mode === "warn") {
          utils.consoleSandbox(() => {
            console.warn(rejectionWarning);
            console.error(reason && reason.stack ? reason.stack : reason);
          });
        } else if (this._options.mode === "strict") {
          utils.consoleSandbox(() => {
            console.warn(rejectionWarning);
          });
          errorhandling.logAndExitProcess(reason);
        }
      }
    };
    OnUnhandledRejection.__initStatic();
    exports.OnUnhandledRejection = OnUnhandledRejection;
  }
});

// node_modules/@sentry/node/cjs/integrations/modules.js
var require_modules = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/modules.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var path = require("path");
    var moduleCache;
    function getPaths() {
      try {
        return require.cache ? Object.keys(require.cache) : [];
      } catch (e) {
        return [];
      }
    }
    function collectModules() {
      const mainPaths = require.main && require.main.paths || [];
      const paths = getPaths();
      const infos = {};
      const seen = {};
      paths.forEach((path$1) => {
        let dir = path$1;
        const updir = () => {
          const orig = dir;
          dir = path.dirname(orig);
          if (!dir || orig === dir || seen[orig]) {
            return void 0;
          }
          if (mainPaths.indexOf(dir) < 0) {
            return updir();
          }
          const pkgfile = path.join(orig, "package.json");
          seen[orig] = true;
          if (!fs.existsSync(pkgfile)) {
            return updir();
          }
          try {
            const info = JSON.parse(fs.readFileSync(pkgfile, "utf8"));
            infos[info.name] = info.version;
          } catch (_oO) {
          }
        };
        updir();
      });
      return infos;
    }
    var Modules = class {
      constructor() {
        Modules.prototype.__init.call(this);
      }
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Modules";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = Modules.id;
      }
      /**
       * @inheritDoc
       */
      setupOnce(addGlobalEventProcessor, getCurrentHub2) {
        addGlobalEventProcessor((event) => {
          if (!getCurrentHub2().getIntegration(Modules)) {
            return event;
          }
          return {
            ...event,
            modules: {
              ...event.modules,
              ...this._getModules()
            }
          };
        });
      }
      /** Fetches the list of modules and the versions loaded by the entry file for your node.js app. */
      _getModules() {
        if (!moduleCache) {
          moduleCache = collectModules();
        }
        return moduleCache;
      }
    };
    Modules.__initStatic();
    exports.Modules = Modules;
  }
});

// node_modules/@sentry/node/cjs/integrations/contextlines.js
var require_contextlines = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/contextlines.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var utils = require_cjs();
    var FILE_CONTENT_CACHE = new utils.LRUMap(100);
    var DEFAULT_LINES_OF_CONTEXT = 7;
    function readTextFileAsync(path) {
      return new Promise((resolve2, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
          if (err)
            reject(err);
          else
            resolve2(data);
        });
      });
    }
    var ContextLines = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "ContextLines";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = ContextLines.id;
      }
      constructor(_options = {}) {
        this._options = _options;
        ContextLines.prototype.__init.call(this);
      }
      /** Get's the number of context lines to add */
      get _contextLines() {
        return this._options.frameContextLines !== void 0 ? this._options.frameContextLines : DEFAULT_LINES_OF_CONTEXT;
      }
      /**
       * @inheritDoc
       */
      setupOnce(addGlobalEventProcessor, getCurrentHub2) {
        addGlobalEventProcessor((event) => {
          const self2 = getCurrentHub2().getIntegration(ContextLines);
          if (!self2) {
            return event;
          }
          return this.addSourceContext(event);
        });
      }
      /** Processes an event and adds context lines */
      async addSourceContext(event) {
        const enqueuedReadSourceFileTasks = {};
        const readSourceFileTasks = [];
        if (this._contextLines > 0 && _optionalChain([event, "access", (_2) => _2.exception, "optionalAccess", (_3) => _3.values])) {
          for (const exception of event.exception.values) {
            if (!_optionalChain([exception, "access", (_4) => _4.stacktrace, "optionalAccess", (_5) => _5.frames])) {
              continue;
            }
            for (let i = exception.stacktrace.frames.length - 1; i >= 0; i--) {
              const frame = exception.stacktrace.frames[i];
              if (frame.filename && !enqueuedReadSourceFileTasks[frame.filename] && !FILE_CONTENT_CACHE.get(frame.filename)) {
                readSourceFileTasks.push(_readSourceFile(frame.filename));
                enqueuedReadSourceFileTasks[frame.filename] = 1;
              }
            }
          }
        }
        if (readSourceFileTasks.length > 0) {
          await Promise.all(readSourceFileTasks);
        }
        if (this._contextLines > 0 && _optionalChain([event, "access", (_6) => _6.exception, "optionalAccess", (_7) => _7.values])) {
          for (const exception of event.exception.values) {
            if (exception.stacktrace && exception.stacktrace.frames) {
              await this.addSourceContextToFrames(exception.stacktrace.frames);
            }
          }
        }
        return event;
      }
      /** Adds context lines to frames */
      addSourceContextToFrames(frames) {
        for (const frame of frames) {
          if (frame.filename && frame.context_line === void 0) {
            const sourceFileLines = FILE_CONTENT_CACHE.get(frame.filename);
            if (sourceFileLines) {
              try {
                utils.addContextToFrame(sourceFileLines, frame, this._contextLines);
              } catch (e) {
              }
            }
          }
        }
      }
    };
    ContextLines.__initStatic();
    async function _readSourceFile(filename) {
      const cachedFile = FILE_CONTENT_CACHE.get(filename);
      if (cachedFile === null) {
        return null;
      }
      if (cachedFile !== void 0) {
        return cachedFile;
      }
      let content = null;
      try {
        const rawFileContents = await readTextFileAsync(filename);
        content = rawFileContents.split("\n");
      } catch (_) {
      }
      FILE_CONTENT_CACHE.set(filename, content);
      return content;
    }
    exports.ContextLines = ContextLines;
  }
});

// node_modules/@sentry/node/cjs/integrations/context.js
var require_context = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/context.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var child_process = require("child_process");
    var fs = require("fs");
    var os2 = require("os");
    var path = require("path");
    var util = require("util");
    var readFileAsync = util.promisify(fs.readFile);
    var readDirAsync = util.promisify(fs.readdir);
    var Context = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Context";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = Context.id;
      }
      /**
       * Caches context so it's only evaluated once
       */
      constructor(_options = {
        app: true,
        os: true,
        device: true,
        culture: true,
        cloudResource: true
      }) {
        this._options = _options;
        Context.prototype.__init.call(this);
      }
      /**
       * @inheritDoc
       */
      setupOnce(addGlobalEventProcessor) {
        addGlobalEventProcessor((event) => this.addContext(event));
      }
      /** Processes an event and adds context */
      async addContext(event) {
        if (this._cachedContext === void 0) {
          this._cachedContext = this._getContexts();
        }
        const updatedContext = this._updateContext(await this._cachedContext);
        event.contexts = {
          ...event.contexts,
          app: { ...updatedContext.app, ..._optionalChain([event, "access", (_) => _.contexts, "optionalAccess", (_2) => _2.app]) },
          os: { ...updatedContext.os, ..._optionalChain([event, "access", (_3) => _3.contexts, "optionalAccess", (_4) => _4.os]) },
          device: { ...updatedContext.device, ..._optionalChain([event, "access", (_5) => _5.contexts, "optionalAccess", (_6) => _6.device]) },
          culture: { ...updatedContext.culture, ..._optionalChain([event, "access", (_7) => _7.contexts, "optionalAccess", (_8) => _8.culture]) },
          cloud_resource: { ...updatedContext.cloud_resource, ..._optionalChain([event, "access", (_9) => _9.contexts, "optionalAccess", (_10) => _10.cloud_resource]) }
        };
        return event;
      }
      /**
       * Updates the context with dynamic values that can change
       */
      _updateContext(contexts) {
        if (_optionalChain([contexts, "optionalAccess", (_11) => _11.app, "optionalAccess", (_12) => _12.app_memory])) {
          contexts.app.app_memory = process.memoryUsage().rss;
        }
        if (_optionalChain([contexts, "optionalAccess", (_13) => _13.device, "optionalAccess", (_14) => _14.free_memory])) {
          contexts.device.free_memory = os2.freemem();
        }
        return contexts;
      }
      /**
       * Gets the contexts for the current environment
       */
      async _getContexts() {
        const contexts = {};
        if (this._options.os) {
          contexts.os = await getOsContext();
        }
        if (this._options.app) {
          contexts.app = getAppContext();
        }
        if (this._options.device) {
          contexts.device = getDeviceContext(this._options.device);
        }
        if (this._options.culture) {
          const culture = getCultureContext();
          if (culture) {
            contexts.culture = culture;
          }
        }
        if (this._options.cloudResource) {
          contexts.cloud_resource = getCloudResourceContext();
        }
        return contexts;
      }
    };
    Context.__initStatic();
    async function getOsContext() {
      const platformId = os2.platform();
      switch (platformId) {
        case "darwin":
          return getDarwinInfo();
        case "linux":
          return getLinuxInfo();
        default:
          return {
            name: PLATFORM_NAMES[platformId] || platformId,
            version: os2.release()
          };
      }
    }
    function getCultureContext() {
      try {
        if (typeof process.versions.icu !== "string") {
          return;
        }
        const january = /* @__PURE__ */ new Date(9e8);
        const spanish = new Intl.DateTimeFormat("es", { month: "long" });
        if (spanish.format(january) === "enero") {
          const options = Intl.DateTimeFormat().resolvedOptions();
          return {
            locale: options.locale,
            timezone: options.timeZone
          };
        }
      } catch (err) {
      }
      return;
    }
    function getAppContext() {
      const app_memory = process.memoryUsage().rss;
      const app_start_time = new Date(Date.now() - process.uptime() * 1e3).toISOString();
      return { app_start_time, app_memory };
    }
    function getDeviceContext(deviceOpt) {
      const device = {};
      let uptime;
      try {
        uptime = os2.uptime && os2.uptime();
      } catch (e) {
      }
      if (typeof uptime === "number") {
        device.boot_time = new Date(Date.now() - uptime * 1e3).toISOString();
      }
      device.arch = os2.arch();
      if (deviceOpt === true || deviceOpt.memory) {
        device.memory_size = os2.totalmem();
        device.free_memory = os2.freemem();
      }
      if (deviceOpt === true || deviceOpt.cpu) {
        const cpuInfo = os2.cpus();
        if (cpuInfo && cpuInfo.length) {
          const firstCpu = cpuInfo[0];
          device.processor_count = cpuInfo.length;
          device.cpu_description = firstCpu.model;
          device.processor_frequency = firstCpu.speed;
        }
      }
      return device;
    }
    var PLATFORM_NAMES = {
      aix: "IBM AIX",
      freebsd: "FreeBSD",
      openbsd: "OpenBSD",
      sunos: "SunOS",
      win32: "Windows"
    };
    var LINUX_DISTROS = [
      { name: "fedora-release", distros: ["Fedora"] },
      { name: "redhat-release", distros: ["Red Hat Linux", "Centos"] },
      { name: "redhat_version", distros: ["Red Hat Linux"] },
      { name: "SuSE-release", distros: ["SUSE Linux"] },
      { name: "lsb-release", distros: ["Ubuntu Linux", "Arch Linux"] },
      { name: "debian_version", distros: ["Debian"] },
      { name: "debian_release", distros: ["Debian"] },
      { name: "arch-release", distros: ["Arch Linux"] },
      { name: "gentoo-release", distros: ["Gentoo Linux"] },
      { name: "novell-release", distros: ["SUSE Linux"] },
      { name: "alpine-release", distros: ["Alpine Linux"] }
    ];
    var LINUX_VERSIONS = {
      alpine: (content) => content,
      arch: (content) => matchFirst(/distrib_release=(.*)/, content),
      centos: (content) => matchFirst(/release ([^ ]+)/, content),
      debian: (content) => content,
      fedora: (content) => matchFirst(/release (..)/, content),
      mint: (content) => matchFirst(/distrib_release=(.*)/, content),
      red: (content) => matchFirst(/release ([^ ]+)/, content),
      suse: (content) => matchFirst(/VERSION = (.*)\n/, content),
      ubuntu: (content) => matchFirst(/distrib_release=(.*)/, content)
    };
    function matchFirst(regex, text) {
      const match = regex.exec(text);
      return match ? match[1] : void 0;
    }
    async function getDarwinInfo() {
      const darwinInfo = {
        kernel_version: os2.release(),
        name: "Mac OS X",
        version: `10.${Number(os2.release().split(".")[0]) - 4}`
      };
      try {
        const output = await new Promise((resolve2, reject) => {
          child_process.execFile("/usr/bin/sw_vers", (error, stdout) => {
            if (error) {
              reject(error);
              return;
            }
            resolve2(stdout);
          });
        });
        darwinInfo.name = matchFirst(/^ProductName:\s+(.*)$/m, output);
        darwinInfo.version = matchFirst(/^ProductVersion:\s+(.*)$/m, output);
        darwinInfo.build = matchFirst(/^BuildVersion:\s+(.*)$/m, output);
      } catch (e) {
      }
      return darwinInfo;
    }
    function getLinuxDistroId(name) {
      return name.split(" ")[0].toLowerCase();
    }
    async function getLinuxInfo() {
      const linuxInfo = {
        kernel_version: os2.release(),
        name: "Linux"
      };
      try {
        const etcFiles = await readDirAsync("/etc");
        const distroFile = LINUX_DISTROS.find((file) => etcFiles.includes(file.name));
        if (!distroFile) {
          return linuxInfo;
        }
        const distroPath = path.join("/etc", distroFile.name);
        const contents = (await readFileAsync(distroPath, { encoding: "utf-8" })).toLowerCase();
        const { distros } = distroFile;
        linuxInfo.name = distros.find((d) => contents.indexOf(getLinuxDistroId(d)) >= 0) || distros[0];
        const id = getLinuxDistroId(linuxInfo.name);
        linuxInfo.version = LINUX_VERSIONS[id](contents);
      } catch (e) {
      }
      return linuxInfo;
    }
    function getCloudResourceContext() {
      if (process.env.VERCEL) {
        return {
          "cloud.provider": "vercel",
          "cloud.region": process.env.VERCEL_REGION
        };
      } else if (process.env.AWS_REGION) {
        return {
          "cloud.provider": "aws",
          "cloud.region": process.env.AWS_REGION,
          "cloud.platform": process.env.AWS_EXECUTION_ENV
        };
      } else if (process.env.GCP_PROJECT) {
        return {
          "cloud.provider": "gcp"
        };
      } else if (process.env.ALIYUN_REGION_ID) {
        return {
          "cloud.provider": "alibaba_cloud",
          "cloud.region": process.env.ALIYUN_REGION_ID
        };
      } else if (process.env.WEBSITE_SITE_NAME && process.env.REGION_NAME) {
        return {
          "cloud.provider": "azure",
          "cloud.region": process.env.REGION_NAME
        };
      } else if (process.env.IBM_CLOUD_REGION) {
        return {
          "cloud.provider": "ibm_cloud",
          "cloud.region": process.env.IBM_CLOUD_REGION
        };
      } else if (process.env.TENCENTCLOUD_REGION) {
        return {
          "cloud.provider": "tencent_cloud",
          "cloud.region": process.env.TENCENTCLOUD_REGION,
          "cloud.account.id": process.env.TENCENTCLOUD_APPID,
          "cloud.availability_zone": process.env.TENCENTCLOUD_ZONE
        };
      } else if (process.env.NETLIFY) {
        return {
          "cloud.provider": "netlify"
        };
      } else if (process.env.FLY_REGION) {
        return {
          "cloud.provider": "fly.io",
          "cloud.region": process.env.FLY_REGION
        };
      } else if (process.env.DYNO) {
        return {
          "cloud.provider": "heroku"
        };
      } else {
        return void 0;
      }
    }
    exports.Context = Context;
    exports.getDeviceContext = getDeviceContext;
    exports.readDirAsync = readDirAsync;
    exports.readFileAsync = readFileAsync;
  }
});

// node_modules/@sentry/node/cjs/integrations/localvariables.js
var require_localvariables = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/localvariables.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    var nodeVersion = require_nodeVersion();
    function createRateLimiter(maxPerSecond, enable, disable) {
      let count = 0;
      let retrySeconds = 5;
      let disabledTimeout = 0;
      setInterval(() => {
        if (disabledTimeout === 0) {
          if (count > maxPerSecond) {
            retrySeconds *= 2;
            disable(retrySeconds);
            if (retrySeconds > 86400) {
              retrySeconds = 86400;
            }
            disabledTimeout = retrySeconds;
          }
        } else {
          disabledTimeout -= 1;
          if (disabledTimeout === 0) {
            enable();
          }
        }
        count = 0;
      }, 1e3).unref();
      return () => {
        count += 1;
      };
    }
    function createCallbackList(complete) {
      let callbacks = [];
      let completedCalled = false;
      function checkedComplete(result) {
        callbacks = [];
        if (completedCalled) {
          return;
        }
        completedCalled = true;
        complete(result);
      }
      callbacks.push(checkedComplete);
      function add(fn) {
        callbacks.push(fn);
      }
      function next(result) {
        const popped = callbacks.pop() || checkedComplete;
        try {
          popped(result);
        } catch (_) {
          checkedComplete(result);
        }
      }
      return { add, next };
    }
    var AsyncSession = class {
      /** Throws if inspector API is not available */
      constructor() {
        const { Session } = require("inspector");
        this._session = new Session();
      }
      /** @inheritdoc */
      configureAndConnect(onPause, captureAll) {
        this._session.connect();
        this._session.on("Debugger.paused", (event) => {
          onPause(event, () => {
            this._session.post("Debugger.resume");
          });
        });
        this._session.post("Debugger.enable");
        this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
      }
      setPauseOnExceptions(captureAll) {
        this._session.post("Debugger.setPauseOnExceptions", { state: captureAll ? "all" : "uncaught" });
      }
      /** @inheritdoc */
      getLocalVariables(objectId, complete) {
        this._getProperties(objectId, (props) => {
          const { add, next } = createCallbackList(complete);
          for (const prop of props) {
            if (_optionalChain([prop, "optionalAccess", (_2) => _2.value, "optionalAccess", (_3) => _3.objectId]) && _optionalChain([prop, "optionalAccess", (_4) => _4.value, "access", (_5) => _5.className]) === "Array") {
              const id = prop.value.objectId;
              add((vars) => this._unrollArray(id, prop.name, vars, next));
            } else if (_optionalChain([prop, "optionalAccess", (_6) => _6.value, "optionalAccess", (_7) => _7.objectId]) && _optionalChain([prop, "optionalAccess", (_8) => _8.value, "optionalAccess", (_9) => _9.className]) === "Object") {
              const id = prop.value.objectId;
              add((vars) => this._unrollObject(id, prop.name, vars, next));
            } else if (_optionalChain([prop, "optionalAccess", (_10) => _10.value, "optionalAccess", (_11) => _11.value]) || _optionalChain([prop, "optionalAccess", (_12) => _12.value, "optionalAccess", (_13) => _13.description])) {
              add((vars) => this._unrollOther(prop, vars, next));
            }
          }
          next({});
        });
      }
      /**
       * Gets all the PropertyDescriptors of an object
       */
      _getProperties(objectId, next) {
        this._session.post(
          "Runtime.getProperties",
          {
            objectId,
            ownProperties: true
          },
          (err, params) => {
            if (err) {
              next([]);
            } else {
              next(params.result);
            }
          }
        );
      }
      /**
       * Unrolls an array property
       */
      _unrollArray(objectId, name, vars, next) {
        this._getProperties(objectId, (props) => {
          vars[name] = props.filter((v) => v.name !== "length" && !isNaN(parseInt(v.name, 10))).sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10)).map((v) => _optionalChain([v, "optionalAccess", (_14) => _14.value, "optionalAccess", (_15) => _15.value]));
          next(vars);
        });
      }
      /**
       * Unrolls an object property
       */
      _unrollObject(objectId, name, vars, next) {
        this._getProperties(objectId, (props) => {
          vars[name] = props.map((v) => [v.name, _optionalChain([v, "optionalAccess", (_16) => _16.value, "optionalAccess", (_17) => _17.value])]).reduce((obj, [key, val]) => {
            obj[key] = val;
            return obj;
          }, {});
          next(vars);
        });
      }
      /**
       * Unrolls other properties
       */
      _unrollOther(prop, vars, next) {
        if (_optionalChain([prop, "optionalAccess", (_18) => _18.value, "optionalAccess", (_19) => _19.value])) {
          vars[prop.name] = prop.value.value;
        } else if (_optionalChain([prop, "optionalAccess", (_20) => _20.value, "optionalAccess", (_21) => _21.description]) && _optionalChain([prop, "optionalAccess", (_22) => _22.value, "optionalAccess", (_23) => _23.type]) !== "function") {
          vars[prop.name] = `<${prop.value.description}>`;
        }
        next(vars);
      }
    };
    function tryNewAsyncSession() {
      try {
        return new AsyncSession();
      } catch (e) {
        return void 0;
      }
    }
    function isAnonymous(name) {
      return name !== void 0 && ["", "?", "<anonymous>"].includes(name);
    }
    function functionNamesMatch(a, b) {
      return a === b || isAnonymous(a) && isAnonymous(b);
    }
    function hashFrames(frames) {
      if (frames === void 0) {
        return;
      }
      return frames.slice(-10).reduce((acc, frame) => `${acc},${frame.function},${frame.lineno},${frame.colno}`, "");
    }
    function hashFromStack(stackParser, stack) {
      if (stack === void 0) {
        return void 0;
      }
      return hashFrames(stackParser(stack, 1));
    }
    var LocalVariables = class {
      static __initStatic() {
        this.id = "LocalVariables";
      }
      __init() {
        this.name = LocalVariables.id;
      }
      __init2() {
        this._cachedFrames = new utils.LRUMap(20);
      }
      constructor(_options = {}, _session = tryNewAsyncSession()) {
        this._options = _options;
        this._session = _session;
        LocalVariables.prototype.__init.call(this);
        LocalVariables.prototype.__init2.call(this);
      }
      /**
       * @inheritDoc
       */
      setupOnce(addGlobalEventProcessor, getCurrentHub2) {
        this._setup(addGlobalEventProcessor, _optionalChain([getCurrentHub2, "call", (_24) => _24(), "access", (_25) => _25.getClient, "call", (_26) => _26(), "optionalAccess", (_27) => _27.getOptions, "call", (_28) => _28()]));
      }
      /** Setup in a way that's easier to call from tests */
      _setup(addGlobalEventProcessor, clientOptions) {
        if (this._session && _optionalChain([clientOptions, "optionalAccess", (_29) => _29.includeLocalVariables])) {
          const unsupportedNodeVersion = (nodeVersion.NODE_VERSION.major || 0) < 18;
          if (unsupportedNodeVersion) {
            utils.logger.log("The `LocalVariables` integration is only supported on Node >= v18.");
            return;
          }
          const captureAll = this._options.captureAllExceptions !== false;
          this._session.configureAndConnect(
            (ev, complete) => this._handlePaused(clientOptions.stackParser, ev, complete),
            captureAll
          );
          if (captureAll) {
            const max = this._options.maxExceptionsPerSecond || 50;
            this._rateLimiter = createRateLimiter(
              max,
              () => {
                utils.logger.log("Local variables rate-limit lifted.");
                _optionalChain([this, "access", (_30) => _30._session, "optionalAccess", (_31) => _31.setPauseOnExceptions, "call", (_32) => _32(true)]);
              },
              (seconds) => {
                utils.logger.log(
                  `Local variables rate-limit exceeded. Disabling capturing of caught exceptions for ${seconds} seconds.`
                );
                _optionalChain([this, "access", (_33) => _33._session, "optionalAccess", (_34) => _34.setPauseOnExceptions, "call", (_35) => _35(false)]);
              }
            );
          }
          addGlobalEventProcessor(async (event) => this._addLocalVariables(event));
        }
      }
      /**
       * Handle the pause event
       */
      _handlePaused(stackParser, { params: { reason, data, callFrames } }, complete) {
        if (reason !== "exception" && reason !== "promiseRejection") {
          complete();
          return;
        }
        _optionalChain([this, "access", (_36) => _36._rateLimiter, "optionalCall", (_37) => _37()]);
        const exceptionHash = hashFromStack(stackParser, _optionalChain([data, "optionalAccess", (_38) => _38.description]));
        if (exceptionHash == void 0) {
          complete();
          return;
        }
        const { add, next } = createCallbackList((frames) => {
          this._cachedFrames.set(exceptionHash, frames);
          complete();
        });
        for (let i = 0; i < Math.min(callFrames.length, 5); i++) {
          const { scopeChain, functionName, this: obj } = callFrames[i];
          const localScope = scopeChain.find((scope) => scope.type === "local");
          const fn = obj.className === "global" || !obj.className ? functionName : `${obj.className}.${functionName}`;
          if (_optionalChain([localScope, "optionalAccess", (_39) => _39.object, "access", (_40) => _40.objectId]) === void 0) {
            add((frames) => {
              frames[i] = { function: fn };
              next(frames);
            });
          } else {
            const id = localScope.object.objectId;
            add(
              (frames) => _optionalChain([this, "access", (_41) => _41._session, "optionalAccess", (_42) => _42.getLocalVariables, "call", (_43) => _43(id, (vars) => {
                frames[i] = { function: fn, vars };
                next(frames);
              })])
            );
          }
        }
        next([]);
      }
      /**
       * Adds local variables event stack frames.
       */
      _addLocalVariables(event) {
        for (const exception of _optionalChain([event, "optionalAccess", (_44) => _44.exception, "optionalAccess", (_45) => _45.values]) || []) {
          this._addLocalVariablesToException(exception);
        }
        return event;
      }
      /**
       * Adds local variables to the exception stack frames.
       */
      _addLocalVariablesToException(exception) {
        const hash = hashFrames(_optionalChain([exception, "optionalAccess", (_46) => _46.stacktrace, "optionalAccess", (_47) => _47.frames]));
        if (hash === void 0) {
          return;
        }
        const cachedFrames = this._cachedFrames.remove(hash);
        if (cachedFrames === void 0) {
          return;
        }
        const frameCount = _optionalChain([exception, "access", (_48) => _48.stacktrace, "optionalAccess", (_49) => _49.frames, "optionalAccess", (_50) => _50.length]) || 0;
        for (let i = 0; i < frameCount; i++) {
          const frameIndex = frameCount - i - 1;
          if (!_optionalChain([exception, "optionalAccess", (_51) => _51.stacktrace, "optionalAccess", (_52) => _52.frames, "optionalAccess", (_53) => _53[frameIndex]]) || !cachedFrames[i]) {
            break;
          }
          if (
            // We need to have vars to add
            cachedFrames[i].vars === void 0 || // We're not interested in frames that are not in_app because the vars are not relevant
            exception.stacktrace.frames[frameIndex].in_app === false || // The function names need to match
            !functionNamesMatch(exception.stacktrace.frames[frameIndex].function, cachedFrames[i].function)
          ) {
            continue;
          }
          exception.stacktrace.frames[frameIndex].vars = cachedFrames[i].vars;
        }
      }
    };
    LocalVariables.__initStatic();
    exports.LocalVariables = LocalVariables;
    exports.createCallbackList = createCallbackList;
    exports.createRateLimiter = createRateLimiter;
  }
});

// node_modules/@sentry/node/cjs/integrations/undici/index.js
var require_undici = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/undici/index.js"(exports, module2) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var nodeVersion = require_nodeVersion();
    exports.ChannelName = void 0;
    (function(ChannelName) {
      const RequestCreate = "undici:request:create";
      ChannelName["RequestCreate"] = RequestCreate;
      const RequestEnd = "undici:request:headers";
      ChannelName["RequestEnd"] = RequestEnd;
      const RequestError = "undici:request:error";
      ChannelName["RequestError"] = RequestError;
    })(exports.ChannelName || (exports.ChannelName = {}));
    var Undici = class {
      /**
       * @inheritDoc
       */
      static __initStatic() {
        this.id = "Undici";
      }
      /**
       * @inheritDoc
       */
      __init() {
        this.name = Undici.id;
      }
      __init2() {
        this._createSpanUrlMap = new utils.LRUMap(100);
      }
      __init3() {
        this._headersUrlMap = new utils.LRUMap(100);
      }
      constructor(_options = {}) {
        Undici.prototype.__init.call(this);
        Undici.prototype.__init2.call(this);
        Undici.prototype.__init3.call(this);
        Undici.prototype.__init4.call(this);
        Undici.prototype.__init5.call(this);
        Undici.prototype.__init6.call(this);
        this._options = {
          breadcrumbs: _options.breadcrumbs === void 0 ? true : _options.breadcrumbs,
          shouldCreateSpanForRequest: _options.shouldCreateSpanForRequest
        };
      }
      /**
       * @inheritDoc
       */
      setupOnce(_addGlobalEventProcessor) {
        if (nodeVersion.NODE_VERSION.major && nodeVersion.NODE_VERSION.major < 16) {
          return;
        }
        let ds;
        try {
          ds = utils.dynamicRequire(module2, "diagnostics_channel");
        } catch (e) {
        }
        if (!ds || !ds.subscribe) {
          return;
        }
        ds.subscribe(exports.ChannelName.RequestCreate, this._onRequestCreate);
        ds.subscribe(exports.ChannelName.RequestEnd, this._onRequestEnd);
        ds.subscribe(exports.ChannelName.RequestError, this._onRequestError);
      }
      /** Helper that wraps shouldCreateSpanForRequest option */
      _shouldCreateSpan(url) {
        if (this._options.shouldCreateSpanForRequest === void 0) {
          return true;
        }
        const cachedDecision = this._createSpanUrlMap.get(url);
        if (cachedDecision !== void 0) {
          return cachedDecision;
        }
        const decision = this._options.shouldCreateSpanForRequest(url);
        this._createSpanUrlMap.set(url, decision);
        return decision;
      }
      __init4() {
        this._onRequestCreate = (message) => {
          const hub = core.getCurrentHub();
          if (!hub.getIntegration(Undici)) {
            return;
          }
          const { request } = message;
          const stringUrl = request.origin ? request.origin.toString() + request.path : request.path;
          if (core.isSentryRequestUrl(stringUrl, hub) || request.__sentry_span__ !== void 0) {
            return;
          }
          const client = hub.getClient();
          if (!client) {
            return;
          }
          const clientOptions = client.getOptions();
          const scope = hub.getScope();
          const parentSpan = scope.getSpan();
          const span = this._shouldCreateSpan(stringUrl) ? createRequestSpan(parentSpan, request, stringUrl) : void 0;
          if (span) {
            request.__sentry_span__ = span;
          }
          const shouldAttachTraceData = (url) => {
            if (clientOptions.tracePropagationTargets === void 0) {
              return true;
            }
            const cachedDecision = this._headersUrlMap.get(url);
            if (cachedDecision !== void 0) {
              return cachedDecision;
            }
            const decision = utils.stringMatchesSomePattern(url, clientOptions.tracePropagationTargets);
            this._headersUrlMap.set(url, decision);
            return decision;
          };
          if (shouldAttachTraceData(stringUrl)) {
            if (span) {
              const dynamicSamplingContext = _optionalChain([span, "optionalAccess", (_4) => _4.transaction, "optionalAccess", (_5) => _5.getDynamicSamplingContext, "call", (_6) => _6()]);
              const sentryBaggageHeader = utils.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext);
              setHeadersOnRequest(request, span.toTraceparent(), sentryBaggageHeader);
            } else {
              const { traceId, sampled, dsc } = scope.getPropagationContext();
              const sentryTrace = utils.generateSentryTraceHeader(traceId, void 0, sampled);
              const dynamicSamplingContext = dsc || core.getDynamicSamplingContextFromClient(traceId, client, scope);
              const sentryBaggageHeader = utils.dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext);
              setHeadersOnRequest(request, sentryTrace, sentryBaggageHeader);
            }
          }
        };
      }
      __init5() {
        this._onRequestEnd = (message) => {
          const hub = core.getCurrentHub();
          if (!hub.getIntegration(Undici)) {
            return;
          }
          const { request, response } = message;
          const stringUrl = request.origin ? request.origin.toString() + request.path : request.path;
          if (core.isSentryRequestUrl(stringUrl, hub)) {
            return;
          }
          const span = request.__sentry_span__;
          if (span) {
            span.setHttpStatus(response.statusCode);
            span.finish();
          }
          if (this._options.breadcrumbs) {
            hub.addBreadcrumb(
              {
                category: "http",
                data: {
                  method: request.method,
                  status_code: response.statusCode,
                  url: stringUrl
                },
                type: "http"
              },
              {
                event: "response",
                request,
                response
              }
            );
          }
        };
      }
      __init6() {
        this._onRequestError = (message) => {
          const hub = core.getCurrentHub();
          if (!hub.getIntegration(Undici)) {
            return;
          }
          const { request } = message;
          const stringUrl = request.origin ? request.origin.toString() + request.path : request.path;
          if (core.isSentryRequestUrl(stringUrl, hub)) {
            return;
          }
          const span = request.__sentry_span__;
          if (span) {
            span.setStatus("internal_error");
            span.finish();
          }
          if (this._options.breadcrumbs) {
            hub.addBreadcrumb(
              {
                category: "http",
                data: {
                  method: request.method,
                  url: stringUrl
                },
                level: "error",
                type: "http"
              },
              {
                event: "error",
                request
              }
            );
          }
        };
      }
    };
    Undici.__initStatic();
    function setHeadersOnRequest(request, sentryTrace, sentryBaggageHeader) {
      const headerLines = request.headers.split("\r\n");
      const hasSentryHeaders = headerLines.some((headerLine) => headerLine.startsWith("sentry-trace:"));
      if (hasSentryHeaders) {
        return;
      }
      request.addHeader("sentry-trace", sentryTrace);
      if (sentryBaggageHeader) {
        request.addHeader("baggage", sentryBaggageHeader);
      }
    }
    function createRequestSpan(activeSpan, request, stringUrl) {
      const url = utils.parseUrl(stringUrl);
      const method = request.method || "GET";
      const data = {
        "http.method": method
      };
      if (url.search) {
        data["http.query"] = url.search;
      }
      if (url.hash) {
        data["http.fragment"] = url.hash;
      }
      return _optionalChain([activeSpan, "optionalAccess", (_7) => _7.startChild, "call", (_8) => _8({
        op: "http.client",
        origin: "auto.http.node.undici",
        description: `${method} ${utils.getSanitizedUrlString(url)}`,
        data
      })]);
    }
    exports.Undici = Undici;
  }
});

// node_modules/@sentry/node/cjs/integrations/spotlight.js
var require_spotlight = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/spotlight.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var http = require("http");
    var url = require("url");
    var utils = require_cjs();
    var Spotlight = class {
      static __initStatic() {
        this.id = "Spotlight";
      }
      __init() {
        this.name = Spotlight.id;
      }
      constructor(options) {
        Spotlight.prototype.__init.call(this);
        this._options = {
          sidecarUrl: _optionalChain([options, "optionalAccess", (_) => _.sidecarUrl]) || "http://localhost:8969/stream"
        };
      }
      /**
       * JSDoc
       */
      setupOnce() {
      }
      /**
       * Sets up forwarding envelopes to the Spotlight Sidecar
       */
      setup(client) {
        if (typeof process === "object" && process.env && process.env.NODE_ENV !== "development") {
          utils.logger.warn("[Spotlight] It seems you're not in dev mode. Do you really want to have Spotlight enabled?");
        }
        connectToSpotlight(client, this._options);
      }
    };
    Spotlight.__initStatic();
    function connectToSpotlight(client, options) {
      const spotlightUrl = parseSidecarUrl(options.sidecarUrl);
      if (!spotlightUrl) {
        return;
      }
      let failedRequests = 0;
      if (typeof client.on !== "function") {
        utils.logger.warn("[Spotlight] Cannot connect to spotlight due to missing method on SDK client (`client.on`)");
        return;
      }
      client.on("beforeEnvelope", (envelope) => {
        if (failedRequests > 3) {
          utils.logger.warn("[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests");
          return;
        }
        const serializedEnvelope = utils.serializeEnvelope(envelope);
        const req = http.request(
          {
            method: "POST",
            path: spotlightUrl.pathname,
            hostname: spotlightUrl.hostname,
            port: spotlightUrl.port,
            headers: {
              "Content-Type": "application/x-sentry-envelope"
            }
          },
          (res) => {
            res.on("data", () => {
            });
            res.on("end", () => {
            });
            res.setEncoding("utf8");
          }
        );
        req.on("error", () => {
          failedRequests++;
          utils.logger.warn("[Spotlight] Failed to send envelope to Spotlight Sidecar");
        });
        req.write(serializedEnvelope);
        req.end();
      });
    }
    function parseSidecarUrl(url$1) {
      try {
        return new url.URL(`${url$1}`);
      } catch (e) {
        utils.logger.warn(`[Spotlight] Invalid sidecar URL: ${url$1}`);
        return void 0;
      }
    }
    exports.Spotlight = Spotlight;
  }
});

// node_modules/@sentry/node/cjs/sdk.js
var require_sdk2 = __commonJS({
  "node_modules/@sentry/node/cjs/sdk.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var index$1 = require_anr2();
    var index$2 = require_async();
    var client = require_client();
    var console2 = require_console2();
    var http = require_http3();
    var onuncaughtexception = require_onuncaughtexception();
    var onunhandledrejection = require_onunhandledrejection();
    var modules = require_modules();
    var contextlines = require_contextlines();
    var context = require_context();
    var localvariables = require_localvariables();
    var index = require_undici();
    var spotlight = require_spotlight();
    var module$1 = require_module();
    var http$1 = require_http();
    var defaultIntegrations = [
      // Common
      new core.Integrations.InboundFilters(),
      new core.Integrations.FunctionToString(),
      new core.Integrations.LinkedErrors(),
      // Native Wrappers
      new console2.Console(),
      new http.Http(),
      new index.Undici(),
      // Global Handlers
      new onuncaughtexception.OnUncaughtException(),
      new onunhandledrejection.OnUnhandledRejection(),
      // Event Info
      new contextlines.ContextLines(),
      new localvariables.LocalVariables(),
      new context.Context(),
      new modules.Modules(),
      new core.RequestData()
    ];
    function init(options = {}) {
      if (index$1.isAnrChildProcess()) {
        options.autoSessionTracking = false;
        options.tracesSampleRate = 0;
      }
      const carrier = core.getMainCarrier();
      index$2.setNodeAsyncContextStrategy();
      const autoloadedIntegrations = _optionalChain([carrier, "access", (_) => _.__SENTRY__, "optionalAccess", (_2) => _2.integrations]) || [];
      options.defaultIntegrations = options.defaultIntegrations === false ? [] : [
        ...Array.isArray(options.defaultIntegrations) ? options.defaultIntegrations : defaultIntegrations,
        ...autoloadedIntegrations
      ];
      if (options.dsn === void 0 && process.env.SENTRY_DSN) {
        options.dsn = process.env.SENTRY_DSN;
      }
      const sentryTracesSampleRate = process.env.SENTRY_TRACES_SAMPLE_RATE;
      if (options.tracesSampleRate === void 0 && sentryTracesSampleRate) {
        const tracesSampleRate = parseFloat(sentryTracesSampleRate);
        if (isFinite(tracesSampleRate)) {
          options.tracesSampleRate = tracesSampleRate;
        }
      }
      if (options.release === void 0) {
        const detectedRelease = getSentryRelease();
        if (detectedRelease !== void 0) {
          options.release = detectedRelease;
        } else {
          options.autoSessionTracking = false;
        }
      }
      if (options.environment === void 0 && process.env.SENTRY_ENVIRONMENT) {
        options.environment = process.env.SENTRY_ENVIRONMENT;
      }
      if (options.autoSessionTracking === void 0 && options.dsn !== void 0) {
        options.autoSessionTracking = true;
      }
      if (options.instrumenter === void 0) {
        options.instrumenter = "sentry";
      }
      const clientOptions = {
        ...options,
        stackParser: utils.stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
        integrations: core.getIntegrationsToSetup(options),
        transport: options.transport || http$1.makeNodeTransport
      };
      core.initAndBind(options.clientClass || client.NodeClient, clientOptions);
      if (options.autoSessionTracking) {
        startSessionTracking();
      }
      updateScopeFromEnvVariables();
      if (options.spotlight) {
        const client2 = core.getCurrentHub().getClient();
        if (client2 && client2.addIntegration) {
          client2.setupIntegrations(true);
          client2.addIntegration(
            new spotlight.Spotlight({ sidecarUrl: typeof options.spotlight === "string" ? options.spotlight : void 0 })
          );
        }
      }
    }
    function isAutoSessionTrackingEnabled(client2) {
      if (client2 === void 0) {
        return false;
      }
      const clientOptions = client2 && client2.getOptions();
      if (clientOptions && clientOptions.autoSessionTracking !== void 0) {
        return clientOptions.autoSessionTracking;
      }
      return false;
    }
    function getSentryRelease(fallback) {
      if (process.env.SENTRY_RELEASE) {
        return process.env.SENTRY_RELEASE;
      }
      if (utils.GLOBAL_OBJ.SENTRY_RELEASE && utils.GLOBAL_OBJ.SENTRY_RELEASE.id) {
        return utils.GLOBAL_OBJ.SENTRY_RELEASE.id;
      }
      return (
        // GitHub Actions - https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
        process.env.GITHUB_SHA || // Netlify - https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
        process.env.COMMIT_REF || // Vercel - https://vercel.com/docs/v2/build-step#system-environment-variables
        process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GITHUB_COMMIT_SHA || process.env.VERCEL_GITLAB_COMMIT_SHA || process.env.VERCEL_BITBUCKET_COMMIT_SHA || // Zeit (now known as Vercel)
        process.env.ZEIT_GITHUB_COMMIT_SHA || process.env.ZEIT_GITLAB_COMMIT_SHA || process.env.ZEIT_BITBUCKET_COMMIT_SHA || // Cloudflare Pages - https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
        process.env.CF_PAGES_COMMIT_SHA || fallback
      );
    }
    var defaultStackParser = utils.createStackParser(utils.nodeStackLineParser(module$1.getModuleFromFilename));
    function startSessionTracking() {
      const hub = core.getCurrentHub();
      hub.startSession();
      process.on("beforeExit", () => {
        const session = hub.getScope().getSession();
        const terminalStates = ["exited", "crashed"];
        if (session && !terminalStates.includes(session.status))
          hub.endSession();
      });
    }
    function updateScopeFromEnvVariables() {
      const sentryUseEnvironment = (process.env.SENTRY_USE_ENVIRONMENT || "").toLowerCase();
      if (!["false", "n", "no", "off", "0"].includes(sentryUseEnvironment)) {
        const sentryTraceEnv = process.env.SENTRY_TRACE;
        const baggageEnv = process.env.SENTRY_BAGGAGE;
        const { propagationContext } = utils.tracingContextFromHeaders(sentryTraceEnv, baggageEnv);
        core.getCurrentHub().getScope().setPropagationContext(propagationContext);
      }
    }
    exports.defaultIntegrations = defaultIntegrations;
    exports.defaultStackParser = defaultStackParser;
    exports.getSentryRelease = getSentryRelease;
    exports.init = init;
    exports.isAutoSessionTrackingEnabled = isAutoSessionTrackingEnabled;
  }
});

// node_modules/@sentry/node/cjs/utils.js
var require_utils3 = __commonJS({
  "node_modules/@sentry/node/cjs/utils.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require("fs");
    var path = require("path");
    function deepReadDirSync(targetDir) {
      const targetDirAbsPath = path.resolve(targetDir);
      if (!fs.existsSync(targetDirAbsPath)) {
        throw new Error(`Cannot read contents of ${targetDirAbsPath}. Directory does not exist.`);
      }
      if (!fs.statSync(targetDirAbsPath).isDirectory()) {
        throw new Error(`Cannot read contents of ${targetDirAbsPath}, because it is not a directory.`);
      }
      const deepReadCurrentDir = (currentDirAbsPath) => {
        return fs.readdirSync(currentDirAbsPath).reduce((absPaths, itemName) => {
          const itemAbsPath = path.join(currentDirAbsPath, itemName);
          if (fs.statSync(itemAbsPath).isDirectory()) {
            return absPaths.concat(deepReadCurrentDir(itemAbsPath));
          }
          absPaths.push(itemAbsPath);
          return absPaths;
        }, []);
      };
      return deepReadCurrentDir(targetDirAbsPath).map((absPath) => path.relative(targetDirAbsPath, absPath));
    }
    exports.deepReadDirSync = deepReadDirSync;
  }
});

// node_modules/@sentry/node/cjs/requestDataDeprecated.js
var require_requestDataDeprecated = __commonJS({
  "node_modules/@sentry/node/cjs/requestDataDeprecated.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = require_cjs();
    function extractRequestData(req, keys) {
      return utils.extractRequestData(req, { include: keys });
    }
    function parseRequest(event, req, options = {}) {
      return utils.addRequestDataToEvent(event, req, { include: options });
    }
    exports.extractRequestData = extractRequestData;
    exports.parseRequest = parseRequest;
  }
});

// node_modules/@sentry/node/cjs/handlers.js
var require_handlers2 = __commonJS({
  "node_modules/@sentry/node/cjs/handlers.js"(exports) {
    var {
      _optionalChain
    } = require_cjs();
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var utils = require_cjs();
    var debugBuild = require_debug_build4();
    var sdk = require_sdk2();
    var requestDataDeprecated = require_requestDataDeprecated();
    function tracingHandler() {
      return function sentryTracingMiddleware(req, res, next) {
        const hub = core.getCurrentHub();
        const options = _optionalChain([hub, "access", (_) => _.getClient, "call", (_2) => _2(), "optionalAccess", (_3) => _3.getOptions, "call", (_4) => _4()]);
        if (!options || options.instrumenter !== "sentry" || _optionalChain([req, "access", (_5) => _5.method, "optionalAccess", (_6) => _6.toUpperCase, "call", (_7) => _7()]) === "OPTIONS" || _optionalChain([req, "access", (_8) => _8.method, "optionalAccess", (_9) => _9.toUpperCase, "call", (_10) => _10()]) === "HEAD") {
          return next();
        }
        const sentryTrace = req.headers && utils.isString(req.headers["sentry-trace"]) ? req.headers["sentry-trace"] : void 0;
        const baggage = _optionalChain([req, "access", (_11) => _11.headers, "optionalAccess", (_12) => _12.baggage]);
        if (!core.hasTracingEnabled(options)) {
          return next();
        }
        const [name, source] = utils.extractPathForTransaction(req, { path: true, method: true });
        const transaction = core.continueTrace(
          { sentryTrace, baggage },
          (ctx) => core.startTransaction(
            {
              name,
              op: "http.server",
              origin: "auto.http.node.tracingHandler",
              ...ctx,
              metadata: {
                ...ctx.metadata,
                // The request should already have been stored in `scope.sdkProcessingMetadata` (which will become
                // `event.sdkProcessingMetadata` the same way the metadata here will) by `sentryRequestMiddleware`, but on the
                // off chance someone is using `sentryTracingMiddleware` without `sentryRequestMiddleware`, it doesn't hurt to
                // be sure
                request: req,
                source
              }
            },
            // extra context passed to the tracesSampler
            { request: utils.extractRequestData(req) }
          )
        );
        hub.configureScope((scope) => {
          scope.setSpan(transaction);
        });
        res.__sentry_transaction = transaction;
        res.once("finish", () => {
          setImmediate(() => {
            utils.addRequestDataToTransaction(transaction, req);
            transaction.setHttpStatus(res.statusCode);
            transaction.finish();
          });
        });
        next();
      };
    }
    function convertReqHandlerOptsToAddReqDataOpts(reqHandlerOptions = {}) {
      let addRequestDataOptions;
      if ("include" in reqHandlerOptions) {
        addRequestDataOptions = { include: reqHandlerOptions.include };
      } else {
        const { ip, request, transaction, user } = reqHandlerOptions;
        if (ip || request || transaction || user) {
          addRequestDataOptions = { include: utils.dropUndefinedKeys({ ip, request, transaction, user }) };
        }
      }
      return addRequestDataOptions;
    }
    function requestHandler(options) {
      const requestDataOptions = convertReqHandlerOptsToAddReqDataOpts(options);
      const currentHub = core.getCurrentHub();
      const client = currentHub.getClient();
      if (client && sdk.isAutoSessionTrackingEnabled(client)) {
        client.initSessionFlusher();
        const scope = currentHub.getScope();
        if (scope.getSession()) {
          scope.setSession();
        }
      }
      return function sentryRequestMiddleware(req, res, next) {
        if (options && options.flushTimeout && options.flushTimeout > 0) {
          const _end = res.end;
          res.end = function(chunk, encoding, cb) {
            void core.flush(options.flushTimeout).then(() => {
              _end.call(this, chunk, encoding, cb);
            }).then(null, (e) => {
              debugBuild.DEBUG_BUILD && utils.logger.error(e);
              _end.call(this, chunk, encoding, cb);
            });
          };
        }
        core.runWithAsyncContext(() => {
          const currentHub2 = core.getCurrentHub();
          currentHub2.configureScope((scope) => {
            scope.setSDKProcessingMetadata({
              request: req,
              // TODO (v8): Stop passing this
              requestDataOptionsFromExpressHandler: requestDataOptions
            });
            const client2 = currentHub2.getClient();
            if (sdk.isAutoSessionTrackingEnabled(client2)) {
              const scope2 = currentHub2.getScope();
              scope2.setRequestSession({ status: "ok" });
            }
          });
          res.once("finish", () => {
            const client2 = currentHub2.getClient();
            if (sdk.isAutoSessionTrackingEnabled(client2)) {
              setImmediate(() => {
                if (client2 && client2._captureRequestSession) {
                  client2._captureRequestSession();
                }
              });
            }
          });
          next();
        });
      };
    }
    function getStatusCodeFromResponse(error) {
      const statusCode = error.status || error.statusCode || error.status_code || error.output && error.output.statusCode;
      return statusCode ? parseInt(statusCode, 10) : 500;
    }
    function defaultShouldHandleError(error) {
      const status = getStatusCodeFromResponse(error);
      return status >= 500;
    }
    function errorHandler(options) {
      return function sentryErrorMiddleware(error, _req, res, next) {
        const shouldHandleError = options && options.shouldHandleError || defaultShouldHandleError;
        if (shouldHandleError(error)) {
          core.withScope((_scope) => {
            _scope.setSDKProcessingMetadata({ request: _req });
            const transaction = res.__sentry_transaction;
            if (transaction && _scope.getSpan() === void 0) {
              _scope.setSpan(transaction);
            }
            const client = core.getClient();
            if (client && sdk.isAutoSessionTrackingEnabled(client)) {
              const isSessionAggregatesMode = client._sessionFlusher !== void 0;
              if (isSessionAggregatesMode) {
                const requestSession = _scope.getRequestSession();
                if (requestSession && requestSession.status !== void 0) {
                  requestSession.status = "crashed";
                }
              }
            }
            const eventId = core.captureException(error, { mechanism: { type: "middleware", handled: false } });
            res.sentry = eventId;
            next(error);
          });
          return;
        }
        next(error);
      };
    }
    function trpcMiddleware(options = {}) {
      return function({ path, type: type2, next, rawInput }) {
        const hub = core.getCurrentHub();
        const clientOptions = _optionalChain([hub, "access", (_13) => _13.getClient, "call", (_14) => _14(), "optionalAccess", (_15) => _15.getOptions, "call", (_16) => _16()]);
        const sentryTransaction = hub.getScope().getTransaction();
        if (sentryTransaction) {
          sentryTransaction.setName(`trpc/${path}`, "route");
          sentryTransaction.op = "rpc.server";
          const trpcContext = {
            procedure_type: type2
          };
          if (options.attachRpcInput !== void 0 ? options.attachRpcInput : _optionalChain([clientOptions, "optionalAccess", (_17) => _17.sendDefaultPii])) {
            trpcContext.input = utils.normalize(rawInput);
          }
          sentryTransaction.setContext("trpc", trpcContext);
        }
        function shouldCaptureError(e) {
          if (typeof e === "object" && e && "code" in e) {
            return e.code === "INTERNAL_SERVER_ERROR";
          } else {
            return true;
          }
        }
        function handleErrorCase(e) {
          if (shouldCaptureError(e)) {
            core.captureException(e, { mechanism: { handled: false } });
          }
        }
        let maybePromiseResult;
        try {
          maybePromiseResult = next();
        } catch (e) {
          handleErrorCase(e);
          throw e;
        }
        if (utils.isThenable(maybePromiseResult)) {
          Promise.resolve(maybePromiseResult).then(null, (e) => {
            handleErrorCase(e);
          });
        }
        return maybePromiseResult;
      };
    }
    exports.extractRequestData = requestDataDeprecated.extractRequestData;
    exports.parseRequest = requestDataDeprecated.parseRequest;
    exports.errorHandler = errorHandler;
    exports.requestHandler = requestHandler;
    exports.tracingHandler = tracingHandler;
    exports.trpcMiddleware = trpcMiddleware;
  }
});

// node_modules/@sentry/node/cjs/integrations/index.js
var require_integrations2 = __commonJS({
  "node_modules/@sentry/node/cjs/integrations/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var console2 = require_console2();
    var http = require_http3();
    var onuncaughtexception = require_onuncaughtexception();
    var onunhandledrejection = require_onunhandledrejection();
    var modules = require_modules();
    var contextlines = require_contextlines();
    var context = require_context();
    var core = require_cjs2();
    var localvariables = require_localvariables();
    var index = require_undici();
    var spotlight = require_spotlight();
    exports.Console = console2.Console;
    exports.Http = http.Http;
    exports.OnUncaughtException = onuncaughtexception.OnUncaughtException;
    exports.OnUnhandledRejection = onunhandledrejection.OnUnhandledRejection;
    exports.Modules = modules.Modules;
    exports.ContextLines = contextlines.ContextLines;
    exports.Context = context.Context;
    exports.RequestData = core.RequestData;
    exports.LocalVariables = localvariables.LocalVariables;
    exports.Undici = index.Undici;
    exports.Spotlight = spotlight.Spotlight;
  }
});

// node_modules/@sentry/node/cjs/tracing/integrations.js
var require_integrations3 = __commonJS({
  "node_modules/@sentry/node/cjs/tracing/integrations.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var tracing = require_cjs3();
    exports.Apollo = tracing.Apollo;
    exports.Express = tracing.Express;
    exports.GraphQL = tracing.GraphQL;
    exports.Mongo = tracing.Mongo;
    exports.Mysql = tracing.Mysql;
    exports.Postgres = tracing.Postgres;
    exports.Prisma = tracing.Prisma;
  }
});

// node_modules/@sentry/node/cjs/index.js
var require_cjs4 = __commonJS({
  "node_modules/@sentry/node/cjs/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var core = require_cjs2();
    var index = require_tracing2();
    var client = require_client();
    var http = require_http();
    var sdk = require_sdk2();
    var utils = require_cjs();
    var utils$1 = require_utils3();
    var module$1 = require_module();
    var index$1 = require_anr2();
    var handlers = require_handlers2();
    var index$2 = require_integrations2();
    var integrations = require_integrations3();
    var INTEGRATIONS = {
      ...core.Integrations,
      ...index$2,
      ...integrations
    };
    exports.Hub = core.Hub;
    exports.SDK_VERSION = core.SDK_VERSION;
    exports.Scope = core.Scope;
    exports.addBreadcrumb = core.addBreadcrumb;
    exports.addEventProcessor = core.addEventProcessor;
    exports.addGlobalEventProcessor = core.addGlobalEventProcessor;
    exports.addIntegration = core.addIntegration;
    exports.captureCheckIn = core.captureCheckIn;
    exports.captureEvent = core.captureEvent;
    exports.captureException = core.captureException;
    exports.captureMessage = core.captureMessage;
    exports.close = core.close;
    exports.configureScope = core.configureScope;
    exports.continueTrace = core.continueTrace;
    exports.createTransport = core.createTransport;
    exports.extractTraceparentData = core.extractTraceparentData;
    exports.flush = core.flush;
    exports.getActiveSpan = core.getActiveSpan;
    exports.getActiveTransaction = core.getActiveTransaction;
    exports.getClient = core.getClient;
    exports.getCurrentHub = core.getCurrentHub;
    exports.getHubFromCarrier = core.getHubFromCarrier;
    exports.lastEventId = core.lastEventId;
    exports.makeMain = core.makeMain;
    exports.runWithAsyncContext = core.runWithAsyncContext;
    exports.setContext = core.setContext;
    exports.setExtra = core.setExtra;
    exports.setExtras = core.setExtras;
    exports.setMeasurement = core.setMeasurement;
    exports.setTag = core.setTag;
    exports.setTags = core.setTags;
    exports.setUser = core.setUser;
    exports.spanStatusfromHttpCode = core.spanStatusfromHttpCode;
    exports.startActiveSpan = core.startActiveSpan;
    exports.startInactiveSpan = core.startInactiveSpan;
    exports.startSpan = core.startSpan;
    exports.startSpanManual = core.startSpanManual;
    exports.startTransaction = core.startTransaction;
    exports.trace = core.trace;
    exports.withMonitor = core.withMonitor;
    exports.withScope = core.withScope;
    exports.autoDiscoverNodePerformanceMonitoringIntegrations = index.autoDiscoverNodePerformanceMonitoringIntegrations;
    exports.NodeClient = client.NodeClient;
    exports.makeNodeTransport = http.makeNodeTransport;
    exports.defaultIntegrations = sdk.defaultIntegrations;
    exports.defaultStackParser = sdk.defaultStackParser;
    exports.getSentryRelease = sdk.getSentryRelease;
    exports.init = sdk.init;
    exports.DEFAULT_USER_INCLUDES = utils.DEFAULT_USER_INCLUDES;
    exports.addRequestDataToEvent = utils.addRequestDataToEvent;
    exports.extractRequestData = utils.extractRequestData;
    exports.deepReadDirSync = utils$1.deepReadDirSync;
    exports.getModuleFromFilename = module$1.getModuleFromFilename;
    exports.enableAnrDetection = index$1.enableAnrDetection;
    exports.Handlers = handlers;
    exports.Integrations = INTEGRATIONS;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ProfilingIntegration: () => ProfilingIntegration
});
module.exports = __toCommonJS(src_exports);

// src/integration.ts
var import_utils5 = __toESM(require_cjs());

// src/env.ts
var __SENTRY_DEBUG__2 = true;
function isDebugBuild() {
  return __SENTRY_DEBUG__2;
}

// src/hubextensions.ts
var import_utils3 = __toESM(require_cjs());
var import_core = __toESM(require_cjs2());

// src/cpu_profiler.ts
var import_os = require("os");
var import_process = require("process");
var import_worker_threads = require("worker_threads");
var import_node_abi = __toESM(require_node_abi());
var import_path = require("path");
var import_detect_libc = __toESM(require_detect_libc());
var import_utils = __toESM(require_cjs());
var stdlib = (0, import_detect_libc.familySync)();
var platform = process.env["BUILD_PLATFORM"] || (0, import_os.platform)();
var arch = process.env["BUILD_ARCH"] || (0, import_os.arch)();
var abi = (0, import_node_abi.getAbi)(import_process.versions.node, "node");
var identifier = [platform, arch, stdlib, abi].filter((c) => c !== void 0 && c !== null).join("-");
var built_from_source_path = (0, import_path.resolve)(__dirname, `./sentry_cpu_profiler-${identifier}`);
function importCppBindingsModule() {
  if (import_process.env["SENTRY_PROFILER_BINARY_PATH"]) {
    const envPath = import_process.env["SENTRY_PROFILER_BINARY_PATH"];
    return require(envPath);
  }
  if (import_process.env["SENTRY_PROFILER_BINARY_DIR"]) {
    const binaryPath = (0, import_path.join)((0, import_path.resolve)(import_process.env["SENTRY_PROFILER_BINARY_DIR"]), `sentry_cpu_profiler-${identifier}`);
    return require(binaryPath + ".node");
  }
  if (platform === "darwin") {
    if (arch === "x64") {
      if (abi === "83") {
        return require("./sentry_cpu_profiler-darwin-x64-83.node");
      }
      if (abi === "93") {
        return require("./sentry_cpu_profiler-darwin-x64-93.node");
      }
      if (abi === "108") {
        return require("./sentry_cpu_profiler-darwin-x64-108.node");
      }
      if (abi === "115") {
        return require("./sentry_cpu_profiler-darwin-x64-115.node");
      }
    }
    if (arch === "arm64") {
      if (abi === "93") {
        return require("./sentry_cpu_profiler-darwin-arm64-93.node");
      }
      if (abi === "108") {
        return require("./sentry_cpu_profiler-darwin-arm64-108.node");
      }
      if (abi === "115") {
        return require("./sentry_cpu_profiler-darwin-arm64-115.node");
      }
    }
  }
  if (platform === "win32") {
    if (arch === "x64") {
      if (abi === "93") {
        return require("./sentry_cpu_profiler-win32-x64-93.node");
      }
      if (abi === "108") {
        return require("./sentry_cpu_profiler-win32-x64-108.node");
      }
      if (abi === "115") {
        return require("./sentry_cpu_profiler-win32-x64-115.node");
      }
    }
  }
  if (platform === "linux") {
    if (arch === "x64") {
      if (stdlib === "musl") {
        if (abi === "83") {
          return require("./sentry_cpu_profiler-linux-x64-musl-83.node");
        }
        if (abi === "93") {
          return require("./sentry_cpu_profiler-linux-x64-musl-93.node");
        }
        if (abi === "108") {
          return require("./sentry_cpu_profiler-linux-x64-musl-108.node");
        }
        if (abi === "115") {
          return require("./sentry_cpu_profiler-linux-x64-musl-115.node");
        }
      }
      if (stdlib === "glibc") {
        if (abi === "83") {
          return require("./sentry_cpu_profiler-linux-x64-glibc-83.node");
        }
        if (abi === "93") {
          return require("./sentry_cpu_profiler-linux-x64-glibc-93.node");
        }
        if (abi === "108") {
          return require("./sentry_cpu_profiler-linux-x64-glibc-108.node");
        }
        if (abi === "115") {
          return require("./sentry_cpu_profiler-linux-x64-glibc-115.node");
        }
      }
    }
    if (arch === "arm64") {
      if (stdlib === "musl") {
        if (abi === "83") {
          return require("./sentry_cpu_profiler-linux-arm64-musl-83.node");
        }
        if (abi === "93") {
          return require("./sentry_cpu_profiler-linux-arm64-musl-93.node");
        }
        if (abi === "108") {
          return require("./sentry_cpu_profiler-linux-arm64-musl-108.node");
        }
        if (abi === "115") {
          return require("./sentry_cpu_profiler-linux-arm64-musl-115.node");
        }
      }
      if (stdlib === "glibc") {
        if (abi === "83") {
          return require("./sentry_cpu_profiler-linux-arm64-glibc-83.node");
        }
        if (abi === "93") {
          return require("./sentry_cpu_profiler-linux-arm64-glibc-93.node");
        }
        if (abi === "108") {
          return require("./sentry_cpu_profiler-linux-arm64-glibc-108.node");
        }
        if (abi === "115") {
          return require("./sentry_cpu_profiler-linux-arm64-glibc-115.node");
        }
      }
    }
  }
  return require(built_from_source_path + ".node");
}
var PrivateCpuProfilerBindings = importCppBindingsModule();
var CpuProfilerBindings = {
  startProfiling(name) {
    if (!PrivateCpuProfilerBindings) {
      if (isDebugBuild()) {
        import_utils.logger.log("[Profiling] Bindings not loaded, ignoring call to startProfiling.");
      }
      return;
    }
    return PrivateCpuProfilerBindings.startProfiling(name);
  },
  stopProfiling(name) {
    if (!PrivateCpuProfilerBindings) {
      if (isDebugBuild()) {
        import_utils.logger.log("[Profiling] Bindings not loaded or profile was never started, ignoring call to stopProfiling.");
      }
      return null;
    }
    return PrivateCpuProfilerBindings.stopProfiling(name, import_worker_threads.threadId, !!import_utils.GLOBAL_OBJ._sentryDebugIds);
  }
};

// src/utils.ts
var os = __toESM(require("os"));
var import_process2 = require("process");
var import_worker_threads2 = require("worker_threads");
var Sentry = __toESM(require_cjs4());
var import_utils2 = __toESM(require_cjs());
var THREAD_ID_STRING = String(import_worker_threads2.threadId);
var THREAD_NAME = import_worker_threads2.isMainThread ? "main" : "worker";
var FORMAT_VERSION = "1";
var PLATFORM = os.platform();
var RELEASE = os.release();
var VERSION = os.version();
var TYPE = os.type();
var MODEL = os.machine ? os.machine() : os.arch();
var ARCH = os.arch();
function isRawThreadCpuProfile(profile) {
  return !("thread_metadata" in profile);
}
function enrichWithThreadInformation(profile) {
  if (!isRawThreadCpuProfile(profile)) {
    return profile;
  }
  return {
    samples: profile.samples,
    frames: profile.frames,
    stacks: profile.stacks,
    thread_metadata: {
      [THREAD_ID_STRING]: {
        name: THREAD_NAME
      }
    }
  };
}
function getSdkMetadataForEnvelopeHeader(metadata) {
  if (!metadata || !metadata.sdk) {
    return void 0;
  }
  return { name: metadata.sdk.name, version: metadata.sdk.version };
}
function enhanceEventWithSdkInfo(event, sdkInfo) {
  if (!sdkInfo) {
    return event;
  }
  event.sdk = event.sdk || {};
  event.sdk.name = event.sdk.name || sdkInfo.name || "unknown sdk";
  event.sdk.version = event.sdk.version || sdkInfo.version || "unknown sdk version";
  event.sdk.integrations = [...event.sdk.integrations || [], ...sdkInfo.integrations || []];
  event.sdk.packages = [...event.sdk.packages || [], ...sdkInfo.packages || []];
  return event;
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
  const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata["dynamicSamplingContext"];
  return {
    event_id: event.event_id,
    sent_at: (/* @__PURE__ */ new Date()).toISOString(),
    ...sdkInfo && { sdk: sdkInfo },
    ...!!tunnel && { dsn: (0, import_utils2.dsnToString)(dsn) },
    ...event.type === "transaction" && dynamicSamplingContext && {
      trace: (0, import_utils2.dropUndefinedKeys)({ ...dynamicSamplingContext })
    }
  };
}
function createProfilingEventFromTransaction(event) {
  var _a, _b;
  if (event.type !== "transaction") {
    throw new TypeError("Profiling events may only be attached to transactions, this should never occur.");
  }
  const rawProfile = event.sdkProcessingMetadata["profile"];
  if (rawProfile === void 0 || rawProfile === null) {
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile. Got ${rawProfile} instead.`
    );
  }
  if (!rawProfile.profile_id) {
    throw new TypeError(
      `Cannot construct profiling event envelope without a valid profile id. Got ${rawProfile.profile_id} instead.`
    );
  }
  if (!isValidProfile(rawProfile)) {
    return null;
  }
  return createProfilePayload(rawProfile, {
    release: event.release || "",
    environment: event.environment || "",
    event_id: event.event_id || "",
    transaction: event.transaction || "",
    start_timestamp: event.start_timestamp ? event.start_timestamp * 1e3 : Date.now(),
    trace_id: ((_b = (_a = event == null ? void 0 : event.contexts) == null ? void 0 : _a["trace"]) == null ? void 0 : _b["trace_id"]) || "",
    profile_id: rawProfile.profile_id
  });
}
function createProfilingEvent(profile, event) {
  var _a, _b;
  if (!isValidProfile(profile)) {
    return null;
  }
  return createProfilePayload(profile, {
    release: event.release || "",
    environment: event.environment || "",
    event_id: event.event_id || "",
    transaction: event.transaction || "",
    start_timestamp: event.start_timestamp ? event.start_timestamp * 1e3 : Date.now(),
    trace_id: ((_b = (_a = event == null ? void 0 : event.contexts) == null ? void 0 : _a["trace"]) == null ? void 0 : _b["trace_id"]) || "",
    profile_id: profile.profile_id
  });
}
function createProfilePayload(cpuProfile, {
  release: release2,
  environment,
  event_id,
  transaction,
  start_timestamp,
  trace_id,
  profile_id
}) {
  if (trace_id && trace_id.length !== 32) {
    if (isDebugBuild()) {
      import_utils2.logger.log("[Profiling] Invalid traceId: " + trace_id + " on profiled event");
    }
  }
  const enrichedThreadProfile = enrichWithThreadInformation(cpuProfile);
  const profile = {
    event_id: profile_id,
    timestamp: new Date(start_timestamp).toISOString(),
    platform: "node",
    version: FORMAT_VERSION,
    release: release2,
    environment,
    measurements: cpuProfile.measurements,
    runtime: {
      name: "node",
      version: import_process2.versions.node || ""
    },
    os: {
      name: PLATFORM,
      version: RELEASE,
      build_number: VERSION
    },
    device: {
      locale: import_process2.env["LC_ALL"] || import_process2.env["LC_MESSAGES"] || import_process2.env["LANG"] || import_process2.env["LANGUAGE"] || "",
      model: MODEL,
      manufacturer: TYPE,
      architecture: ARCH,
      is_emulator: false
    },
    debug_meta: {
      images: applyDebugMetadata(cpuProfile.resources)
    },
    profile: enrichedThreadProfile,
    transaction: {
      name: transaction,
      id: event_id,
      trace_id: trace_id || "",
      active_thread_id: THREAD_ID_STRING
    }
  };
  return profile;
}
function createProfilingEventEnvelope(event, dsn, metadata, tunnel) {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  const profile = createProfilingEventFromTransaction(event);
  if (!profile) {
    return null;
  }
  const envelopeItem = [
    {
      type: "profile"
    },
    // @ts-expect-error profile is not part of EventItem yet
    profile
  ];
  return (0, import_utils2.createEnvelope)(envelopeHeaders, [envelopeItem]);
}
function isProfiledTransactionEvent(event) {
  return !!(event.sdkProcessingMetadata && event.sdkProcessingMetadata["profile"]);
}
function maybeRemoveProfileFromSdkMetadata(event) {
  if (!isProfiledTransactionEvent(event)) {
    return event;
  }
  delete event.sdkProcessingMetadata["profile"];
  return event;
}
function isValidSampleRate(rate) {
  if (typeof rate !== "number" && typeof rate !== "boolean" || typeof rate === "number" && isNaN(rate)) {
    if (isDebugBuild()) {
      import_utils2.logger.warn(
        `[Profiling] Invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
          rate
        )} of type ${JSON.stringify(typeof rate)}.`
      );
    }
    return false;
  }
  if (rate === true || rate === false) {
    return true;
  }
  if (rate < 0 || rate > 1) {
    if (isDebugBuild()) {
      import_utils2.logger.warn(`[Profiling] Invalid sample rate. Sample rate must be between 0 and 1. Got ${rate}.`);
    }
    return false;
  }
  return true;
}
function isValidProfile(profile) {
  if (profile.samples.length <= 1) {
    if (isDebugBuild()) {
      import_utils2.logger.log("[Profiling] Discarding profile because it contains less than 2 samples");
    }
    return false;
  }
  if (!profile.profile_id) {
    return false;
  }
  return true;
}
function addProfilesToEnvelope(envelope, profiles) {
  if (!profiles.length) {
    return envelope;
  }
  for (const profile of profiles) {
    envelope[1].push([{ type: "profile" }, profile]);
  }
  return envelope;
}
function findProfiledTransactionsFromEnvelope(envelope) {
  const events = [];
  (0, import_utils2.forEachEnvelopeItem)(envelope, (item, type2) => {
    if (type2 !== "transaction") {
      return;
    }
    for (let j = 1; j < item.length; j++) {
      const event = item[j];
      if (event && event.contexts && event.contexts["profile"] && event.contexts["profile"]["profile_id"]) {
        events.push(item[j]);
      }
    }
  });
  return events;
}
var debugIdStackParserCache = /* @__PURE__ */ new WeakMap();
function applyDebugMetadata(resource_paths) {
  var _a, _b, _c, _d;
  const debugIdMap = import_utils2.GLOBAL_OBJ._sentryDebugIds;
  if (!debugIdMap) {
    return [];
  }
  const stackParser = (_d = (_c = (_b = (_a = Sentry.getCurrentHub) == null ? void 0 : _a()) == null ? void 0 : _b.getClient()) == null ? void 0 : _c.getOptions()) == null ? void 0 : _d.stackParser;
  if (!stackParser) {
    return [];
  }
  let debugIdStackFramesCache;
  const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
  if (cachedDebugIdStackFrameCache) {
    debugIdStackFramesCache = cachedDebugIdStackFrameCache;
  } else {
    debugIdStackFramesCache = /* @__PURE__ */ new Map();
    debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
  }
  const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
    let parsedStack;
    const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
    if (cachedParsedStack) {
      parsedStack = cachedParsedStack;
    } else {
      parsedStack = stackParser(debugIdStackTrace);
      debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
    }
    for (let i = parsedStack.length - 1; i >= 0; i--) {
      const stackFrame = parsedStack[i];
      const file = stackFrame == null ? void 0 : stackFrame.filename;
      if (stackFrame && file) {
        acc[file] = debugIdMap[debugIdStackTrace];
        break;
      }
    }
    return acc;
  }, {});
  const images = [];
  for (let i = 0; i < resource_paths.length; i++) {
    const path = resource_paths[i];
    if (path && filenameDebugIdMap[path]) {
      images.push({
        type: "sourcemap",
        code_file: path,
        debug_id: filenameDebugIdMap[path]
      });
    }
  }
  return images;
}

// src/hubextensions.ts
var MAX_PROFILE_DURATION_MS = 30 * 1e3;
function maybeProfileTransaction(client, transaction, customSamplingContext) {
  if (!transaction.sampled) {
    return;
  }
  if (!client) {
    if (isDebugBuild()) {
      import_utils3.logger.log("[Profiling] Profiling disabled, no client found.");
    }
    return;
  }
  const options = client.getOptions();
  if (!options) {
    if (isDebugBuild()) {
      import_utils3.logger.log("[Profiling] Profiling disabled, no options found.");
    }
    return;
  }
  const profilesSampler = options.profilesSampler;
  let profilesSampleRate = options.profilesSampleRate;
  if (typeof profilesSampler === "function") {
    profilesSampleRate = profilesSampler({ transactionContext: transaction.toContext(), ...customSamplingContext });
  }
  if (!isValidSampleRate(profilesSampleRate)) {
    if (isDebugBuild()) {
      import_utils3.logger.warn("[Profiling] Discarding profile because of invalid sample rate.");
    }
    return;
  }
  if (!profilesSampleRate) {
    if (isDebugBuild()) {
      import_utils3.logger.log(
        `[Profiling] Discarding profile because ${typeof profilesSampler === "function" ? "profileSampler returned 0 or false" : "a negative sampling decision was inherited or profileSampleRate is set to 0"}`
      );
    }
    return;
  }
  const sampled = profilesSampleRate === true ? true : Math.random() < profilesSampleRate;
  if (!sampled) {
    if (isDebugBuild()) {
      import_utils3.logger.log(
        `[Profiling] Discarding profile because it's not included in the random sample (sampling rate = ${Number(
          profilesSampleRate
        )})`
      );
    }
    return;
  }
  const profile_id = (0, import_utils3.uuid4)();
  CpuProfilerBindings.startProfiling(profile_id);
  if (isDebugBuild()) {
    import_utils3.logger.log("[Profiling] started profiling transaction: " + transaction.name);
  }
  return profile_id;
}
function stopTransactionProfile(transaction, profile_id) {
  if (!profile_id) {
    return null;
  }
  const profile = CpuProfilerBindings.stopProfiling(profile_id);
  if (isDebugBuild()) {
    import_utils3.logger.log("[Profiling] stopped profiling of transaction: " + transaction.name);
  }
  if (!profile) {
    if (isDebugBuild()) {
      import_utils3.logger.log(
        "[Profiling] profiler returned null profile for: " + transaction.name,
        "this may indicate an overlapping transaction or a call to stopProfiling with a profile title that was never started"
      );
    }
    return null;
  }
  profile.profile_id = profile_id;
  return profile;
}
function __PRIVATE__wrapStartTransactionWithProfiling(startTransaction) {
  return function wrappedStartTransaction(transactionContext, customSamplingContext) {
    const transaction = startTransaction.call(this, transactionContext, customSamplingContext);
    const client = this.getClient();
    if (!client) {
      return transaction;
    }
    const profile_id = maybeProfileTransaction(client, transaction, customSamplingContext);
    if (!profile_id) {
      return transaction;
    }
    let profile = null;
    const options = client.getOptions();
    const maxProfileDurationMs = options._experiments && options._experiments["maxProfileDurationMs"] || MAX_PROFILE_DURATION_MS;
    let maxDurationTimeoutID = global.setTimeout(() => {
      if (isDebugBuild()) {
        import_utils3.logger.log("[Profiling] max profile duration elapsed, stopping profiling for:", transaction.name);
      }
      profile = stopTransactionProfile(transaction, profile_id);
    }, maxProfileDurationMs);
    const originalFinish = transaction.finish.bind(transaction);
    function profilingWrappedTransactionFinish() {
      if (!profile_id) {
        return originalFinish();
      }
      if (maxDurationTimeoutID) {
        global.clearTimeout(maxDurationTimeoutID);
        maxDurationTimeoutID = void 0;
      }
      if (!profile) {
        profile = stopTransactionProfile(transaction, profile_id);
      }
      transaction.setMetadata({ profile });
      return originalFinish();
    }
    transaction.finish = profilingWrappedTransactionFinish;
    return transaction;
  };
}
function _addProfilingExtensionMethods() {
  const carrier = (0, import_core.getMainCarrier)();
  if (!carrier.__SENTRY__) {
    if (isDebugBuild()) {
      import_utils3.logger.log("[Profiling] Can't find main carrier, profiling won't work.");
    }
    return;
  }
  carrier.__SENTRY__.extensions = carrier.__SENTRY__.extensions || {};
  if (!carrier.__SENTRY__.extensions["startTransaction"]) {
    if (isDebugBuild()) {
      import_utils3.logger.log("[Profiling] startTransaction does not exists, profiling will not work.");
    }
    return;
  }
  if (isDebugBuild()) {
    import_utils3.logger.log("[Profiling] startTransaction exists, patching it with profiling functionality...");
  }
  carrier.__SENTRY__.extensions["startTransaction"] = __PRIVATE__wrapStartTransactionWithProfiling(
    // This is patched by sentry/tracing, we are going to re-patch it...
    carrier.__SENTRY__.extensions["startTransaction"]
  );
}
function addProfilingExtensionMethods() {
  _addProfilingExtensionMethods();
}

// src/integration.ts
var MAX_PROFILE_QUEUE_LENGTH = 50;
var PROFILE_QUEUE = [];
var PROFILE_TIMEOUTS = {};
function addToProfileQueue(profile) {
  PROFILE_QUEUE.push(profile);
  if (PROFILE_QUEUE.length > MAX_PROFILE_QUEUE_LENGTH) {
    PROFILE_QUEUE.shift();
  }
}
var ProfilingIntegration = class {
  constructor() {
    this.name = "ProfilingIntegration";
    this.getCurrentHub = void 0;
  }
  setupOnce(addGlobalEventProcessor, getCurrentHub2) {
    this.getCurrentHub = getCurrentHub2;
    const client = this.getCurrentHub().getClient();
    if (client && typeof client.on === "function") {
      client.on("startTransaction", (transaction) => {
        const profile_id = maybeProfileTransaction(client, transaction, void 0);
        if (profile_id) {
          const options = client.getOptions();
          const maxProfileDurationMs = options._experiments && options._experiments["maxProfileDurationMs"] || MAX_PROFILE_DURATION_MS;
          if (PROFILE_TIMEOUTS[profile_id]) {
            global.clearTimeout(PROFILE_TIMEOUTS[profile_id]);
            delete PROFILE_TIMEOUTS[profile_id];
          }
          PROFILE_TIMEOUTS[profile_id] = global.setTimeout(() => {
            if (isDebugBuild()) {
              import_utils5.logger.log("[Profiling] max profile duration elapsed, stopping profiling for:", transaction.name);
            }
            const profile = stopTransactionProfile(transaction, profile_id);
            if (profile) {
              addToProfileQueue(profile);
            }
          }, maxProfileDurationMs);
          transaction.setContext("profile", { profile_id });
          transaction.setMetadata({ profile_id });
        }
      });
      client.on("finishTransaction", (transaction) => {
        const profile_id = transaction && transaction.metadata && transaction.metadata.profile_id;
        if (profile_id) {
          if (PROFILE_TIMEOUTS[profile_id]) {
            global.clearTimeout(PROFILE_TIMEOUTS[profile_id]);
            delete PROFILE_TIMEOUTS[profile_id];
          }
          const profile = stopTransactionProfile(transaction, profile_id);
          if (profile) {
            addToProfileQueue(profile);
          }
        }
      });
      client.on("beforeEnvelope", (envelope) => {
        var _a, _b, _c;
        if (!PROFILE_QUEUE.length) {
          return;
        }
        const profiledTransactionEvents = findProfiledTransactionsFromEnvelope(envelope);
        if (!profiledTransactionEvents.length) {
          return;
        }
        const profilesToAddToEnvelope = [];
        for (let i = 0; i < profiledTransactionEvents.length; i++) {
          const profiledTransaction = profiledTransactionEvents[i];
          const profile_id = (_b = (_a = profiledTransaction == null ? void 0 : profiledTransaction.contexts) == null ? void 0 : _a["profile"]) == null ? void 0 : _b["profile_id"];
          if (!profile_id) {
            throw new TypeError("[Profiling] cannot find profile for a transaction without a profile context");
          }
          if ((_c = profiledTransaction == null ? void 0 : profiledTransaction.contexts) == null ? void 0 : _c[".profile"]) {
            delete profiledTransaction.contexts["profile"];
          }
          const profileIndex = PROFILE_QUEUE.findIndex((p) => p.profile_id === profile_id);
          if (profileIndex === -1) {
            if (isDebugBuild()) {
              import_utils5.logger.log(`[Profiling] Could not retrieve profile for transaction: ${profile_id}`);
            }
            continue;
          }
          const cpuProfile = PROFILE_QUEUE[profileIndex];
          if (!cpuProfile) {
            if (isDebugBuild()) {
              import_utils5.logger.log(`[Profiling] Could not retrieve profile for transaction: ${profile_id}`);
            }
            continue;
          }
          PROFILE_QUEUE.splice(profileIndex, 1);
          const profile = createProfilingEvent(cpuProfile, profiledTransaction);
          if (client.emit && profile) {
            const integrations = client["_integrations"] && client["_integrations"] !== null && !Array.isArray(client["_integrations"]) ? Object.keys(client["_integrations"]) : void 0;
            client.emit("preprocessEvent", profile, {
              event_id: profiledTransaction.event_id,
              integrations
            });
          }
          if (profile) {
            profilesToAddToEnvelope.push(profile);
          }
        }
        addProfilesToEnvelope(envelope, profilesToAddToEnvelope);
      });
    } else {
      addProfilingExtensionMethods();
      addGlobalEventProcessor(this.handleGlobalEvent.bind(this));
    }
  }
  handleGlobalEvent(event) {
    if (this.getCurrentHub === void 0) {
      return maybeRemoveProfileFromSdkMetadata(event);
    }
    if (isProfiledTransactionEvent(event)) {
      const hub = this.getCurrentHub();
      const client = hub.getClient();
      if (!client) {
        if (isDebugBuild()) {
          import_utils5.logger.log(
            "[Profiling] getClient did not return a Client, removing profile from event and forwarding to next event processors."
          );
        }
        return maybeRemoveProfileFromSdkMetadata(event);
      }
      const dsn = client.getDsn();
      if (!dsn) {
        if (isDebugBuild()) {
          import_utils5.logger.log(
            "[Profiling] getDsn did not return a Dsn, removing profile from event and forwarding to next event processors."
          );
        }
        return maybeRemoveProfileFromSdkMetadata(event);
      }
      const transport = client.getTransport();
      if (!transport) {
        if (isDebugBuild()) {
          import_utils5.logger.log(
            "[Profiling] getTransport did not return a Transport, removing profile from event and forwarding to next event processors."
          );
        }
        return maybeRemoveProfileFromSdkMetadata(event);
      }
      if (isDebugBuild()) {
        import_utils5.logger.log("[Profiling] Preparing envelope and sending a profiling event");
      }
      const envelope = createProfilingEventEnvelope(event, dsn);
      if (envelope) {
        transport.send(envelope);
      }
    }
    return maybeRemoveProfileFromSdkMetadata(event);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ProfilingIntegration
});
