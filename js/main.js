var app = {



};

window.app = app;

//$('.cal1').clndr();

var source = $('#transactions-template').html();
var template = Handlebars.compile(source);
var result = template({transactions: transactions});
$('.transactions').append(result);
