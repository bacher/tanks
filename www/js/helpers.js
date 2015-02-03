
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

T.getShaderInfo = function(name, clas) {
    var $shader = $('.' + clas + '[data-name="' + name + '"]');

    var info = {
        code: $shader.text(),
        uniforms: []
    };

    var uniformsString = $shader.data('uniforms');

    if (uniformsString) {
        info.uniforms = uniformsString.split(' ');
    }

    if (clas === 'vertex-shader') {
        info.attributes = [];

        var attributesString = $shader.data('attributes');

        if (attributesString) {
            info.attributes = attributesString.split(' ');
        }
    }

    return info;
};

T.extractPolygonsFromJSON = function(model) {
    var facesCount = model.metadata.faces;
    var materialsCount = model.metadata.materials;

    var valuesPerFace = model.faces.length / model.metadata.faces;

    var includeNormals = !!model.metadata.normals;

    var materials = model.materials;

    var data = {
        parts: []
    };

    for (var m = 0; m < materialsCount; ++m) {
        data.parts.push({
            partName: materials[m].DbgName,
            polygons: [],
            normals: [],
            uvs: []
        });
    }

    for (var i = 0; i < facesCount; i++) {
        var offset = i * valuesPerFace;

        var matId = model.faces[offset + 4];
        var vertices = [model.faces[offset + 1], model.faces[offset + 2], model.faces[offset + 3]];
        var uvs = [model.faces[offset + 5], model.faces[offset + 6], model.faces[offset + 7]];

        if (includeNormals) {
            var normalsIds = [model.faces[offset + 8], model.faces[offset + 9], model.faces[offset + 10]];
        }

        var part = data.parts[matId];

        for (var j = 0; j < 3; j++) {
            var vOffset = vertices[j] * 3;

            part.polygons.push(
                model.vertices[vOffset],
                model.vertices[vOffset + 1],
                model.vertices[vOffset + 2]
            );

            var uvOffset = uvs[j] * 2;

            part.uvs.push(
                model.uvs[0][uvOffset],
                model.uvs[0][uvOffset + 1]
            );

            if (includeNormals) {
                var nOffset = normalsIds[j] * 3;

                part.normals.push(
                    model.normals[nOffset],
                    model.normals[nOffset + 1],
                    model.normals[nOffset + 2]
                );
            } else {
                part.normals.push(0, 0, 0);
            }
        }
    }

    return data;
};

function deg(a) {
    return a * Math.PI / 180;
}
