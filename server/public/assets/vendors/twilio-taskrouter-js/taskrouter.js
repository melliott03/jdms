(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        var HttpError = require("./httperror");
        var PropertyUtil = require("./util/property");

        function ApiRequester(channelUrl, eventEmitter) {
            Object.defineProperties(this, {
                channelUrl: {
                    value: channelUrl
                },
                eventEmitter: {
                    value: eventEmitter
                }
            })
        }
        ApiRequester.prototype._handleHttpError = function _handleHttpError(code, message, completion) {
            if (completion) {
                var error = new HttpError(code, message);
                completion(error, null)
            }
        };
        ApiRequester.prototype._handleHttpSuccess = function _handleHttpSuccess(xhr, jsonParams, completion, entity) {
            var jsonResponse = JSON.parse(xhr.responseText);
            var type = jsonResponse.event_type;
            var payload = jsonResponse.payload;
            if (entity) {
                PropertyUtil.setProperties(entity, payload, entity.token, entity.apiRequester, entity.workspaceUrl)
            }
            if (type) {
                this.eventEmitter._emitMessage(type, payload)
            }
            if (completion) {
                this.eventEmitter._sendResponse(completion, payload)
            }
        };
        ApiRequester.prototype._handleHttpFailure = function _handleHttpFailure(xhr, jsonParams, completion, entity, retryCount) {
            var status = xhr.status;
            var message = xhr.statusText;
            if (status === 0 || status === 500) {
                this._retry(xhr, jsonParams, completion, entity, retryCount)
            } else {
                this._handleHttpError(status, message, completion)
            }
        };
        ApiRequester.prototype._retry = function _retry(xhr, jsonParams, completion, entity, retryCount) {
            var maxRetry = 5;
            if (retryCount == maxRetry) {
                console.log("Internal Server Error with five retries. Please contact if this problem persists");
                this._handleHttpError(xhr.status, completion);
                return
            } else {
                console.log("Retrying");
                if (retryCount < maxRetry) {
                    this._postMessage(jsonParams, completion, entity, retryCount + 1)
                }
            }
        };
        ApiRequester.prototype._handleHttpResponse = function _handleHttpResponse(xhr, completion, jsonParams, entity, retryCount) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    return this._handleHttpSuccess(xhr, jsonParams, completion, entity)
                } else {
                    return this._handleHttpFailure(xhr, jsonParams, completion, entity, retryCount)
                }
            }
        };
        ApiRequester.prototype._postMessage = function _postMessage(jsonParams, completion, entity, retryCount) {
            retryCount = retryCount ? retryCount : 0;
            var xhr = new XMLHttpRequest;
            xhr.open("POST", this.channelUrl, true);
            var self = this;
            xhr.onreadystatechange = function() {
                self._handleHttpResponse(this, completion, jsonParams, entity, retryCount)
            };
            xhr.timeout = 5e3;
            xhr.send(jsonParams)
        };
        module.exports = ApiRequester
    }, {
        "./httperror": 7,
        "./util/property": 29
    }],
    2: [function(require, module, exports) {
        var EventEmitter = require("events").EventEmitter;
        var inherits = require("util").inherits;
        var JWTUtil = require("../util/jwt");
        var ApiRequester = require("../api.requester");

        function EventBridgeClient(token, channelUrl, readyUrl) {
            if (!token) {
                throw new Error("Token is required for Workspace client")
            }
            EventEmitter.call(this);
            this.token = token;
            var apiRequester = new ApiRequester(channelUrl, this);
            channelUrl = channelUrl.replace("https", "wss");
            Object.defineProperties(this, {
                channelUrl: {
                    value: channelUrl
                },
                apiRequester: {
                    value: apiRequester
                },
                readyUrl: {
                    value: readyUrl
                }
            });
            var jwt = JWTUtil.objectize(token);
            var expired = jwt.exp;
            var now = Math.round((new Date).getTime() / 1e3);
            var diff = expired - now - 5;
            var self = this;
            setTimeout(function() {
                self._emitTokenExpired()
            }, diff * 1e3);
            if (!jwt.account_sid || !jwt.channel || !jwt.workspace_sid) {
                throw new Error("Missing minimum payload values.Check for existence of account_sid,channel or workspace_sid in the token")
            }
            this._setupWebsocket()
        }
        inherits(EventBridgeClient, EventEmitter);
        EventBridgeClient.prototype.updateToken = function updateToken(token) {
            this.token = token;
            var jwt = JWTUtil.objectize(token);
            var expired = jwt.exp;
            var now = Math.round((new Date).getTime() / 1e3);
            var diff = expired - now - 5;
            var self = this;
            setTimeout(function() {
                self._emitTokenExpired()
            }, diff * 1e3)
        };
        EventBridgeClient.prototype._emitMessage = function _emitMessage(type, payload) {
            this.emit(type, payload)
        };
        EventBridgeClient.prototype._sendResponse = function _sendResponse(completion, payload) {
            completion(null, payload)
        };
        EventBridgeClient.prototype._emitTokenExpired = function _emitTokenExpired() {
            this._emitMessage("token.expired")
        };
        EventBridgeClient.prototype._setupWebsocket = function _setupWebsocket() {
            var queryParam = "?token=" + this.token;
            var self = this;
            var channelUrl = self.channelUrl;
            var token = self.token;
            var ws = new WebSocket(channelUrl + queryParam);
            ws.onopen = function() {
                console.log("Websocket opened: " + ws.url);
                self._fetchResourceOnReady()
            };
            ws.onmessage = function(response) {
                if (response.data.trim().length === 0) {
                    return
                }
                var json;
                try {
                    json = JSON.parse(response.data)
                } catch (e) {
                    console.log(e);
                    console.log("This doesn't look like a valid JSON: ", response.data);
                    return
                }
                var type = json.event_type;
                var payload = json.payload;
                self._emitMessage(type, payload)
            };
            ws.onerror = function(response) {
                console.log("Websocket had an error: " + response)
            };
            ws.onclose = function() {
                console.log("Websocket closed")
            }
        };
        module.exports = EventBridgeClient
    }, {
        "../api.requester": 1,
        "../util/jwt": 28,
        events: 34,
        util: 38
    }],
    3: [function(require, module, exports) {
        var TaskRouterEventBridgeClient = require("./taskrouter-event-bridge-client");
        var JWTUtil = require("../util/jwt");
        var TaskQueue = require("../resources/instance/taskqueue");

        function TaskQueueClient(token, wdsBaseUrl, eventBridgeBaseUrl) {
            var jwt = JWTUtil.objectize(token);
            var taskqueueSid = jwt.taskqueue_sid;
            TaskRouterEventBridgeClient.call(this, token, wdsBaseUrl, eventBridgeBaseUrl, taskqueueSid, "/TaskQueues/" + taskqueueSid);
            var taskqueue = new TaskQueue(token, taskqueueSid, this.apiRequester, this.workspaceUrl);
            for (var property in taskqueue) {
                if (!this.hasOwnProperty(property)) {
                    var propertyValue = taskqueue[property];
                    Object.defineProperty(this, property, {
                        enumerable: true,
                        value: propertyValue
                    })
                }
            }
        }
        TaskQueueClient.prototype = Object.create(TaskRouterEventBridgeClient.prototype);
        module.exports = TaskQueueClient
    }, {
        "../resources/instance/taskqueue": 13,
        "../util/jwt": 28,
        "./taskrouter-event-bridge-client": 4
    }],
    4: [function(require, module, exports) {
        var inherits = require("util").inherits;
        var EventBridgeClient = require("./event-bridge-client");
        var JWTUtil = require("../util/jwt");
        var EntityUtil = require("../util/entity");
        var PropertyUtil = require("../util/property");

        function TaskRouterEventBridgeClient(token, wdsBaseUrl, eventBridgeBaseUrl, channelId, readyPath) {
            if (!token) {
                throw new Error("Token is required for WDS client")
            }
            var jwt = JWTUtil.objectize(token);
            var accountSid = jwt.account_sid;
            var workspaceSid = jwt.workspace_sid;
            wdsBaseUrl = wdsBaseUrl ? wdsBaseUrl : "https://taskrouter.twilio.com/v1";
            var workspaceUrl = wdsBaseUrl + "/Workspaces/" + workspaceSid;
            var readyUrl;
            if (readyPath) {
                readyUrl = workspaceUrl + readyPath
            }
            eventBridgeBaseUrl = eventBridgeBaseUrl ? eventBridgeBaseUrl : "https://event-bridge.twilio.com";
            var baseUrl = eventBridgeBaseUrl + "/v1/wschannels/" + accountSid + "/";
            var channelUrl = baseUrl + channelId;
            this.token = token;
            Object.defineProperties(this, {
                workspaceUrl: {
                    value: workspaceUrl
                },
                resourceUrl: {
                    value: readyUrl
                }
            });
            EventBridgeClient.call(this, token, channelUrl, readyUrl)
        }
        TaskRouterEventBridgeClient.prototype = Object.create(EventBridgeClient.prototype);
        TaskRouterEventBridgeClient.prototype._emitMessage = function _emitMessage(type, payload) {
            var log = "Received a message of type [" + type + "]";
            if (type) {
                var entity = EntityUtil.createEntity(payload, this.token, this.apiRequester, this.workspaceUrl);
                if (entity) {
                    log = log + " with object " + JSON.stringify(entity);
                    this.emit(type, entity)
                } else {
                    if (payload) {
                        log = log + " with json payload " + JSON.stringify(payload)
                    }
                    this.emit(type, payload)
                }
            }
            console.log(log)
        };
        TaskRouterEventBridgeClient.prototype._sendResponse = function _sendResponse(completion, payload) {
            var entity = EntityUtil.createEntity(payload, this.token, this.apiRequester, this.workspaceUrl);
            if (entity) {
                var sid = entity.sid;
                if (sid && sid.substring(0, 2) === "WR") {
                    var promise = PropertyUtil.setTaskProperty(entity);
                    promise.then(function(entity) {
                        completion(null, entity)
                    })
                } else {
                    completion(null, entity)
                }
            } else {
                completion(null, payload)
            }
        };
        TaskRouterEventBridgeClient.prototype._fetchResourceOnReady = function _fetchResourceOnReady() {
            var request = {
                url: this.resourceUrl,
                method: "GET",
                event_type: "ready",
                token: this.token
            };
            var jsonParams = JSON.stringify(request);
            this.apiRequester._postMessage(jsonParams)
        };
        module.exports = TaskRouterEventBridgeClient
    }, {
        "../util/entity": 27,
        "../util/jwt": 28,
        "../util/property": 29,
        "./event-bridge-client": 2,
        util: 38
    }],
    5: [function(require, module, exports) {
        var TaskRouterEventBridgeClient = require("./taskrouter-event-bridge-client");
        var JWTUtil = require("../util/jwt");
        var EntityUtil = require("../util/entity");
        var PropertyUtil = require("../util/property");
        var Reservation = require("../resources/instance/reservation");
        var Worker = require("../resources/instance/worker");
        var ActivityList = require("../resources/list/activities");

        function WorkerClient(token, wdsBaseUrl, eventBridgeBaseUrl) {
            var jwt = JWTUtil.objectize(token);
            var workerSid = jwt.worker_sid;
            Object.defineProperties(this, {
                workerSid: {
                    value: workerSid
                }
            });
            var readyPath = "/Workers/" + workerSid;
            TaskRouterEventBridgeClient.call(this, token, wdsBaseUrl, eventBridgeBaseUrl, workerSid, readyPath);
            var worker = new Worker(token, workerSid, this.apiRequester, this.workspaceUrl);
            var activityList = new ActivityList(token, this.apiRequester, this.workspaceUrl);
            Object.defineProperties(this, {
                activities: {
                    value: activityList
                }
            });
            for (var property in worker) {
                if (!this.hasOwnProperty(property)) {
                    var propertyValue = worker[property];
                    Object.defineProperty(this, property, {
                        enumerable: true,
                        value: propertyValue
                    })
                }
            }
        }
        WorkerClient.prototype = Object.create(TaskRouterEventBridgeClient.prototype);
        WorkerClient.prototype.fetchReservation = function fetchReservation(completion, params) {
            var request = {
                url: this.workspaceUrl + "/Workers/" + this.workerSid + "/Reservations",
                method: "GET",
                token: this.token
            };
            if (params) {
                request.params = params
            }
            var jsonParams = JSON.stringify(request);
            this.apiRequester._postMessage(jsonParams, completion)
        };
        WorkerClient.prototype.fetchActivityList = function fetchActivityList(completion) {
            console.warn("Deprecated. Please utilize worker.activities.fetch(function() {}) instead.");
            var jsonParams = JSON.stringify({
                url: this.workspaceUrl + "/Activities",
                method: "GET",
                token: this.token
            });
            this.apiRequester._postMessage(jsonParams, completion)
        };
        WorkerClient.prototype.updateActivity = function updateActivity(activitySid, completion) {
            console.warn('Deprecated. Please utilize worker.update({"ActivitySid":"' + activitySid + '"}, function() {}) instead.');
            var jsonParams = JSON.stringify({
                url: this.workspaceUrl + "/Workers/" + this.workerSid,
                method: "POST",
                params: {
                    ActivitySid: activitySid
                },
                token: this.token
            });
            this.apiRequester._postMessage(jsonParams, completion)
        };
        WorkerClient.prototype._emitMessage = function _emitMessage(type, payload) {
            if (type && type.indexOf("worker") === 0) {
                type = type.replace("worker.", "")
            }
            var log = "Received a message of type [" + type + "]";
            if (type) {
                var entity;
                if (type.indexOf("reservation") === 0) {
                    var taskSid = payload.sid;
                    var sid = payload.reservation_sid;
                    entity = new Reservation(this.token, sid, taskSid, this.apiRequester, this.workspaceUrl);
                    var self = this;
                    var promise = PropertyUtil.setReservationProperties(entity);
                    promise.then(function(reservation) {
                        self.emit(type, reservation)
                    })
                } else {
                    entity = EntityUtil.createEntity(payload, this.token, this.apiRequester, this.workspaceUrl);
                    if (entity) {
                        log = log + " with object " + JSON.stringify(entity);
                        this.emit(type, entity)
                    } else {
                        if (payload) {
                            log = log + " with json payload " + JSON.stringify(payload)
                        }
                        this.emit(type, payload)
                    }
                }
            }
            console.log(log)
        };
        module.exports = WorkerClient
    }, {
        "../resources/instance/reservation": 10,
        "../resources/instance/worker": 15,
        "../resources/list/activities": 18,
        "../util/entity": 27,
        "../util/jwt": 28,
        "../util/property": 29,
        "./taskrouter-event-bridge-client": 4
    }],
    6: [function(require, module, exports) {
        var TaskRouterEventBridgeClient = require("./taskrouter-event-bridge-client");
        var JWTUtil = require("../util/jwt");
        var Workspace = require("../resources/instance/workspace");

        function WorkspaceClient(token, wdsBaseUrl, eventBridgeBaseUrl) {
            var jwt = JWTUtil.objectize(token);
            var workspaceSid = jwt.workspace_sid;
            TaskRouterEventBridgeClient.call(this, token, wdsBaseUrl, eventBridgeBaseUrl, workspaceSid, "/");
            var workspace = new Workspace(token, this.apiRequester, this.workspaceUrl);
            for (var property in workspace) {
                if (!this.hasOwnProperty(property)) {
                    var propertyValue = workspace[property];
                    Object.defineProperty(this, property, {
                        enumerable: true,
                        value: propertyValue
                    })
                }
            }
        }
        WorkspaceClient.prototype = Object.create(TaskRouterEventBridgeClient.prototype);
        module.exports = WorkspaceClient
    }, {
        "../resources/instance/workspace": 17,
        "../util/jwt": 28,
        "./taskrouter-event-bridge-client": 4
    }],
    7: [function(require, module, exports) {
        function HttpError(code, message) {
            Object.defineProperties(this, {
                code: {
                    value: code
                },
                message: {
                    value: message
                }
            })
        }
        module.exports = HttpError
    }, {}],
    8: [function(require, module, exports) {
        function TaskRouter() {}
        Object.defineProperties(TaskRouter, {
            TaskQueue: {
                enumerable: true,
                value: require("./clients/taskqueue-client")
            },
            Worker: {
                enumerable: true,
                value: require("./clients/worker-client")
            },
            Workspace: {
                enumerable: true,
                value: require("./clients/workspace-client")
            }
        });
        module.exports = TaskRouter
    }, {
        "./clients/taskqueue-client": 3,
        "./clients/worker-client": 5,
        "./clients/workspace-client": 6
    }],
    9: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");

        function Activity(token, sid, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Activities/" + sid;
            TaskRouterResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        Activity.prototype = Object.create(TaskRouterResource.prototype);
        module.exports = Activity
    }, {
        "./taskrouter-resource": 14
    }],
    10: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");
        var Task = require("./task");

        function Reservation(token, sid, taskSid, apiRequester, workspaceUrl) {
            var task = new Task(token, taskSid, apiRequester, workspaceUrl);
            var resourceUrl = workspaceUrl + "/Tasks/" + taskSid + "/Reservations/" + sid;
            this.task = task;
            TaskRouterResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        Reservation.prototype = Object.create(TaskRouterResource.prototype);
        Object.defineProperty(Reservation.prototype, "accept", {
            value: function(completion) {
                var jsonParams = JSON.stringify({
                    url: this.resourceUrl,
                    method: "POST",
                    params: {
                        ReservationStatus: "accepted"
                    },
                    token: this.token
                });
                this.apiRequester._postMessage(jsonParams, completion)
            },
            enumerable: false
        });
        Object.defineProperty(Reservation.prototype, "reject", {
            value: function(activitySid, completion) {
                var jsonParams = JSON.stringify({
                    url: this.resourceUrl,
                    method: "POST",
                    params: {
                        ReservationStatus: "rejected",
                        WorkerActivitySid: activitySid
                    },
                    token: this.token
                });
                this.apiRequester._postMessage(jsonParams, completion)
            },
            enumerable: false
        });
        Object.defineProperty(Reservation.prototype, "dequeue", {
            value: function(dequeueFrom, dequeuePostWorkActivitySid, completion) {
                var jsonParams = JSON.stringify({
                    url: this.resourceUrl,
                    method: "POST",
                    params: {
                        Instruction: "dequeue",
                        DequeuePostWorkActivitySid: dequeuePostWorkActivitySid,
                        DequeueFrom: dequeueFrom
                    },
                    token: this.token
                });
                this.apiRequester._postMessage(jsonParams, completion)
            },
            enumerable: false
        });
        Object.defineProperty(Reservation.prototype, "call", {
            value: function(callFrom, callUrl, callStatusCallbackUrl, callAccept, completion) {
                var jsonParams = JSON.stringify({
                    url: this.resourceUrl,
                    method: "POST",
                    params: {
                        Instruction: "call",
                        CallFrom: callFrom,
                        CallUrl: callUrl,
                        CallStatusCallbackUrl: callStatusCallbackUrl,
                        CallAccept: callAccept
                    },
                    token: this.token
                });
                this.apiRequester._postMessage(jsonParams, completion)
            },
            enumerable: false
        });
        module.exports = Reservation
    }, {
        "./task": 12,
        "./taskrouter-resource": 14
    }],
    11: [function(require, module, exports) {
        function Resource(token, resourceUrl, apiRequester) {
            Object.defineProperties(this, {
                token: {
                    value: token
                },
                resourceUrl: {
                    value: resourceUrl
                },
                apiRequester: {
                    value: apiRequester
                }
            })
        }
        Resource.prototype.fetch = function fetch(completion) {
            var jsonParams = JSON.stringify({
                url: this.resourceUrl,
                method: "GET",
                token: this.token
            });
            this.apiRequester._postMessage(jsonParams, completion)
        };
        Resource.prototype.update = function update() {
            var arg0 = arguments[0];
            var arg1 = arguments[1];
            var arg2 = arguments[2];
            var params = {};
            var completion;
            if (typeof arg0 === "string") {
                if (typeof arg1 === "string") {
                    params[arg0] = arg1;
                    completion = arg2
                } else {
                    throw Error("2nd argument needs to be a string value")
                }
            } else if (arg0 instanceof Object) {
                params = arg0;
                for (var key in params) {
                    var value = params[key];
                    if (value instanceof Object) {
                        params[key] = JSON.stringify(value)
                    }
                }
                if (typeof arg1 === "undefined" || arg1 instanceof Function) {
                    completion = arg1
                } else {
                    throw Error("2nd argument needs to be a function")
                }
            } else {
                throw Error("1st argument needs to either be a string or a JSON object")
            }
            var request = JSON.stringify({
                url: this.resourceUrl,
                method: "POST",
                params: params,
                token: this.token
            });
            this.apiRequester._postMessage(request, completion, this)
        };
        Resource.prototype.delete = function deleteR(completion) {
            var request = JSON.stringify({
                url: this.resourceUrl,
                method: "DELETE",
                token: this.token
            });
            this.apiRequester._postMessage(request, completion)
        };
        module.exports = Resource
    }, {}],
    12: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");

        function Task(token, sid, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Tasks/" + sid;
            TaskRouterResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        Task.prototype = Object.create(TaskRouterResource.prototype);
        module.exports = Task
    }, {
        "./taskrouter-resource": 14
    }],
    13: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");
        var Statistics = require("../list/statistics");

        function TaskQueue(token, sid, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/TaskQueues/" + sid;
            var statistics = new Statistics(token, resourceUrl, apiRequester, workspaceUrl);
            Object.defineProperties(this, {
                statistics: {
                    value: statistics,
                    enumerable: true
                }
            });
            TaskRouterResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        TaskQueue.prototype = Object.create(TaskRouterResource.prototype);
        module.exports = TaskQueue
    }, {
        "../list/statistics": 20,
        "./taskrouter-resource": 14
    }],
    14: [function(require, module, exports) {
        var Resource = require("./resource");

        function TaskRouterResource(token, resourceUrl, apiRequester, workspaceUrl) {
            Object.defineProperties(this, {
                workspaceUrl: {
                    value: workspaceUrl
                }
            });
            Resource.call(this, token, resourceUrl, apiRequester)
        }
        TaskRouterResource.prototype = Object.create(Resource.prototype);
        module.exports = TaskRouterResource
    }, {
        "./resource": 11
    }],
    15: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");
        var Statistics = require("../list/statistics");

        function Worker(token, sid, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Workers/" + sid;
            var statistics = new Statistics(token, resourceUrl, apiRequester, workspaceUrl);
            Object.defineProperties(this, {
                statistics: {
                    value: statistics,
                    enumerable: true
                }
            });
            TaskRouterResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        Worker.prototype = Object.create(TaskRouterResource.prototype);
        module.exports = Worker
    }, {
        "../list/statistics": 20,
        "./taskrouter-resource": 14
    }],
    16: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");
        var Statistics = require("../list/statistics");

        function Workflow(token, sid, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Workflows/" + sid;
            var statistics = new Statistics(token, resourceUrl, apiRequester, workspaceUrl);
            Object.defineProperties(this, {
                statistics: {
                    value: statistics,
                    enumerable: true
                }
            });
            TaskRouterResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        Workflow.prototype = Object.create(TaskRouterResource.prototype);
        module.exports = Workflow
    }, {
        "../list/statistics": 20,
        "./taskrouter-resource": 14
    }],
    17: [function(require, module, exports) {
        var TaskRouterResource = require("./taskrouter-resource");
        var ActivityList = require("../list/activities");
        var WorkflowList = require("../list/workflows");
        var WorkerList = require("../list/workers");
        var TaskQueueList = require("../list/taskqueues");
        var TaskList = require("../list/tasks");
        var Statistics = require("../list/statistics");

        function Workspace(token, apiRequester, workspaceUrl) {
            TaskRouterResource.call(this, token, workspaceUrl, apiRequester, workspaceUrl);
            var activityList = new ActivityList(token, apiRequester, workspaceUrl);
            var workflowList = new WorkflowList(token, apiRequester, workspaceUrl);
            var workerList = new WorkerList(token, apiRequester, workspaceUrl);
            var queueList = new TaskQueueList(token, apiRequester, workspaceUrl);
            var taskList = new TaskList(token, apiRequester, workspaceUrl);
            var statistics = new Statistics(token, workspaceUrl, apiRequester, workspaceUrl);
            Object.defineProperties(this, {
                activities: {
                    value: activityList,
                    enumerable: true
                },
                workflows: {
                    value: workflowList,
                    enumerable: true
                },
                taskqueues: {
                    value: queueList,
                    enumerable: true
                },
                workers: {
                    value: workerList,
                    enumerable: true
                },
                tasks: {
                    value: taskList,
                    enumerable: true
                },
                statistics: {
                    value: statistics,
                    enumerable: true
                }
            })
        }
        Workspace.prototype = Object.create(TaskRouterResource.prototype);
        module.exports = Workspace
    }, {
        "../list/activities": 18,
        "../list/statistics": 20,
        "../list/taskqueues": 21,
        "../list/tasks": 23,
        "../list/workers": 24,
        "../list/workflows": 25,
        "./taskrouter-resource": 14
    }],
    18: [function(require, module, exports) {
        var TaskRouterListResource = require("./taskrouter-list-resource");

        function ActivityList(token, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Activities";
            TaskRouterListResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        ActivityList.prototype = Object.create(TaskRouterListResource.prototype);
        module.exports = ActivityList
    }, {
        "./taskrouter-list-resource": 22
    }],
    19: [function(require, module, exports) {
        function ListResource(token, resourceUrl, apiRequester) {
            Object.defineProperties(this, {
                token: {
                    value: token
                },
                resourceUrl: {
                    value: resourceUrl
                },
                apiRequester: {
                    value: apiRequester
                }
            })
        }
        ListResource.prototype.fetch = function fetch() {
            var arg0 = arguments[0];
            var arg1 = arguments[1];
            var params;
            var completion;
            if (typeof arg0 === "string") {
                var sid = arg0;
                if (arg1 instanceof Function) {
                    completion = arg1
                } else {
                    throw Error("2nd argument needs to be a function")
                }
                var sidRequest = JSON.stringify({
                    url: this.resourceUrl + "/" + sid,
                    method: "GET",
                    token: this.token
                });
                this.apiRequester._postMessage(sidRequest, completion)
            } else {
                if (arg0 instanceof Function) {
                    completion = arg0
                } else if (arg0 instanceof Object) {
                    params = arg0;
                    if (arg1 instanceof Function) {
                        completion = arg1
                    } else {
                        throw Error("2nd argument needs to be a function")
                    }
                } else {
                    throw Error("1st argument needs to be either a callback function, query parameters, or a SID string")
                }
                var request = {
                    url: this.resourceUrl,
                    method: "GET",
                    token: this.token
                };
                if (params) {
                    request.params = params
                }
                var jsonParams = JSON.stringify(request);
                this.apiRequester._postMessage(jsonParams, completion)
            }
        };
        ListResource.prototype.create = function create(params, completion) {
            var request = JSON.stringify({
                url: this.resourceUrl,
                method: "POST",
                params: params,
                token: this.token
            });
            this.apiRequester._postMessage(request, completion)
        };
        ListResource.prototype.update = function update() {
            var sid = arguments[0];
            var arg1 = arguments[1];
            var arg2 = arguments[2];
            var arg3 = arguments[3];
            var params = {};
            var completion;
            if (typeof arg1 === "string") {
                if (typeof arg2 === "string") {
                    params[arg1] = arg2;
                    completion = arg3
                } else {
                    throw Error("3rd argument needs to be a string value")
                }
            } else if (arg1 instanceof Object) {
                params = arg1;
                for (var key in params) {
                    var value = params[key];
                    if (value instanceof Object) {
                        params[key] = JSON.stringify(value)
                    }
                }
                if (typeof arg2 === "undefined" || arg2 instanceof Function) {
                    completion = arg2
                } else {
                    throw Error("3rd argument needs to be a function")
                }
            } else {
                throw Error("2nd argument needs to either be a string or a JSON object")
            }
            var request = JSON.stringify({
                url: this.resourceUrl + "/" + sid,
                method: "POST",
                params: params,
                token: this.token
            });
            this.apiRequester._postMessage(request, completion, this)
        };
        ListResource.prototype.delete = function deleteR(sid, completion) {
            var request = JSON.stringify({
                url: this.resourceUrl + "/" + sid,
                method: "DELETE",
                token: this.token
            });
            this.apiRequester._postMessage(request, completion)
        };
        module.exports = ListResource
    }, {}],
    20: [function(require, module, exports) {
        var TaskRouterListResource = require("./taskrouter-list-resource");

        function Statistics(token, resourceUrl, apiRequester, workspaceUrl) {
            var statsResourceUrl = resourceUrl + "/Statistics";
            TaskRouterListResource.call(this, token, statsResourceUrl, apiRequester, workspaceUrl)
        }
        Statistics.prototype = Object.create(TaskRouterListResource.prototype);
        module.exports = Statistics
    }, {
        "./taskrouter-list-resource": 22
    }],
    21: [function(require, module, exports) {
        var TaskRouterListResource = require("./taskrouter-list-resource");
        var Statistics = require("../list/statistics");

        function TaskQueueList(token, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/TaskQueues";
            var statistics = new Statistics(token, resourceUrl, apiRequester, workspaceUrl);
            Object.defineProperties(this, {
                statistics: {
                    value: statistics,
                    enumerable: true
                }
            });
            TaskRouterListResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        TaskQueueList.prototype = Object.create(TaskRouterListResource.prototype);
        module.exports = TaskQueueList
    }, {
        "../list/statistics": 20,
        "./taskrouter-list-resource": 22
    }],
    22: [function(require, module, exports) {
        var ListResource = require("./list-resource");

        function TaskRouterListResource(token, resourceUrl, apiRequester, workspaceUrl) {
            Object.defineProperties(this, {
                workspaceUrl: {
                    value: workspaceUrl
                }
            });
            ListResource.call(this, token, resourceUrl, apiRequester)
        }
        TaskRouterListResource.prototype = Object.create(ListResource.prototype);
        module.exports = TaskRouterListResource
    }, {
        "./list-resource": 19
    }],
    23: [function(require, module, exports) {
        var TaskRouterListResource = require("./taskrouter-list-resource");

        function TaskList(token, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Tasks";
            TaskRouterListResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        TaskList.prototype = Object.create(TaskRouterListResource.prototype);
        module.exports = TaskList
    }, {
        "./taskrouter-list-resource": 22
    }],
    24: [function(require, module, exports) {
        var TaskRouterListResource = require("./taskrouter-list-resource");
        var Statistics = require("../list/statistics");

        function WorkerList(token, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Workers";
            var statistics = new Statistics(token, resourceUrl, apiRequester, workspaceUrl);
            Object.defineProperties(this, {
                statistics: {
                    value: statistics,
                    enumerable: true
                }
            });
            TaskRouterListResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        WorkerList.prototype = Object.create(TaskRouterListResource.prototype);
        module.exports = WorkerList
    }, {
        "../list/statistics": 20,
        "./taskrouter-list-resource": 22
    }],
    25: [function(require, module, exports) {
        var TaskRouterListResource = require("./taskrouter-list-resource");

        function WorkflowList(token, apiRequester, workspaceUrl) {
            var resourceUrl = workspaceUrl + "/Workflows";
            TaskRouterListResource.call(this, token, resourceUrl, apiRequester, workspaceUrl)
        }
        WorkflowList.prototype = Object.create(TaskRouterListResource.prototype);
        module.exports = WorkflowList
    }, {
        "./taskrouter-list-resource": 22
    }],
    26: [function(require, module, exports) {
        function convertToCamelCase(snakeCaseProperty) {
            var underScoreIndex = snakeCaseProperty.indexOf("_");
            if (underScoreIndex === -1) {
                return snakeCaseProperty
            } else {
                var firstProperty = snakeCaseProperty.substring(0, underScoreIndex);
                var startOfNextChar = snakeCaseProperty.charAt(underScoreIndex + 1).toUpperCase();
                var restOfProperties = snakeCaseProperty.substring(underScoreIndex + 2, snakeCaseProperty.length);
                var newProperty = firstProperty + startOfNextChar + restOfProperties;
                return convertToCamelCase(newProperty)
            }
        }
        exports.convertToCamelCase = convertToCamelCase
    }, {}],
    27: [function(require, module, exports) {
        var Workspace = require("../resources/instance/workspace");
        var Activity = require("../resources/instance/activity");
        var Workflow = require("../resources/instance/workflow");
        var TaskQueue = require("../resources/instance/taskqueue");
        var Worker = require("../resources/instance/worker");
        var Task = require("../resources/instance/task");
        var Reservation = require("../resources/instance/reservation");
        var ActivityList = require("../resources/list/activities");
        var WorkflowList = require("../resources/list/workflows");
        var TaskQueueList = require("../resources/list/taskqueues");
        var WorkerList = require("../resources/list/workers");
        var TaskList = require("../resources/list/tasks");
        var PropertyUtil = require("./property");

        function setFKLookup(object, sidType, sid, token, apiRequester, workspaceUrl) {
            var fkObject;
            var type;
            if (sidType === "workspaceSid") {
                fkObject = new Workspace(token, apiRequester, workspaceUrl);
                type = "workspace"
            } else if (sidType === "workflowSid") {
                fkObject = new Workflow(token, sid, apiRequester, workspaceUrl);
                type = "workflow"
            } else if (sidType === "queueSid") {
                fkObject = new TaskQueue(token, sid, apiRequester, workspaceUrl);
                type = "queue"
            } else if (sidType === "workerSid") {
                fkObject = new Worker(token, sid, apiRequester, workspaceUrl);
                type = "worker"
            } else if (sidType.toLowerCase().indexOf("activitysid") > 0) {
                fkObject = new Activity(token, sid, apiRequester, workspaceUrl);
                type = sidType.substring(0, sidType.indexOf("Sid"))
            } else if (sidType === "taskSid") {
                fkObject = new Task(token, sid, apiRequester, workspaceUrl);
                type = "task"
            } else if (sidType === "reservationSid") {
                fkObject = new Reservation(token, sid, apiRequester, workspaceUrl);
                type = "reservation"
            }
            if (typeof fkObject !== "undefined") {
                if (!object.hasOwnProperty(type)) {
                    Object.defineProperty(object, type, {
                        enumerable: true,
                        value: fkObject
                    })
                }
            }
        }

        function createEntity(payload, token, apiRequester, workspaceUrl) {
            if (!payload) {
                return
            }
            var entity;
            if (payload.sid) {
                var sid = payload.sid;
                var prefix = sid.substring(0, 2);
                if (prefix === "WS") {
                    entity = new Workspace(token, apiRequester, workspaceUrl)
                } else if (prefix === "WW") {
                    entity = new Workflow(token, sid, apiRequester, workspaceUrl)
                } else if (prefix === "WQ") {
                    entity = new TaskQueue(token, sid, apiRequester, workspaceUrl)
                } else if (prefix === "WK") {
                    entity = new Worker(token, sid, apiRequester, workspaceUrl)
                } else if (prefix === "WA") {
                    entity = new Activity(token, sid, apiRequester, workspaceUrl)
                } else if (prefix === "WT") {
                    entity = new Task(token, sid, apiRequester, workspaceUrl)
                } else if (prefix === "WR") {
                    var taskSid = payload.task_sid;
                    entity = new Reservation(token, sid, taskSid, apiRequester, workspaceUrl)
                }
                PropertyUtil.setProperties(entity, payload, token, apiRequester, workspaceUrl);
                return entity
            } else if (payload.meta) {
                var meta = payload.meta;
                var metaKey = payload.meta.key;
                if (metaKey.indexOf("statistics") === -1) {
                    var listEntity;
                    if (metaKey === "workflows") {
                        listEntity = new WorkflowList(token, apiRequester, workspaceUrl)
                    } else if (metaKey === "task_queues") {
                        listEntity = new TaskQueueList(token, apiRequester, workspaceUrl)
                    } else if (metaKey === "workers") {
                        listEntity = new WorkerList(token, apiRequester, workspaceUrl)
                    } else if (metaKey === "activities") {
                        listEntity = new ActivityList(token, apiRequester, workspaceUrl)
                    } else if (metaKey === "tasks") {
                        listEntity = new TaskList(token, apiRequester, workspaceUrl)
                    }
                    var listItems = [];
                    payload[metaKey].forEach(function(element) {
                        var listItem;
                        if (metaKey === "workflows") {
                            listItem = new Workflow(token, element.sid, apiRequester, workspaceUrl)
                        } else if (metaKey === "task_queues") {
                            listItem = new TaskQueue(token, element.sid, apiRequester, workspaceUrl)
                        } else if (metaKey === "workers") {
                            listItem = new Worker(token, element.sid, apiRequester, workspaceUrl)
                        } else if (metaKey === "activities") {
                            listItem = new Activity(token, element.sid, apiRequester, workspaceUrl)
                        } else if (metaKey === "tasks") {
                            listItem = new Task(token, element.sid, apiRequester, workspaceUrl)
                        }
                        if (listItem) {
                            PropertyUtil.setProperties(listItem, element, token, apiRequester, workspaceUrl);
                            listItems.push(listItem)
                        }
                    });
                    Object.defineProperty(listEntity, "data", {
                        enumerable: true,
                        value: listItems
                    });
                    Object.defineProperty(listEntity, "page", {
                        enumerable: true,
                        value: meta.page
                    });
                    Object.defineProperty(listEntity, "pageSize", {
                        enumerable: true,
                        value: meta.page_size
                    });
                    if (meta.next_page_url) {
                        Object.defineProperty(listEntity, "next", {
                            value: function(completion) {
                                var request = {
                                    url: meta.next_page_url,
                                    method: "GET",
                                    token: token
                                };
                                var jsonParams = JSON.stringify(request);
                                this.apiRequester._postMessage(jsonParams, completion)
                            },
                            enumerable: true
                        });
                        Object.defineProperty(listEntity, "hasNext", {
                            value: true,
                            enumerable: true
                        })
                    } else {
                        Object.defineProperty(listEntity, "hasNext", {
                            value: false,
                            enumerable: true
                        })
                    }
                    if (meta.previous_page_url) {
                        Object.defineProperty(listEntity, "previous", {
                            value: function(completion) {
                                var request = {
                                    url: meta.previous_page_url,
                                    method: "GET",
                                    token: token
                                };
                                var jsonParams = JSON.stringify(request);
                                this.apiRequester._postMessage(jsonParams, completion)
                            },
                            enumerable: true
                        });
                        Object.defineProperty(listEntity, "hasPrevious", {
                            value: true,
                            enumerable: true
                        })
                    } else {
                        Object.defineProperty(listEntity, "hasPrevious", {
                            value: false,
                            enumerable: true
                        })
                    }
                    return listEntity
                } else {
                    var statsList = {};
                    var statsListJSON = payload[metaKey];
                    PropertyUtil.setProperties(statsList, statsListJSON);
                    return statsList
                }
            } else if (payload.cumulative || payload.realtime) {
                var stats = {};
                var statsJSON = payload;
                PropertyUtil.setProperties(stats, statsJSON);
                return stats
            }
        }
        exports.setFKLookup = setFKLookup;
        exports.createEntity = createEntity
    }, {
        "../resources/instance/activity": 9,
        "../resources/instance/reservation": 10,
        "../resources/instance/task": 12,
        "../resources/instance/taskqueue": 13,
        "../resources/instance/worker": 15,
        "../resources/instance/workflow": 16,
        "../resources/instance/workspace": 17,
        "../resources/list/activities": 18,
        "../resources/list/taskqueues": 21,
        "../resources/list/tasks": 23,
        "../resources/list/workers": 24,
        "../resources/list/workflows": 25,
        "./property": 29
    }],
    28: [function(require, module, exports) {
        (function(Buffer) {
            function memoize(fn) {
                return function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    fn.memo = fn.memo || {};
                    return fn.memo[args] ? fn.memo[args] : fn.memo[args] = fn.apply(null, args)
                }
            }

            function decodePayload(encoded_payload) {
                var remainder = encoded_payload.length % 4;
                if (remainder > 0) {
                    var padlen = 4 - remainder;
                    encoded_payload += new Array(padlen + 1).join("=")
                }
                encoded_payload = encoded_payload.replace(/-/g, "+").replace(/_/g, "/");
                var decoded_payload = _atob(encoded_payload);
                return JSON.parse(decoded_payload)
            }
            var memoizedDecodePayload = memoize(decodePayload);

            function decode(token) {
                var segs = token.split(".");
                if (segs.length != 3) {
                    throw new Error("Wrong number of segments")
                }
                var encoded_payload = segs[1];
                var payload = memoizedDecodePayload(encoded_payload);
                return payload
            }

            function _atob(encoded) {
                try {
                    return atob(encoded)
                } catch (e) {
                    try {
                        return new Buffer(encoded, "base64").toString("ascii")
                    } catch (f) {
                        return Twilio._phpjs_atob(encoded)
                    }
                }
            }

            function objectize(token) {
                var jwt = decode(token);
                return jwt
            }
            var memoizedObjectize = memoize(objectize);
            exports.decode = decode;
            exports.atob = _atob;
            exports.objectize = memoizedObjectize
        }).call(this, require("buffer").Buffer)
    }, {
        buffer: 30
    }],
    29: [function(require, module, exports) {
        var CamelCaseUtil = require("./camelcase");
        var EntityUtil = require("./entity");

        function setProperties(object, payload, token, apiRequester, workspaceUrl) {
            for (var property in payload) {
                if (property == "reservation_sid" || property === "url" || property === "links") {
                    continue
                }
                var propertyValue;
                if (property === "attributes" || property === "configuration") {
                    propertyValue = JSON.parse(payload[property])
                } else if (property === "date_created" || property === "date_updated" || property === "date_status_changed") {
                    propertyValue = new Date(payload[property])
                } else if (payload[property] instanceof Object) {
                    propertyValue = payload[property];
                    for (var prop in propertyValue) {
                        if (propertyValue.hasOwnProperty(prop)) {
                            var propertyValueProp = propertyValue[prop];
                            var newProp = CamelCaseUtil.convertToCamelCase(prop);
                            delete propertyValue[prop];
                            if (propertyValueProp instanceof Array) {
                                var arrayList = [];
                                propertyValueProp.forEach(function(element) {
                                    var arrayObject = {};
                                    setProperties(arrayObject, element, token, apiRequester, workspaceUrl);
                                    arrayList.push(arrayObject)
                                });
                                Object.defineProperty(propertyValue, newProp, {
                                    enumerable: true,
                                    value: arrayList
                                })
                            } else if (propertyValueProp instanceof Object) {
                                var newNestedObject = {};
                                setProperties(newNestedObject, propertyValueProp, token, apiRequester, workspaceUrl);
                                Object.defineProperty(propertyValue, newProp, {
                                    enumerable: true,
                                    value: newNestedObject
                                })
                            } else {
                                Object.defineProperty(propertyValue, newProp, {
                                    enumerable: true,
                                    value: propertyValueProp
                                })
                            }
                        }
                    }
                } else {
                    propertyValue = payload[property]
                }
                property = CamelCaseUtil.convertToCamelCase(property);
                Object.defineProperty(object, property, {
                    enumerable: true,
                    configurable: true,
                    value: propertyValue
                });
                if (property.indexOf("Sid") > 0) {
                    EntityUtil.setFKLookup(object, property, propertyValue, token, apiRequester, workspaceUrl)
                }
            }
        }

        function setReservationProperties(reservation) {
            return new Promise(function(resolve, reject) {
                var taskPromise = _getTask(reservation);
                var reservationPromise = _getReservation(reservation);
                var promises = [taskPromise, reservationPromise];
                Promise.all(promises).then(function(results) {
                    var reservation = results[1];
                    Object.defineProperties(reservation, {
                        task: {
                            value: results[0],
                            enumerable: true
                        }
                    });
                    resolve(reservation)
                })
            })
        }

        function setTaskProperty(reservation) {
            return new Promise(function(resolve, reject) {
                var taskPromise = _getTask(reservation);
                taskPromise.then(function(task) {
                    Object.defineProperties(reservation, {
                        task: {
                            value: task,
                            enumerable: true
                        }
                    });
                    resolve(reservation)
                })
            })
        }

        function _getTask(reservation) {
            return new Promise(function(resolve, reject) {
                reservation.task.fetch(function(error, task) {
                    if (error) {
                        console.log(error.code);
                        console.log(error.message);
                        reject(Error(error.message));
                        return
                    }
                    resolve(task)
                })
            })
        }

        function _getReservation(reservation) {
            return new Promise(function(resolve, reject) {
                reservation.fetch(function(error, reservation) {
                    if (error) {
                        console.log(error.code);
                        console.log(error.message);
                        reject(Error(error.message));
                        return
                    }
                    resolve(reservation)
                })
            })
        }
        exports.setProperties = setProperties;
        exports.setReservationProperties = setReservationProperties;
        exports.setTaskProperty = setTaskProperty
    }, {
        "./camelcase": 26,
        "./entity": 27
    }],
    30: [function(require, module, exports) {
        var base64 = require("base64-js");
        var ieee754 = require("ieee754");
        var isArray = require("is-array");
        exports.Buffer = Buffer;
        exports.SlowBuffer = SlowBuffer;
        exports.INSPECT_MAX_BYTES = 50;
        Buffer.poolSize = 8192;
        var kMaxLength = 1073741823;
        var rootParent = {};
        Buffer.TYPED_ARRAY_SUPPORT = function() {
            try {
                var buf = new ArrayBuffer(0);
                var arr = new Uint8Array(buf);
                arr.foo = function() {
                    return 42
                };
                return arr.foo() === 42 && typeof arr.subarray === "function" && new Uint8Array(1).subarray(1, 1).byteLength === 0
            } catch (e) {
                return false
            }
        }();

        function Buffer(arg) {
            if (!(this instanceof Buffer)) {
                if (arguments.length > 1) return new Buffer(arg, arguments[1]);
                return new Buffer(arg)
            }
            this.length = 0;
            this.parent = undefined;
            if (typeof arg === "number") {
                return fromNumber(this, arg)
            }
            if (typeof arg === "string") {
                return fromString(this, arg, arguments.length > 1 ? arguments[1] : "utf8")
            }
            return fromObject(this, arg)
        }

        function fromNumber(that, length) {
            that = allocate(that, length < 0 ? 0 : checked(length) | 0);
            if (!Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < length; i++) {
                    that[i] = 0
                }
            }
            return that
        }

        function fromString(that, string, encoding) {
            if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
            var length = byteLength(string, encoding) | 0;
            that = allocate(that, length);
            that.write(string, encoding);
            return that
        }

        function fromObject(that, object) {
            if (Buffer.isBuffer(object)) return fromBuffer(that, object);
            if (isArray(object)) return fromArray(that, object);
            if (object == null) {
                throw new TypeError("must start with number, buffer, array or string")
            }
            if (typeof ArrayBuffer !== "undefined" && object.buffer instanceof ArrayBuffer) {
                return fromTypedArray(that, object)
            }
            if (object.length) return fromArrayLike(that, object);
            return fromJsonObject(that, object)
        }

        function fromBuffer(that, buffer) {
            var length = checked(buffer.length) | 0;
            that = allocate(that, length);
            buffer.copy(that, 0, 0, length);
            return that
        }

        function fromArray(that, array) {
            var length = checked(array.length) | 0;
            that = allocate(that, length);
            for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255
            }
            return that
        }

        function fromTypedArray(that, array) {
            var length = checked(array.length) | 0;
            that = allocate(that, length);
            for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255
            }
            return that
        }

        function fromArrayLike(that, array) {
            var length = checked(array.length) | 0;
            that = allocate(that, length);
            for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255
            }
            return that
        }

        function fromJsonObject(that, object) {
            var array;
            var length = 0;
            if (object.type === "Buffer" && isArray(object.data)) {
                array = object.data;
                length = checked(array.length) | 0
            }
            that = allocate(that, length);
            for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255
            }
            return that
        }

        function allocate(that, length) {
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                that = Buffer._augment(new Uint8Array(length))
            } else {
                that.length = length;
                that._isBuffer = true
            }
            var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
            if (fromPool) that.parent = rootParent;
            return that
        }

        function checked(length) {
            if (length >= kMaxLength) {
                throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength.toString(16) + " bytes")
            }
            return length | 0
        }

        function SlowBuffer(subject, encoding) {
            if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding);
            var buf = new Buffer(subject, encoding);
            delete buf.parent;
            return buf
        }
        Buffer.isBuffer = function isBuffer(b) {
            return !!(b != null && b._isBuffer)
        };
        Buffer.compare = function compare(a, b) {
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                throw new TypeError("Arguments must be Buffers")
            }
            if (a === b) return 0;
            var x = a.length;
            var y = b.length;
            var i = 0;
            var len = Math.min(x, y);
            while (i < len) {
                if (a[i] !== b[i]) break;
                ++i
            }
            if (i !== len) {
                x = a[i];
                y = b[i]
            }
            if (x < y) return -1;
            if (y < x) return 1;
            return 0
        };
        Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "binary":
                case "base64":
                case "raw":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return true;
                default:
                    return false
            }
        };
        Buffer.concat = function concat(list, length) {
            if (!isArray(list)) throw new TypeError("list argument must be an Array of Buffers.");
            if (list.length === 0) {
                return new Buffer(0)
            } else if (list.length === 1) {
                return list[0]
            }
            var i;
            if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; i++) {
                    length += list[i].length
                }
            }
            var buf = new Buffer(length);
            var pos = 0;
            for (i = 0; i < list.length; i++) {
                var item = list[i];
                item.copy(buf, pos);
                pos += item.length
            }
            return buf
        };

        function byteLength(string, encoding) {
            if (typeof string !== "string") string = String(string);
            if (string.length === 0) return 0;
            switch (encoding || "utf8") {
                case "ascii":
                case "binary":
                case "raw":
                    return string.length;
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return string.length * 2;
                case "hex":
                    return string.length >>> 1;
                case "utf8":
                case "utf-8":
                    return utf8ToBytes(string).length;
                case "base64":
                    return base64ToBytes(string).length;
                default:
                    return string.length
            }
        }
        Buffer.byteLength = byteLength;
        Buffer.prototype.length = undefined;
        Buffer.prototype.parent = undefined;
        Buffer.prototype.toString = function toString(encoding, start, end) {
            var loweredCase = false;
            start = start | 0;
            end = end === undefined || end === Infinity ? this.length : end | 0;
            if (!encoding) encoding = "utf8";
            if (start < 0) start = 0;
            if (end > this.length) end = this.length;
            if (end <= start) return "";
            while (true) {
                switch (encoding) {
                    case "hex":
                        return hexSlice(this, start, end);
                    case "utf8":
                    case "utf-8":
                        return utf8Slice(this, start, end);
                    case "ascii":
                        return asciiSlice(this, start, end);
                    case "binary":
                        return binarySlice(this, start, end);
                    case "base64":
                        return base64Slice(this, start, end);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return utf16leSlice(this, start, end);
                    default:
                        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                        encoding = (encoding + "").toLowerCase();
                        loweredCase = true
                }
            }
        };
        Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
            if (this === b) return true;
            return Buffer.compare(this, b) === 0
        };
        Buffer.prototype.inspect = function inspect() {
            var str = "";
            var max = exports.INSPECT_MAX_BYTES;
            if (this.length > 0) {
                str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                if (this.length > max) str += " ... "
            }
            return "<Buffer " + str + ">"
        };
        Buffer.prototype.compare = function compare(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
            if (this === b) return 0;
            return Buffer.compare(this, b)
        };
        Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
            if (byteOffset > 2147483647) byteOffset = 2147483647;
            else if (byteOffset < -2147483648) byteOffset = -2147483648;
            byteOffset >>= 0;
            if (this.length === 0) return -1;
            if (byteOffset >= this.length) return -1;
            if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0);
            if (typeof val === "string") {
                if (val.length === 0) return -1;
                return String.prototype.indexOf.call(this, val, byteOffset)
            }
            if (Buffer.isBuffer(val)) {
                return arrayIndexOf(this, val, byteOffset)
            }
            if (typeof val === "number") {
                if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === "function") {
                    return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
                }
                return arrayIndexOf(this, [val], byteOffset)
            }

            function arrayIndexOf(arr, val, byteOffset) {
                var foundIndex = -1;
                for (var i = 0; byteOffset + i < arr.length; i++) {
                    if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
                        if (foundIndex === -1) foundIndex = i;
                        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
                    } else {
                        foundIndex = -1
                    }
                }
                return -1
            }
            throw new TypeError("val must be string, number or Buffer")
        };
        Buffer.prototype.get = function get(offset) {
            console.log(".get() is deprecated. Access using array indexes instead.");
            return this.readUInt8(offset)
        };
        Buffer.prototype.set = function set(v, offset) {
            console.log(".set() is deprecated. Access using array indexes instead.");
            return this.writeUInt8(v, offset)
        };

        function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
                length = remaining
            } else {
                length = Number(length);
                if (length > remaining) {
                    length = remaining
                }
            }
            var strLen = string.length;
            if (strLen % 2 !== 0) throw new Error("Invalid hex string");
            if (length > strLen / 2) {
                length = strLen / 2
            }
            for (var i = 0; i < length; i++) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (isNaN(parsed)) throw new Error("Invalid hex string");
                buf[offset + i] = parsed
            }
            return i
        }

        function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
        }

        function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length)
        }

        function binaryWrite(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length)
        }

        function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length)
        }

        function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
        }
        Buffer.prototype.write = function write(string, offset, length, encoding) {
            if (offset === undefined) {
                encoding = "utf8";
                length = this.length;
                offset = 0
            } else if (length === undefined && typeof offset === "string") {
                encoding = offset;
                length = this.length;
                offset = 0
            } else if (isFinite(offset)) {
                offset = offset | 0;
                if (isFinite(length)) {
                    length = length | 0;
                    if (encoding === undefined) encoding = "utf8"
                } else {
                    encoding = length;
                    length = undefined
                }
            } else {
                var swap = encoding;
                encoding = offset;
                offset = length | 0;
                length = swap
            }
            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;
            if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                throw new RangeError("attempt to write outside buffer bounds")
            }
            if (!encoding) encoding = "utf8";
            var loweredCase = false;
            for (;;) {
                switch (encoding) {
                    case "hex":
                        return hexWrite(this, string, offset, length);
                    case "utf8":
                    case "utf-8":
                        return utf8Write(this, string, offset, length);
                    case "ascii":
                        return asciiWrite(this, string, offset, length);
                    case "binary":
                        return binaryWrite(this, string, offset, length);
                    case "base64":
                        return base64Write(this, string, offset, length);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return ucs2Write(this, string, offset, length);
                    default:
                        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                        encoding = ("" + encoding).toLowerCase();
                        loweredCase = true
                }
            }
        };
        Buffer.prototype.toJSON = function toJSON() {
            return {
                type: "Buffer",
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        };

        function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
                return base64.fromByteArray(buf)
            } else {
                return base64.fromByteArray(buf.slice(start, end))
            }
        }

        function utf8Slice(buf, start, end) {
            var res = "";
            var tmp = "";
            end = Math.min(buf.length, end);
            for (var i = start; i < end; i++) {
                if (buf[i] <= 127) {
                    res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
                    tmp = ""
                } else {
                    tmp += "%" + buf[i].toString(16)
                }
            }
            return res + decodeUtf8Char(tmp)
        }

        function asciiSlice(buf, start, end) {
            var ret = "";
            end = Math.min(buf.length, end);
            for (var i = start; i < end; i++) {
                ret += String.fromCharCode(buf[i] & 127)
            }
            return ret
        }

        function binarySlice(buf, start, end) {
            var ret = "";
            end = Math.min(buf.length, end);
            for (var i = start; i < end; i++) {
                ret += String.fromCharCode(buf[i])
            }
            return ret
        }

        function hexSlice(buf, start, end) {
            var len = buf.length;
            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;
            var out = "";
            for (var i = start; i < end; i++) {
                out += toHex(buf[i])
            }
            return out
        }

        function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = "";
            for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
            }
            return res
        }
        Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;
            if (start < 0) {
                start += len;
                if (start < 0) start = 0
            } else if (start > len) {
                start = len
            }
            if (end < 0) {
                end += len;
                if (end < 0) end = 0
            } else if (end > len) {
                end = len
            }
            if (end < start) end = start;
            var newBuf;
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                newBuf = Buffer._augment(this.subarray(start, end))
            } else {
                var sliceLen = end - start;
                newBuf = new Buffer(sliceLen, undefined);
                for (var i = 0; i < sliceLen; i++) {
                    newBuf[i] = this[i + start]
                }
            }
            if (newBuf.length) newBuf.parent = this.parent || this;
            return newBuf
        };

        function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
            if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length")
        }
        Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 256)) {
                val += this[offset + i] * mul
            }
            return val
        };
        Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) {
                checkOffset(offset, byteLength, this.length)
            }
            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 256)) {
                val += this[offset + --byteLength] * mul
            }
            return val
        };
        Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset]
        };
        Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | this[offset + 1] << 8
        };
        Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] << 8 | this[offset + 1]
        };
        Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216
        };
        Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3])
        };
        Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 256)) {
                val += this[offset + i] * mul
            }
            mul *= 128;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val
        };
        Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);
            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 256)) {
                val += this[offset + --i] * mul
            }
            mul *= 128;
            if (val >= mul) val -= Math.pow(2, 8 * byteLength);
            return val
        };
        Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 128)) return this[offset];
            return (255 - this[offset] + 1) * -1
        };
        Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | this[offset + 1] << 8;
            return val & 32768 ? val | 4294901760 : val
        };
        Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | this[offset] << 8;
            return val & 32768 ? val | 4294901760 : val
        };
        Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24
        };
        Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]
        };
        Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4)
        };
        Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4)
        };
        Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8)
        };
        Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8)
        };

        function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError("buffer must be a Buffer instance");
            if (value > max || value < min) throw new RangeError("value is out of bounds");
            if (offset + ext > buf.length) throw new RangeError("index out of range")
        }
        Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
            var mul = 1;
            var i = 0;
            this[offset] = value & 255;
            while (++i < byteLength && (mul *= 256)) {
                this[offset + i] = value / mul & 255
            }
            return offset + byteLength
        };
        Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 255;
            while (--i >= 0 && (mul *= 256)) {
                this[offset + i] = value / mul & 255
            }
            return offset + byteLength
        };
        Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
            if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
            this[offset] = value;
            return offset + 1
        };

        function objectWriteUInt16(buf, value, offset, littleEndian) {
            if (value < 0) value = 65535 + value + 1;
            for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
                buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8
            }
        }
        Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value;
                this[offset + 1] = value >>> 8
            } else {
                objectWriteUInt16(this, value, offset, true)
            }
            return offset + 2
        };
        Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 8;
                this[offset + 1] = value
            } else {
                objectWriteUInt16(this, value, offset, false)
            }
            return offset + 2
        };

        function objectWriteUInt32(buf, value, offset, littleEndian) {
            if (value < 0) value = 4294967295 + value + 1;
            for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
                buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255
            }
        }
        Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset + 3] = value >>> 24;
                this[offset + 2] = value >>> 16;
                this[offset + 1] = value >>> 8;
                this[offset] = value
            } else {
                objectWriteUInt32(this, value, offset, true)
            }
            return offset + 4
        };
        Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 24;
                this[offset + 1] = value >>> 16;
                this[offset + 2] = value >>> 8;
                this[offset + 3] = value
            } else {
                objectWriteUInt32(this, value, offset, false)
            }
            return offset + 4
        };
        Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);
                checkInt(this, value, offset, byteLength, limit - 1, -limit)
            }
            var i = 0;
            var mul = 1;
            var sub = value < 0 ? 1 : 0;
            this[offset] = value & 255;
            while (++i < byteLength && (mul *= 256)) {
                this[offset + i] = (value / mul >> 0) - sub & 255
            }
            return offset + byteLength
        };
        Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);
                checkInt(this, value, offset, byteLength, limit - 1, -limit)
            }
            var i = byteLength - 1;
            var mul = 1;
            var sub = value < 0 ? 1 : 0;
            this[offset + i] = value & 255;
            while (--i >= 0 && (mul *= 256)) {
                this[offset + i] = (value / mul >> 0) - sub & 255
            }
            return offset + byteLength
        };
        Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
            if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
            if (value < 0) value = 255 + value + 1;
            this[offset] = value;
            return offset + 1
        };
        Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value;
                this[offset + 1] = value >>> 8
            } else {
                objectWriteUInt16(this, value, offset, true)
            }
            return offset + 2
        };
        Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 8;
                this[offset + 1] = value
            } else {
                objectWriteUInt16(this, value, offset, false)
            }
            return offset + 2
        };
        Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value;
                this[offset + 1] = value >>> 8;
                this[offset + 2] = value >>> 16;
                this[offset + 3] = value >>> 24
            } else {
                objectWriteUInt32(this, value, offset, true)
            }
            return offset + 4
        };
        Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
            if (value < 0) value = 4294967295 + value + 1;
            if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = value >>> 24;
                this[offset + 1] = value >>> 16;
                this[offset + 2] = value >>> 8;
                this[offset + 3] = value
            } else {
                objectWriteUInt32(this, value, offset, false)
            }
            return offset + 4
        };

        function checkIEEE754(buf, value, offset, ext, max, min) {
            if (value > max || value < min) throw new RangeError("value is out of bounds");
            if (offset + ext > buf.length) throw new RangeError("index out of range");
            if (offset < 0) throw new RangeError("index out of range")
        }

        function writeFloat(buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38)
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4
        }
        Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert)
        };
        Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert)
        };

        function writeDouble(buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308)
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8
        }
        Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert)
        };
        Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert)
        };
        Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;
            if (targetStart < 0) {
                throw new RangeError("targetStart out of bounds")
            }
            if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
            if (end < 0) throw new RangeError("sourceEnd out of bounds");
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start
            }
            var len = end - start;
            if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < len; i++) {
                    target[i + targetStart] = this[i + start]
                }
            } else {
                target._set(this.subarray(start, start + len), targetStart)
            }
            return len
        };
        Buffer.prototype.fill = function fill(value, start, end) {
            if (!value) value = 0;
            if (!start) start = 0;
            if (!end) end = this.length;
            if (end < start) throw new RangeError("end < start");
            if (end === start) return;
            if (this.length === 0) return;
            if (start < 0 || start >= this.length) throw new RangeError("start out of bounds");
            if (end < 0 || end > this.length) throw new RangeError("end out of bounds");
            var i;
            if (typeof value === "number") {
                for (i = start; i < end; i++) {
                    this[i] = value
                }
            } else {
                var bytes = utf8ToBytes(value.toString());
                var len = bytes.length;
                for (i = start; i < end; i++) {
                    this[i] = bytes[i % len]
                }
            }
            return this
        };
        Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
            if (typeof Uint8Array !== "undefined") {
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    return new Buffer(this).buffer
                } else {
                    var buf = new Uint8Array(this.length);
                    for (var i = 0, len = buf.length; i < len; i += 1) {
                        buf[i] = this[i]
                    }
                    return buf.buffer
                }
            } else {
                throw new TypeError("Buffer.toArrayBuffer not supported in this browser")
            }
        };
        var BP = Buffer.prototype;
        Buffer._augment = function _augment(arr) {
            arr.constructor = Buffer;
            arr._isBuffer = true;
            arr._set = arr.set;
            arr.get = BP.get;
            arr.set = BP.set;
            arr.write = BP.write;
            arr.toString = BP.toString;
            arr.toLocaleString = BP.toString;
            arr.toJSON = BP.toJSON;
            arr.equals = BP.equals;
            arr.compare = BP.compare;
            arr.indexOf = BP.indexOf;
            arr.copy = BP.copy;
            arr.slice = BP.slice;
            arr.readUIntLE = BP.readUIntLE;
            arr.readUIntBE = BP.readUIntBE;
            arr.readUInt8 = BP.readUInt8;
            arr.readUInt16LE = BP.readUInt16LE;
            arr.readUInt16BE = BP.readUInt16BE;
            arr.readUInt32LE = BP.readUInt32LE;
            arr.readUInt32BE = BP.readUInt32BE;
            arr.readIntLE = BP.readIntLE;
            arr.readIntBE = BP.readIntBE;
            arr.readInt8 = BP.readInt8;
            arr.readInt16LE = BP.readInt16LE;
            arr.readInt16BE = BP.readInt16BE;
            arr.readInt32LE = BP.readInt32LE;
            arr.readInt32BE = BP.readInt32BE;
            arr.readFloatLE = BP.readFloatLE;
            arr.readFloatBE = BP.readFloatBE;
            arr.readDoubleLE = BP.readDoubleLE;
            arr.readDoubleBE = BP.readDoubleBE;
            arr.writeUInt8 = BP.writeUInt8;
            arr.writeUIntLE = BP.writeUIntLE;
            arr.writeUIntBE = BP.writeUIntBE;
            arr.writeUInt16LE = BP.writeUInt16LE;
            arr.writeUInt16BE = BP.writeUInt16BE;
            arr.writeUInt32LE = BP.writeUInt32LE;
            arr.writeUInt32BE = BP.writeUInt32BE;
            arr.writeIntLE = BP.writeIntLE;
            arr.writeIntBE = BP.writeIntBE;
            arr.writeInt8 = BP.writeInt8;
            arr.writeInt16LE = BP.writeInt16LE;
            arr.writeInt16BE = BP.writeInt16BE;
            arr.writeInt32LE = BP.writeInt32LE;
            arr.writeInt32BE = BP.writeInt32BE;
            arr.writeFloatLE = BP.writeFloatLE;
            arr.writeFloatBE = BP.writeFloatBE;
            arr.writeDoubleLE = BP.writeDoubleLE;
            arr.writeDoubleBE = BP.writeDoubleBE;
            arr.fill = BP.fill;
            arr.inspect = BP.inspect;
            arr.toArrayBuffer = BP.toArrayBuffer;
            return arr
        };
        var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g;

        function base64clean(str) {
            str = stringtrim(str).replace(INVALID_BASE64_RE, "");
            if (str.length < 2) return "";
            while (str.length % 4 !== 0) {
                str = str + "="
            }
            return str
        }

        function stringtrim(str) {
            if (str.trim) return str.trim();
            return str.replace(/^\s+|\s+$/g, "")
        }

        function toHex(n) {
            if (n < 16) return "0" + n.toString(16);
            return n.toString(16)
        }

        function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];
            var i = 0;
            for (; i < length; i++) {
                codePoint = string.charCodeAt(i);
                if (codePoint > 55295 && codePoint < 57344) {
                    if (leadSurrogate) {
                        if (codePoint < 56320) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            leadSurrogate = codePoint;
                            continue
                        } else {
                            codePoint = leadSurrogate - 55296 << 10 | codePoint - 56320 | 65536;
                            leadSurrogate = null
                        }
                    } else {
                        if (codePoint > 56319) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            continue
                        } else if (i + 1 === length) {
                            if ((units -= 3) > -1) bytes.push(239, 191, 189);
                            continue
                        } else {
                            leadSurrogate = codePoint;
                            continue
                        }
                    }
                } else if (leadSurrogate) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    leadSurrogate = null
                }
                if (codePoint < 128) {
                    if ((units -= 1) < 0) break;
                    bytes.push(codePoint)
                } else if (codePoint < 2048) {
                    if ((units -= 2) < 0) break;
                    bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128)
                } else if (codePoint < 65536) {
                    if ((units -= 3) < 0) break;
                    bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
                } else if (codePoint < 2097152) {
                    if ((units -= 4) < 0) break;
                    bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
                } else {
                    throw new Error("Invalid code point")
                }
            }
            return bytes
        }

        function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; i++) {
                byteArray.push(str.charCodeAt(i) & 255)
            }
            return byteArray
        }

        function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; i++) {
                if ((units -= 2) < 0) break;
                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi)
            }
            return byteArray
        }

        function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str))
        }

        function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; i++) {
                if (i + offset >= dst.length || i >= src.length) break;
                dst[i + offset] = src[i]
            }
            return i
        }

        function decodeUtf8Char(str) {
            try {
                return decodeURIComponent(str)
            } catch (err) {
                return String.fromCharCode(65533)
            }
        }
    }, {
        "base64-js": 31,
        ieee754: 32,
        "is-array": 33
    }],
    31: [function(require, module, exports) {
        var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        (function(exports) {
            "use strict";
            var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
            var PLUS = "+".charCodeAt(0);
            var SLASH = "/".charCodeAt(0);
            var NUMBER = "0".charCodeAt(0);
            var LOWER = "a".charCodeAt(0);
            var UPPER = "A".charCodeAt(0);
            var PLUS_URL_SAFE = "-".charCodeAt(0);
            var SLASH_URL_SAFE = "_".charCodeAt(0);

            function decode(elt) {
                var code = elt.charCodeAt(0);
                if (code === PLUS || code === PLUS_URL_SAFE) return 62;
                if (code === SLASH || code === SLASH_URL_SAFE) return 63;
                if (code < NUMBER) return -1;
                if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
                if (code < UPPER + 26) return code - UPPER;
                if (code < LOWER + 26) return code - LOWER + 26
            }

            function b64ToByteArray(b64) {
                var i, j, l, tmp, placeHolders, arr;
                if (b64.length % 4 > 0) {
                    throw new Error("Invalid string. Length must be a multiple of 4")
                }
                var len = b64.length;
                placeHolders = "=" === b64.charAt(len - 2) ? 2 : "=" === b64.charAt(len - 1) ? 1 : 0;
                arr = new Arr(b64.length * 3 / 4 - placeHolders);
                l = placeHolders > 0 ? b64.length - 4 : b64.length;
                var L = 0;

                function push(v) {
                    arr[L++] = v
                }
                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
                    push((tmp & 16711680) >> 16);
                    push((tmp & 65280) >> 8);
                    push(tmp & 255)
                }
                if (placeHolders === 2) {
                    tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
                    push(tmp & 255)
                } else if (placeHolders === 1) {
                    tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
                    push(tmp >> 8 & 255);
                    push(tmp & 255)
                }
                return arr
            }

            function uint8ToBase64(uint8) {
                var i, extraBytes = uint8.length % 3,
                    output = "",
                    temp, length;

                function encode(num) {
                    return lookup.charAt(num)
                }

                function tripletToBase64(num) {
                    return encode(num >> 18 & 63) + encode(num >> 12 & 63) + encode(num >> 6 & 63) + encode(num & 63)
                }
                for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                    output += tripletToBase64(temp)
                }
                switch (extraBytes) {
                    case 1:
                        temp = uint8[uint8.length - 1];
                        output += encode(temp >> 2);
                        output += encode(temp << 4 & 63);
                        output += "==";
                        break;
                    case 2:
                        temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                        output += encode(temp >> 10);
                        output += encode(temp >> 4 & 63);
                        output += encode(temp << 2 & 63);
                        output += "=";
                        break
                }
                return output
            }
            exports.toByteArray = b64ToByteArray;
            exports.fromByteArray = uint8ToBase64
        })(typeof exports === "undefined" ? this.base64js = {} : exports)
    }, {}],
    32: [function(require, module, exports) {
        exports.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m, eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                nBits = -7,
                i = isLE ? nBytes - 1 : 0,
                d = isLE ? -1 : 1,
                s = buffer[offset + i];
            i += d;
            e = s & (1 << -nBits) - 1;
            s >>= -nBits;
            nBits += eLen;
            for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
            m = e & (1 << -nBits) - 1;
            e >>= -nBits;
            nBits += mLen;
            for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
            if (e === 0) {
                e = 1 - eBias
            } else if (e === eMax) {
                return m ? NaN : (s ? -1 : 1) * Infinity
            } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
        };
        exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c, eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                i = isLE ? 0 : nBytes - 1,
                d = isLE ? 1 : -1,
                s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
            value = Math.abs(value);
            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax
            } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--;
                    c *= 2
                }
                if (e + eBias >= 1) {
                    value += rt / c
                } else {
                    value += rt * Math.pow(2, 1 - eBias)
                }
                if (value * c >= 2) {
                    e++;
                    c /= 2
                }
                if (e + eBias >= eMax) {
                    m = 0;
                    e = eMax
                } else if (e + eBias >= 1) {
                    m = (value * c - 1) * Math.pow(2, mLen);
                    e = e + eBias
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                    e = 0
                }
            }
            for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
            e = e << mLen | m;
            eLen += mLen;
            for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
            buffer[offset + i - d] |= s * 128
        }
    }, {}],
    33: [function(require, module, exports) {
        var isArray = Array.isArray;
        var str = Object.prototype.toString;
        module.exports = isArray || function(val) {
            return !!val && "[object Array]" == str.call(val)
        }
    }, {}],
    34: [function(require, module, exports) {
        function EventEmitter() {
            this._events = this._events || {};
            this._maxListeners = this._maxListeners || undefined
        }
        module.exports = EventEmitter;
        EventEmitter.EventEmitter = EventEmitter;
        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;
        EventEmitter.defaultMaxListeners = 10;
        EventEmitter.prototype.setMaxListeners = function(n) {
            if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
            this._maxListeners = n;
            return this
        };
        EventEmitter.prototype.emit = function(type) {
            var er, handler, len, args, i, listeners;
            if (!this._events) this._events = {};
            if (type === "error") {
                if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                    er = arguments[1];
                    if (er instanceof Error) {
                        throw er
                    }
                    throw TypeError('Uncaught, unspecified "error" event.')
                }
            }
            handler = this._events[type];
            if (isUndefined(handler)) return false;
            if (isFunction(handler)) {
                switch (arguments.length) {
                    case 1:
                        handler.call(this);
                        break;
                    case 2:
                        handler.call(this, arguments[1]);
                        break;
                    case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        len = arguments.length;
                        args = new Array(len - 1);
                        for (i = 1; i < len; i++) args[i - 1] = arguments[i];
                        handler.apply(this, args)
                }
            } else if (isObject(handler)) {
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++) args[i - 1] = arguments[i];
                listeners = handler.slice();
                len = listeners.length;
                for (i = 0; i < len; i++) listeners[i].apply(this, args)
            }
            return true
        };
        EventEmitter.prototype.addListener = function(type, listener) {
            var m;
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            if (!this._events) this._events = {};
            if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
            if (!this._events[type]) this._events[type] = listener;
            else if (isObject(this._events[type])) this._events[type].push(listener);
            else this._events[type] = [this._events[type], listener];
            if (isObject(this._events[type]) && !this._events[type].warned) {
                var m;
                if (!isUndefined(this._maxListeners)) {
                    m = this._maxListeners
                } else {
                    m = EventEmitter.defaultMaxListeners
                }
                if (m && m > 0 && this._events[type].length > m) {
                    this._events[type].warned = true;
                    console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                    if (typeof console.trace === "function") {
                        console.trace()
                    }
                }
            }
            return this
        };
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        EventEmitter.prototype.once = function(type, listener) {
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            var fired = false;

            function g() {
                this.removeListener(type, g);
                if (!fired) {
                    fired = true;
                    listener.apply(this, arguments)
                }
            }
            g.listener = listener;
            this.on(type, g);
            return this
        };
        EventEmitter.prototype.removeListener = function(type, listener) {
            var list, position, length, i;
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            if (!this._events || !this._events[type]) return this;
            list = this._events[type];
            length = list.length;
            position = -1;
            if (list === listener || isFunction(list.listener) && list.listener === listener) {
                delete this._events[type];
                if (this._events.removeListener) this.emit("removeListener", type, listener)
            } else if (isObject(list)) {
                for (i = length; i-- > 0;) {
                    if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                        position = i;
                        break
                    }
                }
                if (position < 0) return this;
                if (list.length === 1) {
                    list.length = 0;
                    delete this._events[type]
                } else {
                    list.splice(position, 1)
                }
                if (this._events.removeListener) this.emit("removeListener", type, listener)
            }
            return this
        };
        EventEmitter.prototype.removeAllListeners = function(type) {
            var key, listeners;
            if (!this._events) return this;
            if (!this._events.removeListener) {
                if (arguments.length === 0) this._events = {};
                else if (this._events[type]) delete this._events[type];
                return this
            }
            if (arguments.length === 0) {
                for (key in this._events) {
                    if (key === "removeListener") continue;
                    this.removeAllListeners(key)
                }
                this.removeAllListeners("removeListener");
                this._events = {};
                return this
            }
            listeners = this._events[type];
            if (isFunction(listeners)) {
                this.removeListener(type, listeners)
            } else {
                while (listeners.length) this.removeListener(type, listeners[listeners.length - 1])
            }
            delete this._events[type];
            return this
        };
        EventEmitter.prototype.listeners = function(type) {
            var ret;
            if (!this._events || !this._events[type]) ret = [];
            else if (isFunction(this._events[type])) ret = [this._events[type]];
            else ret = this._events[type].slice();
            return ret
        };
        EventEmitter.listenerCount = function(emitter, type) {
            var ret;
            if (!emitter._events || !emitter._events[type]) ret = 0;
            else if (isFunction(emitter._events[type])) ret = 1;
            else ret = emitter._events[type].length;
            return ret
        };

        function isFunction(arg) {
            return typeof arg === "function"
        }

        function isNumber(arg) {
            return typeof arg === "number"
        }

        function isObject(arg) {
            return typeof arg === "object" && arg !== null
        }

        function isUndefined(arg) {
            return arg === void 0
        }
    }, {}],
    35: [function(require, module, exports) {
        if (typeof Object.create === "function") {
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                })
            }
        } else {
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function() {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor;
                ctor.prototype.constructor = ctor
            }
        }
    }, {}],
    36: [function(require, module, exports) {
        var process = module.exports = {};
        var queue = [];
        var draining = false;

        function drainQueue() {
            if (draining) {
                return
            }
            draining = true;
            var currentQueue;
            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                var i = -1;
                while (++i < len) {
                    currentQueue[i]()
                }
                len = queue.length
            }
            draining = false
        }
        process.nextTick = function(fun) {
            queue.push(fun);
            if (!draining) {
                setTimeout(drainQueue, 0)
            }
        };
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = "";
        process.versions = {};

        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.binding = function(name) {
            throw new Error("process.binding is not supported")
        };
        process.cwd = function() {
            return "/"
        };
        process.chdir = function(dir) {
            throw new Error("process.chdir is not supported")
        };
        process.umask = function() {
            return 0
        }
    }, {}],
    37: [function(require, module, exports) {
        module.exports = function isBuffer(arg) {
            return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function"
        }
    }, {}],
    38: [function(require, module, exports) {
        (function(process, global) {
            var formatRegExp = /%[sdj%]/g;
            exports.format = function(f) {
                if (!isString(f)) {
                    var objects = [];
                    for (var i = 0; i < arguments.length; i++) {
                        objects.push(inspect(arguments[i]))
                    }
                    return objects.join(" ")
                }
                var i = 1;
                var args = arguments;
                var len = args.length;
                var str = String(f).replace(formatRegExp, function(x) {
                    if (x === "%%") return "%";
                    if (i >= len) return x;
                    switch (x) {
                        case "%s":
                            return String(args[i++]);
                        case "%d":
                            return Number(args[i++]);
                        case "%j":
                            try {
                                return JSON.stringify(args[i++])
                            } catch (_) {
                                return "[Circular]"
                            }
                        default:
                            return x
                    }
                });
                for (var x = args[i]; i < len; x = args[++i]) {
                    if (isNull(x) || !isObject(x)) {
                        str += " " + x
                    } else {
                        str += " " + inspect(x)
                    }
                }
                return str
            };
            exports.deprecate = function(fn, msg) {
                if (isUndefined(global.process)) {
                    return function() {
                        return exports.deprecate(fn, msg).apply(this, arguments)
                    }
                }
                if (process.noDeprecation === true) {
                    return fn
                }
                var warned = false;

                function deprecated() {
                    if (!warned) {
                        if (process.throwDeprecation) {
                            throw new Error(msg)
                        } else if (process.traceDeprecation) {
                            console.trace(msg)
                        } else {
                            console.error(msg)
                        }
                        warned = true
                    }
                    return fn.apply(this, arguments)
                }
                return deprecated
            };
            var debugs = {};
            var debugEnviron;
            exports.debuglog = function(set) {
                if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || "";
                set = set.toUpperCase();
                if (!debugs[set]) {
                    if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                        var pid = process.pid;
                        debugs[set] = function() {
                            var msg = exports.format.apply(exports, arguments);
                            console.error("%s %d: %s", set, pid, msg)
                        }
                    } else {
                        debugs[set] = function() {}
                    }
                }
                return debugs[set]
            };

            function inspect(obj, opts) {
                var ctx = {
                    seen: [],
                    stylize: stylizeNoColor
                };
                if (arguments.length >= 3) ctx.depth = arguments[2];
                if (arguments.length >= 4) ctx.colors = arguments[3];
                if (isBoolean(opts)) {
                    ctx.showHidden = opts
                } else if (opts) {
                    exports._extend(ctx, opts)
                }
                if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                if (isUndefined(ctx.depth)) ctx.depth = 2;
                if (isUndefined(ctx.colors)) ctx.colors = false;
                if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                if (ctx.colors) ctx.stylize = stylizeWithColor;
                return formatValue(ctx, obj, ctx.depth)
            }
            exports.inspect = inspect;
            inspect.colors = {
                bold: [1, 22],
                italic: [3, 23],
                underline: [4, 24],
                inverse: [7, 27],
                white: [37, 39],
                grey: [90, 39],
                black: [30, 39],
                blue: [34, 39],
                cyan: [36, 39],
                green: [32, 39],
                magenta: [35, 39],
                red: [31, 39],
                yellow: [33, 39]
            };
            inspect.styles = {
                special: "cyan",
                number: "yellow",
                "boolean": "yellow",
                undefined: "grey",
                "null": "bold",
                string: "green",
                date: "magenta",
                regexp: "red"
            };

            function stylizeWithColor(str, styleType) {
                var style = inspect.styles[styleType];
                if (style) {
                    return "[" + inspect.colors[style][0] + "m" + str + "[" + inspect.colors[style][1] + "m"
                } else {
                    return str
                }
            }

            function stylizeNoColor(str, styleType) {
                return str
            }

            function arrayToHash(array) {
                var hash = {};
                array.forEach(function(val, idx) {
                    hash[val] = true
                });
                return hash
            }

            function formatValue(ctx, value, recurseTimes) {
                if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
                    var ret = value.inspect(recurseTimes, ctx);
                    if (!isString(ret)) {
                        ret = formatValue(ctx, ret, recurseTimes)
                    }
                    return ret
                }
                var primitive = formatPrimitive(ctx, value);
                if (primitive) {
                    return primitive
                }
                var keys = Object.keys(value);
                var visibleKeys = arrayToHash(keys);
                if (ctx.showHidden) {
                    keys = Object.getOwnPropertyNames(value)
                }
                if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
                    return formatError(value)
                }
                if (keys.length === 0) {
                    if (isFunction(value)) {
                        var name = value.name ? ": " + value.name : "";
                        return ctx.stylize("[Function" + name + "]", "special")
                    }
                    if (isRegExp(value)) {
                        return ctx.stylize(RegExp.prototype.toString.call(value), "regexp")
                    }
                    if (isDate(value)) {
                        return ctx.stylize(Date.prototype.toString.call(value), "date")
                    }
                    if (isError(value)) {
                        return formatError(value)
                    }
                }
                var base = "",
                    array = false,
                    braces = ["{", "}"];
                if (isArray(value)) {
                    array = true;
                    braces = ["[", "]"]
                }
                if (isFunction(value)) {
                    var n = value.name ? ": " + value.name : "";
                    base = " [Function" + n + "]"
                }
                if (isRegExp(value)) {
                    base = " " + RegExp.prototype.toString.call(value)
                }
                if (isDate(value)) {
                    base = " " + Date.prototype.toUTCString.call(value)
                }
                if (isError(value)) {
                    base = " " + formatError(value)
                }
                if (keys.length === 0 && (!array || value.length == 0)) {
                    return braces[0] + base + braces[1]
                }
                if (recurseTimes < 0) {
                    if (isRegExp(value)) {
                        return ctx.stylize(RegExp.prototype.toString.call(value), "regexp")
                    } else {
                        return ctx.stylize("[Object]", "special")
                    }
                }
                ctx.seen.push(value);
                var output;
                if (array) {
                    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys)
                } else {
                    output = keys.map(function(key) {
                        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array)
                    })
                }
                ctx.seen.pop();
                return reduceToSingleString(output, base, braces)
            }

            function formatPrimitive(ctx, value) {
                if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
                if (isString(value)) {
                    var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                    return ctx.stylize(simple, "string")
                }
                if (isNumber(value)) return ctx.stylize("" + value, "number");
                if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
                if (isNull(value)) return ctx.stylize("null", "null")
            }

            function formatError(value) {
                return "[" + Error.prototype.toString.call(value) + "]"
            }

            function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                var output = [];
                for (var i = 0, l = value.length; i < l; ++i) {
                    if (hasOwnProperty(value, String(i))) {
                        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true))
                    } else {
                        output.push("")
                    }
                }
                keys.forEach(function(key) {
                    if (!key.match(/^\d+$/)) {
                        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true))
                    }
                });
                return output
            }

            function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                var name, str, desc;
                desc = Object.getOwnPropertyDescriptor(value, key) || {
                    value: value[key]
                };
                if (desc.get) {
                    if (desc.set) {
                        str = ctx.stylize("[Getter/Setter]", "special")
                    } else {
                        str = ctx.stylize("[Getter]", "special")
                    }
                } else {
                    if (desc.set) {
                        str = ctx.stylize("[Setter]", "special")
                    }
                }
                if (!hasOwnProperty(visibleKeys, key)) {
                    name = "[" + key + "]"
                }
                if (!str) {
                    if (ctx.seen.indexOf(desc.value) < 0) {
                        if (isNull(recurseTimes)) {
                            str = formatValue(ctx, desc.value, null)
                        } else {
                            str = formatValue(ctx, desc.value, recurseTimes - 1)
                        }
                        if (str.indexOf("\n") > -1) {
                            if (array) {
                                str = str.split("\n").map(function(line) {
                                    return "  " + line
                                }).join("\n").substr(2)
                            } else {
                                str = "\n" + str.split("\n").map(function(line) {
                                    return "   " + line
                                }).join("\n")
                            }
                        }
                    } else {
                        str = ctx.stylize("[Circular]", "special")
                    }
                }
                if (isUndefined(name)) {
                    if (array && key.match(/^\d+$/)) {
                        return str
                    }
                    name = JSON.stringify("" + key);
                    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                        name = name.substr(1, name.length - 2);
                        name = ctx.stylize(name, "name")
                    } else {
                        name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                        name = ctx.stylize(name, "string")
                    }
                }
                return name + ": " + str
            }

            function reduceToSingleString(output, base, braces) {
                var numLinesEst = 0;
                var length = output.reduce(function(prev, cur) {
                    numLinesEst++;
                    if (cur.indexOf("\n") >= 0) numLinesEst++;
                    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1
                }, 0);
                if (length > 60) {
                    return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1]
                }
                return braces[0] + base + " " + output.join(", ") + " " + braces[1]
            }

            function isArray(ar) {
                return Array.isArray(ar)
            }
            exports.isArray = isArray;

            function isBoolean(arg) {
                return typeof arg === "boolean"
            }
            exports.isBoolean = isBoolean;

            function isNull(arg) {
                return arg === null
            }
            exports.isNull = isNull;

            function isNullOrUndefined(arg) {
                return arg == null
            }
            exports.isNullOrUndefined = isNullOrUndefined;

            function isNumber(arg) {
                return typeof arg === "number"
            }
            exports.isNumber = isNumber;

            function isString(arg) {
                return typeof arg === "string"
            }
            exports.isString = isString;

            function isSymbol(arg) {
                return typeof arg === "symbol"
            }
            exports.isSymbol = isSymbol;

            function isUndefined(arg) {
                return arg === void 0
            }
            exports.isUndefined = isUndefined;

            function isRegExp(re) {
                return isObject(re) && objectToString(re) === "[object RegExp]"
            }
            exports.isRegExp = isRegExp;

            function isObject(arg) {
                return typeof arg === "object" && arg !== null
            }
            exports.isObject = isObject;

            function isDate(d) {
                return isObject(d) && objectToString(d) === "[object Date]"
            }
            exports.isDate = isDate;

            function isError(e) {
                return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error)
            }
            exports.isError = isError;

            function isFunction(arg) {
                return typeof arg === "function"
            }
            exports.isFunction = isFunction;

            function isPrimitive(arg) {
                return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined"
            }
            exports.isPrimitive = isPrimitive;
            exports.isBuffer = require("./support/isBuffer");

            function objectToString(o) {
                return Object.prototype.toString.call(o)
            }

            function pad(n) {
                return n < 10 ? "0" + n.toString(10) : n.toString(10)
            }
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            function timestamp() {
                var d = new Date;
                var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
                return [d.getDate(), months[d.getMonth()], time].join(" ")
            }
            exports.log = function() {
                console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments))
            };
            exports.inherits = require("inherits");
            exports._extend = function(origin, add) {
                if (!add || !isObject(add)) return origin;
                var keys = Object.keys(add);
                var i = keys.length;
                while (i--) {
                    origin[keys[i]] = add[keys[i]]
                }
                return origin
            };

            function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop)
            }
        }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
        "./support/isBuffer": 37,
        _process: 36,
        inherits: 35
    }],
    39: [function(require, module, exports) {
        (function(global) {
            var component = require("../lib");
            var componentName = "TaskRouter";
            (function(root) {
                if (typeof define === "function" && define.amd) {
                    define([], function() {
                        return component
                    })
                } else {
                    root.Twilio = root.Twilio || function Twilio() {};
                    root.Twilio[componentName] = component
                }
            })(window || global || this)
        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {
        "../lib": 8
    }]
}, {}, [39]);