$( function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 24,
      values: [ 0, 24 ],
      slide: function( event, ui ) {
        $( "#teetime"   ).val( ui.values[ 0 ] + ":00 - " + ui.values[ 1 ] +":00" );
        $( "#time-low"  ).val( ui.values[ 0 ]);
        $( "#time-high" ).val( ui.values[ 1 ]);
      }
    });
    $( "#teetime" ).val(  $( "#slider-range" ).slider( "values", 0 ) +
      ":00 - " + $( "#slider-range" ).slider( "values", 1 ) + ":00" );
  } );