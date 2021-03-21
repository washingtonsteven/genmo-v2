import { followLinkReducer } from "./reducers/followLink";
import { updateInventoryReducer } from "./reducers/updateInventory";
import { promptAnswerReducer } from "./reducers/promptAnswer";
import { setDataReducer } from "./reducers/setData";

/** @type {Function[]}
 * @description a list of all reducers, to be registered with Genmo at once
 * @ignore
 */
export const reducers = [
  followLinkReducer,
  promptAnswerReducer,
  updateInventoryReducer,
  setDataReducer,
];
