document.addEventListener('DOMContentLoaded', function() {
	Array.prototype.slice.call(document.querySelectorAll('.reorder')).forEach(initDragList)
});

function initDragList(el) {
	if (!el.classList.contains('reorder')) el.classList.add('reorder')
	var scroller_x = null, scroller_y = null
	var scroll_x = false
	var scroll_y = false
	el.addEventListener('mousedown', function(event) {
		if (event.button > 1) return
		var target = event.target
		while (target.parentNode && target.parentNode.classList && !target.parentNode.classList.contains('reorder')) {
			if (['select', 'input', 'textarea', 'label'].indexOf(target.tagName.toLowerCase()) != -1) return false
			target = target.parentNode
		}
		var list = target.parentNode
		var st = list.currentStyle || getComputedStyle(list, '')
		if (st.position == '' || st.position == 'static') {
			list.style.position = 'relative'
		}
		var index = -1
		for (var i = 0; i < list.children.length; i++) {
			if (list.children[i] == event.target) {
				index = i
				break
			}
		}
		window.drag = { el: target, coords: [event.clientX, event.clientY], index: index }
		target.style.position = 'relative'
		target.style.cursor = 'move'
		target.style.mozUserSelect = 'none'
		target.style.webkitUserSelect = 'none'
		target.style.zIndex = '10'
		fireEvent(target, 'mousemove')
		if (list.classList.contains('use-placeholder')) {
			createPlaceholder(target)
		}
		var self = target
		Array.prototype.slice.call(target.parentNode.children).forEach(function(el) {
			if (!el.coords) el.coords = [el.getBoundingClientRect().left - el.parentNode.getBoundingClientRect().left, el.getBoundingClientRect().top - el.parentNode.getBoundingClientRect().top]
			el.style.mozUserSelect = 'none'
			el.style.webkitUserSelect = 'none'
			if (el != self) el.style.transition = 'all 0.2s ease'
			if (!el.classList.contains('placeholder')) {
				el.style.position = 'relative'
				el.style.left = '0px'
				el.style.top = '0px'
			}
		})
	})
	if (!window.draginit) window.addEventListener('mousemove', function(event) {
		if (!window.drag || window.drag.original_el) return
		if ((scroll_x || scroll_y) && (!scroller_x || !scroller_y)) {
			if (!window.drag.targetElement) checkPosition()
		}
		window.drag.el.style.cursor = 'move'
		window.drag.el.style.left = (event.clientX - window.drag.coords[0]) + 'px'
		window.drag.el.style.top = (event.clientY - window.drag.coords[1]) + 'px'
		if (!window.drag.original_el) updateSiblings(event)
		
		var counter = 0
		var lists = Array.prototype.slice.call(document.querySelectorAll('.reorder'))
		lists = lists.filter(function(list) {
			return list.getAttribute('xdrag-group') !== null && list.getAttribute('xdrag-group') == window.drag.el.parentNode.getAttribute('xdrag-group')
		})
		var active_lists = []
		lists.forEach(function(el) {
			var x = window.drag.el.getBoundingClientRect().left + window.drag.el.clientWidth * 0.75
			var y = window.drag.el.getBoundingClientRect().top + window.drag.el.clientHeight * 0.75
			
			if (x > el.getBoundingClientRect().left &&
			    x - window.drag.el.clientWidth * 0.5 < el.getBoundingClientRect().left + el.clientWidth &&
				y > el.getBoundingClientRect().top &&
				y - window.drag.el.clientHeight * 0.5 < el.getBoundingClientRect().top + el.clientHeight) {
				  active_lists.push(el)
				  if (el == window.drag.el.parentNode) return
				  if (window.drag.active_lists && window.drag.active_lists.indexOf(el) != -1) {
				  	return
				  }
				  if (counter > 0) return
				  if (window.drag.el.parentNode.lastElementChild.classList.contains('placeholder')) {
				  	//window.drag.el.parentNode.lastElementChild.style.opacity = '0.56'
				  	window.drag.el.parentNode.lastElementChild.style.display = 'none'
				  	window.drag.el.parentNode.removeChild(window.drag.el.parentNode.lastElementChild)
				  }
				  //window.drag.coords = [ event.clientX, event.clientY ]
				  
				  initDropTarget(el, x - el.getBoundingClientRect().left, y - el.getBoundingClientRect().top - window.drag.el.clientHeight)
				  
				  var i = 0
				  while (i < el.children.length-1) {
				  	if (el.children[i].style.top != '0px') {
						el.children[i].style.top = '0px'
						break
					}
				  	i++
				  }
				  
				  var old_rect = window.drag.el.getBoundingClientRect()
				  
				  var new_el = window.drag.el.cloneNode(true)
				  window.drag.original_el = window.drag.el
				  window.drag.el.style.display = 'none'
				  window.drag.el.style.left = ''
				  window.drag.el.style.top = ''
				  window.drag.el.style.position = ''
				  window.drag.el = new_el
				  
				  if (i < el.children.length) el.insertBefore(window.drag.el, el.children[i])
				  else el.appendChild(window.drag.el)
				  
				  window.drag.index = i
				  
				  counter++
				  
				  var self = window.drag.el
				  self.style.left = '0px'
				  self.style.top = '0px'
				  
				  Array.prototype.slice.call(el.children).forEach(function(el) {
				  	el.coords = [el.getBoundingClientRect().left - el.parentNode.getBoundingClientRect().left, el.getBoundingClientRect().top - el.parentNode.getBoundingClientRect().top]
				  	el.style.mozUserSelect = 'none'
				  	el.style.webkitUserSelect = 'none'
				  	if (el != self) el.style.transition = 'all 0.2s ease'
				  	if (!el.classList.contains('placeholder') && el != self) {
				  		el.style.position = 'relative'
				  		el.style.left = '0px'
				  		el.style.top = '0px'
				  	}
				  })
				  
				  createPlaceholder(window.drag.el)
				  
				  var delta = [event.clientX - old_rect.left, event.clientY - old_rect.top]
				  
				  var p = el.lastElementChild
				  var rect = p.getBoundingClientRect()
				  var left = window.drag.el.getBoundingClientRect().left - p.getBoundingClientRect().left
				  var top = window.drag.el.getBoundingClientRect().top - p.getBoundingClientRect().top
				  
				  window.drag.el.style.left = old_rect.left - rect.left + 'px'
				  window.drag.el.style.top = old_rect.top - rect.top + 'px'
				  
				  window.drag.currentList = el
				  
				  window.drag.coords = [rect.left + event.clientX - old_rect.left, rect.top + event.clientY - old_rect.top]
				  
				  fireEvent(document, 'transfer', { fromList: window.drag.original_el.parentNode, toList: window.drag.el.parentNode })
				  
				  setTimeout(function() {
				  	if (window.drag) delete window.drag.original_el
				  }, 50)
			} else {
				if (el.lastElementChild && el.lastElementChild.classList.contains('placeholder')) {
					for (var i = 0; i < el.children.length; i++) {
						el.children[i].style.left = '0px'
						el.children[i].style.top = '0px'
					}
					el.removeChild(el.lastElementChild)
					el.style.position = ''
					/* if (window.drag.el.parentNode.lastElementChild.classList.contains('placeholder')) {
				       window.drag.el.parentNode.lastElementChild.style.opacity = ''
				    } */
				}
			}
		})
		window.drag.lists = lists
		if (active_lists.length == 0) {
			active_lists.push(window.drag.currentList)
		}
		window.drag.active_lists = active_lists
		if (counter == 0) delete window.drag.targetElement
	})
	if (!window.draginit) window.addEventListener('mouseup', function(event) {
		if (!window.drag) return
		if (!window.drag.abort) updatePosition()
		//window.drag.el.style.position = ''
		window.drag.el.style.cursor = ''
		window.drag.el.style.mozUserSelect = ''
		window.drag.el.style.webkitUserSelect = ''
		window.drag.el.style.zIndex = ''
		//window.drag.el.style.left = ''
		//window.drag.el.style.top = ''
		var lists = window.drag.lists.length ? window.drag.lists : [window.drag.el.parentNode]
		lists.forEach(function(list) {
			Array.prototype.slice.call(list.children).forEach(function(el) {
				if (el != window.drag.el && !el.classList.contains('placeholder')) {
					el.style.position = ''
					el.style.left = ''
					el.style.top = ''
					el.style.transition = ''
				}
				if (el.style.display == 'none') {
					el.parentNode.removeChild(el)
				}
				el.style.mozUserSelect = ''
				el.style.webkitUserSelect = ''
				delete el.coords
			})
			list.style.position = ''
		})
		delete window.drag
	})
	window.draginit = true
	
	function checkPosition() {
		var offset = 25, t = offset * offset
		if (scroll_x && !scroller_x) {
			if (window.drag.delta.left < offset && window.drag.delta.right > offset) {
				t = (window.drag.delta.left + 1) * offset - 10
				scroller_x = setTimeout(sx, t, -1)
			} else if (window.drag.delta.right < offset && window.drag.delta.left > offset) {
				t = (window.drag.delta.right + 1) * offset - 10
				scroller_x = setTimeout(sx, t, +1)
			}
		}
		if (scroll_y && !scroller_y) {
			if (window.drag.delta.top < offset && window.drag.delta.bottom > offset) {
				t = (window.drag.delta.top + 1) * offset - 10
				scroller_y = setTimeout(sy, t, -1)
			} else if (window.drag.delta.bottom < offset && window.drag.delta.top > offset) {
				t = (window.drag.delta.bottom + 1) * offset - 10
				scroller_y = setTimeout(sy, t, +1)
			}
		}
	}
	function sx(delta) {
		if (!window.drag) {
			scroller_x = null
			return
		}
		var el = window.drag.el.parentNode
		window.drag.scroll_delta[0] += delta
		el.parentNode.scrollLeft = el.scrollLeft + delta
		scroller_x = null
		checkPosition()
	}
	function sy(delta) {
		if (!window.drag) {
			scroller_y = null
			return
		}
		var el = window.drag.el.parentNode
		window.drag.scroll_delta[1] += delta
		el.scrollTop = el.scrollTop + delta
		scroller_y = null
		checkPosition()
	}
}

