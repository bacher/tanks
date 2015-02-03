
(function() {
    var ALIASES = T.input.KEY_ALIASES = {
        87: 'forward',
        83: 'back',
        65: 'left',
        68: 'right',
        38: 'arrowForward',
        40: 'arrowBack',
        39: 'arrowRight',
        37: 'arrowLeft',
        32: 'space'
    };

    T.captureInput = function() {
        $('BODY')
            .on('keydown', function(e) {
                if (e.which in ALIASES && !e.ctrlKey && !e.metaKey) {
                    T.input.keyState[ALIASES[e.which]] = true;

                    e.preventDefault();
                    e.stopPropagation();
                }
            })
            .on('keyup', function(e) {
                if (e.which in ALIASES) {
                    T.input.keyState[ALIASES[e.which]] = false;

                    e.preventDefault();
                    e.stopPropagation();
                }
            });
    };
})();
