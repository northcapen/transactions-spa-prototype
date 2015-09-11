var app = {
};
window.app = app;

var Backbone = require('backbone');

// Add this!
if (window.__backboneAgent) {
    window.__backboneAgent.handleBackbone(Backbone);
}

var FilterModel = Backbone.Model.extend({
    defaults: {
        startDate: moment(),
        endDate: moment().add(1, 'd')
    }
});

var CalendarView = Backbone.View.extend({
    className: 'cal1',

    initialize: function () {
        this.render();
    },

    render: function () {
        var that = this;
        $('.cal1').clndr({
            clickEvents: {
                click: function (target) {
                    console.log('click', target);
                    that.model.set({"startDate": target.date, "endDate": target.date.clone().add(1, 'd')});

                    $('.day').removeClass('selected');
                    $(target.element).addClass('selected');
                },
                onMonthChange: function (month) {
                    that.model.set({"startDate": month, "endDate": month.clone().endOf("month")});
                    new HeatmapView();
                }
            }
        });
        new HeatmapView();
    }
});

var HeatmapView = Backbone.View.extend({
    className: 'cal1',

    initialize: function () {
        this.render();
    },

    render: function() {
        var findDay = function (el) {
            return moment($(el).attr('class').split(' ').filter(function(c) { return c.startsWith('calendar-day-'); })[0]
            .substring('calendar-day-'.length));
        };

        $('.day').append(function() {
            var transactions = transactionsHelper.filterTransactionsPerDay(findDay($(this))).length;
            if (transactions) {
                return '<div class="counter">' + transactions + '</div>';
            }
            return;
        });
    }
});

var FilterPanelView = Backbone.View.extend({
    el: '.filter-panel',
    template: Handlebars.compile($('#filter-panel-template').html()),

    initialize: function () {
        this.render();
        this.listenTo(this.model, 'change', this.render);
    },

    events: {
      //  'keyup' : 'processKey',
        'change': 'filter',
        'submit form' : 'submit'
    },

    filter: function (e) {
        this.model.set({
                          'startDate': moment($('input[name=startDate]', this.$el).val()),
                          'endDate': moment($('input[name=endDate]', this.$el).val()),
                          'details': $('input[name=details]', this.$el).val()
                       });
        return false;
    },

    render: function () {
        this.$el.html(this.template({startDate: this.model.get('startDate').format('YYYY-MM-DD'),
                                     endDate: this.model.get('endDate').format('YYYY-MM-DD'),
                                     details: this.model.get('details')}));
        return this;
    },

   /* processKey: function(e) {
        if(e.which === 13) {
            this.submit();
        }// enter key
    },
*/
    submit : function(e) {
        console.log('submit form');
        e.preventDefault();
    }
});

var TransactionsView = Backbone.View.extend({
    el: '.transactions',
    template: Handlebars.compile($('#transactions-template').html()),

    initialize: function (options) {
        this.filter = options.filter;
        this.listenTo(this.filter, 'change', this.render);
        this.render();
    },

    render: function () {
        this.$el.html(this.template({transactions: transactionsHelper.filterTransactions(this.filter)}));
        return this;
    }
});

var transactionsHelper = {
    filterTransactionsPerDay : function (day) {
         return this.filterTransactions(new FilterModel({startDate: day, endDate: day.clone().add(1, 'd')}));
    },

    filterTransactions: function(filter) {
        return _.filter(transactions, function (tx) {
            var text = filter.get('details');
            return moment(tx.time).isBetween(filter.get("startDate"), filter.get("endDate")) &&  (!text || (tx.description +  ' ' + tx.partyName).toLowerCase().indexOf(text.toLowerCase()) > 0);
        });
    }
};

var filterModel = new FilterModel();
new CalendarView({model: filterModel});
new FilterPanelView({model: filterModel});
new TransactionsView({model: transactions, filter: filterModel});