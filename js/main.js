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
    template: Handlebars.compile($('#transactions-template').html()),

    initialize: function() {
      this.render();
      this.listenTo(filter, 'change', function() { console.log('I am filtering');});
    },

    render: function () {
        this.$el.html(this.template({transactions: this.model}));
        return this;
    }
});

var filter = new FilterModel();
new CalendarView({model : filter});
new TransactionsView({model: transactions, filter: filter});