// https://github.com/archilogic-com/aframe-space-navigator-controls
(function () {
	'use strict';

	/**
	 * Space Navigator Controls Component for A-Frame.
	 *
	 * Forked from:
	 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
	 *
	 */

	(function (AFRAME) {

	  var MAX_DELTA = 200, // ms
	      PI_2 = Math.PI / 2,
	      DEG_TO_RAD = 1 / 180 * Math.PI,
	      RAD_TO_DEG = 180 / Math.PI,
	      ROTATION_EPS = 0.000;

	  // component definition

	  var spaceNavigatorControls = {

	    /*******************************************************************
	     * Schema
	     */

	    schema: {
	      // Controller 0-3
	      controller:        { default: 0, oneOf: [0, 1, 2, 3] },

	      // Enable/disable features
	      enabled:           { default: true },
	      movementEnabled:   { default: true },
	      lookEnabled:       { default: true },
	      flyEnabled:        { default: true },
	      invertPitch:       { default: false },
	      rollEnabled:       { default: true },

	      // Constants
	      rotationSensitivity:  { default: 0.05 },
	      movementEasing:       { default: 3 },
	      movementAcceleration: { default: 700 },

	      // Debugging
	      debug:             { default: false }
	    },

	    /*******************************************************************
	     * Core
	     */

	    /**
	     * Called once when component is attached. Generally for initial setup.
	     */
	    init: function () {

	      var self = this;
	      this.movementVelocity = new THREE.Vector3(0, 0, 0);
	      this.movementDirection = new THREE.Vector3(0, 0, 0);
	      this.fovVelocity = 0;

	      // Rotation
	      this.pitch = new THREE.Object3D();
	      this.roll = new THREE.Object3D();
	      this.yaw = new THREE.Object3D();
	      this.yaw.position.y = 10;
	      this.yaw.add(this.pitch);

	      // Button state
	      this.buttons = {};

	      // scroll wheel
	      this.scroll = 0;
	      this.scrollDelta = 0;
	      // IE, Opera, Google Chrome, Safari
	      document.addEventListener('mousewheel', function(event){
	        event.preventDefault();
	        self.scroll -= event.wheelDelta / 60;
	      });
	      // Firefox
	      document.addEventListener('DOMMouseScroll', function(event){
	        event.preventDefault();
	        self.scroll += event.detail;
	      });

	      if (!this.getSpaceNavigator()) {
	        console.warn(
	          'Space Navigator not found. Connect and press any button to continue.',
	          this.data.controller
	        );
	      }
	    },

	    /**
	     * Called on each iteration of main render loop.
	     */
	    tick: function (t, dt) {
	      this.updateRotation(dt);
	      this.updatePosition(dt);
	      this.updateButtonState();
	      this.updateFov(dt);
	    },

	    /*******************************************************************
	     * Movement
	     */

	    updatePosition: function (dt) {
	      var data = this.data;
	      var acceleration = data.movementAcceleration;
	      var easing = data.movementEasing;
	      var velocity = this.movementVelocity;
	      var el = this.el;
	      var spaceNavigator = this.getSpaceNavigator();

	      // If data has changed or FPS is too low
	      // we reset the velocity
	      if (dt > MAX_DELTA) {
	        velocity.x = 0;
	        velocity.x = 0;
	        velocity.z = 0;
	        return
	      }

	      velocity.z -= velocity.z * easing * dt / 1000;
	      velocity.x -= velocity.x * easing * dt / 1000;
	      velocity.y -= velocity.y * easing * dt / 1000;

	      var position = el.getAttribute('position');

	      if (data.enabled && data.movementEnabled && spaceNavigator) {

	        /*
	         * 3dconnexion space mouse axes
	         *
	         * "right handed coordinate system"
	         * 0: - left / + right (pos: X axis pointing to the right)
	         * 1: - backwards / + forward (pos: Z axis pointing forwards)
	         * 2: - up / + down (pos: Y axis pointing down)
	         */

	        var xDelta = spaceNavigator.axes[0],
	            yDelta = spaceNavigator.axes[2],
	            zDelta = spaceNavigator.axes[1];

	        velocity.x += xDelta * acceleration * dt / 1000;
	        velocity.z += zDelta * acceleration * dt / 1000;
	        velocity.y -= yDelta * acceleration * dt / 1000;

	      }

	      var movementVector = this.getMovementVector(dt);

	      el.object3D.position.add(movementVector);

	      el.setAttribute('position', {
	        x: position.x + movementVector.x,
	        y: position.y + movementVector.y,
	        z: position.z + movementVector.z
	      });
	    },

	    getMovementVector: function (dt) {
	      if (this._getMovementVector) return this._getMovementVector(dt)

	      var euler = new THREE.Euler(0, 0, 0, 'YXZ'),
	          rotation = new THREE.Vector3(),
	          direction = this.movementDirection,
	          velocity = this.movementVelocity;

	      this._getMovementVector = function (dt) {
	        rotation.copy(this.el.getAttribute('rotation'));
	        direction.copy(velocity);
	        direction.multiplyScalar(dt / 1000);
	        if (!rotation) return direction
	        if (!this.data.flyEnabled) rotation.x = 0;
	        euler.set(rotation.x * DEG_TO_RAD, rotation.y * DEG_TO_RAD, rotation.z * DEG_TO_RAD );
	        direction.applyEuler(euler);
	        return direction
	      };

	      return this._getMovementVector(dt)
	    },

	    /*******************************************************************
	     * Rotation
	     */

	    updateRotation: function () {
	      if (this._updateRotation) return this._updateRotation();

	      var initialRotation = new THREE.Vector3(),
	          prevInitialRotation = new THREE.Vector3(),
	          prevFinalRotation = new THREE.Vector3();

	      var tCurrent,
	          tLastLocalActivity = 0,
	          tLastExternalActivity = 0;

	      var rotationEps = 0.0001,
	          debounce = 500;

	      this._updateRotation = function () {

	        var spaceNavigator = this.getSpaceNavigator();

	        if (!this.data.lookEnabled || !spaceNavigator) return;

	        tCurrent = Date.now();
	        initialRotation.copy(this.el.getAttribute('rotation') || initialRotation);

	        // If initial rotation for this frame is different from last frame, and
	        // doesn't match last spaceNavigator state, assume an external component is
	        // active on this element.
	        if (initialRotation.distanceToSquared(prevInitialRotation) > rotationEps
	            && initialRotation.distanceToSquared(prevFinalRotation) > rotationEps) {
	          prevInitialRotation.copy(initialRotation);
	          tLastExternalActivity = tCurrent;
	          return;
	        }

	        prevInitialRotation.copy(initialRotation);

	        // If external controls have been active in last 500ms, wait.
	        if (tCurrent - tLastExternalActivity < debounce) return

	        /*
	         * 3dconnexion space mouse axes
	         *
	         * "right handed coordinate system"
	         * 3: - pitch down / + pitch up (rot: X axis clock wise)
	         * 4: - roll right / + roll left (rot: Z axis clock wise)
	         * 5: - yaw right / + yaw left (rot: Y axis clock wise)
	         */

	        var look = new THREE.Vector3(spaceNavigator.axes[3], spaceNavigator.axes[5], spaceNavigator.axes[4]);

	        if (look.x < ROTATION_EPS && look.x > -ROTATION_EPS) look.z = 0;
	        if (look.y < ROTATION_EPS && look.y > -ROTATION_EPS) look.y = 0;
	        if (look.z < ROTATION_EPS && look.z > -ROTATION_EPS) look.x = 0;

	        if (this.data.invertPitch) look.x *= -look.x;

	        // If external controls have been active more recently than spaceNavigator,
	        // and spaceNavigator hasn't moved, don't overwrite the existing rotation.
	        if (tLastExternalActivity > tLastLocalActivity && !look.lengthSq()) return

	        look.multiplyScalar(this.data.rotationSensitivity);

	        this.pitch.rotation.x += look.x;
	        this.yaw.rotation.y -= look.y;
	        this.roll.rotation.z += look.z;

	        //this.pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitch.rotation.x))

	        this.el.setAttribute('rotation', {
	          x: this.pitch.rotation.x * RAD_TO_DEG,
	          y: this.yaw.rotation.y * RAD_TO_DEG,
	          z: this.data.rollEnabled ? this.roll.rotation.z * RAD_TO_DEG : 0
	        });

	        prevFinalRotation.copy(this.el.getAttribute('rotation'));
	        tLastLocalActivity = tCurrent;
	      };

	      return this._updateRotation();
	    },

	    updateFov: function (dt) {
	      if (this._updateFov) return this._updateFov(dt)

	      var previousScroll = 0;
	      var self = this;

	      this._updateFov = function (dt) {
	        var fov = self.el.getAttribute('fov');
	        if (fov) {
	          // easing
	          self.fovVelocity -= self.fovVelocity * 3 * dt / 6000;
	          // acceleration
	          var scrollDelta = previousScroll - self.scroll;
	          self.fovVelocity += scrollDelta * 10 * dt / 6000;
	          // applay foy
	          fov = Math.max(10, parseFloat(fov) + self.fovVelocity);
	          self.el.setAttribute('fov', fov);
	          previousScroll = self.scroll;
	        }
	      };

	      return this._updateFov(dt)
	    },

	    /*******************************************************************
	     * Button events
	     */

	    updateButtonState: function () {
	      var spaceNavigator = this.getSpaceNavigator();
	      if (this.data.enabled && spaceNavigator) {

	        // Fire DOM events for button state changes.
	        for (var i = 0; i < spaceNavigator.buttons.length; i++) {
	          if (spaceNavigator.buttons[i].pressed && !this.buttons[i]) {
	            this.emit(new ButtonEvent('navigatorbuttondown', i, spaceNavigator.buttons[i]));
	          } else if (!spaceNavigator.buttons[i].pressed && this.buttons[i]) {
	            this.emit(new ButtonEvent('navigatorbuttonup', i, spaceNavigator.buttons[i]));
	          }
	          this.buttons[i] = spaceNavigator.buttons[i].pressed;
	        }

	      } else if (Object.keys(this.buttons)) {
	        // Reset state if controls are disabled or controller is lost.
	        this.buttons = {};
	      }
	    },

	    emit: function (event) {
	      // Emit original event.
	      this.el.emit(event.type, event);

	      // Emit convenience event, identifying button index.
	      this.el.emit(
	        event.type + ':' + event.index,
	        new ButtonEvent(event.type, event.index, event)
	      );
	    },

	    /*******************************************************************
	     * SpaceNavigator state
	     */

	    /**
	     * Returns SpaceNavigator instance attached to the component. If connected,
	     * a proxy-controls component may provide access to spaceNavigator input from a
	     * remote device.
	     *
	     * @return {SpaceNavigator}
	     */
	    getSpaceNavigator: function () {
	      var proxyControls = this.el.sceneEl.components['proxy-controls'];

	      if (proxyControls) {
	        // use proxy space navigator
	        return proxyControls && proxyControls.isConnected() && proxyControls.getSpaceNavigator(this.data.controller)

	      } else {
	        // use local space navigator
	        return navigator.getGamepads && navigator.getGamepads()[this.data.controller]

	      }
	    },

	    /**
	     * Returns true if Space Navigator is currently connected to the system.
	     * @return {boolean}
	     */
	    isConnected: function () {
	      var spaceNavigator = this.getSpaceNavigator();
	      return !!(spaceNavigator && spaceNavigator.connected);
	    },

	    /**
	     * Returns a string containing some information about the controller. Result
	     * may vary across browsers, for a given controller.
	     * @return {string}
	     */
	    getID: function () {
	      return this.getSpaceNavigator().id;
	    }

	  };

	  // helpers

	  function ButtonEvent (type, index, details) {
	    this.type = type;
	    this.index = index;
	    this.pressed = details.pressed;
	    this.value = details.value;
	  }

	  // register component

	  if (!AFRAME) {
	    console.error('Component attempted to register before AFRAME was available.');
	    return
	  }
	  (AFRAME.aframeCore || AFRAME).registerComponent('space-navigator-controls', spaceNavigatorControls);

	})(window.AFRAME);

}());
//# sourceMappingURL=aframe-space-navigator-controls.js.map
