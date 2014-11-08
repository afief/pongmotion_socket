window.addEventListener("load", init);


function init() {
    showPage("page1");
    var arah = 0;
    var socket;
    var kode = "";

    var arPemain = new Array();

    function socketInit() {
        showPage("page1");
        socket = new io();

        socket.on("connect", function() {
            console.log("connected");
        });

        socket.on("register success", function(obj) {
            console.log("register success", obj.kode);
            kode = obj.kode;

            showPage("page5");            
        });
        socket.on("register fail", function(msg) {
            console.log("register fail");
            alert(msg);
            showPage("page1");
        });
        socket.on("player new", function(obj) {
            console.log("player new", obj);
        });
        socket.on("player play", function(obj) {
            console.log("player play", obj.kode);

            if (obj.kode == kode) {
                showPage("page2");
            }
        });
        socket.on("player lose", function(obj) {
            console.log("player lose", obj.kode);

            if (obj.kode == kode) {
                showPage("page4");
            }
        });
        socket.on("player remove", function(obj) {
            console.log("player remove", obj);

            if (obj.kode == kode) {
                showPage("page4");
            }
        });

        socket.on('disconnect', function(){
            console.log("DISCONNECT"); //ganti alert
            showPage("page1");

            window.setTimeout(function() {
                console.log("reconnect");

                socketInit();
            }, 3000);
        });

        socket.on('error', function() {
            alert("game error");
            showPage("page1");
        });
    }
    socketInit();

    btGameOverPlay.addEventListener("click", function() {
        showPage("page1");
    });
    btMasuk.addEventListener("click", masukHandler);
    function masukHandler() {
        var gamecode = inputCode.value;
        var userName = inputName.value;

        if (gamecode.length != 5) {
            alert("kode game yang benar adalah 5 digit");
        } else {
            socket.emit("register player", {as: "client", kode: gamecode, name: userName});
        }
        console.log(socket);
        console.log(gamecode);
    }

    function absorbEvent_(event) {
        if (event.type == "touchstart") {
            if (event.currentTarget.id == "btLeft")
                arah = -1;
            if (event.currentTarget.id == "btRight")
                arah = 1;

            loopSend();
        } else if (event.type == "touchend") {
            arah = 0;
        }

        var e = event || window.event;
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }

    function onMouseDown(event) {
        if (event.currentTarget.id == "btLeft")
            arah = -1;
        if (event.currentTarget.id == "btRight")
            arah = 1;
        loopSend();
    }
    function onMouseUp(event) {
        arah = 0;
    }

    function preventLongPressMenu(node) {
        node.onmousedown = absorbEvent_;
        node.ontouchstart = absorbEvent_;
        node.ontouchmove = absorbEvent_;
        node.ontouchend = absorbEvent_;
        node.ontouchcancel = absorbEvent_;

        node.addEventListener("mousedown", onMouseDown);
        node.addEventListener("mouseup", onMouseUp)
        node.addEventListener("mouseout", onMouseUp)
    }
    
    preventLongPressMenu(document.getElementById('btLeft'));
    preventLongPressMenu(document.getElementById('btRight'));
    

    function loopSend() {
        if (arah != 0) {
            socket.emit("move", arah);
            window.requestAnimationFrame(loopSend);
        }
    }
}

function showPage(_id) {
    var els = document.getElementsByClassName("page");
    for (var i = 0; i < els.length; i++) {
        els[i].style.display = "none";
    }
    document.getElementById(_id).style.display = "block";
}

