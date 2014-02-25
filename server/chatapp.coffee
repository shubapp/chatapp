HTTP          = require 'http'
Robot         = require '../robot'
Adapter       = require '../adapter'
{TextMessage} = require '../message'
IO        = require 'socket.io-client'

class Chatapp extends Adapter
  hostname = 'chat.shubapp.com'
  socket = IO.connect "http://"+hostname, {reconect: true}
  options = {
    host: hostname
    # path: '/'
    port: 80
    # method: "GET"
    headers:{
      'Content-Type':'application/json'
    }
  }

  constructor: (robot) ->
    super robot

  send: (envelope, strings...) ->
      for str in strings
        str = str.replace /<.*>/g, '<xmp class="inline">$&</xmp>'
        str = str.replace /\n/g, "<br/>"
        if ((str.indexOf 'http://')==0 || (str.indexOf 'https://')==0) 
          if /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/i.test str
            str = "<img class='hubotImage' src='".concat str,"'/>"
          else
            str = "<iframe class='hubotIframe' src='".concat str,"'/>"
        socket.emit 'chatmessage', { 
          message: str
          room: 'lobby' 
        }
      # options.path = '/message'
      # options.method = 'POST'
      # for str in strings    
      #  HTTP.request  "#{str}"
      

  emote: (envelope, strings...) ->
    @send envelope, "* #{str}" for str in strings

  reply: (envelope, strings...) ->
    strings = strings.map (s) -> "#{envelope.user.name}: #{s}"
    @send envelope, strings...

  run: ->
    self = @
  #   stdin = process.openStdin()
    stdout = process.stdout

    process.on 'uncaughtException', (err) =>
      @robot.logger.error err.stack

  #   @repl = Readline.createInterface stdin, stdout, null

    # @repl.on 'close', =>
    #   stdin.destroy()
    #   @robot.shutdown()
    #   process.exit 0

  #   @repl.on 'line', (buffer) =>
  #     @repl.close() if buffer.toLowerCase() is 'exit'
  #     @repl.prompt()
  #     user = @robot.brain.userForId '1', name: 'Shell', room: 'Shell'
  #     @receive new TextMessage user, buffer, 'messageId'
    socket.on 'chatmessage', (socket) ->
      self.receive new TextMessage "hubot", socket.message

    socket.on 'connect', (messageSocket) ->
      socket.emit('connect', {nickname:"hubot"});

    self.emit 'connected'





  #   @repl.setPrompt "#{@robot.name}> "
  #   @repl.prompt()


exports.use = (robot) ->
  new Chatapp robot