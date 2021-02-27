class StatefulComponent {
  constructor(initialState = {}, reducers) {
    this.state = { ...initialState };
    this.reducers = [];
    this.actions = [];
    this.addReducer(reducers);
  }
  addReducer(fn) {
    if (!Array.isArray(fn)) fn = [fn];

    this.reducers = this.reducers
      .concat(fn)
      .filter((f) => typeof f === "function");
  }
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
    this.actions.push(action);

    this.doCallback(callback, ...callbackArgs);
  }
  doCallback(callback, ...args) {
    if (typeof callback === "function") callback(...args);
  }
  onError(err) {
    throw err;
  }
}

export default StatefulComponent;
