layout = window.layout || {};
var locate = window.location;
layout.protocol = locate.protocol;
var href = locate.href;
if (href.indexOf("debugger")!==-1) layout.debugger = true;
var uri = new URI(href);
var redirectTo = uri.getData("redirectTo");
var option = uri.getData("option");

layout.desktop = layout;
layout.session = layout.session || {};
COMMON.DOM.addReady(function(){
    COMMON.AjaxModule.load("/x_desktop/res/framework/mootools/plugin/mBox.Notice.js", null, false);
    COMMON.AjaxModule.load("/x_desktop/res/framework/mootools/plugin/mBox.Tooltip.js", null, false);

    dd.ready(function() {
        COMMON.setContentPath("/x_desktop");
        COMMON.AjaxModule.load("mwf", function () {
            MWF.defaultPath = "/x_desktop" + MWF.defaultPath;
            MWF.loadLP("zh-cn");

            // MWF.require("MWF.widget.Mask", null, false);
            // layout.mask = new MWF.widget.Mask({"style": "desktop"});
            // layout.mask.load();

            MWF.require("MWF.xDesktop.Layout", function () {
                MWF.require("MWF.xDesktop.Authentication", null, false);

                (function () {
                    layout.load = function () {
                        var uri = href.toURI();
                        MWF.require("MWF.xDesktop.Actions.RestActions", function () {
                            var action = new MWF.xDesktop.Actions.RestActions("", "x_organization_assemble_authentication", "");
                            action.getActions = function (actionCallback) {
                                this.actions = {
                                    "info": {"uri": "/jaxrs/zhengwudingding/info", "method": "POST"},
                                    "auth": {"uri": "/jaxrs/zhengwudingding/code/{code}"}
                                };
                                if (actionCallback) actionCallback();
                            };
                            action.invoke({
                                "name": "info", "async": true, "data": {"url": href}, "success": function (json) {

                                    var _config = json.data;
                                    dd.config({
                                        agentId: _config.agentid,
                                        corpId: _config.corpId,
                                        timeStamp: _config.timeStamp,
                                        nonceStr: _config.nonceStr,
                                        signature: _config.signature,
                                        jsApiList: ['runtime.info']
                                    });
                                    //dd.ready(function() {
                                    dd.biz.navigation.setTitle({
                                        title: ''
                                    });
                                    // dd.runtime.info({
                                    //     onSuccess : function(info) {
                                    //         logger.e('runtime info: ' + JSON.stringify(info));
                                    //     },
                                    //     onFail : function(err) {
                                    //         logger.e('fail: ' + JSON.stringify(err));
                                    //     }
                                    // });
                                    dd.runtime.permission.requestAuthCode({

                                        corpId: _config.corpId,
                                        onSuccess: function (info) {
                                            action.invoke({
                                                "name": "auth",
                                                "async": true,
                                                "parameter": {"code": info.code},
                                                "success": function (json) {
                                                    if (redirectTo){
                                                        (redirectTo+"&option="+option).toURI().go();
                                                    }else{
                                                        "appMobile.html?app=process.TaskCenter".toURI().go();
                                                    }

                                                }.bind(this),
                                                "failure": function (xhr, text, error) {
                                                    "appMobile.html?app=process.TaskCenter".toURI().go();
                                                }.bind(this)
                                            });
                                        }.bind(this),
                                        onFail: function (err) {
                                        }
                                    });
                                    //});

                                }.bind(this), "failure": function (xhr, text, error) {
                                }.bind(this)
                            });
                        });
                    };

                    layout.isAuthentication = function () {
                        layout.authentication = new MWF.xDesktop.Authentication({
                            "onLogin": layout.load.bind(layout)
                        });

                        var returnValue = true;
                        this.authentication.isAuthenticated(function (json) {
                            this.user = json.data;
                            layout.session.user = json.data;
                        }.bind(this), function () {
                            this.authentication.loadLogin(this.node);
                            returnValue = false;
                        }.bind(this));
                        return returnValue;
                    };

                    layout.notice = function (content, type, target, where, offset) {
                        if (!where) where = {"x": "right", "y": "top"};
                        if (!target) target = this.content;
                        if (!type) type = "ok";
                        var noticeTarget = target || $(document.body);
                        var off = offset;
                        if (!off) {
                            off = {
                                x: 10,
                                y: where.y.toString().toLowerCase() == "bottom" ? 10 : 10
                            };
                        }

                        new mBox.Notice({
                            type: type,
                            position: where,
                            move: false,
                            target: noticeTarget,
                            delayClose: (type == "error") ? 10000 : 5000,
                            offset: off,
                            content: content
                        });
                    };

                    MWF.getJSON("res/config/config.json", function (config) {
                        layout.config = config;
                        MWF.xDesktop.getServiceAddress(layout.config, function (service, center) {
                            layout.serviceAddressList = service;
                            layout.centerServer = center;
                            layout.load();
                        }.bind(this));
                        //layout.getServiceAddress(function(){
                        //    layout.load();
                        //});
                    });

                })();

            });
        });
    });
});