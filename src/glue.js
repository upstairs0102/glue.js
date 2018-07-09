/* 
 * Glue.js Javascript Lirary v0.2.0 (Beta)
 * 2018/7/6
 */

(function(){
    
function Glue(){

    var self = this;

    this._source = {
        /* 
            TEMPLATE_NAME: {
                "html": PATH,
                "js": PATH
            }
        */
    };
    
    this._loadTask = (function(){
        var currentView = "";
        var _successCallbackDict = {}; // 'ELEMENT_NAME': 'CALLBACK_FUNCTION' 
        var _errorCallbackDict = {}; // 'ELEMENT_NAME': 'CALLBACK_FUNCTION' 
        var _doneCallbackDict = {}; // 'ELEMENT_NAME': 'CALLBACK_FUNCTION' 
        var reset = function(){
            currentView = "body"; //預設貼到<body>
            _successCallbackDict = {};
            _errorCallbackDict = {};
            _doneCallbackDict = {};
        }
        
        return {
            load: function(elName, templateName){
                if(!elName){
                    elName = "body"; 
                }
                currentView = elName;
                var templateDict = self._source[templateName];
                doLoad(currentView, templateDict);                 
            },
            set success(callback){
                _successCallbackDict[currentView] = callback;
            },
            set error(callback){
                _errorCallbackDict[currentView] = callback;
            },
            set done(callback){
                _doneCallbackDict[currentView] = callback;
            },
            //glue.load(..).success(callback)
            doSuccess: function(_view){
                currentView = "";
                if(_successCallbackDict[_view]){
                    _successCallbackDict[_view]();
                    _successCallbackDict[_view] = null;
                }
            },
            //glue.load(..)...error(callback)
            doError: function(_view){
                if(_errorCallbackDict[_view]){
                    _errorCallbackDict[_view]();
                    _errorCallbackDict[_view] = null;
                }
            },
            //glue.load(..)...done(callback)
            doDone: function(_view){
                _successCallbackDict[_view] = null;
                _errorCallbackDict[_view] = null;
                if(_doneCallbackDict[_view]){
                    _doneCallbackDict[_view]();
                    _doneCallbackDict[_view] = null;
                }
            }
        }
                
    }())
    
    this._load = function(elName, templateName){
        this._loadTask.load(elName, templateName);
    }
        
    this.GlueError = function(message) {
        this.name = '[Glue] Error';
        this.message = message;
    }
    this.GlueError.prototype = new Error();
    this.GlueError.prototype.constructor = this.GlueError;
    this.GlueError.prototype.showError = function() {
        return this.name + ': "' + this.message + '"';
    }
        
    function doLoad(elName, templates){
        var con = document.getElementsByTagName(elName)[0];
        /*try {
            if (!con) {
                throw new this.GlueError("Load failed, Element '"+elName+"' not exist");
            }
        } catch(e){
            console.log(e.showError())
            return;
        }*/

        var htmlPath = templates['html'];
        var jsPath = templates['js'];
            
        getHtmlString(htmlPath, function(status, responseText){
            if(status != 200){
                self._loadTask.doError(elName); //glue.load(..)...error() callback
            }

            con.style.display = 'none';
            con.innerHTML = responseText;
            if(jsPath != null){
                con.insertAdjacentHTML('beforeend', '<script src="'+jsPath+'" type="text/javascript"></script>');
            }
            
            runScripts(con, function(){
                con.style.display = '';

                self._loadTask.doSuccess(elName); //glue.load(..)...success() callback
                self._loadTask.doDone(elName); //glue.load(..)...done() callback
            });
            
        });

        function getHtmlString(htmlPath, callback){
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (e) { 
                if (xhr.readyState == 4) {
                    
                    callback(xhr.status, xhr.responseText);
                }
            }
            xhr.open("GET", htmlPath, true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();
        }
        
        //執行element當中的script
        function runScripts(element, runScriptsCallback) {
           
            // runs an array of async functions in sequential order
            function seq (arr, callback, index) {
              // first call, without an index
              if (typeof index === 'undefined') {
                index = 0
              }
              //none script tags
              if(arr.length == 0){
                  runScriptsCallback();
                  return;
              }
              arr[index](function () {
                index++
                if (index === arr.length) {
                  callback()
                } else {
                  seq(arr, callback, index)
                }
              })
            }
    
            // trigger DOMContentLoaded
            function scriptsDone () {
              var DOMContentLoadedEvent = document.createEvent('Event')
              DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
              document.dispatchEvent(DOMContentLoadedEvent)
              
              if(runScriptsCallback){
                runScriptsCallback();
              }
            }
    
            /* script runner
             */
    
            function insertScript ($script, callback) {
              var s = document.createElement('script')
              s.type = 'text/javascript'
              if ($script.src) {
                s.onload = callback
                s.onerror = callback
                s.src = $script.src
              } else {
                s.textContent = $script.innerText
              }
    
              // re-insert the script tag so it executes.
              document.head.appendChild(s)
    
              // clean-up
              $script.parentNode.removeChild($script)
    
              // run the callback immediately for inline scripts
              if (!$script.src) {
                callback()
              }
            }
    
            // https://html.spec.whatwg.org/multipage/scripting.html
            var runScriptTypes = [
              'application/javascript',
              'application/ecmascript',
              'application/x-ecmascript',
              'application/x-javascript',
              'text/ecmascript',
              'text/javascript',
              'text/javascript1.0',
              'text/javascript1.1',
              'text/javascript1.2',
              'text/javascript1.3',
              'text/javascript1.4',
              'text/javascript1.5',
              'text/jscript',
              'text/livescript',
              'text/x-ecmascript',
              'text/x-javascript'
            ]
    
            function runScripts ($container) {
              // get scripts tags from a node
              var $scripts = $container.querySelectorAll('script')
              var runList = []
              var typeAttr
    
              [].forEach.call($scripts, function ($script) {
                typeAttr = $script.getAttribute('type')
    
                // only run script tags without the type attribute
                // or with a javascript mime attribute value
                if (!typeAttr || runScriptTypes.indexOf(typeAttr) !== -1) {
                  runList.push(function (callback) {
                    insertScript($script, callback)
                  })
                }
              })
    
              // insert the script tags sequentially
              // to preserve execution order
              seq(runList, scriptsDone);
                
            }
            
            runScripts(element);
        }
    }
    
}

//---- public ---- 

Glue.prototype = {
    source: function(c){
        try {
            if (!c){
                throw new this.GlueError("Necessary parameters missing. \nSyntax hints: \nglue.source(\n    TEMPLATE_NAME: { \n      html: '..', \n      js: '..'\n    })");
            }
        } catch(e){
            console.log(e.showError())
            return;
        }
        
        this._source = c;
    }
}

Glue.prototype.load = function(elName, templateName){
    try {
        if (!elName || !templateName) {
            throw new this.GlueError("Necessary parameters missing. \nSyntax hints: \nglue.load('HTML_ELEMENT_NAME', 'TEMPLATE_NAME')");
        }else if (!this._source[templateName]) {
            throw new this.GlueError("Template '"+templateName+"' not exist");
        }else if (!document.getElementsByTagName(elName)[0]){
            throw new this.GlueError("Load failed, Element '"+elName+"' not exist");
        }
    } catch(e){
        console.log(e.showError())
        return;
    }

    this._load(elName, templateName);

    return this;
}

Glue.prototype.success = function(callback){
    this._loadTask.success = callback;

    return this;
}

Glue.prototype.error = function(callback){
    this._loadTask.error = callback;

    return this;
}

Glue.prototype.done = function(callback){
    this._loadTask.done = callback;

    return this;
}

var glue = new Glue();

window.glue = glue;

}())


