var moment = require('moment');
var momentRange = require('moment-range');


var AmpersandModel = require('ampersand-model');
var AmpersandRestCollection = require('ampersand-rest-collection');

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

module.exports.FilterModel = FilterModel;
module.exports.TransactionsCollection = TransactionsCollection;