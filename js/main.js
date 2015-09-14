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
    },

    toJSON: function() {
        return {
            startDate: this.get('startDate').format('YYYY-MM-DD'),
            endDate: this.get('endDate').format('YYYY-MM-DD'),
            details: this.get('details')
        };
    }
});

var TransactionsCollection = Backbone.Collection.extend({
        url: 'http://localhost:3000/transactions',

        initialize: function(options) {
            this.txFilter = options.filter;
            this.listenTo(options.filter, 'change', this.load);
        },

        load: function () {
            this.fetch({data: this.txFilter.toJSON()});
        },

        filtered: function() {
            return new TransactionsCollection(this.filterTransactions(this.txFilter));
        },

        filterTransactions: function(txFilter) {
            txFilter = txFilter.toJSON();
            var text = txFilter.details;
            return this.filter(function (tx) {
                return moment(tx.get('time')).isBetween(txFilter.startDate, txFilter.endDate) && (!text || (tx.get('description') + ' ' + tx.get('partyName')).toLowerCase().indexOf(text.toLowerCase()) > 0);
            });
        },

        filterTransactionsPerDay : function (day) {
            return this.filterTransactions(new FilterModel({startDate: day, endDate: day.clone().add(1, 'd')}));
        }
    }
);


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
                }
            }
        });
    }
});

var HeatmapView = Backbone.View.extend({
    className: 'cal1',

    initialize: function () {
        this.listenTo(this.collection, 'update', this.render);
    },

    extractDay: function(el) {
        return moment($(el).attr('class').split(' ').filter(function(c) { return c.startsWith('calendar-day-'); })[0]
            .substring('calendar-day-'.length));
    },

    render: function() {
        var heatmap = this;
        $('.day').append(function() {
            var num = heatmap.collection.filterTransactionsPerDay(heatmap.extractDay($(this))).length;
            if (num) {
                return '<div class="counter">' + num + '</div>';
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
        this.$el.html(this.template(this.model.toJSON()));
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

    initialize: function () {
        this.listenTo(this.collection, 'update', this.render);
    },

    render: function () {
        this.$el.html(this.template({transactions: this.collection.filtered().toJSON()}));
        return this;
    }
});

var filterModel = new FilterModel();
var transactionsCollection = new TransactionsCollection({filter: filterModel});
new CalendarView({model: filterModel});
new HeatmapView({collection: transactionsCollection});

new FilterPanelView({model: filterModel});
new TransactionsView({collection: transactionsCollection, filter: filterModel});