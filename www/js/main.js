
var T = {
    modelsData: {},
    loadModels: [],
    gameObjects: [],
    input: {
        keyState: {}
    },
    cameraSpeed: 0.1,
    fps: 60,

    pageParams: {}
};


location.search.substr(1).split('&').forEach(function(param) {
    var pair = param.split('=');

    if (pair.length > 1) {
        T.pageParams[pair[0]] = pair[1];
    } else {
        T.pageParams[pair[0]] = true;
    }
});

if (T.pageParams.fps) {
    T.fps = Number(T.pageParams.fps);
}


//T.loadModels.push(
//    'african_head',
//    'ausfb'
//);
//
//T.loadTextures();

$(function() {

    T.initCanvas();

    T.initShaders();
    T.initWebGL();

    T.initPerspectiveMatrix();
    T.initCameraMatrix();

    T.globalLightDir = vec3.create();
    T.globalLightDir[2] = 1;

    T.loadResources().then(function() {

        T.initBuffers();

        var land = T.addGameObject({
            model: 'land'
        });

        var head = T.addGameObject({
            model: 'african_head',
            scale: 2,
            pos: [0, 5, 0]
        });

        T.player = {
            tank: T.addGameObject({
                model: 'ausfb',
                pos: [0, 0, 0]
            }),
            tankSpeed: 1
        };

        window.tank = T.player.tank;

        tank.dir = [0, 0, -1];
        tank.cameraFix = true;

        T.captureInput();

        setInterval(T.logic, 1000 / ((T.fps) * 1.5));
        setInterval(T.draw, 1000 / T.fps);

    });

});
