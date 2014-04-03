(function() {

	/**
	 * 
	 */
	LinkedHashMap = function LinkedHashMap(values) {
		if (values) {
			this.putAll(values);
		}

		return this;
	};

	LinkedHashMap.prototype = {

		firstNode: null,
		lastNode: null,
		length: 0,

		nodes: {},

		/**
		 * @private
		 * Create new instance of node given a value.
		 * 
		 * @param value - value to hold.
		 * 
		 * @return The node.
		 */
		_createNode: function _createNode(value) {
			return {
				value: value,
				prev: null,
				next: null
			};
		},

		/**
		 * Associates the specified value with the specified key in this map. If the map previously contained a mapping for the key, the old value is replaced.
		 * Will not allow key-less entry.
		 * 
		 * @param key - key with which the specified value is to be associated
		 * @param value - value to be associated with the specified key
		 * 
		 * @return The previous value associated with key, or null if there was no mapping for key.
		 */
		put: function put(key, value) {
			if (!key) {
				// don't allow key-less entry
				return;
			}

			var oldValue = this.remove(key);
			var node = this._createNode(value);

			this.nodes[key] = node;

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
		 * @param values - an array of values (objects)
		 * @param valueKey - a property to be accessed on each value (object) and used as key
		 * 
		 * @return The status object: {success: true, failure: []}
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
		 * @param key - key with which the specified value is to be associated
		 * 
		 * @return The value associated with the key.
		 */
		get: function get(key) {
			var node = this.nodes[key];
			var value = (node ? node.value : null);

			return value;
		},

		getAt: function getAt(index) {
			
		},

		/**
		 * Returns all values in an array.
		 * 
		 * @return An array containing all values.
		 */
		getAll: function getAll() {
			var values = [];
			var node = this.firstNode;

			if (!node) {
				// there's nothing
				return values;
			}

			do {
				values.push(node);
				node = node.next;
			} while (node);

			return values;
		},

		/**
		 * Removes an entry with a specified key
		 * 
		 * @param key - key with which the associated value should be removed
		 * 
		 * @return The old value associated with the key, or null if there's none.
		 */
		remove: function remove(key) {
			var existingNode = this.nodes[key];

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

			this.nodes[key] = null;
			this.length--;

			return existingNode.value;
		},

		removeAt: function removeAt() {},

		removeAll: function removeAll() {},

		isEmpty: function isEmpty() {},

		hasKey: function hasKey() {},

		hasValue: function hasValue() {},

		getAllKeys: function getAllKeys() {},

		toString: function toString() {}

	};

})();