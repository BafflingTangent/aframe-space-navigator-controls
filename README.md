# Space Navigator Controls for WebGL

Connects "Space Navigator" 3D mouse by [3Dconnexion](https://www.3dconnexion.de/) to JavaScript via the [gamepad browser API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API). Based on the Three.js webGL library with support for A-Frame. Inspired and forked from the awesome [aframe-gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls) component by [Don McCurdy](https://github.com/donmccurdy).

Demos:
* [THREE.js]()
* [A-Frame Component]()
* [A-Frame Inspector]()

## Basic Usage

### THREE.js

````html
 <head>
    <!-- Load THREE.js lib -->
    <script src=""></script>
    <!-- Load Space Navigator code -->
    <script src="https://rawgit.com/archilogic-com/aframe-space-navigator-controls/master/dist/aframe-space-navigator-controls.js"></script>
 </head>
 <body>
  <script>
    
    var camera = new THREE.Camera(60, window.innerWidth / window.innerHeight, 1, 1000)
    
    var options = { rollEnabled: false }
    var controls = new THREE.SpaceNavigatorControls(options)
    
    // update on every frame frame
    function animate() {
        requestAnimationFrame(animate)
    
        // update space navigator
        controls.update()
        // update camera position
        camera.position.copy(controls.position)
        // update camera rotation
        camera.rotation.copy(controls.rotation)
        // when using mousewheel to control camera FOV
        camera.fov = controls.fov
        camera.updateProjectionMatrix()
    
        render()
      }
    
  </script> 
</body>
````

### A-Frame

````html
 <head>
    <!-- Load THREE.js lib -->
    <script src=""></script>
    <!-- Load SpaceNavigatorControls -->
    <script src="https://rawgit.com/archilogic-com/aframe-space-navigator-controls/master/dist/aframe-space-navigator-controls.js"></script>
 </head>
 <body>
 <a-scene>
 
  <a-entity io3d-data3d="url:https://storage.3d.io/535e624259ee6b0200000484/170907-0007-612jp5/archilogic_2017-09-07_00-07-10_3g2lXj.gz.data3d.buffer"></a-entity>
  
  <a-camera
    space-navigator-controls="
      controllerId: 0;
      movementEnabled: true;
      lookEnabled: true;
      rollEnabled: true;
      invertPitch: false;
      fovEnabled: false;
      fovMin: 2;
      fovMax: 115;
      rotationSensitivity: 0.05;
      movementEasing: 3;
      movementAcceleration: 700;
      fovSensitivity: 0.01;
      fovEasing: 3;
      fovAcceleration: 5;
      invertScroll: false;
    "
    fov="55"
  ></a-camera>
    
</a-scene>
</body>
````

## Options

Property          | Default | Description
------------------|---------|-------------
controller        | 0       | Which controller (0..3) the object should be attached to.
enabled           | true    | Enables all events on this controller.
movementEnabled   | true    | Enables movement via the left thumbstick.
lookEnabled       | true    | `true`, or `false`. Enables view rotation via the right thumbstick.
flyEnabled        | false   | Whether or not movement is restricted to the entity’s initial plane.
invertAxisY       | false   | Invert Y axis of view rotation thumbstick.
debug             | false   | When true, shows debugging info in the console.
