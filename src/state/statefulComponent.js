/**
 * @class
 * @property {Object} state
 * @property {Function[]} reducers
 * @property {Object[]} actions
 * @property {Object[]} previousStates
 */
class StatefulComponent {
  constructor(initialState = {}, reducers) {
    this.state = { ...initialState };
    this.reducers = [];
    this.actions = [
      {
        type: "@@INIT",
      },
    ];
    this.previousStates = [
      {
        ...this.state,
      },
    ];
    this.addReducer(reducers);
  }
  /**
   * Adds a reducer which will be called whenever an action is dispatched
   * @param {Function} fn
   */
  addReducer(fn) {
    if (!Array.isArray(fn)) fn = [fn];

    this.reducers = this.reducers
      .concat(fn)
      .filter((f) => typeof f === "function");
  }
  /**
   * Merges `newState` into `state`, then calls `callback` if provided.
   * @param {Object} newState
   * @param {Function} [callback]
   */
  setState(newState, callback) {
    if (typeof newState === "function") {
      newState = newState(this.state);
    }
    this.state = {
      ...this.state,
      ...newState,
    };

    this.doCallback(callback);
  }
  /**
   * Applies an action to the state, via the currently registered reducers.
   * If a reducer throws an error, it is caught and sent to `onError`
   *
   * Once all reducers have been called, the action is pushed onto `actions` (to allow inspecting previous actions).
   *
   * After everything, the callback is called, if provided
   *
   * @param {Object} action
   * @param {Function} [callback]
   * @param  {...any} [callbackArgs]
   */
  doAction(action, callback, ...callbackArgs) {
    let updatedState = this.state;
    for (let i = 0; i < this.reducers.length; i++) {
      try {
        updatedState = this.reducers[i](updatedState, action) || updatedState;
      } catch (err) {
        this.onError(err);
        break;
      }
    }
    this.setState(updatedState);
    this.actions.push({ ...action });
    this.previousStates.push({ ...updatedState });

    this.doCallback(callback, ...callbackArgs);
  }
  doCallback(callback, ...args) {
    if (typeof callback === "function") callback(...args);
  }
  /**
   * Handles an error that came from a reducer. Default behavior is to throw the error, however
   * this can be overridden to allow other error handling.
   * @param {Error} err
   */
  onError(err) {
    throw err;
  }
}

export default StatefulComponent;
