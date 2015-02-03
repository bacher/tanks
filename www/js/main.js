
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

        //T.player = {
        //    tank: T.addGameObject({
        //        model: 'ausfb',
        //        pos: [0, -1, -5]
        //    }),
        //    tankSpeed: 1
        //};
        //
        //window.tank = T.player.tank;
        //
        //tank.parts['Turret_2'].rot[1] = deg(45);
        //
        //tank.dir = [0, 0, -1];
        //tank.cameraFix = true;

        T.captureInput();

        setInterval(T.logic, 1000 / 3);
        setInterval(T.draw, 1000 / 1);

    });

});
