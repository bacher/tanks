
var T = {
    modelsData: {},
    loadModels: [],
    gameObjects: [],
    input: {
        keyState: {}
    },
    cameraSpeed: 0.1
};

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

        T.addGameObject({
            model: 'ausfb',
            pos: [0, -1, -5]
        });

        T.captureInput();


        setInterval(T.logic, 1000 / 10);
        setInterval(T.draw, 1000 / 5);

    });

});
