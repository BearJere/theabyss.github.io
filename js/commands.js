// Commands
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
      // Node. Does not work with strict CommonJS, but only CommonJS-like
      // environments that support module.exports, like Node.
      module.exports = factory(require('./play.js'), 'node')
    } else {
      // Browser globals (root is window)
      root.initConsole = factory(root.Console, 'browser')
    }
  }(this, function (Console, mode) {
    var commands = {}
    var state = {}
  
    commands.help = function() {
      var output = "<div>" +
        "<p>Available commands:</p>" +
        "<ul>" +
        "<li><strong>help</strong> - display this help.</li>" +
        "<li><strong>echo &lt;string&gt</strong> - write arguments to the standard output</li>" +
        "<li><strong>exit</strong> - kill ABYSS</li>" +
        "</ul></div>"
      return output
    }
  
    commands.echo = function (args) {
      args.shift()
      return args.join(' ')
    }
  
    commands.exit = function (args) {
      Console.exit()
      console.log('[Process completed]')
    }
  
    function initConsole() {
      console.log('Console access granted.')
  
      Console.init(document.body, {
        commands: commands,
        prompt: '\\u@\\H $ ',
        intro: '<p>Welcome to ABYSS. Type \'help\' to get started.</p><p>&nbsp;</p>'
      })
    }
  
    // Return a value to define the module export.
    if (mode === 'node') {
      return {
        initConsole: initConsole,
        Console: Console
      }
    } else {
      return initConsole
    }
  }))