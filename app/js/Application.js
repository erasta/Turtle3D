'use strict';

class Application {
    init() {
        this.angle = 90;
        this.distance = 0.6;
        this.width = 0;
        this.iterations = 4;
        this.axiom = 'X';
        this.rule1 = 'X=^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->';
        this.rule2 = '';
        this.rule3 = '';
        this.rule4 = '';
        this.rule5 = '';

        this.initGui();
        this.materialLine = new THREE.LineBasicMaterial({ color: 'red' });
        this.materialMesh = new THREE.MeshLambertMaterial({ color: 'red' });

        this.applyGuiChanges();
    }

    applyGuiChanges() {
        this.sceneManager.scene.remove(this.mesh);
        var t = new Turtle(this.angle, this.distance, this.width, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0,0,1));
        var rules = [this.rule1, this.rule2, this.rule3, this.rule4, this.rule5];
        rules = rules.filter((r) => r && r.length > 0);
        t.rule(this.axiom, rules);
        if (this.width === 0) {
            this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.materialLine);
            this.mesh.geometry.vertices = t.createEdges(this.iterations);
        } else {
            this.mesh = new THREE.Mesh(new THREE.Geometry(), this.materialMesh);
            t.createSequances(this.iterations).forEach(s => {
                let path = new THREE.CurvePath();
                for (let i = 1; i < s.length; ++i) {
                    path.curves.push(new THREE.LineCurve3(s[i-1], s[i]));
                }
                let tube = new THREE.TubeGeometry(path, s.length * 4, this.width, 6, false);
                this.mesh.geometry.merge(tube);
            });
        }
        this.mesh.geometry.computeBoundingBox();
        this.mesh.position.set(-this.mesh.geometry.boundingBox.getCenter().x, -this.mesh.geometry.boundingBox.getCenter().y, 0);

        this.sceneManager.scene.add(this.mesh);
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
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
}
