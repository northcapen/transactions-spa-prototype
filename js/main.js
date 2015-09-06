var app = {
};

window.app = app;
var Backbone = require('backbone');
var FilterModel = Backbone.Model.extend({});
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
                    that.model.set({"startDate": target.date, "endDate": target.date.clone().add(1, 'd')});
                    $('.day').removeClass('selected');
                    $(target.element).addClass('selected');
                },
                onMonthChange: function(month) {
                    console.log('you just went to ' + month.format('MMMM, YYYY'));
                    that.model.set({"startDate": month, "endDate" : month.clone().endOf("month")});
                }
            }
        });
    }
});

var FilterPanel = Backbone.View.extend({
    el: '.filter-panel',
    template: Handlebars.compile($('#filter-panel-template').html()),

    initialize: function() {
        this.render();
    },

    render: function() {
        this.$el.html(this.template());
        return this;
    }

});

var TransactionsView = Backbone.View.extend({
    el: '.transactions',
    template: Handlebars.compile($('#transactions-template').html()),

    initialize: function() {
      this.render();
      this.listenTo(filter, 'change', function() { console.log('I am filtering', filter.get("startDate"), filter.get("endDate")); this.render(); } );
    },

    render: function () {
        var f = function (tx) {
            console.log('filter here', moment(tx.time));
            return moment(tx.time).isBetween(filter.get("startDate"), filter.get("endDate"));
        };
        var transactions = _.filter(this.model, f );
        this.$el.html(this.template({transactions: transactions}));
        return this;
    }
});

var filter = new FilterModel();
new CalendarView({model : filter});
new FilterPanel({model: filter});

new TransactionsView({model: transactions, filter: filter});