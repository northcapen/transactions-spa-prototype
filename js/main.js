var app = {
};
window.app = app;

var Backbone = require('backbone');

// Add this!
if (window.__backboneAgent) {
    window.__backboneAgent.handleBackbone(Backbone);
}

var FilterModel = Backbone.Model.extend({});
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

var FilterPanel = Backbone.View.extend({
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

    initialize: function () {
        this.listenTo(filterModel, 'change', this.render);
        this.render();
    },

    render: function () {
        var filter = filterModel;
        var transactions = _.filter(this.model, function (tx) {
            var text = filter.get('details');
            return moment(tx.time).isBetween(filter.get("startDate"), filter.get("endDate")) &&  (!text || (tx.description +  ' ' + tx.partyName).toLowerCase().indexOf(text.toLowerCase()) > 0);
        });
        this.$el.html(this.template({transactions: transactions}));
        return this;
    }
});


var filterModel = new FilterModel({startDate: moment(), endDate: moment().add(1, 'd')});
new CalendarView({model: filterModel});
new FilterPanel({model: filterModel});
new TransactionsView({model: transactions, filter: filterModel});