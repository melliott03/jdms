window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

angular.module('angular-points-path', []);

angular.module('angular-points-path')
  .controller('angularPointsPathController', function($scope, $timeout, $route) {
    var timer;

    var ctrl = this;
    ctrl.container = {};

    ctrl.data = ctrl.pointsData;
    // ctrl.data = $scope.data;
    console.log('$scope.data::', $scope.data);
    console.log('ctrl.pointsData ::', ctrl.pointsData);

    ctrl.waypoints = [];

    var t = 0;
    var tLine = 0;
    var tPoint = 0;
    var animationType = ctrl.animationType;

    // Animation speed
    var fps = ctrl.fps;
    // 10 is the default value
    if(!fps){
      fps = 10;
    }

    function animate() {
      if(!ctrl.animate){
        return;
      }
      setTimeout(function() {
        var vertices = ctrl.data;
        var waypoints = ctrl.waypoints;
        // Continues the animation 'til I have
        // lines to animate
        if (tLine < vertices.length) {
          // tLine must be > 0 because the array starts from 1
          // tPoint must be > 0 because I have to draw between the "i-1" and "i" points
          if (tLine > 0 && tPoint > 0) {
            var waypoint1 = waypoints[tLine][tPoint];
            var waypoint2 = waypoints[tLine][tPoint - 1];
            ctrl.context.beginPath();
            ctrl.context.moveTo(waypoint1.x, waypoint1.y);
            ctrl.context.lineTo(waypoint2.x, waypoint2.y);
            ctrl.context.strokeStyle = "red";
            ctrl.context.stroke();
          }
          tPoint++;

          // Checks the end conditions
          if (tLine <= 0 || tPoint >= waypoints[tLine].length) {
            /*
            First animation type:
            When the animation of one red line is done, a new black line
            is drawn to overwrite the animation points
             */
            if (tLine > 0 && animationType == 0) {
              ctrl.context.beginPath();
              var data1 = waypoints[tLine][0];
              var data2 = waypoints[tLine][waypoints[tLine].length - 1];
              ctrl.context.moveTo(data1.x, data1.y);
              ctrl.context.lineTo(data2.x, data2.y);
              ctrl.context.strokeStyle = "black";
              ctrl.context.stroke();
            }
            // Following line and reset point
            tLine++;
            tPoint = 0;
          }
        }
        requestAnimFrame(animate);
      }, 1000 / fps);
    }

    /**
     * Calculates the waypoints for the animation.
     * Every line (in order to be animated) must be divided
     * into single points to draw.
     *
     * @param  {array} vertices List of vertices of every line
     */
    ctrl.calcWaypoints = function(vertices) {
      var vertices = ctrl.data;
      for (var i = 1; i < vertices.length; i++) {
        ctrl.waypoints[i] = [];
        var pt0 = vertices[i - 1];
        var pt1 = vertices[i];
        var dx = pt1.x - pt0.x;
        var dy = pt1.y - pt0.y;
        for (var j = 0; j < 200; j++) {
          var x = pt0.x + dx * j / 200;
          var y = pt0.y + dy * j / 200;
          ctrl.waypoints[i].push({
            x: x,
            y: y
          });
        }
      }
    }


    /**
     * Draws a line between two points, passed as arguments
     *
     * @param  {First point}
     * @param  {Second point}
     * @return {void}
     */
    ctrl.drawLineOnCanvas = function(data1, data2) {
      //http://jsfiddle.net/m1erickson/7faRQ/
      ctrl.context.beginPath();
      ctrl.context.moveTo(data1.x, data1.y);
      ctrl.context.lineTo(data2.x, data2.y);
      ctrl.context.strokeStyle = "black";
      ctrl.context.stroke();
    }

    /**
     * Adds a point to data list and draw it
     * on canvas
     *
     * @param {Point data}
     */
    ctrl.addPoint = function(point) {
      var x = point.x;
      var y = point.y;
      var value = point.value;

      var id = 0;
      if (ctrl.data.length > 0) {
        id = ctrl.data[ctrl.data.length - 1].id + 1;
      }
      var p = {
        id: id,
        x: x,
        y: y,
        value: value
      };
      ctrl.data.push(p);
      x = '';
      y = '';
      value = '';
      drawData(ctrl.data);
    };

    /**
     * Remove a point from list and canvas
     *
     * @param  {Point to remove}
     * @return {void}
     */
    ctrl.removePoint = function(point) {
      console.log(point);
      for (var i = 0; i < ctrl.data.length; i++) {
        if (ctrl.data[i].id === point.id) {
          console.log("removing item at position: " + i);
          ctrl.data.splice(i, 1);
        }
      }

      ctrl.context.clearRect(0, 0, ctrl.canvas.width, ctrl.canvas.height);
      drawData(ctrl.data);
      console.log(ctrl.data);
    }

    /**
     * Draws a list of points and connect them with line
     *
     * @param  {List of points}
     * @return {void}
     */
    function drawData(data) {
      for (var i = 0; i < data.length; i++) {
        drawDotOnCanvas(data[i]);
        if (!ctrl.hidePath && i > 0) {
          // drawLineOnCanvas(data[i], data[i - 1]);
        }
      }
    }

    /**
     * Draws a dot with given data.
     * The argument data must be {x: xPos, y: yPos, value: radius}
     *
     * @param  {Point data for drawing}
     * @return {void}
     */
    function drawDotOnCanvas(data) {

      // $timeout(function () {
        console.log('in drawDotOnCanvas before $scope.$apply 1');
        // $scope.$apply(function() {
        ctrl.context.beginPath();
        ctrl.context.arc(data.x, data.y, data.value, 0, 2 * Math.PI, false);
        ctrl.context.fillStyle = "#ccddff";
        ctrl.context.fill();
        ctrl.context.lineWidth = 0;
        ctrl.context.strokeStyle = "#707070";
        ctrl.context.stroke();
        // });
      // }, 0);
    }

    /**
     * Draws a line between two points, passed as arguments
     *
     * @param  {First point}
     * @param  {Second point}
     * @return {void}
     */
    function drawLineOnCanvas(data1, data2) {
      //http://jsfiddle.net/m1erickson/7faRQ/
      ctrl.context.beginPath();
      ctrl.context.moveTo(data1.x, data1.y);
      ctrl.context.lineTo(data2.x, data2.y);
      ctrl.context.strokeStyle = "black";
      ctrl.context.stroke();
    }

    /**
     * Setup the canvas size.
     * It checks the parent element size for the
     * canvas size.
     * Whether width and height are in directive binding,
     * they override them.
     *
     * @return {void}
     */
    ctrl.setupSize = function() {
      ctrl.container = ctrl.canvas.parentElement.parentElement;

      // Set canvas style
      var width = "100%";
      var height = "100%";
      ctrl.canvas.width = width;
      ctrl.canvas.height = height;

      // Container size used for canvas
      if (ctrl.container.style.width && ctrl.container.style.height) {
        ctrl.canvas.width = ctrl.container.style.width.replace("px", "");
        ctrl.canvas.height = ctrl.container.style.height.replace("px", "");
      }
      // Set specific width and height if available
      if (ctrl.width && ctrl.height) {
        ctrl.canvas.width = ctrl.width;
        ctrl.canvas.height = ctrl.height;
      }
    }

    ctrl.init = function() {
      // If not available, the default value (point radius) is 10
      for (var i = 0; i < ctrl.data.length; i++) {
        var value = ctrl.data[i].value;
        if (!value) {
          value = 10;
        }
        ctrl.data[i].value = value;
      }

      // Collapse check
      if (ctrl.collapse) {

      }

      ctrl.context = ctrl.canvas.getContext('2d');
      ctrl.setupSize();

      ctrl.context.globalAlpha = 1.0;
      ctrl.context.beginPath();
      drawData(ctrl.data);

      // Check animation
      if (ctrl.animate) {
        // Calculare the waypoints for the animation
        ctrl.calcWaypoints();
        if (!animationType) {
          animationType = 0;
        }
        animate();
      }
    }

    $scope.$on('newData', function(event, args) {

      $timeout.cancel(timer);
      console.log("inside $scope.$on('newData') event::", event);
      console.log("inside $scope.$on('newData')  args::", args);

      var reLoadCanvas =  function(){
      ctrl.container = {};

      ctrl.data = args;
      ctrl.waypoints = [];

      var t = 0;
      var tLine = 0;
      var tPoint = 0;
      var animationType = ctrl.animationType;

      // Animation speed
      var fps = ctrl.fps;
      // 10 is the default value
      if(!fps){
        fps = 10;
      }

      function animate() {
        if(!ctrl.animate){
          return;
        }
        setTimeout(function() {
          var vertices = ctrl.data;
          var waypoints = ctrl.waypoints;
          // Continues the animation 'til I have
          // lines to animate
          if (tLine < vertices.length) {
            // tLine must be > 0 because the array starts from 1
            // tPoint must be > 0 because I have to draw between the "i-1" and "i" points
            if (tLine > 0 && tPoint > 0) {
              var waypoint1 = waypoints[tLine][tPoint];
              var waypoint2 = waypoints[tLine][tPoint - 1];
              ctrl.context.beginPath();
              ctrl.context.moveTo(waypoint1.x, waypoint1.y);
              ctrl.context.lineTo(waypoint2.x, waypoint2.y);
              ctrl.context.strokeStyle = "red";
              ctrl.context.stroke();
            }
            tPoint++;

            // Checks the end conditions
            if (tLine <= 0 || tPoint >= waypoints[tLine].length) {
              /*
              First animation type:
              When the animation of one red line is done, a new black line
              is drawn to overwrite the animation points
               */
              if (tLine > 0 && animationType == 0) {
                ctrl.context.beginPath();
                var data1 = waypoints[tLine][0];
                var data2 = waypoints[tLine][waypoints[tLine].length - 1];
                ctrl.context.moveTo(data1.x, data1.y);
                ctrl.context.lineTo(data2.x, data2.y);
                ctrl.context.strokeStyle = "black";
                ctrl.context.stroke();
              }
              // Following line and reset point
              tLine++;
              tPoint = 0;
            }
          }
          requestAnimFrame(animate);
        }, 1000 / fps);
      }

      /**
       * Calculates the waypoints for the animation.
       * Every line (in order to be animated) must be divided
       * into single points to draw.
       *
       * @param  {array} vertices List of vertices of every line
       */
      ctrl.calcWaypoints = function(vertices) {
        var vertices = ctrl.data;
        for (var i = 1; i < vertices.length; i++) {
          ctrl.waypoints[i] = [];
          var pt0 = vertices[i - 1];
          var pt1 = vertices[i];
          var dx = pt1.x - pt0.x;
          var dy = pt1.y - pt0.y;
          for (var j = 0; j < 200; j++) {
            var x = pt0.x + dx * j / 200;
            var y = pt0.y + dy * j / 200;
            ctrl.waypoints[i].push({
              x: x,
              y: y
            });
          }
        }
      }


      /**
       * Draws a line between two points, passed as arguments
       *
       * @param  {First point}
       * @param  {Second point}
       * @return {void}
       */
      ctrl.drawLineOnCanvas = function(data1, data2) {
        //http://jsfiddle.net/m1erickson/7faRQ/
        ctrl.context.beginPath();
        ctrl.context.moveTo(data1.x, data1.y);
        ctrl.context.lineTo(data2.x, data2.y);
        ctrl.context.strokeStyle = "black";
        ctrl.context.stroke();
      }

      /**
       * Adds a point to data list and draw it
       * on canvas
       *
       * @param {Point data}
       */
      ctrl.addPoint = function(point) {
        var x = point.x;
        var y = point.y;
        var value = point.value;

        var id = 0;
        if (ctrl.data.length > 0) {
          id = ctrl.data[ctrl.data.length - 1].id + 1;
        }
        var p = {
          id: id,
          x: x,
          y: y,
          value: value
        };
        ctrl.data.push(p);
        x = '';
        y = '';
        value = '';
        drawData(ctrl.data);
      };

      /**
       * Remove a point from list and canvas
       *
       * @param  {Point to remove}
       * @return {void}
       */
      ctrl.removePoint = function(point) {
        console.log(point);
        for (var i = 0; i < ctrl.data.length; i++) {
          if (ctrl.data[i].id === point.id) {
            console.log("removing item at position: " + i);
            ctrl.data.splice(i, 1);
          }
        }

        ctrl.context.clearRect(0, 0, ctrl.canvas.width, ctrl.canvas.height);
        drawData(ctrl.data);
        console.log(ctrl.data);
      }

      /**
       * Draws a list of points and connect them with line
       *
       * @param  {List of points}
       * @return {void}
       */
      function drawData(data) {
        for (var i = 0; i < data.length; i++) {
          drawDotOnCanvas(data[i]);
          if (!ctrl.hidePath && i > 0) {
            // drawLineOnCanvas(data[i], data[i - 1]);
          }
        }
      }

      /**
       * Draws a dot with given data.
       * The argument data must be {x: xPos, y: yPos, value: radius}
       *
       * @param  {Point data for drawing}
       * @return {void}
       */
       var alpha = 0,          /// current alpha
           delta = 0.1;        /// delta value = speed



      function drawDotOnCanvas(data) {


          console.log('in drawDotOnCanvas before $scope.$apply 2');

          var imageObj = new Image();
          imageObj.onload = function()
          {
              ctrl.context.save();
              ctrl.context.beginPath();
              ctrl.context.moveTo(188, 150);
              ctrl.context.quadraticCurveTo(288, 0, 388, 150);
              ctrl.context.lineWidth = 10;
              ctrl.context.quadraticCurveTo(288, 288, 188, 150);
              ctrl.context.lineWidth = 10;
              ctrl.context.clip();
              ctrl.context.drawImage(imageObj, 10, 50);
          };

          imageObj.src = 'http://www.html5canvastutorials.com/demos/assets/darth-vader.jpg';

          // /// create image
          // var img = new Image();
          // img.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDE2My42NDEgMTYzLjY0MSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYzLjY0MSAxNjMuNjQxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTExMy44OCwxMDMuMTAyYzEwLjU1Mi0xMS4xMTksMTcuMjc0LTI2LjgyNiwxNy4yNzQtNDEuODJjMC0yNy4yNDktMjIuMDc5LTQ5LjM0MS00OS4zMzctNDkuMzQxICAgIGMtMjcuMjQ5LDAtNDkuMzM0LDIyLjA4NS00OS4zMzQsNDkuMzQxYzAsNi43NCwxLjQxNiwxMy41OTcsMy44NzMsMjAuMTQzYzYuMDYyLDEzLjY1OCwxNy45NjMsMjQuMjY2LDMzLjAzNCwyOC4xMTkgICAgYzIuOTg3LTMuNjg5LDcuNDktNS45LDEyLjQyOC01LjljOC44NTYsMCwxNi4wNjYsNy4yMDQsMTYuMDY2LDE2LjA2M2MwLDguODYtNy4yMSwxNi4wNTgtMTYuMDY2LDE2LjA1OCAgICBjLTYuMzA2LDAtMTEuODgzLTMuNjc4LTE0LjQ5OS05LjE3Yy0xMi45NTUtMi44NTEtMjQuMzE3LTkuMzU0LTMzLjE0Ni0xOC4yOGMtMTkuNDM5LDguMzA2LTMyLjA0NywyMS41MzEtMzIuMDQ3LDM2LjQ2MiAgICBjMCwyNS4xNTQsMTU5LjM4OSwyNS4xNTQsMTU5LjM4OSwwQzE2MS41MTUsMTI2LjE0MywxNDEuOTIsMTEwLjE1MiwxMTMuODgsMTAzLjEwMnoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNNzEuNjQyLDEyMS42MzdjMC45MTEsNC44MDUsNS4xMTIsOC40MzksMTAuMTY5LDguNDM5YzUuNzMsMCwxMC4zNzMtNC42NDYsMTAuMzczLTEwLjM3cy00LjY0My0xMC4zNy0xMC4zNjYtMTAuMzcgICAgYy00LjQwMywwLTguMTM5LDIuNzUzLTkuNjQ2LDYuNjI1Yy0yNi4wNTktNC41ODQtNDUuOTMxLTI3LjMzNC00NS45MzEtNTQuNjg2YzAtMzAuNjQ3LDI0LjkzNi01NS41ODIsNTUuNTc2LTU1LjU4MiAgICBjMzAuNjU1LDAsNTUuNTg1LDI0LjkzNSw1NS41ODUsNTUuNTgyaDUuNjg3QzE0My4wODksMjcuNDkyLDExNS42MDMsMCw4MS44MTcsMGMtMzMuNzgzLDAtNjEuMjcsMjcuNDg2LTYxLjI3LDYxLjI3NSAgICBDMjAuNTQyLDkxLjU5Myw0Mi42OTcsMTE2Ljc2Niw3MS42NDIsMTIxLjYzN3oiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
          // // img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAhCAYAAABX5MJvAAABsklEQVRYR+2VvS8EURTFd3x0tBIFHZGtRBCJglCJkmwlYolGohGl/0IrGl/FVuIPWIlCotCxCdsQnUpESIj1O/JeMjvW7CwzLHkvOXmzd97ce/bec+/zUnWwvDrgkHIkbBVcJv5/Jkql0jL/cgi0g1nP827CujB2TUAgQ8A90ACeQS8kzn+axCQB90EjeDQkLhyJWDJBjcdwtAauqG2W31M8r4BO0AyuwZytO+/jLUfAoUS2BbIgKOgHbIMikgSJVpwXQVsFYb1ga/LZNyGxEDsJBcBpjm3aF+yV51WwAc5Ah3mXg0QmKRJLBFkH6nutHYLNGILH7BpKWgXs6aRITBDgAKjvpYtxgh0ZEifsA4bEJfbupEj41S4B9hHsffgQ8FdIlE3Av0JCmev59gUWVuNPMqELbNdoSG28DVrAPGTujX7Ktqq3qLkVrVOVo983Hf2aKGLv4vwwZw6Bf4aorUetoINEopCQ0zzQiL4DmoxWmAo2YpzmsWvES7DqJgna+n/ieZH3ysqHVZVEpY+i2CCS5pwG2S3BT8O+SYxEFKL2jCPhMlFzi9YisK+edcK0mXsD0DPjIuol1qsAAAAASUVORK5CYII=";
          // img.onLoad = function(){
          //   ctrl.context.drawImage(this, 0, 0);
          // }

          // ctrl.context.fillStyle = "#FFD700"; //#00ff00 limegreen, "#ccddff" baby blue;
          // ctrl.context.fillRect(40,60,20,20);

          var onsiteIcon = "data:image/png;base64,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";
          var phoneIcon = "data:image/png;base64,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";

          var img = new Image();
          // var coloredSvgXml = svgXml.replace(/#3080d0/g,'#e05030');
          // img.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDE2My42NDEgMTYzLjY0MSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYzLjY0MSAxNjMuNjQxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTExMy44OCwxMDMuMTAyYzEwLjU1Mi0xMS4xMTksMTcuMjc0LTI2LjgyNiwxNy4yNzQtNDEuODJjMC0yNy4yNDktMjIuMDc5LTQ5LjM0MS00OS4zMzctNDkuMzQxICAgIGMtMjcuMjQ5LDAtNDkuMzM0LDIyLjA4NS00OS4zMzQsNDkuMzQxYzAsNi43NCwxLjQxNiwxMy41OTcsMy44NzMsMjAuMTQzYzYuMDYyLDEzLjY1OCwxNy45NjMsMjQuMjY2LDMzLjAzNCwyOC4xMTkgICAgYzIuOTg3LTMuNjg5LDcuNDktNS45LDEyLjQyOC01LjljOC44NTYsMCwxNi4wNjYsNy4yMDQsMTYuMDY2LDE2LjA2M2MwLDguODYtNy4yMSwxNi4wNTgtMTYuMDY2LDE2LjA1OCAgICBjLTYuMzA2LDAtMTEuODgzLTMuNjc4LTE0LjQ5OS05LjE3Yy0xMi45NTUtMi44NTEtMjQuMzE3LTkuMzU0LTMzLjE0Ni0xOC4yOGMtMTkuNDM5LDguMzA2LTMyLjA0NywyMS41MzEtMzIuMDQ3LDM2LjQ2MiAgICBjMCwyNS4xNTQsMTU5LjM4OSwyNS4xNTQsMTU5LjM4OSwwQzE2MS41MTUsMTI2LjE0MywxNDEuOTIsMTEwLjE1MiwxMTMuODgsMTAzLjEwMnoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNNzEuNjQyLDEyMS42MzdjMC45MTEsNC44MDUsNS4xMTIsOC40MzksMTAuMTY5LDguNDM5YzUuNzMsMCwxMC4zNzMtNC42NDYsMTAuMzczLTEwLjM3cy00LjY0My0xMC4zNy0xMC4zNjYtMTAuMzcgICAgYy00LjQwMywwLTguMTM5LDIuNzUzLTkuNjQ2LDYuNjI1Yy0yNi4wNTktNC41ODQtNDUuOTMxLTI3LjMzNC00NS45MzEtNTQuNjg2YzAtMzAuNjQ3LDI0LjkzNi01NS41ODIsNTUuNTc2LTU1LjU4MiAgICBjMzAuNjU1LDAsNTUuNTg1LDI0LjkzNSw1NS41ODUsNTUuNTgyaDUuNjg3QzE0My4wODksMjcuNDkyLDExNS42MDMsMCw4MS44MTcsMGMtMzMuNzgzLDAtNjEuMjcsMjcuNDg2LTYxLjI3LDYxLjI3NSAgICBDMjAuNTQyLDkxLjU5Myw0Mi42OTcsMTE2Ljc2Niw3MS42NDIsMTIxLjYzN3oiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"
          img.src = phoneIcon;
          img.onload = function () {
             ctrl.context.drawImage(img,data.x,data.y);
          }


          // $scope.$apply(function() {
          // });

          /// increase alpha with delta value
        alpha += delta;

        //// if delta <=0 or >=1 then reverse
        if (alpha <= 0 || alpha >= 1) {
          ctrl.context.clip();
          ctrl.context.clearRect(data.x, data.y, data.value, 0);
          ctrl.context.restore();
          // ctrl.context.clearRect(0, 0, ctrl.canvas.width, ctrl.canvas.height);

          delta = -delta;
        }else {
          // ctrl.context.clearRect(0, 0, ctrl.canvas.width, ctrl.canvas.height);
          ctrl.context.strokeStyle = "#707070"; // #707070 light gray border
          ctrl.context.shadowBlur = 3;
          ctrl.context.shadowColor = "black";
        }




        /// set global alpha
        // ctrl.context.globalAlpha = alpha;

          ctrl.context.beginPath();
          ctrl.context.arc(data.x, data.y, data.value, 0, 2 * Math.PI, false);
          // ctrl.context.fill();
          ctrl.context.lineWidth = 0;
          ctrl.context.strokeStyle = "#707070";//#707070
          //
          // ctrl.context.fillStyle = "#00ff00"; //#00ff00 limegreen, "#ccddff" baby blue;
          // ctrl.context.shadowBlur = 5;
          // ctrl.context.shadowColor = "black";

          ctrl.context.stroke();

          // timer = $timeout(function () {
          //   drawDotOnCanvas(data);
          // }, 100);


      }

      /**
       * Draws a line between two points, passed as arguments
       *
       * @param  {First point}
       * @param  {Second point}
       * @return {void}
       */
      function drawLineOnCanvas(data1, data2) {
        //http://jsfiddle.net/m1erickson/7faRQ/
        ctrl.context.beginPath();
        ctrl.context.moveTo(data1.x, data1.y);
        ctrl.context.lineTo(data2.x, data2.y);
        ctrl.context.strokeStyle = "black";
        ctrl.context.stroke();
      }

      /**
       * Setup the canvas size.
       * It checks the parent element size for the
       * canvas size.
       * Whether width and height are in directive binding,
       * they override them.
       *
       * @return {void}
       */
      ctrl.setupSize = function() {
        ctrl.container = ctrl.canvas.parentElement.parentElement;

        // Set canvas style
        var width = "100%";
        var height = "100%";
        ctrl.canvas.width = width;
        ctrl.canvas.height = height;

        // Container size used for canvas
        if (ctrl.container.style.width && ctrl.container.style.height) {
          ctrl.canvas.width = ctrl.container.style.width.replace("px", "");
          ctrl.canvas.height = ctrl.container.style.height.replace("px", "");
        }
        // Set specific width and height if available
        if (ctrl.width && ctrl.height) {
          ctrl.canvas.width = ctrl.width;
          ctrl.canvas.height = ctrl.height;
        }
      }

      ctrl.init = function() {
        // If not available, the default value (point radius) is 10
        for (var i = 0; i < ctrl.data.length; i++) {
          var value = ctrl.data[i].value;
          if (!value) {
            value = 10;
          }
          ctrl.data[i].value = value;
        }

        // Collapse check
        if (ctrl.collapse) {

        }

        ctrl.context = ctrl.canvas.getContext('2d');
        ctrl.setupSize();

        ctrl.context.globalAlpha = 1.0;
        ctrl.context.beginPath();
        drawData(ctrl.data);

        // Check animation
        if (ctrl.animate) {
          // Calculare the waypoints for the animation
          ctrl.calcWaypoints();
          if (!animationType) {
            animationType = 0;
          }
          animate();
        }
      }


    };
    reLoadCanvas();

    });

  })
  .directive('angularPointsPath', function() {
    return {
      restrict: 'E',
      bindToController: {
        'pointsData': '=',
        'width': '=',
        'height': '=',
        'animationType': '=',
        'fps': '@',
      },
      link: function(scope, element, attrs, ctrl) {
        ctrl.canvas = element[0].firstChild;
        if (angular.isDefined(attrs.collapse)) {
          ctrl.collapse = true;
        }
        if (angular.isDefined(attrs.animate)) {
          ctrl.animate = true;
        }
        if (angular.isDefined(attrs.hidePath)) {
          ctrl.hidePath = true;
        }

        ctrl.init();
        scope.$on('newData', function(evnt, args) {
          console.log("inside scope.$on('newData') in directive, evnt::", evnt);
          console.log("inside scope.$on('newData') in directive, args::", args);

           //do stuff
           ctrl.init();
        });
      },
      template: '<canvas id="angular-points-path_canvas" style="border: 1px gray solid; float: left"></canvas>',
      controller: 'angularPointsPathController',
      controllerAs: 'angularPointsPathCtrl'
    };
  });
