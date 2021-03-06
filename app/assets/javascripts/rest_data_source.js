
SC.RestDataSource = SC.DataSource.extend({

  resourceURL: function(recordType, store, storeKey) {
    var id, resourceName = recordType.resourceName;
    if (!resourceName) {
      throw SC.Error.create("You have to define resourceName on %@ ...".fmt(recordType));
    }
    if (storeKey) {
      id = store.idFor(storeKey); 
    }
    if (id) {
      return '/%@/%@'.fmt(resourceName, id);
    }
    return '/%@'.fmt(resourceName);
  },

  // fetch

  fetch: function(store, query) {
    var url = this.resourceURL(query.get('recordType'), store);
    SC.Request.getUrl(url).json()
      .notify(this, 'fetchDidComplete', store, query)
      .send();
    return true;
  },

  fetchDidComplete: function(response, store, query) {
    if (SC.ok(response)) {
      store.loadRecords(query.get('recordType'), response.get('body'));
      store.dataSourceDidFetchQuery(query);
    } else {
      this._parseError(response);
      store.dataSourceDidErrorQuery(query, response);
    }
  },

  // retrieve

  retrieveRecord: function(store, storeKey, id) {
    var url = this.resourceURL(query.get('recordType'), store, storeKey);
    SC.Request.getUrl(url).json()
      .notify(this, 'retrieveDidComplete', store, query)
      .send();
    return true;
  },

  retrieveDidComplete: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = response.get('body');
      store.dataSourceDidComplete(storeKey, data);
    } else {
      this._parseError(response);
      store.dataSourceDidError(storeKey, response);
    }
  },

  // create / update

  createRecord: function(store, storeKey) {
    return this._createOrUpdateRecord(store, storeKey);
  },

  updateRecord: function(store, storeKey) {
    return this._createOrUpdateRecord(store, storeKey, true);
  },

  _createOrUpdateRecord: function(store, storeKey, update) {
    var url = this.resourceURL(store.recordTypeFor(storeKey), store, storeKey);
    SC.Request[update ? 'putUrl' : 'postUrl'](url).json()
      .notify(this, 'writeDidComplete', store, storeKey)
      .send(store.readDataHash(storeKey));
    return true;
  },

  writeDidComplete: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = response.get('body');
      if (store.idFor(storeKey)) {
        store.dataSourceDidComplete(storeKey, data);
      } else {
        store.dataSourceDidComplete(storeKey, data, data.id);
      }
    } else {
      this._parseError(response);
      store.dataSourceDidError(storeKey, response);
    }
  },

  // destroy

  destroyRecord: function(store, storeKey) {
    var url = this.resourceURL(store.recordTypeFor(storeKey), store, storeKey);
    SC.Request.deleteUrl(url).json()
      .notify(this, 'destroyRecordsDidComplete', store, storeKey)
      .send();
    return true;
  },

  destroyRecordsDidComplete: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidDestroy(storeKey);
    } else {
      this._parseError(response);
      store.dataSourceDidError(storeKey, response);
    }
  },

  _parseError: function(response) {
    var data = response.getPath('rawRequest.responseText');
    data = SC.$.parseJSON(data);
    response.set('body', data);
  }
});
