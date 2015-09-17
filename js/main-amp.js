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
            startDate: this.get('startDate').format('YYYY-MM-DD'),
            endDate: this.get('endDate').format('YYYY-MM-DD'),
            details: this.get('details')
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

var filterModel = new FilterModel();
new CalendarView({filter: filterModel});
new FilterPanelView({filter: filterModel, el: $('.filter-panel').get(0)});

