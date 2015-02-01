
var T = {
    modelsData: {},
    gameObjects: []
};

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
            model: 'african_head',
            pos: [0, 0, 0]
        });

        T.draw();

    });

});
