
(function() {
    var ALIASES = T.input.KEY_ALIASES = {
        87: 'forward',
        83: 'back',
        65: 'left',
        68: 'right'
    };

    T.captureInput = function() {
        $('BODY')
            .on('keydown', function(e) {
                if (e.which in ALIASES) {
                    T.input.keyState[ALIASES[e.which]] = true;
                }
            })
            .on('keyup', function(e) {
                if (e.which in ALIASES) {
                    T.input.keyState[ALIASES[e.which]] = false;
                }
            });
    };
})();
