class Application {
    init() {
        this.angle = 90;
        this.distance = 4;
        this.width = 1;
        this.iterations = 4;
        this.axiom = 'X';
        this.rule1 = 'X=^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->';
        this.rule2 = '';
        this.rule3 = '';
        this.rule4 = '';
        this.rule5 = '';

        this.initGui();
        this.material = new THREE.LineBasicMaterial({ color: 'red' });

        this.applyGuiChanges();
    }

    applyGuiChanges() {
        this.sceneManager.scene.remove(this.mesh);
        var t = new Turtle(this.angle, this.distance, this.width, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0,0,1));
        var rules = [this.rule1, this.rule2, this.rule3, this.rule4, this.rule5];
        rules = rules.filter((r) => r && r.length > 0);
        t.rule(this.axiom, rules);
        var edges = t.createEdges(this.iterations);
        this.mesh = new THREE.LineSegments(new THREE.Geometry(), this.material);
        this.mesh.geometry.vertices = edges;

        // this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), this.material);
        // this.mesh.position.set(0, 0, 3);
        this.sceneManager.scene.add(this.mesh);
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.gui.add(this, 'angle').step(0.001).min(0).max(360).onChange(this.applyGuiChanges);
        this.gui.add(this, 'distance').step(0.001).min(0.01).max(100).onChange(this.applyGuiChanges);
        this.gui.add(this, 'width').step(0.001).min(0.001).max(50).onChange(this.applyGuiChanges);
        this.gui.add(this, 'iterations').step(1).min(0).max(20).onChange(this.applyGuiChanges);
        this.gui.add(this, 'axiom').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule1').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule2').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule3').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule4').onChange(this.applyGuiChanges);
        this.gui.add(this, 'rule5').onChange(this.applyGuiChanges);
    }
}
