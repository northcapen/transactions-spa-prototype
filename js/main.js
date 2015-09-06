var app = {
};

window.app = app;


var Backbone = require('backbone');

var FilterModel = Backbone.Model.extend({
});



var CalendarView = Backbone.View.extend({
    className: 'cal1',

    initialize: function() {
       this.render();
    },

    render: function() {
        var that = this;
        $('.cal1').clndr({
            clickEvents: {
                click: function (target) {
                    console.log('click', target);
                    that.model.set("day", target);
                }
            }
        });
    }
});


var TransactionsView = Backbone.View.extend({
    el: '.transactions',

    initialize: function() {
      this.render();
      this.listenTo(filter, 'change', function() { console.log('I am filtering');});
    },

    render: function () {
        var source = $('#transactions-template').html();
        var template = Handlebars.compile(source);
        var result = template({transactions: transactions});
        this.$el.html(result);
        return this;
    }
});

var filter = new FilterModel();
new CalendarView({model : filter});
new TransactionsView({model: transactions, filter: filter});