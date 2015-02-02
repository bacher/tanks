
T.loadResources = function() {

    return Promise.all([
        //T.loadModel('models/african_head/african_head.obj.json'),
        T.loadTexture('models/african_head/african_head_diffuse.png'),
        T.loadModel('models/ausfb/ausfb.obj.json')
        //T.loadTexture('models/ausfb/ausfb_diffuse.png')

    ]).then(function(data) {
        T.modelsData['ausfb'] = {
            json: data[1],
            imgs: {
                diffuse: data[0]
            },
            textures: {}
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
