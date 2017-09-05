// YOUR CODE HERE:
class Chatterbox {
  constructor () {
    this.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
    this.rooms = {};
    this.username = window.location.search.replace('?username=', '');
    this.room = 'lobby';
    this.messages = [];
    this.friends = {};
    this.fetch();
    setInterval(() => (this.fetch()), 10000);    
  }

  render (messages) {
    this.clearMessages();
    this._renderMessages(messages);
    this._renderRooms(messages);
    this._activateSendMessage();
    this._activateRoomChange();
    this._handleUsernameClick();
    this._renderFriends();
  }

  send (data) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: data => {
        console.log('chatterbox: Message sent');
        this.fetch(this.messages);
      },
      error: data => {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  }

  fetch () {
    if (this.messages.length !== 0) {
      var lastUpdate = this.messages[0].createdAt;
      $.ajax({
        url: this.server,
        type: 'GET',
        data: {order: '-createdAt', where:{"createdAt":{"$gt":{ "__type": "Date", "iso": lastUpdate }}} },
        success: data => {
          console.log('chatterbox: Message fetched');
          this.messages = data.results.concat(this.messages);
          if (this.room !== 'lobby') {
            this._filterRoom(this.room);
          } else {
            this.render(this.messages);
          }
        },
        error (data) {
          console.error('chatterbox: Failed to fetch message', data);
        }
      });
    } else {
      $.ajax({
        url: this.server,
        type: 'GET',
        data: {order: '-createdAt'},
        success: data => {
          console.log('chatterbox: Message fetched');
          this.messages = data.results;
          this.render(this.messages);
        },
        error (data) {
          console.error('chatterbox: Failed to fetch message', data);
        }
      });
    }
  }

  clearMessages () {
    $('#chats').empty();
  }

  renderMessage (message) {
    // message.username, message.text, message.roomname
    $('#chats').append(`<div class="messages" data-roomname="${_.escape(message.roomname)}"><span class="username" data-username="${_.escape(message.username)}">${_.escape(message.username)}</span>: ${_.escape(message.text)}</div>`);
  }

  _renderMessages (messages) {
    messages.forEach(message => {
      if (_.escape(message.text).length !== 0) {
        this.renderMessage(message);
      }
    });
  }

  renderRoom (roomname) {
    //message.roomname
    $('#roomSelect').append(`<option value="${_.escape(roomname)}">${_.escape(roomname)}</option>`);
  }

  _renderRooms (messages) {
    messages.forEach(message => {
      var room = _.escape(message.roomname);
      if (this.rooms[room] === undefined && room.length !== 0) {
        this.renderRoom(room);
        this.rooms[room] = room;
      }
    });
  }

  _handleUsernameClick () {
    //handlesUsernmae Click
    $('.username').click(event => {
      var base = event.target;
      var username = $(base).data('username');
      this.friends[username] = username;
      this._renderFriends();
    });

  }

  _renderFriends() {
    for (var key in this.friends) {
      $('*[data-username="' + key + '"]').addClass('friend');
    }
  }
  _activateRoomChange () {
    $('#roomSelect').change(() => {
      if ($('select option:selected').val() === 'addRoom') {
        this.room = prompt('What room would you like to create?');
        this._filterRoom(this.room);
      } else {
        this.room = $('select option:selected').val();
        this._filterRoom(this.room);
      }
    });
  }

  _activateSendMessage () {
    $('#submit').unbind().click(event => {
      event.preventDefault();
      var message = {};
      message.username = this.username;
      message.roomname = this.room;
      message.text = $('#sendmessage').val();
      this.send(message);
    });
  }

  _filterRoom (room) {
    var currentMessages = [];

    this.messages.forEach(message => {
      if (message.roomname === room) {
        currentMessages.push(message);
      }
    });

    this.render(currentMessages);
  }
}

$(document).ready(() => new Chatterbox());