function updateSiblings(event) {
	if (!window.drag) return
	if (window.drag.swapping) return
	window.drag.swapping = true
	var el = window.drag.el
	var list = el.parentNode
	var dx = el.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft
	var dy = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
	var x = event.clientX - window.drag.coords[0]
	var y = event.clientY - window.drag.coords[1]

	if (x < 0 && !list.lock_x) {
		var el0 = list.firstElementChild
		var w = el.clientWidth
		var pos = 0
		while (el0 && el0 != el) {
			var dx0 = el0.coords[0]
			if (dx0 >= dx) {
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.left = dx0 + 'px'
				}
				break
			}
			if (dx0 < dx && dx <= dx0 + el0.clientWidth / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginRight) + parseInt(st.marginLeft) - parseInt(st0.marginLeft)
				if (el0.style.left == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.left = el0.clientWidth + (!isNaN(gap) ? gap : 0) + 'px'
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.left = dx0 + 'px'
				}
				break
			} else {
				el0.style.left = '0px'
			}
			el0 = el0.nextElementSibling
			pos++
		}
	}
	if (x > 0 && !list.lock_x) {
		var el0 = list.lastElementChild
		if (el0.classList.contains('placeholder')) {
			el0 = el0.previousElementSibling
		}
		var w = el.clientWidth
		var pos = list.children.length-1
		while (el0 && el0 != el) {
			var dx0 = el0.coords[0]
			if (dx0 <= dx) {
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.left = dx0 + 'px'
				}
				break
			}
			if (dx0 > dx && (dx + w) >= dx0 + el0.clientWidth / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginRight) + parseInt(st.marginLeft)
				if (el0.style.left == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.left = -el0.clientWidth + (!isNaN(gap) ? -gap : 0) + 'px'
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.left = dx0 + 'px'
				}
				break
			} else {
				el0.style.left = '0px'
			}
			el0 = el0.previousElementSibling
			pos--
		}
	}
	if (y < 0) {
		var el0 = list.firstElementChild
		var h = el.clientHeight
		var pos = 0
		while (el0 && el0 != el) {
			var dy0 = el0.coords[1]
			if (dy0 >= dy) {
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.top = dy0 + 'px'
				}
				break
			}
			if (dy0 < dy && dy <= dy0 + el0.clientHeight / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginBottom) + parseInt(st.marginTop)
				if (el0.style.top == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.top = el0.clientHeight + (!isNaN(gap) ? gap : 0) + 'px'
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.top = dy0 + 'px'
				}
				break
			} else {
				el0.style.top = '0px'
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.top = el.coords[1] + 'px'
				}
			}
			el0 = el0.nextElementSibling
			pos++
		}
	}
	if (y > 0) {
		var el0 = list.lastElementChild
		if (el0.classList.contains('placeholder')) {
			el0 = el0.previousElementSibling
		}
		var h = el.clientHeight
		var pos = list.children.length-1
		while (el0 && el0 != el) {
			var dy0 = el0.coords[1]
			if (dy0 <= dy) {
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.top = dy0 + 'px'
				}
				break
			}
			if (dy0 > dy && (dy + h) >= dy0 + el0.clientHeight / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginBottom) + parseInt(st.marginTop)
				if (el0.style.top == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.top = -el0.clientHeight + (!isNaN(gap) ? -gap : 0) + 'px'
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.top = dy0 + 'px'
				}
				break
			} else {
				el0.style.top = '0px'
				if (list.lastElementChild.classList.contains('placeholder')) {
					list.lastElementChild.style.top = el.coords[1] + 'px'
				}
			}
			el0 = el0.previousElementSibling
			pos--
		}
	}
	window.drag.swapping = false
}

