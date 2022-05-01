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
		while (target.parentNode && !target.parentNode.classList.contains('reorder')) {
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
			p.style.left = target.offsetLeft + 'px'
			p.style.top = target.offsetTop + 'px'
			
			list.appendChild(p)
			
			var st2 = p.currentStyle || getComputedStyle(p, '')
			p.style.borderColor = st2.backgroundColor || 'transparent'
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
		if (!window.drag) return
		if ((scroll_x || scroll_y) && (!scroller_x || !scroller_y)) {
			checkPosition()
		}
		window.drag.el.style.cursor = 'move'
		window.drag.el.style.left = (event.clientX - window.drag.coords[0]) + 'px'
		window.drag.el.style.top = (event.clientY - window.drag.coords[1]) + 'px'
		updateSiblings()
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
		Array.prototype.slice.call(window.drag.el.parentNode.children).forEach(function(el) {
			if (el != window.drag.el && !el.classList.contains('placeholder')) {
				el.style.position = ''
				el.style.left = ''
				el.style.top = ''
				el.style.transition = ''
			}
			el.style.mozUserSelect = ''
			el.style.webkitUserSelect = ''
			delete el.coords
		})
		el.parentNode.style.position = ''
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

function updateSiblings() {
	if (!window.drag) return
	if (window.drag.swapping) return
	window.drag.swapping = true
	var el = window.drag.el
	var list = el.parentNode
	var dx = el.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft
	var dy = el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
	var x = parseInt(el.style.left)
	var y = parseInt(el.style.top)

	if (x < 0) {
		var el0 = list.firstElementChild
		var w = el.clientWidth
		var pos = 0
		while (el0 && el0 != el) {
			var dx0 = el0.coords[0]
			if (dx0 >= dx) {
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.left = dx0 + 'px'
				}
				break
			}
			if (dx0 < dx && dx <= dx0 + el0.clientWidth / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginRight) + parseInt(st.marginLeft) - parseInt(st0.marginLeft)
				if (el0.style.left == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.left = el0.clientWidth + (!isNaN(gap) ? gap : 0) + 'px'
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.left = dx0 + 'px'
				}
				break
			} else {
				el0.style.left = '0px'
			}
			el0 = el0.nextElementSibling
			pos++
		}
	}
	if (x > 0) {
		var el0 = list.lastElementChild
		if (el0.classList.contains('placeholder')) {
			el0 = el0.previousElementSibling
		}
		var w = el.clientWidth
		var pos = list.children.length-1
		while (el0 && el0 != el) {
			var dx0 = el0.coords[0]
			if (dx0 <= dx) {
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.left = dx0 + 'px'
				}
				break
			}
			if (dx0 > dx && (dx + w) >= dx0 + el0.clientWidth / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginRight) + parseInt(st.marginLeft)
				if (el0.style.left == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.left = -el0.clientWidth + (!isNaN(gap) ? -gap : 0) + 'px'
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.left = dx0 + 'px'
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
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.top = dy0 + 'px'
				}
				break
			}
			if (dy0 < dy && dy <= dy0 + el0.clientHeight / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginBottom) + parseInt(st.marginTop)
				if (el0.style.top == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.top = el0.clientHeight + (!isNaN(gap) ? gap : 0) + 'px'
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.top = dy0 + 'px'
				}
				break
			} else {
				el0.style.top = '0px'
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.top = el.coords[1] + 'px'
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
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.top = dy0 + 'px'
				}
				break
			}
			if (dy0 > dy && (dy + h) >= dy0 + el0.clientHeight / 2) {
				var st0 = el0.currentStyle || getComputedStyle(el0, '')
				var st = el.currentStyle || getComputedStyle(el, '')
				var gap = parseInt(st0.marginBottom) + parseInt(st.marginTop)
				if (el0.style.top == '0px') fireEvent(el0.parentNode, 'reorder', { from: window.drag.index, to: pos })
				el0.style.top = -el0.clientHeight + (!isNaN(gap) ? -gap : 0) + 'px'
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.top = dy0 + 'px'
				}
				break
			} else {
				el0.style.top = '0px'
				if (list.lastChild.classList.contains('placeholder')) {
					list.lastChild.style.top = el.coords[1] + 'px'
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
	
	setTimeout(function() {
		if (list.lastChild.classList.contains('placeholder')) {
			list.removeChild(list.lastChild)
		}
	}, 300)

	if (x < 0) {
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
	if (x > 0) {
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
