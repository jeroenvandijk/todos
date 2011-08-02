// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

Todos = SC.Application.create({
  store: SC.Store.create({commitRecordsAutomatically: true}).from('SC.RestDataSource')
});

Todos.Todo = SC.Record.extend({
  primaryKey: 'id',

  // attributes
  title: SC.Record.attr(String, {isRequired: true}),
  is_done: SC.Record.attr(Boolean, {defaultValue: false}),
  created_at: SC.Record.attr(SC.DateTime),

  isDoneBinding: 'is_done',
  createdAt: function() {
    var created_at = this.get('created_at');
    if (created_at) {
      return created_at.toFormattedString('%d/%m/%y');
    }
    return '';
  }.property('created_at').cacheable(),
  errorMessages: function() {
    var errors = this.getPath('errorValue.body'),
        messages = [], message = "";
    for (fieldName in errors) {
      messages = errors[fieldName];
      for (var i = 0; i < messages.length; i++) {
        message += fieldName + ' ' + messages[i];
      }    
    }
    return message;
  }.property('errorValue.body').cacheable(),
  removeErrors: function() {
    if (this.get('isError')) {
      SC.run.later(this, '_destroy', 4000);
    }
  }.observes('isError'),
  _destroy: function() {
    //Todos.store.set('commitRecordsAutomatically', false);
    //this.destroy();
    //Todos.store.cancelRecord(Todos.Todo, this.get('id'));
    //Todos.store.set('commitRecordsAutomatically', true);
  }
});

Todos.Todo.resourceName = 'todos';

Todos.todosController = SC.ArrayProxy.create({
  content: [],

  createTodo: function(title) {
    Todos.store.createRecord(Todos.Todo, {
      title: title,
      created_at: new Date()
    });
  },

  destroyTodo: function(record) {
    record.destroy();
  },

  loadTodos: function() {
    var query = SC.Query.local(Todos.Todo, {
      orderBy: 'created_at DESC'
    });
    var records = Todos.store.find(query);
    this.set('content', records);
  },

  clearCompletedTodos: function() {
    this.filterProperty('isDone', true).forEach(this.destroyTodo, this);
  },

  remaining: function() {
    return this.filterProperty('isDone', false).get('length');
  }.property('@each.isDone'),

  allAreDone: function(key, value) {
    if (value !== undefined) {
      this.setEach('isDone', value);

      return value;
    } else {
      return !!this.get('length') && this.everyProperty('isDone', true);
    }
  }.property('@each.isDone')
});

Todos.StatsView = SC.View.extend({
  remainingBinding: 'Todos.todosController.remaining',

  remainingString: function() {
    var remaining = this.get('remaining');
    return remaining + (remaining === 1 ? " item" : " items");
  }.property('remaining')
});

Todos.CreateTodoView = SC.TextField.extend({
  insertNewline: function() {
    var value = this.get('value');

    if (value) {
      Todos.todosController.createTodo(value);
      this.set('value', '');
    }
  }
});

SC.$(function() {
  Todos.todosController.loadTodos();
});
