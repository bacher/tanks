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
    T.initUniform('uInitModelMatrix');
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

        rawData.parts.forEach(function(partData) {

            var part = {
                partName: partData.partName,
                buffers: {
                    aVertexPosition: {
                        buffer: T.initBuffer(partData.polygons),
                        size: 3
                    },
                    aVertexUvs: {
                        buffer: T.initBuffer(partData.uvs),
                        size: 2
                    },
                    aVertexNormal: {
                        buffer: T.initBuffer(partData.normals),
                        size: 3
                    }
                }
            };

            part.polygonsCount = partData.polygons.length / 3;

            modelData.parts.push(part);

        });

        for (var texType in modelData.images) {
            var images = modelData.images[texType];

            modelData.textures[texType] = modelData.textures[texType] || {};

            for (var texName in images) {
                modelData.textures[texType][texName] = T.initTexture(images[texName]);
            }
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
    T.camera = {
        M: mat4.create()
    };
};

T.setGlobalUniforms = function() {
    gl.uniformMatrix4fv(T.shaderProgram.uniforms.uPerspMatrix, false, T.perspMatrix);
    gl.uniformMatrix4fv(T.shaderProgram.uniforms.uCameraMatrix, false, T.camera.M);

    gl.uniform3fv(T.shaderProgram.uniforms.uLightDir, T.globalLightDir);

    gl.uniform1i(T.shaderProgram.uniforms.uSampler, 0);
};

T.addGameObject = function(info) {
    var obj = {
        model: info.model,
        pos: info.pos || [0, 0, 0],
        scale: info.scale && [info.scale, info.scale, info.scale] || [1, 1, 1],
        rot: info.rot || [0, 0, 0],
        dirty: true,
        M: null,
        parts: {}
    };

    var model = T.modelsData[obj.model];
    if (model.params.link) {
        extractPartNames(model.params.link, obj.parts);
    }

    T.gameObjects.push(obj);

    return obj;
};

function extractPartNames(link, storage) {
    for (var partName in link) {
        if (!storage[partName]) {
            storage[partName] = {
                partName: partName,
                pos: [0, 0, 0],
                rot: [0, 0, 0],
                scale: [1, 1, 1],
                M: null
            };

            if (link[partName] !== null) {
                extractPartNames(link[partName], storage);
            }
        }
    }
}

T.draw = function() {
    gl.viewport(0, 0, T.viewPortWidth, T.viewPortHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    T.setGlobalUniforms();

    var attributes = T.shaderProgram.attributes;

    for (var i = 0; i < T.gameObjects.length; ++i) {
        var obj = T.gameObjects[i];

        if (obj.dirty) {
            T.updateGameObjectMatrix(obj);
        }

        var modelData = T.modelsData[obj.model];

        for (var partId = 0; partId < modelData.parts.length; ++partId) {

            var part = modelData.parts[partId];

            var objPart = obj.parts[part.partName];

            var M;

            if (objPart) {
                M = objPart.M;
            } else {
                M = obj.M;
            }

            gl.uniformMatrix4fv(T.shaderProgram.uniforms.uInitModelMatrix, false, modelData.params.M);
            gl.uniformMatrix4fv(T.shaderProgram.uniforms.uModelMatrix, false, M);

            for (var attrName in attributes) {
                var pointer = attributes[attrName];
                var bufferInfo = part.buffers[attrName];

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
                gl.vertexAttribPointer(pointer, bufferInfo.size, gl.FLOAT, false, 0, 0);
            }

            gl.bindTexture(gl.TEXTURE_2D, modelData.textures.diffuse[part.partName]);

            gl.drawArrays(gl.TRIANGLES, 0, part.polygonsCount);
        }
    }
};

T.updateGameObjectMatrix = function(obj, inLink) {
    var M = obj.M = mat4.create();

    mat4.translate(M, M, obj.pos);
    mat4.scale(M, M, obj.scale);

    if (obj.dir) {
        var dirQ = quat.create();

        quat.rotationTo(dirQ, [0, 0, -1], obj.dir);

        var rotM = mat4.create();
        mat4.fromQuat(rotM, dirQ);

        mat4.mul(M, M, rotM);

        var cameraLoc = vec3.clone(obj.pos);

        var deltaLoc = vec3.clone(obj.dir);

        vec3.scale(deltaLoc, deltaLoc, 10);
        vec3.sub(cameraLoc, cameraLoc, deltaLoc);

        var lookAt = vec3.clone(obj.pos);

        cameraLoc[1] += 8;
        lookAt[1] += 4;

        mat4.lookAt(T.camera.M, cameraLoc, lookAt, [0, 1, 0]);
    } else {
        mat4.rotateX(M, M, obj.rot[0]);
        mat4.rotateY(M, M, obj.rot[1]);
        mat4.rotateZ(M, M, obj.rot[2]);
    }

    if (!inLink) {
        var model = T.modelsData[obj.model];

        if (model.params.link) {
            updateRecursively(model.params.link, M, obj.parts);
        }

        obj.dirty = false;
    }
};

function updateRecursively(partNames, parentM, parts) {
    for (var partName in partNames) {

        var part = parts[partName];

        T.updateGameObjectMatrix(part, true);

        mat4.mul(part.M, parentM, part.M);

        if (partNames[partName]) {
            updateRecursively(partNames[partName], part.M, parts);
        }
    }
}

T.logic = function() {

    T.updateInputData();

};

T.updateInputData = function() {
    var state = T.input.keyState;

    var dir = 0;

    if (state.forward && !state.back) {
        dir = 1;
    } else if (state.back) {
        dir = -1;
    }

    if (dir) {
        var deltaPos = vec3.clone(tank.dir);

        vec3.scale(deltaPos, deltaPos, T.player.tankSpeed);

        if (dir === -1) {
            vec3.negate(deltaPos, deltaPos);
        }

        vec3.add(tank.pos, tank.pos, deltaPos);

        tank.dirty = true;
    }

    var d = 0;

    if (state.left && !state.right) {
        d = 0.1;
    } else if (state.right) {
        d = -0.1
    }

    if (d) {
        var rotM = mat4.create();
        mat4.rotateY(rotM, rotM, d);

        vec3.transformMat4(tank.dir, tank.dir, rotM);

        tank.dirty = true;
    }

    var a = 0;

    if (state.arrowRight && !state.arrowLeft) {
        a = -0.1;
    } else if (state.arrowLeft) {
        a = 0.1;
    }

    if (a) {
        tank.parts['Turret_2'].rot[1] += a;
        tank.dirty = true;
    }

};