function updatePosition() {
	if (!window.drag) return
	var el = window.drag.el
	var list = el.parentNode
	var dx = el.getBoundingClientRect().left - list.getBoundingClientRect().left
	var dy = el.getBoundingClientRect().top - list.getBoundingClientRect().top
	var x = parseInt(el.style.left)
	var y = parseInt(el.style.top)

	if (x < 0 && !list.lock_x) {
		var el0 = list.firstElementChild
		var pos = 0
		if (el0 && el0 != el && el0.coords[0] != el.coords[0]) {
			var w = el.clientWidth
			while (el0 && el0 != el) {
				var dx0 = el0.coords[0]
				if (dx <= dx0 + el0.clientWidth / 2) {
					list.insertBefore(el, el0)
					el.style.left = (dx - dx0) + 'px'
					fireEvent(el.parentNode, 'reordercomplete', { from: window.drag.index, to: pos })
					break
				}
				el0 = el0.nextElementSibling
				pos++
			}
		}
	}
	if (x > 0 && !list.lock_x) {
		var el0 = list.lastElementChild
		var pos = list.children.length-1
		if (el0.classList.contains('placeholder')) {
			el0 = el0.previousElementSibling
			pos--
		}
		if (el0 && el0 != el && el0.coords[0] != el.coords[0]) {
			var w = el.clientWidth
			while (el0 && el0 != el) {
				var dx0 = el0.coords[0]
				if ((dx + w) >= dx0 + el0.clientWidth / 2) {
					el0 = el0.nextElementSibling
					if (el0) list.insertBefore(el, el0)
					else list.appendChild(el)
					el.style.left = (dx - dx0) + 'px'
					fireEvent(el.parentNode, 'reordercomplete', { from: window.drag.index, to: pos })
					break
				}
				el0 = el0.previousElementSibling
				pos--
			}
		}
	}
	if (y < 0) {
		var el0 = list.firstElementChild
		var pos = 0
		if (el0 && el0 != el && el0.coords[1] != el.coords[1]) {
			var h = el.clientHeight
			while (el0 && el0 != el) {
				var dy0 = el0.coords[1]
				if (dy <= dy0 + el0.clientHeight / 2) {
					list.insertBefore(el, el0)
					el.style.top = (dy - dy0) + 'px'
					fireEvent(el.parentNode, 'reordercomplete', { from: window.drag.index, to: pos })
					break
				}
				el0 = el0.nextElementSibling
				pos++
			}
		}
	}
	if (y > 0) {
		var el0 = list.lastElementChild
		var pos = list.children.length-1
		if (el0.classList.contains('placeholder')) {
			el0 = el0.previousElementSibling
			pos--
		}
		if (el0 && el0 != el && el0.coords[1] != el.coords[1]) {
			var h = el.clientHeight
			while (el0 && el0 != el) {
				var dy0 = el0.coords[1]
				if ((dy + h) >= dy0 + el0.clientHeight / 2) {
					el0 = el0.nextElementSibling
					if (el0) list.insertBefore(el, el0)
					else list.appendChild(el)
					el.style.top = (dy - dy0) + 'px'
					el.style.transition = 'all 0.15s ease'
					fireEvent(el.parentNode, 'reordercomplete', { from: window.drag.index, to: pos })
					break
				}
				el0 = el0.previousElementSibling
				pos--
			}
		}
	}
	if ((el.style.left != '0px' || el.style.top != '0px') && !el.classList.contains('placeholder')) {
		moveToPosition(el)
	}
	
	setTimeout(function() {
		if (list.lastElementChild && list.lastElementChild.classList.contains('placeholder')) {
			list.removeChild(list.lastElementChild)
		}
	}, 300)
	
	if (el.parentNode.ondragend) {
		el.parentNode.ondragend.call(el.parentNode)
	}
}

