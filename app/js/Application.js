'use strict';

class Application {
    init() {
        this.preset = 'Hilbert3D';
        this.createPresets();
        this.changeByPreset = this.changeByPreset.bind(this);
        this.changeByPreset();
        this.initGui();
        this.materialLine = new THREE.LineBasicMaterial({ color: 'red' });//, linewidth:1 });
        this.materialMesh = new THREE.MeshStandardMaterial({ color: 'red', side: THREE.DoubleSide });

        this.applyGuiChanges();
    }

    applyGuiChanges() {
        this.sceneManager.scene.remove(this.mesh);
        var t = new Turtle(this.angle, this.distance, this.width, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
        var rules = [this.rule1, this.rule2, this.rule3, this.rule4, this.rule5];
        rules = rules.filter((r) => r && r.length > 0);
        t.rule(this.axiom, rules);
        var vertices = t.go(this.iterations);
        if (this.width === 0) {
            this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.materialLine);
            this.mesh.geometry.vertices = vertices;
            // this.materialLine.linewidth = this.width;
        } else {
            this.mesh = new THREE.Mesh(new THREE.Geometry(), this.materialMesh);
            let sp = new THREE.SphereGeometry(this.width);
            // for (var i = 0; i < vertices.length; ++i) {
            //     this.mesh.geometry.merge(sp, new THREE.Matrix4().makeTranslation(vertices[i].x, vertices[i].y, vertices[i].z), 0);
            // }
            // for (var i = 0; i < vertices.length; i += 2) {
            //     let path = new THREE.CurvePath();
            //     path.curves.push(new THREE.LineCurve3(vertices[i], vertices[i + 1]));
            //     let tube = new THREE.TubeGeometry(path, 10, this.width, 6, false);
            //     this.mesh.geometry.merge(tube);
            // }

            var vertgroups = [];
            var curr = [];
            for (var i = 0; i < vertices.length; i += 2) {
                if (curr.length == 0 || curr[curr.length - 1].distanceTo(vertices[i]) > 1e-6) {
                    if (curr.length > 0) {
                        vertgroups.push(curr);
                    }
                    curr.push(vertices[i]);
                }
                curr.push(vertices[i + 1]);
            }
            if (curr.length > 0) {
                vertgroups.push(curr);
            }

            for (var i = 0; i < vertgroups.length; ++i) {
                var curve = new THREE.CatmullRomCurve3(vertgroups[i]);
                let tube = new THREE.TubeGeometry(curve, vertgroups[i].length * 6, this.width, 6, false);
                this.mesh.geometry.merge(tube);
            }

            // for (var i = 0; i < vertices.length; i += 2) {
            //     if (vertgroups.length > 0 && vertgroups[vertgroups.length - 1])
            //         vertgroups.push([vertices[i], vertices[i + 1]]);
            //     if (v.length > 0 && v[v.length - 1].manhattanDistanceTo(vertices[i]) < 1e-6) {
            //         v.push(vertices[i + 1]);
            //     } else {
            //         this.mesh.geometry.merge(tube);

            //     }
            //     // let path = new THREE.CurvePath();
            //     // path.curves.push(new THREE.LineCurve3(vertices[i], vertices[i + 1]));
            //     let tube = new THREE.TubeGeometry(new THREE.LineCurve3(vertices[i], vertices[i + 1]), 2, this.width, 6, false);
            //     this.mesh.geometry.merge(tube);
            // }
            // t.createSequances(this.iterations).forEach(s => {
            //     let path = new THREE.CurvePath();
            //     for (let i = 1; i < s.length; ++i) {
            //         path.curves.push(new THREE.LineCurve3(s[i - 1], s[i]));
            //     }
            //     let tube = new THREE.TubeGeometry(path, s.length * 4, this.width, 6, true);
            //     this.mesh.geometry.merge(tube);
            // });
        }
        this.mesh.geometry.computeBoundingBox();
        this.mesh.position.set(-this.mesh.geometry.boundingBox.getCenter().x, -this.mesh.geometry.boundingBox.getCenter().y, 0);

        this.sceneManager.scene.add(this.mesh);
    }

    changeByPreset() {
        this.presets.forEach((p) => {
            if (p.preset == this.preset) {
                _.extend(this, p);
            }
        });
        if (this.gui) {
            this.gui.__controllers.forEach((c) => c.updateDisplay())
            this.applyGuiChanges();
        };
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.gui.add(this, 'preset', this.presets.map(p => p.preset)).onChange(this.changeByPreset);
        this.gui.add(this, 'angle').step(0.001).min(0).max(360).onChange(this.applyGuiChanges);
        this.gui.add(this, 'distance').step(0.001).min(0.01).max(100).onChange(this.applyGuiChanges);
        this.gui.add(this, 'width').step(0.001).min(0).max(5).onChange(this.applyGuiChanges);
        this.gui.add(this, 'iterations').step(1).min(0).max(20).onChange(this.applyGuiChanges);
        this.gui.add(this, 'axiom').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule1').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule2').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule3').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule4').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule5').onChange(this.applyGuiChanges);
    }

    createPresets() {
        this.presets = [
            { preset: 'Hilbert3D', angle: 90, distance: 0.6, width: 0.1, iterations: 4, axiom: 'X', rule1: 'X=^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->', rule2: '', rule3: '', rule4: '', rule5: '' },
            { preset: 'Seaweed', angle: 22, distance: 0.3, width: 0.1, iterations: 4, axiom: 'G', rule1: 'G=GFGF-[&GF^GF^GF]+[^GF&GF&GF]>[^f^f&f]', rule2: '', rule3: '', rule4: '', rule5: '' },
            { preset: 'Pythagoras tree', angle: 45, distance: 0.1, width: 0.1, iterations: 6, axiom: '0', rule1: '0=1F[+0F]-0F', rule2: '1=1F1F', rule3: '', rule4: '', rule5: '' },
            { preset: 'Pythagoras tree twisted', angle: 45, distance: 0.1, width: 0.1, iterations: 6, axiom: '0', rule1: '0=1F[+0F]-0F', rule2: '1=1F<1F', rule3: '', rule4: '', rule5: '' },
            { preset: 'Pythagoras tree variant', angle: 45, distance: 1, width: 0.1, iterations: 6, axiom: '0', rule1: '0=1F[+0F]-0F', rule2: '1=1F^1F', rule3: '', rule4: '', rule5: '' },
            { preset: 'Fractal plant', angle: 25, distance: 0.1, width: 0.1, iterations: 5, axiom: 'YX', rule1: 'Y=YF<(45)YF-[-YF+YF]+[+YF-YF]', rule2: 'X=YfYf+[+YF]+[-YF]', rule3: '', rule4: '', rule5: '' },
            { preset: 'Dragon curve', angle: 90, distance: 0.1, width: 0.1, iterations: 10, axiom: 'YX', rule1: 'X=XF+YF', rule2: 'Y=FX-YF', rule3: '', rule4: '', rule5: '' },
            { preset: 'Sierpinski triangle', angle: 60, distance: 0.1, width: 0.1, iterations: 6, axiom: '^(90)A', rule1: 'A=BF-AF-BF', rule2: 'B=AF+BF+AF', rule3: '', rule4: '', rule5: '' },
        ];
    }
}
