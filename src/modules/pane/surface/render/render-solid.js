((function () {
    'use strict';

    Modules.prototype.add('render-solid', function (instance) {
        var shader = null;
        instance.asset.shader.get('solid', function (s) {
            shader = s;
        });

        var grid = {
            type: 'object',
            primitive: instance.graphics.gl.LINES,
            mesh: GL.Mesh.grid({
                lines: 11,
                size: 10
            }),
            model: mat4.create(),
        };

        instance.surface.renders.solid = function (surface) {
            var lightDirection = vec3.create();
            surface.camera.getPosition(lightDirection);
            vec3.add(lightDirection, lightDirection, [1, 2, 0]);
            vec3.normalize(lightDirection, lightDirection);
            uniforms.u_lightvector = lightDirection;

            renderObject(surface, grid, shader);
            instance.scene.getObjects().forEach(function (node) {
                renderObject(surface, node.data, shader);
            });
        };

        instance.events.on('surface.create', function (surface) {
            instance.surface.setRender(surface, 'solid');
        });
    }, ['surface-render', 'shader']);

    var uniforms = {
        u_color: [0.7, 0.7, 0.7, 1],
        u_lightvector: null,
        u_model: null,
        u_mvp: mat4.create()
    };

    var temp = mat4.create();
    function renderObject (surface, obj, shader) {
        surface.camera.getViewMatrix(temp);
        mat4.multiply(temp, surface.camera.projection, temp);
        mat4.multiply(uniforms.u_mvp, temp, obj.model);

        uniforms.u_model = obj.model;

        if (shader) {
            shader.uniforms(uniforms);
            if (obj.mesh instanceof Math.HalfEdgeMesh) {
                var mesh = getCachedVBOMesh(obj.mesh);
                shader.draw(mesh, obj.primitive);
            } else {
                shader.draw(obj.mesh, obj.primitive);
            }
        }
    }

    var cacheKey = 'render-solid';
    function getCachedVBOMesh (halfEdgeMesh) {
        halfEdgeMesh._cache = halfEdgeMesh._cache || {};
        if (halfEdgeMesh._cache[cacheKey]) {
            if (halfEdgeMesh._cache[cacheKey].time <= halfEdgeMesh.lastBump) {
                halfEdgeMesh._cache[cacheKey] = buildMeshFromHalfEdges(halfEdgeMesh);
                halfEdgeMesh._cache[cacheKey].time = Date.now();
            }
        } else {
            halfEdgeMesh._cache[cacheKey] = buildMeshFromHalfEdges(halfEdgeMesh);
            halfEdgeMesh._cache[cacheKey].time = Date.now();
        }
        return halfEdgeMesh._cache[cacheKey];
    }

    function buildMeshFromHalfEdges (halfEdgeMesh) {
        var buffers = {};

        var vertices = [], normals = [];
        halfEdgeMesh.faces.forEach(function (face) {
            var faceNormal = face.computeNormal();
            face.getVerticesTriangulated().forEach(function (triangles) {
                triangles.forEach(function (triangle) {
                    vertices.push(triangle[0], triangle[1], triangle[2]);
                    normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
                });
            });
        });

        buffers.vertices = new Float32Array(vertices);
        buffers.normals = new Float32Array(normals);
        return GL.Mesh.load(buffers);
    }
})());
