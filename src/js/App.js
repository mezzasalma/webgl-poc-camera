import {
  DirectionalLight,
  sRGBEncoding,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  CameraHelper,
  Vector3,
  Raycaster,
  Vector2, Clock
} from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

//import FBXLoader from "three-fbx-loader";
export class App {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = null
    this.camera = null
    this.carCameras = []
    this.renderer = null

    this.clock = null

    this.dirLight = null
    this.dirLight2 = null
    this.shadowLight = null

    this.cameraBtn = null
    this.cameraOrder = [4, 3, 1, 0, 2]
    this.cameraIndex = 0

    console.log("New App created")
  }

  // Initialization
  init() {
    console.log("App init")
    this.scene = new Scene()
    this.raycaster = new Raycaster()
    this.pointer = new Vector2()

    this.clock = new Clock()

    this.loader = new FBXLoader()
    this.loader.load(
      'models/fbx/Voiture_Exterieur_CameraSetup_V00.fbx',
      (object) => {
        console.log(object)
        this.car = object
        object.updateMatrixWorld()
        object.traverse((child) => {
          //console.log(this.carCameras)
          //if(child.name.startsWith('Camera_')) {
          //  this.carCameras.push(child)
          //}
          if (child.isMesh) {
            // (child as THREE.Mesh).material = material
            if (child.material) {
              child.material.transparent = false
            }
          }
        })
        this.carCameras = object.children.filter(child => child.name.startsWith('Camera_'))
        //const cameraHelper1 = new CameraHelper(this.carCameras[3]);
        //this.scene.add(cameraHelper1)

        object.scale.set(.01, .01, .01)
        this.scene.add(object)

        this.scene.updateMatrixWorld()
        object.updateMatrixWorld()
      },
      (xhr) => {
        //console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.log(error)
      }
    )

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    })
    this.renderer.autoClear = false
    this.renderer.shadowMap.enabled = true

    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

    this.renderer.outputEncoding = sRGBEncoding;

    const gl = this.renderer.getContext()
    const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
    this.camera = new PerspectiveCamera(80, aspect, 0.01, 1000)
    this.camera.position.set(-3, 2, 5)
    this.camera.lookAt(0, 0, 0)
    this.cameraBtn = document.getElementById('camera-btn')

    this.createLights()
  }

  createLights() {
    this.dirLight = new DirectionalLight(0xffffff, 1)
    this.dirLight.position.set(-500, 300, 0)
    this.scene.add(this.dirLight)
    //this.helper = new DirectionalLightHelper(this.dirLight, 5, 0xff0000);
    //this.scene.add(this.helper);

    this.dirLight2 = new DirectionalLight(0xffffff, 1)
    this.dirLight2.position.set(0, 200, 0)
    this.scene.add(this.dirLight2)
    //this.helper2 = new DirectionalLightHelper(this.dirLight2, 5, 0xff0000);
    //this.scene.add(this.helper2);

    this.shadowLight = new DirectionalLight(0xd0d0d0, 1)
    this.shadowLight.position.set(-500, 300, 0)
    this.scene.add(this.shadowLight)

    this.shadowLight.castShadow = true
    this.shadowLight.shadow.mapSize.width = 2048
    this.shadowLight.shadow.mapSize.height = 2048

    const d = 50
    this.shadowLight.shadow.camera.left = -d
    this.shadowLight.shadow.camera.right = d
    this.shadowLight.shadow.camera.top = d
    this.shadowLight.shadow.camera.bottom = -d
    this.shadowLight.shadow.camera.near = 1
    this.shadowLight.shadow.camera.far = 50
    this.shadowLight.shadow.bias = 0.001
  }

  resizeRendererToDisplaySize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const needResize = this.canvas.width !== width || this.canvas.height !== height
    if (needResize) {
      this.renderer.setSize(width, height, false)
    }
    return needResize
  }

  render() {
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // calculate objects intersecting the picking ray
    this.intersects = this.raycaster.intersectObjects(this.scene.children);

    //console.log(intersects.filter(object => {
    //  object.name === "carosserie"
    //}))

    //for ( let i = 0; i < intersects.length; i ++ ) {
    //  intersects[ i ].object.material.color.set( 0xff0000 );
    //}

    this.renderer.render(this.scene, this.camera)
    //console.log(this.renderer.info)
  }

  animate() {
    this.delta = this.clock.getDelta(); // getDelta()
    window.requestAnimationFrame(this.animate.bind(this))
    if (this.carCameras.length > 0 && (this.cameraIndex < this.cameraOrder.length)) {
      const target = new Vector3();
      this.camera.position.lerp(this.carCameras[this.cameraOrder[this.cameraIndex]].getWorldPosition(target), 0.01);
      this.camera.lookAt(0, 0, 0)
    }

    // Update ...
    if (this.resizeRendererToDisplaySize()) {
      const gl = this.renderer.getContext()
      this.camera.aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
      this.camera.updateProjectionMatrix()
    }

    // Render ...
    this.render()
  }

  // Run app, load things, add listeners, ...
  run() {
    console.log("App run")

    this.cameraBtn.addEventListener('click', () => {
      this.cameraIndex >= this.cameraOrder.length ? this.cameraIndex = 0 : this.cameraIndex++
    })

    this.animate()
  }

  // Memory management
  destroy() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.carCameras = null

    this.clock = null

    this.raycaster = null
    this.pointer = null

    this.dirLight.dispose()
    this.dirLight2.dispose()
    this.shadowLight.dispose()
    this.dirLight = null
    this.dirLight2 = null
    this.shadowLight = null

    this.cameraBtn = null
    this.cameraOrder = null
    this.cameraIndex = null

    this.canvas = null
  }
}