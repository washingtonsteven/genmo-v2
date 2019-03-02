"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var StatefulComponent =
/*#__PURE__*/
function () {
  function StatefulComponent() {
    var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var reducers = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, StatefulComponent);

    this.state = _objectSpread({}, initialState);
    this.reducers = [];
    this.actions = [];
    this.addReducer(reducers);
  }

  _createClass(StatefulComponent, [{
    key: "addReducer",
    value: function addReducer(fn) {
      if (!Array.isArray(fn)) fn = [fn];
      this.reducers = this.reducers.concat(fn).filter(function (f) {
        return typeof f === "function";
      });
    }
  }, {
    key: "setState",
    value: function setState(newState, callback) {
      if (typeof newState === "function") {
        newState = newState(this.state);
      }

      this.state = _objectSpread({}, this.state, newState);
      this.doCallback(callback);
    }
  }, {
    key: "doAction",
    value: function doAction(action, callback) {
      var _this = this;

      var updatedState = this.state;
      this.reducers.forEach(function (r) {
        _this.setState(r(updatedState, action));
      });
      this.actions.push(action);
      this.doCallback(callback);
    }
  }, {
    key: "doCallback",
    value: function doCallback(callback) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (typeof callback === "function") callback.apply(void 0, args);
    }
  }]);

  return StatefulComponent;
}();

var _default = StatefulComponent;
exports.default = _default;
module.exports = exports.default;