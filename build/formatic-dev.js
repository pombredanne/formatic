!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Formatic=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// # index

// Export the Formatic React class at the top level.
"use strict";

module.exports = require("./lib/formatic");

},{"./lib/formatic":42}],2:[function(require,module,exports){
(function (global){
// # array component

/*
Render a field to edit array values.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: "Array",

  mixins: [require("../../mixins/field")],

  // getDefaultProps: function () {
  //   return {
  //     className: plugin.config.className
  //   };
  // },

  nextLookupId: 0,

  getInitialState: function getInitialState() {

    // Need to create artificial keys for the array. Indexes are not good keys,
    // since they change. So, map each position to an artificial key
    var lookups = [];

    var items = this.props.field.value;

    items.forEach((function (item, i) {
      lookups[i] = "_" + this.nextLookupId;
      this.nextLookupId++;
    }).bind(this));

    return {
      lookups: lookups
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {

    var lookups = this.state.lookups;

    var items = newProps.field.value;

    // Need to set artificial keys for new array items.
    if (items.length > lookups.length) {
      for (var i = lookups.length; i < items.length; i++) {
        lookups[i] = "_" + this.nextLookupId;
        this.nextLookupId++;
      }
    }

    this.setState({
      lookups: lookups
    });
  },

  onChange: function onChange(i, newValue, info) {
    var newArrayValue = this.props.field.value.slice(0);
    newArrayValue[i] = newValue;
    this.onBubbleValue(newArrayValue, info);
  },

  onAppend: function onAppend(itemChoiceIndex) {
    var config = this.props.config;
    var field = this.props.field;

    var newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    var items = field.value;

    items = items.concat(newValue);

    this.onChangeValue(items);
  },

  onRemove: function onRemove(i) {
    var lookups = this.state.lookups;
    lookups.splice(i, 1);
    this.setState({
      lookups: lookups
    });
    var newItems = this.props.field.value.slice(0);
    newItems.splice(i, 1);
    this.onChangeValue(newItems);
  },

  onMove: function onMove(fromIndex, toIndex) {
    var lookups = this.state.lookups;
    var fromId = lookups[fromIndex];
    var toId = lookups[toIndex];
    lookups[fromIndex] = toId;
    lookups[toIndex] = fromId;
    this.setState({
      lookups: lookups
    });

    var newItems = this.props.field.value.slice(0);
    if (fromIndex !== toIndex && fromIndex >= 0 && fromIndex < newItems.length && toIndex >= 0 && toIndex < newItems.length) {
      newItems.splice(toIndex, 0, newItems.splice(fromIndex, 1)[0]);
    }
    this.onChangeValue(newItems);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    var numItems = field.value.length;
    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, R.div({ className: cx(this.props.classes) }, CSSTransitionGroup({ transitionName: "reveal" }, fields.map((function (childField, i) {
      return config.createElement("array-item", {
        key: this.state.lookups[i],
        field: childField,
        index: i,
        numItems: numItems,
        onMove: this.onMove,
        onRemove: this.onRemove,
        onChange: this.onChange,
        onAction: this.onBubbleAction
      });
    }).bind(this))), config.createElement("array-control", { field: field, onAppend: this.onAppend })));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],3:[function(require,module,exports){
(function (global){
// # boolean component

/*
Render a dropdown to handle yes/no boolean values.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "Boolean",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(newValue) {
    this.onChangeValue(newValue);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldBooleanChoices(field);

    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, config.createElement("select-value", {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],4:[function(require,module,exports){
(function (global){
// # checkbox-array component

/*
Used with array values to supply multiple checkboxes for adding multiple
enumerated values to an array.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "CheckboxArray",

  mixins: [require("../../mixins/field")],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  onChange: function onChange() {
    // Get all the checked checkboxes and convert to an array of values.
    var choiceNodes = this.refs.choices.getDOMNode().getElementsByTagName("input");
    choiceNodes = Array.prototype.slice.call(choiceNodes, 0);
    var values = choiceNodes.map(function (node) {
      return node.checked ? node.value : null;
    }).filter(function (value) {
      return value;
    });
    this.onChangeValue(values);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var choices = this.state.choices || [];

    var isInline = !_.find(choices, function (choice) {
      return choice.sample;
    });

    return config.createElement("field", {
      field: field
    }, R.div({ className: cx(this.props.classes), ref: "choices" }, choices.map((function (choice, i) {

      var inputField = R.span({ style: { whiteSpace: "nowrap" } }, R.input({
        name: field.key,
        type: "checkbox",
        value: choice.value,
        checked: field.value.indexOf(choice.value) >= 0 ? true : false,
        onChange: this.onChange,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      }), " ", R.span({ className: "field-choice-label" }, choice.label));

      if (isInline) {
        return R.span({ key: i, className: "field-choice" }, inputField, " ");
      } else {
        return R.div({ key: i, className: "field-choice" }, inputField, " ", config.createElement("sample", { field: field, choice: choice }));
      }
    }).bind(this))));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],5:[function(require,module,exports){
(function (global){
// # checkbox-boolean component

/*
Render a field that can edit a boolean with a checkbox.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "CheckboxBoolean",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.checked);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: true
    }, R.span({ style: { whiteSpace: "nowrap" } }, R.input({
      type: "checkbox",
      checked: field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }), R.span({}, " "), R.span({}, config.fieldHelpText(field) || config.fieldLabel(field))));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],6:[function(require,module,exports){
(function (global){
// # copy component

/*
Render non-editable html/text (think article copy).
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "Copy",

  mixins: [require("../../mixins/field")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    return R.div({ className: cx(this.props.classes), dangerouslySetInnerHTML: {
        __html: this.props.config.fieldHelpText(this.props.field)
      } });
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],7:[function(require,module,exports){
(function (global){
// # fields component

/*
Render a field to edit the values of an object with static properties.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "Fields",

  mixins: [require("../../mixins/field")],

  onChangeField: function onChangeField(key, newValue, info) {
    if (key) {
      var newObjectValue = _.extend({}, this.props.field.value);
      newObjectValue[key] = newValue;
      this.onBubbleValue(newObjectValue, info);
    }
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.fieldset({ className: cx(this.props.classes) }, fields.map((function (childField, i) {
      var key = childField.key || i;
      return config.createFieldElement({
        key: key || i,
        field: childField,
        onChange: this.onChangeField.bind(this, key), onAction: this.onBubbleAction
      });
    }).bind(this))));
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],8:[function(require,module,exports){
(function (global){
// # json component

/*
Textarea editor for JSON. Will validate the JSON before setting the value, so
while the value is invalid, no external state changes will occur.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "Json",

  mixins: [require("../../mixins/field")],

  getDefaultProps: function getDefaultProps() {
    return {
      rows: 5
    };
  },

  isValidValue: function isValidValue(value) {

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  },

  getInitialState: function getInitialState() {
    return {
      isValid: true,
      value: JSON.stringify(this.props.field.value, null, 2)
    };
  },

  onChange: function onChange(event) {
    var isValid = this.isValidValue(event.target.value);

    if (isValid) {
      // Need to handle this better. Need to track position.
      this._isChanging = true;
      this.onChangeValue(JSON.parse(event.target.value));
    }

    this.setState({
      isValid: isValid,
      value: event.target.value
    });
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (!this._isChanging) {
      this.setState({
        isValid: true,
        value: JSON.stringify(nextProps.field.value, null, 2)
      });
    }
    this._isChanging = false;
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      field: config.fieldWithValue(field, this.state.value), plain: this.props.plain
    }, R.textarea({
      className: cx(this.props.classes),
      value: this.state.value,
      onChange: this.onChange,
      style: { backgroundColor: this.state.isValid ? "" : "rgb(255,200,200)" },
      rows: config.fieldRows(field) || this.props.rows,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],9:[function(require,module,exports){
(function (global){
// # object component

/*
Render a field to edit an object with dynamic child fields.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

var tempKeyPrefix = "$$__temp__";

var tempKey = function tempKey(id) {
  return tempKeyPrefix + id;
};

var isTempKey = function isTempKey(key) {
  return key.substring(0, tempKeyPrefix.length) === tempKeyPrefix;
};

// TODO: keep invalid keys as state and don't send in onChange; clone context
// and use clone to create child contexts

module.exports = React.createClass({

  displayName: "Object",

  mixins: [require("../../mixins/field")],

  nextLookupId: 0,

  getInitialState: function getInitialState() {

    var keyToId = {};
    var keys = Object.keys(this.props.field.value);
    var keyOrder = [];
    // Temp keys keeps the key to display, which sometimes may be different
    // than the actual key. For example, duplicate keys are not allowed,
    // but we may temporarily show duplicate keys.
    var tempDisplayKeys = {};

    // Keys don't make good react keys, since we're allowing them to be
    // changed here, so we'll have to create fake keys and
    // keep track of the mapping of real keys to fake keys. Yuck.
    keys.forEach((function (key) {
      var id = ++this.nextLookupId;
      // Map the real key to the id.
      keyToId[key] = id;
      // Keep the ordering of the keys so we don't shuffle things around later.
      keyOrder.push(key);
      // If this is a temporary key that was persisted, best we can do is display
      // a blank.
      // TODO: Probably just not send temporary keys back through. This behavior
      // is actually leftover from an earlier incarnation of formatic where
      // values had to go back to the root.
      if (isTempKey(key)) {
        tempDisplayKeys[id] = "";
      }
    }).bind(this));

    return {
      keyToId: keyToId,
      keyOrder: keyOrder,
      // Temp keys keeps the key to display, which sometimes may be different
      // than the actual key. For example, duplicate keys are not allowed,
      // but we may temporarily show duplicate keys.
      tempDisplayKeys: tempDisplayKeys
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {

    var keyToId = this.state.keyToId;
    var newKeyToId = {};
    var tempDisplayKeys = this.state.tempDisplayKeys;
    var newTempDisplayKeys = {};
    var keyOrder = this.state.keyOrder;
    var keys = Object.keys(newProps.field.value);
    var addedKeys = [];

    // Look at the new keys.
    keys.forEach((function (key) {
      // Add new lookup if this key wasn't here last time.
      if (!keyToId[key]) {
        this.nextLookupId++;
        newKeyToId[key] = this.nextLookupId;
        addedKeys.push(key);
      } else {
        newKeyToId[key] = keyToId[key];
      }
      if (isTempKey(key) && newKeyToId[key] in tempDisplayKeys) {
        newTempDisplayKeys[newKeyToId[key]] = tempDisplayKeys[newKeyToId[key]];
      }
    }).bind(this));

    var newKeyOrder = [];

    // Look at the old keys.
    keyOrder.forEach(function (key) {
      // If the key is in the new keys, push it onto the order to retain the
      // same order.
      if (newKeyToId[key]) {
        newKeyOrder.push(key);
      }
    });

    // Put added fields at the end. (So things don't get shuffled.)
    newKeyOrder = newKeyOrder.concat(addedKeys);

    this.setState({
      keyToId: newKeyToId,
      keyOrder: newKeyOrder,
      tempDisplayKeys: newTempDisplayKeys
    });
  },

  onChange: function onChange(key, newValue, info) {
    var newObj = _.extend({}, this.props.field.value);
    newObj[key] = newValue;
    this.onBubbleValue(newObj, info);
  },

  onAppend: function onAppend(itemChoiceIndex) {
    var config = this.props.config;
    var field = this.props.field;
    this.nextLookupId++;

    var keyToId = this.state.keyToId;
    var keyOrder = this.state.keyOrder;
    var tempDisplayKeys = this.state.tempDisplayKeys;

    var id = this.nextLookupId;
    var newKey = tempKey(id);

    keyToId[newKey] = id;
    // Temporarily, we'll show a blank key.
    tempDisplayKeys[id] = "";
    keyOrder.push(newKey);

    this.setState({
      keyToId: keyToId,
      tempDisplayKeys: tempDisplayKeys,
      keyOrder: keyOrder
    });

    var newObj = _.extend(this.props.field.value);

    var newValue = config.createNewChildFieldValue(field, itemChoiceIndex);

    newObj[newKey] = newValue;

    this.onChangeValue(newObj);
  },

  onRemove: function onRemove(key) {
    var newObj = _.extend(this.props.field.value);
    delete newObj[key];
    this.onChangeValue(newObj);
  },

  onMove: function onMove(fromKey, toKey) {
    if (fromKey !== toKey) {
      var keyToId = this.state.keyToId;
      var keyOrder = this.state.keyOrder;
      var tempDisplayKeys = this.state.tempDisplayKeys;

      var newObj = _.extend(this.props.field.value);

      // If we already have the key we're moving to, then we have to change that
      // key to something else.
      if (keyToId[toKey]) {
        // Make a new
        var tempToKey = tempKey(keyToId[toKey]);
        tempDisplayKeys[keyToId[toKey]] = toKey;
        keyToId[tempToKey] = keyToId[toKey];
        keyOrder[keyOrder.indexOf(toKey)] = tempToKey;
        delete keyToId[toKey];
        this.setState({
          keyToId: keyToId,
          tempDisplayKeys: tempDisplayKeys,
          keyOrder: keyOrder
        });

        newObj[tempToKey] = newObj[toKey];
        delete newObj[toKey];
      }

      if (!toKey) {
        toKey = tempKey(keyToId[fromKey]);
        tempDisplayKeys[keyToId[fromKey]] = "";
      }
      keyToId[toKey] = keyToId[fromKey];
      delete keyToId[fromKey];
      keyOrder[keyOrder.indexOf(fromKey)] = toKey;

      this.setState({
        keyToId: keyToId,
        keyOrder: keyOrder,
        tempDisplayKeys: tempDisplayKeys
      });

      newObj[toKey] = newObj[fromKey];
      delete newObj[fromKey];

      this.onChangeValue(newObj);

      // Check if our fromKey has opened up a spot.
      if (fromKey && fromKey !== toKey) {
        if (!(fromKey in newObj)) {
          Object.keys(newObj).forEach((function (key) {
            if (!isTempKey(key)) {
              return;
            }
            var id = keyToId[key];
            var displayKey = tempDisplayKeys[id];
            if (fromKey === displayKey) {
              this.onMove(key, displayKey);
            }
          }).bind(this));
        }
      }
    }
  },

  getFields: function getFields() {
    var config = this.props.config;
    var field = this.props.field;

    var fields = config.createChildFields(field);

    var keyToField = {};

    _.each(fields, function (childField) {
      keyToField[childField.key] = childField;
    });

    return this.state.keyOrder.map(function (key) {
      return keyToField[key];
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fields = this.getFields();

    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, R.div({ className: cx(this.props.classes) }, CSSTransitionGroup({ transitionName: "reveal" }, fields.map((function (childField) {
      var displayKey = this.state.tempDisplayKeys[this.state.keyToId[childField.key]];
      if (_.isUndefined(displayKey)) {
        displayKey = childField.key;
      }
      return config.createElement("object-item", {
        key: this.state.keyToId[childField.key],
        field: childField,
        onMove: this.onMove,
        onRemove: this.onRemove,
        onChange: this.onChange,
        onAction: this.onBubbleAction,
        displayKey: displayKey,
        itemKey: childField.key
      });
    }).bind(this))), config.createElement("object-control", { field: field, onAppend: this.onAppend })));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],10:[function(require,module,exports){
(function (global){
// # pretty boolean component

/*
Render pretty boolean component with non-native drop-down
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "PrettyBoolean",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(newValue) {
    this.onChangeValue(newValue);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var choices = config.fieldBooleanChoices(field);

    return config.createElement("field", {
      field: field, plain: this.props.plain
    }, config.createElement("pretty-select-value", {
      choices: choices, field: field, onChange: this.onChange, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],11:[function(require,module,exports){
(function (global){
// # select component

/*
Render select element to give a user choices for the value of a field. Renders non-native
select drop down and supports fancier renderings.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "PrettySelect",

  mixins: [require("../../mixins/field")],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldPrettyChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldPrettyChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, config.createElement("pretty-select-value", {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],12:[function(require,module,exports){
(function (global){
"use strict";
/* global CodeMirror */
/*eslint no-script-url:0 */

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var TagTranslator = require("../helpers/tag-translator");
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

/*
   Editor for tagged text. Renders text like "hello {{firstName}}"
   with replacement labels rendered in a pill box. Designed to load
   quickly when many separate instances of it are on the same
   page.

   Uses CodeMirror to edit text. To save memory the CodeMirror node is
   instantiated when the user moves the mouse into the edit area.
   Initially a read-only view using a simple div is shown.

   IMPLEMENTATION NOTE:

   To display the tags inside CodeMirror we are using CM's
   specialCharPlaceholder feature, to replace special characters with
   custom DOM nodes. This feature is designed for single character
   replacements, not tags like 'firstName'.  So we replace each tag
   with an unused character from the Unicode private use area, and
   tell CM to replace that with a DOM node display the tag label with
   the pill box effect.

   Is this evil? Perhaps a little, but delete, undo, redo, cut, copy
   and paste of the tag pill boxes just work because CM treats them as
   atomic single characters, and it's not much code on our part.
 */
module.exports = React.createClass({
  displayName: "PrettyText",

  mixins: [require("../../mixins/field")],

  componentDidMount: function componentDidMount() {
    this.createEditor();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (prevState.codeMirrorMode !== this.state.codeMirrorMode) {
      // Changed from code mirror mode to read only mode or vice versa,
      // so setup the other editor.
      this.createEditor();
    }

    // If they just typed in a tag like {{firstName}} we have to replace it
    if (this.state.codeMirrorMode && this.codeMirror.getValue().match(/\{\{.+\}\}/)) {
      // avoid recursive update cycle
      this.updatingCodeMirror = true;

      // get new encoded value for CodeMirror
      var cmValue = this.codeMirror.getValue();
      var decodedValue = this.state.translator.decodeValue(cmValue);
      var encodedValue = this.state.translator.encodeValue(decodedValue);

      // Grab the cursor so we can reset it.
      // The new length of the CM value will be shorter after replacing a tag like {{firstName}}
      // with a single special char, so adjust cursor position accordingly.
      var cursor = this.codeMirror.getCursor();
      cursor.ch -= cmValue.length - encodedValue.length;

      this.codeMirror.setValue(encodedValue);
      this.codeMirror.setCursor(cursor);
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.state.codeMirrorMode) {
      this.removeCodeMirrorEditor();
    }
  },

  getInitialState: function getInitialState() {
    var replaceChoices = this.props.config.fieldReplaceChoices(this.props.field);
    var translator = TagTranslator(replaceChoices, this.props.config.humanize);

    return {
      value: this.props.field.value,
      codeMirrorMode: false,
      isChoicesOpen: false,
      replaceChoices: replaceChoices,
      translator: translator
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var replaceChoices = this.props.config.fieldReplaceChoices(nextProps.field);
    var nextState = {
      replaceChoices: replaceChoices
    };

    this.state.translator.addChoices(replaceChoices);

    if (this.state.value !== nextProps.field.value && nextProps.field.value) {
      nextState.value = nextProps.field.value;
    }

    this.setState(nextState);
  },

  handleChoiceSelection: function handleChoiceSelection(key) {
    this.setState({ isChoicesOpen: false });

    var char = this.state.translator.encodeTag(key);

    // put the cursor at the end of the inserted tag.
    this.codeMirror.replaceSelection(char, "end");
    this.codeMirror.focus();
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var props = { field: field, plain: this.props.plain };
    var tabIndex = field.tabIndex;

    var textBoxClasses = cx(_.extend({}, this.props.classes, { "pretty-text-box": true }));
    var textBox = this.createTextBoxNode();

    var insertBtn = config.createElement("insert-button", { ref: "toggle", onClick: this.onToggleChoices }, "Insert...");

    var choices = config.createElement("choices", {
      ref: "choices",
      choices: this.state.replaceChoices,
      open: this.state.isChoicesOpen,
      ignoreCloseNodes: this.getCloseIgnoreNodes,
      onSelect: this.handleChoiceSelection,
      onClose: this.onCloseChoices
    });

    // Render read-only version. We are using pure HTML via dangerouslySetInnerHTML, to avoid
    // the cost of the react nodes. This is probably a premature optimization.
    var element = React.createElement(
      "div",
      { className: "pretty-text-wrapper", onMouseEnter: this.switchToCodeMirror },
      React.createElement(
        "div",
        { className: textBoxClasses, tabIndex: tabIndex },
        textBox
      ),
      insertBtn,
      choices
    );

    return config.createElement("field", props, element);
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.refs.toggle.getDOMNode();
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? "open-replacements" : "close-replacements";
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  createTextBoxNode: function createTextBoxNode() {
    if (this.state.codeMirrorMode) {
      return React.createElement("div", { ref: "textBox" });
    } else {
      var html = this.state.translator.toHtml(this.state.value);
      return React.createElement("div", { ref: "textBox", dangerouslySetInnerHTML: { __html: html } });
    }
  },

  createEditor: function createEditor() {
    if (this.state.codeMirrorMode) {
      this.createCodeMirrorEditor();
    } else {
      this.createReadonlyEditor();
    }
  },

  createCodeMirrorEditor: function createCodeMirrorEditor() {
    var cmValue = this.state.translator.encodeValue(this.state.value);

    var options = {
      lineWrapping: true,
      tabindex: this.props.tabIndex,
      value: cmValue,
      specialChars: this.state.translator.specialCharsRegexp,
      specialCharPlaceholder: this.createTagNode,
      extraKeys: {
        Tab: false
      }
    };

    var textBox = this.refs.textBox.getDOMNode();
    textBox.innerHTML = ""; // release any previous read-only content so it can be GC'ed

    this.codeMirror = CodeMirror(textBox, options);
    this.codeMirror.on("change", this.onCodeMirrorChange);
  },

  onCodeMirrorChange: function onCodeMirrorChange() {
    if (this.updatingCodeMirror) {
      // avoid recursive update cycle, and mark the code mirror manual update as done
      this.updatingCodeMirror = false;
      return;
    }

    var newValue = this.state.translator.decodeValue(this.codeMirror.getValue());
    this.onChangeValue(newValue);
    this.setState({ value: newValue });
  },

  createReadonlyEditor: function createReadonlyEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();
    textBoxNode.innerHTML = this.state.translator.toHtml(this.state.value);
  },

  removeCodeMirrorEditor: function removeCodeMirrorEditor() {
    var textBoxNode = this.refs.textBox.getDOMNode();
    var cmNode = textBoxNode.firstChild;
    textBoxNode.removeChild(cmNode);
    this.codeMirror = null;
  },

  switchToCodeMirror: function switchToCodeMirror() {
    if (!this.state.codeMirrorMode) {
      this.setState({ codeMirrorMode: true });
    }
  },

  // Create pill box style for display inside CM. For example
  // '\ue000' becomes '<span class="tag>First Name</span>'
  createTagNode: function createTagNode(char) {
    var node = document.createElement("span");
    var label = this.state.translator.decodeChar(char);

    React.render(React.createElement(
      "span",
      { className: "pretty-part", onClick: this.onToggleChoices },
      label
    ), node);
    return node;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44,"../helpers/tag-translator":40}],13:[function(require,module,exports){
(function (global){
// # select component

/*
Render select element to give a user choices for the value of a field. Note
it should support values other than strings. Currently this is only tested for
boolean values, but it _should_ work for other values.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({

  displayName: "Select",

  mixins: [require("../../mixins/field")],

  getInitialState: function getInitialState() {
    return {
      choices: this.props.config.fieldChoices(this.props.field)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    this.setState({
      choices: newProps.config.fieldChoices(newProps.field)
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, config.createElement("select-value", {
      choices: this.state.choices, field: field, onChange: this.onChangeValue, onAction: this.onBubbleAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],14:[function(require,module,exports){
(function (global){
// # single-line-string component

/*
Render a single line text input.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "SingleLineString",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.input({
      type: "text",
      value: this.props.field.value,
      className: cx(this.props.classes),
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],15:[function(require,module,exports){
(function (global){
// # string component

/*
Render a field that can edit a string value.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "String",

  mixins: [require("../../mixins/field")],

  onChange: function onChange(event) {
    this.onChangeValue(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    return config.createElement("field", {
      config: config, field: field, plain: this.props.plain
    }, R.textarea({
      value: field.value,
      className: cx(this.props.classes),
      rows: field.rows || this.props.rows,
      onChange: this.onChange,
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction
    }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],16:[function(require,module,exports){
(function (global){
// # unknown component

/*
Render a field with an unknown type.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;

module.exports = React.createClass({

  displayName: "Unknown",

  mixins: [require("../../mixins/field")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.div({}, R.div({}, "Component not found for: "), R.pre({}, JSON.stringify(this.props.field.rawFieldTemplate, null, 2)));
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/field":44}],17:[function(require,module,exports){
(function (global){
// # add-item component

/*
The add button to append an item to a field.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "AddItem",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[add]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],18:[function(require,module,exports){
(function (global){
// # array-control component

/*
Render the item type choices and the add button for an array.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ArrayControl",

  mixins: [require("../../mixins/helper")],

  getInitialState: function getInitialState() {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function onSelect(index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function onAppend() {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;

    var field = this.props.field;
    var fieldTemplates = config.fieldItemFieldTemplates(field);

    var typeChoices = null;

    if (fieldTemplates.length > 0) {
      typeChoices = config.createElement("field-template-choices", {
        field: field, fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    return R.div({ className: cx(this.props.classes) }, typeChoices, " ", config.createElement("add-item", { field: field, onClick: this.onAppend }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],19:[function(require,module,exports){
(function (global){
// # array-item-control component

/*
Render the remove and move buttons for an array field.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ArrayItemControl",

  mixins: [require("../../mixins/helper")],

  onMoveBack: function onMoveBack() {
    this.props.onMove(this.props.index, this.props.index - 1);
  },

  onMoveForward: function onMoveForward() {
    this.props.onMove(this.props.index, this.props.index + 1);
  },

  onRemove: function onRemove() {
    this.props.onRemove(this.props.index);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createElement("remove-item", { field: field, onClick: this.onRemove, onMaybeRemove: this.props.onMaybeRemove }), this.props.index > 0 ? config.createElement("move-item-back", { field: field, onClick: this.onMoveBack }) : null, this.props.index < this.props.numItems - 1 ? config.createElement("move-item-forward", { field: field, onClick: this.onMoveForward }) : null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],20:[function(require,module,exports){
(function (global){
// # array-item-value component

/*
Render the value of an array item.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ArrayItemValue",

  mixins: [require("../../mixins/helper")],

  onChangeField: function onChangeField(newValue, info) {
    this.props.onChange(this.props.index, newValue, info);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createFieldElement({ field: field, onChange: this.onChangeField, onAction: this.onBubbleAction }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],21:[function(require,module,exports){
(function (global){
// # array-item component

/*
Render an array item.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = React.createClass({

  displayName: "ArrayItem",

  mixins: [require("../../mixins/helper")],

  getInitialState: function getInitialState() {
    return {
      isMaybeRemoving: false
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMaybeRemove: function onMaybeRemove(isMaybeRemoving) {
    this.setState({
      isMaybeRemoving: isMaybeRemoving
    });
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var classes = _.extend({}, this.props.classes);

    if (this.state.isMaybeRemoving) {
      classes["maybe-removing"] = true;
    }

    return R.div({ className: cx(classes) }, config.createElement("array-item-value", { field: field, index: this.props.index,
      onChange: this.props.onChange, onAction: this.onBubbleAction }), config.createElement("array-item-control", { field: field, index: this.props.index, numItems: this.props.numItems,
      onMove: this.props.onMove, onRemove: this.props.onRemove, onMaybeRemove: this.onMaybeRemove }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],22:[function(require,module,exports){
(function (global){
// # Choices component

/*
Render customized (non-native) dropdown choices.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: "Choices",

  mixins: [require("../../mixins/helper"),
  //plugin.require('mixin.resize'),
  //plugin.require('mixin.scroll'),
  require("../../mixins/click-outside")],

  getInitialState: function getInitialState() {
    return {
      maxHeight: null,
      open: this.props.open
    };
  },

  getIgnoreCloseNodes: function getIgnoreCloseNodes() {
    if (!this.props.ignoreCloseNodes) {
      return [];
    }
    var nodes = this.props.ignoreCloseNodes();
    if (!_.isArray(nodes)) {
      nodes = [nodes];
    }
    return nodes;
  },

  componentDidMount: function componentDidMount() {
    this.setOnClickOutside("choices", (function (event) {

      // Make sure we don't find any nodes to ignore.
      if (!_.find(this.getIgnoreCloseNodes(), (function (node) {
        return this.isNodeInside(event.target, node);
      }).bind(this))) {
        this.props.onClose();
      }
    }).bind(this));

    this.adjustSize();
  },

  onSelect: function onSelect(choice) {
    this.props.onSelect(choice.value);
  },

  onChoiceAction: function onChoiceAction(choice) {
    this.props.onChoiceAction(choice);
  },

  onResizeWindow: function onResizeWindow() {
    this.adjustSize();
  },

  onScrollWindow: function onScrollWindow() {
    this.adjustSize();
  },

  adjustSize: function adjustSize() {
    if (this.refs.choices) {
      var node = this.refs.choices.getDOMNode();
      var rect = node.getBoundingClientRect();
      var top = rect.top;
      var windowHeight = window.innerHeight;
      var height = windowHeight - top;
      this.setState({
        maxHeight: height
      });
    }
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({ open: nextProps.open }, (function () {
      this.adjustSize();
    }).bind(this));
  },

  onScroll: function onScroll() {},

  onWheel: function onWheel() {},

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var choices = this.props.choices;

    if (choices && choices.length === 0) {
      choices = [{ value: "///empty///" }];
    }

    if (this.props.open) {
      return R.div({ ref: "container", onWheel: this.onWheel, onScroll: this.onScroll,
        className: "choices-container", style: {
          userSelect: "none", WebkitUserSelect: "none", position: "absolute",
          maxHeight: this.state.maxHeight ? this.state.maxHeight : null
        } }, CSSTransitionGroup({ transitionName: "reveal" }, R.ul({ ref: "choices", className: "choices" }, choices.map((function (choice, i) {

        var choiceElement = null;

        if (choice.value === "///loading///") {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.props.onClose }, R.span({ className: "choice-label" }, "Loading..."));
        } else if (choice.value === "///empty///") {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.props.onClose }, R.span({ className: "choice-label" }, "No choices available."));
        } else if (choice.action) {
          var labelClasses = "choice-label " + choice.action;

          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onChoiceAction.bind(this, choice) }, R.span({ className: labelClasses }, choice.label || this.props.config.actionChoiceLabel(choice.action)), this.props.config.createElement("choice-action-sample", { action: choice.action, choice: choice }));
        } else {
          choiceElement = R.a({ href: "JavaScript" + ":", onClick: this.onSelect.bind(this, choice) }, R.span({ className: "choice-label" }, choice.label), R.span({ className: "choice-sample" }, choice.sample));
        }

        return R.li({ key: i, className: "choice" }, choiceElement);
      }).bind(this)))));
    }

    // not open
    return null;
  }
});

// console.log('stop that!')
// event.preventDefault();
// event.stopPropagation();

// event.preventDefault();
// event.stopPropagation();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/click-outside":43,"../../mixins/helper":45}],23:[function(require,module,exports){
(function (global){
// # field-template-choices component

/*
Give a list of choices of item types to create as children of an field.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "FieldTemplateChoices",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    this.props.onSelect(parseInt(event.target.value));
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;
    var field = this.props.field;

    var fieldTemplates = config.fieldItemFieldTemplates(field);

    var typeChoices = null;
    if (fieldTemplates.length > 1) {
      typeChoices = R.select({ className: cx(this.props.classes), value: this.fieldTemplateIndex, onChange: this.onChange }, fieldTemplates.map(function (fieldTemplate, i) {
        return R.option({ key: i, value: i }, fieldTemplate.label || i);
      }));
    }

    return typeChoices ? typeChoices : R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],24:[function(require,module,exports){
(function (global){
// # field component

/*
Used by any fields to put the label and help text around the field.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

var CSSTransitionGroup = React.createFactory(React.addons.CSSTransitionGroup);

module.exports = React.createClass({

  displayName: "Field",

  mixins: [require("../../mixins/helper")],

  getInitialState: function getInitialState() {
    return {
      collapsed: this.props.config.fieldIsCollapsed(this.props.field) ? true : false
    };
  },

  onClickLabel: function onClickLabel() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var config = this.props.config;

    if (this.props.plain) {
      return this.props.children;
    }

    var field = this.props.field;

    var index = this.props.index;
    if (!_.isNumber(index)) {
      var key = this.props.field.key;
      index = _.isNumber(key) ? key : undefined;
    }

    var classes = _.extend({}, this.props.classes);

    var errors = config.fieldErrors(field);

    errors.forEach(function (error) {
      classes["validation-error-" + error.type] = true;
    });

    if (config.fieldIsRequired(field)) {
      classes.required = true;
    } else {
      classes.optional = true;
    }

    return R.div({ className: cx(classes), style: { display: field.hidden ? "none" : "" } }, config.createElement("label", {
      config: config, field: field,
      index: index, onClick: config.fieldIsCollapsible(field) ? this.onClickLabel : null
    }), CSSTransitionGroup({ transitionName: "reveal" }, this.state.collapsed ? [] : [config.createElement("help", {
      config: config, field: field,
      key: "help"
    }), this.props.children]));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],25:[function(require,module,exports){
(function (global){
// # help component

/*
Just the help text block.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "Help",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var helpText = this.props.config.fieldHelpText(this.props.field);

    return helpText ? R.div({ className: cx(this.props.classes), dangerouslySetInnerHTML: { __html: helpText } }) : R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],26:[function(require,module,exports){
(function (global){
// # button component

/*
  Clickable 'button'
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    ref: React.PropTypes.string
  },

  displayName: "InsertButton",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      "a",
      { ref: this.props.ref, href: "JavaScript" + ":", onClick: this.props.onClick },
      this.props.children
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],27:[function(require,module,exports){
(function (global){
// # label component

/*
Just the label for a field.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "Label",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    var fieldLabel = config.fieldLabel(field);

    var label = null;
    if (typeof this.props.index === "number") {
      label = "" + (this.props.index + 1) + ".";
      if (fieldLabel) {
        label = label + " " + fieldLabel;
      }
    }

    if (fieldLabel || label) {
      var text = label || fieldLabel;
      if (this.props.onClick) {
        text = R.a({ href: "JavaScript" + ":", onClick: this.props.onClick }, text);
      }
      label = R.label({}, text);
    }

    var requiredOrNot;

    if (!config.fieldHasValueChildren(field)) {
      requiredOrNot = R.span({
        className: config.fieldIsRequired(field) ? "required-text" : "not-required-text"
      });
    }

    return R.div({
      className: cx(this.props.classes)
    }, label, " ", requiredOrNot);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],28:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

module.exports = React.createClass({
  displayName: "LoadingChoices",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return React.createElement(
      "div",
      null,
      "Loading choices..."
    );
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],29:[function(require,module,exports){
(function (global){
// # move-item-back component

/*
Button to move an item backwards in list.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "MoveItemBack",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[up]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],30:[function(require,module,exports){
(function (global){
// # move-item-forward component

/*
Button to move an item forward in a list.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "MoveItemForward",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[down]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.span({ className: cx(this.props.classes), onClick: this.props.onClick }, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],31:[function(require,module,exports){
(function (global){
// # object-control component

/*
Render the item type choices and the add button.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ObjectControl",

  mixins: [require("../../mixins/helper")],

  getInitialState: function getInitialState() {
    return {
      fieldTemplateIndex: 0
    };
  },

  onSelect: function onSelect(index) {
    this.setState({
      fieldTemplateIndex: index
    });
  },

  onAppend: function onAppend() {
    this.props.onAppend(this.state.fieldTemplateIndex);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;
    var fieldTemplates = config.fieldChildFieldTemplates(field);

    var typeChoices = null;

    if (fieldTemplates.length > 0) {
      typeChoices = config.createElement("field-template-choices", {
        field: field,
        fieldTemplateIndex: this.state.fieldTemplateIndex, onSelect: this.onSelect
      });
    }

    return R.div({ className: cx(this.props.classes) }, typeChoices, " ", config.createElement("add-item", { onClick: this.onAppend }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],32:[function(require,module,exports){
(function (global){
// # object-item-control component

/*
Render the remove buttons for an object item.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ObjectItemControl",

  mixins: [require("../../mixins/helper")],

  onRemove: function onRemove() {
    this.props.onRemove(this.props.itemKey);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createElement("remove-item", { field: field, onClick: this.onRemove }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],33:[function(require,module,exports){
(function (global){
// # object-item-key component

/*
Render an object item key editor.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ObjectItemKey",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    this.props.onChange(event.target.value);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    return R.input({ className: cx(this.props.classes), type: "text", value: this.props.displayKey, onChange: this.onChange });
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],34:[function(require,module,exports){
(function (global){
// # object-item-value component

/*
Render the value of an object item.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ObjectItemValue",

  mixins: [require("../../mixins/helper")],

  onChangeField: function onChangeField(newValue, info) {
    this.props.onChange(this.props.itemKey, newValue, info);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createFieldElement({ field: field, onChange: this.onChangeField, plain: true }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],35:[function(require,module,exports){
(function (global){
// # object-item component

/*
Render an object item.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "ObjectItem",

  mixins: [require("../../mixins/helper")],

  onChangeKey: function onChangeKey(newKey) {
    this.props.onMove(this.props.itemKey, newKey);
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var field = this.props.field;

    return R.div({ className: cx(this.props.classes) }, config.createElement("object-item-key", { field: field, onChange: this.onChangeKey, displayKey: this.props.displayKey, itemKey: this.props.itemKey }), config.createElement("object-item-value", { field: field, onChange: this.props.onChange, itemKey: this.props.itemKey }), config.createElement("object-item-control", { field: field, onRemove: this.props.onRemove, itemKey: this.props.itemKey }));
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],36:[function(require,module,exports){
(function (global){
// # pretty-select-value component

/*
   Render a select dropdown for a list of choices. Choices values can be of any
   type. Does not use native select dropdown. Choices can optionally include
   'sample' property displayed grayed out.
 */

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "SelectValue",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(":"));
    if (choiceType === "choice") {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(":") + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  getDefaultProps: function getDefaultProps() {
    return {
      choices: []
    };
  },

  getInitialState: function getInitialState() {
    var defaultValue = this.props.field.value !== undefined ? this.props.field.value : "";

    return {
      isChoicesOpen: this.props.isChoicesOpen,
      value: defaultValue,
      isEnteringCustomValue: false
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var choices = this.props.config.normalizePrettyChoices(this.props.choices);
    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === "///loading///") {
      choicesOrLoading = config.createElement("loading-choices", {});
    } else {
      var choicesElem = this.props.config.createElement("choices", {
        ref: "choices",
        choices: choices,
        open: this.state.isChoicesOpen,
        ignoreCloseNodes: this.getCloseIgnoreNodes,
        onSelect: this.onSelectChoice,
        onClose: this.onCloseChoices,
        onChoiceAction: this.onChoiceAction
      });

      var inputElem = this.getInputElement();

      choicesOrLoading = React.createElement(
        "div",
        { className: cx(this.props.classes),
          onChange: this.onChange,
          onFocus: this.onFocusAction,
          onBlur: this.onBlurAction },
        React.createElement(
          "div",
          { ref: "toggle", onClick: this.onToggleChoices },
          inputElem,
          React.createElement("span", { className: "select-arrow" })
        ),
        choicesElem
      );
    }

    return choicesOrLoading;
  },

  getInputElement: function getInputElement() {
    if (this.state.isEnteringCustomValue) {
      return React.createElement("input", { ref: "customInput", type: "text", value: this.props.field.value,
        onChange: this.onInputChange, onFocus: this.onFocusAction, onBlur: this.onBlurAction });
    }

    return React.createElement("input", { type: "text", value: this.getDisplayValue(), readOnly: true });
  },

  getCloseIgnoreNodes: function getCloseIgnoreNodes() {
    return this.refs.toggle.getDOMNode();
  },

  onToggleChoices: function onToggleChoices() {
    this.setChoicesOpen(!this.state.isChoicesOpen);
  },

  setChoicesOpen: function setChoicesOpen(isOpen) {
    var action = isOpen ? "open-replacements" : "close-replacements";
    this.onStartAction(action);
    this.setState({ isChoicesOpen: isOpen });
  },

  onSelectChoice: function onSelectChoice(value) {
    this.setState({
      isChoicesOpen: false,
      value: value
    });
    this.props.onChange(value);
  },

  onCloseChoices: function onCloseChoices() {
    if (this.state.isChoicesOpen) {
      this.setChoicesOpen(false);
    }
  },

  getDisplayValue: function getDisplayValue() {
    var currentValue = this.state.value;
    var currentChoice = _.find(this.props.choices, function (choice) {
      return choice.value === currentValue;
    });

    if (currentChoice) {
      return currentChoice.label;
    }
    if (currentValue) {
      //  custom value
      return currentValue;
    }
    return "";
  },

  onChoiceAction: function onChoiceAction(choice) {
    if (choice.action === "enter-custom-value") {
      this.setState({
        isEnteringCustomValue: true,
        isChoicesOpen: false,
        value: choice.value
      }, function () {
        this.refs.customInput.getDOMNode().focus();
      });
    } else {
      this.setState({
        isChoicesOpen: false,
        value: choice.value
      });
    }

    this.onStartAction(choice.action, choice);
  },

  onAction: function onAction(params) {
    if (params.action === "enter-custom-value") {
      this.setState({ isEnteringCustomValue: true }, function () {
        this.refs.customInput.getDOMNode().focus();
      });
    }
    this.onBubbleAction(params);
  },

  onInputChange: function onInputChange(event) {
    this.props.onChange(event.target.value);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],37:[function(require,module,exports){
(function (global){
// # remove-item component

/*
Remove an item.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "RemoveItem",

  mixins: [require("../../mixins/helper")],

  getDefaultProps: function getDefaultProps() {
    return {
      label: "[remove]"
    };
  },

  render: function render() {
    return this.renderWithConfig();
  },

  onMouseOverRemove: function onMouseOverRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(true);
    }
  },

  onMouseOutRemove: function onMouseOutRemove() {
    if (this.props.onMaybeRemove) {
      this.props.onMaybeRemove(false);
    }
  },

  renderDefault: function renderDefault() {
    return R.span({
      className: cx(this.props.classes), onClick: this.props.onClick,
      onMouseOver: this.onMouseOverRemove, onMouseOut: this.onMouseOutRemove
    }, this.props.label);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],38:[function(require,module,exports){
(function (global){
// # help component

/*
Just the help text block.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "Sample",

  mixins: [require("../../mixins/helper")],

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {

    var choice = this.props.choice;

    return choice.sample ? R.div({ className: cx(this.props.className) }, choice.sample) : R.span(null);
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],39:[function(require,module,exports){
(function (global){
// # select-value component

/*
Render a select dropdown for a list of choices. Choices values can be of any
type.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var cx = React.addons.classSet;

module.exports = React.createClass({

  displayName: "SelectValue",

  mixins: [require("../../mixins/helper")],

  onChange: function onChange(event) {
    var choiceValue = event.target.value;
    var choiceType = choiceValue.substring(0, choiceValue.indexOf(":"));
    if (choiceType === "choice") {
      var choiceIndex = choiceValue.substring(choiceValue.indexOf(":") + 1);
      choiceIndex = parseInt(choiceIndex);
      this.props.onChange(this.props.choices[choiceIndex].value);
    }
  },

  render: function render() {
    return this.renderWithConfig();
  },

  renderDefault: function renderDefault() {
    var config = this.props.config;
    var choices = this.props.choices || [];

    var choicesOrLoading;

    if (choices.length === 1 && choices[0].value === "///loading///") {
      choicesOrLoading = config.createElement("loading-choices", {});
    } else {
      var value = this.props.field.value !== undefined ? this.props.field.value : "";

      choices = choices.map(function (choice, i) {
        return {
          choiceValue: "choice:" + i,
          value: choice.value,
          label: choice.label
        };
      });

      var valueChoice = _.find(choices, function (choice) {
        return choice.value === value;
      });

      if (valueChoice === undefined) {

        var label = value;
        if (!_.isString(value)) {
          label = JSON.stringify(value);
        }
        valueChoice = {
          choiceValue: "value:",
          value: value,
          label: label
        };
        choices = [valueChoice].concat(choices);
      }

      choicesOrLoading = R.select({
        className: cx(this.props.classes),
        onChange: this.onChange,
        value: valueChoice.choiceValue,
        onFocus: this.onFocusAction,
        onBlur: this.onBlurAction
      }, choices.map(function (choice, i) {
        return R.option({
          key: i,
          value: choice.choiceValue
        }, choice.label);
      }));
    }

    return choicesOrLoading;
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../mixins/helper":45}],40:[function(require,module,exports){
(function (global){
"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// Constant for first unused special use character.
// See IMPLEMENTATION NOTE in pretty-text2.js.
var FIRST_SPECIAL_CHAR = 57344;

// regexp used to grep out tags like {{firstName}}
var TAGS_REGEXP = /\{\{(.+?)\}\}/g;

// Zapier specific stuff. Make a plugin for this later.
function removeIdPrefix(key) {
  return String(key).replace(/^[0-9]+__/, "");
}

function buildChoicesMap(replaceChoices) {
  var choices = {};
  replaceChoices.forEach(function (choice) {
    var key = removeIdPrefix(choice.value);
    choices[key] = choice.label;
  });
  return choices;
}

/*
   Creates helper to translate between tags like {{firstName}} and
   an encoded representation suitable for use in CodeMirror.

   See IMPLEMENTATION NOTE in pretty-text2.js.
 */
function TagTranslator(replaceChoices, humanize) {
  var nextCharCode = FIRST_SPECIAL_CHAR;

  // Map of tag to label 'firstName' --> 'First Name'
  var choices = {};

  // To help translate to and from the CM representation with the special
  // characters, build two maps:
  //   - charToTagMap: special char to tag - i.e. { '\ue000': 'firstName' }
  //   - tagToCharMap: tag to special char, i.e. { firstName: '\ue000' }
  var charToTagMap = {};
  var tagToCharMap = {};

  function addChoices(choicesArray) {
    choices = buildChoicesMap(choicesArray);

    Object.keys(choices).sort().forEach(function (tag) {
      if (tagToCharMap[tag]) {
        return; // we already have this tag mapped
      }

      var char = String.fromCharCode(nextCharCode++);
      charToTagMap[char] = tag;
      tagToCharMap[tag] = char;
    });
  }

  addChoices(replaceChoices);

  return {
    specialCharsRegexp: /[\ue000-\uefff]/g,

    addChoices: addChoices,

    /*
       Convert tag to encoded character. For example
       'firstName' becomes '\ue000'.
     */
    encodeTag: function encodeTag(tag) {
      tag = removeIdPrefix(tag);
      if (!tagToCharMap[tag]) {
        var char = String.fromCharCode(nextCharCode++);
        tagToCharMap[tag] = char;
        charToTagMap[char] = tag;
      }
      return tagToCharMap[tag];
    },

    /*
       Convert text value to encoded value for CodeMirror. For example
       'hello {{firstName}}' becomes 'hello \ue000'
     */
    encodeValue: function encodeValue(value) {
      return String(value).replace(TAGS_REGEXP, (function (m, tag) {
        tag = removeIdPrefix(tag);
        return this.encodeTag(tag);
      }).bind(this));
    },

    /*
       Convert encoded text used in CM to tagged text. For example
       'hello \ue000' becomes 'hello {{firstName}}'
     */
    decodeValue: function decodeValue(encodedValue) {
      return String(encodedValue).replace(this.specialCharsRegexp, function (c) {
        var tag = charToTagMap[c];
        return "{{" + tag + "}}";
      });
    },

    /*
       Convert encoded character to label. For example
       '\ue000' becomes 'Last Name'.
     */
    decodeChar: function decodeChar(char) {
      var tag = charToTagMap[char];
      return this.getLabel(tag);
    },

    /*
       Convert tagged value to HTML. For example
       'hello {{firstName}}' becomes 'hello <span class="tag">First Name</span>'
     */
    toHtml: function toHtml(value) {
      return String(value).replace(TAGS_REGEXP, (function (m, mustache) {
        var tag = mustache.replace("{{", "").replace("}}", "");
        tag = removeIdPrefix(tag);
        var label = this.getLabel(tag);
        return "<span class=\"pretty-part\">" + label + "</span>";
      }).bind(this));
    },

    /*
       Get label for tag.  For example 'firstName' becomes 'First Name'.
       Returns a humanized version of the tag if we don't have a label for the tag.
     */
    getLabel: function getLabel(tag) {
      tag = removeIdPrefix(tag);
      var label = choices[tag];
      if (!label) {
        // If tag not found and we have a humanize function, humanize the tag.
        // Otherwise just return the tag.
        label = humanize && humanize(tag) || tag;
      }
      return label;
    }
  };
}

module.exports = TagTranslator;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],41:[function(require,module,exports){
(function (global){
// # default-config

/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var R = React.DOM;
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require("./utils");

module.exports = function (config) {

  var delegateTo = utils.delegator(config);

  return {

    // Field element factories. Create field elements.

    createElement_Fields: React.createFactory(require("./components/fields/fields")),

    createElement_String: React.createFactory(require("./components/fields/string")),

    createElement_SingleLineString: React.createFactory(require("./components/fields/single-line-string")),

    createElement_Select: React.createFactory(require("./components/fields/select")),

    createElement_PrettySelect: React.createFactory(require("./components/fields/pretty-select")),

    createElement_Boolean: React.createFactory(require("./components/fields/boolean")),

    createElement_PrettyBoolean: React.createFactory(require("./components/fields/pretty-boolean")),

    createElement_CheckboxBoolean: React.createFactory(require("./components/fields/checkbox-boolean")),

    // createElement_PrettyText: React.createFactory(require('./components/fields/pretty-text')),

    createElement_PrettyText: React.createFactory(require("./components/fields/pretty-text2")),

    createElement_Array: React.createFactory(require("./components/fields/array")),

    createElement_CheckboxArray: React.createFactory(require("./components/fields/checkbox-array")),

    createElement_Object: React.createFactory(require("./components/fields/object")),

    createElement_Json: React.createFactory(require("./components/fields/json")),

    createElement_UnknownField: React.createFactory(require("./components/fields/unknown")),

    createElement_Copy: React.createFactory(require("./components/fields/copy")),

    // Other element factories. Create helper elements used by field components.

    createElement_Field: React.createFactory(require("./components/helpers/field")),

    createElement_Label: React.createFactory(require("./components/helpers/label")),

    createElement_Help: React.createFactory(require("./components/helpers/help")),

    createElement_Choices: React.createFactory(require("./components/helpers/choices")),

    createElement_LoadingChoices: React.createFactory(require("./components/helpers/loading-choices")),

    createElement_ArrayControl: React.createFactory(require("./components/helpers/array-control")),

    createElement_ArrayItemControl: React.createFactory(require("./components/helpers/array-item-control")),

    createElement_ArrayItemValue: React.createFactory(require("./components/helpers/array-item-value")),

    createElement_ArrayItem: React.createFactory(require("./components/helpers/array-item")),

    createElement_FieldTemplateChoices: React.createFactory(require("./components/helpers/field-template-choices")),

    createElement_AddItem: React.createFactory(require("./components/helpers/add-item")),

    createElement_RemoveItem: React.createFactory(require("./components/helpers/remove-item")),

    createElement_MoveItemForward: React.createFactory(require("./components/helpers/move-item-forward")),

    createElement_MoveItemBack: React.createFactory(require("./components/helpers/move-item-back")),

    createElement_ObjectControl: React.createFactory(require("./components/helpers/object-control")),

    createElement_ObjectItemControl: React.createFactory(require("./components/helpers/object-item-control")),

    createElement_ObjectItemValue: React.createFactory(require("./components/helpers/object-item-value")),

    createElement_ObjectItemKey: React.createFactory(require("./components/helpers/object-item-key")),

    createElement_ObjectItem: React.createFactory(require("./components/helpers/object-item")),

    createElement_SelectValue: React.createFactory(require("./components/helpers/select-value")),

    createElement_PrettySelectValue: React.createFactory(require("./components/helpers/pretty-select-value")),

    createElement_Sample: React.createFactory(require("./components/helpers/sample")),

    createElement_InsertButton: React.createFactory(require("./components/helpers/insert-button")),

    // Field default value factories. Give a default value for a specific type.

    createDefaultValue_String: function createDefaultValue_String() {
      return "";
    },

    createDefaultValue_Object: function createDefaultValue_Object() {
      return {};
    },

    createDefaultValue_Array: function createDefaultValue_Array() {
      return [];
    },

    createDefaultValue_Boolean: function createDefaultValue_Boolean() {
      return false;
    },

    createDefaultValue_Fields: delegateTo("createDefaultValue_Object"),

    createDefaultValue_SingleLineString: delegateTo("createDefaultValue_String"),

    createDefaultValue_Select: delegateTo("createDefaultValue_String"),

    createDefaultValue_Json: delegateTo("createDefaultValue_Object"),

    createDefaultValue_CheckboxArray: delegateTo("createDefaultValue_Array"),

    createDefaultValue_CheckboxBoolean: delegateTo("createDefaultValue_Boolean"),

    // Field value coercers. Coerce a value into a value appropriate for a specific type.

    coerceValue_String: function coerceValue_String(fieldTemplate, value) {
      if (_.isString(value)) {
        return value;
      }
      if (_.isUndefined(value) || value === null) {
        return "";
      }
      return JSON.stringify(value);
    },

    coerceValue_Object: function coerceValue_Object(fieldTemplate, value) {
      if (!_.isObject(value)) {
        return {};
      }
      return value;
    },

    coerceValue_Array: function coerceValue_Array(fieldTemplate, value) {
      if (!_.isArray(value)) {
        return [value];
      }
      return value;
    },

    coerceValue_Boolean: function coerceValue_Boolean(fieldTemplate, value) {
      return config.coerceValueToBoolean(value);
    },

    coerceValue_Fields: delegateTo("coerceValue_Object"),

    coerceValue_SingleLineString: delegateTo("coerceValue_String"),

    coerceValue_Select: delegateTo("coerceValue_String"),

    coerceValue_Json: delegateTo("coerceValue_Object"),

    coerceValue_CheckboxArray: delegateTo("coerceValue_Array"),

    coerceValue_CheckboxBoolean: delegateTo("coerceValue_Boolean"),

    // Field child fields factories, so some types can have dynamic children.

    createChildFields_Array: function createChildFields_Array(field) {

      return field.value.map(function (arrayItem, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, arrayItem);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: i, fieldIndex: i, value: arrayItem
        });

        return childField;
      });
    },

    createChildFields_Object: function createChildFields_Object(field) {

      return Object.keys(field.value).map(function (key, i) {
        var childFieldTemplate = config.childFieldTemplateForValue(field, field.value[key]);

        var childField = config.createChildField(field, {
          fieldTemplate: childFieldTemplate, key: key, fieldIndex: i, value: field.value[key]
        });

        return childField;
      });
    },

    // Check if there is a factory for the name.
    hasElementFactory: function hasElementFactory(name) {

      return config["createElement_" + name] ? true : false;
    },

    // Create an element given a name, props, and children.
    createElement: function createElement(name, props, children) {

      if (!props.config) {
        props = _.extend({}, props, { config: config });
      }

      name = config.elementName(name);

      if (config["createElement_" + name]) {
        return config["createElement_" + name](props, children);
      }

      if (name !== "Unknown") {
        if (config.hasElementFactory("Unknown")) {
          return config.createElement("Unknown", props, children);
        }
      }

      throw new Error("Factory not found for: " + name);
    },

    // Create a field element given some props. Use context to determine name.
    createFieldElement: function createFieldElement(props) {

      var name = config.fieldTypeName(props.field);

      if (config.hasElementFactory(name)) {
        return config.createElement(name, props);
      }

      return config.createElement("UnknownField", props);
    },

    // Render the root formatic component
    renderFormaticComponent: function renderFormaticComponent(component) {

      var props = component.props;

      var field = config.createRootField(props);

      return R.div({ className: "formatic" }, config.createFieldElement({ field: field, onChange: component.onChange, onAction: component.onAction }));
    },

    // Render any component.
    renderComponent: function renderComponent(component) {

      var name = component.constructor.displayName;

      if (config["renderComponent_" + name]) {
        return config["renderComponent_" + name](component);
      }

      return component.renderDefault();
    },

    // Render field components.
    renderFieldComponent: function renderFieldComponent(component) {

      return config.renderComponent(component);
    },

    // Normalize an element name.
    elementName: function elementName(name) {
      return utils.dashToPascal(name);
    },

    // Type aliases.

    alias_Dict: "Object",

    alias_Bool: "Boolean",

    alias_PrettyTextarea: "PrettyText",

    alias_SingleLineString: function alias_SingleLineString(fieldTemplate) {
      if (fieldTemplate.replaceChoices) {
        return "PrettyText";
      } else if (fieldTemplate.choices) {
        return "Select";
      }
      return "SingleLineString";
    },

    alias_String: function alias_String(fieldTemplate) {

      if (fieldTemplate.replaceChoices) {
        return "PrettyText";
      } else if (fieldTemplate.choices) {
        return "Select";
      } else if (config.fieldTemplateIsSingleLine(fieldTemplate)) {
        return "SingleLineString";
      }
      return "String";
    },

    alias_Text: delegateTo("alias_String"),

    alias_Unicode: delegateTo("alias_SingleLineString"),

    alias_Str: delegateTo("alias_SingleLineString"),

    alias_List: "Array",

    alias_CheckboxList: "CheckboxArray",

    alias_Fieldset: "Fields",

    alias_Checkbox: "CheckboxBoolean",

    // Field factory

    // Given a field, expand all child fields recursively to get the default
    // values of all fields.
    inflateFieldValue: function inflateFieldValue(field, fieldHandler) {

      if (fieldHandler) {
        var stop = fieldHandler(field);
        if (stop === false) {
          return undefined;
        }
      }

      if (config.fieldHasValueChildren(field)) {
        var value = _.clone(field.value);
        var childFields = config.createChildFields(field);
        childFields.forEach(function (childField) {
          if (config.isKey(childField.key)) {
            value[childField.key] = config.inflateFieldValue(childField, fieldHandler);
          }
        });
        return value;
      } else {
        return field.value;
      }
    },

    // Initialize the root field.
    initRootField: function initRootField() {},

    // Initialize every field.
    initField: function initField() {},

    // If an array of field templates are passed in, this method is used to
    // wrap the fields inside a single root field template.
    wrapFieldTemplates: function wrapFieldTemplates(fieldTemplates) {
      return {
        type: "fields",
        plain: true,
        fields: fieldTemplates
      };
    },

    // Given the props that are passed in, create the root field.
    createRootField: function createRootField(props) {

      var fieldTemplate = props.fieldTemplate || props.fieldTemplates || props.field || props.fields;
      var value = props.value;

      if (!fieldTemplate) {
        fieldTemplate = config.createFieldTemplateFromValue(value);
      }

      if (_.isArray(fieldTemplate)) {
        fieldTemplate = config.wrapFieldTemplates(fieldTemplate);
      }

      var field = _.extend({}, fieldTemplate, { rawFieldTemplate: fieldTemplate });
      if (config.hasValue(fieldTemplate, value)) {
        field.value = config.coerceValue(fieldTemplate, value);
      } else {
        field.value = config.createDefaultValue(fieldTemplate);
      }

      config.initRootField(field, props);
      config.initField(field);

      if (value === null || config.isEmptyObject(value) || _.isUndefined(value)) {
        field.value = config.inflateFieldValue(field);
      }

      return field;
    },

    // Given the props that are passed in, create the value that will be displayed
    // by all the components.
    createRootValue: function createRootValue(props, fieldHandler) {

      var field = config.createRootField(props);

      return config.inflateFieldValue(field, fieldHandler);
    },

    validateRootValue: function validateRootValue(props) {

      var errors = [];

      config.createRootValue(props, function (field) {
        var fieldErrors = config.fieldErrors(field);
        if (fieldErrors.length > 0) {
          errors.push({
            path: config.fieldValuePath(field),
            errors: fieldErrors
          });
        }
      });

      return errors;
    },

    isValidRootValue: function isValidRootValue(props) {

      var isValid = true;

      config.createRootValue(props, function (field) {
        if (config.fieldErrors(field).length > 0) {
          isValid = false;
          return false;
        }
      });

      return isValid;
    },

    validateField: function validateField(field, errors) {

      if (field.value === undefined || field.value === "") {
        if (config.fieldIsRequired(field)) {
          errors.push({
            type: "required"
          });
        }
      }
    },

    // Create dynamic child fields for a field.
    createChildFields: function createChildFields(field) {

      var typeName = config.fieldTypeName(field);

      if (config["createChildFields_" + typeName]) {
        return config["createChildFields_" + typeName](field);
      }

      return config.fieldChildFieldTemplates(field).map(function (childField, i) {
        return config.createChildField(field, {
          fieldTemplate: childField, key: childField.key, fieldIndex: i, value: field.value[childField.key]
        });
      });
    },

    // Create a single child field for a parent field.
    createChildField: function createChildField(parentField, options) {

      var childValue = options.value;

      var childField = _.extend({}, options.fieldTemplate, {
        key: options.key, parent: parentField, fieldIndex: options.fieldIndex,
        rawFieldTemplate: options.fieldTemplate
      });

      if (config.hasValue(options.fieldTemplate, childValue)) {
        childField.value = config.coerceValue(options.fieldTemplate, childValue);
      } else {
        childField.value = config.createDefaultValue(options.fieldTemplate);
      }

      config.initField(childField);

      return childField;
    },

    // Create a temporary field and extract its value.
    createNewChildFieldValue: function createNewChildFieldValue(parentField, itemFieldIndex) {

      var childFieldTemplate = config.fieldItemFieldTemplates(parentField)[itemFieldIndex];

      var newValue = config.fieldTemplateValue(childFieldTemplate);

      // Just a placeholder key. Should not be important.
      var key = "__unknown_key__";

      if (_.isArray(parentField.value)) {
        // Just a placeholder position for an array.
        key = parentField.value.length;
      }

      // Just a placeholder field index. Should not be important.
      var fieldIndex = 0;
      if (_.isObject(parentField.value)) {
        fieldIndex = Object.keys(parentField.value).length;
      }

      var childField = config.createChildField(parentField, {
        fieldTemplate: childFieldTemplate, key: key, fieldIndex: fieldIndex, value: newValue
      });

      newValue = config.inflateFieldValue(childField);

      return newValue;
    },

    // Given a value, create a field template for that value.
    createFieldTemplateFromValue: function createFieldTemplateFromValue(value) {

      var field = {
        type: "json"
      };
      if (_.isString(value)) {
        field = {
          type: "string"
        };
      } else if (_.isNumber(value)) {
        field = {
          type: "number"
        };
      } else if (_.isBoolean(value)) {
        field = {
          type: "boolean"
        };
      } else if (_.isArray(value)) {
        var arrayItemFields = value.map(function (childValue, i) {
          var childField = config.createFieldTemplateFromValue(childValue);
          childField.key = i;
          return childField;
        });
        field = {
          type: "array",
          fields: arrayItemFields
        };
      } else if (_.isObject(value)) {
        var objectItemFields = Object.keys(value).map(function (key) {
          var childField = config.createFieldTemplateFromValue(value[key]);
          childField.key = key;
          childField.label = config.humanize(key);
          return childField;
        });
        field = {
          type: "object",
          fields: objectItemFields
        };
      } else if (_.isNull(value)) {
        field = {
          type: "json"
        };
      }
      return field;
    },

    // Default value factory

    createDefaultValue: function createDefaultValue(fieldTemplate) {

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      if (!_.isUndefined(defaultValue)) {
        return utils.deepCopy(defaultValue);
      }

      var typeName = config.fieldTypeName(fieldTemplate);

      if (config["createDefaultValue_" + typeName]) {
        return config["createDefaultValue_" + typeName](fieldTemplate);
      }

      return "";
    },

    // Field helpers

    // Determine if a value "exists".
    hasValue: function hasValue(fieldTemplate, value) {
      return value !== null && !_.isUndefined(value);
    },

    // Coerce a value to value appropriate for a field.
    coerceValue: function coerceValue(field, value) {

      var typeName = config.fieldTypeName(field);

      if (config["coerceValue_" + typeName]) {
        return config["coerceValue_" + typeName](field, value);
      }

      return value;
    },

    // Given a field and a child value, find the appropriate field template for
    // that child value.
    childFieldTemplateForValue: function childFieldTemplateForValue(field, childValue) {

      var fieldTemplate;

      var fieldTemplates = config.fieldItemFieldTemplates(field);

      fieldTemplate = _.find(fieldTemplates, function (itemFieldTemplate) {
        return config.matchesFieldTemplateToValue(itemFieldTemplate, childValue);
      });

      if (fieldTemplate) {
        return fieldTemplate;
      } else {
        return config.createFieldTemplateFromValue(childValue);
      }
    },

    // Determine if a value is a match for a field template.
    matchesFieldTemplateToValue: function matchesFieldTemplateToValue(fieldTemplate, value) {
      var match = fieldTemplate.match;
      if (!match) {
        return true;
      }
      return _.every(_.keys(match), function (key) {
        return _.isEqual(match[key], value[key]);
      });
    },

    // Field template helpers

    // Normalized (PascalCase) type name for a field.
    fieldTemplateTypeName: function fieldTemplateTypeName(fieldTemplate) {

      var typeName = utils.dashToPascal(fieldTemplate.type || "undefined");

      var alias = config["alias_" + typeName];

      if (alias) {
        if (_.isFunction(alias)) {
          return alias.call(config, fieldTemplate);
        } else {
          return alias;
        }
      }

      if (fieldTemplate.list) {
        typeName = "Array";
      }

      return typeName;
    },

    // Default value for a field template.
    fieldTemplateDefaultValue: function fieldTemplateDefaultValue(fieldTemplate) {

      return fieldTemplate["default"];
    },

    // Value for a field template. Used to determine the value of a new child
    // field.
    fieldTemplateValue: function fieldTemplateValue(fieldTemplate) {

      // This logic might be brittle.

      var defaultValue = config.fieldTemplateDefaultValue(fieldTemplate);

      var match = config.fieldTemplateMatch(fieldTemplate);

      var value;

      if (_.isUndefined(defaultValue) && !_.isUndefined(match)) {
        return utils.deepCopy(match);
      } else {
        return config.createDefaultValue(fieldTemplate);
      }

      return value;
    },

    // Match rule for a field template.
    fieldTemplateMatch: function fieldTemplateMatch(fieldTemplate) {
      return fieldTemplate.match;
    },

    // Determine if a field template has a single-line value.
    fieldTemplateIsSingleLine: function fieldTemplateIsSingleLine(fieldTemplate) {
      return fieldTemplate.isSingleLine || fieldTemplate.is_single_line || fieldTemplate.type === "single-line-string" || fieldTemplate.type === "SingleLineString";
    },

    // Field helpers

    // Get an array of keys representing the path to a value.
    fieldValuePath: function fieldValuePath(field) {

      var parentPath = [];

      if (field.parent) {
        parentPath = config.fieldValuePath(field.parent);
      }

      return parentPath.concat(field.key).filter(function (key) {
        return !_.isUndefined(key) && key !== "";
      });
    },

    // Clone a field with a different value.
    fieldWithValue: function fieldWithValue(field, value) {
      return _.extend({}, field, { value: value });
    },

    fieldTypeName: delegateTo("fieldTemplateTypeName"),

    // Get the choices for a dropdown field.
    fieldChoices: function fieldChoices(field) {

      return config.normalizeChoices(field.choices);
    },

    // Get the choices for a pretty dropdown field.
    fieldPrettyChoices: function fieldPrettyChoices(field) {

      return config.normalizePrettyChoices(field.choices);
    },

    // Get a set of boolean choices for a field.
    fieldBooleanChoices: function fieldBooleanChoices(field) {

      var choices = config.fieldChoices(field);

      if (choices.length === 0) {
        return [{
          label: "yes",
          value: true
        }, {
          label: "no",
          value: false
        }];
      }

      return choices.map(function (choice) {
        if (_.isBoolean(choice.value)) {
          return choice;
        }
        return _.extend({}, choice, {
          value: config.coerceValueToBoolean(choice.value)
        });
      });
    },

    // Get a set of replacement choices for a field.
    fieldReplaceChoices: function fieldReplaceChoices(field) {

      return config.normalizeChoices(field.replaceChoices);
    },

    // Get a label for a field.
    fieldLabel: function fieldLabel(field) {
      return field.label;
    },

    // Get the help text for a field.
    fieldHelpText: function fieldHelpText(field) {
      return field.help_text_html || field.help_text || field.helpText || field.helpTextHtml;
    },

    // Get whether or not a field is required.
    fieldIsRequired: function fieldIsRequired(field) {
      return field.required ? true : false;
    },

    // Determine if value for this field is not a leaf value.
    fieldHasValueChildren: function fieldHasValueChildren(field) {

      var defaultValue = config.createDefaultValue(field);

      if (_.isObject(defaultValue) || _.isArray(defaultValue)) {
        return true;
      }

      return false;
    },

    // Get the child field templates for this field.
    fieldChildFieldTemplates: function fieldChildFieldTemplates(field) {
      return field.fields || [];
    },

    // Get the field templates for each item of this field. (For dynamic children,
    // like arrays.)
    fieldItemFieldTemplates: function fieldItemFieldTemplates(field) {
      if (!field.itemFields) {
        return [{ type: "text" }];
      }
      if (!_.isArray(field.itemFields)) {
        return [field.itemFields];
      }
      return field.itemFields;
    },

    fieldIsSingleLine: delegateTo("fieldTemplateIsSingleLine"),

    // Get whether or not a field is collapsed.
    fieldIsCollapsed: function fieldIsCollapsed(field) {
      return field.collapsed ? true : false;
    },

    // Get wheter or not a field can be collapsed.
    fieldIsCollapsible: function fieldIsCollapsible(field) {
      return field.collapsible || !_.isUndefined(field.collapsed);
    },

    // Get the number of rows for a field.
    fieldRows: function fieldRows(field) {
      return field.rows;
    },

    fieldErrors: function fieldErrors(field) {

      var errors = [];

      if (config.isKey(field.key)) {
        config.validateField(field, errors);
      }

      return errors;
    },

    fieldMatch: delegateTo("fieldTemplateMatch"),

    // Other helpers

    // Convert a key to a nice human-readable version.
    humanize: function humanize(property) {
      property = property.replace(/\{\{/g, "");
      property = property.replace(/\}\}/g, "");
      return property.replace(/_/g, " ").replace(/(\w+)/g, function (match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
    },

    // Normalize some choices for a drop-down.
    normalizeChoices: function normalizeChoices(choices) {

      if (!choices) {
        return [];
      }

      // Convert comma separated string to array of strings.
      if (_.isString(choices)) {
        choices = choices.split(",");
      }

      // Convert object to array of objects with `value` and `label` properties.
      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key]
          };
        });
      }

      // Copy the array of choices so we can manipulate them.
      choices = choices.slice(0);

      // Array of choice arrays should be flattened.
      choices = _.flatten(choices);

      choices.forEach(function (choice, i) {
        // Convert any string choices to objects with `value` and `label`
        // properties.
        if (_.isString(choice)) {
          choices[i] = {
            value: choice,
            label: config.humanize(choice)
          };
        }
        if (!choices[i].label) {
          choices[i].label = config.humanize(choices[i].value);
        }
      });

      return choices;
    },

    // Normalize choices for a pretty drop down, with 'sample' values
    normalizePrettyChoices: function normalizePrettyChoices(choices) {
      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key],
            sample: key
          };
        });
      }

      return config.normalizeChoices(choices);
    },

    // Coerce a value to a boolean
    coerceValueToBoolean: function coerceValueToBoolean(value) {
      if (!_.isString(value)) {
        // Just use the default truthiness.
        return value ? true : false;
      }
      value = value.toLowerCase();
      if (value === "" || value === "no" || value === "off" || value === "false") {
        return false;
      }
      return true;
    },

    // Determine if a value is a valid key.
    isKey: function isKey(key) {
      return _.isNumber(key) && key >= 0 || _.isString(key) && key !== "";
    },

    // Fast way to check for empty object.
    isEmptyObject: function isEmptyObject(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    actionChoiceLabel: function actionChoiceLabel(action) {
      return utils.capitalize(action).replace(/[-]/g, " ");
    }
  };
};
/* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* fieldTemplate */ /* field, props */ /* field */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./components/fields/array":2,"./components/fields/boolean":3,"./components/fields/checkbox-array":4,"./components/fields/checkbox-boolean":5,"./components/fields/copy":6,"./components/fields/fields":7,"./components/fields/json":8,"./components/fields/object":9,"./components/fields/pretty-boolean":10,"./components/fields/pretty-select":11,"./components/fields/pretty-text2":12,"./components/fields/select":13,"./components/fields/single-line-string":14,"./components/fields/string":15,"./components/fields/unknown":16,"./components/helpers/add-item":17,"./components/helpers/array-control":18,"./components/helpers/array-item":21,"./components/helpers/array-item-control":19,"./components/helpers/array-item-value":20,"./components/helpers/choices":22,"./components/helpers/field":24,"./components/helpers/field-template-choices":23,"./components/helpers/help":25,"./components/helpers/insert-button":26,"./components/helpers/label":27,"./components/helpers/loading-choices":28,"./components/helpers/move-item-back":29,"./components/helpers/move-item-forward":30,"./components/helpers/object-control":31,"./components/helpers/object-item":35,"./components/helpers/object-item-control":32,"./components/helpers/object-item-key":33,"./components/helpers/object-item-value":34,"./components/helpers/pretty-select-value":36,"./components/helpers/remove-item":37,"./components/helpers/sample":38,"./components/helpers/select-value":39,"./utils":53}],42:[function(require,module,exports){
(function (global){
// # formatic

/*
The root formatic component.

The root formatic component is actually two components. The main component is
a controlled component where you must pass the value in with each render. This
is actually wrapped in another component which allows you to use formatic as
an uncontrolled component where it retains the state of the value. The wrapper
is what is actually exported.
*/

"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = require("./utils");

var defaultConfigPlugin = require("./default-config");

var createConfig = function createConfig() {
  var plugins = [defaultConfigPlugin].concat(_.toArray(arguments));

  return plugins.reduce(function (config, plugin) {
    if (_.isFunction(plugin)) {
      var extensions = plugin(config);
      if (extensions) {
        _.extend(config, extensions);
      }
    } else {
      _.extend(config, plugin);
    }

    return config;
  }, {});
};

var defaultConfig = createConfig();

// The main formatic component that renders the form.
var FormaticControlledClass = React.createClass({

  displayName: "FormaticControlled",

  // Respond to any value changes.
  onChange: function onChange(newValue, info) {
    if (!this.props.onChange) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onChange(newValue, info);
  },

  // Respond to any actions other than value changes. (For example, focus and
  // blur.)
  onAction: function onAction(info) {
    if (!this.props.onAction) {
      return;
    }
    info = _.extend({}, info);
    info.path = this.props.config.fieldValuePath(info.field);
    this.props.onAction(info);
  },

  // Render the root component by delegating to the config.
  render: function render() {

    var config = this.props.config;

    return config.renderFormaticComponent(this);
  }
});

var FormaticControlled = React.createFactory(FormaticControlledClass);

// A wrapper component that is actually exported and can allow formatic to be
// used in an "uncontrolled" manner. (See uncontrolled components in the React
// documentation for an explanation of the difference.)
module.exports = React.createClass({

  // Export some stuff as statics.
  statics: {
    createConfig: createConfig,
    availableMixins: {
      clickOutside: require("./mixins/click-outside.js"),
      field: require("./mixins/field.js"),
      helper: require("./mixins/helper.js"),
      resize: require("./mixins/resize.js"),
      scroll: require("./mixins/scroll.js"),
      undoStack: require("./mixins/undo-stack.js")
    },
    plugins: {
      bootstrap: require("./plugins/bootstrap"),
      meta: require("./plugins/meta"),
      reference: require("./plugins/reference"),
      elementClasses: require("./plugins/element-classes")
    },
    utils: utils
  },

  displayName: "Formatic",

  // If we got a value, treat this component as controlled. Either way, retain
  // the value in the state.
  getInitialState: function getInitialState() {
    return {
      isControlled: !_.isUndefined(this.props.value),
      value: _.isUndefined(this.props.value) ? this.props.defaultValue : this.props.value
    };
  },

  // If this is a controlled component, change our state to reflect the new
  // value. For uncontrolled components, ignore any value changes.
  componentWillReceiveProps: function componentWillReceiveProps(newProps) {
    if (this.state.isControlled) {
      if (!_.isUndefined(newProps.value)) {
        this.setState({
          value: newProps.value
        });
      }
    }
  },

  // If this is an uncontrolled component, set our state to reflect the new
  // value. Either way, call the onChange callback.
  onChange: function onChange(newValue, info) {
    if (!this.state.isControlled) {
      this.setState({
        value: newValue
      });
    }
    if (!this.props.onChange) {
      return;
    }
    this.props.onChange(newValue, info);
  },

  // Any actions should be sent to the generic onAction callback but also split
  // into discreet callbacks per action.
  onAction: function onAction(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
    var action = utils.dashToPascal(info.action);
    if (this.props["on" + action]) {
      this.props["on" + action](info);
    }
  },

  // Render the wrapper component (by just delegating to the main component).
  render: function render() {

    var config = this.props.config || defaultConfig;
    var value = this.state.value;

    if (this.state.isControlled) {
      if (!this.props.onChange) {
        console.log("You should supply an onChange handler if you supply a value.");
      }
    }

    var props = {
      config: config,
      // Allow field templates to be passed in as `field` or `fields`. After this, stop
      // calling them fields.
      fieldTemplate: this.props.field,
      fieldTemplates: this.props.fields,
      value: value,
      onChange: this.onChange,
      onAction: this.onAction
    };

    _.each(this.props, function (propValue, key) {
      if (!(key in props)) {
        props[key] = propValue;
      }
    });

    return FormaticControlled(props);
  }

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./default-config":41,"./mixins/click-outside.js":43,"./mixins/field.js":44,"./mixins/helper.js":45,"./mixins/resize.js":46,"./mixins/scroll.js":47,"./mixins/undo-stack.js":48,"./plugins/bootstrap":49,"./plugins/element-classes":50,"./plugins/meta":51,"./plugins/reference":52,"./utils":53}],43:[function(require,module,exports){
(function (global){
// # click-outside mixin

/*
There's no native React way to detect clicking outside an element. Sometimes
this is useful, so that's what this mixin does. To use it, mix it in and use it
from your component like this:

```js
module.exports = React.createClass({

  mixins: [require('../..mixins/click-outside')],

  onClickOutside: function () {
    console.log('clicked outside!');
  },

  componentDidMount: function () {
    this.setOnClickOutside('myDiv', this.onClickOutside);
  },

  render: function () {
    return React.DOM.div({ref: 'myDiv'},
      'Hello!'
    )
  }
});
```
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var hasAncestor = (function (_hasAncestor) {
  var _hasAncestorWrapper = function hasAncestor(_x, _x2) {
    return _hasAncestor.apply(this, arguments);
  };

  _hasAncestorWrapper.toString = function () {
    return _hasAncestor.toString();
  };

  return _hasAncestorWrapper;
})(function (child, parent) {
  if (child.parentNode === parent) {
    return true;
  }
  if (child.parentNode === null) {
    return false;
  }
  return hasAncestor(child.parentNode, parent);
});

module.exports = {

  isNodeOutside: function isNodeOutside(nodeOut, nodeIn) {
    if (nodeOut === nodeIn) {
      return false;
    }
    if (hasAncestor(nodeOut, nodeIn)) {
      return false;
    }
    return true;
  },

  isNodeInside: function isNodeInside(nodeIn, nodeOut) {
    return !this.isNodeOutside(nodeIn, nodeOut);
  },

  _onClickMousedown: function _onClickMousedown() {
    _.each(this.clickOutsideHandlers, (function (funcs, ref) {
      if (this.refs[ref]) {
        this._mousedownRefs[ref] = true;
      }
    }).bind(this));
  },

  _onClickMouseup: function _onClickMouseup(event) {
    _.each(this.clickOutsideHandlers, (function (funcs, ref) {
      if (this.refs[ref] && this._mousedownRefs[ref]) {
        if (this.isNodeOutside(event.target, this.refs[ref].getDOMNode())) {
          funcs.forEach((function (fn) {
            fn.call(this, event);
          }).bind(this));
        }
      }
      this._mousedownRefs[ref] = false;
    }).bind(this));
  },

  setOnClickOutside: function setOnClickOutside(ref, fn) {
    if (!this.clickOutsideHandlers[ref]) {
      this.clickOutsideHandlers[ref] = [];
    }
    this.clickOutsideHandlers[ref].push(fn);
  },

  componentDidMount: function componentDidMount() {
    this.clickOutsideHandlers = {};
    this._didMouseDown = false;
    document.addEventListener("mousedown", this._onClickMousedown);
    document.addEventListener("mouseup", this._onClickMouseup);
    //document.addEventListener('click', this._onClickDocument);
    this._mousedownRefs = {};
  },

  componentWillUnmount: function componentWillUnmount() {
    this.clickOutsideHandlers = {};
    //document.removeEventListener('click', this._onClickDocument);
    document.removeEventListener("mouseup", this._onClickMouseup);
    document.removeEventListener("mousedown", this._onClickMousedown);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],44:[function(require,module,exports){
(function (global){
// # field mixin

/*
This mixin gets mixed into all field components.
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {

  // Signal a change in value.
  onChangeValue: function onChangeValue(value) {
    this.props.onChange(value, {
      field: this.props.field
    });
  },

  // Bubble up a value.
  onBubbleValue: function onBubbleValue(value, info) {
    this.props.onChange(value, info);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function onStartAction(action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  onFocusAction: function onFocusAction() {
    this.onStartAction("focus");
  },

  onBlurAction: function onBlurAction() {
    this.onStartAction("blur");
  },

  // Bubble up an action.
  onBubbleAction: function onBubbleAction(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function renderWithConfig() {
    return this.props.config.renderFieldComponent(this);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],45:[function(require,module,exports){
(function (global){
// # helper mixin

/*
This gets mixed into all helper components.
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = {

  // Delegate rendering back to config so it can be wrapped.
  renderWithConfig: function renderWithConfig() {
    return this.props.config.renderComponent(this);
  },

  // Start an action bubbling up through parent components.
  onStartAction: function onStartAction(action, props) {
    if (this.props.onAction) {
      var info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  // Bubble up an action.
  onBubbleAction: function onBubbleAction(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  onFocusAction: function onFocusAction() {
    this.onStartAction("focus");
  },

  onBlurAction: function onBlurAction() {
    this.onStartAction("blur");
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],46:[function(require,module,exports){
// # resize mixin

/*
You'd think it would be pretty easy to detect when a DOM element is resized.
And you'd be wrong. There are various tricks, but none of them work very well.
So, using good ol' polling here. To try to be as efficient as possible, there
is only a single setInterval used for all elements. To use:

```js
module.exports = React.createClass({

  mixins: [require('../../mixins/resize')],

  onResize: function () {
    console.log('resized!');
  },

  componentDidMount: function () {
    this.setOnResize('myText', this.onResize);
  },

  onChange: function () {
    ...
  },

  render: function () {
    return React.DOM.textarea({ref: 'myText', value: this.props.value, onChange: ...})
  }
});
```
*/

"use strict";

var id = 0;

var resizeIntervalElements = {};
var resizeIntervalElementsCount = 0;
var resizeIntervalTimer = null;

var checkElements = function checkElements() {
  Object.keys(resizeIntervalElements).forEach(function (key) {
    var element = resizeIntervalElements[key];
    if (element.clientWidth !== element.__prevClientWidth || element.clientHeight !== element.__prevClientHeight) {
      element.__prevClientWidth = element.clientWidth;
      element.__prevClientHeight = element.clientHeight;
      var handlers = element.__resizeHandlers;
      handlers.forEach(function (handler) {
        handler();
      });
    }
  }, 100);
};

var addResizeIntervalHandler = function addResizeIntervalHandler(element, fn) {
  if (resizeIntervalTimer === null) {
    resizeIntervalTimer = setInterval(checkElements, 100);
  }
  if (!("__resizeId" in element)) {
    id++;
    element.__prevClientWidth = element.clientWidth;
    element.__prevClientHeight = element.clientHeight;
    element.__resizeId = id;
    resizeIntervalElementsCount++;
    resizeIntervalElements[id] = element;
    element.__resizeHandlers = [];
  }
  element.__resizeHandlers.push(fn);
};

var removeResizeIntervalHandlers = function removeResizeIntervalHandlers(element) {
  if (!("__resizeId" in element)) {
    return;
  }
  var resizeId = element.__resizeId;
  delete element.__resizeId;
  delete element.__resizeHandlers;
  delete resizeIntervalElements[resizeId];
  resizeIntervalElementsCount--;
  if (resizeIntervalElementsCount < 1) {
    clearInterval(resizeIntervalTimer);
    resizeIntervalTimer = null;
  }
};

var onResize = function onResize(ref, fn) {
  fn(ref);
};

module.exports = {

  componentDidMount: function componentDidMount() {
    if (this.onResizeWindow) {
      window.addEventListener("resize", this.onResizeWindow);
    }
    this.resizeElementRefs = {};
  },

  componentWillUnmount: function componentWillUnmount() {
    if (this.onResizeWindow) {
      window.removeEventListener("resize", this.onResizeWindow);
    }
    Object.keys(this.resizeElementRefs).forEach((function (ref) {
      removeResizeIntervalHandlers(this.refs[ref].getDOMNode());
    }).bind(this));
  },

  setOnResize: function setOnResize(ref, fn) {
    if (!this.resizeElementRefs[ref]) {
      this.resizeElementRefs[ref] = true;
    }
    addResizeIntervalHandler(this.refs[ref].getDOMNode(), onResize.bind(this, ref, fn));
  }
};

},{}],47:[function(require,module,exports){
// # scroll mixin

/*
Currently unused.
*/

"use strict";

module.exports = function (plugin) {

  plugin.exports = {

    componentDidMount: function componentDidMount() {
      if (this.onScrollWindow) {
        window.addEventListener("scroll", this.onScrollWindow);
      }
    },

    componentWillUnmount: function componentWillUnmount() {
      if (this.onScrollWindow) {
        window.removeEventListener("scroll", this.onScrollWindow);
      }
    }
  };
};

},{}],48:[function(require,module,exports){
// # undo-stack mixin

/*
Gives your component an undo stack.
*/

// http://prometheusresearch.github.io/react-forms/examples/undo.html

"use strict";

module.exports = {
  getInitialState: function getInitialState() {
    return { undo: [], redo: [] };
  },

  snapshot: function snapshot() {
    var undo = this.state.undo.concat(this.getStateSnapshot());
    if (typeof this.state.undoDepth === "number") {
      if (undo.length > this.state.undoDepth) {
        undo.shift();
      }
    }
    this.setState({ undo: undo, redo: [] });
  },

  hasUndo: function hasUndo() {
    return this.state.undo.length > 0;
  },

  hasRedo: function hasRedo() {
    return this.state.redo.length > 0;
  },

  redo: function redo() {
    this._undoImpl(true);
  },

  undo: function undo() {
    this._undoImpl();
  },

  _undoImpl: function _undoImpl(isRedo) {
    var undo = this.state.undo.slice(0);
    var redo = this.state.redo.slice(0);
    var snapshot;

    if (isRedo) {
      if (redo.length === 0) {
        return;
      }
      snapshot = redo.pop();
      undo.push(this.getStateSnapshot());
    } else {
      if (undo.length === 0) {
        return;
      }
      snapshot = undo.pop();
      redo.push(this.getStateSnapshot());
    }

    this.setStateSnapshot(snapshot);
    this.setState({ undo: undo, redo: redo });
  }
};

},{}],49:[function(require,module,exports){
(function (global){
// # bootstrap plugin

/*
The bootstrap plugin sneaks in some classes to elements so that it plays well
with Twitter Bootstrap.
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

// Declare some classes and labels for each element.
var modifiers = {

  Field: { classes: { "form-group": true } },
  Help: { classes: { "help-block": true } },
  Sample: { classes: { "help-block": true } },
  ArrayControl: { classes: { "form-inline": true } },
  ArrayItem: { classes: { well: true } },
  ObjectItem: { classes: { well: true } },
  FieldTemplateChoices: { classes: { "form-control": true } },
  AddItem: { classes: { "glyphicon glyphicon-plus": true }, label: "" },
  RemoveItem: { classes: { "glyphicon glyphicon-remove": true }, label: "" },
  MoveItemBack: { classes: { "glyphicon glyphicon-arrow-up": true }, label: "" },
  MoveItemForward: { classes: { "glyphicon glyphicon-arrow-down": true }, label: "" },
  ObjectItemKey: { classes: { "form-control": true } },

  SingleLineString: { classes: { "form-control": true } },
  String: { classes: { "form-control": true } },
  PrettyText: { classes: { "form-control": true } },
  Json: { classes: { "form-control": true } },
  SelectValue: { classes: { "form-control": true } }
};

module.exports = function (config) {

  var createElement = config.createElement;

  return {
    createElement: (function (_createElement) {
      var _createElementWrapper = function createElement(_x, _x2, _x3) {
        return _createElement.apply(this, arguments);
      };

      _createElementWrapper.toString = function () {
        return _createElement.toString();
      };

      return _createElementWrapper;
    })(function (name, props, children) {

      name = config.elementName(name);

      var modifier = modifiers[name];

      if (modifier) {
        // If there is a modifier for this element, add the classes and label.
        props = _.extend({}, props);
        props.classes = _.extend({}, props.classes, modifier.classes);
        if ("label" in modifier) {
          props.label = modifier.label;
        }
      }

      return createElement(name, props, children);
    })
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],50:[function(require,module,exports){
(function (global){
// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (config) {

  var createElement = config.createElement;

  var elementClasses = {};

  return {
    addElementClass: function addElementClass(name, className) {

      name = config.elementName(name);

      if (!elementClasses[name]) {
        elementClasses[name] = {};
      }

      elementClasses[name][className] = true;
    },

    // Wrap the createElement method.
    createElement: (function (_createElement) {
      var _createElementWrapper = function createElement(_x, _x2, _x3) {
        return _createElement.apply(this, arguments);
      };

      _createElementWrapper.toString = function () {
        return _createElement.toString();
      };

      return _createElementWrapper;
    })(function (name, props, children) {

      name = config.elementName(name);

      if (elementClasses[name]) {
        props = _.extend({}, props, { classes: elementClasses[name] });
      }

      return createElement(name, props, children);
    })
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],51:[function(require,module,exports){
// # meta plugin

/*
The meta plugin lets you pass in a meta prop to formatic. The prop then gets
passed through as a property for every field. You can then wrap `initField` to
get your meta values.
*/

"use strict";

module.exports = function (config) {

  var initRootField = config.initRootField;
  var initField = config.initField;

  return {
    initRootField: (function (_initRootField) {
      var _initRootFieldWrapper = function initRootField(_x, _x2) {
        return _initRootField.apply(this, arguments);
      };

      _initRootFieldWrapper.toString = function () {
        return _initRootField.toString();
      };

      return _initRootFieldWrapper;
    })(function (field, props) {

      field.meta = props.meta || {};

      initRootField(field, props);
    }),

    initField: (function (_initField) {
      var _initFieldWrapper = function initField(_x) {
        return _initField.apply(this, arguments);
      };

      _initFieldWrapper.toString = function () {
        return _initField.toString();
      };

      return _initFieldWrapper;
    })(function (field) {

      if (field.parent && field.parent.meta) {
        field.meta = field.parent.meta;
      }

      initField(field);
    })
  };
};

},{}],52:[function(require,module,exports){
(function (global){
// # reference plugin

/*
This plugin allows fields to be strings and reference other fields by key or
id. It also allows a field to extend another field with
extends: ['foo', 'bar'] where 'foo' and 'bar' refer to other keys or ids.
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

module.exports = function (config) {

  var initField = config.initField;

  return {
    // Look for a template in this field or any of its parents.
    findFieldTemplate: function findFieldTemplate(field, name) {

      if (field.templates[name]) {
        return field.templates[name];
      }

      if (field.parent) {
        return config.findFieldTemplate(field.parent, name);
      }

      return null;
    },

    // Inherit from any field templates that this field template
    // extends.
    resolveFieldTemplate: function resolveFieldTemplate(field, fieldTemplate) {

      if (!fieldTemplate["extends"]) {
        return fieldTemplate;
      }

      var ext = fieldTemplate["extends"];

      if (!_.isArray(ext)) {
        ext = [ext];
      }

      var bases = ext.map(function (base) {
        var template = config.findFieldTemplate(field, base);
        if (!template) {
          throw new Error("Template " + base + " not found.");
        }
        return template;
      });

      var chain = [{}].concat(bases.reverse().concat([fieldTemplate]));
      fieldTemplate = _.extend.apply(_, chain);

      return fieldTemplate;
    },

    // Wrap the initField method.
    initField: (function (_initField) {
      var _initFieldWrapper = function initField(_x) {
        return _initField.apply(this, arguments);
      };

      _initFieldWrapper.toString = function () {
        return _initField.toString();
      };

      return _initFieldWrapper;
    })(function (field) {

      var templates = field.templates = {};

      var childFieldTemplates = config.fieldChildFieldTemplates(field);

      // Add each of the child field templates to our template map.
      childFieldTemplates.forEach(function (fieldTemplate) {

        if (_.isString(fieldTemplate)) {
          return;
        }

        var key = fieldTemplate.key;
        var id = fieldTemplate.id;

        if (fieldTemplate.template) {
          fieldTemplate = _.extend({}, fieldTemplate, { template: false });
        }

        if (!_.isUndefined(key) && key !== "") {
          templates[key] = fieldTemplate;
        }

        if (!_.isUndefined(id) && id !== "") {
          templates[id] = fieldTemplate;
        }
      });

      // Resolve any references to other field templates.
      if (childFieldTemplates.length > 0) {
        field.fields = childFieldTemplates.map(function (fieldTemplate) {
          if (_.isString(fieldTemplate)) {
            fieldTemplate = config.findFieldTemplate(field, fieldTemplate);
          }

          return config.resolveFieldTemplate(field, fieldTemplate);
        });

        field.fields = field.fields.filter(function (fieldTemplate) {
          return !fieldTemplate.template;
        });
      }

      var itemFieldTemplates = config.fieldItemFieldTemplates(field);

      // Resolve any of our item field templates. (Field templates for dynamic
      // child fields.)
      if (itemFieldTemplates.length > 0) {
        field.itemFields = itemFieldTemplates.map(function (itemFieldTemplate) {
          if (_.isString(itemFieldTemplate)) {
            itemFieldTemplate = config.findFieldTemplate(field, itemFieldTemplate);
          }

          return config.resolveFieldTemplate(field, itemFieldTemplate);
        });
      }

      initField(field);
    })
  };
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],53:[function(require,module,exports){
(function (global){
// # utils

/*
Just some shared utility functions.
*/

"use strict";

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var utils = exports;

// Copy obj recursing deeply.
utils.deepCopy = function (obj) {
  if (_.isArray(obj)) {
    return obj.map(function (item) {
      return utils.deepCopy(item);
    });
  } else if (_.isFunction(obj)) {
    return obj;
  } else if (_.isNull(obj)) {
    return obj;
  } else if (_.isObject(obj)) {
    var copy = {};
    _.each(obj, function (value, key) {
      copy[key] = utils.deepCopy(value);
    });
    return copy;
  } else {
    return obj;
  }
};

// Cache for strings converted to Pascal Case. This should be a finite list, so
// not much fear that we will run out of memory.
var dashToPascalCache = {};

// Convert foo-bar to FooBar.
utils.dashToPascal = function (s) {
  if (s === "") {
    return "";
  }
  if (!dashToPascalCache[s]) {
    dashToPascalCache[s] = s.split("-").map(function (part) {
      return part[0].toUpperCase() + part.substring(1);
    }).join("");
  }
  return dashToPascalCache[s];
};

// Copy all computed styles from one DOM element to another.
utils.copyElementStyle = function (fromElement, toElement) {
  var fromStyle = window.getComputedStyle(fromElement, "");

  if (fromStyle.cssText !== "") {
    toElement.style.cssText = fromStyle.cssText;
    return;
  }

  var cssRules = [];
  for (var i = 0; i < fromStyle.length; i++) {
    cssRules.push(fromStyle[i] + ":" + fromStyle.getPropertyValue(fromStyle[i]) + ";");
  }
  var cssText = cssRules.join("");

  toElement.style.cssText = cssText;
};

// Object to hold browser sniffing info.
var browser = {
  isChrome: false,
  isMozilla: false,
  isOpera: false,
  isIe: false,
  isSafari: false,
  isUnknown: false
};

// Sniff the browser.
var ua = "";

if (typeof navigator !== "undefined") {
  ua = navigator.userAgent;
}

if (ua.indexOf("Chrome") > -1) {
  browser.isChrome = true;
} else if (ua.indexOf("Safari") > -1) {
  browser.isSafari = true;
} else if (ua.indexOf("Opera") > -1) {
  browser.isOpera = true;
} else if (ua.indexOf("Firefox") > -1) {
  browser.isMozilla = true;
} else if (ua.indexOf("MSIE") > -1) {
  browser.isIe = true;
} else {
  browser.isUnknown = true;
}

// Export sniffed browser info.
utils.browser = browser;

// Create a method that delegates to another method on the same object. The
// default configuration uses this function to delegate one method to another.
utils.delegateTo = function (name) {
  return function () {
    return this[name].apply(this, arguments);
  };
};

utils.delegator = function (obj) {
  return function (name) {
    return function () {
      return obj[name].apply(obj, arguments);
    };
  };
};

utils.capitalize = function (s) {
  return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvaW5kZXguanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL2FycmF5LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9jaGVja2JveC1hcnJheS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY2hlY2tib3gtYm9vbGVhbi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvY29weS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvZmllbGRzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9qc29uLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1ib29sZWFuLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktc2VsZWN0LmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dDIuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3NlbGVjdC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2ZpZWxkcy9zdHJpbmcuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvZmllbGRzL3Vua25vd24uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hZGQtaXRlbS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWNvbnRyb2wuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLWNvbnRyb2wuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2Nob2ljZXMuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9maWVsZC10ZW1wbGF0ZS1jaG9pY2VzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvZmllbGQuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9oZWxwLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvaW5zZXJ0LWJ1dHRvbi5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL2xhYmVsLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbG9hZGluZy1jaG9pY2VzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvbW92ZS1pdGVtLWJhY2suanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tY29udHJvbC5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLWtleS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9wcmV0dHktc2VsZWN0LXZhbHVlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9jb21wb25lbnRzL2hlbHBlcnMvcmVtb3ZlLWl0ZW0uanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2NvbXBvbmVudHMvaGVscGVycy90YWctdHJhbnNsYXRvci5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvZGVmYXVsdC1jb25maWcuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL2Zvcm1hdGljLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvbWl4aW5zL2ZpZWxkLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9taXhpbnMvaGVscGVyLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9taXhpbnMvcmVzaXplLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9taXhpbnMvc2Nyb2xsLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9taXhpbnMvdW5kby1zdGFjay5qcyIsIi9Vc2Vycy9zdGV2ZS9mb3JtYXRpYy9saWIvcGx1Z2lucy9ib290c3RyYXAuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL3BsdWdpbnMvZWxlbWVudC1jbGFzc2VzLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi9wbHVnaW5zL21ldGEuanMiLCIvVXNlcnMvc3RldmUvZm9ybWF0aWMvbGliL3BsdWdpbnMvcmVmZXJlbmNlLmpzIiwiL1VzZXJzL3N0ZXZlL2Zvcm1hdGljL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQ0czQyxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRTlFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE9BQU87O0FBRXBCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOzs7Ozs7OztBQVF2QyxjQUFZLEVBQUUsQ0FBQzs7QUFFZixpQkFBZSxFQUFFLDJCQUFZOzs7O0FBSTNCLFFBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUVuQyxTQUFLLENBQUMsT0FBTyxDQUFDLENBQUEsVUFBVSxJQUFJLEVBQUUsQ0FBQyxFQUFFO0FBQy9CLGFBQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNyQyxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDckIsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVkLFdBQU87QUFDTCxhQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDO0dBQ0g7O0FBRUQsMkJBQXlCLEVBQUUsbUNBQVUsUUFBUSxFQUFFOztBQUU3QyxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzs7QUFFakMsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7OztBQUdqQyxRQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNqQyxXQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsZUFBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3JDLFlBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztPQUNyQjtLQUNGOztBQUVELFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixhQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDLENBQUM7R0FDSjs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7QUFDckMsUUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxpQkFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztBQUM1QixRQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUN6Qzs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsZUFBZSxFQUFFO0FBQ25DLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixRQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDOztBQUV2RSxRQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUV4QixTQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUMzQjs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsQ0FBQyxFQUFFO0FBQ3JCLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLFdBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixhQUFPLEVBQUUsT0FBTztLQUNqQixDQUFDLENBQUM7QUFDSCxRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFlBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDOUI7O0FBRUQsUUFBTSxFQUFFLGdCQUFVLFNBQVMsRUFBRSxPQUFPLEVBQUU7QUFDcEMsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDakMsUUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLFFBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1QixXQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFdBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDMUIsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGFBQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFFBQUksU0FBUyxLQUFLLE9BQU8sSUFDdkIsU0FBUyxJQUFJLENBQUMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFDN0MsT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFDekM7QUFDQSxjQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvRDtBQUNELFFBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDOUI7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZOztBQUV6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsUUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU3QyxRQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNsQyxXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ25DLFdBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUN0QyxFQUNDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFDdkMsa0JBQWtCLENBQUMsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFDLEVBQzdDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQSxVQUFVLFVBQVUsRUFBRSxDQUFDLEVBQUU7QUFDbEMsYUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRTtBQUN4QyxXQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzFCLGFBQUssRUFBRSxVQUFVO0FBQ2pCLGFBQUssRUFBRSxDQUFDO0FBQ1IsZ0JBQVEsRUFBRSxRQUFRO0FBQ2xCLGNBQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtBQUNuQixnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0FBQ3ZCLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsY0FBYztPQUM5QixDQUFDLENBQUM7S0FDSixDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDZCxNQUFNLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUMvRSxDQUNGLENBQUM7R0FDSDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDOUlILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXBDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLFNBQVM7O0FBRXRCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV2QyxVQUFRLEVBQUUsa0JBQVUsUUFBUSxFQUFFO0FBQzVCLFFBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDOUI7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZOztBQUV6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVoRCxXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ25DLFdBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUN0QyxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFO0FBQ3RDLGFBQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWM7S0FDdkYsQ0FBQyxDQUFDLENBQUM7R0FDTDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzlCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxlQUFlOztBQUU1QixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixXQUFPO0FBQ0wsYUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUMxRCxDQUFDO0dBQ0g7O0FBRUQsMkJBQXlCLEVBQUUsbUNBQVUsUUFBUSxFQUFFO0FBQzdDLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixhQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztLQUN0RCxDQUFDLENBQUM7R0FDSjs7QUFFRCxVQUFRLEVBQUUsb0JBQVk7O0FBRXBCLFFBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9FLGVBQVcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pELFFBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDM0MsYUFBTyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0tBQ3pDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUU7QUFDekIsYUFBTyxLQUFLLENBQUM7S0FDZCxDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzVCOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTs7QUFFekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFdkMsUUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLE1BQU0sRUFBRTtBQUNoRCxhQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDdEIsQ0FBQyxDQUFDOztBQUVILFdBQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDbkMsV0FBSyxFQUFFLEtBQUs7S0FDYixFQUNDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBQyxFQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUEsVUFBVSxNQUFNLEVBQUUsQ0FBQyxFQUFFOztBQUUvQixVQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQyxFQUFDLEVBQ3JELENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDTixZQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUc7QUFDZixZQUFJLEVBQUUsVUFBVTtBQUNoQixhQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7QUFDbkIsZUFBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUs7QUFDOUQsZ0JBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2QixlQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDM0IsY0FBTSxFQUFFLElBQUksQ0FBQyxZQUFZO09BQzFCLENBQUMsRUFDRixHQUFHLEVBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxvQkFBb0IsRUFBQyxFQUN0QyxNQUFNLENBQUMsS0FBSyxDQUNiLENBQ0YsQ0FBQzs7QUFFRixVQUFJLFFBQVEsRUFBRTtBQUNaLGVBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBQyxFQUMvQyxVQUFVLEVBQUUsR0FBRyxDQUNoQixDQUFDO09BQ0gsTUFBTTtBQUNMLGVBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBQyxFQUM5QyxVQUFVLEVBQUUsR0FBRyxFQUNmLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FDL0QsQ0FBQztPQUNIO0tBQ0YsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNkLENBQ0YsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUN6RkgsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxpQkFBaUI7O0FBRTlCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV2QyxVQUFRLEVBQUUsa0JBQVUsS0FBSyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUMxQzs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ25DLFlBQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSTtLQUMxQyxFQUNELENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFDLEVBQUMsRUFDcEMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNOLFVBQUksRUFBRSxVQUFVO0FBQ2hCLGFBQU8sRUFBRSxLQUFLLENBQUMsS0FBSztBQUNwQixlQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLGNBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2QixhQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDM0IsWUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZO0tBQzFCLENBQUMsRUFDRixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFDZixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDcEUsQ0FBQyxDQUFDO0dBQ0o7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3pDSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE1BQU07O0FBRW5CLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV2QyxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSx1QkFBdUIsRUFBRTtBQUN4RSxjQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO09BQzFELEVBQUMsQ0FBQyxDQUFDO0dBQ0w7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3RCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxRQUFROztBQUVyQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsZUFBYSxFQUFFLHVCQUFVLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQzVDLFFBQUksR0FBRyxFQUFFO0FBQ1AsVUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUQsb0JBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDL0IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDMUM7R0FDRjs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFFBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFN0MsV0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtBQUNuQyxZQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUN0RCxFQUNDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFDNUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBLFVBQVUsVUFBVSxFQUFFLENBQUMsRUFBRTtBQUNsQyxVQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM5QixhQUFPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUMvQixXQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDYixhQUFLLEVBQUUsVUFBVTtBQUNqQixnQkFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWM7T0FDNUUsQ0FBQyxDQUFDO0tBQ0osQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUNkLENBQ0YsQ0FBQztHQUNIOztDQUVGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzlDSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE1BQU07O0FBRW5CLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV2QyxpQkFBZSxFQUFFLDJCQUFZO0FBQzNCLFdBQU87QUFDTCxVQUFJLEVBQUUsQ0FBQztLQUNSLENBQUM7R0FDSDs7QUFFRCxjQUFZLEVBQUUsc0JBQVUsS0FBSyxFQUFFOztBQUU3QixRQUFJO0FBQ0YsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQixhQUFPLElBQUksQ0FBQztLQUNiLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixhQUFPLEtBQUssQ0FBQztLQUNkO0dBQ0Y7O0FBRUQsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixXQUFPO0FBQ0wsYUFBTyxFQUFFLElBQUk7QUFDYixXQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN2RCxDQUFDO0dBQ0g7O0FBRUQsVUFBUSxFQUFFLGtCQUFVLEtBQUssRUFBRTtBQUN6QixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXBELFFBQUksT0FBTyxFQUFFOztBQUVYLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDcEQ7O0FBRUQsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGFBQU8sRUFBRSxPQUFPO0FBQ2hCLFdBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUs7S0FDMUIsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsMkJBQXlCLEVBQUUsbUNBQVUsU0FBUyxFQUFFO0FBQzlDLFFBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixlQUFPLEVBQUUsSUFBSTtBQUNiLGFBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7T0FDdEQsQ0FBQyxDQUFDO0tBQ0o7QUFDRCxRQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztHQUMxQjs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFdBQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDbkMsV0FBSyxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUMvRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDVixlQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLFdBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDdkIsY0FBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0FBQ3ZCLFdBQUssRUFBRSxFQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUcsa0JBQWtCLEVBQUM7QUFDdEUsVUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO0FBQ2hELGFBQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtBQUMzQixZQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVk7S0FDMUIsQ0FBQyxDQUNILENBQUM7R0FDSDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDbEZILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRTlFLElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7QUFFakMsSUFBSSxPQUFPLEdBQUcsaUJBQVUsRUFBRSxFQUFFO0FBQzFCLFNBQU8sYUFBYSxHQUFHLEVBQUUsQ0FBQztDQUMzQixDQUFDOztBQUVGLElBQUksU0FBUyxHQUFHLG1CQUFVLEdBQUcsRUFBRTtBQUM3QixTQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsS0FBSyxhQUFhLENBQUM7Q0FDakUsQ0FBQzs7Ozs7QUFLRixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxRQUFROztBQUVyQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsY0FBWSxFQUFFLENBQUM7O0FBRWYsaUJBQWUsRUFBRSwyQkFBWTs7QUFFM0IsUUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFFBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0MsUUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDOzs7O0FBSWxCLFFBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQzs7Ozs7QUFLekIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBLFVBQVUsR0FBRyxFQUFFO0FBQzFCLFVBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFN0IsYUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsY0FBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBTW5CLFVBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2xCLHVCQUFlLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO09BQzFCO0tBQ0YsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVkLFdBQU87QUFDTCxhQUFPLEVBQUUsT0FBTztBQUNoQixjQUFRLEVBQUUsUUFBUTs7OztBQUlsQixxQkFBZSxFQUFFLGVBQWU7S0FDakMsQ0FBQztHQUNIOztBQUVELDJCQUF5QixFQUFFLG1DQUFVLFFBQVEsRUFBRTs7QUFFN0MsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDakMsUUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ2pELFFBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0FBQzVCLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0FBQ25DLFFBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxRQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7OztBQUduQixRQUFJLENBQUMsT0FBTyxDQUFDLENBQUEsVUFBVSxHQUFHLEVBQUU7O0FBRTFCLFVBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDakIsWUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLGtCQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNwQyxpQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNyQixNQUFNO0FBQ0wsa0JBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDaEM7QUFDRCxVQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksZUFBZSxFQUFFO0FBQ3hELDBCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUN4RTtLQUNGLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFZCxRQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7OztBQUdyQixZQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFOzs7QUFHOUIsVUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbkIsbUJBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDdkI7S0FDRixDQUFDLENBQUM7OztBQUdILGVBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUU1QyxRQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osYUFBTyxFQUFFLFVBQVU7QUFDbkIsY0FBUSxFQUFFLFdBQVc7QUFDckIscUJBQWUsRUFBRSxrQkFBa0I7S0FDcEMsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsVUFBUSxFQUFFLGtCQUFVLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ3ZDLFFBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xELFVBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7QUFDdkIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDbEM7O0FBRUQsVUFBUSxFQUFFLGtCQUFVLGVBQWUsRUFBRTtBQUNuQyxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM3QixRQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7O0FBRXBCLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0FBQ25DLFFBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDOztBQUVqRCxRQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQzNCLFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFekIsV0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFckIsbUJBQWUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekIsWUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGFBQU8sRUFBRSxPQUFPO0FBQ2hCLHFCQUFlLEVBQUUsZUFBZTtBQUNoQyxjQUFRLEVBQUUsUUFBUTtLQUNuQixDQUFDLENBQUM7O0FBRUgsUUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFOUMsUUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsQ0FBQzs7QUFFdkUsVUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1Qjs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsR0FBRyxFQUFFO0FBQ3ZCLFFBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsV0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1Qjs7QUFFRCxRQUFNLEVBQUUsZ0JBQVUsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUNoQyxRQUFJLE9BQU8sS0FBSyxLQUFLLEVBQUU7QUFDckIsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDakMsVUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDbkMsVUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7O0FBRWpELFVBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7QUFJOUMsVUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7O0FBRWxCLFlBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN4Qyx1QkFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUN4QyxlQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLGdCQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUM5QyxlQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QixZQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUJBQU8sRUFBRSxPQUFPO0FBQ2hCLHlCQUFlLEVBQUUsZUFBZTtBQUNoQyxrQkFBUSxFQUFFLFFBQVE7U0FDbkIsQ0FBQyxDQUFDOztBQUVILGNBQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEMsZUFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDdEI7O0FBRUQsVUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLGFBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDbEMsdUJBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDeEM7QUFDRCxhQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLGFBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hCLGNBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDOztBQUU1QyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osZUFBTyxFQUFFLE9BQU87QUFDaEIsZ0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHVCQUFlLEVBQUUsZUFBZTtPQUNqQyxDQUFDLENBQUM7O0FBRUgsWUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxhQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdkIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBRzNCLFVBQUksT0FBTyxJQUFJLE9BQU8sS0FBSyxLQUFLLEVBQUU7QUFDaEMsWUFBSSxFQUFFLE9BQU8sSUFBSSxNQUFNLENBQUEsQUFBQyxFQUFFO0FBQ3hCLGdCQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBLFVBQVUsR0FBRyxFQUFFO0FBQ3pDLGdCQUFJLENBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDckIscUJBQU87YUFDUjtBQUNELGdCQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEIsZ0JBQUksVUFBVSxHQUFHLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyQyxnQkFBSSxPQUFPLEtBQUssVUFBVSxFQUFFO0FBQzFCLGtCQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUM5QjtXQUNGLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNmO09BQ0Y7S0FDRjtHQUNGOztBQUVELFdBQVMsRUFBRSxxQkFBWTtBQUNyQixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsUUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU3QyxRQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLEtBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsVUFBVSxFQUFFO0FBQ25DLGdCQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztLQUN6QyxDQUFDLENBQUM7O0FBRUgsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEVBQUU7QUFDNUMsYUFBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDeEIsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZOztBQUV6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUU5QixXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ25DLFdBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUN0QyxFQUNDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFDdkMsa0JBQWtCLENBQUMsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFDLEVBQzNDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQSxVQUFVLFVBQVUsRUFBRTtBQUMvQixVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRixVQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDN0Isa0JBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO09BQzdCO0FBQ0QsYUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRTtBQUN6QyxXQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztBQUN2QyxhQUFLLEVBQUUsVUFBVTtBQUNqQixjQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07QUFDbkIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2QixnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0FBQ3ZCLGdCQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWM7QUFDN0Isa0JBQVUsRUFBRSxVQUFVO0FBQ3RCLGVBQU8sRUFBRSxVQUFVLENBQUMsR0FBRztPQUN4QixDQUFDLENBQUM7S0FDSixDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2QsRUFDRCxNQUFNLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQ2hGLENBQ0YsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNyUkgsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFcEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxhQUFXLEVBQUUsZUFBZTs7QUFFNUIsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRXZDLFVBQVEsRUFBRSxrQkFBVSxRQUFRLEVBQUU7QUFDNUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM5Qjs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFaEQsV0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtBQUNuQyxXQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7S0FDdEMsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFO0FBQzdDLGFBQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWM7S0FDdkYsQ0FBQyxDQUFDLENBQUM7R0FDTDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzdCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVwQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxjQUFjOztBQUUzQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixXQUFPO0FBQ0wsYUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ2hFLENBQUM7R0FDSDs7QUFFRCwyQkFBeUIsRUFBRSxtQ0FBVSxRQUFRLEVBQUU7QUFDN0MsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGFBQU8sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7S0FDNUQsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZOztBQUV6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsV0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtBQUNuQyxZQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUN0RCxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUU7QUFDN0MsYUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjO0tBQ3ZHLENBQUMsQ0FBQyxDQUFDO0dBQ0w7Q0FDRixDQUFDLENBQUM7Ozs7OztBQzVDSCxZQUFZLENBQUM7Ozs7QUFJYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDekQsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ2pDLGFBQVcsRUFBRSxZQUFZOztBQUV6QixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsbUJBQWlCLEVBQUUsNkJBQVc7QUFDNUIsUUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3JCOztBQUVELG9CQUFrQixFQUFFLDRCQUFTLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDakQsUUFBSSxTQUFTLENBQUMsY0FBYyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFOzs7QUFHMUQsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7QUFHRCxRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFOztBQUUvRSxVQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDOzs7QUFHL0IsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN6QyxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUQsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7OztBQUtuRSxVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pDLFlBQU0sQ0FBQyxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDOztBQUVsRCxVQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN2QyxVQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQztHQUNGOztBQUVELHNCQUFvQixFQUFFLGdDQUFXO0FBQy9CLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDN0IsVUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDL0I7R0FDRjs7QUFFRCxpQkFBZSxFQUFFLDJCQUFXO0FBQzFCLFFBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0UsUUFBSSxVQUFVLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFM0UsV0FBTztBQUNMLFdBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLO0FBQzdCLG9CQUFjLEVBQUUsS0FBSztBQUNyQixtQkFBYSxFQUFFLEtBQUs7QUFDcEIsb0JBQWMsRUFBRSxjQUFjO0FBQzlCLGdCQUFVLEVBQUUsVUFBVTtLQUN2QixDQUFDO0dBQ0g7O0FBRUQsMkJBQXlCLEVBQUUsbUNBQVMsU0FBUyxFQUFFO0FBQzdDLFFBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1RSxRQUFJLFNBQVMsR0FBRztBQUNkLG9CQUFjLEVBQUUsY0FBYztLQUMvQixDQUFDOztBQUVGLFFBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFakQsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUN2RSxlQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pDOztBQUVELFFBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDMUI7O0FBRUQsdUJBQXFCLEVBQUUsK0JBQVUsR0FBRyxFQUFFO0FBQ3BDLFFBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7QUFHaEQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUN6Qjs7QUFFRCxRQUFNLEVBQUUsa0JBQVc7QUFDakIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDN0IsUUFBSSxLQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RELFFBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7O0FBRTlCLFFBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFDLGlCQUFpQixFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQztBQUNyRixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzs7QUFFdkMsUUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRW5ILFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFO0FBQzVDLFNBQUcsRUFBRSxTQUFTO0FBQ2QsYUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYztBQUNsQyxVQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0FBQzlCLHNCQUFnQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7QUFDMUMsY0FBUSxFQUFFLElBQUksQ0FBQyxxQkFBcUI7QUFDcEMsYUFBTyxFQUFFLElBQUksQ0FBQyxjQUFjO0tBQzdCLENBQUMsQ0FBQzs7OztBQUlILFFBQUksT0FBTyxHQUNUOztRQUFLLFNBQVMsRUFBQyxxQkFBcUIsRUFBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDO01BQ3pFOztVQUFLLFNBQVMsRUFBRSxjQUFjLEFBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxBQUFDO1FBQ2hELE9BQU87T0FDSjtNQUVMLFNBQVM7TUFDVCxPQUFPO0tBQ0osQUFDUCxDQUFDOztBQUVGLFdBQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3REOztBQUVELHFCQUFtQixFQUFFLCtCQUFZO0FBQy9CLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7R0FDdEM7O0FBRUQsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixRQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNoRDs7QUFFRCxnQkFBYyxFQUFFLHdCQUFVLE1BQU0sRUFBRTtBQUNoQyxRQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsbUJBQW1CLEdBQUcsb0JBQW9CLENBQUM7QUFDakUsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixRQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7R0FDMUM7O0FBRUQsZ0JBQWMsRUFBRSwwQkFBWTtBQUMxQixRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFO0FBQzVCLFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDNUI7R0FDRjs7QUFFRCxtQkFBaUIsRUFBRSw2QkFBWTtBQUM3QixRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFO0FBQzdCLGFBQU8sNkJBQUssR0FBRyxFQUFDLFNBQVMsR0FBRyxDQUFDO0tBQzlCLE1BQU07QUFDTCxVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxRCxhQUFPLDZCQUFLLEdBQUcsRUFBQyxTQUFTLEVBQUMsdUJBQXVCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLEFBQUMsR0FBRyxDQUFDO0tBQ3ZFO0dBQ0Y7O0FBRUQsY0FBWSxFQUFFLHdCQUFZO0FBQ3hCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDN0IsVUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDL0IsTUFBTTtBQUNMLFVBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0tBQzdCO0dBQ0Y7O0FBRUQsd0JBQXNCLEVBQUUsa0NBQVk7QUFDbEMsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWxFLFFBQUksT0FBTyxHQUFHO0FBQ1osa0JBQVksRUFBRSxJQUFJO0FBQ2xCLGNBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7QUFDN0IsV0FBSyxFQUFFLE9BQU87QUFDZCxrQkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGtCQUFrQjtBQUN0RCw0QkFBc0IsRUFBRSxJQUFJLENBQUMsYUFBYTtBQUMxQyxlQUFTLEVBQUU7QUFDVCxXQUFHLEVBQUUsS0FBSztPQUNYO0tBQ0YsQ0FBQzs7QUFFRixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM3QyxXQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFdkIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQy9DLFFBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztHQUN2RDs7QUFFRCxvQkFBa0IsRUFBRSw4QkFBWTtBQUM5QixRQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTs7QUFFM0IsVUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUNoQyxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUM3RSxRQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztHQUNsQzs7QUFFRCxzQkFBb0IsRUFBRSxnQ0FBWTtBQUNoQyxRQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNqRCxlQUFXLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3hFOztBQUVELHdCQUFzQixFQUFFLGtDQUFZO0FBQ2xDLFFBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pELFFBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUM7QUFDcEMsZUFBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztHQUN4Qjs7QUFFRCxvQkFBa0IsRUFBRSw4QkFBWTtBQUM5QixRQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDOUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQ3ZDO0dBQ0Y7Ozs7QUFJRCxlQUFhLEVBQUUsdUJBQVUsSUFBSSxFQUFFO0FBQzdCLFFBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVuRCxTQUFLLENBQUMsTUFBTSxDQUNWOztRQUFNLFNBQVMsRUFBQyxhQUFhLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7TUFBRSxLQUFLO0tBQVEsRUFDM0UsSUFBSSxDQUNMLENBQUM7QUFDRixXQUFPLElBQUksQ0FBQztHQUNiO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3RQSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVwQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxRQUFROztBQUVyQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixXQUFPO0FBQ0wsYUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUMxRCxDQUFDO0dBQ0g7O0FBRUQsMkJBQXlCLEVBQUUsbUNBQVUsUUFBUSxFQUFFO0FBQzdDLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixhQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztLQUN0RCxDQUFDLENBQUM7R0FDSjs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ25DLFlBQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO0tBQ3RELEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUU7QUFDdEMsYUFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjO0tBQ3ZHLENBQUMsQ0FBQyxDQUFDO0dBQ0w7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3ZDSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGtCQUFrQjs7QUFFL0IsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRXZDLFVBQVEsRUFBRSxrQkFBVSxLQUFLLEVBQUU7QUFDekIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3hDOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTs7QUFFekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFdBQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDbkMsWUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7S0FDdEQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ1QsVUFBSSxFQUFFLE1BQU07QUFDWixXQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSztBQUM3QixlQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLGNBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2QixhQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWE7QUFDM0IsWUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZO0tBQzFCLENBQUMsQ0FBQyxDQUFDO0dBQ0w7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3BDSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLFFBQVE7O0FBRXJCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUV2QyxVQUFRLEVBQUUsa0JBQVUsS0FBSyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN4Qzs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixXQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ25DLFlBQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO0tBQ3RELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUNaLFdBQUssRUFBRSxLQUFLLENBQUMsS0FBSztBQUNsQixlQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLFVBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSTtBQUNuQyxjQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsYUFBTyxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQzNCLFlBQU0sRUFBRSxJQUFJLENBQUMsWUFBWTtLQUMxQixDQUFDLENBQUMsQ0FBQztHQUNMO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNwQ0gsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDOztBQUVsQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxTQUFTOztBQUV0QixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFdkMsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQ2IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsMkJBQTJCLENBQUMsRUFDdEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDdEUsQ0FBQztHQUNIOztDQUVGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDdEJILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxhQUFXLEVBQUUsU0FBUzs7QUFFdEIsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLGlCQUFlLEVBQUUsMkJBQVk7QUFDM0IsV0FBTztBQUNMLFdBQUssRUFBRSxPQUFPO0tBQ2YsQ0FBQztHQUNIOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTtBQUN6QixXQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNuRztDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDekJILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxhQUFXLEVBQUUsY0FBYzs7QUFFM0IsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLGlCQUFlLEVBQUUsMkJBQVk7QUFDM0IsV0FBTztBQUNMLHdCQUFrQixFQUFFLENBQUM7S0FDdEIsQ0FBQztHQUNIOztBQUVELFVBQVEsRUFBRSxrQkFBVSxLQUFLLEVBQUU7QUFDekIsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHdCQUFrQixFQUFFLEtBQUs7S0FDMUIsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsVUFBUSxFQUFFLG9CQUFZO0FBQ3BCLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztHQUNwRDs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUUvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM3QixRQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNELFFBQUksV0FBVyxHQUFHLElBQUksQ0FBQzs7QUFFdkIsUUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUM3QixpQkFBVyxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsd0JBQXdCLEVBQUU7QUFDM0QsYUFBSyxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtPQUN6RixDQUFDLENBQUM7S0FDSjs7QUFFRCxXQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFDOUMsV0FBVyxFQUFFLEdBQUcsRUFDaEIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FDekUsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNwREgsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxrQkFBa0I7O0FBRS9CLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxZQUFVLEVBQUUsc0JBQVk7QUFDdEIsUUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDM0Q7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzNEOztBQUVELFVBQVEsRUFBRSxvQkFBWTtBQUNwQixRQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3ZDOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTtBQUN6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsV0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFDLEVBQzlDLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUMsQ0FBQyxFQUNwSCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUMsQ0FBQyxHQUFHLElBQUksRUFDOUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxBQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FDN0ksQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUN0Q0gsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxnQkFBZ0I7O0FBRTdCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxlQUFhLEVBQUUsdUJBQVUsUUFBUSxFQUFFLElBQUksRUFBRTtBQUN2QyxRQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDdkQ7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixXQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFDOUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBQyxDQUFDLENBQ3ZHLENBQUM7R0FDSDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDNUJILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUMvQixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLFdBQVc7O0FBRXhCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxpQkFBZSxFQUFFLDJCQUFZO0FBQzNCLFdBQU87QUFDTCxxQkFBZSxFQUFFLEtBQUs7S0FDdkIsQ0FBQztHQUNIOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx1QkFBVSxlQUFlLEVBQUU7QUFDeEMsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHFCQUFlLEVBQUUsZUFBZTtLQUNqQyxDQUFDLENBQUM7R0FDSjs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFFBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9DLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7QUFDOUIsYUFBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ2xDOztBQUVELFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFDbkMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztBQUM3RSxjQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUMsQ0FBQyxFQUNoRSxNQUFNLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUM5RyxZQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFDLENBQUMsQ0FDaEcsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUM5Q0gsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFOUIsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFOUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxhQUFXLEVBQUUsU0FBUzs7QUFFdEIsUUFBTSxFQUFFLENBQ04sT0FBTyxDQUFDLHFCQUFxQixDQUFDOzs7QUFHOUIsU0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQ3RDOztBQUVELGlCQUFlLEVBQUUsMkJBQVk7QUFDM0IsV0FBTztBQUNMLGVBQVMsRUFBRSxJQUFJO0FBQ2YsVUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSTtLQUN0QixDQUFDO0dBQ0g7O0FBRUQscUJBQW1CLEVBQUUsK0JBQVk7QUFDL0IsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7QUFDaEMsYUFBTyxFQUFFLENBQUM7S0FDWDtBQUNELFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNyQixXQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQjtBQUNELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsbUJBQWlCLEVBQUUsNkJBQVk7QUFDN0IsUUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxDQUFBLFVBQVUsS0FBSyxFQUFFOzs7QUFHakQsVUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQSxVQUFVLElBQUksRUFBRTtBQUN0RCxlQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztPQUM5QyxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDYixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3RCO0tBQ0YsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVkLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztHQUNuQjs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsTUFBTSxFQUFFO0FBQzFCLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNuQzs7QUFFRCxnQkFBYyxFQUFFLHdCQUFVLE1BQU0sRUFBRTtBQUNoQyxRQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNuQzs7QUFFRCxnQkFBYyxFQUFFLDBCQUFZO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztHQUNuQjs7QUFFRCxnQkFBYyxFQUFFLDBCQUFZO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztHQUNuQjs7QUFFRCxZQUFVLEVBQUUsc0JBQVk7QUFDdEIsUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNyQixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUMxQyxVQUFJLElBQUksR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUN4QyxVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ25CLFVBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDdEMsVUFBSSxNQUFNLEdBQUcsWUFBWSxHQUFHLEdBQUcsQ0FBQztBQUNoQyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUJBQVMsRUFBRSxNQUFNO09BQ2xCLENBQUMsQ0FBQztLQUNKO0dBQ0Y7O0FBRUQsMkJBQXlCLEVBQUUsbUNBQVUsU0FBUyxFQUFFO0FBQzlDLFFBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBQyxFQUFFLENBQUEsWUFBWTtBQUNoRCxVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDbkIsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ2Y7O0FBRUQsVUFBUSxFQUFFLG9CQUFZLEVBSXJCOztBQUVELFNBQU8sRUFBRSxtQkFBWSxFQUdwQjs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDOztBQUVqQyxRQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNuQyxhQUFPLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDO0tBQ3BDOztBQUVELFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7QUFDbkIsYUFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDaEUsaUJBQVMsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUU7QUFDbkQsb0JBQVUsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVO0FBQ2xFLG1CQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSTtTQUM5RCxFQUFDLEVBQ0Esa0JBQWtCLENBQUMsRUFBQyxjQUFjLEVBQUUsUUFBUSxFQUFDLEVBQzNDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsRUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBLFVBQVUsTUFBTSxFQUFFLENBQUMsRUFBRTs7QUFFL0IsWUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDOztBQUV6QixZQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssZUFBZSxFQUFFO0FBQ3BDLHVCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEdBQUcsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQyxFQUN6RSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBQyxFQUNoQyxZQUFZLENBQ2IsQ0FDRixDQUFDO1NBQ0gsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssYUFBYSxFQUFFO0FBQ3pDLHVCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEdBQUcsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQyxFQUN6RSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBQyxFQUNoQyx1QkFBdUIsQ0FDeEIsQ0FDRixDQUFDO1NBQ0gsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDeEIsY0FBSSxZQUFZLEdBQUcsZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRW5ELHVCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxZQUFZLEdBQUcsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUMsRUFDN0YsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUMsRUFDOUIsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ25FLEVBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLHNCQUFzQixFQUFFLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQ2pHLENBQUM7U0FDSCxNQUNJO0FBQ0gsdUJBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksR0FBRyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBQyxFQUN2RixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBQyxFQUNoQyxNQUFNLENBQUMsS0FBSyxDQUNiLEVBQ0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUMsRUFDakMsTUFBTSxDQUFDLE1BQU0sQ0FDZCxDQUNGLENBQUM7U0FDSDs7QUFFRCxlQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsRUFDdkMsYUFBYSxDQUNkLENBQUM7T0FDSCxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQ2QsQ0FDRixDQUNGLENBQUM7S0FDSDs7O0FBR0QsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RLSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLHNCQUFzQjs7QUFFbkMsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLFVBQVEsRUFBRSxrQkFBVSxLQUFLLEVBQUU7QUFDekIsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUNuRDs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixRQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNELFFBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUN2QixRQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLGlCQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLEVBQ25ILGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxhQUFhLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLGVBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQyxFQUFFLGFBQWEsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDL0QsQ0FBQyxDQUFDLENBQUM7S0FDTDs7QUFFRCxXQUFPLFdBQVcsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNqRDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDckNILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRTlFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE9BQU87O0FBRXBCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxpQkFBZSxFQUFFLDJCQUFZO0FBQzNCLFdBQU87QUFDTCxlQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSztLQUMvRSxDQUFDO0dBQ0g7O0FBRUQsY0FBWSxFQUFFLHdCQUFZO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixlQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7S0FDakMsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZOztBQUV6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFL0IsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQzVCOztBQUVELFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDOztBQUU3QixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM3QixRQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN0QixVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDL0IsV0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQztLQUMzQzs7QUFFRCxRQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQyxRQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2QyxVQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFO0FBQzlCLGFBQU8sQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ2xELENBQUMsQ0FBQzs7QUFFSCxRQUFJLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDakMsYUFBTyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7S0FDekIsTUFBTTtBQUNMLGFBQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ3pCOztBQUVELFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUMsT0FBTyxFQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLEVBQUUsQUFBQyxFQUFDLEVBQUMsRUFDbkYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7QUFDNUIsWUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSztBQUM1QixXQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJO0tBQ25GLENBQUMsRUFDRixrQkFBa0IsQ0FBQyxFQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUMsRUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxHQUFHLENBQzFCLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQzNCLFlBQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUs7QUFDNUIsU0FBRyxFQUFFLE1BQU07S0FDWixDQUFDLEVBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQ3BCLENBQ0YsQ0FDRixDQUFDO0dBQ0g7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQzdFSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE1BQU07O0FBRW5CLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7O0FBRXpCLFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVqRSxXQUFPLFFBQVEsR0FDYixDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLHVCQUF1QixFQUFFLEVBQUMsTUFBTSxFQUFFLFFBQVEsRUFBQyxFQUFDLENBQUMsR0FDdkYsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoQjtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDeEJILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRXBDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNqQyxXQUFTLEVBQUU7QUFDVCxXQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTtBQUN4QyxPQUFHLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0dBQzVCOztBQUVELGFBQVcsRUFBRSxjQUFjOztBQUUzQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFeEMsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFdBQ0U7O1FBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxBQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksR0FBRyxHQUFHLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEFBQUM7TUFDM0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRO0tBQ2xCLENBQ0o7R0FDSDs7Q0FFRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQzFCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLE9BQU87O0FBRXBCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFFBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTFDLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO0FBQ3hDLFdBQUssR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxHQUFHLENBQUM7QUFDMUMsVUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUM7T0FDbEM7S0FDRjs7QUFFRCxRQUFJLFVBQVUsSUFBSSxLQUFLLEVBQUU7QUFDdkIsVUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLFVBQVUsQ0FBQztBQUMvQixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ3RCLFlBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFlBQVksR0FBRyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDM0U7QUFDRCxXQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDM0I7O0FBRUQsUUFBSSxhQUFhLENBQUM7O0FBRWxCLFFBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDeEMsbUJBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3JCLGlCQUFTLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFlLEdBQUcsbUJBQW1CO09BQ2pGLENBQUMsQ0FBQztLQUNKOztBQUVELFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNYLGVBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7S0FDbEMsRUFDQyxLQUFLLEVBQ0wsR0FBRyxFQUNILGFBQWEsQ0FDZCxDQUFDO0dBQ0g7Q0FDRixDQUFDLENBQUM7Ozs7OztBQzVESCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVwQyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDakMsYUFBVyxFQUFFLGdCQUFnQjs7QUFFN0IsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTtBQUN6QixXQUNFOzs7O0tBQTZCLENBQzdCO0dBQ0g7O0NBRUYsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNiSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGNBQWM7O0FBRTNCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxpQkFBZSxFQUFFLDJCQUFZO0FBQzNCLFdBQU87QUFDTCxXQUFLLEVBQUUsTUFBTTtLQUNkLENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsV0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDbkc7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3pCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGlCQUFpQjs7QUFFOUIsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLGlCQUFlLEVBQUUsMkJBQVk7QUFDM0IsV0FBTztBQUNMLFdBQUssRUFBRSxRQUFRO0tBQ2hCLENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsV0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDbkc7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3pCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGVBQWU7O0FBRTVCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxpQkFBZSxFQUFFLDJCQUFZO0FBQzNCLFdBQU87QUFDTCx3QkFBa0IsRUFBRSxDQUFDO0tBQ3RCLENBQUM7R0FDSDs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsS0FBSyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxRQUFRLENBQUM7QUFDWix3QkFBa0IsRUFBRSxLQUFLO0tBQzFCLENBQUMsQ0FBQztHQUNKOztBQUVELFVBQVEsRUFBRSxvQkFBWTtBQUNwQixRQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7R0FDcEQ7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzdCLFFBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFNUQsUUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDOztBQUV2QixRQUFJLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLGlCQUFXLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsRUFBRTtBQUMzRCxhQUFLLEVBQUUsS0FBSztBQUNaLDBCQUFrQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO09BQzNFLENBQUMsQ0FBQztLQUNKOztBQUVELFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBQyxFQUM5QyxXQUFXLEVBQUUsR0FBRyxFQUNoQixNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FDM0QsQ0FBQztHQUNIO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNuREgsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxtQkFBbUI7O0FBRWhDLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxVQUFRLEVBQUUsb0JBQVk7QUFDcEIsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUN6Qzs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBQyxFQUM5QyxNQUFNLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUM1RSxDQUFDO0dBQ0g7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQzVCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGVBQWU7O0FBRTVCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxVQUFRLEVBQUUsa0JBQVUsS0FBSyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDekM7O0FBRUQsUUFBTSxFQUFFLGtCQUFZO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDaEM7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFdBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7R0FDMUg7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ3ZCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGlCQUFpQjs7QUFFOUIsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLGVBQWEsRUFBRSx1QkFBVSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ3ZDLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUN6RDs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBQyxFQUM5QyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUNyRixDQUFDO0dBQ0g7Q0FDRixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQzVCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLFlBQVk7O0FBRXpCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxhQUFXLEVBQUUscUJBQVUsTUFBTSxFQUFFO0FBQzdCLFFBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQy9DOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTtBQUN6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQzs7QUFFN0IsV0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFDLEVBQzlDLE1BQU0sQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUMsQ0FBQyxFQUNuSixNQUFNLENBQUMsYUFBYSxDQUFDLG1CQUFtQixFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFDLENBQUMsRUFDckgsTUFBTSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQ3hILENBQUM7R0FDSDtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUM1QkgsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBVyxFQUFFLGFBQWE7O0FBRTFCLFFBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUV4QyxVQUFRLEVBQUUsa0JBQVUsS0FBSyxFQUFFO0FBQ3pCLFFBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3JDLFFBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwRSxRQUFJLFVBQVUsS0FBSyxRQUFRLEVBQUU7QUFDM0IsVUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLGlCQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzVEO0dBQ0Y7O0FBRUQsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixXQUFPO0FBQ0wsYUFBTyxFQUFFLEVBQUU7S0FDWixDQUFDO0dBQ0g7O0FBRUQsaUJBQWUsRUFBRSwyQkFBVztBQUMxQixRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRXRGLFdBQU87QUFDTCxtQkFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtBQUN2QyxXQUFLLEVBQUUsWUFBWTtBQUNuQiwyQkFBcUIsRUFBRSxLQUFLO0tBQzdCLENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUUsa0JBQVk7QUFDbEIsV0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztHQUNoQzs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDL0IsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRSxRQUFJLGdCQUFnQixDQUFDOztBQUVyQixRQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssZUFBZSxFQUFFO0FBQ2hFLHNCQUFnQixHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDaEUsTUFBTTtBQUNMLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUU7QUFDM0QsV0FBRyxFQUFFLFNBQVM7QUFDZCxlQUFPLEVBQUUsT0FBTztBQUNoQixZQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0FBQzlCLHdCQUFnQixFQUFFLElBQUksQ0FBQyxtQkFBbUI7QUFDMUMsZ0JBQVEsRUFBRSxJQUFJLENBQUMsY0FBYztBQUM3QixlQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWM7QUFDNUIsc0JBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztPQUNwQyxDQUFDLENBQUM7O0FBRUgsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUV2QyxzQkFBZ0IsR0FDZDs7VUFBSyxTQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEFBQUM7QUFDbEMsa0JBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDO0FBQ3hCLGlCQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQUFBQztBQUM1QixnQkFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7UUFFN0I7O1lBQUssR0FBRyxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztVQUM3QyxTQUFTO1VBQ1YsOEJBQU0sU0FBUyxFQUFDLGNBQWMsR0FBRztTQUM3QjtRQUNMLFdBQVc7T0FDUixBQUNQLENBQUM7S0FDSDs7QUFFRCxXQUFPLGdCQUFnQixDQUFDO0dBQ3pCOztBQUVELGlCQUFlLEVBQUUsMkJBQVk7QUFDM0IsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFO0FBQ3BDLGFBQU8sK0JBQU8sR0FBRyxFQUFDLGFBQWEsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUM7QUFDNUQsZ0JBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxBQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQUFBQyxHQUFHLENBQUM7S0FDeEc7O0FBRUQsV0FBTywrQkFBTyxJQUFJLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLEFBQUMsRUFBQyxRQUFRLE1BQUEsR0FBRyxDQUFDO0dBQ3RFOztBQUVELHFCQUFtQixFQUFFLCtCQUFZO0FBQy9CLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7R0FDdEM7O0FBRUQsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixRQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztHQUNoRDs7QUFFRCxnQkFBYyxFQUFFLHdCQUFVLE1BQU0sRUFBRTtBQUNoQyxRQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsbUJBQW1CLEdBQUcsb0JBQW9CLENBQUM7QUFDakUsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixRQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7R0FDMUM7O0FBRUQsZ0JBQWMsRUFBRSx3QkFBVSxLQUFLLEVBQUU7QUFDL0IsUUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLG1CQUFhLEVBQUUsS0FBSztBQUNwQixXQUFLLEVBQUUsS0FBSztLQUNiLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzVCOztBQUVELGdCQUFjLEVBQUUsMEJBQVk7QUFDMUIsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTtBQUM1QixVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzVCO0dBQ0Y7O0FBRUQsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNwQyxRQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsTUFBTSxFQUFFO0FBQy9ELGFBQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxZQUFZLENBQUM7S0FDdEMsQ0FBQyxDQUFDOztBQUVILFFBQUksYUFBYSxFQUFFO0FBQ2pCLGFBQU8sYUFBYSxDQUFDLEtBQUssQ0FBQztLQUM1QjtBQUNELFFBQUksWUFBWSxFQUFFOztBQUNoQixhQUFPLFlBQVksQ0FBQztLQUNyQjtBQUNELFdBQU8sRUFBRSxDQUFDO0dBQ1g7O0FBRUQsZ0JBQWMsRUFBRSx3QkFBVSxNQUFNLEVBQUU7QUFDaEMsUUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLG9CQUFvQixFQUFFO0FBQzFDLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWiw2QkFBcUIsRUFBRSxJQUFJO0FBQzNCLHFCQUFhLEVBQUUsS0FBSztBQUNwQixhQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7T0FDcEIsRUFBRSxZQUFZO0FBQ2IsWUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDNUMsQ0FBQyxDQUFDO0tBQ0osTUFBTTtBQUNMLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixxQkFBYSxFQUFFLEtBQUs7QUFDcEIsYUFBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO09BQ3BCLENBQUMsQ0FBQztLQUNKOztBQUVELFFBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztHQUMzQzs7QUFFRCxVQUFRLEVBQUUsa0JBQVUsTUFBTSxFQUFFO0FBQzFCLFFBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxvQkFBb0IsRUFBRTtBQUMxQyxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFDLEVBQUUsWUFBWTtBQUN2RCxZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUM1QyxDQUFDLENBQUM7S0FDSjtBQUNELFFBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDN0I7O0FBRUQsZUFBYSxFQUFFLHVCQUFVLEtBQUssRUFBRTtBQUM5QixRQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3pDO0NBQ0YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNyS0gsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxZQUFZOztBQUV6QixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFeEMsaUJBQWUsRUFBRSwyQkFBWTtBQUMzQixXQUFPO0FBQ0wsV0FBSyxFQUFFLFVBQVU7S0FDbEIsQ0FBQztHQUNIOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELG1CQUFpQixFQUFFLDZCQUFZO0FBQzdCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7QUFDNUIsVUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEM7R0FDRjs7QUFFRCxrQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixRQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFO0FBQzVCLFVBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2pDO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNaLGVBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO0FBQzlELGlCQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO0tBQ3ZFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN0QjtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FDeENILFlBQVksQ0FBQzs7QUFFYixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUNsQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOztBQUVqQyxhQUFXLEVBQUUsUUFBUTs7QUFFckIsUUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXhDLFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTs7QUFFekIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0FBRS9CLFdBQU8sTUFBTSxDQUFDLE1BQU0sR0FDbEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBQyxFQUN6QyxNQUFNLENBQUMsTUFBTSxDQUNkLEdBQ0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoQjtDQUNGLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3pCSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDbEIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlCLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7O0FBRWpDLGFBQVcsRUFBRSxhQUFhOztBQUUxQixRQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFeEMsVUFBUSxFQUFFLGtCQUFVLEtBQUssRUFBRTtBQUN6QixRQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNyQyxRQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEUsUUFBSSxVQUFVLEtBQUssUUFBUSxFQUFFO0FBQzNCLFVBQUksV0FBVyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RSxpQkFBVyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNwQyxVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM1RDtHQUNGOztBQUVELFFBQU0sRUFBRSxrQkFBWTtBQUNsQixXQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0dBQ2hDOztBQUVELGVBQWEsRUFBRSx5QkFBWTtBQUN6QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7O0FBRXZDLFFBQUksZ0JBQWdCLENBQUM7O0FBRXJCLFFBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxlQUFlLEVBQUU7QUFDaEUsc0JBQWdCLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNoRSxNQUFNO0FBQ0wsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUUvRSxhQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLE1BQU0sRUFBRSxDQUFDLEVBQUU7QUFDekMsZUFBTztBQUNMLHFCQUFXLEVBQUUsU0FBUyxHQUFHLENBQUM7QUFDMUIsZUFBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO0FBQ25CLGVBQUssRUFBRSxNQUFNLENBQUMsS0FBSztTQUNwQixDQUFDO09BQ0gsQ0FBQyxDQUFDOztBQUVILFVBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsTUFBTSxFQUFFO0FBQ2xELGVBQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUM7T0FDL0IsQ0FBQyxDQUFDOztBQUVILFVBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTs7QUFFN0IsWUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLGVBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9CO0FBQ0QsbUJBQVcsR0FBRztBQUNaLHFCQUFXLEVBQUUsUUFBUTtBQUNyQixlQUFLLEVBQUUsS0FBSztBQUNaLGVBQUssRUFBRSxLQUFLO1NBQ2IsQ0FBQztBQUNGLGVBQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUN6Qzs7QUFFRCxzQkFBZ0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzFCLGlCQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2pDLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsYUFBSyxFQUFFLFdBQVcsQ0FBQyxXQUFXO0FBQzlCLGVBQU8sRUFBRSxJQUFJLENBQUMsYUFBYTtBQUMzQixjQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVk7T0FDMUIsRUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUMvQixlQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDZCxhQUFHLEVBQUUsQ0FBQztBQUNOLGVBQUssRUFBRSxNQUFNLENBQUMsV0FBVztTQUMxQixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNsQixDQUFDLENBQ0gsQ0FBQztLQUNIOztBQUVELFdBQU8sZ0JBQWdCLENBQUM7R0FDekI7Q0FDQSxDQUFDLENBQUM7Ozs7OztBQ3pGSCxZQUFZLENBQUM7O0FBRWIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7O0FBSTlCLElBQUksa0JBQWtCLEdBQUcsS0FBTSxDQUFDOzs7QUFHaEMsSUFBSSxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7OztBQUduQyxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUU7QUFDM0IsU0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUM3Qzs7QUFFRCxTQUFTLGVBQWUsQ0FBQyxjQUFjLEVBQUU7QUFDdkMsTUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLGdCQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsTUFBTSxFQUFFO0FBQ3ZDLFFBQUksR0FBRyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkMsV0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7R0FDN0IsQ0FBQyxDQUFDO0FBQ0gsU0FBTyxPQUFPLENBQUM7Q0FDaEI7Ozs7Ozs7O0FBUUQsU0FBUyxhQUFhLENBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRTtBQUMvQyxNQUFJLFlBQVksR0FBRyxrQkFBa0IsQ0FBQzs7O0FBR3RDLE1BQUksT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Ozs7O0FBTWpCLE1BQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN0QixNQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRXRCLFdBQVMsVUFBVSxDQUFDLFlBQVksRUFBRTtBQUNoQyxXQUFPLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUV4QyxVQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUNqRCxVQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNyQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLGtCQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLGtCQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQzFCLENBQUMsQ0FBQztHQUNKOztBQUVELFlBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFM0IsU0FBTztBQUNMLHNCQUFrQixFQUFFLGtCQUFrQjs7QUFFdEMsY0FBVSxFQUFFLFVBQVU7Ozs7OztBQU10QixhQUFTLEVBQUUsbUJBQVUsR0FBRyxFQUFFO0FBQ3hCLFNBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsVUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN0QixZQUFJLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDL0Msb0JBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDekIsb0JBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7T0FDMUI7QUFDRCxhQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMxQjs7Ozs7O0FBTUQsZUFBVyxFQUFFLHFCQUFVLEtBQUssRUFBRTtBQUM1QixhQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUEsVUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFO0FBQzFELFdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQzVCLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNmOzs7Ozs7QUFNRCxlQUFXLEVBQUUscUJBQVUsWUFBWSxFQUFFO0FBQ25DLGFBQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDeEUsWUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLGVBQU8sSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7T0FDMUIsQ0FBQyxDQUFDO0tBQ0o7Ozs7OztBQU1ELGNBQVUsRUFBRSxvQkFBVSxJQUFJLEVBQUU7QUFDMUIsVUFBSSxHQUFHLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMzQjs7Ozs7O0FBTUQsVUFBTSxFQUFFLGdCQUFVLEtBQUssRUFBRTtBQUN2QixhQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUEsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFO0FBQy9ELFlBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkQsV0FBRyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLGVBQU8sOEJBQTRCLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztPQUN6RCxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDZjs7Ozs7O0FBTUQsWUFBUSxFQUFFLGtCQUFVLEdBQUcsRUFBRTtBQUN2QixTQUFHLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFVBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixVQUFJLENBQUMsS0FBSyxFQUFFOzs7QUFHVixhQUFLLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7T0FDMUM7QUFDRCxhQUFPLEtBQUssQ0FBQztLQUNkO0dBQ0YsQ0FBQztDQUNIOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ3BJL0IsWUFBWSxDQUFDOztBQUViLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ2xCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFOUIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSxFQUFFOztBQUVqQyxNQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV6QyxTQUFPOzs7O0FBSUwsd0JBQW9CLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQzs7QUFFaEYsd0JBQW9CLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQzs7QUFFaEYsa0NBQThCLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsd0NBQXdDLENBQUMsQ0FBQzs7QUFFdEcsd0JBQW9CLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQzs7QUFFaEYsOEJBQTBCLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQzs7QUFFN0YseUJBQXFCLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQzs7QUFFbEYsK0JBQTJCLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQzs7QUFFL0YsaUNBQTZCLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQzs7OztBQUluRyw0QkFBd0IsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOztBQUUxRix1QkFBbUIsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztBQUU5RSwrQkFBMkIsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDOztBQUUvRix3QkFBb0IsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDOztBQUVoRixzQkFBa0IsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztBQUU1RSw4QkFBMEIsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDOztBQUV2RixzQkFBa0IsRUFBRSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOzs7O0FBSzVFLHVCQUFtQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7O0FBRS9FLHVCQUFtQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7O0FBRS9FLHNCQUFrQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0FBRTdFLHlCQUFxQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0FBRW5GLGdDQUE0QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7O0FBRWxHLDhCQUEwQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7O0FBRTlGLGtDQUE4QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7O0FBRXZHLGdDQUE0QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7O0FBRW5HLDJCQUF1QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7O0FBRXhGLHNDQUFrQyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7O0FBRS9HLHlCQUFxQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7O0FBRXBGLDRCQUF3QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7O0FBRTFGLGlDQUE2QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7O0FBRXJHLDhCQUEwQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7O0FBRS9GLCtCQUEyQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7O0FBRWhHLG1DQUErQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7O0FBRXpHLGlDQUE2QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7O0FBRXJHLCtCQUEyQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7O0FBRWpHLDRCQUF3QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7O0FBRTFGLDZCQUF5QixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7O0FBRTVGLG1DQUErQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7O0FBRXpHLHdCQUFvQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7O0FBRWpGLDhCQUEwQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7Ozs7QUFLOUYsNkJBQXlCLEVBQUUscUNBQStCO0FBQ3hELGFBQU8sRUFBRSxDQUFDO0tBQ1g7O0FBRUQsNkJBQXlCLEVBQUUscUNBQStCO0FBQ3hELGFBQU8sRUFBRSxDQUFDO0tBQ1g7O0FBRUQsNEJBQXdCLEVBQUUsb0NBQStCO0FBQ3ZELGFBQU8sRUFBRSxDQUFDO0tBQ1g7O0FBRUQsOEJBQTBCLEVBQUUsc0NBQStCO0FBQ3pELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7O0FBRUQsNkJBQXlCLEVBQUUsVUFBVSxDQUFDLDJCQUEyQixDQUFDOztBQUVsRSx1Q0FBbUMsRUFBRSxVQUFVLENBQUMsMkJBQTJCLENBQUM7O0FBRTVFLDZCQUF5QixFQUFFLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQzs7QUFFbEUsMkJBQXVCLEVBQUUsVUFBVSxDQUFDLDJCQUEyQixDQUFDOztBQUVoRSxvQ0FBZ0MsRUFBRSxVQUFVLENBQUMsMEJBQTBCLENBQUM7O0FBRXhFLHNDQUFrQyxFQUFFLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQzs7OztBQUs1RSxzQkFBa0IsRUFBRSw0QkFBVSxhQUFhLEVBQUUsS0FBSyxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNyQixlQUFPLEtBQUssQ0FBQztPQUNkO0FBQ0QsVUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDMUMsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM5Qjs7QUFFRCxzQkFBa0IsRUFBRSw0QkFBVSxhQUFhLEVBQUUsS0FBSyxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLGVBQU8sRUFBRSxDQUFDO09BQ1g7QUFDRCxhQUFPLEtBQUssQ0FBQztLQUNkOztBQUVELHFCQUFpQixFQUFFLDJCQUFVLGFBQWEsRUFBRSxLQUFLLEVBQUU7QUFDakQsVUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDckIsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ2hCO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDs7QUFFRCx1QkFBbUIsRUFBRSw2QkFBVSxhQUFhLEVBQUUsS0FBSyxFQUFFO0FBQ25ELGFBQU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNDOztBQUVELHNCQUFrQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQzs7QUFFcEQsZ0NBQTRCLEVBQUUsVUFBVSxDQUFDLG9CQUFvQixDQUFDOztBQUU5RCxzQkFBa0IsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUM7O0FBRXBELG9CQUFnQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQzs7QUFFbEQsNkJBQXlCLEVBQUUsVUFBVSxDQUFDLG1CQUFtQixDQUFDOztBQUUxRCwrQkFBMkIsRUFBRSxVQUFVLENBQUMscUJBQXFCLENBQUM7Ozs7QUFLOUQsMkJBQXVCLEVBQUUsaUNBQVUsS0FBSyxFQUFFOztBQUV4QyxhQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsU0FBUyxFQUFFLENBQUMsRUFBRTtBQUM3QyxZQUFJLGtCQUFrQixHQUFHLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7O0FBRTdFLFlBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7QUFDOUMsdUJBQWEsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVM7U0FDM0UsQ0FBQyxDQUFDOztBQUVILGVBQU8sVUFBVSxDQUFDO09BQ25CLENBQUMsQ0FBQztLQUNKOztBQUVELDRCQUF3QixFQUFFLGtDQUFVLEtBQUssRUFBRTs7QUFFekMsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQ3BELFlBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXBGLFlBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7QUFDOUMsdUJBQWEsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1NBQ3BGLENBQUMsQ0FBQzs7QUFFSCxlQUFPLFVBQVUsQ0FBQztPQUNuQixDQUFDLENBQUM7S0FDSjs7O0FBR0QscUJBQWlCLEVBQUUsMkJBQVUsSUFBSSxFQUFFOztBQUVqQyxhQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBQ3ZEOzs7QUFHRCxpQkFBYSxFQUFFLHVCQUFVLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFOztBQUU5QyxVQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUNqQixhQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7T0FDL0M7O0FBRUQsVUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWhDLFVBQUksTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxFQUFFO0FBQ25DLGVBQU8sTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztPQUN6RDs7QUFFRCxVQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDdEIsWUFBSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDdkMsaUJBQU8sTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3pEO09BQ0Y7O0FBRUQsWUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNuRDs7O0FBR0Qsc0JBQWtCLEVBQUUsNEJBQVUsS0FBSyxFQUFFOztBQUVuQyxVQUFJLElBQUksR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFN0MsVUFBSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbEMsZUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztPQUMxQzs7QUFFRCxhQUFPLE1BQU0sQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3BEOzs7QUFHRCwyQkFBdUIsRUFBRSxpQ0FBVSxTQUFTLEVBQUU7O0FBRTVDLFVBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7O0FBRTVCLFVBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTFDLGFBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUMsRUFDbEMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQ3RHLENBQUM7S0FDSDs7O0FBR0QsbUJBQWUsRUFBRSx5QkFBVSxTQUFTLEVBQUU7O0FBRXBDLFVBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDOztBQUU3QyxVQUFJLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsRUFBRTtBQUNyQyxlQUFPLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNyRDs7QUFFRCxhQUFPLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUNsQzs7O0FBR0Qsd0JBQW9CLEVBQUUsOEJBQVUsU0FBUyxFQUFFOztBQUV6QyxhQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDMUM7OztBQUdELGVBQVcsRUFBRSxxQkFBVSxJQUFJLEVBQUU7QUFDM0IsYUFBTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pDOzs7O0FBSUQsY0FBVSxFQUFFLFFBQVE7O0FBRXBCLGNBQVUsRUFBRSxTQUFTOztBQUVyQix3QkFBb0IsRUFBRSxZQUFZOztBQUVsQywwQkFBc0IsRUFBRSxnQ0FBVSxhQUFhLEVBQUU7QUFDL0MsVUFBSSxhQUFhLENBQUMsY0FBYyxFQUFFO0FBQ2hDLGVBQU8sWUFBWSxDQUFDO09BQ3JCLE1BQU0sSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ2hDLGVBQU8sUUFBUSxDQUFDO09BQ2pCO0FBQ0QsYUFBTyxrQkFBa0IsQ0FBQztLQUMzQjs7QUFFRCxnQkFBWSxFQUFFLHNCQUFVLGFBQWEsRUFBRTs7QUFFckMsVUFBSSxhQUFhLENBQUMsY0FBYyxFQUFFO0FBQ2hDLGVBQU8sWUFBWSxDQUFDO09BQ3JCLE1BQU0sSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO0FBQ2hDLGVBQU8sUUFBUSxDQUFDO09BQ2pCLE1BQU0sSUFBSSxNQUFNLENBQUMseUJBQXlCLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDMUQsZUFBTyxrQkFBa0IsQ0FBQztPQUMzQjtBQUNELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOztBQUVELGNBQVUsRUFBRSxVQUFVLENBQUMsY0FBYyxDQUFDOztBQUV0QyxpQkFBYSxFQUFFLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQzs7QUFFbkQsYUFBUyxFQUFFLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQzs7QUFFL0MsY0FBVSxFQUFFLE9BQU87O0FBRW5CLHNCQUFrQixFQUFFLGVBQWU7O0FBRW5DLGtCQUFjLEVBQUUsUUFBUTs7QUFFeEIsa0JBQWMsRUFBRSxpQkFBaUI7Ozs7OztBQU1qQyxxQkFBaUIsRUFBRSwyQkFBVSxLQUFLLEVBQUUsWUFBWSxFQUFFOztBQUVoRCxVQUFJLFlBQVksRUFBRTtBQUNoQixZQUFJLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0IsWUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO0FBQ2xCLGlCQUFPLFNBQVMsQ0FBQztTQUNsQjtPQUNGOztBQUVELFVBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3ZDLFlBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLFlBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsRCxtQkFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLFVBQVUsRUFBRTtBQUN4QyxjQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2hDLGlCQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7V0FDNUU7U0FDRixDQUFDLENBQUM7QUFDSCxlQUFPLEtBQUssQ0FBQztPQUNkLE1BQU07QUFDTCxlQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7T0FDcEI7S0FDRjs7O0FBR0QsaUJBQWEsRUFBRSx5QkFBOEIsRUFDNUM7OztBQUdELGFBQVMsRUFBRSxxQkFBdUIsRUFDakM7Ozs7QUFJRCxzQkFBa0IsRUFBRSw0QkFBVSxjQUFjLEVBQUU7QUFDNUMsYUFBTztBQUNMLFlBQUksRUFBRSxRQUFRO0FBQ2QsYUFBSyxFQUFFLElBQUk7QUFDWCxjQUFNLEVBQUUsY0FBYztPQUN2QixDQUFDO0tBQ0g7OztBQUdELG1CQUFlLEVBQUUseUJBQVUsS0FBSyxFQUFFOztBQUVoQyxVQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxJQUFJLEtBQUssQ0FBQyxjQUFjLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQy9GLFVBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRXhCLFVBQUksQ0FBQyxhQUFhLEVBQUU7QUFDbEIscUJBQWEsR0FBRyxNQUFNLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDNUQ7O0FBRUQsVUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzVCLHFCQUFhLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO09BQzFEOztBQUVELFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7QUFDM0UsVUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsRUFBRTtBQUN6QyxhQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3hELE1BQU07QUFDTCxhQUFLLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUN4RDs7QUFFRCxZQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuQyxZQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV4QixVQUFJLEtBQUssS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3pFLGFBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO09BQy9DOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7Ozs7QUFJRCxtQkFBZSxFQUFFLHlCQUFVLEtBQUssRUFBRSxZQUFZLEVBQUU7O0FBRTlDLFVBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTFDLGFBQU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztLQUN0RDs7QUFFRCxxQkFBaUIsRUFBRSwyQkFBVSxLQUFLLEVBQUU7O0FBRWxDLFVBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsWUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDN0MsWUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxZQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzFCLGdCQUFNLENBQUMsSUFBSSxDQUFDO0FBQ1YsZ0JBQUksRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztBQUNsQyxrQkFBTSxFQUFFLFdBQVc7V0FDcEIsQ0FBQyxDQUFDO1NBQ0o7T0FDRixDQUFDLENBQUM7O0FBRUgsYUFBTyxNQUFNLENBQUM7S0FDZjs7QUFFRCxvQkFBZ0IsRUFBRSwwQkFBVSxLQUFLLEVBQUU7O0FBRWpDLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFFbkIsWUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxLQUFLLEVBQUU7QUFDN0MsWUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDeEMsaUJBQU8sR0FBRyxLQUFLLENBQUM7QUFDaEIsaUJBQU8sS0FBSyxDQUFDO1NBQ2Q7T0FDRixDQUFDLENBQUM7O0FBRUgsYUFBTyxPQUFPLENBQUM7S0FDaEI7O0FBRUQsaUJBQWEsRUFBRSx1QkFBVSxLQUFLLEVBQUUsTUFBTSxFQUFFOztBQUV0QyxVQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQ25ELFlBQUksTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNqQyxnQkFBTSxDQUFDLElBQUksQ0FBQztBQUNWLGdCQUFJLEVBQUUsVUFBVTtXQUNqQixDQUFDLENBQUM7U0FDSjtPQUNGO0tBQ0Y7OztBQUdELHFCQUFpQixFQUFFLDJCQUFVLEtBQUssRUFBRTs7QUFFbEMsVUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0MsVUFBSSxNQUFNLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEVBQUU7QUFDM0MsZUFBTyxNQUFNLENBQUMsb0JBQW9CLEdBQUcsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDdkQ7O0FBRUQsYUFBTyxNQUFNLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsVUFBVSxFQUFFLENBQUMsRUFBRTtBQUN6RSxlQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7QUFDcEMsdUJBQWEsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1NBQ2xHLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7QUFHRCxvQkFBZ0IsRUFBRSwwQkFBVSxXQUFXLEVBQUUsT0FBTyxFQUFFOztBQUVoRCxVQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDOztBQUUvQixVQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFO0FBQ25ELFdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxVQUFVO0FBQ3JFLHdCQUFnQixFQUFFLE9BQU8sQ0FBQyxhQUFhO09BQ3hDLENBQUMsQ0FBQzs7QUFFSCxVQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUN0RCxrQkFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDMUUsTUFBTTtBQUNMLGtCQUFVLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7T0FDckU7O0FBRUQsWUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFN0IsYUFBTyxVQUFVLENBQUM7S0FDbkI7OztBQUdELDRCQUF3QixFQUFFLGtDQUFVLFdBQVcsRUFBRSxjQUFjLEVBQUU7O0FBRS9ELFVBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVyRixVQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7O0FBRzdELFVBQUksR0FBRyxHQUFHLGlCQUFpQixDQUFDOztBQUU1QixVQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFOztBQUVoQyxXQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7T0FDaEM7OztBQUdELFVBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNuQixVQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2pDLGtCQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO09BQ3BEOztBQUVELFVBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUU7QUFDcEQscUJBQWEsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVE7T0FDckYsQ0FBQyxDQUFDOztBQUVILGNBQVEsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWhELGFBQU8sUUFBUSxDQUFDO0tBQ2pCOzs7QUFHRCxnQ0FBNEIsRUFBRSxzQ0FBVSxLQUFLLEVBQUU7O0FBRTdDLFVBQUksS0FBSyxHQUFHO0FBQ1YsWUFBSSxFQUFFLE1BQU07T0FDYixDQUFDO0FBQ0YsVUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3JCLGFBQUssR0FBRztBQUNOLGNBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQztPQUNILE1BQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzVCLGFBQUssR0FBRztBQUNOLGNBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQztPQUNILE1BQU0sSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzdCLGFBQUssR0FBRztBQUNOLGNBQUksRUFBRSxTQUFTO1NBQ2hCLENBQUM7T0FDSCxNQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMzQixZQUFJLGVBQWUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsVUFBVSxFQUFFLENBQUMsRUFBRTtBQUN2RCxjQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsNEJBQTRCLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakUsb0JBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLGlCQUFPLFVBQVUsQ0FBQztTQUNuQixDQUFDLENBQUM7QUFDSCxhQUFLLEdBQUc7QUFDTixjQUFJLEVBQUUsT0FBTztBQUNiLGdCQUFNLEVBQUUsZUFBZTtTQUN4QixDQUFDO09BQ0gsTUFBTSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDNUIsWUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUMzRCxjQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakUsb0JBQVUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3JCLG9CQUFVLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEMsaUJBQU8sVUFBVSxDQUFDO1NBQ25CLENBQUMsQ0FBQztBQUNILGFBQUssR0FBRztBQUNOLGNBQUksRUFBRSxRQUFRO0FBQ2QsZ0JBQU0sRUFBRSxnQkFBZ0I7U0FDekIsQ0FBQztPQUNILE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzFCLGFBQUssR0FBRztBQUNOLGNBQUksRUFBRSxNQUFNO1NBQ2IsQ0FBQztPQUNIO0FBQ0QsYUFBTyxLQUFLLENBQUM7S0FDZDs7OztBQUlELHNCQUFrQixFQUFFLDRCQUFVLGFBQWEsRUFBRTs7QUFFM0MsVUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVuRSxVQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUNoQyxlQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDckM7O0FBRUQsVUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFbkQsVUFBSSxNQUFNLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLEVBQUU7QUFDNUMsZUFBTyxNQUFNLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7T0FDaEU7O0FBRUQsYUFBTyxFQUFFLENBQUM7S0FDWDs7Ozs7QUFLRCxZQUFRLEVBQUUsa0JBQVUsYUFBYSxFQUFFLEtBQUssRUFBRTtBQUN4QyxhQUFPLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2hEOzs7QUFHRCxlQUFXLEVBQUUscUJBQVUsS0FBSyxFQUFFLEtBQUssRUFBRTs7QUFFbkMsVUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFM0MsVUFBSSxNQUFNLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxFQUFFO0FBQ3JDLGVBQU8sTUFBTSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDeEQ7O0FBRUQsYUFBTyxLQUFLLENBQUM7S0FDZDs7OztBQUlELDhCQUEwQixFQUFFLG9DQUFVLEtBQUssRUFBRSxVQUFVLEVBQUU7O0FBRXZELFVBQUksYUFBYSxDQUFDOztBQUVsQixVQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNELG1CQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxpQkFBaUIsRUFBRTtBQUNsRSxlQUFPLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQztPQUMxRSxDQUFDLENBQUM7O0FBRUgsVUFBSSxhQUFhLEVBQUU7QUFDakIsZUFBTyxhQUFhLENBQUM7T0FDdEIsTUFBTTtBQUNMLGVBQU8sTUFBTSxDQUFDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ3hEO0tBQ0Y7OztBQUdELCtCQUEyQixFQUFFLHFDQUFVLGFBQWEsRUFBRSxLQUFLLEVBQUU7QUFDM0QsVUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQztBQUNoQyxVQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFO0FBQzNDLGVBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDMUMsQ0FBQyxDQUFDO0tBQ0o7Ozs7O0FBS0QseUJBQXFCLEVBQUUsK0JBQVUsYUFBYSxFQUFFOztBQUU5QyxVQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUM7O0FBRXJFLFVBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUM7O0FBRXhDLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3ZCLGlCQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQzFDLE1BQU07QUFDTCxpQkFBTyxLQUFLLENBQUM7U0FDZDtPQUNGOztBQUVELFVBQUksYUFBYSxDQUFDLElBQUksRUFBRTtBQUN0QixnQkFBUSxHQUFHLE9BQU8sQ0FBQztPQUNwQjs7QUFFRCxhQUFPLFFBQVEsQ0FBQztLQUNqQjs7O0FBR0QsNkJBQXlCLEVBQUUsbUNBQVUsYUFBYSxFQUFFOztBQUVsRCxhQUFPLGFBQWEsV0FBUSxDQUFDO0tBQzlCOzs7O0FBSUQsc0JBQWtCLEVBQUUsNEJBQVUsYUFBYSxFQUFFOzs7O0FBSTNDLFVBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFbkUsVUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUVyRCxVQUFJLEtBQUssQ0FBQzs7QUFFVixVQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3hELGVBQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM5QixNQUFNO0FBQ0wsZUFBTyxNQUFNLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7T0FDakQ7O0FBRUQsYUFBTyxLQUFLLENBQUM7S0FDZDs7O0FBR0Qsc0JBQWtCLEVBQUUsNEJBQVUsYUFBYSxFQUFFO0FBQzNDLGFBQU8sYUFBYSxDQUFDLEtBQUssQ0FBQztLQUM1Qjs7O0FBR0QsNkJBQXlCLEVBQUUsbUNBQVUsYUFBYSxFQUFFO0FBQ2xELGFBQU8sYUFBYSxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsY0FBYyxJQUN6RCxhQUFhLENBQUMsSUFBSSxLQUFLLG9CQUFvQixJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUM7S0FDbEc7Ozs7O0FBS0Qsa0JBQWMsRUFBRSx3QkFBVSxLQUFLLEVBQUU7O0FBRS9CLFVBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsVUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2hCLGtCQUFVLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbEQ7O0FBRUQsYUFBTyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEVBQUU7QUFDeEQsZUFBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQztPQUMxQyxDQUFDLENBQUM7S0FDSjs7O0FBR0Qsa0JBQWMsRUFBRSx3QkFBVSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ3RDLGFBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7S0FDNUM7O0FBRUQsaUJBQWEsRUFBRSxVQUFVLENBQUMsdUJBQXVCLENBQUM7OztBQUdsRCxnQkFBWSxFQUFFLHNCQUFVLEtBQUssRUFBRTs7QUFFN0IsYUFBTyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9DOzs7QUFHRCxzQkFBa0IsRUFBRSw0QkFBVSxLQUFLLEVBQUU7O0FBRW5DLGFBQU8sTUFBTSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNyRDs7O0FBR0QsdUJBQW1CLEVBQUUsNkJBQVUsS0FBSyxFQUFFOztBQUVwQyxVQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV6QyxVQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLGVBQU8sQ0FBQztBQUNOLGVBQUssRUFBRSxLQUFLO0FBQ1osZUFBSyxFQUFFLElBQUk7U0FDWixFQUFFO0FBQ0QsZUFBSyxFQUFFLElBQUk7QUFDWCxlQUFLLEVBQUUsS0FBSztTQUNiLENBQUMsQ0FBQztPQUNKOztBQUVELGFBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUNuQyxZQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzdCLGlCQUFPLE1BQU0sQ0FBQztTQUNmO0FBQ0QsZUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUU7QUFDMUIsZUFBSyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQ2pELENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7QUFHRCx1QkFBbUIsRUFBRSw2QkFBVSxLQUFLLEVBQUU7O0FBRXBDLGFBQU8sTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN0RDs7O0FBR0QsY0FBVSxFQUFFLG9CQUFVLEtBQUssRUFBRTtBQUMzQixhQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDcEI7OztBQUdELGlCQUFhLEVBQUUsdUJBQVUsS0FBSyxFQUFFO0FBQzlCLGFBQU8sS0FBSyxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQztLQUN4Rjs7O0FBR0QsbUJBQWUsRUFBRSx5QkFBVSxLQUFLLEVBQUU7QUFDaEMsYUFBTyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7S0FDdEM7OztBQUdELHlCQUFxQixFQUFFLCtCQUFVLEtBQUssRUFBRTs7QUFFdEMsVUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVwRCxVQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUN2RCxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGFBQU8sS0FBSyxDQUFDO0tBQ2Q7OztBQUdELDRCQUF3QixFQUFFLGtDQUFVLEtBQUssRUFBRTtBQUN6QyxhQUFPLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0tBQzNCOzs7O0FBSUQsMkJBQXVCLEVBQUUsaUNBQVUsS0FBSyxFQUFFO0FBQ3hDLFVBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ3JCLGVBQU8sQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO09BQ3pCO0FBQ0QsVUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ2hDLGVBQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDM0I7QUFDRCxhQUFPLEtBQUssQ0FBQyxVQUFVLENBQUM7S0FDekI7O0FBRUQscUJBQWlCLEVBQUUsVUFBVSxDQUFDLDJCQUEyQixDQUFDOzs7QUFHMUQsb0JBQWdCLEVBQUUsMEJBQVUsS0FBSyxFQUFFO0FBQ2pDLGFBQU8sS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO0tBQ3ZDOzs7QUFHRCxzQkFBa0IsRUFBRSw0QkFBVSxLQUFLLEVBQUU7QUFDbkMsYUFBTyxLQUFLLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDN0Q7OztBQUdELGFBQVMsRUFBRSxtQkFBVSxLQUFLLEVBQUU7QUFDMUIsYUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDO0tBQ25COztBQUVELGVBQVcsRUFBRSxxQkFBVSxLQUFLLEVBQUU7O0FBRTVCLFVBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsVUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMzQixjQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztPQUNyQzs7QUFFRCxhQUFPLE1BQU0sQ0FBQztLQUNmOztBQUVELGNBQVUsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUM7Ozs7O0FBSzVDLFlBQVEsRUFBRSxrQkFBUyxRQUFRLEVBQUU7QUFDM0IsY0FBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLGNBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6QyxhQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUNqQyxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ2pDLGVBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3ZELENBQUMsQ0FBQztLQUNKOzs7QUFHRCxvQkFBZ0IsRUFBRSwwQkFBVSxPQUFPLEVBQUU7O0FBRW5DLFVBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixlQUFPLEVBQUUsQ0FBQztPQUNYOzs7QUFHRCxVQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDdkIsZUFBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDOUI7OztBQUdELFVBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDOUMsZUFBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxFQUFFO0FBQ2hELGlCQUFPO0FBQ0wsaUJBQUssRUFBRSxHQUFHO0FBQ1YsaUJBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDO1dBQ3BCLENBQUM7U0FDSCxDQUFDLENBQUM7T0FDSjs7O0FBR0QsYUFBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztBQUczQixhQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0IsYUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLE1BQU0sRUFBRSxDQUFDLEVBQUU7OztBQUduQyxZQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDdEIsaUJBQU8sQ0FBQyxDQUFDLENBQUMsR0FBRztBQUNYLGlCQUFLLEVBQUUsTUFBTTtBQUNiLGlCQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7V0FDL0IsQ0FBQztTQUNIO0FBQ0QsWUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUU7QUFDckIsaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdEQ7T0FDRixDQUFDLENBQUM7O0FBRUgsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztBQUdELDBCQUFzQixFQUFFLGdDQUFVLE9BQU8sRUFBRTtBQUN6QyxVQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzlDLGVBQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUNoRCxpQkFBTztBQUNMLGlCQUFLLEVBQUUsR0FBRztBQUNWLGlCQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUNuQixrQkFBTSxFQUFFLEdBQUc7V0FDWixDQUFDO1NBQ0gsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsYUFBTyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDekM7OztBQUdELHdCQUFvQixFQUFFLDhCQUFVLEtBQUssRUFBRTtBQUNyQyxVQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTs7QUFFdEIsZUFBTyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztPQUM3QjtBQUNELFdBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDNUIsVUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssT0FBTyxFQUFFO0FBQzFFLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7QUFHRCxTQUFLLEVBQUUsZUFBVSxHQUFHLEVBQUU7QUFDcEIsYUFBTyxBQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxFQUFFLEFBQUMsQ0FBQztLQUN6RTs7O0FBR0QsaUJBQWEsRUFBRSx1QkFBVSxHQUFHLEVBQUU7QUFDNUIsV0FBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDbEIsWUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzNCLGlCQUFPLEtBQUssQ0FBQztTQUNkO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOztBQUVELHFCQUFpQixFQUFFLDJCQUFVLE1BQU0sRUFBRTtBQUNuQyxhQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztLQUN0RDtHQUNGLENBQUM7Q0FDSCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDajZCRixZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3BDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFOUIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvQixJQUFJLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztBQUV0RCxJQUFJLFlBQVksR0FBRyx3QkFBWTtBQUM3QixNQUFJLE9BQU8sR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7QUFFakUsU0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUM5QyxRQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDeEIsVUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLFVBQUksVUFBVSxFQUFFO0FBQ2QsU0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDOUI7S0FDRixNQUFNO0FBQ0wsT0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUI7O0FBRUQsV0FBTyxNQUFNLENBQUM7R0FDZixFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ1IsQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxZQUFZLEVBQUUsQ0FBQzs7O0FBR25DLElBQUksdUJBQXVCLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7QUFFOUMsYUFBVyxFQUFFLG9CQUFvQjs7O0FBR2pDLFVBQVEsRUFBRSxrQkFBVSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ2xDLFFBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN4QixhQUFPO0tBQ1I7QUFDRCxRQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pELFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNyQzs7OztBQUlELFVBQVEsRUFBRSxrQkFBVSxJQUFJLEVBQUU7QUFDeEIsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3hCLGFBQU87S0FDUjtBQUNELFFBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekQsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0I7OztBQUdELFFBQU0sRUFBRSxrQkFBWTs7QUFFbEIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7O0FBRS9CLFdBQU8sTUFBTSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzdDO0NBQ0YsQ0FBQyxDQUFDOztBQUVILElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOzs7OztBQUt0RSxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUdqQyxTQUFPLEVBQUU7QUFDUCxnQkFBWSxFQUFFLFlBQVk7QUFDMUIsbUJBQWUsRUFBRTtBQUNmLGtCQUFZLEVBQUUsT0FBTyxDQUFDLDJCQUEyQixDQUFDO0FBQ2xELFdBQUssRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUM7QUFDbkMsWUFBTSxFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQztBQUNyQyxZQUFNLEVBQUUsT0FBTyxDQUFDLG9CQUFvQixDQUFDO0FBQ3JDLFlBQU0sRUFBRSxPQUFPLENBQUMsb0JBQW9CLENBQUM7QUFDckMsZUFBUyxFQUFFLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztLQUM3QztBQUNELFdBQU8sRUFBRTtBQUNQLGVBQVMsRUFBRSxPQUFPLENBQUMscUJBQXFCLENBQUM7QUFDekMsVUFBSSxFQUFFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztBQUMvQixlQUFTLEVBQUUsT0FBTyxDQUFDLHFCQUFxQixDQUFDO0FBQ3pDLG9CQUFjLEVBQUUsT0FBTyxDQUFDLDJCQUEyQixDQUFDO0tBQ3JEO0FBQ0QsU0FBSyxFQUFFLEtBQUs7R0FDYjs7QUFFRCxhQUFXLEVBQUUsVUFBVTs7OztBQUl2QixpQkFBZSxFQUFFLDJCQUFZO0FBQzNCLFdBQU87QUFDTCxrQkFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM5QyxXQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztLQUNwRixDQUFDO0dBQ0g7Ozs7QUFJRCwyQkFBeUIsRUFBRSxtQ0FBVSxRQUFRLEVBQUU7QUFDN0MsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRTtBQUMzQixVQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDbEMsWUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGVBQUssRUFBRSxRQUFRLENBQUMsS0FBSztTQUN0QixDQUFDLENBQUM7T0FDSjtLQUNGO0dBQ0Y7Ozs7QUFJRCxVQUFRLEVBQUUsa0JBQVUsUUFBUSxFQUFFLElBQUksRUFBRTtBQUNsQyxRQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7QUFDNUIsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGFBQUssRUFBRSxRQUFRO09BQ2hCLENBQUMsQ0FBQztLQUNKO0FBQ0QsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3hCLGFBQU87S0FDUjtBQUNELFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNyQzs7OztBQUlELFVBQVEsRUFBRSxrQkFBVSxJQUFJLEVBQUU7QUFDeEIsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjtBQUNELFFBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdDLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEVBQUU7QUFDN0IsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakM7R0FDRjs7O0FBR0QsUUFBTSxFQUFFLGtCQUFZOztBQUVsQixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUM7QUFDaEQsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTdCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUU7QUFDM0IsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ3hCLGVBQU8sQ0FBQyxHQUFHLENBQUMsOERBQThELENBQUMsQ0FBQztPQUM3RTtLQUNGOztBQUVELFFBQUksS0FBSyxHQUFHO0FBQ1YsWUFBTSxFQUFFLE1BQU07OztBQUdkLG1CQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO0FBQy9CLG9CQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQ2pDLFdBQUssRUFBRSxLQUFLO0FBQ1osY0FBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0FBQ3ZCLGNBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtLQUN4QixDQUFDOztBQUVGLEtBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLFNBQVMsRUFBRSxHQUFHLEVBQUU7QUFDM0MsVUFBSSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFO0FBQ25CLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7T0FDeEI7S0FDRixDQUFDLENBQUM7O0FBRUgsV0FBTyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNsQzs7Q0FFRixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUpILFlBQVksQ0FBQzs7QUFFYixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTlCLElBQUksV0FBVzs7Ozs7Ozs7OztHQUFHLFVBQVUsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUN6QyxNQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssTUFBTSxFQUFFO0FBQy9CLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO0FBQzdCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxTQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQzlDLENBQUEsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLGVBQWEsRUFBRSx1QkFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3hDLFFBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtBQUN0QixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO0FBQ2hDLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDRCxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELGNBQVksRUFBRSxzQkFBVSxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ3ZDLFdBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztHQUM3Qzs7QUFFRCxtQkFBaUIsRUFBRSw2QkFBVztBQUM1QixLQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBLFVBQVUsS0FBSyxFQUFFLEdBQUcsRUFBRTtBQUN0RCxVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDakM7S0FDRixDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDZjs7QUFFRCxpQkFBZSxFQUFFLHlCQUFVLEtBQUssRUFBRTtBQUNoQyxLQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBLFVBQVUsS0FBSyxFQUFFLEdBQUcsRUFBRTtBQUN0RCxVQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM5QyxZQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUU7QUFDakUsZUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBLFVBQVUsRUFBRSxFQUFFO0FBQzFCLGNBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQ3RCLENBQUEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNmO09BQ0Y7QUFDRCxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUNsQyxDQUFBLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7R0FDZjs7QUFFRCxtQkFBaUIsRUFBRSwyQkFBVSxHQUFHLEVBQUUsRUFBRSxFQUFFO0FBQ3BDLFFBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbkMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNyQztBQUNELFFBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDekM7O0FBRUQsbUJBQWlCLEVBQUUsNkJBQVk7QUFDN0IsUUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUMzQixZQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQy9ELFlBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUUzRCxRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztHQUMxQjs7QUFFRCxzQkFBb0IsRUFBRSxnQ0FBWTtBQUNoQyxRQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDOztBQUUvQixZQUFRLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM5RCxZQUFRLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0dBQ25FO0NBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7O0FDaEdGLFlBQVksQ0FBQzs7QUFFYixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRTlCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7OztBQUdmLGVBQWEsRUFBRSx1QkFBVSxLQUFLLEVBQUU7QUFDOUIsUUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3pCLFdBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7S0FDeEIsQ0FBQyxDQUFDO0dBQ0o7OztBQUdELGVBQWEsRUFBRSx1QkFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3BDLFFBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNsQzs7O0FBR0QsZUFBYSxFQUFFLHVCQUFVLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDdEMsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixVQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzlCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzNCO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFLHlCQUFZO0FBQ3pCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDN0I7O0FBRUQsY0FBWSxFQUFFLHdCQUFZO0FBQ3hCLFFBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDNUI7OztBQUdELGdCQUFjLEVBQUUsd0JBQVUsSUFBSSxFQUFFO0FBQzlCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDdkIsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0I7R0FDRjs7O0FBR0Qsa0JBQWdCLEVBQUUsNEJBQVk7QUFDNUIsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNyRDtDQUNGLENBQUM7Ozs7Ozs7Ozs7OztBQy9DRixZQUFZLENBQUM7O0FBRWIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU5QixNQUFNLENBQUMsT0FBTyxHQUFHOzs7QUFHZixrQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixXQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNoRDs7O0FBR0QsZUFBYSxFQUFFLHVCQUFVLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDdEMsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixVQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzlCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzNCO0dBQ0Y7OztBQUdELGdCQUFjLEVBQUUsd0JBQVUsSUFBSSxFQUFFO0FBQzlCLFFBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDdkIsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0I7R0FDRjs7QUFFRCxlQUFhLEVBQUUseUJBQVk7QUFDekIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUM3Qjs7QUFFRCxjQUFZLEVBQUUsd0JBQVk7QUFDeEIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1QjtDQUNGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNURixZQUFZLENBQUM7O0FBRWIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUVYLElBQUksc0JBQXNCLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLElBQUksMkJBQTJCLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDOztBQUUvQixJQUFJLGFBQWEsR0FBRyx5QkFBWTtBQUM5QixRQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFO0FBQ3pELFFBQUksT0FBTyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFDLFFBQUksT0FBTyxDQUFDLFdBQVcsS0FBSyxPQUFPLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLFlBQVksS0FBSyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7QUFDNUcsYUFBTyxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDaEQsYUFBTyxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDbEQsVUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO0FBQ3hDLGNBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUU7QUFDbEMsZUFBTyxFQUFFLENBQUM7T0FDWCxDQUFDLENBQUM7S0FDSjtHQUNGLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDVCxDQUFDOztBQUVGLElBQUksd0JBQXdCLEdBQUcsa0NBQVUsT0FBTyxFQUFFLEVBQUUsRUFBRTtBQUNwRCxNQUFJLG1CQUFtQixLQUFLLElBQUksRUFBRTtBQUNoQyx1QkFBbUIsR0FBRyxXQUFXLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQ3ZEO0FBQ0QsTUFBSSxFQUFFLFlBQVksSUFBSSxPQUFPLENBQUEsQUFBQyxFQUFFO0FBQzlCLE1BQUUsRUFBRSxDQUFDO0FBQ0wsV0FBTyxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDaEQsV0FBTyxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7QUFDbEQsV0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDeEIsK0JBQTJCLEVBQUUsQ0FBQztBQUM5QiwwQkFBc0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDckMsV0FBTyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztHQUMvQjtBQUNELFNBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDbkMsQ0FBQzs7QUFFRixJQUFJLDRCQUE0QixHQUFHLHNDQUFVLE9BQU8sRUFBRTtBQUNwRCxNQUFJLEVBQUUsWUFBWSxJQUFJLE9BQU8sQ0FBQSxBQUFDLEVBQUU7QUFDOUIsV0FBTztHQUNSO0FBQ0QsTUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUNsQyxTQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDMUIsU0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7QUFDaEMsU0FBTyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4Qyw2QkFBMkIsRUFBRSxDQUFDO0FBQzlCLE1BQUksMkJBQTJCLEdBQUcsQ0FBQyxFQUFFO0FBQ25DLGlCQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNuQyx1QkFBbUIsR0FBRyxJQUFJLENBQUM7R0FDNUI7Q0FDRixDQUFDOztBQUVGLElBQUksUUFBUSxHQUFHLGtCQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDaEMsSUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1QsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLG1CQUFpQixFQUFFLDZCQUFZO0FBQzdCLFFBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixZQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUN4RDtBQUNELFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7R0FDN0I7O0FBRUQsc0JBQW9CLEVBQUUsZ0NBQVk7QUFDaEMsUUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQzNEO0FBQ0QsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQSxVQUFVLEdBQUcsRUFBRTtBQUN6RCxrQ0FBNEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7S0FDM0QsQ0FBQSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ2Y7O0FBRUQsYUFBVyxFQUFFLHFCQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUU7QUFDOUIsUUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNoQyxVQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ3BDO0FBQ0QsNEJBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUNyRjtDQUNGLENBQUM7Ozs7Ozs7OztBQzNHRixZQUFZLENBQUM7O0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLE1BQU0sRUFBRTs7QUFFakMsUUFBTSxDQUFDLE9BQU8sR0FBRzs7QUFFZixxQkFBaUIsRUFBRSw2QkFBWTtBQUM3QixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsY0FBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDeEQ7S0FDRjs7QUFFRCx3QkFBb0IsRUFBRSxnQ0FBWTtBQUNoQyxVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsY0FBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDM0Q7S0FDRjtHQUNGLENBQUM7Q0FDSCxDQUFDOzs7Ozs7Ozs7OztBQ2hCRixZQUFZLENBQUM7O0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGlCQUFlLEVBQUUsMkJBQVc7QUFDMUIsV0FBTyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDO0dBQzdCOztBQUVELFVBQVEsRUFBRSxvQkFBVztBQUNuQixRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUMzRCxRQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUFFO0FBQzVDLFVBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN0QyxZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZDtLQUNGO0FBQ0QsUUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7R0FDdkM7O0FBRUQsU0FBTyxFQUFFLG1CQUFXO0FBQ2xCLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztHQUNuQzs7QUFFRCxTQUFPLEVBQUUsbUJBQVc7QUFDbEIsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0dBQ25DOztBQUVELE1BQUksRUFBRSxnQkFBVztBQUNmLFFBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdEI7O0FBRUQsTUFBSSxFQUFFLGdCQUFXO0FBQ2YsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQ2xCOztBQUVELFdBQVMsRUFBRSxtQkFBUyxNQUFNLEVBQUU7QUFDMUIsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxRQUFJLFFBQVEsQ0FBQzs7QUFFYixRQUFJLE1BQU0sRUFBRTtBQUNWLFVBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDckIsZUFBTztPQUNSO0FBQ0QsY0FBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0QixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7S0FDcEMsTUFBTTtBQUNMLFVBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDckIsZUFBTztPQUNSO0FBQ0QsY0FBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0QixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7S0FDcEM7O0FBRUQsUUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0dBQ3pDO0NBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7QUN4REYsWUFBWSxDQUFDOztBQUViLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7O0FBRzlCLElBQUksU0FBUyxHQUFHOztBQUVkLFNBQVMsRUFBQyxPQUFPLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLEVBQUM7QUFDeEMsUUFBUSxFQUFDLE9BQU8sRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUMsRUFBQztBQUN2QyxVQUFVLEVBQUMsT0FBTyxFQUFFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBQyxFQUFDO0FBQ3pDLGdCQUFnQixFQUFDLE9BQU8sRUFBRSxFQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUMsRUFBQztBQUNoRCxhQUFhLEVBQUMsT0FBTyxFQUFFLEVBQUMsTUFBUSxJQUFJLEVBQUMsRUFBQztBQUN0QyxjQUFjLEVBQUMsT0FBTyxFQUFFLEVBQUMsTUFBUSxJQUFJLEVBQUMsRUFBQztBQUN2Qyx3QkFBd0IsRUFBQyxPQUFPLEVBQUUsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFDLEVBQUM7QUFDekQsV0FBVyxFQUFDLE9BQU8sRUFBRSxFQUFDLDBCQUEwQixFQUFFLElBQUksRUFBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUM7QUFDbkUsY0FBYyxFQUFDLE9BQU8sRUFBRSxFQUFDLDRCQUE0QixFQUFFLElBQUksRUFBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUM7QUFDeEUsZ0JBQWdCLEVBQUMsT0FBTyxFQUFFLEVBQUMsOEJBQThCLEVBQUUsSUFBSSxFQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQztBQUM1RSxtQkFBbUIsRUFBQyxPQUFPLEVBQUUsRUFBQyxnQ0FBZ0MsRUFBRSxJQUFJLEVBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDO0FBQ2pGLGlCQUFpQixFQUFDLE9BQU8sRUFBRSxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUMsRUFBQzs7QUFFbEQsb0JBQW9CLEVBQUMsT0FBTyxFQUFFLEVBQUMsY0FBYyxFQUFFLElBQUksRUFBQyxFQUFDO0FBQ3JELFVBQVUsRUFBQyxPQUFPLEVBQUUsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFDLEVBQUM7QUFDM0MsY0FBYyxFQUFDLE9BQU8sRUFBRSxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUMsRUFBQztBQUMvQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEVBQUMsY0FBYyxFQUFFLElBQUksRUFBQyxFQUFDO0FBQ3pDLGVBQWUsRUFBQyxPQUFPLEVBQUUsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFDLEVBQUM7Q0FDakQsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSxFQUFFOztBQUVqQyxNQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDOztBQUV6QyxTQUFPO0FBQ0wsaUJBQWE7Ozs7Ozs7Ozs7T0FBRSxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFOztBQUU5QyxVQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEMsVUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUUvQixVQUFJLFFBQVEsRUFBRTs7QUFFWixhQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUIsYUFBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5RCxZQUFJLE9BQU8sSUFBSSxRQUFRLEVBQUU7QUFDdkIsZUFBSyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1NBQzlCO09BQ0Y7O0FBRUQsYUFBTyxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM3QyxDQUFBO0dBQ0YsQ0FBQztDQUNILENBQUM7Ozs7Ozs7Ozs7Ozs7QUNsREYsWUFBWSxDQUFDOztBQUViLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFOUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLE1BQU0sRUFBRTs7QUFFakMsTUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQzs7QUFFekMsTUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDOztBQUV4QixTQUFPO0FBQ0wsbUJBQWUsRUFBRSx5QkFBVSxJQUFJLEVBQUUsU0FBUyxFQUFFOztBQUUxQyxVQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN6QixzQkFBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUMzQjs7QUFFRCxvQkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUN4Qzs7O0FBR0QsaUJBQWE7Ozs7Ozs7Ozs7T0FBRSxVQUFVLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFOztBQUU5QyxVQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEMsVUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDeEIsYUFBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxDQUFDO09BQzlEOztBQUVELGFBQU8sYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDN0MsQ0FBQTtHQUNGLENBQUM7Q0FDSCxDQUFDOzs7Ozs7Ozs7Ozs7O0FDakNGLFlBQVksQ0FBQzs7QUFFYixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSxFQUFFOztBQUVqQyxNQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0FBQ3pDLE1BQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7O0FBRWpDLFNBQU87QUFDTCxpQkFBYTs7Ozs7Ozs7OztPQUFFLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRTs7QUFFckMsV0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7QUFFOUIsbUJBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDN0IsQ0FBQTs7QUFFRCxhQUFTOzs7Ozs7Ozs7O09BQUUsVUFBVSxLQUFLLEVBQUU7O0FBRTFCLFVBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtBQUNyQyxhQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO09BQ2hDOztBQUVELGVBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNsQixDQUFBO0dBQ0YsQ0FBQztDQUNILENBQUM7Ozs7Ozs7Ozs7OztBQ3hCRixZQUFZLENBQUM7O0FBRWIsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU5QixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSxFQUFFOztBQUVqQyxNQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDOztBQUVqQyxTQUFPOztBQUVMLHFCQUFpQixFQUFFLDJCQUFVLEtBQUssRUFBRSxJQUFJLEVBQUU7O0FBRXhDLFVBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN6QixlQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUI7O0FBRUQsVUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2hCLGVBQU8sTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDckQ7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7OztBQUlELHdCQUFvQixFQUFFLDhCQUFVLEtBQUssRUFBRSxhQUFhLEVBQUU7O0FBRXBELFVBQUksQ0FBQyxhQUFhLFdBQVEsRUFBRTtBQUMxQixlQUFPLGFBQWEsQ0FBQztPQUN0Qjs7QUFFRCxVQUFJLEdBQUcsR0FBRyxhQUFhLFdBQVEsQ0FBQzs7QUFFaEMsVUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbkIsV0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDYjs7QUFFRCxVQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQ2xDLFlBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckQsWUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGdCQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUM7U0FDckQ7QUFDRCxlQUFPLFFBQVEsQ0FBQztPQUNqQixDQUFDLENBQUM7O0FBRUgsVUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxtQkFBYSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFekMsYUFBTyxhQUFhLENBQUM7S0FDdEI7OztBQUdELGFBQVM7Ozs7Ozs7Ozs7T0FBRSxVQUFVLEtBQUssRUFBRTs7QUFFMUIsVUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRXJDLFVBQUksbUJBQW1CLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDOzs7QUFHakUseUJBQW1CLENBQUMsT0FBTyxDQUFDLFVBQVUsYUFBYSxFQUFFOztBQUVuRCxZQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDN0IsaUJBQU87U0FDUjs7QUFFRCxZQUFJLEdBQUcsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDO0FBQzVCLFlBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUM7O0FBRTFCLFlBQUksYUFBYSxDQUFDLFFBQVEsRUFBRTtBQUMxQix1QkFBYSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1NBQ2hFOztBQUVELFlBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7QUFDckMsbUJBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUM7U0FDaEM7O0FBRUQsWUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUNuQyxtQkFBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQztTQUMvQjtPQUNGLENBQUMsQ0FBQzs7O0FBR0gsVUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2xDLGFBQUssQ0FBQyxNQUFNLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsYUFBYSxFQUFFO0FBQzlELGNBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUM3Qix5QkFBYSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7V0FDaEU7O0FBRUQsaUJBQU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMxRCxDQUFDLENBQUM7O0FBRUgsYUFBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLGFBQWEsRUFBRTtBQUMxRCxpQkFBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7U0FDaEMsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsVUFBSSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7Ozs7QUFJL0QsVUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2pDLGFBQUssQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQVUsaUJBQWlCLEVBQUU7QUFDckUsY0FBSSxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7QUFDakMsNkJBQWlCLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1dBQ3hFOztBQUVELGlCQUFPLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUM5RCxDQUFDLENBQUM7T0FDSjs7QUFFRCxlQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEIsQ0FBQTtHQUNGLENBQUM7Q0FFSCxDQUFDOzs7Ozs7Ozs7Ozs7QUNwSEYsWUFBWSxDQUFDOztBQUViLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFOUIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDOzs7QUFHcEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUM5QixNQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsV0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFO0FBQzdCLGFBQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM3QixDQUFDLENBQUM7R0FDSixNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1QixXQUFPLEdBQUcsQ0FBQztHQUNaLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLFdBQU8sR0FBRyxDQUFDO0dBQ1osTUFBTSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDMUIsUUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsS0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsVUFBVSxLQUFLLEVBQUUsR0FBRyxFQUFFO0FBQ2hDLFVBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ25DLENBQUMsQ0FBQztBQUNILFdBQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTTtBQUNMLFdBQU8sR0FBRyxDQUFDO0dBQ1o7Q0FDRixDQUFDOzs7O0FBSUYsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7OztBQUczQixLQUFLLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQ2hDLE1BQUksQ0FBQyxLQUFLLEVBQUUsRUFBRTtBQUNaLFdBQU8sRUFBRSxDQUFDO0dBQ1g7QUFDRCxNQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDekIscUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDdEQsYUFBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsRCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ2I7QUFDRCxTQUFPLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdCLENBQUM7OztBQUdGLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLFdBQVcsRUFBRSxTQUFTLEVBQUU7QUFDekQsTUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFekQsTUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRTtBQUM1QixhQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQzVDLFdBQU87R0FDUjs7QUFFRCxNQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsWUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztHQUNwRjtBQUNELE1BQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRWhDLFdBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUNuQyxDQUFDOzs7QUFHRixJQUFJLE9BQU8sR0FBRztBQUNaLFVBQVEsRUFBRSxLQUFLO0FBQ2YsV0FBUyxFQUFFLEtBQUs7QUFDaEIsU0FBTyxFQUFFLEtBQUs7QUFDZCxNQUFJLEVBQUUsS0FBSztBQUNYLFVBQVEsRUFBRSxLQUFLO0FBQ2YsV0FBUyxFQUFFLEtBQUs7Q0FDakIsQ0FBQzs7O0FBR0YsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDOztBQUVaLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxFQUFFO0FBQ3BDLElBQUUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0NBQzFCOztBQUVELElBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixTQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN6QixNQUFNLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNwQyxTQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUN6QixNQUFNLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNuQyxTQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztDQUN4QixNQUFNLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNyQyxTQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztDQUMxQixNQUFNLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNsQyxTQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNyQixNQUFNO0FBQ0wsU0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Q0FDMUI7OztBQUdELEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOzs7O0FBSXhCLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUU7QUFDakMsU0FBTyxZQUFZO0FBQ2pCLFdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDMUMsQ0FBQztDQUNILENBQUM7O0FBRUYsS0FBSyxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUMvQixTQUFPLFVBQVUsSUFBSSxFQUFFO0FBQ3JCLFdBQU8sWUFBWTtBQUNqQixhQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3hDLENBQUM7R0FDSCxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQzdCLFNBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQ2pFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gIyBpbmRleFxuXG4vLyBFeHBvcnQgdGhlIEZvcm1hdGljIFJlYWN0IGNsYXNzIGF0IHRoZSB0b3AgbGV2ZWwuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2Zvcm1hdGljJyk7XG4iLCIvLyAjIGFycmF5IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCBhcnJheSB2YWx1ZXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgLy8gZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gIC8vICAgcmV0dXJuIHtcbiAgLy8gICAgIGNsYXNzTmFtZTogcGx1Z2luLmNvbmZpZy5jbGFzc05hbWVcbiAgLy8gICB9O1xuICAvLyB9LFxuXG4gIG5leHRMb29rdXBJZDogMCxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIE5lZWQgdG8gY3JlYXRlIGFydGlmaWNpYWwga2V5cyBmb3IgdGhlIGFycmF5LiBJbmRleGVzIGFyZSBub3QgZ29vZCBrZXlzLFxuICAgIC8vIHNpbmNlIHRoZXkgY2hhbmdlLiBTbywgbWFwIGVhY2ggcG9zaXRpb24gdG8gYW4gYXJ0aWZpY2lhbCBrZXlcbiAgICB2YXIgbG9va3VwcyA9IFtdO1xuXG4gICAgdmFyIGl0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZTtcblxuICAgIGl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcblxuICAgIHZhciBsb29rdXBzID0gdGhpcy5zdGF0ZS5sb29rdXBzO1xuXG4gICAgdmFyIGl0ZW1zID0gbmV3UHJvcHMuZmllbGQudmFsdWU7XG5cbiAgICAvLyBOZWVkIHRvIHNldCBhcnRpZmljaWFsIGtleXMgZm9yIG5ldyBhcnJheSBpdGVtcy5cbiAgICBpZiAoaXRlbXMubGVuZ3RoID4gbG9va3Vwcy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSBsb29rdXBzLmxlbmd0aDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxvb2t1cHNbaV0gPSAnXycgKyB0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgICAgdGhpcy5uZXh0TG9va3VwSWQrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGxvb2t1cHM6IGxvb2t1cHNcbiAgICB9KTtcbiAgfSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGksIG5ld1ZhbHVlLCBpbmZvKSB7XG4gICAgdmFyIG5ld0FycmF5VmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIG5ld0FycmF5VmFsdWVbaV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3QXJyYXlWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uIChpdGVtQ2hvaWNlSW5kZXgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGNvbmZpZy5jcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWUoZmllbGQsIGl0ZW1DaG9pY2VJbmRleCk7XG5cbiAgICB2YXIgaXRlbXMgPSBmaWVsZC52YWx1ZTtcblxuICAgIGl0ZW1zID0gaXRlbXMuY29uY2F0KG5ld1ZhbHVlKTtcblxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShpdGVtcyk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChpKSB7XG4gICAgdmFyIGxvb2t1cHMgPSB0aGlzLnN0YXRlLmxvb2t1cHM7XG4gICAgbG9va3Vwcy5zcGxpY2UoaSwgMSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG4gICAgdmFyIG5ld0l0ZW1zID0gdGhpcy5wcm9wcy5maWVsZC52YWx1ZS5zbGljZSgwKTtcbiAgICBuZXdJdGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld0l0ZW1zKTtcbiAgfSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChmcm9tSW5kZXgsIHRvSW5kZXgpIHtcbiAgICB2YXIgbG9va3VwcyA9IHRoaXMuc3RhdGUubG9va3VwcztcbiAgICB2YXIgZnJvbUlkID0gbG9va3Vwc1tmcm9tSW5kZXhdO1xuICAgIHZhciB0b0lkID0gbG9va3Vwc1t0b0luZGV4XTtcbiAgICBsb29rdXBzW2Zyb21JbmRleF0gPSB0b0lkO1xuICAgIGxvb2t1cHNbdG9JbmRleF0gPSBmcm9tSWQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBsb29rdXBzOiBsb29rdXBzXG4gICAgfSk7XG5cbiAgICB2YXIgbmV3SXRlbXMgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLnNsaWNlKDApO1xuICAgIGlmIChmcm9tSW5kZXggIT09IHRvSW5kZXggJiZcbiAgICAgIGZyb21JbmRleCA+PSAwICYmIGZyb21JbmRleCA8IG5ld0l0ZW1zLmxlbmd0aCAmJlxuICAgICAgdG9JbmRleCA+PSAwICYmIHRvSW5kZXggPCBuZXdJdGVtcy5sZW5ndGhcbiAgICApIHtcbiAgICAgIG5ld0l0ZW1zLnNwbGljZSh0b0luZGV4LCAwLCBuZXdJdGVtcy5zcGxpY2UoZnJvbUluZGV4LCAxKVswXSk7XG4gICAgfVxuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShuZXdJdGVtcyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICB2YXIgbnVtSXRlbXMgPSBmaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbScsIHtcbiAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5sb29rdXBzW2ldLFxuICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIG51bUl0ZW1zOiBudW1JdGVtcyxcbiAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICBvblJlbW92ZTogdGhpcy5vblJlbW92ZSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKSksXG4gICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhcnJheS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgb25BcHBlbmQ6IHRoaXMub25BcHBlbmR9KVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBib29sZWFuIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZHJvcGRvd24gdG8gaGFuZGxlIHllcy9ubyBib29sZWFuIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQm9vbGVhbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjaG9pY2VzID0gY29uZmlnLmZpZWxkQm9vbGVhbkNob2ljZXMoZmllbGQpO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgnc2VsZWN0LXZhbHVlJywge1xuICAgICAgY2hvaWNlczogY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSwgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb25cbiAgICB9KSk7XG4gIH1cbn0pO1xuIiwiLy8gIyBjaGVja2JveC1hcnJheSBjb21wb25lbnRcblxuLypcblVzZWQgd2l0aCBhcnJheSB2YWx1ZXMgdG8gc3VwcGx5IG11bHRpcGxlIGNoZWNrYm94ZXMgZm9yIGFkZGluZyBtdWx0aXBsZVxuZW51bWVyYXRlZCB2YWx1ZXMgdG8gYW4gYXJyYXkuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0NoZWNrYm94QXJyYXknLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBHZXQgYWxsIHRoZSBjaGVja2VkIGNoZWNrYm94ZXMgYW5kIGNvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzLlxuICAgIHZhciBjaG9pY2VOb2RlcyA9IHRoaXMucmVmcy5jaG9pY2VzLmdldERPTU5vZGUoKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKTtcbiAgICBjaG9pY2VOb2RlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGNob2ljZU5vZGVzLCAwKTtcbiAgICB2YXIgdmFsdWVzID0gY2hvaWNlTm9kZXMubWFwKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICByZXR1cm4gbm9kZS5jaGVja2VkID8gbm9kZS52YWx1ZSA6IG51bGw7XG4gICAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0pO1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZSh2YWx1ZXMpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBjaG9pY2VzID0gdGhpcy5zdGF0ZS5jaG9pY2VzIHx8IFtdO1xuXG4gICAgdmFyIGlzSW5saW5lID0gIV8uZmluZChjaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICByZXR1cm4gY2hvaWNlLnNhbXBsZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGRcbiAgICB9LFxuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgcmVmOiAnY2hvaWNlcyd9LFxuICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICB2YXIgaW5wdXRGaWVsZCA9IFIuc3Bhbih7c3R5bGU6IHt3aGl0ZVNwYWNlOiAnbm93cmFwJ319LFxuICAgICAgICAgICAgUi5pbnB1dCh7XG4gICAgICAgICAgICAgIG5hbWU6IGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgdHlwZTogJ2NoZWNrYm94JyxcbiAgICAgICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICAgICAgY2hlY2tlZDogZmllbGQudmFsdWUuaW5kZXhPZihjaG9pY2UudmFsdWUpID49IDAgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgY2hvaWNlLmxhYmVsXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChpc0lubGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3Bhbih7a2V5OiBpLCBjbGFzc05hbWU6ICdmaWVsZC1jaG9pY2UnfSxcbiAgICAgICAgICAgICAgaW5wdXRGaWVsZCwgJyAnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5kaXYoe2tleTogaSwgY2xhc3NOYW1lOiAnZmllbGQtY2hvaWNlJ30sXG4gICAgICAgICAgICAgIGlucHV0RmllbGQsICcgJyxcbiAgICAgICAgICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NhbXBsZScsIHtmaWVsZDogZmllbGQsIGNob2ljZTogY2hvaWNlfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNoZWNrYm94LWJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB0aGF0IGNhbiBlZGl0IGEgYm9vbGVhbiB3aXRoIGEgY2hlY2tib3guXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQ2hlY2tib3hCb29sZWFuJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMub25DaGFuZ2VWYWx1ZShldmVudC50YXJnZXQuY2hlY2tlZCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0cnVlXG4gICAgfSxcbiAgICBSLnNwYW4oe3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCd9fSxcbiAgICAgIFIuaW5wdXQoe1xuICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICBjaGVja2VkOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgICB9KSxcbiAgICAgIFIuc3Bhbih7fSwgJyAnKSxcbiAgICAgIFIuc3Bhbih7fSwgY29uZmlnLmZpZWxkSGVscFRleHQoZmllbGQpIHx8IGNvbmZpZy5maWVsZExhYmVsKGZpZWxkKSlcbiAgICApKTtcbiAgfVxufSk7XG4iLCIvLyAjIGNvcHkgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgbm9uLWVkaXRhYmxlIGh0bWwvdGV4dCAodGhpbmsgYXJ0aWNsZSBjb3B5KS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdDb3B5JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBkYW5nZXJvdXNseVNldElubmVySFRNTDoge1xuICAgICAgX19odG1sOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZEhlbHBUZXh0KHRoaXMucHJvcHMuZmllbGQpXG4gICAgfX0pO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGRzIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdG8gZWRpdCB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCB3aXRoIHN0YXRpYyBwcm9wZXJ0aWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGRzJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgb25DaGFuZ2VGaWVsZDogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIGluZm8pIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICB2YXIgbmV3T2JqZWN0VmFsdWUgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgICBuZXdPYmplY3RWYWx1ZVtrZXldID0gbmV3VmFsdWU7XG4gICAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqZWN0VmFsdWUsIGluZm8pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgdmFyIGZpZWxkcyA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkcyhmaWVsZCk7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LFxuICAgICAgUi5maWVsZHNldCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCwgaSkge1xuICAgICAgICAgIHZhciBrZXkgPSBjaGlsZEZpZWxkLmtleSB8fCBpO1xuICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRmllbGRFbGVtZW50KHtcbiAgICAgICAgICAgIGtleToga2V5IHx8IGksXG4gICAgICAgICAgICBmaWVsZDogY2hpbGRGaWVsZCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlRmllbGQuYmluZCh0aGlzLCBrZXkpLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIi8vICMganNvbiBjb21wb25lbnRcblxuLypcblRleHRhcmVhIGVkaXRvciBmb3IgSlNPTi4gV2lsbCB2YWxpZGF0ZSB0aGUgSlNPTiBiZWZvcmUgc2V0dGluZyB0aGUgdmFsdWUsIHNvXG53aGlsZSB0aGUgdmFsdWUgaXMgaW52YWxpZCwgbm8gZXh0ZXJuYWwgc3RhdGUgY2hhbmdlcyB3aWxsIG9jY3VyLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnSnNvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICByb3dzOiA1XG4gICAgfTtcbiAgfSxcblxuICBpc1ZhbGlkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgdHJ5IHtcbiAgICAgIEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaXNWYWxpZDogdHJ1ZSxcbiAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgIH07XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBpc1ZhbGlkID0gdGhpcy5pc1ZhbGlkVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgIGlmIChpc1ZhbGlkKSB7XG4gICAgICAvLyBOZWVkIHRvIGhhbmRsZSB0aGlzIGJldHRlci4gTmVlZCB0byB0cmFjayBwb3NpdGlvbi5cbiAgICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5vbkNoYW5nZVZhbHVlKEpTT04ucGFyc2UoZXZlbnQudGFyZ2V0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1ZhbGlkOiBpc1ZhbGlkLFxuICAgICAgdmFsdWU6IGV2ZW50LnRhcmdldC52YWx1ZVxuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2hhbmdpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpc1ZhbGlkOiB0cnVlLFxuICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobmV4dFByb3BzLmZpZWxkLnZhbHVlLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuX2lzQ2hhbmdpbmcgPSBmYWxzZTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGZpZWxkOiBjb25maWcuZmllbGRXaXRoVmFsdWUoZmllbGQsIHRoaXMuc3RhdGUudmFsdWUpLCBwbGFpbjogdGhpcy5wcm9wcy5wbGFpblxuICAgIH0sIFIudGV4dGFyZWEoe1xuICAgICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICAgIHZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgc3R5bGU6IHtiYWNrZ3JvdW5kQ29sb3I6IHRoaXMuc3RhdGUuaXNWYWxpZCA/ICcnIDogJ3JnYigyNTUsMjAwLDIwMCknfSxcbiAgICAgICAgcm93czogY29uZmlnLmZpZWxkUm93cyhmaWVsZCkgfHwgdGhpcy5wcm9wcy5yb3dzLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBhIGZpZWxkIHRvIGVkaXQgYW4gb2JqZWN0IHdpdGggZHluYW1pYyBjaGlsZCBmaWVsZHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbnZhciB0ZW1wS2V5UHJlZml4ID0gJyQkX190ZW1wX18nO1xuXG52YXIgdGVtcEtleSA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gdGVtcEtleVByZWZpeCArIGlkO1xufTtcblxudmFyIGlzVGVtcEtleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGtleS5zdWJzdHJpbmcoMCwgdGVtcEtleVByZWZpeC5sZW5ndGgpID09PSB0ZW1wS2V5UHJlZml4O1xufTtcblxuLy8gVE9ETzoga2VlcCBpbnZhbGlkIGtleXMgYXMgc3RhdGUgYW5kIGRvbid0IHNlbmQgaW4gb25DaGFuZ2U7IGNsb25lIGNvbnRleHRcbi8vIGFuZCB1c2UgY2xvbmUgdG8gY3JlYXRlIGNoaWxkIGNvbnRleHRzXG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0JyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgbmV4dExvb2t1cElkOiAwLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGtleVRvSWQgPSB7fTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuICAgIHZhciBrZXlPcmRlciA9IFtdO1xuICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgLy8gdGhhbiB0aGUgYWN0dWFsIGtleS4gRm9yIGV4YW1wbGUsIGR1cGxpY2F0ZSBrZXlzIGFyZSBub3QgYWxsb3dlZCxcbiAgICAvLyBidXQgd2UgbWF5IHRlbXBvcmFyaWx5IHNob3cgZHVwbGljYXRlIGtleXMuXG4gICAgdmFyIHRlbXBEaXNwbGF5S2V5cyA9IHt9O1xuXG4gICAgLy8gS2V5cyBkb24ndCBtYWtlIGdvb2QgcmVhY3Qga2V5cywgc2luY2Ugd2UncmUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAgIC8vIGNoYW5nZWQgaGVyZSwgc28gd2UnbGwgaGF2ZSB0byBjcmVhdGUgZmFrZSBrZXlzIGFuZFxuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIG1hcHBpbmcgb2YgcmVhbCBrZXlzIHRvIGZha2Uga2V5cy4gWXVjay5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIGlkID0gKyt0aGlzLm5leHRMb29rdXBJZDtcbiAgICAgIC8vIE1hcCB0aGUgcmVhbCBrZXkgdG8gdGhlIGlkLlxuICAgICAga2V5VG9JZFtrZXldID0gaWQ7XG4gICAgICAvLyBLZWVwIHRoZSBvcmRlcmluZyBvZiB0aGUga2V5cyBzbyB3ZSBkb24ndCBzaHVmZmxlIHRoaW5ncyBhcm91bmQgbGF0ZXIuXG4gICAgICBrZXlPcmRlci5wdXNoKGtleSk7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgdGVtcG9yYXJ5IGtleSB0aGF0IHdhcyBwZXJzaXN0ZWQsIGJlc3Qgd2UgY2FuIGRvIGlzIGRpc3BsYXlcbiAgICAgIC8vIGEgYmxhbmsuXG4gICAgICAvLyBUT0RPOiBQcm9iYWJseSBqdXN0IG5vdCBzZW5kIHRlbXBvcmFyeSBrZXlzIGJhY2sgdGhyb3VnaC4gVGhpcyBiZWhhdmlvclxuICAgICAgLy8gaXMgYWN0dWFsbHkgbGVmdG92ZXIgZnJvbSBhbiBlYXJsaWVyIGluY2FybmF0aW9uIG9mIGZvcm1hdGljIHdoZXJlXG4gICAgICAvLyB2YWx1ZXMgaGFkIHRvIGdvIGJhY2sgdG8gdGhlIHJvb3QuXG4gICAgICBpZiAoaXNUZW1wS2V5KGtleSkpIHtcbiAgICAgICAgdGVtcERpc3BsYXlLZXlzW2lkXSA9ICcnO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlcixcbiAgICAgIC8vIFRlbXAga2V5cyBrZWVwcyB0aGUga2V5IHRvIGRpc3BsYXksIHdoaWNoIHNvbWV0aW1lcyBtYXkgYmUgZGlmZmVyZW50XG4gICAgICAvLyB0aGFuIHRoZSBhY3R1YWwga2V5LiBGb3IgZXhhbXBsZSwgZHVwbGljYXRlIGtleXMgYXJlIG5vdCBhbGxvd2VkLFxuICAgICAgLy8gYnV0IHdlIG1heSB0ZW1wb3JhcmlseSBzaG93IGR1cGxpY2F0ZSBrZXlzLlxuICAgICAgdGVtcERpc3BsYXlLZXlzOiB0ZW1wRGlzcGxheUtleXNcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuXG4gICAgdmFyIGtleVRvSWQgPSB0aGlzLnN0YXRlLmtleVRvSWQ7XG4gICAgdmFyIG5ld0tleVRvSWQgPSB7fTtcbiAgICB2YXIgdGVtcERpc3BsYXlLZXlzID0gdGhpcy5zdGF0ZS50ZW1wRGlzcGxheUtleXM7XG4gICAgdmFyIG5ld1RlbXBEaXNwbGF5S2V5cyA9IHt9O1xuICAgIHZhciBrZXlPcmRlciA9IHRoaXMuc3RhdGUua2V5T3JkZXI7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhuZXdQcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgdmFyIGFkZGVkS2V5cyA9IFtdO1xuXG4gICAgLy8gTG9vayBhdCB0aGUgbmV3IGtleXMuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIEFkZCBuZXcgbG9va3VwIGlmIHRoaXMga2V5IHdhc24ndCBoZXJlIGxhc3QgdGltZS5cbiAgICAgIGlmICgha2V5VG9JZFtrZXldKSB7XG4gICAgICAgIHRoaXMubmV4dExvb2t1cElkKys7XG4gICAgICAgIG5ld0tleVRvSWRba2V5XSA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgICAgICBhZGRlZEtleXMucHVzaChrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3S2V5VG9JZFtrZXldID0ga2V5VG9JZFtrZXldO1xuICAgICAgfVxuICAgICAgaWYgKGlzVGVtcEtleShrZXkpICYmIG5ld0tleVRvSWRba2V5XSBpbiB0ZW1wRGlzcGxheUtleXMpIHtcbiAgICAgICAgbmV3VGVtcERpc3BsYXlLZXlzW25ld0tleVRvSWRba2V5XV0gPSB0ZW1wRGlzcGxheUtleXNbbmV3S2V5VG9JZFtrZXldXTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIG5ld0tleU9yZGVyID0gW107XG5cbiAgICAvLyBMb29rIGF0IHRoZSBvbGQga2V5cy5cbiAgICBrZXlPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vIElmIHRoZSBrZXkgaXMgaW4gdGhlIG5ldyBrZXlzLCBwdXNoIGl0IG9udG8gdGhlIG9yZGVyIHRvIHJldGFpbiB0aGVcbiAgICAgIC8vIHNhbWUgb3JkZXIuXG4gICAgICBpZiAobmV3S2V5VG9JZFtrZXldKSB7XG4gICAgICAgIG5ld0tleU9yZGVyLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFB1dCBhZGRlZCBmaWVsZHMgYXQgdGhlIGVuZC4gKFNvIHRoaW5ncyBkb24ndCBnZXQgc2h1ZmZsZWQuKVxuICAgIG5ld0tleU9yZGVyID0gbmV3S2V5T3JkZXIuY29uY2F0KGFkZGVkS2V5cyk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IG5ld0tleVRvSWQsXG4gICAgICBrZXlPcmRlcjogbmV3S2V5T3JkZXIsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IG5ld1RlbXBEaXNwbGF5S2V5c1xuICAgIH0pO1xuICB9LFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgaW5mbykge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5maWVsZC52YWx1ZSk7XG4gICAgbmV3T2JqW2tleV0gPSBuZXdWYWx1ZTtcbiAgICB0aGlzLm9uQnViYmxlVmFsdWUobmV3T2JqLCBpbmZvKTtcbiAgfSxcblxuICBvbkFwcGVuZDogZnVuY3Rpb24gKGl0ZW1DaG9pY2VJbmRleCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHRoaXMubmV4dExvb2t1cElkKys7XG5cbiAgICB2YXIga2V5VG9JZCA9IHRoaXMuc3RhdGUua2V5VG9JZDtcbiAgICB2YXIga2V5T3JkZXIgPSB0aGlzLnN0YXRlLmtleU9yZGVyO1xuICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgIHZhciBpZCA9IHRoaXMubmV4dExvb2t1cElkO1xuICAgIHZhciBuZXdLZXkgPSB0ZW1wS2V5KGlkKTtcblxuICAgIGtleVRvSWRbbmV3S2V5XSA9IGlkO1xuICAgIC8vIFRlbXBvcmFyaWx5LCB3ZSdsbCBzaG93IGEgYmxhbmsga2V5LlxuICAgIHRlbXBEaXNwbGF5S2V5c1tpZF0gPSAnJztcbiAgICBrZXlPcmRlci5wdXNoKG5ld0tleSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGtleVRvSWQ6IGtleVRvSWQsXG4gICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgIGtleU9yZGVyOiBrZXlPcmRlclxuICAgIH0pO1xuXG4gICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY29uZmlnLmNyZWF0ZU5ld0NoaWxkRmllbGRWYWx1ZShmaWVsZCwgaXRlbUNob2ljZUluZGV4KTtcblxuICAgIG5ld09ialtuZXdLZXldID0gbmV3VmFsdWU7XG5cbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcbiAgfSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBuZXdPYmogPSBfLmV4dGVuZCh0aGlzLnByb3BzLmZpZWxkLnZhbHVlKTtcbiAgICBkZWxldGUgbmV3T2JqW2tleV07XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKG5ld09iaik7XG4gIH0sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZnJvbUtleSwgdG9LZXkpIHtcbiAgICBpZiAoZnJvbUtleSAhPT0gdG9LZXkpIHtcbiAgICAgIHZhciBrZXlUb0lkID0gdGhpcy5zdGF0ZS5rZXlUb0lkO1xuICAgICAgdmFyIGtleU9yZGVyID0gdGhpcy5zdGF0ZS5rZXlPcmRlcjtcbiAgICAgIHZhciB0ZW1wRGlzcGxheUtleXMgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5cztcblxuICAgICAgdmFyIG5ld09iaiA9IF8uZXh0ZW5kKHRoaXMucHJvcHMuZmllbGQudmFsdWUpO1xuXG4gICAgICAvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgdGhlIGtleSB3ZSdyZSBtb3ZpbmcgdG8sIHRoZW4gd2UgaGF2ZSB0byBjaGFuZ2UgdGhhdFxuICAgICAgLy8ga2V5IHRvIHNvbWV0aGluZyBlbHNlLlxuICAgICAgaWYgKGtleVRvSWRbdG9LZXldKSB7XG4gICAgICAgIC8vIE1ha2UgYSBuZXdcbiAgICAgICAgdmFyIHRlbXBUb0tleSA9IHRlbXBLZXkoa2V5VG9JZFt0b0tleV0pO1xuICAgICAgICB0ZW1wRGlzcGxheUtleXNba2V5VG9JZFt0b0tleV1dID0gdG9LZXk7XG4gICAgICAgIGtleVRvSWRbdGVtcFRvS2V5XSA9IGtleVRvSWRbdG9LZXldO1xuICAgICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKHRvS2V5KV0gPSB0ZW1wVG9LZXk7XG4gICAgICAgIGRlbGV0ZSBrZXlUb0lkW3RvS2V5XTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5cyxcbiAgICAgICAgICBrZXlPcmRlcjoga2V5T3JkZXJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3T2JqW3RlbXBUb0tleV0gPSBuZXdPYmpbdG9LZXldO1xuICAgICAgICBkZWxldGUgbmV3T2JqW3RvS2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0b0tleSkge1xuICAgICAgICB0b0tleSA9IHRlbXBLZXkoa2V5VG9JZFtmcm9tS2V5XSk7XG4gICAgICAgIHRlbXBEaXNwbGF5S2V5c1trZXlUb0lkW2Zyb21LZXldXSA9ICcnO1xuICAgICAgfVxuICAgICAga2V5VG9JZFt0b0tleV0gPSBrZXlUb0lkW2Zyb21LZXldO1xuICAgICAgZGVsZXRlIGtleVRvSWRbZnJvbUtleV07XG4gICAgICBrZXlPcmRlcltrZXlPcmRlci5pbmRleE9mKGZyb21LZXkpXSA9IHRvS2V5O1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAga2V5VG9JZDoga2V5VG9JZCxcbiAgICAgICAga2V5T3JkZXI6IGtleU9yZGVyLFxuICAgICAgICB0ZW1wRGlzcGxheUtleXM6IHRlbXBEaXNwbGF5S2V5c1xuICAgICAgfSk7XG5cbiAgICAgIG5ld09ialt0b0tleV0gPSBuZXdPYmpbZnJvbUtleV07XG4gICAgICBkZWxldGUgbmV3T2JqW2Zyb21LZXldO1xuXG4gICAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3T2JqKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgb3VyIGZyb21LZXkgaGFzIG9wZW5lZCB1cCBhIHNwb3QuXG4gICAgICBpZiAoZnJvbUtleSAmJiBmcm9tS2V5ICE9PSB0b0tleSkge1xuICAgICAgICBpZiAoIShmcm9tS2V5IGluIG5ld09iaikpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhuZXdPYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKCEoaXNUZW1wS2V5KGtleSkpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpZCA9IGtleVRvSWRba2V5XTtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5S2V5ID0gdGVtcERpc3BsYXlLZXlzW2lkXTtcbiAgICAgICAgICAgIGlmIChmcm9tS2V5ID09PSBkaXNwbGF5S2V5KSB7XG4gICAgICAgICAgICAgIHRoaXMub25Nb3ZlKGtleSwgZGlzcGxheUtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBnZXRGaWVsZHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZHMgPSBjb25maWcuY3JlYXRlQ2hpbGRGaWVsZHMoZmllbGQpO1xuXG4gICAgdmFyIGtleVRvRmllbGQgPSB7fTtcblxuICAgIF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChjaGlsZEZpZWxkKSB7XG4gICAgICBrZXlUb0ZpZWxkW2NoaWxkRmllbGQua2V5XSA9IGNoaWxkRmllbGQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5rZXlPcmRlci5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGtleVRvRmllbGRba2V5XTtcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRzID0gdGhpcy5nZXRGaWVsZHMoKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSxcbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgICBDU1NUcmFuc2l0aW9uR3JvdXAoe3RyYW5zaXRpb25OYW1lOiAncmV2ZWFsJ30sXG4gICAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlLZXkgPSB0aGlzLnN0YXRlLnRlbXBEaXNwbGF5S2V5c1t0aGlzLnN0YXRlLmtleVRvSWRbY2hpbGRGaWVsZC5rZXldXTtcbiAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGRpc3BsYXlLZXkpKSB7XG4gICAgICAgICAgICAgIGRpc3BsYXlLZXkgPSBjaGlsZEZpZWxkLmtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnb2JqZWN0LWl0ZW0nLCB7XG4gICAgICAgICAgICAgIGtleTogdGhpcy5zdGF0ZS5rZXlUb0lkW2NoaWxkRmllbGQua2V5XSxcbiAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQsXG4gICAgICAgICAgICAgIG9uTW92ZTogdGhpcy5vbk1vdmUsXG4gICAgICAgICAgICAgIG9uUmVtb3ZlOiB0aGlzLm9uUmVtb3ZlLFxuICAgICAgICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICAgICAgb25BY3Rpb246IHRoaXMub25CdWJibGVBY3Rpb24sXG4gICAgICAgICAgICAgIGRpc3BsYXlLZXk6IGRpc3BsYXlLZXksXG4gICAgICAgICAgICAgIGl0ZW1LZXk6IGNoaWxkRmllbGQua2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICksXG4gICAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtY29udHJvbCcsIHtmaWVsZDogZmllbGQsIG9uQXBwZW5kOiB0aGlzLm9uQXBwZW5kfSlcbiAgICAgIClcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgcHJldHR5IGJvb2xlYW4gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgcHJldHR5IGJvb2xlYW4gY29tcG9uZW50IHdpdGggbm9uLW5hdGl2ZSBkcm9wLWRvd25cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUHJldHR5Qm9vbGVhbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZEJvb2xlYW5DaG9pY2VzKGZpZWxkKTtcblxuICAgIHJldHVybiBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQnLCB7XG4gICAgICBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3ByZXR0eS1zZWxlY3QtdmFsdWUnLCB7XG4gICAgICBjaG9pY2VzOiBjaG9pY2VzLCBmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNlbGVjdCBjb21wb25lbnRcblxuLypcblJlbmRlciBzZWxlY3QgZWxlbWVudCB0byBnaXZlIGEgdXNlciBjaG9pY2VzIGZvciB0aGUgdmFsdWUgb2YgYSBmaWVsZC4gUmVuZGVycyBub24tbmF0aXZlXG5zZWxlY3QgZHJvcCBkb3duIGFuZCBzdXBwb3J0cyBmYW5jaWVyIHJlbmRlcmluZ3MuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVNlbGVjdCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjaG9pY2VzOiB0aGlzLnByb3BzLmNvbmZpZy5maWVsZFByZXR0eUNob2ljZXModGhpcy5wcm9wcy5maWVsZClcbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXdQcm9wcykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY2hvaWNlczogbmV3UHJvcHMuY29uZmlnLmZpZWxkUHJldHR5Q2hvaWNlcyhuZXdQcm9wcy5maWVsZClcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBjb25maWcuY3JlYXRlRWxlbWVudCgncHJldHR5LXNlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgQ29kZU1pcnJvciAqL1xuLyplc2xpbnQgbm8tc2NyaXB0LXVybDowICovXG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFRhZ1RyYW5zbGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3RhZy10cmFuc2xhdG9yJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxuLypcbiAgIEVkaXRvciBmb3IgdGFnZ2VkIHRleHQuIFJlbmRlcnMgdGV4dCBsaWtlIFwiaGVsbG8ge3tmaXJzdE5hbWV9fVwiXG4gICB3aXRoIHJlcGxhY2VtZW50IGxhYmVscyByZW5kZXJlZCBpbiBhIHBpbGwgYm94LiBEZXNpZ25lZCB0byBsb2FkXG4gICBxdWlja2x5IHdoZW4gbWFueSBzZXBhcmF0ZSBpbnN0YW5jZXMgb2YgaXQgYXJlIG9uIHRoZSBzYW1lXG4gICBwYWdlLlxuXG4gICBVc2VzIENvZGVNaXJyb3IgdG8gZWRpdCB0ZXh0LiBUbyBzYXZlIG1lbW9yeSB0aGUgQ29kZU1pcnJvciBub2RlIGlzXG4gICBpbnN0YW50aWF0ZWQgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGUgbW91c2UgaW50byB0aGUgZWRpdCBhcmVhLlxuICAgSW5pdGlhbGx5IGEgcmVhZC1vbmx5IHZpZXcgdXNpbmcgYSBzaW1wbGUgZGl2IGlzIHNob3duLlxuXG4gICBJTVBMRU1FTlRBVElPTiBOT1RFOlxuXG4gICBUbyBkaXNwbGF5IHRoZSB0YWdzIGluc2lkZSBDb2RlTWlycm9yIHdlIGFyZSB1c2luZyBDTSdzXG4gICBzcGVjaWFsQ2hhclBsYWNlaG9sZGVyIGZlYXR1cmUsIHRvIHJlcGxhY2Ugc3BlY2lhbCBjaGFyYWN0ZXJzIHdpdGhcbiAgIGN1c3RvbSBET00gbm9kZXMuIFRoaXMgZmVhdHVyZSBpcyBkZXNpZ25lZCBmb3Igc2luZ2xlIGNoYXJhY3RlclxuICAgcmVwbGFjZW1lbnRzLCBub3QgdGFncyBsaWtlICdmaXJzdE5hbWUnLiAgU28gd2UgcmVwbGFjZSBlYWNoIHRhZ1xuICAgd2l0aCBhbiB1bnVzZWQgY2hhcmFjdGVyIGZyb20gdGhlIFVuaWNvZGUgcHJpdmF0ZSB1c2UgYXJlYSwgYW5kXG4gICB0ZWxsIENNIHRvIHJlcGxhY2UgdGhhdCB3aXRoIGEgRE9NIG5vZGUgZGlzcGxheSB0aGUgdGFnIGxhYmVsIHdpdGhcbiAgIHRoZSBwaWxsIGJveCBlZmZlY3QuXG5cbiAgIElzIHRoaXMgZXZpbD8gUGVyaGFwcyBhIGxpdHRsZSwgYnV0IGRlbGV0ZSwgdW5kbywgcmVkbywgY3V0LCBjb3B5XG4gICBhbmQgcGFzdGUgb2YgdGhlIHRhZyBwaWxsIGJveGVzIGp1c3Qgd29yayBiZWNhdXNlIENNIHRyZWF0cyB0aGVtIGFzXG4gICBhdG9taWMgc2luZ2xlIGNoYXJhY3RlcnMsIGFuZCBpdCdzIG5vdCBtdWNoIGNvZGUgb24gb3VyIHBhcnQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBkaXNwbGF5TmFtZTogJ1ByZXR0eVRleHQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jcmVhdGVFZGl0b3IoKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRVcGRhdGU6IGZ1bmN0aW9uKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgaWYgKHByZXZTdGF0ZS5jb2RlTWlycm9yTW9kZSAhPT0gdGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgLy8gQ2hhbmdlZCBmcm9tIGNvZGUgbWlycm9yIG1vZGUgdG8gcmVhZCBvbmx5IG1vZGUgb3IgdmljZSB2ZXJzYSxcbiAgICAgIC8vIHNvIHNldHVwIHRoZSBvdGhlciBlZGl0b3IuXG4gICAgICB0aGlzLmNyZWF0ZUVkaXRvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXkganVzdCB0eXBlZCBpbiBhIHRhZyBsaWtlIHt7Zmlyc3ROYW1lfX0gd2UgaGF2ZSB0byByZXBsYWNlIGl0XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUgJiYgdGhpcy5jb2RlTWlycm9yLmdldFZhbHVlKCkubWF0Y2goL1xce1xcey4rXFx9XFx9LykpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gdHJ1ZTtcblxuICAgICAgLy8gZ2V0IG5ldyBlbmNvZGVkIHZhbHVlIGZvciBDb2RlTWlycm9yXG4gICAgICB2YXIgY21WYWx1ZSA9IHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpO1xuICAgICAgdmFyIGRlY29kZWRWYWx1ZSA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5kZWNvZGVWYWx1ZShjbVZhbHVlKTtcbiAgICAgIHZhciBlbmNvZGVkVmFsdWUgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZW5jb2RlVmFsdWUoZGVjb2RlZFZhbHVlKTtcblxuICAgICAgLy8gR3JhYiB0aGUgY3Vyc29yIHNvIHdlIGNhbiByZXNldCBpdC5cbiAgICAgIC8vIFRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBDTSB2YWx1ZSB3aWxsIGJlIHNob3J0ZXIgYWZ0ZXIgcmVwbGFjaW5nIGEgdGFnIGxpa2Uge3tmaXJzdE5hbWV9fVxuICAgICAgLy8gd2l0aCBhIHNpbmdsZSBzcGVjaWFsIGNoYXIsIHNvIGFkanVzdCBjdXJzb3IgcG9zaXRpb24gYWNjb3JkaW5nbHkuXG4gICAgICB2YXIgY3Vyc29yID0gdGhpcy5jb2RlTWlycm9yLmdldEN1cnNvcigpO1xuICAgICAgY3Vyc29yLmNoIC09IGNtVmFsdWUubGVuZ3RoIC0gZW5jb2RlZFZhbHVlLmxlbmd0aDtcblxuICAgICAgdGhpcy5jb2RlTWlycm9yLnNldFZhbHVlKGVuY29kZWRWYWx1ZSk7XG4gICAgICB0aGlzLmNvZGVNaXJyb3Iuc2V0Q3Vyc29yKGN1cnNvcik7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgdGhpcy5yZW1vdmVDb2RlTWlycm9yRWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyh0aGlzLnByb3BzLmZpZWxkKTtcbiAgICB2YXIgdHJhbnNsYXRvciA9IFRhZ1RyYW5zbGF0b3IocmVwbGFjZUNob2ljZXMsIHRoaXMucHJvcHMuY29uZmlnLmh1bWFuaXplKTtcblxuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdGhpcy5wcm9wcy5maWVsZC52YWx1ZSxcbiAgICAgIGNvZGVNaXJyb3JNb2RlOiBmYWxzZSxcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgcmVwbGFjZUNob2ljZXM6IHJlcGxhY2VDaG9pY2VzLFxuICAgICAgdHJhbnNsYXRvcjogdHJhbnNsYXRvclxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgdmFyIHJlcGxhY2VDaG9pY2VzID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRSZXBsYWNlQ2hvaWNlcyhuZXh0UHJvcHMuZmllbGQpO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7XG4gICAgICByZXBsYWNlQ2hvaWNlczogcmVwbGFjZUNob2ljZXNcbiAgICB9O1xuXG4gICAgdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmFkZENob2ljZXMocmVwbGFjZUNob2ljZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUudmFsdWUgIT09IG5leHRQcm9wcy5maWVsZC52YWx1ZSAmJiBuZXh0UHJvcHMuZmllbGQudmFsdWUpIHtcbiAgICAgIG5leHRTdGF0ZS52YWx1ZSA9IG5leHRQcm9wcy5maWVsZC52YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKG5leHRTdGF0ZSk7XG4gIH0sXG5cbiAgaGFuZGxlQ2hvaWNlU2VsZWN0aW9uOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGlzQ2hvaWNlc09wZW46IGZhbHNlIH0pO1xuXG4gICAgdmFyIGNoYXIgPSB0aGlzLnN0YXRlLnRyYW5zbGF0b3IuZW5jb2RlVGFnKGtleSk7XG5cbiAgICAvLyBwdXQgdGhlIGN1cnNvciBhdCB0aGUgZW5kIG9mIHRoZSBpbnNlcnRlZCB0YWcuXG4gICAgdGhpcy5jb2RlTWlycm9yLnJlcGxhY2VTZWxlY3Rpb24oY2hhciwgJ2VuZCcpO1xuICAgIHRoaXMuY29kZU1pcnJvci5mb2N1cygpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcbiAgICB2YXIgcHJvcHMgPSB7IGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW4gfTtcbiAgICB2YXIgdGFiSW5kZXggPSBmaWVsZC50YWJJbmRleDtcblxuICAgIHZhciB0ZXh0Qm94Q2xhc3NlcyA9IGN4KF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMsIHsncHJldHR5LXRleHQtYm94JzogdHJ1ZX0pKTtcbiAgICB2YXIgdGV4dEJveCA9IHRoaXMuY3JlYXRlVGV4dEJveE5vZGUoKTtcblxuICAgIHZhciBpbnNlcnRCdG4gPSBjb25maWcuY3JlYXRlRWxlbWVudCgnaW5zZXJ0LWJ1dHRvbicsIHtyZWY6ICd0b2dnbGUnLCBvbkNsaWNrOiB0aGlzLm9uVG9nZ2xlQ2hvaWNlc30sICdJbnNlcnQuLi4nKTtcblxuICAgIHZhciBjaG9pY2VzID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZXMnLCB7XG4gICAgICByZWY6ICdjaG9pY2VzJyxcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUucmVwbGFjZUNob2ljZXMsXG4gICAgICBvcGVuOiB0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4sXG4gICAgICBpZ25vcmVDbG9zZU5vZGVzOiB0aGlzLmdldENsb3NlSWdub3JlTm9kZXMsXG4gICAgICBvblNlbGVjdDogdGhpcy5oYW5kbGVDaG9pY2VTZWxlY3Rpb24sXG4gICAgICBvbkNsb3NlOiB0aGlzLm9uQ2xvc2VDaG9pY2VzXG4gICAgfSk7XG5cbiAgICAvLyBSZW5kZXIgcmVhZC1vbmx5IHZlcnNpb24uIFdlIGFyZSB1c2luZyBwdXJlIEhUTUwgdmlhIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLCB0byBhdm9pZFxuICAgIC8vIHRoZSBjb3N0IG9mIHRoZSByZWFjdCBub2Rlcy4gVGhpcyBpcyBwcm9iYWJseSBhIHByZW1hdHVyZSBvcHRpbWl6YXRpb24uXG4gICAgdmFyIGVsZW1lbnQgPSAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncHJldHR5LXRleHQtd3JhcHBlcicgb25Nb3VzZUVudGVyPXt0aGlzLnN3aXRjaFRvQ29kZU1pcnJvcn0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXt0ZXh0Qm94Q2xhc3Nlc30gdGFiSW5kZXg9e3RhYkluZGV4fT5cbiAgICAgICAgICB7dGV4dEJveH1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge2luc2VydEJ0bn1cbiAgICAgICAge2Nob2ljZXN9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHByb3BzLCBlbGVtZW50KTtcbiAgfSxcblxuICBnZXRDbG9zZUlnbm9yZU5vZGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmcy50b2dnbGUuZ2V0RE9NTm9kZSgpO1xuICB9LFxuXG4gIG9uVG9nZ2xlQ2hvaWNlczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2V0Q2hvaWNlc09wZW4oIXRoaXMuc3RhdGUuaXNDaG9pY2VzT3Blbik7XG4gIH0sXG5cbiAgc2V0Q2hvaWNlc09wZW46IGZ1bmN0aW9uIChpc09wZW4pIHtcbiAgICB2YXIgYWN0aW9uID0gaXNPcGVuID8gJ29wZW4tcmVwbGFjZW1lbnRzJyA6ICdjbG9zZS1yZXBsYWNlbWVudHMnO1xuICAgIHRoaXMub25TdGFydEFjdGlvbihhY3Rpb24pO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBpc0Nob2ljZXNPcGVuOiBpc09wZW4gfSk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlVGV4dEJveE5vZGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5jb2RlTWlycm9yTW9kZSkge1xuICAgICAgcmV0dXJuIDxkaXYgcmVmPVwidGV4dEJveFwiIC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaHRtbCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b0h0bWwodGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgICByZXR1cm4gPGRpdiByZWY9XCJ0ZXh0Qm94XCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IGh0bWx9fSAvPjtcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlRWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuY29kZU1pcnJvck1vZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlQ29kZU1pcnJvckVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlYWRvbmx5RWRpdG9yKCk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZUNvZGVNaXJyb3JFZGl0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY21WYWx1ZSA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci5lbmNvZGVWYWx1ZSh0aGlzLnN0YXRlLnZhbHVlKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgbGluZVdyYXBwaW5nOiB0cnVlLFxuICAgICAgdGFiaW5kZXg6IHRoaXMucHJvcHMudGFiSW5kZXgsXG4gICAgICB2YWx1ZTogY21WYWx1ZSxcbiAgICAgIHNwZWNpYWxDaGFyczogdGhpcy5zdGF0ZS50cmFuc2xhdG9yLnNwZWNpYWxDaGFyc1JlZ2V4cCxcbiAgICAgIHNwZWNpYWxDaGFyUGxhY2Vob2xkZXI6IHRoaXMuY3JlYXRlVGFnTm9kZSxcbiAgICAgIGV4dHJhS2V5czoge1xuICAgICAgICBUYWI6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB0ZXh0Qm94ID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3guaW5uZXJIVE1MID0gJyc7IC8vIHJlbGVhc2UgYW55IHByZXZpb3VzIHJlYWQtb25seSBjb250ZW50IHNvIGl0IGNhbiBiZSBHQydlZFxuXG4gICAgdGhpcy5jb2RlTWlycm9yID0gQ29kZU1pcnJvcih0ZXh0Qm94LCBvcHRpb25zKTtcbiAgICB0aGlzLmNvZGVNaXJyb3Iub24oJ2NoYW5nZScsIHRoaXMub25Db2RlTWlycm9yQ2hhbmdlKTtcbiAgfSxcblxuICBvbkNvZGVNaXJyb3JDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZ0NvZGVNaXJyb3IpIHtcbiAgICAgIC8vIGF2b2lkIHJlY3Vyc2l2ZSB1cGRhdGUgY3ljbGUsIGFuZCBtYXJrIHRoZSBjb2RlIG1pcnJvciBtYW51YWwgdXBkYXRlIGFzIGRvbmVcbiAgICAgIHRoaXMudXBkYXRpbmdDb2RlTWlycm9yID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmRlY29kZVZhbHVlKHRoaXMuY29kZU1pcnJvci5nZXRWYWx1ZSgpKTtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiBuZXdWYWx1ZX0pO1xuICB9LFxuXG4gIGNyZWF0ZVJlYWRvbmx5RWRpdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRleHRCb3hOb2RlID0gdGhpcy5yZWZzLnRleHRCb3guZ2V0RE9NTm9kZSgpO1xuICAgIHRleHRCb3hOb2RlLmlubmVySFRNTCA9IHRoaXMuc3RhdGUudHJhbnNsYXRvci50b0h0bWwodGhpcy5zdGF0ZS52YWx1ZSk7XG4gIH0sXG5cbiAgcmVtb3ZlQ29kZU1pcnJvckVkaXRvcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXh0Qm94Tm9kZSA9IHRoaXMucmVmcy50ZXh0Qm94LmdldERPTU5vZGUoKTtcbiAgICB2YXIgY21Ob2RlID0gdGV4dEJveE5vZGUuZmlyc3RDaGlsZDtcbiAgICB0ZXh0Qm94Tm9kZS5yZW1vdmVDaGlsZChjbU5vZGUpO1xuICAgIHRoaXMuY29kZU1pcnJvciA9IG51bGw7XG4gIH0sXG5cbiAgc3dpdGNoVG9Db2RlTWlycm9yOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmNvZGVNaXJyb3JNb2RlKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtjb2RlTWlycm9yTW9kZTogdHJ1ZX0pO1xuICAgIH1cbiAgfSxcblxuICAvLyBDcmVhdGUgcGlsbCBib3ggc3R5bGUgZm9yIGRpc3BsYXkgaW5zaWRlIENNLiBGb3IgZXhhbXBsZVxuICAvLyAnXFx1ZTAwMCcgYmVjb21lcyAnPHNwYW4gY2xhc3M9XCJ0YWc+Rmlyc3QgTmFtZTwvc3Bhbj4nXG4gIGNyZWF0ZVRhZ05vZGU6IGZ1bmN0aW9uIChjaGFyKSB7XG4gICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgdmFyIGxhYmVsID0gdGhpcy5zdGF0ZS50cmFuc2xhdG9yLmRlY29kZUNoYXIoY2hhcik7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJwcmV0dHktcGFydFwiIG9uQ2xpY2s9e3RoaXMub25Ub2dnbGVDaG9pY2VzfT57bGFiZWx9PC9zcGFuPixcbiAgICAgIG5vZGVcbiAgICApO1xuICAgIHJldHVybiBub2RlO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0IGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHNlbGVjdCBlbGVtZW50IHRvIGdpdmUgYSB1c2VyIGNob2ljZXMgZm9yIHRoZSB2YWx1ZSBvZiBhIGZpZWxkLiBOb3RlXG5pdCBzaG91bGQgc3VwcG9ydCB2YWx1ZXMgb3RoZXIgdGhhbiBzdHJpbmdzLiBDdXJyZW50bHkgdGhpcyBpcyBvbmx5IHRlc3RlZCBmb3JcbmJvb2xlYW4gdmFsdWVzLCBidXQgaXQgX3Nob3VsZF8gd29yayBmb3Igb3RoZXIgdmFsdWVzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTZWxlY3QnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogdGhpcy5wcm9wcy5jb25maWcuZmllbGRDaG9pY2VzKHRoaXMucHJvcHMuZmllbGQpXG4gICAgfTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGNob2ljZXM6IG5ld1Byb3BzLmNvbmZpZy5maWVsZENob2ljZXMobmV3UHJvcHMuZmllbGQpXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3NlbGVjdC12YWx1ZScsIHtcbiAgICAgIGNob2ljZXM6IHRoaXMuc3RhdGUuY2hvaWNlcywgZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZVZhbHVlLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHNpbmdsZS1saW5lLXN0cmluZyBjb21wb25lbnRcblxuLypcblJlbmRlciBhIHNpbmdsZSBsaW5lIHRleHQgaW5wdXQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2luZ2xlTGluZVN0cmluZycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2ZpZWxkJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB0aGlzLm9uQ2hhbmdlVmFsdWUoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2ZpZWxkJywge1xuICAgICAgY29uZmlnOiBjb25maWcsIGZpZWxkOiBmaWVsZCwgcGxhaW46IHRoaXMucHJvcHMucGxhaW5cbiAgICB9LCBSLmlucHV0KHtcbiAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLmZpZWxkLnZhbHVlLFxuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2UsXG4gICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICBvbkJsdXI6IHRoaXMub25CbHVyQWN0aW9uXG4gICAgfSkpO1xuICB9XG59KTtcbiIsIi8vICMgc3RyaW5nIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgZmllbGQgdGhhdCBjYW4gZWRpdCBhIHN0cmluZyB2YWx1ZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTdHJpbmcnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9maWVsZCcpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5vbkNoYW5nZVZhbHVlKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZCcsIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsIHBsYWluOiB0aGlzLnByb3BzLnBsYWluXG4gICAgfSwgUi50ZXh0YXJlYSh7XG4gICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICBjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksXG4gICAgICByb3dzOiBmaWVsZC5yb3dzIHx8IHRoaXMucHJvcHMucm93cyxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25Gb2N1czogdGhpcy5vbkZvY3VzQWN0aW9uLFxuICAgICAgb25CbHVyOiB0aGlzLm9uQmx1ckFjdGlvblxuICAgIH0pKTtcbiAgfVxufSk7XG4iLCIvLyAjIHVua25vd24gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYSBmaWVsZCB3aXRoIGFuIHVua25vd24gdHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdVbmtub3duJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvZmllbGQnKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5kaXYoe30sXG4gICAgICBSLmRpdih7fSwgJ0NvbXBvbmVudCBub3QgZm91bmQgZm9yOiAnKSxcbiAgICAgIFIucHJlKHt9LCBKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzLmZpZWxkLnJhd0ZpZWxkVGVtcGxhdGUsIG51bGwsIDIpKVxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGFkZC1pdGVtIGNvbXBvbmVudFxuXG4vKlxuVGhlIGFkZCBidXR0b24gdG8gYXBwZW5kIGFuIGl0ZW0gdG8gYSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBZGRJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1thZGRdJ1xuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NlcyksIG9uQ2xpY2s6IHRoaXMucHJvcHMub25DbGlja30sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgYXJyYXktY29udHJvbCBjb21wb25lbnRcblxuLypcblJlbmRlciB0aGUgaXRlbSB0eXBlIGNob2ljZXMgYW5kIHRoZSBhZGQgYnV0dG9uIGZvciBhbiBhcnJheS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogMFxuICAgIH07XG4gIH0sXG5cbiAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiBpbmRleFxuICAgIH0pO1xuICB9LFxuXG4gIG9uQXBwZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbkFwcGVuZCh0aGlzLnN0YXRlLmZpZWxkVGVtcGxhdGVJbmRleCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcblxuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgdmFyIGZpZWxkVGVtcGxhdGVzID0gY29uZmlnLmZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgIHZhciB0eXBlQ2hvaWNlcyA9IG51bGw7XG5cbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgdHlwZUNob2ljZXMgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnZmllbGQtdGVtcGxhdGUtY2hvaWNlcycsIHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLCBmaWVsZFRlbXBsYXRlSW5kZXg6IHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4LCBvblNlbGVjdDogdGhpcy5vblNlbGVjdFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgdHlwZUNob2ljZXMsICcgJyxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdhZGQtaXRlbScsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBhcnJheS1pdGVtLWNvbnRyb2wgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHJlbW92ZSBhbmQgbW92ZSBidXR0b25zIGZvciBhbiBhcnJheSBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0FycmF5SXRlbUNvbnRyb2wnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25Nb3ZlQmFjazogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25Nb3ZlKHRoaXMucHJvcHMuaW5kZXgsIHRoaXMucHJvcHMuaW5kZXggLSAxKTtcbiAgfSxcblxuICBvbk1vdmVGb3J3YXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vbk1vdmUodGhpcy5wcm9wcy5pbmRleCwgdGhpcy5wcm9wcy5pbmRleCArIDEpO1xuICB9LFxuXG4gIG9uUmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLmluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5wcm9wcy5vbk1heWJlUmVtb3ZlfSksXG4gICAgICB0aGlzLnByb3BzLmluZGV4ID4gMCA/IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdtb3ZlLWl0ZW0tYmFjaycsIHtmaWVsZDogZmllbGQsIG9uQ2xpY2s6IHRoaXMub25Nb3ZlQmFja30pIDogbnVsbCxcbiAgICAgIHRoaXMucHJvcHMuaW5kZXggPCAodGhpcy5wcm9wcy5udW1JdGVtcyAtIDEpID8gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ21vdmUtaXRlbS1mb3J3YXJkJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vbk1vdmVGb3J3YXJkfSkgOiBudWxsXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0tdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIGFycmF5IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdBcnJheUl0ZW1WYWx1ZScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZUZpZWxkOiBmdW5jdGlvbiAobmV3VmFsdWUsIGluZm8pIHtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuaW5kZXgsIG5ld1ZhbHVlLCBpbmZvKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUZpZWxkRWxlbWVudCh7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUZpZWxkLCBvbkFjdGlvbjogdGhpcy5vbkJ1YmJsZUFjdGlvbn0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIGFycmF5LWl0ZW0gY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgYW4gYXJyYXkgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnQXJyYXlJdGVtJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc01heWJlUmVtb3Zpbmc6IGZhbHNlXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgb25NYXliZVJlbW92ZTogZnVuY3Rpb24gKGlzTWF5YmVSZW1vdmluZykge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNYXliZVJlbW92aW5nOiBpc01heWJlUmVtb3ZpbmdcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgY2xhc3NlcyA9IF8uZXh0ZW5kKHt9LCB0aGlzLnByb3BzLmNsYXNzZXMpO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNNYXliZVJlbW92aW5nKSB7XG4gICAgICBjbGFzc2VzWydtYXliZS1yZW1vdmluZyddID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FycmF5LWl0ZW0tdmFsdWUnLCB7ZmllbGQ6IGZpZWxkLCBpbmRleDogdGhpcy5wcm9wcy5pbmRleCxcbiAgICAgICAgb25DaGFuZ2U6IHRoaXMucHJvcHMub25DaGFuZ2UsIG9uQWN0aW9uOiB0aGlzLm9uQnViYmxlQWN0aW9ufSksXG4gICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnYXJyYXktaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgaW5kZXg6IHRoaXMucHJvcHMuaW5kZXgsIG51bUl0ZW1zOiB0aGlzLnByb3BzLm51bUl0ZW1zLFxuICAgICAgICBvbk1vdmU6IHRoaXMucHJvcHMub25Nb3ZlLCBvblJlbW92ZTogdGhpcy5wcm9wcy5vblJlbW92ZSwgb25NYXliZVJlbW92ZTogdGhpcy5vbk1heWJlUmVtb3ZlfSlcbiAgICApO1xuICB9XG59KTtcbiIsIi8vICMgQ2hvaWNlcyBjb21wb25lbnRcblxuLypcblJlbmRlciBjdXN0b21pemVkIChub24tbmF0aXZlKSBkcm9wZG93biBjaG9pY2VzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBSZWFjdC5jcmVhdGVGYWN0b3J5KFJlYWN0LmFkZG9ucy5DU1NUcmFuc2l0aW9uR3JvdXApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Nob2ljZXMnLFxuXG4gIG1peGluczogW1xuICAgIHJlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5yZXNpemUnKSxcbiAgICAvL3BsdWdpbi5yZXF1aXJlKCdtaXhpbi5zY3JvbGwnKSxcbiAgICByZXF1aXJlKCcuLi8uLi9taXhpbnMvY2xpY2stb3V0c2lkZScpXG4gIF0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1heEhlaWdodDogbnVsbCxcbiAgICAgIG9wZW46IHRoaXMucHJvcHMub3BlblxuICAgIH07XG4gIH0sXG5cbiAgZ2V0SWdub3JlQ2xvc2VOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5wcm9wcy5pZ25vcmVDbG9zZU5vZGVzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHZhciBub2RlcyA9IHRoaXMucHJvcHMuaWdub3JlQ2xvc2VOb2RlcygpO1xuICAgIGlmICghXy5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgbm9kZXMgPSBbbm9kZXNdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXM7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdjaG9pY2VzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBmaW5kIGFueSBub2RlcyB0byBpZ25vcmUuXG4gICAgICBpZiAoIV8uZmluZCh0aGlzLmdldElnbm9yZUNsb3NlTm9kZXMoKSwgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOb2RlSW5zaWRlKGV2ZW50LnRhcmdldCwgbm9kZSk7XG4gICAgICB9LmJpbmQodGhpcykpKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLmFkanVzdFNpemUoKTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QoY2hvaWNlLnZhbHVlKTtcbiAgfSxcblxuICBvbkNob2ljZUFjdGlvbjogZnVuY3Rpb24gKGNob2ljZSkge1xuICAgIHRoaXMucHJvcHMub25DaG9pY2VBY3Rpb24oY2hvaWNlKTtcbiAgfSxcblxuICBvblJlc2l6ZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICB9LFxuXG4gIG9uU2Nyb2xsV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5hZGp1c3RTaXplKCk7XG4gIH0sXG5cbiAgYWRqdXN0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZnMuY2hvaWNlcykge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnMuY2hvaWNlcy5nZXRET01Ob2RlKCk7XG4gICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgdG9wID0gcmVjdC50b3A7XG4gICAgICB2YXIgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgdmFyIGhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHRvcDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBtYXhIZWlnaHQ6IGhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtvcGVuOiBuZXh0UHJvcHMub3Blbn0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuYWRqdXN0U2l6ZSgpO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgb25TY3JvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnc3RvcCB0aGF0IScpXG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICBvbldoZWVsOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXM7XG5cbiAgICBpZiAoY2hvaWNlcyAmJiBjaG9pY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2hvaWNlcyA9IFt7dmFsdWU6ICcvLy9lbXB0eS8vLyd9XTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5vcGVuKSB7XG4gICAgICByZXR1cm4gUi5kaXYoe3JlZjogJ2NvbnRhaW5lcicsIG9uV2hlZWw6IHRoaXMub25XaGVlbCwgb25TY3JvbGw6IHRoaXMub25TY3JvbGwsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2Nob2ljZXMtY29udGFpbmVyJywgc3R5bGU6IHtcbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLCBXZWJraXRVc2VyU2VsZWN0OiAnbm9uZScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICBtYXhIZWlnaHQ6IHRoaXMuc3RhdGUubWF4SGVpZ2h0ID8gdGhpcy5zdGF0ZS5tYXhIZWlnaHQgOiBudWxsXG4gICAgICB9fSxcbiAgICAgICAgQ1NTVHJhbnNpdGlvbkdyb3VwKHt0cmFuc2l0aW9uTmFtZTogJ3JldmVhbCd9LFxuICAgICAgICAgIFIudWwoe3JlZjogJ2Nob2ljZXMnLCBjbGFzc05hbWU6ICdjaG9pY2VzJ30sXG4gICAgICAgICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG5cbiAgICAgICAgICAgICAgdmFyIGNob2ljZUVsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgICAgICAgIGlmIChjaG9pY2UudmFsdWUgPT09ICcvLy9sb2FkaW5nLy8vJykge1xuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsb3NlfSxcbiAgICAgICAgICAgICAgICAgIFIuc3Bhbih7Y2xhc3NOYW1lOiAnY2hvaWNlLWxhYmVsJ30sXG4gICAgICAgICAgICAgICAgICAgICdMb2FkaW5nLi4uJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hvaWNlLnZhbHVlID09PSAnLy8vZW1wdHkvLy8nKSB7XG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xvc2V9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6ICdjaG9pY2UtbGFiZWwnfSxcbiAgICAgICAgICAgICAgICAgICAgJ05vIGNob2ljZXMgYXZhaWxhYmxlLidcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNob2ljZS5hY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFiZWxDbGFzc2VzID0gJ2Nob2ljZS1sYWJlbCAnICsgY2hvaWNlLmFjdGlvbjtcblxuICAgICAgICAgICAgICAgIGNob2ljZUVsZW1lbnQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5vbkNob2ljZUFjdGlvbi5iaW5kKHRoaXMsIGNob2ljZSl9LFxuICAgICAgICAgICAgICAgICAgUi5zcGFuKHtjbGFzc05hbWU6IGxhYmVsQ2xhc3Nlc30sXG4gICAgICAgICAgICAgICAgICAgIGNob2ljZS5sYWJlbCB8fCB0aGlzLnByb3BzLmNvbmZpZy5hY3Rpb25DaG9pY2VMYWJlbChjaG9pY2UuYWN0aW9uKVxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2Nob2ljZS1hY3Rpb24tc2FtcGxlJywge2FjdGlvbjogY2hvaWNlLmFjdGlvbiwgY2hvaWNlOiBjaG9pY2V9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hvaWNlRWxlbWVudCA9IFIuYSh7aHJlZjogJ0phdmFTY3JpcHQnICsgJzonLCBvbkNsaWNrOiB0aGlzLm9uU2VsZWN0LmJpbmQodGhpcywgY2hvaWNlKX0sXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1sYWJlbCd9LFxuICAgICAgICAgICAgICAgICAgICBjaG9pY2UubGFiZWxcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICBSLnNwYW4oe2NsYXNzTmFtZTogJ2Nob2ljZS1zYW1wbGUnfSxcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlLnNhbXBsZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gUi5saSh7a2V5OiBpLCBjbGFzc05hbWU6ICdjaG9pY2UnfSxcbiAgICAgICAgICAgICAgICBjaG9pY2VFbGVtZW50XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIG5vdCBvcGVuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn0pO1xuIiwiLy8gIyBmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzIGNvbXBvbmVudFxuXG4vKlxuR2l2ZSBhIGxpc3Qgb2YgY2hvaWNlcyBvZiBpdGVtIHR5cGVzIHRvIGNyZWF0ZSBhcyBjaGlsZHJlbiBvZiBhbiBmaWVsZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdGaWVsZFRlbXBsYXRlQ2hvaWNlcycsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChwYXJzZUludChldmVudC50YXJnZXQudmFsdWUpKTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbmZpZyA9IHRoaXMucHJvcHMuY29uZmlnO1xuICAgIHZhciBmaWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG5cbiAgICB2YXIgZmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRJdGVtRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcbiAgICBpZiAoZmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMSkge1xuICAgICAgdHlwZUNob2ljZXMgPSBSLnNlbGVjdCh7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCB2YWx1ZTogdGhpcy5maWVsZFRlbXBsYXRlSW5kZXgsIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlfSxcbiAgICAgIGZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgaSkge1xuICAgICAgICByZXR1cm4gUi5vcHRpb24oe2tleTogaSwgdmFsdWU6IGl9LCBmaWVsZFRlbXBsYXRlLmxhYmVsIHx8IGkpO1xuICAgICAgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiB0eXBlQ2hvaWNlcyA/IHR5cGVDaG9pY2VzIDogUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgZmllbGQgY29tcG9uZW50XG5cbi8qXG5Vc2VkIGJ5IGFueSBmaWVsZHMgdG8gcHV0IHRoZSBsYWJlbCBhbmQgaGVscCB0ZXh0IGFyb3VuZCB0aGUgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxudmFyIENTU1RyYW5zaXRpb25Hcm91cCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoUmVhY3QuYWRkb25zLkNTU1RyYW5zaXRpb25Hcm91cCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnRmllbGQnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbGxhcHNlZDogdGhpcy5wcm9wcy5jb25maWcuZmllbGRJc0NvbGxhcHNlZCh0aGlzLnByb3BzLmZpZWxkKSA/IHRydWUgOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgb25DbGlja0xhYmVsOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2xsYXBzZWQ6ICF0aGlzLnN0YXRlLmNvbGxhcHNlZFxuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5wbGFpbikge1xuICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBpbmRleCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgaWYgKCFfLmlzTnVtYmVyKGluZGV4KSkge1xuICAgICAgdmFyIGtleSA9IHRoaXMucHJvcHMuZmllbGQua2V5O1xuICAgICAgaW5kZXggPSBfLmlzTnVtYmVyKGtleSkgPyBrZXkgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgdGhpcy5wcm9wcy5jbGFzc2VzKTtcblxuICAgIHZhciBlcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuXG4gICAgZXJyb3JzLmZvckVhY2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICBjbGFzc2VzWyd2YWxpZGF0aW9uLWVycm9yLScgKyBlcnJvci50eXBlXSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkpIHtcbiAgICAgIGNsYXNzZXMucmVxdWlyZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGFzc2VzLm9wdGlvbmFsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3goY2xhc3NlcyksIHN0eWxlOiB7ZGlzcGxheTogKGZpZWxkLmhpZGRlbiA/ICdub25lJyA6ICcnKX19LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJywge1xuICAgICAgICBjb25maWc6IGNvbmZpZywgZmllbGQ6IGZpZWxkLFxuICAgICAgICBpbmRleDogaW5kZXgsIG9uQ2xpY2s6IGNvbmZpZy5maWVsZElzQ29sbGFwc2libGUoZmllbGQpID8gdGhpcy5vbkNsaWNrTGFiZWwgOiBudWxsXG4gICAgICB9KSxcbiAgICAgIENTU1RyYW5zaXRpb25Hcm91cCh7dHJhbnNpdGlvbk5hbWU6ICdyZXZlYWwnfSxcbiAgICAgICAgdGhpcy5zdGF0ZS5jb2xsYXBzZWQgPyBbXSA6IFtcbiAgICAgICAgICBjb25maWcuY3JlYXRlRWxlbWVudCgnaGVscCcsIHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLCBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICBrZXk6ICdoZWxwJ1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgXVxuICAgICAgKVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBoZWxwIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgaGVscCB0ZXh0IGJsb2NrLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0hlbHAnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBoZWxwVGV4dCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkSGVscFRleHQodGhpcy5wcm9wcy5maWVsZCk7XG5cbiAgICByZXR1cm4gaGVscFRleHQgP1xuICAgICAgUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw6IHtfX2h0bWw6IGhlbHBUZXh0fX0pIDpcbiAgICAgIFIuc3BhbihudWxsKTtcbiAgfVxufSk7XG4iLCIvLyAjIGJ1dHRvbiBjb21wb25lbnRcblxuLypcbiAgQ2xpY2thYmxlICdidXR0b24nXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgb25DbGljazogUmVhY3QuUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICByZWY6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmdcbiAgfSxcblxuICBkaXNwbGF5TmFtZTogJ0luc2VydEJ1dHRvbicsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8YSByZWY9e3RoaXMucHJvcHMucmVmfSBocmVmPXsnSmF2YVNjcmlwdCcgKyAnOid9IG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja30+XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgPC9hPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGxhYmVsIGNvbXBvbmVudFxuXG4vKlxuSnVzdCB0aGUgbGFiZWwgZm9yIGEgZmllbGQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTGFiZWwnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHZhciBmaWVsZExhYmVsID0gY29uZmlnLmZpZWxkTGFiZWwoZmllbGQpO1xuXG4gICAgdmFyIGxhYmVsID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHRoaXMucHJvcHMuaW5kZXggPT09ICdudW1iZXInKSB7XG4gICAgICBsYWJlbCA9ICcnICsgKHRoaXMucHJvcHMuaW5kZXggKyAxKSArICcuJztcbiAgICAgIGlmIChmaWVsZExhYmVsKSB7XG4gICAgICAgIGxhYmVsID0gbGFiZWwgKyAnICcgKyBmaWVsZExhYmVsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaWVsZExhYmVsIHx8IGxhYmVsKSB7XG4gICAgICB2YXIgdGV4dCA9IGxhYmVsIHx8IGZpZWxkTGFiZWw7XG4gICAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICAgIHRleHQgPSBSLmEoe2hyZWY6ICdKYXZhU2NyaXB0JyArICc6Jywgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGV4dCk7XG4gICAgICB9XG4gICAgICBsYWJlbCA9IFIubGFiZWwoe30sIHRleHQpO1xuICAgIH1cblxuICAgIHZhciByZXF1aXJlZE9yTm90O1xuXG4gICAgaWYgKCFjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgcmVxdWlyZWRPck5vdCA9IFIuc3Bhbih7XG4gICAgICAgIGNsYXNzTmFtZTogY29uZmlnLmZpZWxkSXNSZXF1aXJlZChmaWVsZCkgPyAncmVxdWlyZWQtdGV4dCcgOiAnbm90LXJlcXVpcmVkLXRleHQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe1xuICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpXG4gICAgfSxcbiAgICAgIGxhYmVsLFxuICAgICAgJyAnLFxuICAgICAgcmVxdWlyZWRPck5vdFxuICAgICk7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGRpc3BsYXlOYW1lOiAnTG9hZGluZ0Nob2ljZXMnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5Mb2FkaW5nIGNob2ljZXMuLi48L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiLy8gIyBtb3ZlLWl0ZW0tYmFjayBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gYmFja3dhcmRzIGluIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1CYWNrJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1t1cF0nXG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSLnNwYW4oe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrfSwgdGhpcy5wcm9wcy5sYWJlbCk7XG4gIH1cbn0pO1xuIiwiLy8gIyBtb3ZlLWl0ZW0tZm9yd2FyZCBjb21wb25lbnRcblxuLypcbkJ1dHRvbiB0byBtb3ZlIGFuIGl0ZW0gZm9yd2FyZCBpbiBhIGxpc3QuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnTW92ZUl0ZW1Gb3J3YXJkJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBsYWJlbDogJ1tkb3duXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuc3Bhbih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLCBvbkNsaWNrOiB0aGlzLnByb3BzLm9uQ2xpY2t9LCB0aGlzLnByb3BzLmxhYmVsKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSBpdGVtIHR5cGUgY2hvaWNlcyBhbmQgdGhlIGFkZCBidXR0b24uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0Q29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmllbGRUZW1wbGF0ZUluZGV4OiAwXG4gICAgfTtcbiAgfSxcblxuICBvblNlbGVjdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWVsZFRlbXBsYXRlSW5kZXg6IGluZGV4XG4gICAgfSk7XG4gIH0sXG5cbiAgb25BcHBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnByb3BzLm9uQXBwZW5kKHRoaXMuc3RhdGUuZmllbGRUZW1wbGF0ZUluZGV4KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZENoaWxkRmllbGRUZW1wbGF0ZXMoZmllbGQpO1xuXG4gICAgdmFyIHR5cGVDaG9pY2VzID0gbnVsbDtcblxuICAgIGlmIChmaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0eXBlQ2hvaWNlcyA9IGNvbmZpZy5jcmVhdGVFbGVtZW50KCdmaWVsZC10ZW1wbGF0ZS1jaG9pY2VzJywge1xuICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgIGZpZWxkVGVtcGxhdGVJbmRleDogdGhpcy5zdGF0ZS5maWVsZFRlbXBsYXRlSW5kZXgsIG9uU2VsZWN0OiB0aGlzLm9uU2VsZWN0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKX0sXG4gICAgICB0eXBlQ2hvaWNlcywgJyAnLFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2FkZC1pdGVtJywge29uQ2xpY2s6IHRoaXMub25BcHBlbmR9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbS1jb250cm9sIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIHRoZSByZW1vdmUgYnV0dG9ucyBmb3IgYW4gb2JqZWN0IGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdPYmplY3RJdGVtQ29udHJvbCcsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucHJvcHMub25SZW1vdmUodGhpcy5wcm9wcy5pdGVtS2V5KTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJXaXRoQ29uZmlnKCk7XG4gIH0sXG5cbiAgcmVuZGVyRGVmYXVsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLnByb3BzLmNvbmZpZztcbiAgICB2YXIgZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuXG4gICAgcmV0dXJuIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3Nlcyl9LFxuICAgICAgY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ3JlbW92ZS1pdGVtJywge2ZpZWxkOiBmaWVsZCwgb25DbGljazogdGhpcy5vblJlbW92ZX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIG9iamVjdC1pdGVtLWtleSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBvYmplY3QgaXRlbSBrZXkgZWRpdG9yLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbUtleScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShldmVudC50YXJnZXQudmFsdWUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICByZW5kZXJEZWZhdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFIuaW5wdXQoe2NsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgdHlwZTogJ3RleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZX0pO1xuICB9XG59KTtcbiIsIi8vICMgb2JqZWN0LWl0ZW0tdmFsdWUgY29tcG9uZW50XG5cbi8qXG5SZW5kZXIgdGhlIHZhbHVlIG9mIGFuIG9iamVjdCBpdGVtLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnT2JqZWN0SXRlbVZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlRmllbGQ6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy5pdGVtS2V5LCBuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IHRoaXMub25DaGFuZ2VGaWVsZCwgcGxhaW46IHRydWV9KVxuICAgICk7XG4gIH1cbn0pO1xuIiwiLy8gIyBvYmplY3QtaXRlbSBjb21wb25lbnRcblxuLypcblJlbmRlciBhbiBvYmplY3QgaXRlbS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSID0gUmVhY3QuRE9NO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ09iamVjdEl0ZW0nLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2VLZXk6IGZ1bmN0aW9uIChuZXdLZXkpIHtcbiAgICB0aGlzLnByb3BzLm9uTW92ZSh0aGlzLnByb3BzLml0ZW1LZXksIG5ld0tleSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5wcm9wcy5maWVsZDtcblxuICAgIHJldHVybiBSLmRpdih7Y2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpfSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS1rZXknLCB7ZmllbGQ6IGZpZWxkLCBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZUtleSwgZGlzcGxheUtleTogdGhpcy5wcm9wcy5kaXNwbGF5S2V5LCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS12YWx1ZScsIHtmaWVsZDogZmllbGQsIG9uQ2hhbmdlOiB0aGlzLnByb3BzLm9uQ2hhbmdlLCBpdGVtS2V5OiB0aGlzLnByb3BzLml0ZW1LZXl9KSxcbiAgICAgIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdvYmplY3QtaXRlbS1jb250cm9sJywge2ZpZWxkOiBmaWVsZCwgb25SZW1vdmU6IHRoaXMucHJvcHMub25SZW1vdmUsIGl0ZW1LZXk6IHRoaXMucHJvcHMuaXRlbUtleX0pXG4gICAgKTtcbiAgfVxufSk7XG4iLCIvLyAjIHByZXR0eS1zZWxlY3QtdmFsdWUgY29tcG9uZW50XG5cbi8qXG4gICBSZW5kZXIgYSBzZWxlY3QgZHJvcGRvd24gZm9yIGEgbGlzdCBvZiBjaG9pY2VzLiBDaG9pY2VzIHZhbHVlcyBjYW4gYmUgb2YgYW55XG4gICB0eXBlLiBEb2VzIG5vdCB1c2UgbmF0aXZlIHNlbGVjdCBkcm9wZG93bi4gQ2hvaWNlcyBjYW4gb3B0aW9uYWxseSBpbmNsdWRlXG4gICAnc2FtcGxlJyBwcm9wZXJ0eSBkaXNwbGF5ZWQgZ3JheWVkIG91dC5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnU2VsZWN0VmFsdWUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBjaG9pY2VWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICB2YXIgY2hvaWNlVHlwZSA9IGNob2ljZVZhbHVlLnN1YnN0cmluZygwLCBjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykpO1xuICAgIGlmIChjaG9pY2VUeXBlID09PSAnY2hvaWNlJykge1xuICAgICAgdmFyIGNob2ljZUluZGV4ID0gY2hvaWNlVmFsdWUuc3Vic3RyaW5nKGNob2ljZVZhbHVlLmluZGV4T2YoJzonKSArIDEpO1xuICAgICAgY2hvaWNlSW5kZXggPSBwYXJzZUludChjaG9pY2VJbmRleCk7XG4gICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMucHJvcHMuY2hvaWNlc1tjaG9pY2VJbmRleF0udmFsdWUpO1xuICAgIH1cbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY2hvaWNlczogW11cbiAgICB9O1xuICB9LFxuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IHRoaXMucHJvcHMuZmllbGQudmFsdWUgIT09IHVuZGVmaW5lZCA/IHRoaXMucHJvcHMuZmllbGQudmFsdWUgOiAnJztcblxuICAgIHJldHVybiB7XG4gICAgICBpc0Nob2ljZXNPcGVuOiB0aGlzLnByb3BzLmlzQ2hvaWNlc09wZW4sXG4gICAgICB2YWx1ZTogZGVmYXVsdFZhbHVlLFxuICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiBmYWxzZVxuICAgIH07XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKHRoaXMucHJvcHMuY2hvaWNlcyk7XG4gICAgdmFyIGNob2ljZXNPckxvYWRpbmc7XG5cbiAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDEgJiYgY2hvaWNlc1swXS52YWx1ZSA9PT0gJy8vL2xvYWRpbmcvLy8nKSB7XG4gICAgICBjaG9pY2VzT3JMb2FkaW5nID0gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ2xvYWRpbmctY2hvaWNlcycsIHt9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNob2ljZXNFbGVtID0gdGhpcy5wcm9wcy5jb25maWcuY3JlYXRlRWxlbWVudCgnY2hvaWNlcycsIHtcbiAgICAgICAgcmVmOiAnY2hvaWNlcycsXG4gICAgICAgIGNob2ljZXM6IGNob2ljZXMsXG4gICAgICAgIG9wZW46IHRoaXMuc3RhdGUuaXNDaG9pY2VzT3BlbixcbiAgICAgICAgaWdub3JlQ2xvc2VOb2RlczogdGhpcy5nZXRDbG9zZUlnbm9yZU5vZGVzLFxuICAgICAgICBvblNlbGVjdDogdGhpcy5vblNlbGVjdENob2ljZSxcbiAgICAgICAgb25DbG9zZTogdGhpcy5vbkNsb3NlQ2hvaWNlcyxcbiAgICAgICAgb25DaG9pY2VBY3Rpb246IHRoaXMub25DaG9pY2VBY3Rpb25cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaW5wdXRFbGVtID0gdGhpcy5nZXRJbnB1dEVsZW1lbnQoKTtcblxuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2N4KHRoaXMucHJvcHMuY2xhc3Nlcyl9XG4gICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgb25Gb2N1cz17dGhpcy5vbkZvY3VzQWN0aW9ufVxuICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJBY3Rpb259PlxuXG4gICAgICAgICAgPGRpdiByZWY9XCJ0b2dnbGVcIiBvbkNsaWNrPXt0aGlzLm9uVG9nZ2xlQ2hvaWNlc30+XG4gICAgICAgICAgICB7aW5wdXRFbGVtfVxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwic2VsZWN0LWFycm93XCIgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7Y2hvaWNlc0VsZW19XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hvaWNlc09yTG9hZGluZztcbiAgfSxcblxuICBnZXRJbnB1dEVsZW1lbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0VudGVyaW5nQ3VzdG9tVmFsdWUpIHtcbiAgICAgIHJldHVybiA8aW5wdXQgcmVmPVwiY3VzdG9tSW5wdXRcIiB0eXBlPVwidGV4dFwiIHZhbHVlPXt0aGlzLnByb3BzLmZpZWxkLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlfSBvbkZvY3VzPXt0aGlzLm9uRm9jdXNBY3Rpb259IG9uQmx1cj17dGhpcy5vbkJsdXJBY3Rpb259IC8+O1xuICAgIH1cblxuICAgIHJldHVybiA8aW5wdXQgdHlwZT1cInRleHRcIiB2YWx1ZT17dGhpcy5nZXREaXNwbGF5VmFsdWUoKX0gcmVhZE9ubHkgLz47XG4gIH0sXG5cbiAgZ2V0Q2xvc2VJZ25vcmVOb2RlczogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlZnMudG9nZ2xlLmdldERPTU5vZGUoKTtcbiAgfSxcblxuICBvblRvZ2dsZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldENob2ljZXNPcGVuKCF0aGlzLnN0YXRlLmlzQ2hvaWNlc09wZW4pO1xuICB9LFxuXG4gIHNldENob2ljZXNPcGVuOiBmdW5jdGlvbiAoaXNPcGVuKSB7XG4gICAgdmFyIGFjdGlvbiA9IGlzT3BlbiA/ICdvcGVuLXJlcGxhY2VtZW50cycgOiAnY2xvc2UtcmVwbGFjZW1lbnRzJztcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oYWN0aW9uKTtcbiAgICB0aGlzLnNldFN0YXRlKHsgaXNDaG9pY2VzT3BlbjogaXNPcGVuIH0pO1xuICB9LFxuXG4gIG9uU2VsZWN0Q2hvaWNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh2YWx1ZSk7XG4gIH0sXG5cbiAgb25DbG9zZUNob2ljZXM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0Nob2ljZXNPcGVuKSB7XG4gICAgICB0aGlzLnNldENob2ljZXNPcGVuKGZhbHNlKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0RGlzcGxheVZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXMuc3RhdGUudmFsdWU7XG4gICAgdmFyIGN1cnJlbnRDaG9pY2UgPSBfLmZpbmQodGhpcy5wcm9wcy5jaG9pY2VzLCBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICByZXR1cm4gY2hvaWNlLnZhbHVlID09PSBjdXJyZW50VmFsdWU7XG4gICAgfSk7XG5cbiAgICBpZiAoY3VycmVudENob2ljZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRDaG9pY2UubGFiZWw7XG4gICAgfVxuICAgIGlmIChjdXJyZW50VmFsdWUpIHsgLy8gIGN1c3RvbSB2YWx1ZVxuICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9LFxuXG4gIG9uQ2hvaWNlQWN0aW9uOiBmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgaWYgKGNob2ljZS5hY3Rpb24gPT09ICdlbnRlci1jdXN0b20tdmFsdWUnKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaXNFbnRlcmluZ0N1c3RvbVZhbHVlOiB0cnVlLFxuICAgICAgICBpc0Nob2ljZXNPcGVuOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZVxuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlZnMuY3VzdG9tSW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGlzQ2hvaWNlc09wZW46IGZhbHNlLFxuICAgICAgICB2YWx1ZTogY2hvaWNlLnZhbHVlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oY2hvaWNlLmFjdGlvbiwgY2hvaWNlKTtcbiAgfSxcblxuICBvbkFjdGlvbjogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIGlmIChwYXJhbXMuYWN0aW9uID09PSAnZW50ZXItY3VzdG9tLXZhbHVlJykge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNFbnRlcmluZ0N1c3RvbVZhbHVlOiB0cnVlfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlZnMuY3VzdG9tSW5wdXQuZ2V0RE9NTm9kZSgpLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5vbkJ1YmJsZUFjdGlvbihwYXJhbXMpO1xuICB9LFxuXG4gIG9uSW5wdXRDaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgfVxufSk7XG4iLCIvLyAjIHJlbW92ZS1pdGVtIGNvbXBvbmVudFxuXG4vKlxuUmVtb3ZlIGFuIGl0ZW0uXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0L2FkZG9ucycpO1xudmFyIFIgPSBSZWFjdC5ET007XG52YXIgY3ggPSBSZWFjdC5hZGRvbnMuY2xhc3NTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGRpc3BsYXlOYW1lOiAnUmVtb3ZlSXRlbScsXG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL2hlbHBlcicpXSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGFiZWw6ICdbcmVtb3ZlXSdcbiAgICB9O1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlbmRlcldpdGhDb25maWcoKTtcbiAgfSxcblxuICBvbk1vdXNlT3ZlclJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZSh0cnVlKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU91dFJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uTWF5YmVSZW1vdmUpIHtcbiAgICAgIHRoaXMucHJvcHMub25NYXliZVJlbW92ZShmYWxzZSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUi5zcGFuKHtcbiAgICAgIGNsYXNzTmFtZTogY3godGhpcy5wcm9wcy5jbGFzc2VzKSwgb25DbGljazogdGhpcy5wcm9wcy5vbkNsaWNrLFxuICAgICAgb25Nb3VzZU92ZXI6IHRoaXMub25Nb3VzZU92ZXJSZW1vdmUsIG9uTW91c2VPdXQ6IHRoaXMub25Nb3VzZU91dFJlbW92ZVxuICAgIH0sIHRoaXMucHJvcHMubGFiZWwpO1xuICB9XG59KTtcbiIsIi8vICMgaGVscCBjb21wb25lbnRcblxuLypcbkp1c3QgdGhlIGhlbHAgdGV4dCBibG9jay5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBjeCA9IFJlYWN0LmFkZG9ucy5jbGFzc1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZGlzcGxheU5hbWU6ICdTYW1wbGUnLFxuXG4gIG1peGluczogW3JlcXVpcmUoJy4uLy4uL21peGlucy9oZWxwZXInKV0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaG9pY2UgPSB0aGlzLnByb3BzLmNob2ljZTtcblxuICAgIHJldHVybiBjaG9pY2Uuc2FtcGxlID9cbiAgICAgIFIuZGl2KHtjbGFzc05hbWU6IGN4KHRoaXMucHJvcHMuY2xhc3NOYW1lKX0sXG4gICAgICAgIGNob2ljZS5zYW1wbGVcbiAgICAgICkgOlxuICAgICAgUi5zcGFuKG51bGwpO1xuICB9XG59KTtcbiIsIi8vICMgc2VsZWN0LXZhbHVlIGNvbXBvbmVudFxuXG4vKlxuUmVuZGVyIGEgc2VsZWN0IGRyb3Bkb3duIGZvciBhIGxpc3Qgb2YgY2hvaWNlcy4gQ2hvaWNlcyB2YWx1ZXMgY2FuIGJlIG9mIGFueVxudHlwZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xudmFyIGN4ID0gUmVhY3QuYWRkb25zLmNsYXNzU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ1NlbGVjdFZhbHVlJyxcblxuICBtaXhpbnM6IFtyZXF1aXJlKCcuLi8uLi9taXhpbnMvaGVscGVyJyldLFxuXG4gIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgY2hvaWNlVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgdmFyIGNob2ljZVR5cGUgPSBjaG9pY2VWYWx1ZS5zdWJzdHJpbmcoMCwgY2hvaWNlVmFsdWUuaW5kZXhPZignOicpKTtcbiAgICBpZiAoY2hvaWNlVHlwZSA9PT0gJ2Nob2ljZScpIHtcbiAgICAgIHZhciBjaG9pY2VJbmRleCA9IGNob2ljZVZhbHVlLnN1YnN0cmluZyhjaG9pY2VWYWx1ZS5pbmRleE9mKCc6JykgKyAxKTtcbiAgICAgIGNob2ljZUluZGV4ID0gcGFyc2VJbnQoY2hvaWNlSW5kZXgpO1xuICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLmNob2ljZXNbY2hvaWNlSW5kZXhdLnZhbHVlKTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyV2l0aENvbmZpZygpO1xuICB9LFxuXG4gIHJlbmRlckRlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG4gICAgdmFyIGNob2ljZXMgPSB0aGlzLnByb3BzLmNob2ljZXMgfHwgW107XG5cbiAgICB2YXIgY2hvaWNlc09yTG9hZGluZztcblxuICAgIGlmIChjaG9pY2VzLmxlbmd0aCA9PT0gMSAmJiBjaG9pY2VzWzBdLnZhbHVlID09PSAnLy8vbG9hZGluZy8vLycpIHtcbiAgICAgIGNob2ljZXNPckxvYWRpbmcgPSBjb25maWcuY3JlYXRlRWxlbWVudCgnbG9hZGluZy1jaG9pY2VzJywge30pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnByb3BzLmZpZWxkLnZhbHVlICE9PSB1bmRlZmluZWQgPyB0aGlzLnByb3BzLmZpZWxkLnZhbHVlIDogJyc7XG5cbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2hvaWNlVmFsdWU6ICdjaG9pY2U6JyArIGksXG4gICAgICAgICAgdmFsdWU6IGNob2ljZS52YWx1ZSxcbiAgICAgICAgICBsYWJlbDogY2hvaWNlLmxhYmVsXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgdmFyIHZhbHVlQ2hvaWNlID0gXy5maW5kKGNob2ljZXMsIGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICAgICAgcmV0dXJuIGNob2ljZS52YWx1ZSA9PT0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHZhbHVlQ2hvaWNlID09PSB1bmRlZmluZWQpIHtcblxuICAgICAgICB2YXIgbGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgaWYgKCFfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgIGxhYmVsID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlQ2hvaWNlID0ge1xuICAgICAgICAgIGNob2ljZVZhbHVlOiAndmFsdWU6JyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgIH07XG4gICAgICAgIGNob2ljZXMgPSBbdmFsdWVDaG9pY2VdLmNvbmNhdChjaG9pY2VzKTtcbiAgICAgIH1cblxuICAgICAgY2hvaWNlc09yTG9hZGluZyA9IFIuc2VsZWN0KHtcbiAgICAgICAgY2xhc3NOYW1lOiBjeCh0aGlzLnByb3BzLmNsYXNzZXMpLFxuICAgICAgICBvbkNoYW5nZTogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlQ2hvaWNlLmNob2ljZVZhbHVlLFxuICAgICAgICBvbkZvY3VzOiB0aGlzLm9uRm9jdXNBY3Rpb24sXG4gICAgICAgIG9uQmx1cjogdGhpcy5vbkJsdXJBY3Rpb25cbiAgICAgIH0sXG4gICAgICBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlLCBpKSB7XG4gICAgICAgIHJldHVybiBSLm9wdGlvbih7XG4gICAgICAgICAga2V5OiBpLFxuICAgICAgICAgIHZhbHVlOiBjaG9pY2UuY2hvaWNlVmFsdWVcbiAgICAgICAgfSwgY2hvaWNlLmxhYmVsKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBjaG9pY2VzT3JMb2FkaW5nO1xufVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG4vLyBDb25zdGFudCBmb3IgZmlyc3QgdW51c2VkIHNwZWNpYWwgdXNlIGNoYXJhY3Rlci5cbi8vIFNlZSBJTVBMRU1FTlRBVElPTiBOT1RFIGluIHByZXR0eS10ZXh0Mi5qcy5cbnZhciBGSVJTVF9TUEVDSUFMX0NIQVIgPSAweGUwMDA7XG5cbi8vIHJlZ2V4cCB1c2VkIHRvIGdyZXAgb3V0IHRhZ3MgbGlrZSB7e2ZpcnN0TmFtZX19XG52YXIgVEFHU19SRUdFWFAgPSAvXFx7XFx7KC4rPylcXH1cXH0vZztcblxuLy8gWmFwaWVyIHNwZWNpZmljIHN0dWZmLiBNYWtlIGEgcGx1Z2luIGZvciB0aGlzIGxhdGVyLlxuZnVuY3Rpb24gcmVtb3ZlSWRQcmVmaXgoa2V5KSB7XG4gIHJldHVybiBTdHJpbmcoa2V5KS5yZXBsYWNlKC9eWzAtOV0rX18vLCAnJyk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ2hvaWNlc01hcChyZXBsYWNlQ2hvaWNlcykge1xuICB2YXIgY2hvaWNlcyA9IHt9O1xuICByZXBsYWNlQ2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UpIHtcbiAgICB2YXIga2V5ID0gcmVtb3ZlSWRQcmVmaXgoY2hvaWNlLnZhbHVlKTtcbiAgICBjaG9pY2VzW2tleV0gPSBjaG9pY2UubGFiZWw7XG4gIH0pO1xuICByZXR1cm4gY2hvaWNlcztcbn1cblxuLypcbiAgIENyZWF0ZXMgaGVscGVyIHRvIHRyYW5zbGF0ZSBiZXR3ZWVuIHRhZ3MgbGlrZSB7e2ZpcnN0TmFtZX19IGFuZFxuICAgYW4gZW5jb2RlZCByZXByZXNlbnRhdGlvbiBzdWl0YWJsZSBmb3IgdXNlIGluIENvZGVNaXJyb3IuXG5cbiAgIFNlZSBJTVBMRU1FTlRBVElPTiBOT1RFIGluIHByZXR0eS10ZXh0Mi5qcy5cbiAqL1xuZnVuY3Rpb24gVGFnVHJhbnNsYXRvcihyZXBsYWNlQ2hvaWNlcywgaHVtYW5pemUpIHtcbiAgdmFyIG5leHRDaGFyQ29kZSA9IEZJUlNUX1NQRUNJQUxfQ0hBUjtcblxuICAvLyBNYXAgb2YgdGFnIHRvIGxhYmVsICdmaXJzdE5hbWUnIC0tPiAnRmlyc3QgTmFtZSdcbiAgdmFyIGNob2ljZXMgPSB7fTtcblxuICAvLyBUbyBoZWxwIHRyYW5zbGF0ZSB0byBhbmQgZnJvbSB0aGUgQ00gcmVwcmVzZW50YXRpb24gd2l0aCB0aGUgc3BlY2lhbFxuICAvLyBjaGFyYWN0ZXJzLCBidWlsZCB0d28gbWFwczpcbiAgLy8gICAtIGNoYXJUb1RhZ01hcDogc3BlY2lhbCBjaGFyIHRvIHRhZyAtIGkuZS4geyAnXFx1ZTAwMCc6ICdmaXJzdE5hbWUnIH1cbiAgLy8gICAtIHRhZ1RvQ2hhck1hcDogdGFnIHRvIHNwZWNpYWwgY2hhciwgaS5lLiB7IGZpcnN0TmFtZTogJ1xcdWUwMDAnIH1cbiAgdmFyIGNoYXJUb1RhZ01hcCA9IHt9O1xuICB2YXIgdGFnVG9DaGFyTWFwID0ge307XG5cbiAgZnVuY3Rpb24gYWRkQ2hvaWNlcyhjaG9pY2VzQXJyYXkpIHtcbiAgICBjaG9pY2VzID0gYnVpbGRDaG9pY2VzTWFwKGNob2ljZXNBcnJheSk7XG5cbiAgICBPYmplY3Qua2V5cyhjaG9pY2VzKS5zb3J0KCkuZm9yRWFjaChmdW5jdGlvbiAodGFnKSB7XG4gICAgICBpZiAodGFnVG9DaGFyTWFwW3RhZ10pIHtcbiAgICAgICAgcmV0dXJuOyAvLyB3ZSBhbHJlYWR5IGhhdmUgdGhpcyB0YWcgbWFwcGVkXG4gICAgICB9XG5cbiAgICAgIHZhciBjaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUrKyk7XG4gICAgICBjaGFyVG9UYWdNYXBbY2hhcl0gPSB0YWc7XG4gICAgICB0YWdUb0NoYXJNYXBbdGFnXSA9IGNoYXI7XG4gICAgfSk7XG4gIH1cblxuICBhZGRDaG9pY2VzKHJlcGxhY2VDaG9pY2VzKTtcblxuICByZXR1cm4ge1xuICAgIHNwZWNpYWxDaGFyc1JlZ2V4cDogL1tcXHVlMDAwLVxcdWVmZmZdL2csXG5cbiAgICBhZGRDaG9pY2VzOiBhZGRDaG9pY2VzLFxuXG4gICAgLypcbiAgICAgICBDb252ZXJ0IHRhZyB0byBlbmNvZGVkIGNoYXJhY3Rlci4gRm9yIGV4YW1wbGVcbiAgICAgICAnZmlyc3ROYW1lJyBiZWNvbWVzICdcXHVlMDAwJy5cbiAgICAgKi9cbiAgICBlbmNvZGVUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgIHRhZyA9IHJlbW92ZUlkUHJlZml4KHRhZyk7XG4gICAgICBpZiAoIXRhZ1RvQ2hhck1hcFt0YWddKSB7XG4gICAgICAgIHZhciBjaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUrKyk7XG4gICAgICAgIHRhZ1RvQ2hhck1hcFt0YWddID0gY2hhcjtcbiAgICAgICAgY2hhclRvVGFnTWFwW2NoYXJdID0gdGFnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRhZ1RvQ2hhck1hcFt0YWddO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAgIENvbnZlcnQgdGV4dCB2YWx1ZSB0byBlbmNvZGVkIHZhbHVlIGZvciBDb2RlTWlycm9yLiBGb3IgZXhhbXBsZVxuICAgICAgICdoZWxsbyB7e2ZpcnN0TmFtZX19JyBiZWNvbWVzICdoZWxsbyBcXHVlMDAwJ1xuICAgICAqL1xuICAgIGVuY29kZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoVEFHU19SRUdFWFAsIGZ1bmN0aW9uIChtLCB0YWcpIHtcbiAgICAgICAgdGFnID0gcmVtb3ZlSWRQcmVmaXgodGFnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW5jb2RlVGFnKHRhZyk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAgIENvbnZlcnQgZW5jb2RlZCB0ZXh0IHVzZWQgaW4gQ00gdG8gdGFnZ2VkIHRleHQuIEZvciBleGFtcGxlXG4gICAgICAgJ2hlbGxvIFxcdWUwMDAnIGJlY29tZXMgJ2hlbGxvIHt7Zmlyc3ROYW1lfX0nXG4gICAgICovXG4gICAgZGVjb2RlVmFsdWU6IGZ1bmN0aW9uIChlbmNvZGVkVmFsdWUpIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZW5jb2RlZFZhbHVlKS5yZXBsYWNlKHRoaXMuc3BlY2lhbENoYXJzUmVnZXhwLCBmdW5jdGlvbiAoYykge1xuICAgICAgICB2YXIgdGFnID0gY2hhclRvVGFnTWFwW2NdO1xuICAgICAgICByZXR1cm4gJ3t7JyArIHRhZyArICd9fSc7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgICBDb252ZXJ0IGVuY29kZWQgY2hhcmFjdGVyIHRvIGxhYmVsLiBGb3IgZXhhbXBsZVxuICAgICAgICdcXHVlMDAwJyBiZWNvbWVzICdMYXN0IE5hbWUnLlxuICAgICAqL1xuICAgIGRlY29kZUNoYXI6IGZ1bmN0aW9uIChjaGFyKSB7XG4gICAgICB2YXIgdGFnID0gY2hhclRvVGFnTWFwW2NoYXJdO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TGFiZWwodGFnKTtcbiAgICB9LFxuXG4gICAgLypcbiAgICAgICBDb252ZXJ0IHRhZ2dlZCB2YWx1ZSB0byBIVE1MLiBGb3IgZXhhbXBsZVxuICAgICAgICdoZWxsbyB7e2ZpcnN0TmFtZX19JyBiZWNvbWVzICdoZWxsbyA8c3BhbiBjbGFzcz1cInRhZ1wiPkZpcnN0IE5hbWU8L3NwYW4+J1xuICAgICAqL1xuICAgIHRvSHRtbDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKFRBR1NfUkVHRVhQLCBmdW5jdGlvbiAobSwgbXVzdGFjaGUpIHtcbiAgICAgICAgdmFyIHRhZyA9IG11c3RhY2hlLnJlcGxhY2UoJ3t7JywgJycpLnJlcGxhY2UoJ319JywgJycpO1xuICAgICAgICB0YWcgPSByZW1vdmVJZFByZWZpeCh0YWcpO1xuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLmdldExhYmVsKHRhZyk7XG4gICAgICAgIHJldHVybiAnPHNwYW4gY2xhc3M9XCJwcmV0dHktcGFydFwiPicgKyBsYWJlbCArICc8L3NwYW4+JztcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qXG4gICAgICAgR2V0IGxhYmVsIGZvciB0YWcuICBGb3IgZXhhbXBsZSAnZmlyc3ROYW1lJyBiZWNvbWVzICdGaXJzdCBOYW1lJy5cbiAgICAgICBSZXR1cm5zIGEgaHVtYW5pemVkIHZlcnNpb24gb2YgdGhlIHRhZyBpZiB3ZSBkb24ndCBoYXZlIGEgbGFiZWwgZm9yIHRoZSB0YWcuXG4gICAgICovXG4gICAgZ2V0TGFiZWw6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgIHRhZyA9IHJlbW92ZUlkUHJlZml4KHRhZyk7XG4gICAgICB2YXIgbGFiZWwgPSBjaG9pY2VzW3RhZ107XG4gICAgICBpZiAoIWxhYmVsKSB7XG4gICAgICAgIC8vIElmIHRhZyBub3QgZm91bmQgYW5kIHdlIGhhdmUgYSBodW1hbml6ZSBmdW5jdGlvbiwgaHVtYW5pemUgdGhlIHRhZy5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGp1c3QgcmV0dXJuIHRoZSB0YWcuXG4gICAgICAgIGxhYmVsID0gaHVtYW5pemUgJiYgaHVtYW5pemUodGFnKSB8fCB0YWc7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGFiZWw7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRhZ1RyYW5zbGF0b3I7XG4iLCIvLyAjIGRlZmF1bHQtY29uZmlnXG5cbi8qXG5UaGlzIGlzIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcGx1Z2luIGZvciBmb3JtYXRpYy4gVG8gY2hhbmdlIGZvcm1hdGljJ3NcbmJlaGF2aW9yLCBqdXN0IGNyZWF0ZSB5b3VyIG93biBwbHVnaW4gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoXG5tZXRob2RzIHlvdSB3YW50IHRvIGFkZCBvciBvdmVycmlkZS5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QvYWRkb25zJyk7XG52YXIgUiA9IFJlYWN0LkRPTTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBkZWxlZ2F0ZVRvID0gdXRpbHMuZGVsZWdhdG9yKGNvbmZpZyk7XG5cbiAgcmV0dXJuIHtcblxuICAgIC8vIEZpZWxkIGVsZW1lbnQgZmFjdG9yaWVzLiBDcmVhdGUgZmllbGQgZWxlbWVudHMuXG5cbiAgICBjcmVhdGVFbGVtZW50X0ZpZWxkczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2ZpZWxkcycpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc3RyaW5nJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TaW5nbGVMaW5lU3RyaW5nOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvc2luZ2xlLWxpbmUtc3RyaW5nJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TZWxlY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9zZWxlY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS1zZWxlY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0Jvb2xlYW46IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9ib29sZWFuJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9QcmV0dHlCb29sZWFuOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvcHJldHR5LWJvb2xlYW4nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0NoZWNrYm94Qm9vbGVhbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWJvb2xlYW4nKSksXG5cbiAgICAvLyBjcmVhdGVFbGVtZW50X1ByZXR0eVRleHQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9wcmV0dHktdGV4dCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfUHJldHR5VGV4dDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL3ByZXR0eS10ZXh0MicpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9hcnJheScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hlY2tib3hBcnJheTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvZmllbGRzL2NoZWNrYm94LWFycmF5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3Q6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9vYmplY3QnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0pzb246IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy9qc29uJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Vbmtub3duRmllbGQ6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2ZpZWxkcy91bmtub3duJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Db3B5OiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9maWVsZHMvY29weScpKSxcblxuXG4gICAgLy8gT3RoZXIgZWxlbWVudCBmYWN0b3JpZXMuIENyZWF0ZSBoZWxwZXIgZWxlbWVudHMgdXNlZCBieSBmaWVsZCBjb21wb25lbnRzLlxuXG4gICAgY3JlYXRlRWxlbWVudF9GaWVsZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9maWVsZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTGFiZWw6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvbGFiZWwnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0hlbHA6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvaGVscCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9jaG9pY2VzJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9Mb2FkaW5nQ2hvaWNlczogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9sb2FkaW5nLWNob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FycmF5Q29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9hcnJheS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9BcnJheUl0ZW1Db250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0tY29udHJvbCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYXJyYXktaXRlbS12YWx1ZScpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfQXJyYXlJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2FycmF5LWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0ZpZWxkVGVtcGxhdGVDaG9pY2VzOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL2ZpZWxkLXRlbXBsYXRlLWNob2ljZXMnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0FkZEl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvYWRkLWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1JlbW92ZUl0ZW06IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvcmVtb3ZlLWl0ZW0nKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X01vdmVJdGVtRm9yd2FyZDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9tb3ZlLWl0ZW0tZm9yd2FyZCcpKSxcblxuICAgIGNyZWF0ZUVsZW1lbnRfTW92ZUl0ZW1CYWNrOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL21vdmUtaXRlbS1iYWNrJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RDb250cm9sOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtQ29udHJvbDogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9vYmplY3QtaXRlbS1jb250cm9sJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtVmFsdWU6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0tdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X09iamVjdEl0ZW1LZXk6IFJlYWN0LmNyZWF0ZUZhY3RvcnkocmVxdWlyZSgnLi9jb21wb25lbnRzL2hlbHBlcnMvb2JqZWN0LWl0ZW0ta2V5JykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9PYmplY3RJdGVtOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL29iamVjdC1pdGVtJykpLFxuXG4gICAgY3JlYXRlRWxlbWVudF9TZWxlY3RWYWx1ZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zZWxlY3QtdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1ByZXR0eVNlbGVjdFZhbHVlOiBSZWFjdC5jcmVhdGVGYWN0b3J5KHJlcXVpcmUoJy4vY29tcG9uZW50cy9oZWxwZXJzL3ByZXR0eS1zZWxlY3QtdmFsdWUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X1NhbXBsZTogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9zYW1wbGUnKSksXG5cbiAgICBjcmVhdGVFbGVtZW50X0luc2VydEJ1dHRvbjogUmVhY3QuY3JlYXRlRmFjdG9yeShyZXF1aXJlKCcuL2NvbXBvbmVudHMvaGVscGVycy9pbnNlcnQtYnV0dG9uJykpLFxuXG5cbiAgICAvLyBGaWVsZCBkZWZhdWx0IHZhbHVlIGZhY3Rvcmllcy4gR2l2ZSBhIGRlZmF1bHQgdmFsdWUgZm9yIGEgc3BlY2lmaWMgdHlwZS5cblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TdHJpbmc6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3Q6IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheTogZnVuY3Rpb24gKC8qIGZpZWxkVGVtcGxhdGUgKi8pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9LFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uICgvKiBmaWVsZFRlbXBsYXRlICovKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9GaWVsZHM6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfU2VsZWN0OiBkZWxlZ2F0ZVRvKCdjcmVhdGVEZWZhdWx0VmFsdWVfU3RyaW5nJyksXG5cbiAgICBjcmVhdGVEZWZhdWx0VmFsdWVfSnNvbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX09iamVjdCcpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NyZWF0ZURlZmF1bHRWYWx1ZV9BcnJheScpLFxuXG4gICAgY3JlYXRlRGVmYXVsdFZhbHVlX0NoZWNrYm94Qm9vbGVhbjogZGVsZWdhdGVUbygnY3JlYXRlRGVmYXVsdFZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgdmFsdWUgY29lcmNlcnMuIENvZXJjZSBhIHZhbHVlIGludG8gYSB2YWx1ZSBhcHByb3ByaWF0ZSBmb3IgYSBzcGVjaWZpYyB0eXBlLlxuXG4gICAgY29lcmNlVmFsdWVfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9LFxuXG4gICAgY29lcmNlVmFsdWVfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBjb2VyY2VWYWx1ZV9BcnJheTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUsIHZhbHVlKSB7XG4gICAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0Jvb2xlYW46IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb2VyY2VWYWx1ZVRvQm9vbGVhbih2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNvZXJjZVZhbHVlX0ZpZWxkczogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfT2JqZWN0JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9TaW5nbGVMaW5lU3RyaW5nOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9TdHJpbmcnKSxcblxuICAgIGNvZXJjZVZhbHVlX1NlbGVjdDogZGVsZWdhdGVUbygnY29lcmNlVmFsdWVfU3RyaW5nJyksXG5cbiAgICBjb2VyY2VWYWx1ZV9Kc29uOiBkZWxlZ2F0ZVRvKCdjb2VyY2VWYWx1ZV9PYmplY3QnKSxcblxuICAgIGNvZXJjZVZhbHVlX0NoZWNrYm94QXJyYXk6IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0FycmF5JyksXG5cbiAgICBjb2VyY2VWYWx1ZV9DaGVja2JveEJvb2xlYW46IGRlbGVnYXRlVG8oJ2NvZXJjZVZhbHVlX0Jvb2xlYW4nKSxcblxuXG4gICAgLy8gRmllbGQgY2hpbGQgZmllbGRzIGZhY3Rvcmllcywgc28gc29tZSB0eXBlcyBjYW4gaGF2ZSBkeW5hbWljIGNoaWxkcmVuLlxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfQXJyYXk6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gZmllbGQudmFsdWUubWFwKGZ1bmN0aW9uIChhcnJheUl0ZW0sIGkpIHtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5jaGlsZEZpZWxkVGVtcGxhdGVGb3JWYWx1ZShmaWVsZCwgYXJyYXlJdGVtKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGksIGZpZWxkSW5kZXg6IGksIHZhbHVlOiBhcnJheUl0ZW1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHNfT2JqZWN0OiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpZWxkLnZhbHVlKS5tYXAoZnVuY3Rpb24gKGtleSwgaSkge1xuICAgICAgICB2YXIgY2hpbGRGaWVsZFRlbXBsYXRlID0gY29uZmlnLmNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlKGZpZWxkLCBmaWVsZC52YWx1ZVtrZXldKTtcblxuICAgICAgICB2YXIgY2hpbGRGaWVsZCA9IGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2tleV1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBmYWN0b3J5IGZvciB0aGUgbmFtZS5cbiAgICBoYXNFbGVtZW50RmFjdG9yeTogZnVuY3Rpb24gKG5hbWUpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0gPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhbiBlbGVtZW50IGdpdmVuIGEgbmFtZSwgcHJvcHMsIGFuZCBjaGlsZHJlbi5cbiAgICBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbiAobmFtZSwgcHJvcHMsIGNoaWxkcmVuKSB7XG5cbiAgICAgIGlmICghcHJvcHMuY29uZmlnKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y29uZmlnOiBjb25maWd9KTtcbiAgICAgIH1cblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlRWxlbWVudF8nICsgbmFtZV0ocHJvcHMsIGNoaWxkcmVuKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5hbWUgIT09ICdVbmtub3duJykge1xuICAgICAgICBpZiAoY29uZmlnLmhhc0VsZW1lbnRGYWN0b3J5KCdVbmtub3duJykpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUVsZW1lbnQoJ1Vua25vd24nLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFjdG9yeSBub3QgZm91bmQgZm9yOiAnICsgbmFtZSk7XG4gICAgfSxcblxuICAgIC8vIENyZWF0ZSBhIGZpZWxkIGVsZW1lbnQgZ2l2ZW4gc29tZSBwcm9wcy4gVXNlIGNvbnRleHQgdG8gZGV0ZXJtaW5lIG5hbWUuXG4gICAgY3JlYXRlRmllbGRFbGVtZW50OiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShwcm9wcy5maWVsZCk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzRWxlbWVudEZhY3RvcnkobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KG5hbWUsIHByb3BzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVFbGVtZW50KCdVbmtub3duRmllbGQnLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIC8vIFJlbmRlciB0aGUgcm9vdCBmb3JtYXRpYyBjb21wb25lbnRcbiAgICByZW5kZXJGb3JtYXRpY0NvbXBvbmVudDogZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuXG4gICAgICB2YXIgcHJvcHMgPSBjb21wb25lbnQucHJvcHM7XG5cbiAgICAgIHZhciBmaWVsZCA9IGNvbmZpZy5jcmVhdGVSb290RmllbGQocHJvcHMpO1xuXG4gICAgICByZXR1cm4gUi5kaXYoe2NsYXNzTmFtZTogJ2Zvcm1hdGljJ30sXG4gICAgICAgIGNvbmZpZy5jcmVhdGVGaWVsZEVsZW1lbnQoe2ZpZWxkOiBmaWVsZCwgb25DaGFuZ2U6IGNvbXBvbmVudC5vbkNoYW5nZSwgb25BY3Rpb246IGNvbXBvbmVudC5vbkFjdGlvbn0pXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvLyBSZW5kZXIgYW55IGNvbXBvbmVudC5cbiAgICByZW5kZXJDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IuZGlzcGxheU5hbWU7XG5cbiAgICAgIGlmIChjb25maWdbJ3JlbmRlckNvbXBvbmVudF8nICsgbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1sncmVuZGVyQ29tcG9uZW50XycgKyBuYW1lXShjb21wb25lbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tcG9uZW50LnJlbmRlckRlZmF1bHQoKTtcbiAgICB9LFxuXG4gICAgLy8gUmVuZGVyIGZpZWxkIGNvbXBvbmVudHMuXG4gICAgcmVuZGVyRmllbGRDb21wb25lbnQ6IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5yZW5kZXJDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICB9LFxuXG4gICAgLy8gTm9ybWFsaXplIGFuIGVsZW1lbnQgbmFtZS5cbiAgICBlbGVtZW50TmFtZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiB1dGlscy5kYXNoVG9QYXNjYWwobmFtZSk7XG4gICAgfSxcblxuICAgIC8vIFR5cGUgYWxpYXNlcy5cblxuICAgIGFsaWFzX0RpY3Q6ICdPYmplY3QnLFxuXG4gICAgYWxpYXNfQm9vbDogJ0Jvb2xlYW4nLFxuXG4gICAgYWxpYXNfUHJldHR5VGV4dGFyZWE6ICdQcmV0dHlUZXh0JyxcblxuICAgIGFsaWFzX1NpbmdsZUxpbmVTdHJpbmc6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdTaW5nbGVMaW5lU3RyaW5nJztcbiAgICB9LFxuXG4gICAgYWxpYXNfU3RyaW5nOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuXG4gICAgICBpZiAoZmllbGRUZW1wbGF0ZS5yZXBsYWNlQ2hvaWNlcykge1xuICAgICAgICByZXR1cm4gJ1ByZXR0eVRleHQnO1xuICAgICAgfSBlbHNlIGlmIChmaWVsZFRlbXBsYXRlLmNob2ljZXMpIHtcbiAgICAgICAgcmV0dXJuICdTZWxlY3QnO1xuICAgICAgfSBlbHNlIGlmIChjb25maWcuZmllbGRUZW1wbGF0ZUlzU2luZ2xlTGluZShmaWVsZFRlbXBsYXRlKSkge1xuICAgICAgICByZXR1cm4gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuICdTdHJpbmcnO1xuICAgIH0sXG5cbiAgICBhbGlhc19UZXh0OiBkZWxlZ2F0ZVRvKCdhbGlhc19TdHJpbmcnKSxcblxuICAgIGFsaWFzX1VuaWNvZGU6IGRlbGVnYXRlVG8oJ2FsaWFzX1NpbmdsZUxpbmVTdHJpbmcnKSxcblxuICAgIGFsaWFzX1N0cjogZGVsZWdhdGVUbygnYWxpYXNfU2luZ2xlTGluZVN0cmluZycpLFxuXG4gICAgYWxpYXNfTGlzdDogJ0FycmF5JyxcblxuICAgIGFsaWFzX0NoZWNrYm94TGlzdDogJ0NoZWNrYm94QXJyYXknLFxuXG4gICAgYWxpYXNfRmllbGRzZXQ6ICdGaWVsZHMnLFxuXG4gICAgYWxpYXNfQ2hlY2tib3g6ICdDaGVja2JveEJvb2xlYW4nLFxuXG4gICAgLy8gRmllbGQgZmFjdG9yeVxuXG4gICAgLy8gR2l2ZW4gYSBmaWVsZCwgZXhwYW5kIGFsbCBjaGlsZCBmaWVsZHMgcmVjdXJzaXZlbHkgdG8gZ2V0IHRoZSBkZWZhdWx0XG4gICAgLy8gdmFsdWVzIG9mIGFsbCBmaWVsZHMuXG4gICAgaW5mbGF0ZUZpZWxkVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgZmllbGRIYW5kbGVyKSB7XG5cbiAgICAgIGlmIChmaWVsZEhhbmRsZXIpIHtcbiAgICAgICAgdmFyIHN0b3AgPSBmaWVsZEhhbmRsZXIoZmllbGQpO1xuICAgICAgICBpZiAoc3RvcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuZmllbGRIYXNWYWx1ZUNoaWxkcmVuKGZpZWxkKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBfLmNsb25lKGZpZWxkLnZhbHVlKTtcbiAgICAgICAgdmFyIGNoaWxkRmllbGRzID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGRzKGZpZWxkKTtcbiAgICAgICAgY2hpbGRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRGaWVsZCkge1xuICAgICAgICAgIGlmIChjb25maWcuaXNLZXkoY2hpbGRGaWVsZC5rZXkpKSB7XG4gICAgICAgICAgICB2YWx1ZVtjaGlsZEZpZWxkLmtleV0gPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmllbGQudmFsdWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHJvb3QgZmllbGQuXG4gICAgaW5pdFJvb3RGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkLCBwcm9wcyAqLykge1xuICAgIH0sXG5cbiAgICAvLyBJbml0aWFsaXplIGV2ZXJ5IGZpZWxkLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKC8qIGZpZWxkICovKSB7XG4gICAgfSxcblxuICAgIC8vIElmIGFuIGFycmF5IG9mIGZpZWxkIHRlbXBsYXRlcyBhcmUgcGFzc2VkIGluLCB0aGlzIG1ldGhvZCBpcyB1c2VkIHRvXG4gICAgLy8gd3JhcCB0aGUgZmllbGRzIGluc2lkZSBhIHNpbmdsZSByb290IGZpZWxkIHRlbXBsYXRlLlxuICAgIHdyYXBGaWVsZFRlbXBsYXRlczogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGVzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZmllbGRzJyxcbiAgICAgICAgcGxhaW46IHRydWUsXG4gICAgICAgIGZpZWxkczogZmllbGRUZW1wbGF0ZXNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIHRoZSBwcm9wcyB0aGF0IGFyZSBwYXNzZWQgaW4sIGNyZWF0ZSB0aGUgcm9vdCBmaWVsZC5cbiAgICBjcmVhdGVSb290RmllbGQ6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZmllbGRUZW1wbGF0ZSA9IHByb3BzLmZpZWxkVGVtcGxhdGUgfHwgcHJvcHMuZmllbGRUZW1wbGF0ZXMgfHwgcHJvcHMuZmllbGQgfHwgcHJvcHMuZmllbGRzO1xuICAgICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWU7XG5cbiAgICAgIGlmICghZmllbGRUZW1wbGF0ZSkge1xuICAgICAgICBmaWVsZFRlbXBsYXRlID0gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoXy5pc0FycmF5KGZpZWxkVGVtcGxhdGUpKSB7XG4gICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcud3JhcEZpZWxkVGVtcGxhdGVzKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZmllbGQgPSBfLmV4dGVuZCh7fSwgZmllbGRUZW1wbGF0ZSwge3Jhd0ZpZWxkVGVtcGxhdGU6IGZpZWxkVGVtcGxhdGV9KTtcbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUoZmllbGRUZW1wbGF0ZSwgdmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKGZpZWxkVGVtcGxhdGUsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShmaWVsZFRlbXBsYXRlKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmluaXRSb290RmllbGQoZmllbGQsIHByb3BzKTtcbiAgICAgIGNvbmZpZy5pbml0RmllbGQoZmllbGQpO1xuXG4gICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgY29uZmlnLmlzRW1wdHlPYmplY3QodmFsdWUpIHx8IF8uaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkLnZhbHVlID0gY29uZmlnLmluZmxhdGVGaWVsZFZhbHVlKGZpZWxkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiB0aGUgcHJvcHMgdGhhdCBhcmUgcGFzc2VkIGluLCBjcmVhdGUgdGhlIHZhbHVlIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWRcbiAgICAvLyBieSBhbGwgdGhlIGNvbXBvbmVudHMuXG4gICAgY3JlYXRlUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMsIGZpZWxkSGFuZGxlcikge1xuXG4gICAgICB2YXIgZmllbGQgPSBjb25maWcuY3JlYXRlUm9vdEZpZWxkKHByb3BzKTtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5pbmZsYXRlRmllbGRWYWx1ZShmaWVsZCwgZmllbGRIYW5kbGVyKTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVSb290VmFsdWU6IGZ1bmN0aW9uIChwcm9wcykge1xuXG4gICAgICB2YXIgZXJyb3JzID0gW107XG5cbiAgICAgIGNvbmZpZy5jcmVhdGVSb290VmFsdWUocHJvcHMsIGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICB2YXIgZmllbGRFcnJvcnMgPSBjb25maWcuZmllbGRFcnJvcnMoZmllbGQpO1xuICAgICAgICBpZiAoZmllbGRFcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHBhdGg6IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZCksXG4gICAgICAgICAgICBlcnJvcnM6IGZpZWxkRXJyb3JzXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH0sXG5cbiAgICBpc1ZhbGlkUm9vdFZhbHVlOiBmdW5jdGlvbiAocHJvcHMpIHtcblxuICAgICAgdmFyIGlzVmFsaWQgPSB0cnVlO1xuXG4gICAgICBjb25maWcuY3JlYXRlUm9vdFZhbHVlKHByb3BzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5maWVsZEVycm9ycyhmaWVsZCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVGaWVsZDogZnVuY3Rpb24gKGZpZWxkLCBlcnJvcnMpIHtcblxuICAgICAgaWYgKGZpZWxkLnZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIGlmIChjb25maWcuZmllbGRJc1JlcXVpcmVkKGZpZWxkKSkge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdyZXF1aXJlZCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgZHluYW1pYyBjaGlsZCBmaWVsZHMgZm9yIGEgZmllbGQuXG4gICAgY3JlYXRlQ2hpbGRGaWVsZHM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgdHlwZU5hbWUgPSBjb25maWcuZmllbGRUeXBlTmFtZShmaWVsZCk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZUNoaWxkRmllbGRzXycgKyB0eXBlTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1snY3JlYXRlQ2hpbGRGaWVsZHNfJyArIHR5cGVOYW1lXShmaWVsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKS5tYXAoZnVuY3Rpb24gKGNoaWxkRmllbGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5jcmVhdGVDaGlsZEZpZWxkKGZpZWxkLCB7XG4gICAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZCwga2V5OiBjaGlsZEZpZWxkLmtleSwgZmllbGRJbmRleDogaSwgdmFsdWU6IGZpZWxkLnZhbHVlW2NoaWxkRmllbGQua2V5XVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBzaW5nbGUgY2hpbGQgZmllbGQgZm9yIGEgcGFyZW50IGZpZWxkLlxuICAgIGNyZWF0ZUNoaWxkRmllbGQ6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgb3B0aW9ucykge1xuXG4gICAgICB2YXIgY2hpbGRWYWx1ZSA9IG9wdGlvbnMudmFsdWU7XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gXy5leHRlbmQoe30sIG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwge1xuICAgICAgICBrZXk6IG9wdGlvbnMua2V5LCBwYXJlbnQ6IHBhcmVudEZpZWxkLCBmaWVsZEluZGV4OiBvcHRpb25zLmZpZWxkSW5kZXgsXG4gICAgICAgIHJhd0ZpZWxkVGVtcGxhdGU6IG9wdGlvbnMuZmllbGRUZW1wbGF0ZVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChjb25maWcuaGFzVmFsdWUob3B0aW9ucy5maWVsZFRlbXBsYXRlLCBjaGlsZFZhbHVlKSkge1xuICAgICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNvZXJjZVZhbHVlKG9wdGlvbnMuZmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZEZpZWxkLnZhbHVlID0gY29uZmlnLmNyZWF0ZURlZmF1bHRWYWx1ZShvcHRpb25zLmZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICBjb25maWcuaW5pdEZpZWxkKGNoaWxkRmllbGQpO1xuXG4gICAgICByZXR1cm4gY2hpbGRGaWVsZDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpZWxkIGFuZCBleHRyYWN0IGl0cyB2YWx1ZS5cbiAgICBjcmVhdGVOZXdDaGlsZEZpZWxkVmFsdWU6IGZ1bmN0aW9uIChwYXJlbnRGaWVsZCwgaXRlbUZpZWxkSW5kZXgpIHtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZSA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhwYXJlbnRGaWVsZClbaXRlbUZpZWxkSW5kZXhdO1xuXG4gICAgICB2YXIgbmV3VmFsdWUgPSBjb25maWcuZmllbGRUZW1wbGF0ZVZhbHVlKGNoaWxkRmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBrZXkuIFNob3VsZCBub3QgYmUgaW1wb3J0YW50LlxuICAgICAgdmFyIGtleSA9ICdfX3Vua25vd25fa2V5X18nO1xuXG4gICAgICBpZiAoXy5pc0FycmF5KHBhcmVudEZpZWxkLnZhbHVlKSkge1xuICAgICAgICAvLyBKdXN0IGEgcGxhY2Vob2xkZXIgcG9zaXRpb24gZm9yIGFuIGFycmF5LlxuICAgICAgICBrZXkgPSBwYXJlbnRGaWVsZC52YWx1ZS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIC8vIEp1c3QgYSBwbGFjZWhvbGRlciBmaWVsZCBpbmRleC4gU2hvdWxkIG5vdCBiZSBpbXBvcnRhbnQuXG4gICAgICB2YXIgZmllbGRJbmRleCA9IDA7XG4gICAgICBpZiAoXy5pc09iamVjdChwYXJlbnRGaWVsZC52YWx1ZSkpIHtcbiAgICAgICAgZmllbGRJbmRleCA9IE9iamVjdC5rZXlzKHBhcmVudEZpZWxkLnZhbHVlKS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHZhciBjaGlsZEZpZWxkID0gY29uZmlnLmNyZWF0ZUNoaWxkRmllbGQocGFyZW50RmllbGQsIHtcbiAgICAgICAgZmllbGRUZW1wbGF0ZTogY2hpbGRGaWVsZFRlbXBsYXRlLCBrZXk6IGtleSwgZmllbGRJbmRleDogZmllbGRJbmRleCwgdmFsdWU6IG5ld1ZhbHVlXG4gICAgICB9KTtcblxuICAgICAgbmV3VmFsdWUgPSBjb25maWcuaW5mbGF0ZUZpZWxkVmFsdWUoY2hpbGRGaWVsZCk7XG5cbiAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICB9LFxuXG4gICAgLy8gR2l2ZW4gYSB2YWx1ZSwgY3JlYXRlIGEgZmllbGQgdGVtcGxhdGUgZm9yIHRoYXQgdmFsdWUuXG4gICAgY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgICAgIHZhciBmaWVsZCA9IHtcbiAgICAgICAgdHlwZTogJ2pzb24nXG4gICAgICB9O1xuICAgICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YXIgYXJyYXlJdGVtRmllbGRzID0gdmFsdWUubWFwKGZ1bmN0aW9uIChjaGlsZFZhbHVlLCBpKSB7XG4gICAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZShjaGlsZFZhbHVlKTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgIGZpZWxkczogYXJyYXlJdGVtRmllbGRzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHZhciBvYmplY3RJdGVtRmllbGRzID0gT2JqZWN0LmtleXModmFsdWUpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgdmFyIGNoaWxkRmllbGQgPSBjb25maWcuY3JlYXRlRmllbGRUZW1wbGF0ZUZyb21WYWx1ZSh2YWx1ZVtrZXldKTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmtleSA9IGtleTtcbiAgICAgICAgICBjaGlsZEZpZWxkLmxhYmVsID0gY29uZmlnLmh1bWFuaXplKGtleSk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkRmllbGQ7XG4gICAgICAgIH0pO1xuICAgICAgICBmaWVsZCA9IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBmaWVsZHM6IG9iamVjdEl0ZW1GaWVsZHNcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc051bGwodmFsdWUpKSB7XG4gICAgICAgIGZpZWxkID0ge1xuICAgICAgICAgIHR5cGU6ICdqc29uJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpZWxkO1xuICAgIH0sXG5cbiAgICAvLyBEZWZhdWx0IHZhbHVlIGZhY3RvcnlcblxuICAgIGNyZWF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGNvbmZpZy5maWVsZFRlbXBsYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuXG4gICAgICBpZiAoIV8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdXRpbHMuZGVlcENvcHkoZGVmYXVsdFZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIGlmIChjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NyZWF0ZURlZmF1bHRWYWx1ZV8nICsgdHlwZU5hbWVdKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJyc7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIGhlbHBlcnNcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIFwiZXhpc3RzXCIuXG4gICAgaGFzVmFsdWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmICFfLmlzVW5kZWZpbmVkKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgLy8gQ29lcmNlIGEgdmFsdWUgdG8gdmFsdWUgYXBwcm9wcmlhdGUgZm9yIGEgZmllbGQuXG4gICAgY29lcmNlVmFsdWU6IGZ1bmN0aW9uIChmaWVsZCwgdmFsdWUpIHtcblxuICAgICAgdmFyIHR5cGVOYW1lID0gY29uZmlnLmZpZWxkVHlwZU5hbWUoZmllbGQpO1xuXG4gICAgICBpZiAoY29uZmlnWydjb2VyY2VWYWx1ZV8nICsgdHlwZU5hbWVdKSB7XG4gICAgICAgIHJldHVybiBjb25maWdbJ2NvZXJjZVZhbHVlXycgKyB0eXBlTmFtZV0oZmllbGQsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvLyBHaXZlbiBhIGZpZWxkIGFuZCBhIGNoaWxkIHZhbHVlLCBmaW5kIHRoZSBhcHByb3ByaWF0ZSBmaWVsZCB0ZW1wbGF0ZSBmb3JcbiAgICAvLyB0aGF0IGNoaWxkIHZhbHVlLlxuICAgIGNoaWxkRmllbGRUZW1wbGF0ZUZvclZhbHVlOiBmdW5jdGlvbiAoZmllbGQsIGNoaWxkVmFsdWUpIHtcblxuICAgICAgdmFyIGZpZWxkVGVtcGxhdGU7XG5cbiAgICAgIHZhciBmaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmZpbmQoZmllbGRUZW1wbGF0ZXMsIGZ1bmN0aW9uIChpdGVtRmllbGRUZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm4gY29uZmlnLm1hdGNoZXNGaWVsZFRlbXBsYXRlVG9WYWx1ZShpdGVtRmllbGRUZW1wbGF0ZSwgY2hpbGRWYWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29uZmlnLmNyZWF0ZUZpZWxkVGVtcGxhdGVGcm9tVmFsdWUoY2hpbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgbWF0Y2ggZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgbWF0Y2hlc0ZpZWxkVGVtcGxhdGVUb1ZhbHVlOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSwgdmFsdWUpIHtcbiAgICAgIHZhciBtYXRjaCA9IGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF8uZXZlcnkoXy5rZXlzKG1hdGNoKSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gXy5pc0VxdWFsKG1hdGNoW2tleV0sIHZhbHVlW2tleV0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIEZpZWxkIHRlbXBsYXRlIGhlbHBlcnNcblxuICAgIC8vIE5vcm1hbGl6ZWQgKFBhc2NhbENhc2UpIHR5cGUgbmFtZSBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFRlbXBsYXRlVHlwZU5hbWU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgIHZhciB0eXBlTmFtZSA9IHV0aWxzLmRhc2hUb1Bhc2NhbChmaWVsZFRlbXBsYXRlLnR5cGUgfHwgJ3VuZGVmaW5lZCcpO1xuXG4gICAgICB2YXIgYWxpYXMgPSBjb25maWdbJ2FsaWFzXycgKyB0eXBlTmFtZV07XG5cbiAgICAgIGlmIChhbGlhcykge1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGFsaWFzKSkge1xuICAgICAgICAgIHJldHVybiBhbGlhcy5jYWxsKGNvbmZpZywgZmllbGRUZW1wbGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGFsaWFzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaWVsZFRlbXBsYXRlLmxpc3QpIHtcbiAgICAgICAgdHlwZU5hbWUgPSAnQXJyYXknO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHlwZU5hbWU7XG4gICAgfSxcblxuICAgIC8vIERlZmF1bHQgdmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgZmllbGRUZW1wbGF0ZURlZmF1bHRWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUuZGVmYXVsdDtcbiAgICB9LFxuXG4gICAgLy8gVmFsdWUgZm9yIGEgZmllbGQgdGVtcGxhdGUuIFVzZWQgdG8gZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiBhIG5ldyBjaGlsZFxuICAgIC8vIGZpZWxkLlxuICAgIGZpZWxkVGVtcGxhdGVWYWx1ZTogZnVuY3Rpb24gKGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgLy8gVGhpcyBsb2dpYyBtaWdodCBiZSBicml0dGxlLlxuXG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gY29uZmlnLmZpZWxkVGVtcGxhdGVEZWZhdWx0VmFsdWUoZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIHZhciBtYXRjaCA9IGNvbmZpZy5maWVsZFRlbXBsYXRlTWF0Y2goZmllbGRUZW1wbGF0ZSk7XG5cbiAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgaWYgKF8uaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSAmJiAhXy5pc1VuZGVmaW5lZChtYXRjaCkpIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KG1hdGNoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkVGVtcGxhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIC8vIE1hdGNoIHJ1bGUgZm9yIGEgZmllbGQgdGVtcGxhdGUuXG4gICAgZmllbGRUZW1wbGF0ZU1hdGNoOiBmdW5jdGlvbiAoZmllbGRUZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGUubWF0Y2g7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIGZpZWxkIHRlbXBsYXRlIGhhcyBhIHNpbmdsZS1saW5lIHZhbHVlLlxuICAgIGZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmU6IGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gZmllbGRUZW1wbGF0ZS5pc1NpbmdsZUxpbmUgfHwgZmllbGRUZW1wbGF0ZS5pc19zaW5nbGVfbGluZSB8fFxuICAgICAgICAgICAgICBmaWVsZFRlbXBsYXRlLnR5cGUgPT09ICdzaW5nbGUtbGluZS1zdHJpbmcnIHx8IGZpZWxkVGVtcGxhdGUudHlwZSA9PT0gJ1NpbmdsZUxpbmVTdHJpbmcnO1xuICAgIH0sXG5cbiAgICAvLyBGaWVsZCBoZWxwZXJzXG5cbiAgICAvLyBHZXQgYW4gYXJyYXkgb2Yga2V5cyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gYSB2YWx1ZS5cbiAgICBmaWVsZFZhbHVlUGF0aDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBwYXJlbnRQYXRoID0gW107XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQpIHtcbiAgICAgICAgcGFyZW50UGF0aCA9IGNvbmZpZy5maWVsZFZhbHVlUGF0aChmaWVsZC5wYXJlbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGFyZW50UGF0aC5jb25jYXQoZmllbGQua2V5KS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQoa2V5KSAmJiBrZXkgIT09ICcnO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIENsb25lIGEgZmllbGQgd2l0aCBhIGRpZmZlcmVudCB2YWx1ZS5cbiAgICBmaWVsZFdpdGhWYWx1ZTogZnVuY3Rpb24gKGZpZWxkLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBmaWVsZCwge3ZhbHVlOiB2YWx1ZX0pO1xuICAgIH0sXG5cbiAgICBmaWVsZFR5cGVOYW1lOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlVHlwZU5hbWUnKSxcblxuICAgIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBkcm9wZG93biBmaWVsZC5cbiAgICBmaWVsZENob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoZmllbGQuY2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY2hvaWNlcyBmb3IgYSBwcmV0dHkgZHJvcGRvd24gZmllbGQuXG4gICAgZmllbGRQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVQcmV0dHlDaG9pY2VzKGZpZWxkLmNob2ljZXMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBzZXQgb2YgYm9vbGVhbiBjaG9pY2VzIGZvciBhIGZpZWxkLlxuICAgIGZpZWxkQm9vbGVhbkNob2ljZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuXG4gICAgICB2YXIgY2hvaWNlcyA9IGNvbmZpZy5maWVsZENob2ljZXMoZmllbGQpO1xuXG4gICAgICBpZiAoY2hvaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgbGFiZWw6ICd5ZXMnLFxuICAgICAgICAgIHZhbHVlOiB0cnVlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBsYWJlbDogJ25vJyxcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VzLm1hcChmdW5jdGlvbiAoY2hvaWNlKSB7XG4gICAgICAgIGlmIChfLmlzQm9vbGVhbihjaG9pY2UudmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGNob2ljZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGNob2ljZSwge1xuICAgICAgICAgIHZhbHVlOiBjb25maWcuY29lcmNlVmFsdWVUb0Jvb2xlYW4oY2hvaWNlLnZhbHVlKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgYSBzZXQgb2YgcmVwbGFjZW1lbnQgY2hvaWNlcyBmb3IgYSBmaWVsZC5cbiAgICBmaWVsZFJlcGxhY2VDaG9pY2VzOiBmdW5jdGlvbiAoZmllbGQpIHtcblxuICAgICAgcmV0dXJuIGNvbmZpZy5ub3JtYWxpemVDaG9pY2VzKGZpZWxkLnJlcGxhY2VDaG9pY2VzKTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGEgbGFiZWwgZm9yIGEgZmllbGQuXG4gICAgZmllbGRMYWJlbDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQubGFiZWw7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgaGVscCB0ZXh0IGZvciBhIGZpZWxkLlxuICAgIGZpZWxkSGVscFRleHQ6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmhlbHBfdGV4dF9odG1sIHx8IGZpZWxkLmhlbHBfdGV4dCB8fCBmaWVsZC5oZWxwVGV4dCB8fCBmaWVsZC5oZWxwVGV4dEh0bWw7XG4gICAgfSxcblxuICAgIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIHJlcXVpcmVkLlxuICAgIGZpZWxkSXNSZXF1aXJlZDogZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQucmVxdWlyZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiB2YWx1ZSBmb3IgdGhpcyBmaWVsZCBpcyBub3QgYSBsZWFmIHZhbHVlLlxuICAgIGZpZWxkSGFzVmFsdWVDaGlsZHJlbjogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBjb25maWcuY3JlYXRlRGVmYXVsdFZhbHVlKGZpZWxkKTtcblxuICAgICAgaWYgKF8uaXNPYmplY3QoZGVmYXVsdFZhbHVlKSB8fCBfLmlzQXJyYXkoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyBmb3IgdGhpcyBmaWVsZC5cbiAgICBmaWVsZENoaWxkRmllbGRUZW1wbGF0ZXM6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmZpZWxkcyB8fCBbXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBmaWVsZCB0ZW1wbGF0ZXMgZm9yIGVhY2ggaXRlbSBvZiB0aGlzIGZpZWxkLiAoRm9yIGR5bmFtaWMgY2hpbGRyZW4sXG4gICAgLy8gbGlrZSBhcnJheXMuKVxuICAgIGZpZWxkSXRlbUZpZWxkVGVtcGxhdGVzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIGlmICghZmllbGQuaXRlbUZpZWxkcykge1xuICAgICAgICByZXR1cm4gW3t0eXBlOiAndGV4dCd9XTtcbiAgICAgIH1cbiAgICAgIGlmICghXy5pc0FycmF5KGZpZWxkLml0ZW1GaWVsZHMpKSB7XG4gICAgICAgIHJldHVybiBbZmllbGQuaXRlbUZpZWxkc107XG4gICAgICB9XG4gICAgICByZXR1cm4gZmllbGQuaXRlbUZpZWxkcztcbiAgICB9LFxuXG4gICAgZmllbGRJc1NpbmdsZUxpbmU6IGRlbGVnYXRlVG8oJ2ZpZWxkVGVtcGxhdGVJc1NpbmdsZUxpbmUnKSxcblxuICAgIC8vIEdldCB3aGV0aGVyIG9yIG5vdCBhIGZpZWxkIGlzIGNvbGxhcHNlZC5cbiAgICBmaWVsZElzQ29sbGFwc2VkOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5jb2xsYXBzZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEdldCB3aGV0ZXIgb3Igbm90IGEgZmllbGQgY2FuIGJlIGNvbGxhcHNlZC5cbiAgICBmaWVsZElzQ29sbGFwc2libGU6IGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcmV0dXJuIGZpZWxkLmNvbGxhcHNpYmxlIHx8ICFfLmlzVW5kZWZpbmVkKGZpZWxkLmNvbGxhcHNlZCk7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgbnVtYmVyIG9mIHJvd3MgZm9yIGEgZmllbGQuXG4gICAgZmllbGRSb3dzOiBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgIHJldHVybiBmaWVsZC5yb3dzO1xuICAgIH0sXG5cbiAgICBmaWVsZEVycm9yczogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciBlcnJvcnMgPSBbXTtcblxuICAgICAgaWYgKGNvbmZpZy5pc0tleShmaWVsZC5rZXkpKSB7XG4gICAgICAgIGNvbmZpZy52YWxpZGF0ZUZpZWxkKGZpZWxkLCBlcnJvcnMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXJyb3JzO1xuICAgIH0sXG5cbiAgICBmaWVsZE1hdGNoOiBkZWxlZ2F0ZVRvKCdmaWVsZFRlbXBsYXRlTWF0Y2gnKSxcblxuICAgIC8vIE90aGVyIGhlbHBlcnNcblxuICAgIC8vIENvbnZlcnQgYSBrZXkgdG8gYSBuaWNlIGh1bWFuLXJlYWRhYmxlIHZlcnNpb24uXG4gICAgaHVtYW5pemU6IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xce1xcey9nLCAnJyk7XG4gICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UoL1xcfVxcfS9nLCAnJyk7XG4gICAgICByZXR1cm4gcHJvcGVydHkucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgICAucmVwbGFjZSgvKFxcdyspL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG1hdGNoLnNsaWNlKDEpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIE5vcm1hbGl6ZSBzb21lIGNob2ljZXMgZm9yIGEgZHJvcC1kb3duLlxuICAgIG5vcm1hbGl6ZUNob2ljZXM6IGZ1bmN0aW9uIChjaG9pY2VzKSB7XG5cbiAgICAgIGlmICghY2hvaWNlcykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG5cbiAgICAgIC8vIENvbnZlcnQgY29tbWEgc2VwYXJhdGVkIHN0cmluZyB0byBhcnJheSBvZiBzdHJpbmdzLlxuICAgICAgaWYgKF8uaXNTdHJpbmcoY2hvaWNlcykpIHtcbiAgICAgICAgY2hvaWNlcyA9IGNob2ljZXMuc3BsaXQoJywnKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCBvYmplY3QgdG8gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIGB2YWx1ZWAgYW5kIGBsYWJlbGAgcHJvcGVydGllcy5cbiAgICAgIGlmICghXy5pc0FycmF5KGNob2ljZXMpICYmIF8uaXNPYmplY3QoY2hvaWNlcykpIHtcbiAgICAgICAgY2hvaWNlcyA9IE9iamVjdC5rZXlzKGNob2ljZXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBrZXksXG4gICAgICAgICAgICBsYWJlbDogY2hvaWNlc1trZXldXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENvcHkgdGhlIGFycmF5IG9mIGNob2ljZXMgc28gd2UgY2FuIG1hbmlwdWxhdGUgdGhlbS5cbiAgICAgIGNob2ljZXMgPSBjaG9pY2VzLnNsaWNlKDApO1xuXG4gICAgICAvLyBBcnJheSBvZiBjaG9pY2UgYXJyYXlzIHNob3VsZCBiZSBmbGF0dGVuZWQuXG4gICAgICBjaG9pY2VzID0gXy5mbGF0dGVuKGNob2ljZXMpO1xuXG4gICAgICBjaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgaSkge1xuICAgICAgICAvLyBDb252ZXJ0IGFueSBzdHJpbmcgY2hvaWNlcyB0byBvYmplY3RzIHdpdGggYHZhbHVlYCBhbmQgYGxhYmVsYFxuICAgICAgICAvLyBwcm9wZXJ0aWVzLlxuICAgICAgICBpZiAoXy5pc1N0cmluZyhjaG9pY2UpKSB7XG4gICAgICAgICAgY2hvaWNlc1tpXSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBjaG9pY2UsXG4gICAgICAgICAgICBsYWJlbDogY29uZmlnLmh1bWFuaXplKGNob2ljZSlcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghY2hvaWNlc1tpXS5sYWJlbCkge1xuICAgICAgICAgIGNob2ljZXNbaV0ubGFiZWwgPSBjb25maWcuaHVtYW5pemUoY2hvaWNlc1tpXS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY2hvaWNlcztcbiAgICB9LFxuXG4gICAgLy8gTm9ybWFsaXplIGNob2ljZXMgZm9yIGEgcHJldHR5IGRyb3AgZG93biwgd2l0aCAnc2FtcGxlJyB2YWx1ZXNcbiAgICBub3JtYWxpemVQcmV0dHlDaG9pY2VzOiBmdW5jdGlvbiAoY2hvaWNlcykge1xuICAgICAgaWYgKCFfLmlzQXJyYXkoY2hvaWNlcykgJiYgXy5pc09iamVjdChjaG9pY2VzKSkge1xuICAgICAgICBjaG9pY2VzID0gT2JqZWN0LmtleXMoY2hvaWNlcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IGtleSxcbiAgICAgICAgICAgIGxhYmVsOiBjaG9pY2VzW2tleV0sXG4gICAgICAgICAgICBzYW1wbGU6IGtleVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29uZmlnLm5vcm1hbGl6ZUNob2ljZXMoY2hvaWNlcyk7XG4gICAgfSxcblxuICAgIC8vIENvZXJjZSBhIHZhbHVlIHRvIGEgYm9vbGVhblxuICAgIGNvZXJjZVZhbHVlVG9Cb29sZWFuOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICghXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgLy8gSnVzdCB1c2UgdGhlIGRlZmF1bHQgdHJ1dGhpbmVzcy5cbiAgICAgICAgcmV0dXJuIHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gJ25vJyB8fCB2YWx1ZSA9PT0gJ29mZicgfHwgdmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmFsaWQga2V5LlxuICAgIGlzS2V5OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gKF8uaXNOdW1iZXIoa2V5KSAmJiBrZXkgPj0gMCkgfHwgKF8uaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09ICcnKTtcbiAgICB9LFxuXG4gICAgLy8gRmFzdCB3YXkgdG8gY2hlY2sgZm9yIGVtcHR5IG9iamVjdC5cbiAgICBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICBmb3IodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgYWN0aW9uQ2hvaWNlTGFiZWw6IGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHJldHVybiB1dGlscy5jYXBpdGFsaXplKGFjdGlvbikucmVwbGFjZSgvWy1dL2csICcgJyk7XG4gICAgfVxuICB9O1xufTtcbiIsIi8vICMgZm9ybWF0aWNcblxuLypcblRoZSByb290IGZvcm1hdGljIGNvbXBvbmVudC5cblxuVGhlIHJvb3QgZm9ybWF0aWMgY29tcG9uZW50IGlzIGFjdHVhbGx5IHR3byBjb21wb25lbnRzLiBUaGUgbWFpbiBjb21wb25lbnQgaXNcbmEgY29udHJvbGxlZCBjb21wb25lbnQgd2hlcmUgeW91IG11c3QgcGFzcyB0aGUgdmFsdWUgaW4gd2l0aCBlYWNoIHJlbmRlci4gVGhpc1xuaXMgYWN0dWFsbHkgd3JhcHBlZCBpbiBhbm90aGVyIGNvbXBvbmVudCB3aGljaCBhbGxvd3MgeW91IHRvIHVzZSBmb3JtYXRpYyBhc1xuYW4gdW5jb250cm9sbGVkIGNvbXBvbmVudCB3aGVyZSBpdCByZXRhaW5zIHRoZSBzdGF0ZSBvZiB0aGUgdmFsdWUuIFRoZSB3cmFwcGVyXG5pcyB3aGF0IGlzIGFjdHVhbGx5IGV4cG9ydGVkLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdC9hZGRvbnMnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbnZhciBkZWZhdWx0Q29uZmlnUGx1Z2luID0gcmVxdWlyZSgnLi9kZWZhdWx0LWNvbmZpZycpO1xuXG52YXIgY3JlYXRlQ29uZmlnID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGx1Z2lucyA9IFtkZWZhdWx0Q29uZmlnUGx1Z2luXS5jb25jYXQoXy50b0FycmF5KGFyZ3VtZW50cykpO1xuXG4gIHJldHVybiBwbHVnaW5zLnJlZHVjZShmdW5jdGlvbiAoY29uZmlnLCBwbHVnaW4pIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBsdWdpbikpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gcGx1Z2luKGNvbmZpZyk7XG4gICAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgICBfLmV4dGVuZChjb25maWcsIGV4dGVuc2lvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChjb25maWcsIHBsdWdpbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSwge30pO1xufTtcblxudmFyIGRlZmF1bHRDb25maWcgPSBjcmVhdGVDb25maWcoKTtcblxuLy8gVGhlIG1haW4gZm9ybWF0aWMgY29tcG9uZW50IHRoYXQgcmVuZGVycyB0aGUgZm9ybS5cbnZhciBGb3JtYXRpY0NvbnRyb2xsZWRDbGFzcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljQ29udHJvbGxlZCcsXG5cbiAgLy8gUmVzcG9uZCB0byBhbnkgdmFsdWUgY2hhbmdlcy5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbmZvID0gXy5leHRlbmQoe30sIGluZm8pO1xuICAgIGluZm8ucGF0aCA9IHRoaXMucHJvcHMuY29uZmlnLmZpZWxkVmFsdWVQYXRoKGluZm8uZmllbGQpO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFJlc3BvbmQgdG8gYW55IGFjdGlvbnMgb3RoZXIgdGhhbiB2YWx1ZSBjaGFuZ2VzLiAoRm9yIGV4YW1wbGUsIGZvY3VzIGFuZFxuICAvLyBibHVyLilcbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKCF0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluZm8gPSBfLmV4dGVuZCh7fSwgaW5mbyk7XG4gICAgaW5mby5wYXRoID0gdGhpcy5wcm9wcy5jb25maWcuZmllbGRWYWx1ZVBhdGgoaW5mby5maWVsZCk7XG4gICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHJvb3QgY29tcG9uZW50IGJ5IGRlbGVnYXRpbmcgdG8gdGhlIGNvbmZpZy5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWc7XG5cbiAgICByZXR1cm4gY29uZmlnLnJlbmRlckZvcm1hdGljQ29tcG9uZW50KHRoaXMpO1xuICB9XG59KTtcblxudmFyIEZvcm1hdGljQ29udHJvbGxlZCA9IFJlYWN0LmNyZWF0ZUZhY3RvcnkoRm9ybWF0aWNDb250cm9sbGVkQ2xhc3MpO1xuXG4vLyBBIHdyYXBwZXIgY29tcG9uZW50IHRoYXQgaXMgYWN0dWFsbHkgZXhwb3J0ZWQgYW5kIGNhbiBhbGxvdyBmb3JtYXRpYyB0byBiZVxuLy8gdXNlZCBpbiBhbiBcInVuY29udHJvbGxlZFwiIG1hbm5lci4gKFNlZSB1bmNvbnRyb2xsZWQgY29tcG9uZW50cyBpbiB0aGUgUmVhY3Rcbi8vIGRvY3VtZW50YXRpb24gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZSBkaWZmZXJlbmNlLilcbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8vIEV4cG9ydCBzb21lIHN0dWZmIGFzIHN0YXRpY3MuXG4gIHN0YXRpY3M6IHtcbiAgICBjcmVhdGVDb25maWc6IGNyZWF0ZUNvbmZpZyxcbiAgICBhdmFpbGFibGVNaXhpbnM6IHtcbiAgICAgIGNsaWNrT3V0c2lkZTogcmVxdWlyZSgnLi9taXhpbnMvY2xpY2stb3V0c2lkZS5qcycpLFxuICAgICAgZmllbGQ6IHJlcXVpcmUoJy4vbWl4aW5zL2ZpZWxkLmpzJyksXG4gICAgICBoZWxwZXI6IHJlcXVpcmUoJy4vbWl4aW5zL2hlbHBlci5qcycpLFxuICAgICAgcmVzaXplOiByZXF1aXJlKCcuL21peGlucy9yZXNpemUuanMnKSxcbiAgICAgIHNjcm9sbDogcmVxdWlyZSgnLi9taXhpbnMvc2Nyb2xsLmpzJyksXG4gICAgICB1bmRvU3RhY2s6IHJlcXVpcmUoJy4vbWl4aW5zL3VuZG8tc3RhY2suanMnKVxuICAgIH0sXG4gICAgcGx1Z2luczoge1xuICAgICAgYm9vdHN0cmFwOiByZXF1aXJlKCcuL3BsdWdpbnMvYm9vdHN0cmFwJyksXG4gICAgICBtZXRhOiByZXF1aXJlKCcuL3BsdWdpbnMvbWV0YScpLFxuICAgICAgcmVmZXJlbmNlOiByZXF1aXJlKCcuL3BsdWdpbnMvcmVmZXJlbmNlJyksXG4gICAgICBlbGVtZW50Q2xhc3NlczogcmVxdWlyZSgnLi9wbHVnaW5zL2VsZW1lbnQtY2xhc3NlcycpXG4gICAgfSxcbiAgICB1dGlsczogdXRpbHNcbiAgfSxcblxuICBkaXNwbGF5TmFtZTogJ0Zvcm1hdGljJyxcblxuICAvLyBJZiB3ZSBnb3QgYSB2YWx1ZSwgdHJlYXQgdGhpcyBjb21wb25lbnQgYXMgY29udHJvbGxlZC4gRWl0aGVyIHdheSwgcmV0YWluXG4gIC8vIHRoZSB2YWx1ZSBpbiB0aGUgc3RhdGUuXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0NvbnRyb2xsZWQ6ICFfLmlzVW5kZWZpbmVkKHRoaXMucHJvcHMudmFsdWUpLFxuICAgICAgdmFsdWU6IF8uaXNVbmRlZmluZWQodGhpcy5wcm9wcy52YWx1ZSkgPyB0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSA6IHRoaXMucHJvcHMudmFsdWVcbiAgICB9O1xuICB9LFxuXG4gIC8vIElmIHRoaXMgaXMgYSBjb250cm9sbGVkIGNvbXBvbmVudCwgY2hhbmdlIG91ciBzdGF0ZSB0byByZWZsZWN0IHRoZSBuZXdcbiAgLy8gdmFsdWUuIEZvciB1bmNvbnRyb2xsZWQgY29tcG9uZW50cywgaWdub3JlIGFueSB2YWx1ZSBjaGFuZ2VzLlxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV3UHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChuZXdQcm9wcy52YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgdmFsdWU6IG5ld1Byb3BzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBJZiB0aGlzIGlzIGFuIHVuY29udHJvbGxlZCBjb21wb25lbnQsIHNldCBvdXIgc3RhdGUgdG8gcmVmbGVjdCB0aGUgbmV3XG4gIC8vIHZhbHVlLiBFaXRoZXIgd2F5LCBjYWxsIHRoZSBvbkNoYW5nZSBjYWxsYmFjay5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uIChuZXdWYWx1ZSwgaW5mbykge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0NvbnRyb2xsZWQpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogbmV3VmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSwgaW5mbyk7XG4gIH0sXG5cbiAgLy8gQW55IGFjdGlvbnMgc2hvdWxkIGJlIHNlbnQgdG8gdGhlIGdlbmVyaWMgb25BY3Rpb24gY2FsbGJhY2sgYnV0IGFsc28gc3BsaXRcbiAgLy8gaW50byBkaXNjcmVldCBjYWxsYmFja3MgcGVyIGFjdGlvbi5cbiAgb25BY3Rpb246IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHRoaXMucHJvcHMub25BY3Rpb24oaW5mbyk7XG4gICAgfVxuICAgIHZhciBhY3Rpb24gPSB1dGlscy5kYXNoVG9QYXNjYWwoaW5mby5hY3Rpb24pO1xuICAgIGlmICh0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKSB7XG4gICAgICB0aGlzLnByb3BzWydvbicgKyBhY3Rpb25dKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBSZW5kZXIgdGhlIHdyYXBwZXIgY29tcG9uZW50IChieSBqdXN0IGRlbGVnYXRpbmcgdG8gdGhlIG1haW4gY29tcG9uZW50KS5cbiAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgY29uZmlnID0gdGhpcy5wcm9wcy5jb25maWcgfHwgZGVmYXVsdENvbmZpZztcbiAgICB2YXIgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuaXNDb250cm9sbGVkKSB7XG4gICAgICBpZiAoIXRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1lvdSBzaG91bGQgc3VwcGx5IGFuIG9uQ2hhbmdlIGhhbmRsZXIgaWYgeW91IHN1cHBseSBhIHZhbHVlLicpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcm9wcyA9IHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgLy8gQWxsb3cgZmllbGQgdGVtcGxhdGVzIHRvIGJlIHBhc3NlZCBpbiBhcyBgZmllbGRgIG9yIGBmaWVsZHNgLiBBZnRlciB0aGlzLCBzdG9wXG4gICAgICAvLyBjYWxsaW5nIHRoZW0gZmllbGRzLlxuICAgICAgZmllbGRUZW1wbGF0ZTogdGhpcy5wcm9wcy5maWVsZCxcbiAgICAgIGZpZWxkVGVtcGxhdGVzOiB0aGlzLnByb3BzLmZpZWxkcyxcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgb25BY3Rpb246IHRoaXMub25BY3Rpb25cbiAgICB9O1xuXG4gICAgXy5lYWNoKHRoaXMucHJvcHMsIGZ1bmN0aW9uIChwcm9wVmFsdWUsIGtleSkge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3BzKSkge1xuICAgICAgICBwcm9wc1trZXldID0gcHJvcFZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIEZvcm1hdGljQ29udHJvbGxlZChwcm9wcyk7XG4gIH1cblxufSk7XG4iLCIvLyAjIGNsaWNrLW91dHNpZGUgbWl4aW5cblxuLypcblRoZXJlJ3Mgbm8gbmF0aXZlIFJlYWN0IHdheSB0byBkZXRlY3QgY2xpY2tpbmcgb3V0c2lkZSBhbiBlbGVtZW50LiBTb21ldGltZXNcbnRoaXMgaXMgdXNlZnVsLCBzbyB0aGF0J3Mgd2hhdCB0aGlzIG1peGluIGRvZXMuIFRvIHVzZSBpdCwgbWl4IGl0IGluIGFuZCB1c2UgaXRcbmZyb20geW91ciBjb21wb25lbnQgbGlrZSB0aGlzOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi5taXhpbnMvY2xpY2stb3V0c2lkZScpXSxcblxuICBvbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjbGlja2VkIG91dHNpZGUhJyk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNldE9uQ2xpY2tPdXRzaWRlKCdteURpdicsIHRoaXMub25DbGlja091dHNpZGUpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBSZWFjdC5ET00uZGl2KHtyZWY6ICdteURpdid9LFxuICAgICAgJ0hlbGxvISdcbiAgICApXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgaGFzQW5jZXN0b3IgPSBmdW5jdGlvbiAoY2hpbGQsIHBhcmVudCkge1xuICBpZiAoY2hpbGQucGFyZW50Tm9kZSA9PT0gcGFyZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGNoaWxkLnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGhhc0FuY2VzdG9yKGNoaWxkLnBhcmVudE5vZGUsIHBhcmVudCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBpc05vZGVPdXRzaWRlOiBmdW5jdGlvbiAobm9kZU91dCwgbm9kZUluKSB7XG4gICAgaWYgKG5vZGVPdXQgPT09IG5vZGVJbikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaGFzQW5jZXN0b3Iobm9kZU91dCwgbm9kZUluKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBpc05vZGVJbnNpZGU6IGZ1bmN0aW9uIChub2RlSW4sIG5vZGVPdXQpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNOb2RlT3V0c2lkZShub2RlSW4sIG5vZGVPdXQpO1xuICB9LFxuXG4gIF9vbkNsaWNrTW91c2Vkb3duOiBmdW5jdGlvbigpIHtcbiAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAgIGlmICh0aGlzLnJlZnNbcmVmXSkge1xuICAgICAgICB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgX29uQ2xpY2tNb3VzZXVwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBfLmVhY2godGhpcy5jbGlja091dHNpZGVIYW5kbGVycywgZnVuY3Rpb24gKGZ1bmNzLCByZWYpIHtcbiAgICAgIGlmICh0aGlzLnJlZnNbcmVmXSAmJiB0aGlzLl9tb3VzZWRvd25SZWZzW3JlZl0pIHtcbiAgICAgICAgaWYgKHRoaXMuaXNOb2RlT3V0c2lkZShldmVudC50YXJnZXQsIHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSkpIHtcbiAgICAgICAgICBmdW5jcy5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fbW91c2Vkb3duUmVmc1tyZWZdID0gZmFsc2U7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPbkNsaWNrT3V0c2lkZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXSkge1xuICAgICAgdGhpcy5jbGlja091dHNpZGVIYW5kbGVyc1tyZWZdID0gW107XG4gICAgfVxuICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnNbcmVmXS5wdXNoKGZuKTtcbiAgfSxcblxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICB0aGlzLl9kaWRNb3VzZURvd24gPSBmYWxzZTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbkNsaWNrTW91c2Vkb3duKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25DbGlja01vdXNldXApO1xuICAgIC8vZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrRG9jdW1lbnQpO1xuICAgIHRoaXMuX21vdXNlZG93blJlZnMgPSB7fTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2xpY2tPdXRzaWRlSGFuZGxlcnMgPSB7fTtcbiAgICAvL2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGlja0RvY3VtZW50KTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25DbGlja01vdXNldXApO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uQ2xpY2tNb3VzZWRvd24pO1xuICB9XG59O1xuIiwiLy8gIyBmaWVsZCBtaXhpblxuXG4vKlxuVGhpcyBtaXhpbiBnZXRzIG1peGVkIGludG8gYWxsIGZpZWxkIGNvbXBvbmVudHMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvLyBTaWduYWwgYSBjaGFuZ2UgaW4gdmFsdWUuXG4gIG9uQ2hhbmdlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIHtcbiAgICAgIGZpZWxkOiB0aGlzLnByb3BzLmZpZWxkXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gQnViYmxlIHVwIGEgdmFsdWUuXG4gIG9uQnViYmxlVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgaW5mbykge1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UodmFsdWUsIGluZm8pO1xuICB9LFxuXG4gIC8vIFN0YXJ0IGFuIGFjdGlvbiBidWJibGluZyB1cCB0aHJvdWdoIHBhcmVudCBjb21wb25lbnRzLlxuICBvblN0YXJ0QWN0aW9uOiBmdW5jdGlvbiAoYWN0aW9uLCBwcm9wcykge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQWN0aW9uKSB7XG4gICAgICB2YXIgaW5mbyA9IF8uZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgICBpbmZvLmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgIGluZm8uZmllbGQgPSB0aGlzLnByb3BzLmZpZWxkO1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gRGVsZWdhdGUgcmVuZGVyaW5nIGJhY2sgdG8gY29uZmlnIHNvIGl0IGNhbiBiZSB3cmFwcGVkLlxuICByZW5kZXJXaXRoQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuY29uZmlnLnJlbmRlckZpZWxkQ29tcG9uZW50KHRoaXMpO1xuICB9XG59O1xuIiwiLy8gIyBoZWxwZXIgbWl4aW5cblxuLypcblRoaXMgZ2V0cyBtaXhlZCBpbnRvIGFsbCBoZWxwZXIgY29tcG9uZW50cy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIERlbGVnYXRlIHJlbmRlcmluZyBiYWNrIHRvIGNvbmZpZyBzbyBpdCBjYW4gYmUgd3JhcHBlZC5cbiAgcmVuZGVyV2l0aENvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmNvbmZpZy5yZW5kZXJDb21wb25lbnQodGhpcyk7XG4gIH0sXG5cbiAgLy8gU3RhcnQgYW4gYWN0aW9uIGJ1YmJsaW5nIHVwIHRocm91Z2ggcGFyZW50IGNvbXBvbmVudHMuXG4gIG9uU3RhcnRBY3Rpb246IGZ1bmN0aW9uIChhY3Rpb24sIHByb3BzKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub25BY3Rpb24pIHtcbiAgICAgIHZhciBpbmZvID0gXy5leHRlbmQoe30sIHByb3BzKTtcbiAgICAgIGluZm8uYWN0aW9uID0gYWN0aW9uO1xuICAgICAgaW5mby5maWVsZCA9IHRoaXMucHJvcHMuZmllbGQ7XG4gICAgICB0aGlzLnByb3BzLm9uQWN0aW9uKGluZm8pO1xuICAgIH1cbiAgfSxcblxuICAvLyBCdWJibGUgdXAgYW4gYWN0aW9uLlxuICBvbkJ1YmJsZUFjdGlvbjogZnVuY3Rpb24gKGluZm8pIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkFjdGlvbikge1xuICAgICAgdGhpcy5wcm9wcy5vbkFjdGlvbihpbmZvKTtcbiAgICB9XG4gIH0sXG5cbiAgb25Gb2N1c0FjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25TdGFydEFjdGlvbignZm9jdXMnKTtcbiAgfSxcblxuICBvbkJsdXJBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uU3RhcnRBY3Rpb24oJ2JsdXInKTtcbiAgfVxufTtcbiIsIi8vICMgcmVzaXplIG1peGluXG5cbi8qXG5Zb3UnZCB0aGluayBpdCB3b3VsZCBiZSBwcmV0dHkgZWFzeSB0byBkZXRlY3Qgd2hlbiBhIERPTSBlbGVtZW50IGlzIHJlc2l6ZWQuXG5BbmQgeW91J2QgYmUgd3JvbmcuIFRoZXJlIGFyZSB2YXJpb3VzIHRyaWNrcywgYnV0IG5vbmUgb2YgdGhlbSB3b3JrIHZlcnkgd2VsbC5cblNvLCB1c2luZyBnb29kIG9sJyBwb2xsaW5nIGhlcmUuIFRvIHRyeSB0byBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUsIHRoZXJlXG5pcyBvbmx5IGEgc2luZ2xlIHNldEludGVydmFsIHVzZWQgZm9yIGFsbCBlbGVtZW50cy4gVG8gdXNlOlxuXG5gYGBqc1xubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgbWl4aW5zOiBbcmVxdWlyZSgnLi4vLi4vbWl4aW5zL3Jlc2l6ZScpXSxcblxuICBvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNpemVkIScpO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zZXRPblJlc2l6ZSgnbXlUZXh0JywgdGhpcy5vblJlc2l6ZSk7XG4gIH0sXG5cbiAgb25DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAuLi5cbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gUmVhY3QuRE9NLnRleHRhcmVhKHtyZWY6ICdteVRleHQnLCB2YWx1ZTogdGhpcy5wcm9wcy52YWx1ZSwgb25DaGFuZ2U6IC4uLn0pXG4gIH1cbn0pO1xuYGBgXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpZCA9IDA7XG5cbnZhciByZXNpemVJbnRlcnZhbEVsZW1lbnRzID0ge307XG52YXIgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50ID0gMDtcbnZhciByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcblxudmFyIGNoZWNrRWxlbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIE9iamVjdC5rZXlzKHJlc2l6ZUludGVydmFsRWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBlbGVtZW50ID0gcmVzaXplSW50ZXJ2YWxFbGVtZW50c1trZXldO1xuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9PSBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCkge1xuICAgICAgZWxlbWVudC5fX3ByZXZDbGllbnRXaWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgdmFyIGhhbmRsZXJzID0gZWxlbWVudC5fX3Jlc2l6ZUhhbmRsZXJzO1xuICAgICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIDEwMCk7XG59O1xuXG52YXIgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZuKSB7XG4gIGlmIChyZXNpemVJbnRlcnZhbFRpbWVyID09PSBudWxsKSB7XG4gICAgcmVzaXplSW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKGNoZWNrRWxlbWVudHMsIDEwMCk7XG4gIH1cbiAgaWYgKCEoJ19fcmVzaXplSWQnIGluIGVsZW1lbnQpKSB7XG4gICAgaWQrKztcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICBlbGVtZW50Ll9fcHJldkNsaWVudEhlaWdodCA9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIGVsZW1lbnQuX19yZXNpemVJZCA9IGlkO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNDb3VudCsrO1xuICAgIHJlc2l6ZUludGVydmFsRWxlbWVudHNbaWRdID0gZWxlbWVudDtcbiAgICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMgPSBbXTtcbiAgfVxuICBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnMucHVzaChmbik7XG59O1xuXG52YXIgcmVtb3ZlUmVzaXplSW50ZXJ2YWxIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghKCdfX3Jlc2l6ZUlkJyBpbiBlbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcmVzaXplSWQgPSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSWQ7XG4gIGRlbGV0ZSBlbGVtZW50Ll9fcmVzaXplSGFuZGxlcnM7XG4gIGRlbGV0ZSByZXNpemVJbnRlcnZhbEVsZW1lbnRzW3Jlc2l6ZUlkXTtcbiAgcmVzaXplSW50ZXJ2YWxFbGVtZW50c0NvdW50LS07XG4gIGlmIChyZXNpemVJbnRlcnZhbEVsZW1lbnRzQ291bnQgPCAxKSB7XG4gICAgY2xlYXJJbnRlcnZhbChyZXNpemVJbnRlcnZhbFRpbWVyKTtcbiAgICByZXNpemVJbnRlcnZhbFRpbWVyID0gbnVsbDtcbiAgfVxufTtcblxudmFyIG9uUmVzaXplID0gZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgZm4ocmVmKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgdGhpcy5yZXNpemVFbGVtZW50UmVmcyA9IHt9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub25SZXNpemVXaW5kb3cpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplV2luZG93KTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXModGhpcy5yZXNpemVFbGVtZW50UmVmcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgICByZW1vdmVSZXNpemVJbnRlcnZhbEhhbmRsZXJzKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBzZXRPblJlc2l6ZTogZnVuY3Rpb24gKHJlZiwgZm4pIHtcbiAgICBpZiAoIXRoaXMucmVzaXplRWxlbWVudFJlZnNbcmVmXSkge1xuICAgICAgdGhpcy5yZXNpemVFbGVtZW50UmVmc1tyZWZdID0gdHJ1ZTtcbiAgICB9XG4gICAgYWRkUmVzaXplSW50ZXJ2YWxIYW5kbGVyKHRoaXMucmVmc1tyZWZdLmdldERPTU5vZGUoKSwgb25SZXNpemUuYmluZCh0aGlzLCByZWYsIGZuKSk7XG4gIH1cbn07XG4iLCIvLyAjIHNjcm9sbCBtaXhpblxuXG4vKlxuQ3VycmVudGx5IHVudXNlZC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cbiAgcGx1Z2luLmV4cG9ydHMgPSB7XG5cbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub25TY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMub25TY3JvbGxXaW5kb3cpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHVuZG8tc3RhY2sgbWl4aW5cblxuLypcbkdpdmVzIHlvdXIgY29tcG9uZW50IGFuIHVuZG8gc3RhY2suXG4qL1xuXG4vLyBodHRwOi8vcHJvbWV0aGV1c3Jlc2VhcmNoLmdpdGh1Yi5pby9yZWFjdC1mb3Jtcy9leGFtcGxlcy91bmRvLmh0bWxcblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge3VuZG86IFtdLCByZWRvOiBbXX07XG4gIH0sXG5cbiAgc25hcHNob3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB1bmRvID0gdGhpcy5zdGF0ZS51bmRvLmNvbmNhdCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnN0YXRlLnVuZG9EZXB0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh1bmRvLmxlbmd0aCA+IHRoaXMuc3RhdGUudW5kb0RlcHRoKSB7XG4gICAgICAgIHVuZG8uc2hpZnQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7dW5kbzogdW5kbywgcmVkbzogW119KTtcbiAgfSxcblxuICBoYXNVbmRvOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS51bmRvLmxlbmd0aCA+IDA7XG4gIH0sXG5cbiAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVkby5sZW5ndGggPiAwO1xuICB9LFxuXG4gIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKHRydWUpO1xuICB9LFxuXG4gIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3VuZG9JbXBsKCk7XG4gIH0sXG5cbiAgX3VuZG9JbXBsOiBmdW5jdGlvbihpc1JlZG8pIHtcbiAgICB2YXIgdW5kbyA9IHRoaXMuc3RhdGUudW5kby5zbGljZSgwKTtcbiAgICB2YXIgcmVkbyA9IHRoaXMuc3RhdGUucmVkby5zbGljZSgwKTtcbiAgICB2YXIgc25hcHNob3Q7XG5cbiAgICBpZiAoaXNSZWRvKSB7XG4gICAgICBpZiAocmVkby5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc25hcHNob3QgPSByZWRvLnBvcCgpO1xuICAgICAgdW5kby5wdXNoKHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHVuZG8ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNuYXBzaG90ID0gdW5kby5wb3AoKTtcbiAgICAgIHJlZG8ucHVzaCh0aGlzLmdldFN0YXRlU25hcHNob3QoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZVNuYXBzaG90KHNuYXBzaG90KTtcbiAgICB0aGlzLnNldFN0YXRlKHt1bmRvOiB1bmRvLCByZWRvOiByZWRvfSk7XG4gIH1cbn07XG4iLCIvLyAjIGJvb3RzdHJhcCBwbHVnaW5cblxuLypcblRoZSBib290c3RyYXAgcGx1Z2luIHNuZWFrcyBpbiBzb21lIGNsYXNzZXMgdG8gZWxlbWVudHMgc28gdGhhdCBpdCBwbGF5cyB3ZWxsXG53aXRoIFR3aXR0ZXIgQm9vdHN0cmFwLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuLy8gRGVjbGFyZSBzb21lIGNsYXNzZXMgYW5kIGxhYmVscyBmb3IgZWFjaCBlbGVtZW50LlxudmFyIG1vZGlmaWVycyA9IHtcblxuICAnRmllbGQnOiB7Y2xhc3Nlczogeydmb3JtLWdyb3VwJzogdHJ1ZX19LFxuICAnSGVscCc6IHtjbGFzc2VzOiB7J2hlbHAtYmxvY2snOiB0cnVlfX0sXG4gICdTYW1wbGUnOiB7Y2xhc3NlczogeydoZWxwLWJsb2NrJzogdHJ1ZX19LFxuICAnQXJyYXlDb250cm9sJzoge2NsYXNzZXM6IHsnZm9ybS1pbmxpbmUnOiB0cnVlfX0sXG4gICdBcnJheUl0ZW0nOiB7Y2xhc3Nlczogeyd3ZWxsJzogdHJ1ZX19LFxuICAnT2JqZWN0SXRlbSc6IHtjbGFzc2VzOiB7J3dlbGwnOiB0cnVlfX0sXG4gICdGaWVsZFRlbXBsYXRlQ2hvaWNlcyc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ0FkZEl0ZW0nOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLXBsdXMnOiB0cnVlfSwgbGFiZWw6ICcnfSxcbiAgJ1JlbW92ZUl0ZW0nOiB7Y2xhc3NlczogeydnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZSc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnTW92ZUl0ZW1CYWNrJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy11cCc6IHRydWV9LCBsYWJlbDogJyd9LFxuICAnTW92ZUl0ZW1Gb3J3YXJkJzoge2NsYXNzZXM6IHsnZ2x5cGhpY29uIGdseXBoaWNvbi1hcnJvdy1kb3duJzogdHJ1ZX0sIGxhYmVsOiAnJ30sXG4gICdPYmplY3RJdGVtS2V5Jzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuXG4gICdTaW5nbGVMaW5lU3RyaW5nJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnU3RyaW5nJzoge2NsYXNzZXM6IHsnZm9ybS1jb250cm9sJzogdHJ1ZX19LFxuICAnUHJldHR5VGV4dCc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fSxcbiAgJ0pzb24nOiB7Y2xhc3Nlczogeydmb3JtLWNvbnRyb2wnOiB0cnVlfX0sXG4gICdTZWxlY3RWYWx1ZSc6IHtjbGFzc2VzOiB7J2Zvcm0tY29udHJvbCc6IHRydWV9fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGNyZWF0ZUVsZW1lbnQgPSBjb25maWcuY3JlYXRlRWxlbWVudDtcblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgdmFyIG1vZGlmaWVyID0gbW9kaWZpZXJzW25hbWVdO1xuXG4gICAgICBpZiAobW9kaWZpZXIpIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBtb2RpZmllciBmb3IgdGhpcyBlbGVtZW50LCBhZGQgdGhlIGNsYXNzZXMgYW5kIGxhYmVsLlxuICAgICAgICBwcm9wcyA9IF8uZXh0ZW5kKHt9LCBwcm9wcyk7XG4gICAgICAgIHByb3BzLmNsYXNzZXMgPSBfLmV4dGVuZCh7fSwgcHJvcHMuY2xhc3NlcywgbW9kaWZpZXIuY2xhc3Nlcyk7XG4gICAgICAgIGlmICgnbGFiZWwnIGluIG1vZGlmaWVyKSB7XG4gICAgICAgICAgcHJvcHMubGFiZWwgPSBtb2RpZmllci5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY3JlYXRlRWxlbWVudChuYW1lLCBwcm9wcywgY2hpbGRyZW4pO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIGVsZW1lbnQtY2xhc3NlcyBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2lucyBwcm92aWRlcyBhIGNvbmZpZyBtZXRob2QgYWRkRWxlbWVudENsYXNzIHRoYXQgbGV0cyB5b3UgYWRkIG9uIGFcbmNsYXNzIHRvIGFuIGVsZW1lbnQuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb25maWcpIHtcblxuICB2YXIgY3JlYXRlRWxlbWVudCA9IGNvbmZpZy5jcmVhdGVFbGVtZW50O1xuXG4gIHZhciBlbGVtZW50Q2xhc3NlcyA9IHt9O1xuXG4gIHJldHVybiB7XG4gICAgYWRkRWxlbWVudENsYXNzOiBmdW5jdGlvbiAobmFtZSwgY2xhc3NOYW1lKSB7XG5cbiAgICAgIG5hbWUgPSBjb25maWcuZWxlbWVudE5hbWUobmFtZSk7XG5cbiAgICAgIGlmICghZWxlbWVudENsYXNzZXNbbmFtZV0pIHtcbiAgICAgICAgZWxlbWVudENsYXNzZXNbbmFtZV0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudENsYXNzZXNbbmFtZV1bY2xhc3NOYW1lXSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8vIFdyYXAgdGhlIGNyZWF0ZUVsZW1lbnQgbWV0aG9kLlxuICAgIGNyZWF0ZUVsZW1lbnQ6IGZ1bmN0aW9uIChuYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcblxuICAgICAgbmFtZSA9IGNvbmZpZy5lbGVtZW50TmFtZShuYW1lKTtcblxuICAgICAgaWYgKGVsZW1lbnRDbGFzc2VzW25hbWVdKSB7XG4gICAgICAgIHByb3BzID0gXy5leHRlbmQoe30sIHByb3BzLCB7Y2xhc3NlczogZWxlbWVudENsYXNzZXNbbmFtZV19KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQobmFtZSwgcHJvcHMsIGNoaWxkcmVuKTtcbiAgICB9XG4gIH07XG59O1xuIiwiLy8gIyBtZXRhIHBsdWdpblxuXG4vKlxuVGhlIG1ldGEgcGx1Z2luIGxldHMgeW91IHBhc3MgaW4gYSBtZXRhIHByb3AgdG8gZm9ybWF0aWMuIFRoZSBwcm9wIHRoZW4gZ2V0c1xucGFzc2VkIHRocm91Z2ggYXMgYSBwcm9wZXJ0eSBmb3IgZXZlcnkgZmllbGQuIFlvdSBjYW4gdGhlbiB3cmFwIGBpbml0RmllbGRgIHRvXG5nZXQgeW91ciBtZXRhIHZhbHVlcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG5cbiAgdmFyIGluaXRSb290RmllbGQgPSBjb25maWcuaW5pdFJvb3RGaWVsZDtcbiAgdmFyIGluaXRGaWVsZCA9IGNvbmZpZy5pbml0RmllbGQ7XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0Um9vdEZpZWxkOiBmdW5jdGlvbiAoZmllbGQsIHByb3BzKSB7XG5cbiAgICAgIGZpZWxkLm1ldGEgPSBwcm9wcy5tZXRhIHx8IHt9O1xuXG4gICAgICBpbml0Um9vdEZpZWxkKGZpZWxkLCBwcm9wcyk7XG4gICAgfSxcblxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIGlmIChmaWVsZC5wYXJlbnQgJiYgZmllbGQucGFyZW50Lm1ldGEpIHtcbiAgICAgICAgZmllbGQubWV0YSA9IGZpZWxkLnBhcmVudC5tZXRhO1xuICAgICAgfVxuXG4gICAgICBpbml0RmllbGQoZmllbGQpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvLyAjIHJlZmVyZW5jZSBwbHVnaW5cblxuLypcblRoaXMgcGx1Z2luIGFsbG93cyBmaWVsZHMgdG8gYmUgc3RyaW5ncyBhbmQgcmVmZXJlbmNlIG90aGVyIGZpZWxkcyBieSBrZXkgb3JcbmlkLiBJdCBhbHNvIGFsbG93cyBhIGZpZWxkIHRvIGV4dGVuZCBhbm90aGVyIGZpZWxkIHdpdGhcbmV4dGVuZHM6IFsnZm9vJywgJ2JhciddIHdoZXJlICdmb28nIGFuZCAnYmFyJyByZWZlciB0byBvdGhlciBrZXlzIG9yIGlkcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXG4gIHZhciBpbml0RmllbGQgPSBjb25maWcuaW5pdEZpZWxkO1xuXG4gIHJldHVybiB7XG4gICAgLy8gTG9vayBmb3IgYSB0ZW1wbGF0ZSBpbiB0aGlzIGZpZWxkIG9yIGFueSBvZiBpdHMgcGFyZW50cy5cbiAgICBmaW5kRmllbGRUZW1wbGF0ZTogZnVuY3Rpb24gKGZpZWxkLCBuYW1lKSB7XG5cbiAgICAgIGlmIChmaWVsZC50ZW1wbGF0ZXNbbmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkLnRlbXBsYXRlc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpZWxkLnBhcmVudCkge1xuICAgICAgICByZXR1cm4gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLnBhcmVudCwgbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvLyBJbmhlcml0IGZyb20gYW55IGZpZWxkIHRlbXBsYXRlcyB0aGF0IHRoaXMgZmllbGQgdGVtcGxhdGVcbiAgICAvLyBleHRlbmRzLlxuICAgIHJlc29sdmVGaWVsZFRlbXBsYXRlOiBmdW5jdGlvbiAoZmllbGQsIGZpZWxkVGVtcGxhdGUpIHtcblxuICAgICAgaWYgKCFmaWVsZFRlbXBsYXRlLmV4dGVuZHMpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVGVtcGxhdGU7XG4gICAgICB9XG5cbiAgICAgIHZhciBleHQgPSBmaWVsZFRlbXBsYXRlLmV4dGVuZHM7XG5cbiAgICAgIGlmICghXy5pc0FycmF5KGV4dCkpIHtcbiAgICAgICAgZXh0ID0gW2V4dF07XG4gICAgICB9XG5cbiAgICAgIHZhciBiYXNlcyA9IGV4dC5tYXAoZnVuY3Rpb24gKGJhc2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBiYXNlKTtcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVtcGxhdGUgJyArIGJhc2UgKyAnIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGNoYWluID0gW3t9XS5jb25jYXQoYmFzZXMucmV2ZXJzZSgpLmNvbmNhdChbZmllbGRUZW1wbGF0ZV0pKTtcbiAgICAgIGZpZWxkVGVtcGxhdGUgPSBfLmV4dGVuZC5hcHBseShfLCBjaGFpbik7XG5cbiAgICAgIHJldHVybiBmaWVsZFRlbXBsYXRlO1xuICAgIH0sXG5cbiAgICAvLyBXcmFwIHRoZSBpbml0RmllbGQgbWV0aG9kLlxuICAgIGluaXRGaWVsZDogZnVuY3Rpb24gKGZpZWxkKSB7XG5cbiAgICAgIHZhciB0ZW1wbGF0ZXMgPSBmaWVsZC50ZW1wbGF0ZXMgPSB7fTtcblxuICAgICAgdmFyIGNoaWxkRmllbGRUZW1wbGF0ZXMgPSBjb25maWcuZmllbGRDaGlsZEZpZWxkVGVtcGxhdGVzKGZpZWxkKTtcblxuICAgICAgLy8gQWRkIGVhY2ggb2YgdGhlIGNoaWxkIGZpZWxkIHRlbXBsYXRlcyB0byBvdXIgdGVtcGxhdGUgbWFwLlxuICAgICAgY2hpbGRGaWVsZFRlbXBsYXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG5cbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5ID0gZmllbGRUZW1wbGF0ZS5rZXk7XG4gICAgICAgIHZhciBpZCA9IGZpZWxkVGVtcGxhdGUuaWQ7XG5cbiAgICAgICAgaWYgKGZpZWxkVGVtcGxhdGUudGVtcGxhdGUpIHtcbiAgICAgICAgICBmaWVsZFRlbXBsYXRlID0gXy5leHRlbmQoe30sIGZpZWxkVGVtcGxhdGUsIHt0ZW1wbGF0ZTogZmFsc2V9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChrZXkpICYmIGtleSAhPT0gJycpIHtcbiAgICAgICAgICB0ZW1wbGF0ZXNba2V5XSA9IGZpZWxkVGVtcGxhdGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoaWQpICYmIGlkICE9PSAnJykge1xuICAgICAgICAgIHRlbXBsYXRlc1tpZF0gPSBmaWVsZFRlbXBsYXRlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVzb2x2ZSBhbnkgcmVmZXJlbmNlcyB0byBvdGhlciBmaWVsZCB0ZW1wbGF0ZXMuXG4gICAgICBpZiAoY2hpbGRGaWVsZFRlbXBsYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZpZWxkLmZpZWxkcyA9IGNoaWxkRmllbGRUZW1wbGF0ZXMubWFwKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgaWYgKF8uaXNTdHJpbmcoZmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUgPSBjb25maWcuZmluZEZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjb25maWcucmVzb2x2ZUZpZWxkVGVtcGxhdGUoZmllbGQsIGZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmaWVsZC5maWVsZHMgPSBmaWVsZC5maWVsZHMuZmlsdGVyKGZ1bmN0aW9uIChmaWVsZFRlbXBsYXRlKSB7XG4gICAgICAgICAgcmV0dXJuICFmaWVsZFRlbXBsYXRlLnRlbXBsYXRlO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIGl0ZW1GaWVsZFRlbXBsYXRlcyA9IGNvbmZpZy5maWVsZEl0ZW1GaWVsZFRlbXBsYXRlcyhmaWVsZCk7XG5cbiAgICAgIC8vIFJlc29sdmUgYW55IG9mIG91ciBpdGVtIGZpZWxkIHRlbXBsYXRlcy4gKEZpZWxkIHRlbXBsYXRlcyBmb3IgZHluYW1pY1xuICAgICAgLy8gY2hpbGQgZmllbGRzLilcbiAgICAgIGlmIChpdGVtRmllbGRUZW1wbGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBmaWVsZC5pdGVtRmllbGRzID0gaXRlbUZpZWxkVGVtcGxhdGVzLm1hcChmdW5jdGlvbiAoaXRlbUZpZWxkVGVtcGxhdGUpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhpdGVtRmllbGRUZW1wbGF0ZSkpIHtcbiAgICAgICAgICAgIGl0ZW1GaWVsZFRlbXBsYXRlID0gY29uZmlnLmZpbmRGaWVsZFRlbXBsYXRlKGZpZWxkLCBpdGVtRmllbGRUZW1wbGF0ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5yZXNvbHZlRmllbGRUZW1wbGF0ZShmaWVsZCwgaXRlbUZpZWxkVGVtcGxhdGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaW5pdEZpZWxkKGZpZWxkKTtcbiAgICB9XG4gIH07XG5cbn07XG4iLCIvLyAjIHV0aWxzXG5cbi8qXG5KdXN0IHNvbWUgc2hhcmVkIHV0aWxpdHkgZnVuY3Rpb25zLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxudmFyIHV0aWxzID0gZXhwb3J0cztcblxuLy8gQ29weSBvYmogcmVjdXJzaW5nIGRlZXBseS5cbnV0aWxzLmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAoXy5pc0FycmF5KG9iaikpIHtcbiAgICByZXR1cm4gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIHV0aWxzLmRlZXBDb3B5KGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzTnVsbChvYmopKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG9iaikpIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBjb3B5W2tleV0gPSB1dGlscy5kZWVwQ29weSh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxufTtcblxuLy8gQ2FjaGUgZm9yIHN0cmluZ3MgY29udmVydGVkIHRvIFBhc2NhbCBDYXNlLiBUaGlzIHNob3VsZCBiZSBhIGZpbml0ZSBsaXN0LCBzb1xuLy8gbm90IG11Y2ggZmVhciB0aGF0IHdlIHdpbGwgcnVuIG91dCBvZiBtZW1vcnkuXG52YXIgZGFzaFRvUGFzY2FsQ2FjaGUgPSB7fTtcblxuLy8gQ29udmVydCBmb28tYmFyIHRvIEZvb0Jhci5cbnV0aWxzLmRhc2hUb1Bhc2NhbCA9IGZ1bmN0aW9uIChzKSB7XG4gIGlmIChzID09PSAnJykge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBpZiAoIWRhc2hUb1Bhc2NhbENhY2hlW3NdKSB7XG4gICAgZGFzaFRvUGFzY2FsQ2FjaGVbc10gPSBzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydFswXS50b1VwcGVyQ2FzZSgpICsgcGFydC5zdWJzdHJpbmcoMSk7XG4gICAgfSkuam9pbignJyk7XG4gIH1cbiAgcmV0dXJuIGRhc2hUb1Bhc2NhbENhY2hlW3NdO1xufTtcblxuLy8gQ29weSBhbGwgY29tcHV0ZWQgc3R5bGVzIGZyb20gb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIuXG51dGlscy5jb3B5RWxlbWVudFN0eWxlID0gZnVuY3Rpb24gKGZyb21FbGVtZW50LCB0b0VsZW1lbnQpIHtcbiAgdmFyIGZyb21TdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGZyb21FbGVtZW50LCAnJyk7XG5cbiAgaWYgKGZyb21TdHlsZS5jc3NUZXh0ICE9PSAnJykge1xuICAgIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gZnJvbVN0eWxlLmNzc1RleHQ7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNzc1J1bGVzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZnJvbVN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgY3NzUnVsZXMucHVzaChmcm9tU3R5bGVbaV0gKyAnOicgKyBmcm9tU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShmcm9tU3R5bGVbaV0pICsgJzsnKTtcbiAgfVxuICB2YXIgY3NzVGV4dCA9IGNzc1J1bGVzLmpvaW4oJycpO1xuXG4gIHRvRWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gY3NzVGV4dDtcbn07XG5cbi8vIE9iamVjdCB0byBob2xkIGJyb3dzZXIgc25pZmZpbmcgaW5mby5cbnZhciBicm93c2VyID0ge1xuICBpc0Nocm9tZTogZmFsc2UsXG4gIGlzTW96aWxsYTogZmFsc2UsXG4gIGlzT3BlcmE6IGZhbHNlLFxuICBpc0llOiBmYWxzZSxcbiAgaXNTYWZhcmk6IGZhbHNlLFxuICBpc1Vua25vd246IGZhbHNlXG59O1xuXG4vLyBTbmlmZiB0aGUgYnJvd3Nlci5cbnZhciB1YSA9ICcnO1xuXG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xufVxuXG5pZih1YS5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNDaHJvbWUgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdTYWZhcmknKSA+IC0xKSB7XG4gIGJyb3dzZXIuaXNTYWZhcmkgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdPcGVyYScpID4gLTEpIHtcbiAgYnJvd3Nlci5pc09wZXJhID0gdHJ1ZTtcbn0gZWxzZSBpZiAodWEuaW5kZXhPZignRmlyZWZveCcpID4gLTEpIHtcbiAgYnJvd3Nlci5pc01vemlsbGEgPSB0cnVlO1xufSBlbHNlIGlmICh1YS5pbmRleE9mKCdNU0lFJykgPiAtMSkge1xuICBicm93c2VyLmlzSWUgPSB0cnVlO1xufSBlbHNlIHtcbiAgYnJvd3Nlci5pc1Vua25vd24gPSB0cnVlO1xufVxuXG4vLyBFeHBvcnQgc25pZmZlZCBicm93c2VyIGluZm8uXG51dGlscy5icm93c2VyID0gYnJvd3NlcjtcblxuLy8gQ3JlYXRlIGEgbWV0aG9kIHRoYXQgZGVsZWdhdGVzIHRvIGFub3RoZXIgbWV0aG9kIG9uIHRoZSBzYW1lIG9iamVjdC4gVGhlXG4vLyBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gdXNlcyB0aGlzIGZ1bmN0aW9uIHRvIGRlbGVnYXRlIG9uZSBtZXRob2QgdG8gYW5vdGhlci5cbnV0aWxzLmRlbGVnYXRlVG8gPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG51dGlscy5kZWxlZ2F0b3IgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gb2JqW25hbWVdLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xufTtcblxudXRpbHMuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xufTtcbiJdfQ==
