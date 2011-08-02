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
  created_at: SC.Record.attr(SC.DateTime, {defaultValue: SC.DateTime.create()}),

  isDoneBinding: 'is_done',
  createdAt: function() {
    return this.get('created_at').toFormattedString('%d/%m/%y');
  }.property('created_at').cacheable(),

  // Error messages
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
  }.property('errorValue.body').cacheable()
});

Todos.Todo.resourceName = 'todos';

Todos.todosController = SC.ArrayProxy.create({
  content: [],

  createTodo: function(title) {
    Todos.store.createRecord(Todos.Todo, {
      title: title
    });
  },

  loadTodos: function() {
    var query = SC.Query.local(Todos.Todo, {orderBy: 'created_at DESC'}),
        data = Todos.store.find(query);

    data.addObserver('status', this, function observer() {
      if (data.get('status') === SC.Record.READY_CLEAN) {
        data.removeObserver('status', this, observer);
        this.set('content', data);
      }
    });

    // in case our data was already loaded (ie synchronous)
    data.notifyPropertyChange('status');
  },

  clearCompletedTodos: function() {
    this.filterProperty('isDone', true).forEach(function(todo) {
      todo.destroy();
    }, this);
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

Todos.todosController.loadTodos();
