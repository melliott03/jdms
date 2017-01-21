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

          // /// create image
          // var img = new Image();
          // img.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDE2My42NDEgMTYzLjY0MSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYzLjY0MSAxNjMuNjQxOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTExMy44OCwxMDMuMTAyYzEwLjU1Mi0xMS4xMTksMTcuMjc0LTI2LjgyNiwxNy4yNzQtNDEuODJjMC0yNy4yNDktMjIuMDc5LTQ5LjM0MS00OS4zMzctNDkuMzQxICAgIGMtMjcuMjQ5LDAtNDkuMzM0LDIyLjA4NS00OS4zMzQsNDkuMzQxYzAsNi43NCwxLjQxNiwxMy41OTcsMy44NzMsMjAuMTQzYzYuMDYyLDEzLjY1OCwxNy45NjMsMjQuMjY2LDMzLjAzNCwyOC4xMTkgICAgYzIuOTg3LTMuNjg5LDcuNDktNS45LDEyLjQyOC01LjljOC44NTYsMCwxNi4wNjYsNy4yMDQsMTYuMDY2LDE2LjA2M2MwLDguODYtNy4yMSwxNi4wNTgtMTYuMDY2LDE2LjA1OCAgICBjLTYuMzA2LDAtMTEuODgzLTMuNjc4LTE0LjQ5OS05LjE3Yy0xMi45NTUtMi44NTEtMjQuMzE3LTkuMzU0LTMzLjE0Ni0xOC4yOGMtMTkuNDM5LDguMzA2LTMyLjA0NywyMS41MzEtMzIuMDQ3LDM2LjQ2MiAgICBjMCwyNS4xNTQsMTU5LjM4OSwyNS4xNTQsMTU5LjM4OSwwQzE2MS41MTUsMTI2LjE0MywxNDEuOTIsMTEwLjE1MiwxMTMuODgsMTAzLjEwMnoiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNNzEuNjQyLDEyMS42MzdjMC45MTEsNC44MDUsNS4xMTIsOC40MzksMTAuMTY5LDguNDM5YzUuNzMsMCwxMC4zNzMtNC42NDYsMTAuMzczLTEwLjM3cy00LjY0My0xMC4zNy0xMC4zNjYtMTAuMzcgICAgYy00LjQwMywwLTguMTM5LDIuNzUzLTkuNjQ2LDYuNjI1Yy0yNi4wNTktNC41ODQtNDUuOTMxLTI3LjMzNC00NS45MzEtNTQuNjg2YzAtMzAuNjQ3LDI0LjkzNi01NS41ODIsNTUuNTc2LTU1LjU4MiAgICBjMzAuNjU1LDAsNTUuNTg1LDI0LjkzNSw1NS41ODUsNTUuNTgyaDUuNjg3QzE0My4wODksMjcuNDkyLDExNS42MDMsMCw4MS44MTcsMGMtMzMuNzgzLDAtNjEuMjcsMjcuNDg2LTYxLjI3LDYxLjI3NSAgICBDMjAuNTQyLDkxLjU5Myw0Mi42OTcsMTE2Ljc2Niw3MS42NDIsMTIxLjYzN3oiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
          // // img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAhCAYAAABX5MJvAAABsklEQVRYR+2VvS8EURTFd3x0tBIFHZGtRBCJglCJkmwlYolGohGl/0IrGl/FVuIPWIlCotCxCdsQnUpESIj1O/JeMjvW7CwzLHkvOXmzd97ce/bec+/zUnWwvDrgkHIkbBVcJv5/Jkql0jL/cgi0g1nP827CujB2TUAgQ8A90ACeQS8kzn+axCQB90EjeDQkLhyJWDJBjcdwtAauqG2W31M8r4BO0AyuwZytO+/jLUfAoUS2BbIgKOgHbIMikgSJVpwXQVsFYb1ga/LZNyGxEDsJBcBpjm3aF+yV51WwAc5Ah3mXg0QmKRJLBFkH6nutHYLNGILH7BpKWgXs6aRITBDgAKjvpYtxgh0ZEifsA4bEJfbupEj41S4B9hHsffgQ8FdIlE3Av0JCmev59gUWVuNPMqELbNdoSG28DVrAPGTujX7Ktqq3qLkVrVOVo983Hf2aKGLv4vwwZw6Bf4aorUetoINEopCQ0zzQiL4DmoxWmAo2YpzmsWvES7DqJgna+n/ieZH3ysqHVZVEpY+i2CCS5pwG2S3BT8O+SYxEFKL2jCPhMlFzi9YisK+edcK0mXsD0DPjIuol1qsAAAAASUVORK5CYII=";
          // img.onLoad = function(){
          //   ctrl.context.drawImage(this, 0, 0);
          // }

          var img = new Image();
          img.src="data:image/gif;base64,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"
          img.onload = function () {
             ctrl.context.drawImage(img,0,0);
          }

          /*
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
        ctrl.context.globalAlpha = alpha;

          ctrl.context.beginPath();
          ctrl.context.arc(data.x, data.y, data.value, 0, 2 * Math.PI, false);
          ctrl.context.fill();
          ctrl.context.lineWidth = 0;
          // ctrl.context.strokeStyle = "#707070";//#707070
          //
          ctrl.context.fillStyle = "#00ff00"; //#00ff00 limegreen, "#ccddff" baby blue;
          // ctrl.context.shadowBlur = 5;
          // ctrl.context.shadowColor = "black";

          // ctrl.context.stroke();

          // timer = $timeout(function () {
          //   drawDotOnCanvas(data);
          // }, 100);
          */

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
