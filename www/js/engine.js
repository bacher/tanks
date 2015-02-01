'use strict';

T.initShaders = function() {
    T.shaderProgram = {
        program: null,
        attributes: {},
        uniforms: {}
    };

    var vertexShader = T.getShader('fragment-shader', gl.FRAGMENT_SHADER);
    var fragmentShader = T.getShader('vertex-shader', gl.VERTEX_SHADER);

    var program = T.shaderProgram.program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Could not initialise shaders');
    }

    gl.useProgram(program);

    T.initAttribute('aVertexPosition');
    T.initAttribute('aVertexNormal');
    T.initAttribute('aVertexUvs');

    T.initUniform('uPerspMatrix');
    T.initUniform('uCameraMatrix');
    T.initUniform('uModelMatrix');
    T.initUniform('uLightDir');
    T.initUniform('uSampler');
};

T.getShader = function(id, type) {
    var code = T.getShaderText(id);

    var shader = gl.createShader(type);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

T.initAttribute = function(name) {
    var attr = T.shaderProgram.attributes[name] = gl.getAttribLocation(T.shaderProgram.program, name);
    gl.enableVertexAttribArray(attr);
};

T.initUniform = function(name) {
    T.shaderProgram.uniforms[name] = gl.getUniformLocation(T.shaderProgram.program, name);
};

T.initWebGL = function() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
};

T.initBuffers = function() {
    for (var modelName in T.modelsData) {

        var modelData = T.modelsData[modelName];

        var rawData = T.extractPolygonsFromJSON(modelData.json);

        modelData.buffers = {
            aVertexPosition: {
                buffer: T.initBuffer(rawData.polygons),
                size: 3
            },
            aVertexUvs: {
                buffer: T.initBuffer(rawData.uvs),
                size: 2
            },
            aVertexNormal: {
                buffer: T.initBuffer(rawData.normals),
                size: 3
            }
        };

        modelData.polygonCount = rawData.polygons.length / 3;

        for (var texName in modelData.imgs) {
            modelData.textures[texName] = T.initTexture(modelData.imgs[texName]);
        }
    }
};

T.initBuffer = function(data) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    return buffer;
};

T.initTexture = function(img) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    return texture;
};

T.initPerspectiveMatrix = function() {
    var M = T.perspMatrix = mat4.create();
    mat4.perspective(M, Math.PI / 3, T.viewPortWidth / T.viewPortHeight, 0.1, 100.0);
};

T.initCameraMatrix = function() {
    var M = T.cameraMatrix = mat4.create();
    mat4.translate(M, M, [0, 0, -2]);
};

T.setGlobalUniforms = function() {
    gl.uniformMatrix4fv(T.shaderProgram.uniforms.uPerspMatrix, false, T.perspMatrix);
    gl.uniformMatrix4fv(T.shaderProgram.uniforms.uCameraMatrix, false, T.cameraMatrix);

    gl.uniform3fv(T.shaderProgram.uniforms.uLightDir, T.globalLightDir);

    gl.uniform1i(T.shaderProgram.uniforms.uSampler, 0);
};

T.addGameObject = function(info) {

    T.gameObjects.push({
        model: info.model,
        mMatrix: mat4.create()
    });

};

T.draw = function() {

    gl.viewport(0, 0, T.viewPortWidth, T.viewPortHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    T.setGlobalUniforms();

    var attributes = T.shaderProgram.attributes;

    for (var i = 0; i < T.gameObjects.length; ++i) {
        var obj = T.gameObjects[i];

        gl.uniformMatrix4fv(T.shaderProgram.uniforms.uModelMatrix, false, obj.mMatrix);

        var modelData = T.modelsData[obj.model];

        for (var attrName in attributes) {
            var pointer = attributes[attrName];
            var bufferInfo = modelData.buffers[attrName];

            gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
            gl.vertexAttribPointer(pointer, bufferInfo.size, gl.FLOAT, false, 0, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, modelData.polygonCount);
    }

};
