
T.loadResources = function() {
    return Promise.all([
        T.loadModel('models/african_head.obj.json'),
        T.loadTexture('models/african_head_diffuse.png')
    ]).then(function(data) {
        T.modelsData['african_head'] = {
            json: data[0],
            imgs: {
                diffuse: data[1]
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
