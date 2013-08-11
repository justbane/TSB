
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { 
      title: '~ Today\'s Specials ~',
      defaultSlide: 'No venue selected.' 
  });
  
};