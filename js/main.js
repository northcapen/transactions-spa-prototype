var app = {
};

window.app = app;

//$('.cal1').clndr();

var Backbone = require('backbone');

var TransactionsView = Backbone.View.extend({

  className: 'transactions',

  render: function() {
      var source = $('#transactions-template').html();
      var template = Handlebars.compile(source);
      var result = template({transactions: transactions});
      $('.transactions').html(result);
      return this;
  }
});

var transactionsView = new TransactionsView();
transactionsView.render();