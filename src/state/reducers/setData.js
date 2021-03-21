import { cloneData, ACTIONS } from "../../utils/reducerUtils";
/**
 * If action.type === ACTIONS.SET_DATA.type, takes `action.data` and sets it to `state.data`
 * @param {Object} state
 * @param {Object} action
 * @return {Object}
 */
export function setDataReducer(state, action) {
  if (action.type === ACTIONS.SET_DATA.type) {
    const data = cloneData(state.data);
    Object.entries(action.data).forEach(([key, value]) => {
      data[key] = value;
    });
    return {
      ...state,
      data,
    };
  }

  return {
    ...state,
  };
}
