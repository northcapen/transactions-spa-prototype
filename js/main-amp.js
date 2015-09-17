var AmpersandView = require('ampersand-view');
var AmpersandModel = require('ampersand-model');
_ = require('underscore');


var FilterModel = AmpersandModel.extend({
    props: {
        startDate: ['object', true, function() {return moment(); } ],
        endDate: ['object', true, function() { moment().add(1, 'd'); }]
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

var filterModel = new FilterModel();
new CalendarView({filter: filterModel});