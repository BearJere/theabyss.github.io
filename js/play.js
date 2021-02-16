(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
      // Node. Does not work with strict CommonJS, but only CommonJS-like
      // environments that support module.exports, like Node.
      module.exports = factory()
    } else {
      // Browser globals (root is window)
      root.Console = factory()
    }
  }(this, function () {
    var Console = (function () {
      var history = (localStorage.getItem('history') ? localStorage.getItem('history').split(',') : [])
      var historyIndex = history.length
      var self = {}
  
      var KEY_UP = 38
      var KEY_DOWN = 40
      var KEY_TAB = 9
  
      // Auxiliary functions
  
      var resetPrompt = function (console, prompt) {
        var newPrompt = prompt.parentNode.cloneNode(true)
  
        prompt.setAttribute('contenteditable', false)
        newPrompt.querySelector('.console-prompt').textContent = getPrompt(self.options.prompt)
        console.appendChild(newPrompt)
        newPrompt.querySelector('.console-input').innerHTML = ' '
        newPrompt.querySelector('.console-input').focus()
      }
  
      var tryCommand = function (console, cmd, args) {
        if (cmd in self.commands) {
          runCommand(console, cmd, args)
        } else {
          commandNotFound(console, cmd)
        }
      }
  
      var runCommand = function (console, cmd, args) {
        console.innerHTML += (self.commands[cmd](args))
      }
  
      var commandNotFound = function (console, cmd) {
        console.innerHTML += cmd + ': command not found'
      }
  
      var updateHistory = function (cmd) {
        history.push(cmd)
        localStorage.setItem('history', history)
        historyIndex = history.length
      }
  
      var browseHistory = function (prompt, direction) {
        var changedPrompt = false
  
        if (direction === KEY_UP && historyIndex > 0) {
          prompt.textContent = history[--historyIndex]
          changedPrompt = true
        } else if (direction === KEY_DOWN) {
          if (historyIndex < history.length) ++historyIndex
          if (historyIndex < history.length) prompt.textContent = history[historyIndex]
          else prompt.textContent = " "
          changedPrompt = true
        }
  
        if (changedPrompt) {
          var range = document.createRange()
          var sel = window.getSelection()
          range.setStart(prompt.childNodes[0], prompt.textContent.length)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
  
      var autoCompleteInput = function (input) {
        var cmds = self.commands
        var re = new RegExp("^" + input, "ig")
        var suggestions = []
        for (var cmd in cmds) {
          if (cmds.hasOwnProperty(cmd) && cmd.match(re)) {
            suggestions.push(cmd)
          }
        }
        return suggestions
      }
  
      var getPrompt = function (str, opts) {
        return str
          .replace('\\u', self.user)
          .replace('\\H', window.location.hostname)
          .replace('\\h', window.location.hostname.split('.')[0])
      }
  
      var createElements = function (opts) {
        var container = document.createElement('div')
        container.classList.add('console')
  
        var fragment = document.createDocumentFragment()
        var elem = document.createElement('div')
        elem.className = 'console-output'
        elem.setAttribute('spellcheck', false)
  
        var intro = document.createElement('div')
        intro.innerHTML = opts.intro
        elem.appendChild(intro)
  
        var line = document.createElement('p')
        var prompt = document.createElement('span')
        prompt.className = 'console-prompt'
        prompt.innerHTML = getPrompt(opts.prompt, opts)
        line.appendChild(prompt)
        var input = document.createElement('span')
        input.className = 'console-input'
        input.setAttribute('contenteditable', true)
        line.appendChild(input)
        elem.appendChild(line)
  
        fragment.appendChild(elem)
        container.appendChild(fragment)
  
        self.output = elem
        return container
      }
  
      var mountConsoleElement = function (mount, el) {
        if (mount instanceof window.HTMLElement) {
          mount.appendChild(el)
        } else if (typeof mount === 'string') {
          var existing = document.getElementById(mount)
          if (!existing) return
          existing.appendChild(el)
        }
  
        return
      }
  
      // Console functions :D
  
      self.init = function (containerId, opts) {
        self.options = opts
        self.user = opts.user || 'root'
        self.commands = opts.commands
        self.container = createElements(opts)
  
        mountConsoleElement(containerId, self.container)
  
        self.output.addEventListener('keydown', function (event) {
          if (event.keyCode === KEY_TAB) {
            var prompt = event.target
            var suggestions = autoCompleteInput(prompt.textContent.replace(/\s+/g, ''))
  
            if (suggestions.length === 1) {
              prompt.textContent = suggestions[0]
              var range = document.createRange()
              var sel = window.getSelection()
              range.setStart(prompt.childNodes[0], suggestions[0].length)
              range.collapse(true)
              sel.removeAllRanges()
              sel.addRange(range)
            }
  
            event.preventDefault(true)
            return false
          }
        })
  
        self.output.addEventListener('keyup', function (event) {
          if (historyIndex < 0) return
          browseHistory(event.target, event.keyCode)
        })
  
        self.output.addEventListener('keypress', function (event) {
          var prompt = event.target
          if (event.keyCode !== 13) return false
  
          updateHistory(prompt.textContent)
  
          var input = prompt.textContent.trim().split(' ')
          if (input[0]) tryCommand(self.output, input[0], input)
  
          resetPrompt(self.output, prompt)
          event.preventDefault()
        })
  
        /**
         * Clicking anywhere on console should put cursor on the command line
         * Do not focus on command line if action creates a text selection range
         */
        self.output.addEventListener('click', function (event) {
          // Sometimes there is more than one editable input, force it to be the last one
          // TODO: fix the bug where there is more than one contenteditable element
          var temp = self.output.querySelectorAll('.console-input[contenteditable=true]')
          var el = temp[temp.length - 1]
          var selection = window.getSelection()
          if (selection.isCollapsed === true && selection.rangeCount <= 1 && el) {
            el.focus()
          }
        }, false)
  
        self.output.querySelector('.console-input').focus()
        return self
      }
  
      self.exit = function () {
        var removeThis = self.container.parentNode.removeChild(self.container)
        removeThis = null
      }
  
      return self
    })()
  
    // Return a value to define the module export.
    return Console
  }))