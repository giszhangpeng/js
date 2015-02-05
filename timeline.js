!function(){
	"allow click select time and mousemove select time";
	"allow resize to select year or month or week";
	"allow prev and next to select time";
	"allow run to play with time auto move";
	window.omot = window.omot || {};
	
	//global string init used to remove hard code 
	var timelineClassName = "timeline_element";
	var activeClassName = "timeline_ele_active";
	var mousemove = "mousemove";
	var mousedown = "mousedown";
	var mouseup = "mouseup";
	var px = "px";
	var eResize = "e-resize";
	var defaulty = "default";
	var space = "";
	var oneSpace = " ";
	var on = "on";
	var unselectable = "unselectable";
	var onselectstart = "onselectstart";
	var returnFalse = "return false";
	var domDiv = "div";
	  
	//dom body to be processed mousemove and mouseup event
	var body;

	//global class add remove and judge functions
	function addClass(element, value ){ 
		if (!element.className){ 
		    element.className = value; 
		}else { 
		    newClassName = element.className; 
		    newClassName+= oneSpace; 
		    newClassName+= value ; 
		    element.className = newClassName; 
		} 
	} 
	function hasClass(element,value){
		var names = element.className;
	    if(!names) return false;
	    if(names.indexOf(value) < 0) return false;
	    return true;
	}
	function removeClass(element,value){
		var names = element.className;
		if(!names) return;
		if(names.indexOf(value) < 0) return;
		element.className = names.replace(value,space);
	}
	
	//define dom events and attributes set get, in compatiable with main browsers
	omot.dom = {
		bindEvent: function(node,type,func){
			if(node.addEventListener){
				node.addEventListener(type,func,false);
			}else if(node.attachEvent){
				node.attachEvent(on+type,func);
			}else{
				node[on+type] = func;
			}
		},
		getEvent:function(event){
			return event || window.event;
		},
		getTarget:function(event){
			return event.target || event.srcElement;
		},
		//get or set innerText from dom 
		text:function(dom,str){
			if(str !== undefined && str !== null){
				if(dom.innerText !== undefined) dom.innerText = str;
				else dom.textContent = str;
			}
			return dom.innerText || dom.textContent;
		}
	};

	//start timeline module
	omot.Timeline = function(data,attributes,func){
		
		//marker if element allowed dragging
		//if elements length larger than timeline container length allowDrag is true
		//else allowDrag is false
		this.allowDrag = false;
		  
		//marker if is dragging state
		this.isDragging = false;
		  
		//discriminate move or click
		this.isMousemove = false;

		//marker mouse position
		this.mousepos = 0;
		
		//max load number of timeline element
		this.maxDisplayNum = 0;
		
		//storage former selected text to judge if need update selected text
		this.formerText = space;
		
		/***
		 * @parameter
		 * user passed in data 
		 * data:{timeList:[2014.1,2014.5]}
		 */
		this.timeList = data.timeList;

		/***
		 * @parameter
		 * timeline Object with id
		 */
		this.timelineObj = document.getElementById(attributes && attributes.id);

		/***
		 * @parameter
		 * timeline element width without border
		 */
		this.eleWidth = attributes.eleWidth;

		/***
		 * @parameter 
		 * user define the callback function that return selected time string
		 */
		this.callback = func;

		this.initialize();
	}
	
	/***
	 * Method init timeline module
	 * @parameter data
	 * format: {timeList:["2014.1","2014.2","2014.3"]}
	 * @parameter callback
	 * function that get the selected time string
	 */
	omot.Timeline.prototype.initialize = function initialize(){
		// init body if undefined
		if(!body)  body = document.body;
		var containerWidth = this.timelineObj.offsetWidth;
		this.maxDisplayNum = Math.floor(containerWidth/this.eleWidth + 1);
		
		this.timelineObj.setAttribute(unselectable, on);
		this.timelineObj.setAttribute(onselectstart,returnFalse);
		
		if(this.timeList.length >= this.maxDisplayNum){
			this.allowDrag = true;
		}
		this.loadElements();
		this.regTimelineMousedown();
		this.regTimelineMousemove();
		this.regTimeLineMouseup();
		this.regBodyMousemove();
		this.regBodyMouseup();
	}
	
	omot.Timeline.prototype.regTimelineMousedown = function regTimelineMousedown(){
		var _this = this;
		omot.dom.bindEvent(this.timelineObj,mousedown,function(e){
			e = omot.dom.getEvent(e);
		    _this.isDragging = _this.allowDrag;
		    if(e.pageX){
		        _this.mousepos = e.pageX;
		    }else{
		        _this.mousepos = e.clientX + _this.timelineObj.scrollLeft - _this.timelineObj.clientLeft;
		    }
		});
	}
	omot.Timeline.prototype.regTimelineMousemove = function regTimelineMousemove(){
		var _this = this;
		omot.dom.bindEvent(this.timelineObj,mousemove,function(e){
			e = omot.dom.getEvent(e);
		    if(_this.isDragging){
		        var currentpos;
		        if(e.pageX){
		            currentpos = e.pageX;
		        }else{
		            currentpos = e.clientX + _this.timelineObj.scrollLeft - _this.timelineObj.clientLeft;
		        }
		        var offset = currentpos - _this.mousepos;
		        if(offset !== 0) _this.isMousemove = true;
		        _this.mousepos = currentpos;
		        _this.rebuildElements(offset);
		    }
		});
	}
	omot.Timeline.prototype.regTimeLineMouseup = function regTimeLineMouseup(){
		var _this = this;
		omot.dom.bindEvent(this.timelineObj,mouseup,function(e){
			e = omot.dom.getEvent(e);
			var target = omot.dom.getTarget(e);
			var element = null;
		    if(_this.isDragging){
			//set cetner element
		       if(_this.isMousemove){
				  element = _this.computeActiveClass();
				  if(_this.formerText !== omot.dom.text(element)){
					  _this.formerText = omot.dom.text(element);
					  _this.callback(_this.formerText);
				  }
		       }else{
		          _this.setActiveClass(target);
		          _this.moveSelected2Center(target);
		          if(_this.formerText !== omot.dom.text(target)){
		        	  _this.formerText = omot.dom.text(target);
					  _this.callback(_this.formerText);
				  }
		       }
		       _this.isMousemove = false;
			   _this.isDragging = false;
		    }else{
		    	_this.setActiveClass(target);
		    	if(_this.formerText !== omot.dom.text(target)){
		            _this.formerText = omot.dom.text(target);
					_this.callback(_this.formerText);
				}
		    }
		    _this.reloadElements(element || target);
		    element = null;
		});
	}
	omot.Timeline.prototype.regBodyMousemove = function regBodyMousemove(){
		var _this = this;
		omot.dom.bindEvent(body,mousemove,function(e){
			e = omot.dom.getEvent(e);
		    if(_this.isDragging){
		    	this.style.cursor=eResize;
		        var currentpos;
		        if(e.pageX){
		            currentpos = e.pageX;
		        }else{
		            currentpos = e.clientX + _this.timelineObj.scrollLeft - _this.timelineObj.clientLeft;
		        }
		        var offset = currentpos - _this.mousepos;
		        _this.mousepos = currentpos;
		        _this.rebuildElements(offset);
		    }else{
		        this.style.cursor = defaulty;
		    }
		});
	}
	omot.Timeline.prototype.regBodyMouseup = function regBodyMouseup(){
		var _this = this;
		omot.dom.bindEvent(body,mouseup,function(e){
			e = omot.dom.getEvent(e);
			var element = null;
		    if(_this.isDragging){
		    	element = _this.computeActiveClass();
		        _this.isDragging = false;
		        if(_this.formerText !== omot.dom.text(element)){
		            _this.formerText = omot.dom.text(element);
					_this.callback(_this.formerText);
				}
		        _this.reloadElements(element || omot.dom.getTarget(e));
		        element = null;
		    }
		});	
	}
	omot.Timeline.prototype.rebuildElements = function rebuildElements(offset){
		var elements = this.timelineObj.children;
	      
	    var first = elements[0];
	    var last = elements[elements.length-1];
	    if(first.offsetLeft + offset > 0){
	        return;
	    }
	    if(last.offsetLeft + offset < this.timelineObj.offsetWidth-last.offsetWidth){
	        return;
	    }
	      
	    for(var i = 0; i < elements.length; i++){
	        elements[i].style.left = elements[i].offsetLeft + offset + px;
	    }
	}
	omot.Timeline.prototype.computeActiveClass = function computeActiveClass(){
		var element = null;
		var elements = this.timelineObj.children;
		var width = elements.length > 0 && elements[0].offsetWidth;
		var center = this.timelineObj.offsetWidth/2 + this.timelineObj.clientLeft;
		for(var i = 0; i < elements.length; i++){
	        if(elements[i].offsetLeft < center && elements[i].offsetLeft+width >= center){
	            if(!hasClass(elements[i],activeClassName)){
	                addClass(elements[i],activeClassName);
	            }
	            element = elements[i];
	        }else{
	            if(hasClass(elements[i],activeClassName)){
	                removeClass(elements[i],activeClassName);
	            }
	        }
	    }
		return element;
	}

	omot.Timeline.prototype.setActiveClass = function setActiveClass(element){
		var elements = this.timelineObj.children;
		for(var i = 0; i < elements.length; i++){
			removeClass(elements[i],activeClassName);
		}
		addClass(element,activeClassName);
	}
	
	omot.Timeline.prototype.moveSelected2Center = function moveSelected2Center(element){
		var elements = this.timelineObj.children;
		var center = this.timelineObj.offsetWidth/2 + this.timelineObj.clientLeft;
	    var offset = center - element.offsetLeft + this.eleWidth/2;
	    var first = elements[0];
	    var last = elements[elements.length-1];
	    if(first.offsetLeft + offset > 0){
	        offset = 0 - first.offsetLeft;
	    }
	    if(last.offsetLeft + offset < this.timelineObj.offsetWidth-last.offsetWidth){
	        offset = this.timelineObj.offsetWidth - last.offsetWidth - last.offsetLeft;
	    }
	    for(var i = 0; i < elements.length; i++){
	        elements[i].style.left = elements[i].offsetLeft + offset + px;
	    } 
	}	
	
	/***
	 * Method loadElements 
	 * load timeline element dom at first time 
	 */
	omot.Timeline.prototype.loadElements = function loadElements(){
		//avoid loading all elements 
		var loadNum =  this.timeList.length < 2*this.maxDisplayNum ? this.timeList.length : 2*this.maxDisplayNum;
		for(var i = 0; i < loadNum; i++){
			var strTime = this.timeList[this.timeList.length+i-loadNum];
			var left = this.timelineObj.offsetWidth-this.eleWidth*(loadNum-i);
			
			var div = document.createElement(domDiv);
			addClass(div,timelineClassName);
			div.setAttribute(unselectable, on);
			div.setAttribute(onselectstart,returnFalse);
			
			div.style.left = left + px;
			omot.dom.text(div,strTime);
			
			this.timelineObj.appendChild(div);
		}
		var element = this.computeActiveClass();
		this.formerText = omot.dom.text(element);
		this.callback(this.formerText);
	}
	/***
	 * Method reloadElements
	 * reload timeline element dom as mousemove or click
	 * @parameter target:current active element
	 */
	omot.Timeline.prototype.reloadElements = function reloadElements(target){
		if(this.allowDrag){
			var strTime = omot.dom.text(target);
			//position in source timelist
			var pos = 0;
			for(var i = 0; i < this.timeList.length; i++){
				if(strTime === this.timeList[i]){
					pos = i;
					break;
				}
			}
			this.reloadLeft(pos,target);
			this.reloadRight(pos,target);
		}
	}
	omot.Timeline.prototype.reloadLeft = function reloadLeft(pos,target){
		
		//position in HTML dom
		var elePos = 0;
		var elements = this.timelineObj.children;
		for(var i = 0; i < elements.length; i++){
			if(elements[i] === target){
				elePos = i;
				break;
			}
		}
		//process left load 3/2maxDisplayNum elements
		var needNum = Math.floor(this.maxDisplayNum*3/2);
		
		//lack adequate elements, complete the left
		if(elePos < needNum){
			var replenishNum = needNum-elePos;
			
			//consider source data list boundary
			replenishNum = pos - needNum > 0 ? replenishNum : pos-elePos;
			var currentLeftEle = elements[0];
			for(var i = 0; i < replenishNum; i++){
				var strTime = this.timeList[pos-elePos-replenishNum+i];
				var left = currentLeftEle.offsetLeft-this.eleWidth*(replenishNum-i);
				var div = document.createElement(domDiv);
				addClass(div,timelineClassName);
				div.setAttribute(unselectable, on);
				div.setAttribute(onselectstart,returnFalse);
				
				div.style.left = left + px;

				omot.dom.text(div,strTime);
				this.timelineObj.insertBefore(div,currentLeftEle);
			}
		//beyond the max elements number delete 
		}else{
			var deleteNum = elePos - needNum;
			
			//except 0
			if(deleteNum){
			  for(var i = 0; i < deleteNum; i++){
				  this.timelineObj.removeChild(elements[0]);
			  }	
			}
		}
	}
	omot.Timeline.prototype.reloadRight = function reloadRight(pos,target){
		
		//position in HTML dom
		var elePos = 0;
		var elements = this.timelineObj.children;
		for(var i = 0; i < elements.length; i++){
			if(elements[i] === target){
				elePos = i;
				break;
			}
		}
		
		//process left load 3/2maxDisplayNum elements
		var needNum = Math.floor(this.maxDisplayNum*3/2);
		
		var elements = this.timelineObj.children;
		var eleMax = elements.length;
		//lack adequate elements, complete the right
		if(eleMax - elePos <= needNum){
			var replenishNum = needNum - eleMax + elePos + 1;
			
			var dataMax = this.timeList.length;
			//consider source data list boundary
			replenishNum = dataMax - pos - needNum > 0 ? replenishNum : (dataMax-pos-1)-(eleMax-elePos-1);
			var currentLeftEle = elements[eleMax-1];
			for(var i = pos+eleMax-elePos; i < replenishNum+pos+eleMax-elePos; i++){
				var strTime = this.timeList[i];
				var left = currentLeftEle.offsetLeft+this.eleWidth*(i-(pos+eleMax-elePos)+1);
				var div = document.createElement(domDiv);
				addClass(div,timelineClassName);
				div.setAttribute(unselectable, on);
				div.setAttribute(onselectstart,returnFalse);
				
				div.style.left = left + px;
				
				omot.dom.text(div,strTime);
				this.timelineObj.appendChild(div);
			}
		//beyond the max elements number delete 
		}else{
			var deleteNum = eleMax - elePos - needNum - 1;
			
			//except 0
			if(deleteNum){
			  for(var i = 0; i < deleteNum; i++){
				  this.timelineObj.removeChild(elements[elements.length-1]);
			  }	
			}
		}
	}
}();
