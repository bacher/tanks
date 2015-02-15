
var T = {
    modelsData: {},
    loadModels: [],
    gameObjects: [],
    input: {
        keyState: {}
    },
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

        var tank = T.addGameObject({
            model: 'ausfb',
            pos: [0, 0, 0]
        });

        tank.dir = [0, 0, -1];

        T.player = {
            speed: 1
        };

        T.createCameraObject({
            pos: [0, 0, 0],
            dir: [0, 0, -1]
        });

        T.captureInput();

        setInterval(T.logic, 1000 / ((T.fps) * 1.5));
        setInterval(T.draw, 1000 / T.fps);

    });

});