function moveToPosition(el) {
	el.style.transition = 'all 0.15s ease'
	el.style.left = '0px'
	el.style.top = '0px'
	setTimeout(function() {
		el.style.transition = ''
		el.style.position = ''
		el.style.left = ''
		el.style.top = ''
	}, 200)
}

function createPlaceholder(target) {
	var list = target.parentNode
	var p = document.createElement('div')
	p.style.position = 'absolute'
	p.style.zIndex = '-1'
	p.classList.add('placeholder')
	
	st = target.currentStyle || getComputedStyle(target, '')
	
	p.style.borderLeftWidth = st.borderLeftWidth
	p.style.borderRightWidth = st.borderRightWidth
	p.style.borderTopWidth = st.borderTopWidth
	p.style.borderBottomWidth = st.borderBottomWidth
	
	p.style.width = target.clientWidth + 'px'
	p.style.height = target.clientHeight + 'px'
	p.style.left = list.lock_x ? list.children[0].offsetLeft : target.offsetLeft + 'px'
	p.style.top =  list.lock_y ? list.children[0].offsetTop  : target.offsetTop + 'px'
	
	list.appendChild(p)
	
	var st2 = p.currentStyle || getComputedStyle(p, '')
	p.style.borderColor = st2.backgroundColor || 'transparent'
	
	return p
}

