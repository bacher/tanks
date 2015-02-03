
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

        tank.parts['Turret_2'].rot[1] = deg(45);

        tank.dir = [0, 0, -1];
        tank.cameraFix = true;

        T.captureInput();

        setInterval(T.logic, 1000 / 30);
        setInterval(T.draw, 1000 / 10);

    });

});
