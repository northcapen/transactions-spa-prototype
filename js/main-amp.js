var AmpersandView = require('ampersand-view');
var AmpersandModel = require('ampersand-model');
var AmpersandRestCollection = require('ampersand-rest-collection');
_ = require('underscore');
var Handlebars = require('handlebars');

var moment = require('moment');
var momentRange = require('moment-range');

var FilterModel = AmpersandModel.extend({
    props: {
        startDate: ['object', true, function() {return moment();      } ],
        endDate  : ['object', true, function() { var m = moment(); m.add(1, 'd'); return m; }]
    },

    toJSON: function() {
        return {
            startDate: this.startDate.format('YYYY-MM-DD'),
            endDate: this.endDate.format('YYYY-MM-DD'),
            details: this.details
        };
    },

    toRange: function() {
        return moment.range(this.get('startDate').clone(), this.get('endDate').clone());
    }
});


var TransactionsCollection = AmpersandRestCollection.extend({
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
            var text = txFilter.details;
            return this.filter(function (tx) {
                return moment(tx.time).isBetween(txFilter.startDate, txFilter.endDate) && (!text || (tx.get('description') + ' ' + tx.get('partyName')).toLowerCase().indexOf(text.toLowerCase()) > 0);
            });
        },

        filterTransactionsPerDay : function (day) {
            return this.filterTransactions(new FilterModel({startDate: day, endDate: day.clone().add(1, 'd')}));
        }
    }
);


var CalendarView = AmpersandView.extend({
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
    }
});


var FilterPanelView = AmpersandView.extend({
    template: Handlebars.compile($('#filter-panel-template').html()),

    initialize: function (options) {
        this.filter = options.filter;
        this.listenTo(this.filter, 'change', this.render);

        // who is responsible for this?
        setTimeout(function(){options.filter.trigger('change');}, 0);
    },

    events: {
        'change [name=startDate]' : 'changeStartDate',
        'change [name=endDate]' : 'changeEndDate',
        'submit form' : 'submit'
    },

    changeStartDate: function(e) {
      this.filter.startDate = moment($(e.target).val());
    },

    changeEndDate: function(e) {
        this.filter.endDate = moment($(e.target).val());
    },

    //can I remove it?
    render: function () {
        this.renderWithTemplate(this.filter.toJSON());
        return this;
    }
});

var TransactionsHeader = AmpersandView.extend({
    template: Handlebars.compile($('#transaction-header').html()),

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    },

    bindings: {
        'model.startDate' : {
            type: function(el, value) { return this.printDate(el, value)},
            selector: '.from'
        },
        'model.endDate' : {
            type: function(el, value) { return this.printDate(el, value)},
            'selector': '.to'
        }
    },

    printDate: function(el, value) {
        $(el).text(value.format('DD MMMM'));
    }
});

var TransactionsView = AmpersandView.extend({
    template: Handlebars.compile('<div class="transactions">' + $('#transactions-template').html() + '</div>'),

    //collection name?
    initialize: function (options) {
        this.listenTo(this.collection, 'update', this.render);
    },

    render: function () {
        this.renderWithTemplate({transactions: this.collection.filtered().toJSON()});
        return this;
    }
});

var filterModel = new FilterModel();
var transactions = new TransactionsCollection([], {filter: filterModel});

new CalendarView({filter: filterModel});
new FilterPanelView({filter: filterModel, el: $('.filter-panel').get(0)});
new TransactionsHeader({model: filterModel, el: $('.header').get(0)});
new TransactionsView({collection: transactions, el: $('.transactions').get(0)});