function initDropTarget(el, x, y) {
	if (!el.children.length) return
	window.drag.targetElement = el
	if (el.lastElementChild.classList.contains('placeholder')) return
	
	for (var i = 0; i < el.children.length; i++) {
		if (el.children[i].style.display == 'none') {
			el.removeChild(el.children[i])
			i--
		}
	}
	
	var st = el.currentStyle || getComputedStyle(el, '')
	if (st.position == '' || st.position == 'static') {
		el.style.position = 'relative'
	}
	y -= el.children[0].clientHeight / 2 + 10
	st = el.children[0].currentStyle || getComputedStyle(el.children[0], '')
	var gap = !isNaN(parseInt(st.marginBottom)) ? parseInt(st.marginBottom) : 0
	
	var flag = false
	
	var x = el.children[0].offsetLeft
	for (var i = 1; i < el.children.length; i++) {
		if (el.children[i].offsetLeft != x) {
			flag = true
			break
		}
	}
	el.lock_x = !flag
	
	flag = false
	
	for (var i = el.children.length-2; i >= 0; i--) {
		el.children[i].style.position = 'relative'
		if (i == 0 && el.children[i].offsetLeft >= x || i > 0 && el.children[i-1].offsetLeft < x && el.children[i].offsetLeft >= x || el.children[i].offsetLeft > x) {
			flag = true
		} else {
			el.children[i].style.left = '0px'
		}
		if (!flag && (i == 0 && el.children[i].offsetTop >= y || i > 0 && el.children[i-1].offsetTop < y && el.children[i].offsetTop >= y)) {
			el.children[i].style.top = '1px'
			flag = true
		} else if (el.children[i].offsetTop > y) {
			el.children[i].style.top = '1px'
		} else {
			el.children[i].style.top = '0px'
		}
	}
}

function getDescendant(elem, selector) {
	return Array.prototype.slice.call(elem.querySelectorAll(selector)).filter(function(el) {
		return el.parentNode === elem
	})[0]
}

function fireEvent(element, type, data) {
	var event
	if (type == 'click' && element.click) {
		element.click()
	}
	else if (document.createEvent) {
		event = document.createEvent("HTMLEvents")
		event.initEvent(type, true, true)
		event.eventName = type
		event.detail = data
		element.dispatchEvent(event)
	} else {
		event = document.createEventObject()
		event.eventName = type
		event.eventType = type
		event.detail = data
		element.fireEvent("on" + event.eventType, event)
	}
}
