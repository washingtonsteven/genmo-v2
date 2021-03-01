# 📕 Genmo v2 📗 <!-- omit in toc --> BLAH BLAH BLAH

## New, updated, sleeker, sexier, adjectivier, and cheesier than ever! 🧀 <!-- omit in toc -->

Genmo is a text narrative engine that is meant to be pluggable into any sort of frontend. 

---
## Table of Contents <!-- omit in toc -->
- [Generating Stories](#generating-stories)
  - [Story Data](#story-data)
  - [Inserting data into text](#inserting-data-into-text)
  - [Prompting for data](#prompting-for-data)
  - [Conditional Links](#conditional-links)
  - [Managing Player Inventory](#managing-player-inventory)
  - [Shortcodes](#shortcodes)
    - [`has_inventory` and `!has_inventory`](#has_inventory-and-has_inventory)
- [Usage](#usage)
  - [Options](#options)
    - [`outputFunction`](#outputfunction)
    - [`errorFunction`](#errorfunction)
- [API](#api)
  - [`new Genmo(storyData, options = {})`](#new-genmostorydata-options--)
  - [`outputCurrentPassage()`](#outputcurrentpassage)
  - [`getCurrentPassage()`](#getcurrentpassage)
  - [`followLink(Object|String)`](#followlinkobjectstring)
  - [`respondToPrompt(Object)`](#respondtopromptobject)
  - [`getInventory()`](#getinventory)
  - [`updateInventory(Object)`](#updateinventoryobject)
  - [`setData(Object)`](#setdataobject)
  - [`getData()`](#getdata)
  - [`getPassageData(passage)`](#getpassagedatapassage)
  - [`state`](#state)

---

### Generating Stories

Stories are in JSON format, as written in [Twine](http://twinery.org/) using the [Twison](https://github.com/lazerwalker/twison) story format. Create your story in Twine as usual, then use the Twison story format to export your story to a `.json` file.

Currently, no Harlowe functions are available (unless you implement them in your `outputFunction`, [see below](#outputFunction)). Any directives will be output in the JSON with zero processing.

If you do not want your links to show up in the body text, you can separate them with a newline, 3 dashes, and another newline:

```
Normal passage text.

---

[[Page 2]]
[[Page 3]]
```

This will generate a `passageText` variable on each passage that only has the text above that divider.

#### Story Data

You can update story data upon entering a passage by including a JSON object describing the data you want to change under the links with a similar separator for the link

```
Normal passage text.

---

[[Page 2]]
[[Page 3]]

---
{
  "hp":10,
  "wizard_staff": true,
  "player_name": "Steve"
}

```

Data is cumulative, so you don't need to specify the entire data object in each passage. You can use `++` or `--` prefixes to increment/decrement a variable by a value:

```
The orc hits you for 2 damage!

---

[[Fight back]]

---

{
  "hp":"--2"
}
```

After the last two example blocks, `hp` will be set to `8`

#### Inserting data into text

Data can be insert into the passage text by wrapping the variable name in `#{<variableName>}`. For example:

```
The orc hits you for 2 damage!
Your HP is #{hp}

---

[[Fight back]]

---

{
  "hp":"--2"
}
```

`passageText` will be:
```
The orc hits you for 2 damage! 
Your HP is 8
```

#### Prompting for data

Data can also be prompted for by the player. Any data keys that need to be prompted can be indicated in the data JSON with a `>>`. For example: 

```
Normal passage text.

---

[[Page 2]]
[[Page 3]]

---
{
  "hp":10,
  "wizard_staff": true,
  "player_name": ">>"
}

```

This will cause Genmo to return a passage object that will indicate that `player_name` needs input from the player. Otherwise, any instance of `#{player_name}` in `passageText` will not be replaced.

See [respondToPrompt](#respondtopromptobject) for the API on how to properly log player responses.

#### Conditional Links

You can use named links (using `->`) in order to specify conditions for the link to appear, separated from the name with `||`:

```
Normal passage text

---

[[Go home]]
[[Go to the hospital||hp lt 10->Go to the hospital]]
```

This will only display `Go to the hospital` if the variable `hp` is less than `10`

The operators available are: 
  - `lt`: less than
  - `gt`: greater than
  - `lte`: less than or equal
  - `gte`: greater than or equal
  - `eq`: equals
  - `seq`: strict equals (`===`)

`lt`, `gt`, `lte`, and `gte` will convert any variable to a Number before comparison.

The displayed name will also have anything after `||` removed before display/`outputFunction`

#### Managing Player Inventory

Genmo can keep track of a player's inventory as a set of key/value pairs where the key is the name of the item, and the value is how many they have. Currently, Genmo only supports adding one of an individual item at a time (i.e. per passage). For player resources like currencies, use [data](#story-data) instead.

Inventory is indicated in the story text via the `inventory_add` and `inventory_remove` keys:

```
Normal passage text.

---

[[Page 2]]
[[Page 3]]

---
{
  "inventory_add": "wand_of_gamelon"
}

```

This will add one (1) `wand_of_gamelon` to the player's inventory. Conversely:

```
Normal passage text.

---

[[Page 2]]
[[Page 3]]

---
{
  "inventory_remove": "broken_sword"
}

```

Will remove one (1) `broken_sword` from the inventory. Note that inventory items cannot go negative.

**Recommendation:** Genmo's inventory is a simple key/value pair, looking something like this:

```js
{
  "bounce_bracelet": 1,
  "magic_ring": 2,
  "bread_loaves": 5
}
```

Naturally, there isn't a lot of information in this about _what_ the inventory items actually are. The keys in this object can (should?) be used as keys in your application's item database so details about items (descriptions, images, flavor text) can be kept in application code.

#### Shortcodes

Some shortcodes are available to modify your text on the fly. Shortcodes are typically follow the following format:

```
#{shortcodeName argument1 argument2}Text content here to be modified by the shortcode#{/shortcodeName}
```

This format is fairly strict; any unexpected output around shortcodes should be inspected for proper format (I personally have forgotten the ending `/` in the closing shortcode tag a bunch).

Shortcodes cannot be nested, any shortcodes within a shortcode text content will not be processed. Data within a shortcode will be replaced, however.

Also, line breaks around the shortcodes are not cleaned up, so excessive shortcode use, or using line breaks around the codes may result in a lot of new lines. This can be mitigated by collapsing line breaks with `trim()` or something like `replace(/[\r\n]+/, "\n")`, to limit line breaks to one.

##### `has_inventory` and `!has_inventory`

These shortcodes will show/hide the text content based on whether the player has (or doesn't have) a set of specified items in their inventory.

```
#{inventory_has coin}You have a coin!#{/inventory_has}
```

In the opening tag, you can supply a space-separate list of items that the player must have ALL of in order for the text to show:

```
#{inventory_has coin book}You have a coin and a book#{/inventory_has}
```

`!has_inventory works the same, but asserts that a player doesn't have an item. If multiple items are specified, the player must not have any of the items in the list:

```
#{!inventory_has tea coffee}You don't have tea OR coffee#{/!inventory_has}
```

(Note that the closing tag has both the `/` for closing the tag, and `!` from the shortcodeName)

### Usage

```js
import { Genmo } from "genmo-v2";

// Load in your JSON however you like
import StoryJSON from "story.json";

const story = new Genmo(StoryJSON, {
  outputFunction: (passage) => {
    // output passage
  },
  errorFunction: (err) => {
    // deal with error
  }
})
```

Note that `Genmo` is not a default export, but a named one. In CommonJS:

```js
const Genmo = require("genmo-v2").Genmo
```

#### Options

##### `outputFunction`

```js
const outputFunction = (passage) => {

}
```

You will receive the entire "passage" object from the StoryJSON generated by Twine:

  - `text` : Main passage text (including links and unprocessed Harlowe directives)
  - `links`: Array of links in this passage
    - `name`: The display text for this link
    - `link`: The name of the passage this link links to
    - `pid`: The Passage Id of the passage this link links to
  - `name`: The name of this passage
  - `pid`: The Passage Id of this passage
  - `position`: The position of this passage within Twine
    - `x`: x position of the passage. String.
    - `y`: y position of the passage. String.
  - `needsPrompt`: An array of variables that require user input.
    - `key`: The name of the variable
    - `complete`: (Boolean) Whether we already have data for this key.

In addition you will recieve `passageText` (`passage.passageText`) which is a subset of the text above the link divider (see [Generating Stories](#generating-stories) above)

Returning any value from the `outputFunction` will also return that value from functions that "output" (i.e. `Genmo.outputCurrentPassage`)

##### `errorFunction`

```js
const errorFunction = (err) => {

}
```

This will be called if you do anything illegal with Genmo (except call its constructor without storyData, in which case an `Error` will be thrown).

If your `errorFunction` returns a value, any function that calls your `errorFunction` will also return that value.

Possible errors are available as an export named `ERRORS`

```js
import { ERRORS } from "genmo-v2";
```

### API

#### `new Genmo(storyData, options = {})`

Constructs a new Genmo Object. Options are detailed above.

#### `outputCurrentPassage()`

```js
story.outputCurrentPassage()
```

This function will call your `outputFunction` with the current passage.
If your `outputFunction` returns a value, it will be returned here as well.

#### `getCurrentPassage()`

```js
story.getCurrentPassage()
```

Returns the raw passage object for the current passage. This is the same object that is passed to your `outputFunction`.

#### `followLink(Object|String)`

```js
story.followLink(link)
```

This will set the `currentPassage` to the passage linked to in the provided `link`. This will only work if the link you are trying to follow is on the `currentPassage`. You may pass in the entire object from the `links` array in the passage, or just the `pid` of the passage that link goes to.

Attempting to follow an invalid link (the link doesn't exist, is not a part of this passage, or does not link to a passage that exists, etc.) will call your `errorFunction` and return any value you had set there.

#### `respondToPrompt(Object)`

```js
story.respondToPrompt({variableName: "receivedValue"});
```

See [Prompting for data](#prompting-for-data).

If, in `outputFunction`, `passage` has a key called `needsPrompt`, you should query the user for the keys involved (using `passage.needsPrompt[i].key`). Once the user has provided an answer, you can call `respondToPrompt` with an object mapping the variable name (`key`) to the user's answer (using whatever method of input you desire).

Note that the object in `respondToPrompt` will only handle one variable at a time. So if you have multiple prompts, you will call `respondToPrompt` multiple times for each. 

Once you call `respondToPrompt` for a given `key`, it will still show up in the `passage.needsPrompt` array, however it will have a property `complete` set to `true` (i.e. `passage.needsPrompt[i].complete`). It is up to you if you wish to re-prompt the user or leave the data as is.

Note this function will throw an error if you are attempting to respond to a prompt that does not exist on the current passage (`story.getCurrentPassage()`).

#### `getInventory()`

```js
story.getInventory();
```

This simply returns the key/value pairs to indicate quantities in the player inventory. This is the same as `genmo.state.data.inventory`.

#### `updateInventory(Object)`

```js
story.updateInventory(inventoryUpdateObject)
```

This will allow you to add items outside of specifying them in Twine. An object is provided which indicates which items are being updated, as well as a delta of their quantities:

```js
genmo.updateInventory({
  "broom": 1,
  "fishhook": -2,
})
```

The above call will add one (1) broom to the inventory, and remove two (2) fishhooks.

#### `setData(Object)`

```js
story.setData(myDataObject)
```

Allows you to set arbitrary data to the story's data. 

#### `getData()`

```js
story.getData()
```

Returns the current data object for the story

#### `getPassageData(passage)`

```js
story.getPassageData(story.getCurrentPassage()) // Or any other passage
```

Gets the parsed data for the current passage. Note that any deltas (i.e. `{ s: "--2"}`) will be returned unchanged, that is, as literal strings. Will return null if there is no data for the current passage.

#### `state`

```js
story.state

story.state.storyData

story.state.currentPassage

story.state.data
```

Genmo keeps track of its state in `state`, there are several properties:

- `storyData`: The complete storyData passed in the Genmo constructor
  - `passages`: Array of passage objects
  - `name`: Name of the Story (as set in Twine)
  - `startnode`: The `pid` of the starting passage
  - `creator`: The name of the app that created the story (usually "Twine")
  - `creator-version`: Version of Twine when this story was made
  - `ifid`: String representing an ID to be used in the [Interactive Fiction Database](https://ifdb.tads.org/help-ifid)
- `currentPassage`: The current passage set. Passage properties are detailed in the [`outputFunction` section](#outputFunction) above

`story.state.data` is the list of custom data applied by inline JSON in Twine.


**As a general rule:** `state` should only be read from, not written to. Writing to state outside of the provided functions (`followLink()`, etc) may cause inconsistent behavior. 