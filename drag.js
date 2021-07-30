document.addEventListener('DOMContentLoaded', function() {
	[].slice.call(document.querySelectorAll('.reorder')).forEach(initDragList)
});

function initDragList(el) {
	if (!el.classList.contains('reorder')) el.classList.add('reorder')
	el.addEventListener('mousedown', function(event) {
		if (event.button > 1) return
		var target = event.target
		while (target.parentNode && !target.parentNode.classList.contains('reorder')) {
			if (['select', 'input', 'textarea', 'label'].indexOf(target.tagName.toLowerCase()) != -1) return false
			target = target.parentNode
		}
		window.drag = { el: target, coords: [event.clientX, event.clientY] }
		target.style.position = 'relative'
		target.style.cursor = 'move'
		target.style.mozUserSelect = 'none'
		target.style.webkitUserSelect = 'none'
		fireEvent(target, 'mousemove')
		var self = target;
		[].slice.call(target.parentNode.children).forEach(function(el) {
		if (!el.coords) el.coords = [el.getBoundingClientRect().left - el.parentNode.getBoundingClientRect().left, el.getBoundingClientRect().top - el.parentNode.getBoundingClientRect().top]
			el.style.mozUserSelect = 'none'
			el.style.webkitUserSelect = 'none'
			if (el != self) el.style.transition = 'all 0.2s ease'
			el.style.position = 'relative'
			el.style.left = '0px'
			el.style.top = '0px'
		})
	})
	el.addEventListener('mousemove', function(event) {
		if (!window.drag) return
		window.drag.el.style.cursor = 'move'
		window.drag.el.style.left = (event.clientX - window.drag.coords[0]) + 'px'
		window.drag.el.style.top = (event.clientY - window.drag.coords[1]) + 'px'
		updateSiblings()
	})
	el.addEventListener('mouseup', function(event) {
		if (!window.drag) return
		if (!window.drag.abort) updatePosition()
		//window.drag.el.style.position = ''
		window.drag.el.style.cursor = ''
		window.drag.el.style.mozUserSelect = ''
		window.drag.el.style.webkitUserSelect = ''
		//window.drag.el.style.left = ''
		//window.drag.el.style.top = ''
		Array.prototype.slice.call(window.drag.el.parentNode.children).forEach(function(el) {
			if (el != window.drag.el) {
				el.style.position = ''
				el.style.left = ''
				el.style.top = ''
				el.style.transition = ''
			}
			el.style.mozUserSelect = ''
			el.style.webkitUserSelect = ''
			delete el.coords
		})
		delete window.drag
	})
}

function updateSiblings() {
	if (!window.drag) return
	var el = window.drag.el
	var list = el.parentNode
	var dx = el.getBoundingClientRect().left - list.getBoundingClientRect().left
	var dy = el.getBoundingClientRect().top - list.getBoundingClientRect().top
	var x = parseInt(el.style.left)
	var y = parseInt(el.style.top)

	if (x < 0) {
		var el0 = list.firstElementChild
		var w = el.clientWidth
		while (el0 && el0 != el) {
			var dx0 = el0.coords[0]
			if (dx0 >= dx) break
			if (dx0 < dx && dx <= dx0 + el0.clientWidth / 2) {
				el0.style.left = el.clientWidth + 'px'
				break
			} else {
				el0.style.left = '0px'
			}
			el0 = el0.nextElementSibling
		}
	}
	if (x > 0) {
		var el0 = list.lastElementChild
		var w = el.clientWidth
		while (el0 && el0 != el) {
			var dx0 = el0.coords[0]
			if (dx0 <= dx) break
			if (dx0 > dx && (dx + w) >= dx0 + el0.clientWidth / 2) {
				el0.style.left = -el.clientWidth + 'px'
				break
			} else {
				el0.style.left = '0px'
			}
			el0 = el0.previousElementSibling
		}
	}
	if (y < 0) {
		var el0 = list.firstElementChild
		var h = el.clientHeight
		while (el0 && el0 != el) {
			var dy0 = el0.coords[1]
			if (dy0 >= dy) break
			if (dy0 < dy && dy <= dy0 + el0.clientHeight / 2) {
				el0.style.top = el.clientHeight + 'px'
				break
			} else {
				el0.style.top = '0px'
			}
			el0 = el0.nextElementSibling
		}
	}
	if (y > 0) {
		var el0 = list.lastElementChild
		var h = el.clientHeight
		while (el0 && el0 != el) {
			var dy0 = el0.coords[1]
			if (dy0 <= dy) break
			if (dy0 > dy && (dy + h) >= dy0 + el0.clientHeight / 2) {
				el0.style.top = -el.clientHeight + 'px'
				break
			} else {
				el0.style.top = '0px'
			}
			el0 = el0.previousElementSibling
		}
	}
}

function updatePosition() {
	if (!window.drag) return
	var el = window.drag.el
	var list = el.parentNode
	var dx = el.getBoundingClientRect().left - list.getBoundingClientRect().left
	var dy = el.getBoundingClientRect().top - list.getBoundingClientRect().top
	var x = parseInt(el.style.left)
	var y = parseInt(el.style.top)

	if (x < 0) {
		var el0 = list.firstElementChild
		if (el0 && el0 != el && el0.coords[0] != el.coords[0]) {
			var w = el.clientWidth
			while (el0 && el0 != el) {
				var dx0 = el0.coords[0]
				if (dx <= dx0 + el0.clientWidth / 2) {
					list.insertBefore(el, el0)
					el.style.left = (dx - dx0) + 'px'
					break
				}
				el0 = el0.nextElementSibling
			}
		}
	}
	if (x > 0) {
		var el0 = list.lastElementChild
		if (el0 && el0 != el && el0.coords[0] != el.coords[0]) {
			var w = el.clientWidth
			while (el0 && el0 != el) {
				var dx0 = el0.coords[0]
				if ((dx + w) >= dx0 + el0.clientWidth / 2) {
					el0 = el0.nextElementSibling
					if (el0) list.insertBefore(el, el0)
					else list.appendChild(el)
					el.style.left = (dx - dx0) + 'px'
					break
				}
				el0 = el0.previousElementSibling
			}
		}
	}
	if (y < 0) {
		var el0 = list.firstElementChild
		if (el0 && el0 != el && el0.coords[1] != el.coords[1]) {
			var h = el.clientHeight
			while (el0 && el0 != el) {
				var dy0 = el0.coords[1]
				if (dy <= dy0 + el0.clientHeight / 2) {
					list.insertBefore(el, el0)
					el.style.top = (dy - dy0) + 'px'
					break
				}
				el0 = el0.nextElementSibling
			}
		}
	}
	if (y > 0) {
		var el0 = list.lastElementChild
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
					break
				}
				el0 = el0.previousElementSibling
			}
		}
	}
	if (el.style.left != '0px' || el.style.top != '0px') {
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

function fireEvent(element, type) {
	var event
	if (type == 'click' && element.click) {
		element.click()
	}
	else if (document.createEvent) {
		event = document.createEvent("HTMLEvents")
		event.initEvent(type, true, true)
		event.eventName = type
		element.dispatchEvent(event)
	} else {
		event = document.createEventObject()
		event.eventName = type
		event.eventType = type
		element.fireEvent("on" + event.eventType, event)
	}
}
