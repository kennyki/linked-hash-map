(function() {

	/**
	 * A utility that takes advantage on Javascript Object's power as a hashmap, and provide you insertion order.
	 * Useful if you need to randomly access a value with a key, but need to know who are your immediate neighbours, ie. a carousel.
	 */
	LinkedHashMap = function LinkedHashMap(values) {
		if (values) {
			this.putAll(values);
		}

		// OK. we really need to encapsulate this collection so everyone must operate through our API and no one can mess with it
		// So make it as a protected member (a child class can still access it through the privileged functions).
		var nodes = {
			/* "key": {node} */
		};

		this._getNodes = function _getNodes() {
			return nodes;
		};
		this._removeNodes = function _removeNodes() {
			nodes = {};
		};

		return this;
	};

	LinkedHashMap.prototype = {

		firstNode: null,
		lastNode: null,
		length: 0,

		/**
		 * @private
		 * Create new instance of node given a value.
		 * 
		 * @param key - key to hold. So that a node is key-aware.
		 * @param value - value to hold.
		 * 
		 * @return The node.
		 */
		_createNode: function _createNode(key, value) {
			return {
				key: key,
				value: value,
				prev: null,
				next: null
			};
		},

		/**
		 * Iterator function similar to native array's "forEach" API.
		 * 
		 * But this:
		 * - will execute callback function with (value, key, index) based on insertion order.
		 * - has capability of "some" API: if callback function returns true, it will quit the loop and returns true.
		 * 
		 * NOTE: callback function will only be executed for keys/indexes which have assigned values.
		 * 
		 * @param fn - callback function to be executed with (value, key, index).
		 * @param scope - execution scope for callback function, defaults to window.
		 * 
		 * @return true when callback returns true, otherwise false.
		 */
		each: function each(fn, scope) {
			if (typeof(fn) != "function") {
				return false;
			}

			var fnScope = (scope || window);
			var index = 0;
			var node = this.firstNode;

			while (node) {
				if (node.value != undefined && node.value != null) {
					var result = fn.call(fnScope, node.value, node.key, index);

					if (result == true) {
						return true;
					}
				}

				node = node.next;
				index++;
			}

			return false;
		},

		/**
		 * Associates the specified value with the specified key in this map. If the map previously contained a mapping for the key, the old value is replaced.
		 * Will not allow key-less entry.
		 * 
		 * @param key - key with which the specified value is to be associated.
		 * @param value - value to be associated with the specified key.
		 * 
		 * @return The previous value associated with key, or null if there was no mapping for key.
		 */
		put: function put(key, value) {
			if (!key) {
				// don't allow key-less entry
				return;
			}

			var oldValue = this.remove(key);
			var node = this._createNode(key, value);

			this._getNodes()[key] = node;

			if (!this.firstNode) {
				this.firstNode = node;
			} else {
				this.lastNode.next = node;
				node.prev = this.lastNode;
			}

			this.lastNode = node;
			this.length++;

			return oldValue;
		},

		/**
		 * Convert from an array of values (objects) where a property value in each object will be used as a key.
		 * Will not allow key-less entry (if a key cannot be found in object, it will be ignored and pushed into a failure array).
		 *
		 * Example: putAll([{id: "1", name: "one"}, {id: "2", name: "two"}], "id");
		 * 
		 * @param values - an array of values (objects).
		 * @param valueKey - a property to be accessed on each value (object) and used as key.
		 * 
		 * @return The status object: {success: true, failure: []}.
		 */
		putAll: function putAll(values, valueKey) {
			var status = {
				success: true,
				failures: []
			};

			if (!values || !valueKey) {
				status.success = false;
				// won't proceed without any of these
				return status;
			}

			// expecting values to be an array of objects
			for (var i = 0, l = values.length; i < l; i++) {
				var value = values[i];
				// what to be used as key
				var key = value[valueKey];

				if (!key) {
					// won't allow key-less entry
					status.failures.push(value);
					continue;
				}

				this.put(key, value);
			}

			return status;
		},

		/**
		 * Returns value with specified key, or null if there's no mapping for the key.
		 * 
		 * @param key - key with which the specified value is to be associated.
		 * 
		 * @return The value associated with the key.
		 */
		get: function get(key) {
			var node = this._getNodes()[key];
			var value = (node ? node.value : null);

			return value;
		},

		/**
		 * Returns value at specified index, or null if index is either invalid or out of bound.
		 * 
		 * @param index - index where the specified value is located.
		 * 
		 * @return The value at the specified index.
		 */
		getAt: function getAt(index) {
			var node = this._getNodeAt(index);
			var value = (node ? node.value : null);

			return value;
		},

		/**
		 * @private
		 * Returns node at specified index, or null if index is either invalid or out of bound.
		 * 
		 * @param index - index where the specified node is located.
		 * 
		 * @return The node.
		 */
		_getNodeAt: function _getNodeAt(index) {
			var node = null;

			if (isNaN(index) || index < 0 || index >= this.length) {
				return node;
			}

			var runningIndex = 0;
			var runningNode = this.firstNode;

			while (runningNode) {
				if (runningIndex == index) {
					node = runningNode;
					break;
				}
				runningNode = runningNode.next;
				runningIndex++;
			}

			return node;
		},

		/**
		 * Returns all values in an array.
		 * 
		 * @return An array containing all values.
		 */
		getAll: function getAll() {
			var values = [];

			this.each(function(value) {
				values.push(value);
			});

			return values;
		},

		/**
		 * Returns all keys in an array.
		 * 
		 * @return An array containing all keys.
		 */
		getAllKeys: function getAllKeys() {
			var keys = [];

			this.each(function(value, key) {
				keys.push(key);
			});

			return keys;
		},

		/**
		 * Removes an entry with a specified key.
		 * 
		 * @param key - key with which the associated value should be removed.
		 * 
		 * @return The old value associated with the key, or null if there's none.
		 */
		remove: function remove(key) {
			var existingNode = this._getNodes()[key];

			if (!existingNode) {
				return null;
			}

			if (!existingNode.prev) {
				// it must be the first, need to update
				this.firstNode = existingNode.next;
			}

			if (!existingNode.next) {
				// it must be the last, need to update
				this.lastNode = existingNode.prev;
			}
			
			if (existingNode.prev && existingNode.next) {
				// link them
				existingNode.prev.next = existingNode.next;
				existingNode.next.prev = existingNode.prev;
			}

			this._getNodes()[key] = null;
			this.length--;

			return existingNode.value;
		},

		/**
		 * Removes an entry at specified index.
		 * 
		 * @param index - index of entry to remove.
		 * 
		 * @return The old value at the specified index, or null if no node found at the index.
		 */
		removeAt: function removeAt(index) {
			var oldValue = null;
			var node = this._getNodeAt(index);

			if (node) {
				oldValue = this.remove(node.key);
			}

			return oldValue;
		},

		/**
		 * Removes all entries.
		 */
		removeAll: function removeAll() {
			this.firstNode = null;
			this.lastNode = null;
			this.length = 0;
			
			this._removeNodes();
		},

		/**
		 * Returns true if there is no entry at all.
		 */
		isEmpty: function isEmpty() {
			return (this.length == 0);
		},

		/**
		 * Returns true if there is a value for the specified key.
		 * 
		 * @param key - key to be tested.
		 * 
		 * @return true if found.
		 */
		hasValue: function hasValue(key) {
			var value = this.get(key);

			return (value != undefined && value != null);
		},

		/*
		 * Returns string presentation of an instance of this class.
		 * 
		 * @return JSON string like below:
		 * 	{
		 * 		"key1": {value1},
		 * 		"key2": {value2},
		 * 		"key3": {value3},
		 * 	}
		 */
		toString: function toString(beautify) {
			var display = {};

			this.each(function(value, key) {
				display[key] = value;
			});

			var space = null;

			if (typeof(beautify) == "boolean" && beautify == true) {
				// use a tab if it's true
				space = "\t";
			} else if (!isNaN(beautify) || typeof(beautify) == "string" || beautify instanceof String) {
				// allow customization if a number or string is passed in
				space = beautify;
			}

			return JSON.stringify(display, null, space);
		}

	};

})();
