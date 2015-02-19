'use strict';

var identifyM = mat4.create();

T.initShaders = function() {
    T.shaderPrograms = {};

    T.getShadersNames().forEach(function(name) {

        var vertexInfo = T.getShader(name, 'vertex-shader', gl.VERTEX_SHADER);
        var fragmentInfo = T.getShader(name, 'fragment-shader', gl.FRAGMENT_SHADER);

        var shader = T.shaderPrograms[name] = {
            program: gl.createProgram(),
            dbgVertexCode: vertexInfo.code,
            dbgFragmentCode: fragmentInfo.code,
            attributes: {},
            uniforms: {}
        };

        gl.attachShader(shader.program, vertexInfo.shader);
        gl.attachShader(shader.program, fragmentInfo.shader);

        gl.linkProgram(shader.program);

        if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
            alert('Could not initialise shaders');
        }

        gl.useProgram(shader.program);

        $.unique([].concat(vertexInfo.uniforms).concat(fragmentInfo.uniforms)).forEach(function(uniformName) {
            T.initUniform(shader, uniformName);
        });

        vertexInfo.attributes.forEach(function(attributeName) {
            T.initAttribute(shader, attributeName);
        });

    });
};

T.getShadersNames = function() {
    return ['normal', 'repeat'];
};

T.getShader = function(name, clas, type) {
    var info = T.getShaderInfo(name, clas);

    var shader = gl.createShader(type);

    gl.shaderSource(shader, info.code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return {
        shader: shader,
        code: info.code,
        uniforms: info.uniforms,
        attributes: info.attributes
    };
};

T.initAttribute = function(shader, name) {
    var attr = shader.attributes[name] = gl.getAttribLocation(shader.program, name);
    gl.enableVertexAttribArray(attr);
};

T.initUniform = function(shader, name) {
    shader.uniforms[name] = gl.getUniformLocation(shader.program, name);
};

T.initWebGL = function() {
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
};

T.initBuffers = function() {
    for (var modelName in T.modelsData) {

        var modelData = T.modelsData[modelName];

        if (modelData.json) {

            var rawData = T.extractPolygonsFromJSON(modelData.json);

            rawData.parts.forEach(function(partData) {

                var part = {
                    partName: partData.partName,
                    shaderName: partData.shaderName || modelData.params.shaderName || 'normal',
                    buffers: {
                        aVertexPosition: {
                            buffer: T.initBuffer(partData.vertices),
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

                part.verticesCount = partData.vertices.length / 3;

                modelData.parts.push(part);

            });

        } else {
            modelData.parts.push({
                partName: modelName,
                shaderName: 'repeat',
                buffers : {
                    aVertexPosition: {
                        buffer: T.initBuffer([
                            -1, 0, -1,
                            1, 0, -1,
                            1, 0, 1,

                            1, 0, 1,
                            -1, 0, 1,
                            -1, 0, -1
                        ]),
                        size: 3
                    },
                    aVertexUvs: {
                        buffer: T.initBuffer([
                            0, 0,
                            1, 0,
                            1, 1,

                            1, 1,
                            0, 1,
                            0, 0
                        ]),
                        size: 2
                    },
                    aVertexNormal: {
                        buffer: T.initBuffer([0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0]),
                        size: 3
                    }
                },
                verticesCount: 6
            });

            var M = modelData.params.M = mat4.create();

            mat4.scale(M, M, [100, 100, 100]);
        }

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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
};

T.initPerspectiveMatrix = function() {
    var M = T.perspMatrix = mat4.create();
    mat4.perspective(M, Math.PI / 3, T.viewPortWidth / T.viewPortHeight, 0.1, 100.0);
};

T.setGlobalUniforms = function(shader) {
    gl.uniformMatrix4fv(shader.uniforms.uPerspMatrix, false, T.perspMatrix);
    gl.uniformMatrix4fv(shader.uniforms.uCameraMatrix, false, T.player.camera.M);

    gl.uniform3fv(shader.uniforms.uLightDir, T.globalLightDir);

    gl.uniform1i(shader.uniforms.uSampler, 0);
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

T.createCameraObject = function(info) {
    T.player.camera = {
        pos: info.pos,
        dir: info.dir,
        rot: info.rot,
        dirty: true,
        M: null,
        rotation: {
            y: 0,
            z: 0
        }
    };
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

T.rotateCamera = function(params) {
    var camera = T.player.camera;

    camera.rot[1] += params.x;

    camera.rot[0] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rot[0] + params.y));

    console.log(camera.pos);
    camera.dir = makeDir(camera.rot);

    camera.dirty = true;
};

T.draw = function() {
    if (document.hidden) return;

    gl.viewport(0, 0, T.viewPortWidth, T.viewPortHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (T.player.camera.dirty) {
        T.updateGameObjectMatrix(T.player.camera);
    }

    for (var i = 0; i < T.gameObjects.length; ++i) {
        var obj = T.gameObjects[i];

        if (obj.dirty) {
            T.updateGameObjectMatrix(obj);
        }

        var modelData = T.modelsData[obj.model];

        for (var partId = 0; partId < modelData.parts.length; ++partId) {

            var part = modelData.parts[partId];

            var shader = T.shaderPrograms[part.shaderName];

            gl.useProgram(shader.program);

            var objPart = obj.parts[part.partName];

            var M;

            if (objPart) {
                M = objPart.M;
            } else {
                M = obj.M;
            }

            T.setGlobalUniforms(shader);

            gl.uniformMatrix4fv(shader.uniforms.uInitModelMatrix, false, modelData.params.M || identifyM);
            gl.uniformMatrix4fv(shader.uniforms.uModelMatrix, false, M);

            if (shader.uniforms.uScale) {
                gl.uniform1f(shader.uniforms.uScale, 50);
            }

            for (var attrName in shader.attributes) {
                var pointer = shader.attributes[attrName];
                var bufferInfo = part.buffers[attrName];

                gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);
                gl.vertexAttribPointer(pointer, bufferInfo.size, gl.FLOAT, false, 0, 0);
            }

            if (modelData.textures.diffuse) {
                gl.bindTexture(gl.TEXTURE_2D, modelData.textures.diffuse[part.partName]);
            }

            gl.drawArrays(gl.TRIANGLES, 0, part.verticesCount);
        }
    }
};

T.updateGameObjectMatrix = function(obj, inLink) {
    var M = obj.M = mat4.create();

    mat4.rotateZ(M, M, obj.rot[2]);
    mat4.rotateX(M, M, obj.rot[0]);
    mat4.rotateY(M, M, obj.rot[1]);

    mat4.translate(M, M, obj.pos);

    if (obj.scale) {
        mat4.scale(M, M, obj.scale);
    }

    if (!inLink && obj.model) {
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

    var move = [0, 0, 0];

    if (state.forward && !state.back) {
        move[2] = 1;
    } else if (state.back) {
        move[2] = -1;
    }

    if (state.left && !state.right) {
        move[0] = 1;
    } else if (state.right) {
        move[0] = -1;
    }

    if (move[0] || move[2]) {
        //var cameraDir = vec3.clone(T.player.camera.dir);

        vec3.normalize(move, move);

        vec3.scale(move, move, T.player.speed);

        vec3.rotateZ(move, move, [0, 0, 0], -T.player.camera.rot[2]);
        vec3.rotateX(move, move, [0, 0, 0], -T.player.camera.rot[0]);
        vec3.rotateY(move, move, [0, 0, 0], -T.player.camera.rot[1]);

        vec3.add(T.player.camera.pos, T.player.camera.pos, move);

        T.player.camera.dirty = true;
    }

    if (state.arrowRight) {
        T.player.camera.dir[0] += 0.1;

        T.player.camera.dirty = true;

    }

};

function makeDir(rot) {
    var dir = [0, 0, -1];

    var emptyPos = [0, 0, 0];

    vec3.rotateY(dir, dir, emptyPos, rot[1]);
    vec3.rotateX(dir, dir, emptyPos, rot[0]);
    vec3.rotateZ(dir, dir, emptyPos, rot[2]);

    return dir;
}
