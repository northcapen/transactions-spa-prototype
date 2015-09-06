var app = {
};

window.app = app;


var Backbone = require('backbone');

var CalendarView = Backbone.View.extend({
    className: 'cal1',

    initialize: function() {
       this.render();
    },

    render: function() {
        $('.cal1').clndr({
            clickEvents: {
                click: function (target) {
                    console.log('click');
                }
            }
        });
    }
});


var TransactionsView = Backbone.View.extend({
    className: 'transactions',

    initialize: function() {
      this.render();
    },

    render: function () {
        var source = $('#transactions-template').html();
        var template = Handlebars.compile(source);
        var result = template({transactions: transactions});
        $('.transactions').html(result);
        return this;
    }
});

new CalendarView();
new TransactionsView();