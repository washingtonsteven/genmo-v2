"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.variableRegEx = void 0;
var variableRegEx = new RegExp(/#{(\S+)}/g);
exports.variableRegEx = variableRegEx;
var excludedValues = [">>"];

var replaceVariables = function replaceVariables() {
  var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var customData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return content.replace(variableRegEx, function (match, varName) {
    return customData[varName] && excludedValues.indexOf(customData[varName]) < 0 ? customData[varName] : match;
  });
};

var _default = replaceVariables;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9yZXBsYWNlVmFyaWFibGVzLmpzIl0sIm5hbWVzIjpbInZhcmlhYmxlUmVnRXgiLCJSZWdFeHAiLCJleGNsdWRlZFZhbHVlcyIsInJlcGxhY2VWYXJpYWJsZXMiLCJjb250ZW50IiwiY3VzdG9tRGF0YSIsInJlcGxhY2UiLCJtYXRjaCIsInZhck5hbWUiLCJpbmRleE9mIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxJQUFNQSxhQUFhLEdBQUcsSUFBSUMsTUFBSixDQUFXLFdBQVgsQ0FBdEI7O0FBQ1AsSUFBTUMsY0FBYyxHQUFHLENBQUMsSUFBRCxDQUF2Qjs7QUFDQSxJQUFNQyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQW1CLEdBQW1DO0FBQUEsTUFBbENDLE9BQWtDLHVFQUF4QixFQUF3QjtBQUFBLE1BQXBCQyxVQUFvQix1RUFBUCxFQUFPO0FBQzFELFNBQU9ELE9BQU8sQ0FBQ0UsT0FBUixDQUFnQk4sYUFBaEIsRUFBK0IsVUFBQ08sS0FBRCxFQUFRQyxPQUFSLEVBQW9CO0FBQ3hELFdBQU9ILFVBQVUsQ0FBQ0csT0FBRCxDQUFWLElBQ0xOLGNBQWMsQ0FBQ08sT0FBZixDQUF1QkosVUFBVSxDQUFDRyxPQUFELENBQWpDLElBQThDLENBRHpDLEdBRUhILFVBQVUsQ0FBQ0csT0FBRCxDQUZQLEdBR0hELEtBSEo7QUFJRCxHQUxNLENBQVA7QUFNRCxDQVBEOztlQVNlSixnQiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCB2YXJpYWJsZVJlZ0V4ID0gbmV3IFJlZ0V4cCgvI3soXFxTKyl9L2cpO1xuY29uc3QgZXhjbHVkZWRWYWx1ZXMgPSBbXCI+PlwiXTtcbmNvbnN0IHJlcGxhY2VWYXJpYWJsZXMgPSAoY29udGVudCA9IFwiXCIsIGN1c3RvbURhdGEgPSB7fSkgPT4ge1xuICByZXR1cm4gY29udGVudC5yZXBsYWNlKHZhcmlhYmxlUmVnRXgsIChtYXRjaCwgdmFyTmFtZSkgPT4ge1xuICAgIHJldHVybiBjdXN0b21EYXRhW3Zhck5hbWVdICYmXG4gICAgICBleGNsdWRlZFZhbHVlcy5pbmRleE9mKGN1c3RvbURhdGFbdmFyTmFtZV0pIDwgMFxuICAgICAgPyBjdXN0b21EYXRhW3Zhck5hbWVdXG4gICAgICA6IG1hdGNoO1xuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHJlcGxhY2VWYXJpYWJsZXM7XG4iXX0=