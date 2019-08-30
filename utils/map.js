var initMap = function ({
    geo, dom, svg, click, attackCallBack
}) {
    //生成地图
    var _this = this;
    var scene, camera, controls, renderer;
    var transformControl, stats;
    var currData = [];
    var width, height;
    this.currDom = dom;
    this.currCanvas = null;
    this.projection;
    var options = Object.assign({}, {
        parentDom: null,
        canvas: null,
    })
    var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    var groups = [];
    var svgShape = [];
    var currMesh = null;
    var interVal = null;
    var timeInter = null;
    _this.cityLevel = 1;//当前层级
    currData = geo;
    var cameraOption = {/*  */
        position: {
            x: 43.786566325818086,
            y: 565.2054879766487,
            z: 445.8435990083539
        },
        ratatoion: {
            _x: -1.0251899019611612,
            _y: -0.00461846672445632,
            _z: -0.007607546501251655
        }
    }
    var typeAttack = ['2-1-1', '2-2-4', '2-2-5', '2-3-1', '2-3-2']
    var controls = {
        run: true, //是否运行
        enableDamping: true, //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        dampingFactor: true, //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        enableZoom: true, ////是否可以缩放
        minDistance: 300, //设置相机距离原点的最远距离
        maxDistance: 1000, //设置相机距离原点的最远距离
        enablePan: true, ////是否开启右键拖拽
        enableRotate: true,
        autoRotate: false, //自动旋转
        autoRotateSpeed: 1,
        enabled: true,
    }
    var renderer = {
        background: 0x000000, //color
        alpha: true, //Boolean
        antialias: true, //Boolean
    }
    var sceneOptions = {
        tags: {
            fontColor: "RGBA(200,223,249,.9)",
            fontSize: 1.8,
        },
        sceneStyle: {
            blockColor: "rgb(27,46,94)",
            blockHeight: 1,

            borderColor: "rgb(53,110,195)",
            borderWidth: 2,
        },
        texture: {
        },
        outerGlow: {
            glowColor: "rgba(22,71,121,.9)",
            size: 1,
            perTime: 2,
        }
    }
    var _Shaders = {
        SplineVShader: [
            "uniform vec3 u_color; uniform float u_opacity; uniform float u_width;",
            "attribute float cRatio; attribute vec3 cPosition; varying vec4 vColor; ",
            " varying vec2 vUv; void main() { ",
            "vec3 nPosition = position; float k = 20.0;",
            "if ( cRatio>.0 && cRatio<.5 ) { nPosition.y = u_width; } ",
            "if ( cRatio>.5 && cRatio<1.5 ) { nPosition = cPosition*u_width+position; } ",
            // 2
            "if ( cRatio>1.5 && cRatio<2.5 ) { nPosition = -cPosition*u_width/2.0+position; } ",
            "if ( cRatio>-2.5 && cRatio<-1.5 ) { nPosition = cPosition*u_width/2.0+position; } ",
            // 3
            "if ( cRatio>2.5 && cRatio<3.5 ) { ",
            "nPosition = -cPosition*k+position; nPosition.y = u_width/2.0; } ",
            "if ( cRatio>-3.5 && cRatio<-2.5 ) { ",
            "nPosition = cPosition*k+position; nPosition.y = -u_width/2.0; } ",
            // 4
            "if ( cRatio>3.5 && cRatio<4.5 ) { ",
            "nPosition = -cPosition*k+position; nPosition.y = -u_width/2.0; } ",
            "if ( cRatio>-4.5 && cRatio<-3.5 ) { ",
            "nPosition = cPosition*k+position; nPosition.y = u_width/2.0; } ",

            "vColor = vec4( u_color, u_opacity ); vUv = uv;",
            "vec4 mP = modelViewMatrix * vec4( nPosition, 1.0 ); ",
            "gl_Position = projectionMatrix * mP; } "
        ].join("\n"),
        SpreadVShader: [
            'uniform vec3 u_color; uniform float u_opacity; uniform float u_time; ',
            'attribute float cRatio; attribute vec3 position2; varying vec4 vColor; ',
            'varying vec2 vUv; void main() {',
            'float _k = cRatio + u_time; ',
            'if ( _k >= 1.0 ) _k -= 1.0; ',
            'vec3 vPos = mix( position, position2, _k );',
            'vColor = vec4( u_color, u_opacity*5.0*(1.0-_k) ); vUv = uv;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );',
            '}'
        ].join("\n"),
        SplineFShader: [
            "varying vec4 vColor; void main() {  gl_FragColor = vColor; } ",
        ].join("\n"),

    };
    this.init = function () {
        width = _this.currDom.clientWidth;
        height = _this.currDom.clientHeight;
        _this.currCanvas = document.createElement("canvas");
        _this.currCanvas.width = width;
        _this.currCanvas.height = height;
        _this.currDom.appendChild(_this.currCanvas);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: _this.currCanvas
        });
        // renderer.setClearColor(renderer.background, 1.0);
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setClearAlpha(0.5);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMapEnabled = true;
        renderer.gammaInput = true;
        renderer.gammaOutput = true
        //scene
        scene = new THREE.Scene();
        //camera
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 100000);
        camera.position.set(...Object.values(cameraOption.position));
        camera.rotation.set(...Object.values(cameraOption.ratatoion));
        camera.lookAt(scene.position);
        scene.add(camera);

    }
    this.initGeo = function () {
        var geometry = new THREE.BoxBufferGeometry(111, 111, 111);
        var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }

    this.controlsEvent = function ({
        autoRotate,
        autoRotateSpeed,
        dampingFactor,
        enableDamping,
        enabled,
        enablePan,
        enableRotate,
        enableZoom,
        maxDistance,
        minDistance
    }) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enabled = enabled;
        controls.enableDamping = enableDamping;
        //动态阻尼系数 就是鼠标拖拽旋转灵敏度
        controls.dampingFactor = dampingFactor;
        //是否可以缩放
        controls.enableZoom = enableZoom;
        //是否自动旋转controls.autoRotate = true; 设置相机距离原点的最远距离
        controls.minDistance = minDistance;
        //设置相机距离原点的最远距离
        controls.maxDistance = maxDistance;
        //是否开启右键拖拽
        controls.enablePan = enablePan;
        controls.enableRotate = enableRotate;
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = autoRotateSpeed;

    }
    this.initLight = function (path) {
        var light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
        scene.add(light);
    }

    this.resize = function () {
        width = _this.currDom.clientWidth;
        height = _this.currDom.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    this.typesItems = [];
    this.updateTypes = function (items) {
        this.typesItems = items;
    }
    this.attckCity = function (opt) {
        //攻击 被攻击 当前地区被攻击
        //如果=攻击城市为空随机攻击城市
        var dst = cityPositions.filter(elem => elem.province == opt.dst)[0];
        var src;
        if (opt.src) {
            src = cityPositions.filter(elem => elem.province == opt.src)[0];
        } else {
            src = cityPositions[parseInt(cityPositions.length * Math.random())]
        }
        if (!src || !dst) {
            return false
        }
        var _dst = projection(dst.cp);
        var _src = projection(src.cp);
        //攻击展示


        let type = this.typesItems.filter(elem=>elem.name==opt.type);
        if (src.province != dst.province) {
            // 不相同 攻击线
            this.createAttack({
                src: [..._src, 0],
                dst: [..._dst, 0]
            }, type[0] ? type[0].grade:1);
            this.addAttackPlane([..._dst, -15], 1, 1000);
        } else {
            //闪点
            this.addAttackPlane([..._dst, -15], 1, 1000);
        }
        typeof attackCallBack === 'function' ? attackCallBack({ src: src, dst: dst, type: opt.type }) : null;
    }
    this.update = function (data) {
        //更新数据
        currData.features.forEach(function (elem) {
            data.forEach(function (d) {
                if (d.province.indexOf(elem.properties.name) !== -1) {
                    elem.properties.pid = d.id;
                    elem.properties.province = d.province;
                    elem.properties.stateDate = d.stateDate;
                    elem.properties.total = d.total;
                    //找到对比
                    shapeGroup.children.forEach(function (om) {
                        if (om.userData.name === elem.properties.name) {
                            om.userData.currValue = 0;
                            om.userData.value = d.total;
                            _this.updateVal(om)
                        }
                    })
                }
            })

        })
        //模拟攻击 
        var index = 0;
        if (interVal) clearInterval(interVal);
        if (timeInter) clearTimeout(timeInter);
        timeInter = setTimeout(() => {
            interVal = setInterval(() => {
                if (index >= cityPositions.length) {
                    index = 0;
                }
                //全国地图
                if (_this.cityLevel === 1) {
                    //攻击线
                    var dataFilter = cityPositions.filter(x => x.total != 0 && x.total && x.total * Math.random() > 0.9);
                    var dstNode = dataFilter[~~(dataFilter.length * Math.random())];
                    var srcNode = cityPositions[~~(Math.random() * cityPositions.length)]
                    if (!dstNode || !srcNode) {
                        return false
                    }
                    // var dst = projection(dstNode.cp);
                    // var src = projection(srcNode.cp);
                    // //攻击展示
                    // _this.addAttackPlane([...dst, -15], 1, 1000);
                    // _this.createAttack({
                    //     src: [...src, 0],
                    //     dst: [...dst, 0]
                    // }, 1);
                    //攻击图标
                    /* var t = typeAttack[index % (typeAttack.length - 1)];
                    _this.initTipes({ width: 128, height: 128, type: t, properties: dstNode }, function (mesh) {
                        var tipsTween = new TWEEN.Tween(mesh.position).to({ z: -80 }, 2000);
                        tipsTween.start();
                        tipsTween.onComplete(function () {
                            _this.dispose(mesh);
                        })
                    }) */
                    // 

                }
                index++
            }, 300);
        }, 1000)
    }
    var optionsE = {
        depth: 20,
        bevelThickness: 0,
        bevelSize: 0,
        bevelEnabled: true,
        bevelSegments: 0,
        curveSegments: 3,
        steps: 1,
    };
    var svgGroups = new THREE.Group();
    var cityPositions = [];
    svgGroups.rotation.x = Math.PI / 2;
    svgGroups.position.y = 70;
    svgGroups.position.x = 0;
    svgGroups.position.z = -90;
    function reverse(c) { if (!THREE.ShapeUtils.isClockWise(c)) c = c.reverse(); }
    function getBevelVec(inPt, inPrev, inNext) {
        var v_trans_x, v_trans_y, shrink_by = 1;
        var v_prev_x = inPt.x - inPrev.x, v_prev_y = inPt.y - inPrev.y,
            v_next_x = inNext.x - inPt.x, v_next_y = inNext.y - inPt.y,
            v_prev_lensq = (v_prev_x * v_prev_x + v_prev_y * v_prev_y),
            collinear0 = (v_prev_x * v_next_y - v_prev_y * v_next_x);
        if (Math.abs(collinear0) > Number.EPSILON) {
            var v_prev_len = Math.sqrt(v_prev_lensq);
            var v_next_len = Math.sqrt(v_next_x * v_next_x + v_next_y * v_next_y);
            var ptPrevShift_x = (inPrev.x - v_prev_y / v_prev_len),
                ptPrevShift_y = (inPrev.y + v_prev_x / v_prev_len),
                ptNextShift_x = (inNext.x - v_next_y / v_next_len),
                ptNextShift_y = (inNext.y + v_next_x / v_next_len);
            var sf = ((ptNextShift_x - ptPrevShift_x) * v_next_y -
                (ptNextShift_y - ptPrevShift_y) * v_next_x) / (v_prev_x * v_next_y - v_prev_y * v_next_x);
            v_trans_x = (ptPrevShift_x + v_prev_x * sf - inPt.x);
            v_trans_y = (ptPrevShift_y + v_prev_y * sf - inPt.y);

            var v_trans_lensq = (v_trans_x * v_trans_x + v_trans_y * v_trans_y);

            if (v_trans_lensq <= 2) {
                return new THREE.Vector2(v_trans_x, v_trans_y);
            } else { shrink_by = Math.sqrt(v_trans_lensq / 2); }

        } else {

            var direction_eq = false;
            if (v_prev_x > Number.EPSILON) {
                if (v_next_x > Number.EPSILON) direction_eq = true;
            } else {
                if (v_prev_x < - Number.EPSILON) {
                    if (v_next_x < - Number.EPSILON) direction_eq = true;
                } else {
                    if (Math.sign(v_prev_y) === Math.sign(v_next_y)) direction_eq = true;
                }
            }

            if (direction_eq) {
                v_trans_x = - v_prev_y;
                v_trans_y = v_prev_x;
                shrink_by = Math.sqrt(v_prev_lensq);
            } else {
                v_trans_x = v_prev_x;
                v_trans_y = v_prev_y;
                shrink_by = Math.sqrt(v_prev_lensq / 2);
            }
        }

        return new THREE.Vector2(v_trans_x / shrink_by, v_trans_y / shrink_by);
    }
    var creatSplineGeo = function (contour, opts) {
        opts = opts || {};
        contour = contour || [];
        var type = opts.type || 0,
            u1 = (undefined != opts.uRatio) ? opts.uRatio : .4,
            v1 = (undefined != opts.vRatio) ? opts.vRatio : 1;
        var bgeo = new THREE.BufferGeometry();
        reverse(contour);

        var il = contour.length, bevelVecs = [],
            r1 = -.1, r2 = .1, v2 = 1 - v1, u2 = 1 - 2 * u1;

        if (type > 0.5) {
            for (var i = 0, j = il - 2, k = i + 1; i < il; i++ , j++ , k++) {
                if (j === il) j = 0;
                if (k === il) k = 0;
                bevelVecs[i] = getBevelVec(contour[i], contour[j], contour[k]);
            }
            r1 = -type; r2 = type;
        }

        var indices = [], uvs = [], ratios = [],
            positions = [], positions2 = [];

        for (var i = 0; i < il; i++) {
            var ci = contour[i], bv = bevelVecs[i] || new THREE.Vector2();
            bv = bv.clone();

            uvs.push(u1 + u2 * i / il, v1, u1 + u2 * i / il, v2);
            positions.push(ci.x, ci.y, 0, ci.x, ci.y, 0);
            positions2.push(bv.x, 0, bv.y, bv.x, 0, bv.y);

            ratios.push(r1, r2);

            if (i < il - 1) {
                var a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
                indices.push(a, b, c, b, d, c);
            }
        }
        indices.push(il * 2 - 2, il * 2 - 1, 0, il * 2 - 1, 1, 0);

        bgeo.setIndex(indices);
        bgeo.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        bgeo.addAttribute('cRatio', new THREE.Float32BufferAttribute(ratios, 1));
        bgeo.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        bgeo.addAttribute('cPosition', new THREE.Float32BufferAttribute(positions2, 3));
        return bgeo;
    }
    function initSvg(path, properties) {
        //生成地图
        var draw_s = drawShape();
        var shapeGeo = new THREE.ExtrudeGeometry(draw_s, optionsE)
        shapeGeo.applyMatrix(new THREE.Matrix4().makeTranslation(-width / 2, -height / 2, 0));
        var material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(sceneOptions.sceneStyle.blockColor),
            flatShading: THREE.FlatShading,
            // transparent: true,
            // blending: THREE.AdditiveBlending,
            opacity: 0.7
        });
        var shape = new THREE.Mesh(shapeGeo, material);
        shape.receiveShadow = true;
        function drawShape() {
            var svgString = path
            var shape = transformSVGPathExposed(svgString);
            // 返回shape 
            return shape;
        }
        // shape.position.z -= 1000

        shapeGroup.add(shape);
        svgShape.push(shape)
        shape.userData = {
            type: "path",
            ...properties,
            currValue: 0,
            value: 0
        }
        // 加载动画
        var pro = projection(properties.cp)
        shape.position.x = pro[0] * 6;
        shape.position.y = pro[1] * 6;
        shape.position.z = 0;
        var animat = new TWEEN.Tween(shape.position).to({ x: 0, y: 0, z: 0 }, 2000);
        animat.start()
        // 生成轮廓线条

        // 偏移
        var setCenter = {
            x: width / 2,
            y: height / 2
        }
        draw_s.forEach(elem => {
            var contour = elem.getPoints(6);
            var _lGeo = creatSplineGeo(contour, { type: 1 });
            var bufferGeo = new THREE.BufferGeometry();
            var positions = new Float32Array(contour.length * 3);
            var alphas = new Float32Array(contour.length);
            contour.forEach((x, i) => {
                positions[i * 3] = x.x;
                positions[i * 3 + 1] = x.y;
                positions[i * 3 + 2] = 0;
                alphas[i] = 0;
            })
            bufferGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            var line = new THREE.Mesh(_lGeo, initCoffet.Line1);
            line.position.y -= setCenter.y;
            line.position.x -= setCenter.x;
            line.position.z = -2;
            shape.add(line);
            var cloneLine = new THREE.Mesh(_lGeo, initCoffet.Line2);
            shape.add(cloneLine)
            cloneLine.position.x -= setCenter.x;
            cloneLine.position.y -= setCenter.y;
            cloneLine.position.z = optionsE.depth;
        })

        // 生成地区名字
        var cityNameCtx = addCityName({
            width: 512,
            height: 64,
            text: properties.name,
            color: "#ffffff"
        });
        var spriteMap = new THREE.Texture(cityNameCtx)
        spriteMap.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            transparent: true,
            depthWrite: false,
            opacity: 1
        });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(144, 18);
        switch (properties.name) {
            case "广东":
                sprite.position.set(pro[0], pro[1] - 25, -15)
                break;
            case "澳门":
                sprite.position.set(pro[0] - 10, pro[1], -15)
                break;
            case "香港":
                sprite.position.set(pro[0] + 10, pro[1], -15)
                break;
            default:
                sprite.position.set(pro[0], pro[1] - 10, -22)
        }

        shape.add(sprite);
    }
    this.addAttackPlane = function (position, type, time) {
        type = type || 1;
        time = time || 1000;
        var geometry = new THREE.PlaneBufferGeometry(10, 10, 10);
        var material = new THREE.MeshBasicMaterial({
            map: _this.addPlaneImg,
            transparent: true,
            side: THREE.AdditiveBlending,
            color: "#ff0000",
            depthWrite: false,
            opacity: 1
        });
        var plane = new THREE.Mesh(geometry, material);
        plane.position.set(...position);
        planeGroup.add(plane);
        var anmiat = new TWEEN.Tween(plane.scale).to({ x: 5, y: 5, z: 5 }, time);
        anmiat.start();
        anmiat.onUpdate(function () {
            plane.material.opacity = 1 / plane.scale.x + 0.5;
            plane.material.needsUpdate = true;
        })
        anmiat.onComplete(function () {
            _this.dispose(plane);
        })
    }
    this.createAttack = function (options,grade) {
        //创建攻击
        if (typeof options !== 'object') {
            return;
        }
        var src = options.src;
        var dst = options.dst;
        var curve = new THREE.CatmullRomCurve3(
            [
                new THREE.Vector3(src[0], src[1], src[2]),
                new THREE.Vector3((src[0] + dst[0]) / 2, (src[1] + dst[1]) / 2, -60),
                new THREE.Vector3(dst[0], dst[1], dst[2])
            ]
        );
        var texture = new THREE.TextureLoader().load("./image/line.png");
        var points = curve.getPoints(50);
        var c = grade == 3 ? new THREE.Color("#ff0000") : grade==2 ? new THREE.Color("rgb(255,229,94)") : new THREE.Color("#94ffab");
        var mesh_line = new MeshLineMaterial({
            color: c,
            opacity: 1,
            resolution: resolution,
            //    map: texture,
            //         useMap: 1.0, 
            sizeAttenuation: 1,
            lineWidth: 6,
            near: 1,
            far: 100000,
            depthTest: false,
            transparent: true,
            side: THREE.DoubleSide,
            //    blending: THREE.AdditiveBlending
        })
        var line = new MeshLine();
        var geometry = new THREE.Geometry();
        let lineNum = 20;
        for (let i = 0; i < lineNum; i++) {
            geometry.vertices.push(new THREE.Vector3(points[0].x, points[0].y, points[0].z));
        }
        line.setGeometry(geometry, function (p) { return 1 - Math.cos(p); });
        var mesh = new THREE.Mesh(line.geometry, mesh_line);
        lineGroup.add(mesh);
        var index = 0;
        var tm = setInterval(() => {
            if (index >= points.length * 2) {
                clearInterval(tm);
                _this.dispose(mesh);
                return
            }
            if (index < points.length) {
                var vec3 = points[index];
                line.advance(new THREE.Vector3(vec3.x, vec3.y, vec3.z));
            } else {
                var vec3 = points[points.length - 1];
                line.advance(new THREE.Vector3(vec3.x, vec3.y, vec3.z));
            }
            index++;
        }, 30)
    }
    var initCoffet = {
        Line1: new THREE.ShaderMaterial({
            uniforms: {
                u_color: { value: new THREE.Color(sceneOptions.sceneStyle.borderColor) },
                u_opacity: { value: 0.8 },
                u_width: { value: -2 },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: _Shaders.SplineVShader,
            fragmentShader: _Shaders.SplineFShader,
        }),
        Line2: new THREE.ShaderMaterial({
            uniforms: {
                u_color: { value: new THREE.Color(sceneOptions.sceneStyle.borderColor) },
                u_opacity: { value: 1 },
                u_width: { value: -1 },
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            // blending: THREE.AdditiveBlending,
            vertexShader: _Shaders.SplineVShader,
            fragmentShader: _Shaders.SplineFShader,
        }),
        createLine: function (_lGeo, op) {
            return
        },
        loadTeutr: new THREE.TextureLoader().load('./image/p3.png'),
        createAnimatePlane: function () {
            var g = new THREE.Group();
            var geometry = new THREE.PlaneBufferGeometry(5, 5, 5);
            for (var i = 0; i < 1; i++) {
                var material = new THREE.MeshBasicMaterial({
                    map: initCoffet.loadTeutr,
                    transparent: true,
                    side: THREE.AdditiveBlending,
                    color: "#ff0000",
                    depthWrite: false,
                    opacity: 1
                });
                var plane = new THREE.Mesh(geometry, material);
                plane.scale.set(i * 2.5 + 1, i * 2.5 + 1, i * 2.5 + 1);
                plane.userData = {
                    process: 1 - (i * 1 / 4),
                    show: false
                }
                g.add(plane);
            }
            // plane.rotation.x = -Math.PI / 2;
            return g;
        }
    }
    this.initCityNumber = function (properties, num) {
        //显示当前危险个数 
        var color = "#ffffff";
        if (num > 1000) {
            color = "#ff0000"
        } else if (num > 400) {
            color = "#ff4200"
        } else if (num > 0) {
            color = "#ff6f44"
        }
        var cityNumber = addCityName({
            width: 128,
            height: 64,
            text: num,
            color: color
        })
        var spriteMap = new THREE.Texture(cityNumber)
        spriteMap.needsUpdate = true;
        var cityNumberMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            transparent: true,
            // blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 1
        });
        var spriteNumber = new THREE.Sprite(cityNumberMaterial);
        spriteNumber.name = "cityNumber";
        var points = projection(properties.cp);
        var x = points[0], y = points[1] + 10;
        switch (properties.name) {
            case "广东":
                y -= 15;
                break;
            case "澳门":
                x -= 10;
                y += 9;
                break;
            case "香港":
                x += 10;
                y += 9;
                break;

        }
        spriteNumber.position.set(x, y, -22)
        spriteNumber.scale.set(40, 20, 20);
        return spriteNumber
    }
    // 根据值设置城市颜色
    this.setCityColor = function (city, val) {

    }
    // 根据值设置城市颜色
    this.setCityHeightTop = function (position, nextZ) {
        var animat = new TWEEN.Tween(position).to({ z: nextZ }, 200);
        animat.start()
    }
    this.initSvgBox = function () {
        var boxs = new THREE.Group();
        var box = new THREE.Box3().expandByObject(svgGroups);
        var bx = box.max.x - box.min.x,
            by = box.max.y - box.min.y,
            bz = box.max.z - box.min.z;
    }
    this.allGroupShow = function (state) {
        tipsSprites.visible = state;
        planeGroup.visible = state;
        lineGroup.visible = state;
    }
    this.createMap = function ({ geo }) {
        //先清空 
        currData = geo;
        this.allGroupShow(false)
        this.disposeScene();
        setTimeout(() => {
            this.initSvg(geo);
        }, 1000)
    }
    this.initSvg = function (geo = []) {
        _this.projection = d3.geoMercator().fitExtent([[0, 0], [width, height]], geo);
        // path
        var path = d3.geoPath().projection(_this.projection);
        // var svg = d3.select(document.createElement("svg"));
        d3.select("#svg").selectAll('svg').remove();
        var svg = d3.select("#svg").append("svg");
        var svgGroup = svg.append('g');
        svgGroup.selectAll("path")
            .data(geo.features)
            .enter()
            .append("path")
            .attr("d", (d, i) => {
                cityPositions.push(d.properties);
                var pathText = path(d);
                if (pathText.indexOf("e") != -1) {
                    // 出现js精算不够问题
                    pathText = pathText.replace("e", "");
                }
                initSvg(pathText, d.properties)
            })
            .attr("stroke", "#009CFF")
            .attr("stroke-width", 1)
            .attr("fill", function (d, i) {
                return "#fff0";
            })
        this.allGroupShow(true)
    }
    var tipsSprites = new THREE.Group();
    var planeGroup = new THREE.Group();
    var lineGroup = new THREE.Group();
    var shapeGroup = new THREE.Group();
    var tipsSpritesArr = [];
    var urlImg = ""
    function initTipesCanvas({ width = 256, height = 64, type, icon }, callback) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        var img = new Image();
        img.src = './image/' + type + '.png';
        img.onload = function () {
            context.drawImage(img, 0, 0, width, height);
            typeof callback === 'function' ? callback(canvas) : null;
            img = null;
        }
    }
    _this.initTipes = function ({ width = 256, height = 64, type, icon, properties }, callback) {
        initTipesCanvas({ width, height, type, icon }, function (canvas) {
            // 生成sprite
            // callback()
            var spriteMap = new THREE.Texture(canvas)
            spriteMap.needsUpdate = true;
            var cityNumberMaterial = new THREE.SpriteMaterial({
                map: spriteMap,
                transparent: true,
                // blending: THREE.AdditiveBlending,
                depthWrite: false,
                opacity: 1
            });
            var spriteNumber = new THREE.Sprite(cityNumberMaterial);
            tipsSprites.add(spriteNumber);
            tipsSpritesArr.push(spriteNumber);
            var position = projection(properties.cp)
            callback(spriteNumber);
            spriteNumber.scale.set(20, 20, 20)
            spriteNumber.position.set(position[0], position[1], 0);


        })
    }
    function projection(arr) {
        var pos = _this.projection(arr);
        pos = [pos[0] - width / 2, pos[1] - height / 2];
        return pos
    }
    function addCityName({ width = 256, height = 32, text = "", color = "#ffba47" }) {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        // context.fillStyle = "transparent";
        context.fillStyle = "rgba(0,0,0,0)";
        context.fillRect(0, 0, width, height);
        context.fill()
        context.closePath();
        context.font = 'bold 42px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = color;
        context.lineWidth = 20;
        context.fillText(text, width / 2, height / 2);
        return canvas;
    }
    function addCanvasMesh({
        width = 256,
        height = 256,
        img
    }) {
        //img 转换 canvas
        let canvas = document.createElement('canvas');
        //导入材质
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d");
        context.drawImage(img, 0, 0, width, height);
        return canvas
    }
    this.load = function () {
        this.init();
        this.initLight()
        this.controlsEvent(controls);
        this.addPlaneImg = new THREE.TextureLoader().load('./image/p3.png');
        scene.add(svgGroups)
        //attackPlane Group

        this.initSvg(geo);
        // this.initGeo();
        render();
        svgGroups.add(tipsSprites)
        svgGroups.add(planeGroup)
        svgGroups.add(lineGroup)
        svgGroups.add(shapeGroup)
        _this.currCanvas.addEventListener("dblclick", onMouseUp)
    }
    this.load();

    var colors = ['#ff6f5b', '#fa8737', '#fbab53', '#f79fd2', '#4bbdd6', '#9ce0d4', "#cddcd9"];
    _this.updateVal = function (child) {
        for (var i = child.children.length - 1; i >= 0; i--) {
            var elem = child.children[i]
            if (elem.name == "cityNumber") {
                _this.dispose(elem);
                child.remove(elem)
            }
        }
        child.userData.currValue = child.userData.value;
        var numberPoint = _this.initCityNumber(child.userData, child.userData.value);
        numberPoint.name = "cityNumber";
        child.add(numberPoint);

        var colorIndex = colors.length - 1;
        if (child.userData.value > 1200) {
            colorIndex = 0;
        } else if (child.userData.value > 900) {
            colorIndex = 1;
        } else if (child.userData.value > 600) {
            colorIndex = 2;
        } else if (child.userData.value > 300) {
            colorIndex = 3;
        } else if (child.userData.value > 100) {
            colorIndex = 4;
        } else if (child.userData.value > 0) {
            colorIndex = 5;
        } else if (child.userData.value == 0) {
            colorIndex = 6;
        }
        child.material.color.set(new THREE.Color(colors[colorIndex]))
        // _this.setCityColor(child, child.userData.value)
        // 根据值改变高度
        var pz = -child.userData.currValue / MaxNumber * 10;
        if (pz < -25) pz = -10;
        _this.setCityHeightTop(child.position, pz)
    }
    _this.disposeScene = function () {
        //清除所有的  
        _this.disposeGroup(tipsSprites)
        _this.disposeGroup(planeGroup)
        _this.disposeGroup(lineGroup)
        _this.disposeGroup(shapeGroup)

        /* svgGroups.children.traverse(function (child) {
            if (child.type === "Group") {
                _this.disposeMesh(child)
            }
        }) */
    }
    _this.disposeGroup = function (group) {
        //递归删除所有children
        for (var i = group.children.length - 1; i >= 0; i--) {
            _this.disposeMesh(group.children[i]);
        }
    }
    _this.dispose = function (mesh) {
        /* 删除模型 */
        _this.disposeMesh(mesh);
    }
    _this.disposeMesh = function (mesh) {
        var meshLen = mesh.children.length;
        if (meshLen.length > 0) {
            //递归删除所有children
            for (var i = meshLen.length - 1; i >= 0; i--) {
                _this.disposeMesh(mesh.children[i]);
            }
        }

        if (mesh.material) {
            mesh.material.dispose(); //删除材质
        }
        if (mesh.geometry) {
            mesh.geometry.dispose(); //删除几何体
        }
        mesh.parent && mesh.parent.remove(mesh);
    }
    function onMouseUp(event) {
        var canvas = _this.currCanvas;
        event.preventDefault();
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - canvas.getBoundingClientRect().left) / canvas.offsetWidth) * 2 - 1;
        mouse.y = -((event.clientY - canvas.getBoundingClientRect().top) / canvas.offsetHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(svgShape);
        if (intersects.length > 0) {
            var obj = intersects[0].object;
            var data = obj.userData;
            typeof click == 'function' ? click(data) : null;
        } else {
            click(false)
        }
    }
    var MaxNumber = 1000;//最大值

    function animatePlanes() {
        shapeGroup.children.forEach(child => {
            // 改变值 
            if (child.userData.currValue !== child.userData.value) {
                // _this.updateVal(child); 

            }
            child.children.forEach(elem => {
                if (elem.name === "animatePlane") {
                    elem.children.forEach(node => {
                        if (child.userData.value >= 100) {
                            node.userData.show = true
                        }
                        /* if (node.userData.show) {
                            node.visible = true;
                            node.userData.process += 0.01;
                            var process = node.userData.process;
                            node.material.opacity = 1 - node.userData.process + 0.4;
                            node.scale.set(process * 15, process * 15, process * 15);
                            if (process >= 1) {
                                node.userData.process = 0;
                                // node.userData.show = false;
                                node.userData.show = Math.random() > 0.9 ? true : false;
                            }
                        } else {
                            node.visible = false;
                        } */
                    })
                }
            })
        })
    }
    function render() {
        if (controls) controls.update();
        if (stats) stats.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
        if (TWEEN) TWEEN.update();
        animatePlanes()
    }

}