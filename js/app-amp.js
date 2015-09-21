var models = require('./models-amp');
var views = require('./views-amp');

app = {
    launch: function() {
        var filterModel = new models.FilterModel();
        var transactions = new models.TransactionsCollection([], {filter: filterModel});

        new views.CalendarView({filter: filterModel});
        new views.FilterPanelView({filter: filterModel, el: $('.filter-panel').get(0)});
        new views.TransactionsHeader({model: filterModel, el: $('.header').get(0)});
        new views.TransactionsView({collection: transactions, el: $('.transactions').get(0)});
    }
};

app.launch();