
SC.RestDataSource = SC.DataSource.extend({

  resourceURL: function(recordType, store, storeKey) {
    var id, resourceName = recordType.resourceName;
    if (!resourceName) {
      throw SC.Error.create("You have to define resourceName...");
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
      var records = response.get('body');
      if (records.length > 0) {
        store.loadRecords(query.get('recordType'), records);
        store.dataSourceDidFetchQuery(query);
      }
    } else {
      this._parseError(response);
      store.dataSourceDidErrorQuery(query, response);
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
      .notify(this, 'writeRecordDidComplete', store, storeKey)
      .send(store.readDataHash(storeKey));
    return true;
  },

  writeRecordDidComplete: function(response, store, storeKey) {
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
    //var status = store.readStatus(storeKey);
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
