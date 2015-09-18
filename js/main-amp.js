var AmpersandView = require('ampersand-view');
var AmpersandModel = require('ampersand-model');
_ = require('underscore');
var Handlebars = require('handlebars');



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
        filter.trigger('change');
    }
});


var FilterPanelView = AmpersandView.extend({
    template: Handlebars.compile($('#filter-panel-template').html()),

    initialize: function (options) {
        this.filter = options.filter;
        this.listenTo(this.filter, 'change', this.render);
        this.render();
    },

    events: {
        'change' : 'change',
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
        this.renderWithTemplate(this.filter.toJSON());
        return this;
    },

    submit : function(e) {
        e.preventDefault();
    }
});

var TransactionsHeader = AmpersandView.extend({
    template: Handlebars.compile($('#transaction-header').html()),

    initialize: function (options) {
        this.model = options.model;
        this.listenTo(this.model, 'change', this.render);
        this.render();
    },

    render: function() {
       this.renderWithTemplate(this);
       return this;
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

var filterModel = new FilterModel();
new CalendarView({filter: filterModel});
new FilterPanelView({filter: filterModel, el: $('.filter-panel').get(0)});
new TransactionsHeader({model: filterModel, el: $('.header').get(0)});

