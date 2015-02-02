
T.loadResources = function() {

    return Promise.all([
        //T.loadModel('models/african_head/african_head.obj.json'),
        //T.loadTexture('models/african_head/african_head_diffuse.png'),
        T.loadModel('models/ausfb/ausfb.obj.json'),
        T.loadTexture('models/ausfb/Turret.png'),
        T.loadTexture('models/ausfb/Track.png'),
        T.loadTexture('models/ausfb/Turret_2.png'),
        T.loadTexture('models/ausfb/Body_2.png'),
        T.loadTexture('models/ausfb/Body_1.png')

    ]).then(function(data) {
        T.modelsData['ausfb'] = {
            json: data[0],
            imgs: {
                diffuse: data.slice(1)
            },
            textures: {},
            parts: []
        };
    });
};

T.loadModel = function(path) {
    return new Promise(function(resolve) {
        $.getJSON(path).then(resolve);
    });
};

T.loadTexture = function(path) {
    return new Promise(function(resolve) {
        var img = new Image();

        img.onload = function() {
            resolve(img);
        };

        img.src = path;
    });
};
