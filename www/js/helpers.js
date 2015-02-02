
T.initCanvas = function() {
    var $body = $('BODY');
    var $canvas = $('#game');

    var canvas = T.canvas = $canvas[0];

    window.gl = canvas.getContext('webgl');

    $body.on('resize', T.resizeViewPort);

    T.resizeViewPort();
};

T.resizeViewPort = function() {
    var $body = $('BODY');

    T.viewPortWidth = T.canvas.width = $body.width();
    T.viewPortHeight = T.canvas.height = $body.height();
};


T.getShaderText = function(id) {
    return $('#' + id).text();
};


T.extractPolygonsFromJSON = function(model) {
    var facesCount = model.metadata.faces;

    var data = {
        polygons: [],
        normals: [],
        uvs: []
    };

    for (var i = 0; i < facesCount; i++) {
        var offset = i * 8;
        var face = [model.faces[offset + 1], model.faces[offset + 2], model.faces[offset + 3]];
        var uvs = [model.faces[offset + 5], model.faces[offset + 6], model.faces[offset + 7]];
        //var normalsIds = [model.faces[offset + 8], model.faces[offset + 9], model.faces[offset + 10]];

        for (var j = 0; j < 3; j++) {
            var v0offset = face[j] * 3;
            var uvOffset = uvs[j] * 2;
            //var nOffset = normalsIds[j] * 3;

            data.polygons.push(
                model.vertices[v0offset],
                model.vertices[v0offset + 1],
                model.vertices[v0offset + 2]
            );

            data.normals.push(
                0,//model.normals[nOffset],
                0,//model.normals[nOffset + 1],
                0//model.normals[nOffset + 2]
            );
            data.uvs.push(
                model.uvs[0][uvOffset],
                model.uvs[0][uvOffset + 1]
            );
        }
    }

    return data;
};
