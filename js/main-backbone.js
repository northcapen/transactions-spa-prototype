var moment = require('moment');
var momentRange = require('moment-range');
var Backbone = require('backbone');
var Handlebars = require('handlebars');
_ = require('underscore');

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
    },

    toRange: function() {
       return moment.range(this.get('startDate').clone(), this.get('endDate').clone());
    }
});

var TransactionsCollection = Backbone.Collection.extend({
        url: 'http://localhost:3000/transactions',

        initialize: function(models, options) {
            if(!options) return;
            this.txFilter = options.filter;
            this.listenTo(options.filter, 'change', this.processFilterChange);
        },

        processFilterChange: function() {
            if(this.loadedFilterRange && this.loadedFilterRange.contains(this.txFilter.toRange().start) && this.loadedFilterRange.contains(this.txFilter.toRange().end)) {
                this.trigger('update');
                return;
            }

            var collection = this;
            this.fetch({data: this.txFilter.toJSON(), success: function() {
                collection.loadedFilterRange = collection.txFilter.toRange();
                collection.trigger('update');
                collection.trigger('reset');
                console.log('New ', collection.length,  ' transactions loaded ', ' for range ', collection.loadedFilterRange);
            }});
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

    initialize: function (options) {
        this.filter = options.filter;
        this.render();
    },

    render: function () {
        var filter = this.filter;
        $('.cal1').clndr({
            clickEvents: {
                click: function (target) {
                    filter.set({"startDate": target.date, "endDate": target.date.clone().add(1, 'd')});

                    $('.day').removeClass('selected');
                    $(target.element).addClass('selected');
                },
                onMonthChange: function (month) {
                    filter.set({"startDate": month, "endDate": month.clone().endOf("month")});
                }
            }
        });
        filter.trigger('change');
    }
});

var HeatmapView = Backbone.View.extend({
    className: 'cal1',

    initialize: function () {
        this.listenTo(this.collection, 'reset', this.render);
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

    initialize: function (options) {
        this.filter = options.filter;
        this.listenTo(this.filter, 'change', this.render);
        this.render();
    },

    events: {
      //  'keyup' : 'processKey',
        'change': 'change',
        'submit form' : 'submit'
    },

    change: function (e) {
        this.filter.set({
            'startDate': moment($('input[name=startDate]', this.$el).val()),
            'endDate': moment($('input[name=endDate]', this.$el).val()),
            'details': $('input[name=details]', this.$el).val()
        });
        return false;
    },

    render: function () {
        this.$el.html(this.template(this.filter.toJSON()));
        return this;
    },

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
var transactionsCollection = new TransactionsCollection([], {filter: filterModel});

new CalendarView({filter: filterModel});
new HeatmapView({collection: transactionsCollection});
new FilterPanelView({filter: filterModel});
new TransactionsView({collection: transactionsCollection, filter: filterModel});