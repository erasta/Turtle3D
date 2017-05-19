class SceneManager {
    constructor(application) {
        THREE.Object3D.DefaultUp.set(0, 0, 1);

        // SCENE
        this.scene = new THREE.Scene();
        this.container = document.getElementById('ThreeJS');

        // RENDERER
        if (Detector.webgl) {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
        } else {
            this.renderer = new THREE.CanvasRenderer();
        }

        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setFaceCulling(0);

        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        // // Stats of FPS
        // stats = new Stats();
        // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        // document.body.appendChild(stats.domElement);

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, -30, 5);
        this.scene.add(this.camera);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        THREEx.WindowResize(this.renderer, this.camera);

        // Background clear color
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.clear();
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x222222));
        var grid = new THREE.GridHelper(50, 50);
        grid.rotation.x = Math.PI / 2;
        this.scene.add(grid);

        // Lights
        [
            [1, 1, 1],
            [-1, 1, 1],
            [1, -1, 1],
            [-1, -1, 1]
        ].forEach((pos) => {
            var dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
            dirLight.position.set(pos[0] * 100, pos[1] * 100, pos[2] * 100);
            this.scene.add(dirLight);
        });

        if (application) {
            this.application = application;
            this.application.sceneManager = this;
            this.application.init();
        }

        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        // stats.begin();
        this.renderer.render(this.scene, this.camera);
        // stats.end();
        requestAnimationFrame(this.animate);
    }

}
