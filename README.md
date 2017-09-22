# Space Navigator Controls for WebGL

Connects "Space Navigator" 3D mouse by [3Dconnexion](https://www.3dconnexion.de/) to JavaScript via [gamepad browser API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API). Based on <a href="https://threejs.org/">Three.js</a> webGL library with support for <a href="https://aframe.io/">A-Frame</a>. Inspired and forked from the awesome [aframe-gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls) component by [Don McCurdy](https://github.com/donmccurdy). Provided by [3d.io](https://3d.io)

Demos:
* [THREE.js](https://archilogic-com.github.io/aframe-space-navigator-controls/examples/three.html)
* [A-Frame Component](https://archilogic-com.github.io/aframe-space-navigator-controls/examples/aframe.html)
* [A-Frame Inspector](https://archilogic-com.github.io/aframe-space-navigator-controls/examples/aframe-inspector.html)

## Usage

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
    
    var camera = new THREE.Camera(60, window.innerWidth / window.innerHeight, 1, 1000)
    
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
 
  <a-camera space-navigator-controls="
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
  " fov="55"></a-camera>
  
  <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
  <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
  <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
  <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
  <a-sky color="#ECECEC"></a-sky>
    
</a-scene>
</body>
````
