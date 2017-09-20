# Space Navigator Controls for WebGL

Connects "Space Navigator" 3D mouse by [3Dconnexion](https://www.3dconnexion.de/) to JavaScript via the [gamepad browser API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API). Based on the Three.js webGL library with support for A-Frame. Inspired and forked from the awesome [aframe-gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls) component by [Don McCurdy](https://github.com/donmccurdy).

Demos:
* [THREE.js](https://archilogic-com.github.io/aframe-space-navigator-controls/examples/three.html)
* [A-Frame Component](https://archilogic-com.github.io/aframe-space-navigator-controls/examples/a-frame.html)
* [A-Frame Inspector](https://archilogic-com.github.io/aframe-space-navigator-controls/examples/a-frame-inspector.html)

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
    
    var options = {
      rollEnabled: false,
      movementEnabled: true,
      lookEnabled: true,
      rollEnabled: true,
      invertPitch: false,
      fovEnabled: false,
      fovMin: 2,
      fovMax: 115,
      rotationSensitivity: 0.05,
      movementEasing: 3,
      movementAcceleration: 700,
      fovSensitivity: 0.01,
      fovEasing: 3,
      fovAcceleration: 5,
      invertScroll: false
    }

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